'use client';

import { useState, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Calendar,
  MessageSquare,
  GripVertical,
  Loader2,
} from 'lucide-react';

import { DashboardLayout } from '@/components/dashboard-layout';
import { useTaskStore } from '@/store/task-store';
import { users, projects } from '@/lib/data';
import type { Task, TaskStatus, TaskPriority } from '@/lib/types';
import { cn, formatDate, getInitials } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLUMNS: { id: TaskStatus; title: string; color: string; accent: string }[] = [
  {
    id: 'todo',
    title: 'To Do',
    color: 'bg-blue-500',
    accent: 'border-t-blue-500',
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    color: 'bg-yellow-500',
    accent: 'border-t-yellow-500',
  },
  {
    id: 'in-review',
    title: 'In Review',
    color: 'bg-purple-500',
    accent: 'border-t-purple-500',
  },
  {
    id: 'done',
    title: 'Done',
    color: 'bg-green-500',
    accent: 'border-t-green-500',
  },
];

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
};

// ---------------------------------------------------------------------------
// Zod schema for Create / Edit Task form
// ---------------------------------------------------------------------------

const taskFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'in-review', 'done'] as const),
  priority: z.enum(['low', 'medium', 'high', 'urgent'] as const),
  assigneeId: z.string().min(1, 'Assignee is required'),
  projectId: z.string().min(1, 'Project is required'),
  dueDate: z.string().optional(),
  tags: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

// ---------------------------------------------------------------------------
// Helper – find which column a task id lives in
// ---------------------------------------------------------------------------

