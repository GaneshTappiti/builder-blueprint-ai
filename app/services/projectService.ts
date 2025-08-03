// Project Service
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
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          this.projects = parsed.map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
            dueDate: p.dueDate ? new Date(p.dueDate) : undefined
          }));
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load projects from storage:', error);
    }

    // Initialize with mock data if no stored data
    this.initializeWithMockData();
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.projects));
      }
    } catch (error) {
      console.error('Failed to save projects to storage:', error);
    }
  }

  private initializeWithMockData() {
    // Mock projects for demo
    this.projects = [
      {
        id: '1',
        name: 'AI-Powered Fitness App',
        description: 'A personalized fitness app that uses AI to create custom workout plans based on user preferences and progress.',
        stage: 'development',
        progress: 65,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        tags: ['AI', 'Fitness', 'Mobile App'],
        priority: 'high',
        status: 'active',
        teamMembers: ['user1', 'user2']
      },
      {
        id: '2',
        name: 'E-commerce Platform',
        description: 'A modern e-commerce platform with advanced analytics and inventory management.',
        stage: 'planning',
        progress: 30,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        tags: ['E-commerce', 'Web App', 'Analytics'],
        priority: 'medium',
        status: 'active',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days from now
      },
      {
        id: '3',
        name: 'Task Management Tool',
        description: 'A collaborative task management tool for remote teams with real-time updates.',
        stage: 'testing',
        progress: 85,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 2 weeks ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        tags: ['Productivity', 'Collaboration', 'SaaS'],
        priority: 'high',
        status: 'active'
      },
      {
        id: '4',
        name: 'Social Media Dashboard',
        description: 'Analytics dashboard for social media managers to track performance across platforms.',
        stage: 'launch',
        progress: 95,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21), // 3 weeks ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        tags: ['Analytics', 'Social Media', 'Dashboard'],
        priority: 'medium',
        status: 'completed'
      }
    ];
  }

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
  createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.projects.unshift(newProject);
    this.saveToStorage();
    this.notifyListeners();
    return newProject;
  }

  // Update project
  updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Project | null {
    const projectIndex = this.projects.findIndex(p => p.id === id);
    if (projectIndex === -1) return null;

    this.projects[projectIndex] = {
      ...this.projects[projectIndex],
      ...updates,
      updatedAt: new Date()
    };

    this.saveToStorage();
    this.notifyListeners();
    return this.projects[projectIndex];
  }

  // Delete project
  deleteProject(id: string): boolean {
    const initialLength = this.projects.length;
    this.projects = this.projects.filter(p => p.id !== id);
    
    if (this.projects.length < initialLength) {
      this.saveToStorage();
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
      return date.toLocaleDateString();
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
