import { create } from 'zustand';
import { Task, TaskStatus, TaskPriority } from '@/lib/types';
import { tasks as initialTasks } from '@/lib/data';

interface TaskFilter {
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  assignee: string | 'all';
}

interface TaskState {
  tasks: Task[];
  filter: TaskFilter;
  searchQuery: string;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'order'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  reorderTasks: (taskId: string, newOrder: number, status: TaskStatus) => void;
  setFilter: (filter: Partial<TaskFilter>) => void;
  setSearchQuery: (query: string) => void;
}

export const useTaskStore = create<TaskState>()((set, get) => ({
  tasks: [...initialTasks],
  filter: {
    status: 'all',
    priority: 'all',
    assignee: 'all',
  },
  searchQuery: '',

  addTask: (taskData) => {
    const { tasks } = get();
    const tasksInStatus = tasks.filter(t => t.status === taskData.status);
    const maxOrder = tasksInStatus.length > 0
      ? Math.max(...tasksInStatus.map(t => t.order))
      : -1;

    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      order: maxOrder + 1,
    };

    set({ tasks: [...tasks, newTask] });
  },

  updateTask: (id, updates) => {
    set({
      tasks: get().tasks.map(task =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      ),
    });
  },

  deleteTask: (id) => {
    set({ tasks: get().tasks.filter(task => task.id !== id) });
  },

  moveTask: (taskId, newStatus) => {
    const { tasks } = get();
    const tasksInNewStatus = tasks.filter(t => t.status === newStatus);
    const maxOrder = tasksInNewStatus.length > 0
      ? Math.max(...tasksInNewStatus.map(t => t.order))
      : -1;

    set({
      tasks: tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
              order: maxOrder + 1,
              updatedAt: new Date().toISOString(),
            }
          : task
      ),
    });
  },

  reorderTasks: (taskId, newOrder, status) => {
    const { tasks } = get();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const otherTasks = tasks.filter(t => t.id !== taskId);
    const tasksInColumn = otherTasks
      .filter(t => t.status === status)
      .sort((a, b) => a.order - b.order);

    // Insert the task at the new position
    tasksInColumn.splice(newOrder, 0, {
      ...task,
      status,
      updatedAt: new Date().toISOString(),
    });

    // Reassign order values
    const reorderedColumnTasks = tasksInColumn.map((t, index) => ({
      ...t,
      order: index,
    }));

    // Merge back with tasks from other columns
    const tasksOutsideColumn = otherTasks.filter(t => t.status !== status);
    set({ tasks: [...tasksOutsideColumn, ...reorderedColumnTasks] });
  },

  setFilter: (filterUpdate) => {
    set({ filter: { ...get().filter, ...filterUpdate } });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
}));