function findColumnForTask(
  taskId: UniqueIdentifier,
  columnTaskIds: Record<TaskStatus, string[]>,
): TaskStatus | null {
  for (const [status, ids] of Object.entries(columnTaskIds)) {
    if (ids.includes(String(taskId))) {
      return status as TaskStatus;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Sortable Task Card
// ---------------------------------------------------------------------------

interface SortableTaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

function SortableTaskCard({ task, onClick }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TaskCard
        task={task}
        onClick={onClick}
        dragHandleProps={listeners}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task Card (used both inline and as DragOverlay content)
// ---------------------------------------------------------------------------

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  dragHandleProps?: Record<string, unknown>;
  isOverlay?: boolean;
}

function TaskCard({ task, onClick, dragHandleProps, isOverlay }: TaskCardProps) {
  const assignee = users.find((u) => u.id === task.assigneeId);

  return (
    <motion.div
      layout
      layoutId={isOverlay ? undefined : task.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group cursor-pointer rounded-lg border bg-card p-3.5 shadow-sm transition-shadow hover:shadow-md',
        isOverlay && 'rotate-[2deg] shadow-xl ring-2 ring-primary/20',
      )}
      onClick={() => onClick(task)}
    >
      {/* Grab handle + Title */}
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 shrink-0 cursor-grab touch-none text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
          {...(dragHandleProps ?? {})}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <h4 className="flex-1 text-sm font-semibold leading-snug">{task.title}</h4>
      </div>

      {/* Description */}
      {task.description && (
        <p className="mt-1.5 line-clamp-2 pl-6 text-xs text-muted-foreground">
          {task.description}
        </p>
      )}

      {/* Priority + Tags */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pl-6">
        <Badge
          variant="secondary"
          className={cn('text-[10px] capitalize', PRIORITY_COLORS[task.priority])}
        >
          {task.priority}
        </Badge>
        {task.tags.slice(0, 3).map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="text-[10px] font-normal"
          >
            {tag}
          </Badge>
        ))}
        {task.tags.length > 3 && (
          <span className="text-[10px] text-muted-foreground">
            +{task.tags.length - 3}
          </span>
        )}
      </div>

      {/* Footer: Assignee, Due date, Comments */}
      <div className="mt-3 flex items-center justify-between pl-6">
        <div className="flex items-center gap-1.5">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[9px]">
              {assignee ? getInitials(assignee.name) : '?'}
            </AvatarFallback>
          </Avatar>
          <span className="text-[11px] text-muted-foreground">
            {assignee?.name ?? 'Unassigned'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          {task.dueDate && (
            <span className="flex items-center gap-1 text-[11px]">
              <Calendar className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </span>
          )}
          {task.comments.length > 0 && (
            <span className="flex items-center gap-1 text-[11px]">
              <MessageSquare className="h-3 w-3" />
              {task.comments.length}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Kanban Column
// ---------------------------------------------------------------------------

interface KanbanColumnProps {
  column: (typeof COLUMNS)[number];
  tasks: Task[];
  taskIds: string[];
  onTaskClick: (task: Task) => void;
}

function KanbanColumn({ column, tasks, taskIds, onTaskClick }: KanbanColumnProps) {
  const {
    setNodeRef,
    isOver,
  } = useSortable({
    id: column.id,
    data: { type: 'column', status: column.id },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex h-full min-w-[300px] flex-col rounded-xl border-t-4 bg-muted/40 dark:bg-muted/20',
        column.accent,
        isOver && 'ring-2 ring-primary/30',
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={cn('h-2.5 w-2.5 rounded-full', column.color)} />
          <h3 className="text-sm font-semibold">{column.title}</h3>
        </div>
        <Badge variant="secondary" className="text-xs tabular-nums">
          {tasks.length}
        </Badge>
      </div>

      {/* Cards */}
      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-3 pb-3">
        <SortableContext
          id={column.id}
          items={taskIds}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence mode="popLayout">
            {tasks.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 px-4 py-10 text-center"
              >
                <p className="text-xs text-muted-foreground">
                  No tasks here yet
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground/60">
                  Drag a task here or create a new one
                </p>
              </motion.div>
            ) : (
              tasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  onClick={onTaskClick}
                />
              ))
            )}
          </AnimatePresence>
        </SortableContext>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create / Edit Task Dialog
// ---------------------------------------------------------------------------

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null; // null = creating new
}

function TaskDialog({ open, onOpenChange, task }: TaskDialogProps) {
  const { addTask, updateTask, deleteTask } = useTaskStore();
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = task !== null;

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assigneeId: users[0]?.id ?? '',
      projectId: projects[0]?.id ?? '',
      dueDate: '',
      tags: '',
    },
  });

  // Reset form when task changes or dialog opens
  // Using key-based approach: the Dialog re-renders with new defaults
  // We use useEffect-like reset via the open/task dependency
  const resetToTask = useCallback(
    (t: Task | null) => {
      if (t) {
        form.reset({
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          assigneeId: t.assigneeId,
          projectId: t.projectId,
          dueDate: t.dueDate ? t.dueDate.split('T')[0] : '',
          tags: t.tags.join(', '),
        });
      } else {
        form.reset({
          title: '',
          description: '',
          status: 'todo',
          priority: 'medium',
          assigneeId: users[0]?.id ?? '',
          projectId: projects[0]?.id ?? '',
          dueDate: '',
          tags: '',
        });
      }
    },
    [form],
  );

  // Reset form whenever the dialog opens / the task prop changes
  // We intentionally call this on render when `open` toggles to true
  const prevOpenRef = useState({ open: false, taskId: '' })[0];
  if (open && (!prevOpenRef.open || prevOpenRef.taskId !== (task?.id ?? ''))) {
    prevOpenRef.open = true;
    prevOpenRef.taskId = task?.id ?? '';
    resetToTask(task);
  }
  if (!open && prevOpenRef.open) {
    prevOpenRef.open = false;
    prevOpenRef.taskId = '';
  }

  async function onSubmit(data: TaskFormValues) {
    setIsLoading(true);
    // Simulate brief network delay
    await new Promise((r) => setTimeout(r, 400));

    const parsedTags = (data.tags ?? '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (isEditing && task) {
      updateTask(task.id, {
        title: data.title,
        description: data.description ?? '',
        status: data.status,
        priority: data.priority,
        assigneeId: data.assigneeId,
        projectId: data.projectId,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : '',
        tags: parsedTags,
      });
    } else {
      addTask({
        title: data.title,
        description: data.description ?? '',
        status: data.status,
        priority: data.priority,
        assigneeId: data.assigneeId,
        projectId: data.projectId,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : '',
        tags: parsedTags,
      });
    }

    setIsLoading(false);
    onOpenChange(false);
  }

  function handleDelete() {
    if (task) {
      deleteTask(task.id);
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the task details below.'
              : 'Fill in the details to create a new task.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the task..."
                      rows={3}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status + Priority row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="in-review">In Review</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Assignee + Project row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Due Date */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Comma-separated (e.g. design, frontend)"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 pt-2">
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="mr-auto"
                >
                  Delete
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isEditing ? (
                  'Save Changes'
                ) : (
                  'Create Task'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function TasksPage() {
  const {
    tasks,
    filter,
    searchQuery,
    moveTask,
    reorderTasks,
    setFilter,
    setSearchQuery,
  } = useTaskStore();

  // Local state for assignee filter (not part of task store filter type)
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // DnD state
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  // Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  );

  // -----------------------------------------------------------------------
  // Filtering
  // -----------------------------------------------------------------------

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      );
    }

    // Priority filter
    if (filter.priority !== 'all') {
      result = result.filter((t) => t.priority === filter.priority);
    }

    // Assignee filter
    if (assigneeFilter !== 'all') {
      result = result.filter((t) => t.assigneeId === assigneeFilter);
    }

    return result;
  }, [tasks, searchQuery, filter.priority, assigneeFilter]);

  // Group filtered tasks by column, sorted by order
  const columnTasks = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      'todo': [],
      'in-progress': [],
      'in-review': [],
      'done': [],
    };
    for (const task of filteredTasks) {
      map[task.status].push(task);
    }
    // Sort each column by order
    for (const status of Object.keys(map) as TaskStatus[]) {
      map[status].sort((a, b) => a.order - b.order);
    }
    return map;
  }, [filteredTasks]);

  // Build id lists per column for SortableContext
  const columnTaskIds = useMemo(() => {
    const map: Record<TaskStatus, string[]> = {
      'todo': [],
      'in-progress': [],
      'in-review': [],
      'done': [],
    };
    for (const status of Object.keys(columnTasks) as TaskStatus[]) {
      map[status] = columnTasks[status].map((t) => t.id);
    }
    return map;
  }, [columnTasks]);

  // Active task for DragOverlay
  const activeTask = useMemo(() => {
    if (!activeId) return null;
    return tasks.find((t) => t.id === activeId) ?? null;
  }, [activeId, tasks]);

  // -----------------------------------------------------------------------
  // DnD Handlers
  // -----------------------------------------------------------------------

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeIdStr = String(active.id);
      const overIdStr = String(over.id);

      // Find which columns active and over belong to
      const activeColumn = findColumnForTask(activeIdStr, columnTaskIds);

      // Determine the target column:
      // If hovering over a column id directly, use that
      // Otherwise find the column of the over task
      let overColumn: TaskStatus | null = null;
      if (COLUMNS.some((c) => c.id === overIdStr)) {
        overColumn = overIdStr as TaskStatus;
      } else {
        overColumn = findColumnForTask(overIdStr, columnTaskIds);
      }

      if (!activeColumn || !overColumn || activeColumn === overColumn) return;

      // Move task to new column (at the end)
      moveTask(activeIdStr, overColumn);
    },
    [columnTaskIds, moveTask],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const activeIdStr = String(active.id);
      const overIdStr = String(over.id);

      if (activeIdStr === overIdStr) return;

      // Find the column of the active task (after any onDragOver moves)
      // Re-read from the store so we get the latest state
      const currentTasks = useTaskStore.getState().tasks;
      const activeTaskCurrent = currentTasks.find((t) => t.id === activeIdStr);
      if (!activeTaskCurrent) return;

      const targetStatus = activeTaskCurrent.status;

      // Determine the new index
      // If dropping on a column, place at end
      if (COLUMNS.some((c) => c.id === overIdStr)) {
        const tasksInColumn = currentTasks
          .filter((t) => t.status === targetStatus && t.id !== activeIdStr)
          .sort((a, b) => a.order - b.order);
        reorderTasks(activeIdStr, tasksInColumn.length, targetStatus);
        return;
      }

      // Dropping onto another task in the same column
      const overTask = currentTasks.find((t) => t.id === overIdStr);
      if (!overTask) return;

      if (overTask.status === targetStatus) {
        // Reorder within the same column
        const tasksInColumn = currentTasks
          .filter((t) => t.status === targetStatus)
          .sort((a, b) => a.order - b.order);

        const oldIndex = tasksInColumn.findIndex((t) => t.id === activeIdStr);
        const newIndex = tasksInColumn.findIndex((t) => t.id === overIdStr);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          reorderTasks(activeIdStr, newIndex, targetStatus);
        }
      } else {
        // Cross-column drop – move then reorder
        moveTask(activeIdStr, overTask.status);
        const updatedTasks = useTaskStore.getState().tasks;
        const tasksInNewColumn = updatedTasks
          .filter((t) => t.status === overTask.status)
          .sort((a, b) => a.order - b.order);
        const overIndex = tasksInNewColumn.findIndex((t) => t.id === overIdStr);
        if (overIndex !== -1) {
          reorderTasks(activeIdStr, overIndex, overTask.status);
        }
      }
    },
    [moveTask, reorderTasks],
  );

  // -----------------------------------------------------------------------
  // Dialog helpers
  // -----------------------------------------------------------------------

  function openCreateDialog() {
    setEditingTask(null);
    setDialogOpen(true);
  }

  function openEditDialog(task: Task) {
    setEditingTask(task);
    setDialogOpen(true);
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Task Management</h1>
            <p className="text-sm text-muted-foreground">
              Organize and track your team&apos;s work with the Kanban board.
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-2">
            <Label className="shrink-0 text-sm text-muted-foreground">Priority:</Label>
            <Select
              value={filter.priority}
              onValueChange={(value) =>
                setFilter({ priority: value as TaskPriority | 'all' })
              }
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignee filter */}
          <div className="flex items-center gap-2">
            <Label className="shrink-0 text-sm text-muted-foreground">Assignee:</Label>
            <Select
              value={assigneeFilter}
              onValueChange={setAssigneeFilter}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid flex-1 auto-cols-fr grid-flow-col gap-4 overflow-x-auto pb-4 max-sm:grid-flow-row max-sm:grid-cols-1">
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={columnTasks[column.id]}
                taskIds={columnTaskIds[column.id]}
                onTaskClick={openEditDialog}
              />
            ))}
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                onClick={() => {}}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Create / Edit Dialog */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
      />
    </DashboardLayout>
  );
}
