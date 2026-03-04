import { create } from 'zustand';
import { Project, ProjectStatus } from '@/lib/types';
import { projects as initialProjects } from '@/lib/data';

interface ProjectFilter {
  status: ProjectStatus | 'all';
}

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  filter: ProjectFilter;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setSelectedProject: (projectId: string | null) => void;
  toggleMilestone: (projectId: string, milestoneId: string) => void;
}

export const useProjectStore = create<ProjectState>()((set, get) => ({
  projects: [...initialProjects],
  selectedProject: null,
  filter: {
    status: 'all',
  },

  addProject: (projectData) => {
    const newProject: Project = {
      ...projectData,
      id: `project-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    set({ projects: [...get().projects, newProject] });
  },

  updateProject: (id, updates) => {
    const { projects, selectedProject } = get();
    const updatedProjects = projects.map(project =>
      project.id === id ? { ...project, ...updates } : project
    );

    set({
      projects: updatedProjects,
      selectedProject:
        selectedProject?.id === id
          ? { ...selectedProject, ...updates }
          : selectedProject,
    });
  },

  deleteProject: (id) => {
    const { projects, selectedProject } = get();
    set({
      projects: projects.filter(project => project.id !== id),
      selectedProject: selectedProject?.id === id ? null : selectedProject,
    });
  },

  setSelectedProject: (projectId) => {
    if (projectId === null) {
      set({ selectedProject: null });
      return;
    }
    const project = get().projects.find(p => p.id === projectId) || null;
    set({ selectedProject: project });
  },

  toggleMilestone: (projectId, milestoneId) => {
    const { projects, selectedProject } = get();
    const updatedProjects = projects.map(project => {
      if (project.id !== projectId) return project;
      return {
        ...project,
        milestones: project.milestones.map(milestone =>
          milestone.id === milestoneId
            ? { ...milestone, completed: !milestone.completed }
            : milestone
        ),
      };
    });

    const updatedSelected =
      selectedProject?.id === projectId
        ? updatedProjects.find(p => p.id === projectId) || null
        : selectedProject;

    set({
      projects: updatedProjects,
      selectedProject: updatedSelected,
    });
  },
}));
