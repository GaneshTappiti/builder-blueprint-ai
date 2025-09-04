// Project Service
import { formatDisplayDate } from '@/utils/dateUtils';

import { supabase } from '@/lib/supabase';

export interface Project {
  id: string;
  name: string;
  description: string;
  stage: 'idea' | 'planning' | 'development' | 'testing' | 'launch';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  teamMembers?: string[];
  status: 'active' | 'paused' | 'completed' | 'archived';
  user_id: string;
}

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  inProgress: number;
}

class ProjectService {
  private projects: Project[] = [];
  private listeners: ((projects: Project[]) => void)[] = [];
  private readonly STORAGE_KEY = 'workspace_projects';

  constructor() {
    this.initialize();
  }

  private async initialize() {
    await this.loadFromSupabase();
  }

  private async loadFromSupabase() {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) {
        this.projects = [];
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updatedAt', { ascending: false });

      if (error) throw error;

      this.projects = data.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
        dueDate: p.dueDate ? new Date(p.dueDate) : undefined
      }));
    } catch (error) {
      console.error('Failed to load projects from Supabase:', error);
      this.projects = [];
    }
  }

  private async saveToSupabase(project: Project) {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) {
        console.warn('No user authenticated, skipping database save');
        return;
      }

      const { error } = await supabase
        .from('projects')
        .upsert({
          ...project,
          user_id: user.id,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
          dueDate: project.dueDate?.toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save project to Supabase:', error);
      throw error;
    }
  }

  // Removed mock data initialization

  // Get all projects
  getProjects(): Project[] {
    return [...this.projects].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  // Get recent projects (last 5)
  getRecentProjects(): Project[] {
    return this.getProjects().slice(0, 5);
  }

  // Get project by ID
  getProject(id: string): Project | undefined {
    return this.projects.find(p => p.id === id);
  }

  // Get projects by status
  getProjectsByStatus(status: Project['status']): Project[] {
    return this.projects.filter(p => p.status === status);
  }

  // Get project statistics
  getProjectStats(): ProjectStats {
    const total = this.projects.length;
    const active = this.projects.filter(p => p.status === 'active').length;
    const completed = this.projects.filter(p => p.status === 'completed').length;
    const inProgress = this.projects.filter(p => p.progress > 0 && p.progress < 100).length;

    return { total, active, completed, inProgress };
  }

  // Create new project
  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'user_id'>): Promise<Project> {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) {
      console.warn('No user authenticated, cannot create project');
      throw new Error('Authentication required to create projects');
    }

    const newProject: Project = {
      ...projectData,
      id: crypto.randomUUID(),
      user_id: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.saveToSupabase(newProject);
    this.projects.unshift(newProject);
    this.notifyListeners();
    return newProject;
  }

  // Update project
  async updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt' | 'user_id'>>): Promise<Project | null> {
    const projectIndex = this.projects.findIndex(p => p.id === id);
    if (projectIndex === -1) return null;

    const updatedProject = {
      ...this.projects[projectIndex],
      ...updates,
      updatedAt: new Date()
    };

    this.projects[projectIndex] = updatedProject;
    await this.saveToSupabase(updatedProject);
    this.notifyListeners();
    return updatedProject;
  }

  // Delete project
  async deleteProject(id: string): Promise<boolean> {
    const initialLength = this.projects.length;
    this.projects = this.projects.filter(p => p.id !== id);
    
    if (this.projects.length < initialLength) {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Failed to delete project from Supabase:', error);
        return false;
      }

      this.notifyListeners();
      return true;
    }
    return false;
  }

  // Archive project
  archiveProject(id: string): boolean {
    return this.updateProject(id, { status: 'archived' }) !== null;
  }

  // Get stage color
  getStageColor(stage: Project['stage']): string {
    const colors = {
      idea: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      planning: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      development: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      testing: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      launch: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return colors[stage];
  }

  // Get priority color
  getPriorityColor(priority?: Project['priority']): string {
    if (!priority) return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    
    const colors = {
      low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      high: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[priority];
  }

  // Format time ago
  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      return formatDisplayDate(date);
    }
  }

  // Subscribe to project changes
  subscribe(listener: (projects: Project[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getProjects()));
  }
}

export const projectService = new ProjectService();
