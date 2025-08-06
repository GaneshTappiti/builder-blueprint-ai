// Task Service
import { formatDisplayDate } from '@/utils/dateUtils';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
  assignedTo?: string;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
}

class TaskService {
  private tasks: Task[] = [];
  private listeners: ((tasks: Task[]) => void)[] = [];
  private readonly STORAGE_KEY = 'workspace_tasks';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          this.tasks = parsed.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
            dueDate: t.dueDate ? new Date(t.dueDate) : undefined
          }));
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load tasks from storage:', error);
    }

    // Initialize with mock data if no stored data
    this.initializeWithMockData();
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks));
      }
    } catch (error) {
      console.error('Failed to save tasks to storage:', error);
    }
  }

  private initializeWithMockData() {
    // Mock tasks for demo
    this.tasks = [
      {
        id: '1',
        title: 'Design wireframes for mobile app',
        description: 'Create detailed wireframes for the main user flows',
        priority: 'high',
        status: 'in-progress',
        dueDate: new Date('2025-08-06T10:00:00Z'), // 2 days from now
        createdAt: new Date('2025-08-01T10:00:00Z'), // 3 days ago
        updatedAt: new Date('2025-08-04T08:00:00Z'), // 2 hours ago
        projectId: '1',
        tags: ['design', 'ui/ux'],
        estimatedHours: 8
      },
      {
        id: '2',
        title: 'Set up development environment',
        description: 'Configure development tools and dependencies',
        priority: 'medium',
        status: 'done',
        dueDate: new Date('2025-08-03T10:00:00Z'), // 1 day ago
        createdAt: new Date('2025-07-30T10:00:00Z'), // 5 days ago
        updatedAt: new Date('2025-08-03T10:00:00Z'), // 1 day ago
        projectId: '1',
        tags: ['development', 'setup'],
        estimatedHours: 4,
        actualHours: 3
      },
      {
        id: '3',
        title: 'Market research analysis',
        description: 'Analyze competitor landscape and market opportunities',
        priority: 'high',
        status: 'todo',
        dueDate: new Date('2025-08-11T10:00:00Z'), // 1 week from now
        createdAt: new Date('2025-08-03T10:00:00Z'), // 1 day ago
        updatedAt: new Date('2025-08-03T10:00:00Z'), // 1 day ago
        projectId: '2',
        tags: ['research', 'market'],
        estimatedHours: 12
      },
      {
        id: '4',
        title: 'Write API documentation',
        description: 'Document all API endpoints and usage examples',
        priority: 'medium',
        status: 'todo',
        dueDate: new Date('2025-08-09T10:00:00Z'), // 5 days from now
        createdAt: new Date('2025-08-03T22:00:00Z'), // 12 hours ago
        updatedAt: new Date('2025-08-03T22:00:00Z'), // 12 hours ago
        projectId: '3',
        tags: ['documentation', 'api'],
        estimatedHours: 6
      },
      {
        id: '5',
        title: 'User testing session',
        description: 'Conduct user testing with 5 participants',
        priority: 'high',
        status: 'todo',
        dueDate: new Date('2025-08-03T10:00:00Z'), // Overdue by 1 day
        createdAt: new Date('2025-07-28T10:00:00Z'), // 1 week ago
        updatedAt: new Date('2025-08-02T10:00:00Z'), // 2 days ago
        projectId: '3',
        tags: ['testing', 'user-research'],
        estimatedHours: 8
      }
    ];
  }

  // Get all tasks
  getTasks(): Task[] {
    return [...this.tasks].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  // Get recent tasks (last 5)
  getRecentTasks(): Task[] {
    return this.getTasks().slice(0, 5);
  }

  // Get task by ID
  getTask(id: string): Task | undefined {
    return this.tasks.find(t => t.id === id);
  }

  // Get tasks by status
  getTasksByStatus(status: Task['status']): Task[] {
    return this.tasks.filter(t => t.status === status);
  }

  // Get tasks by project
  getTasksByProject(projectId: string): Task[] {
    return this.tasks.filter(t => t.projectId === projectId);
  }

  // Get overdue tasks
  getOverdueTasks(): Task[] {
    const now = new Date();
    return this.tasks.filter(t => 
      t.dueDate && 
      t.dueDate < now && 
      t.status !== 'done'
    );
  }

  // Get task statistics
  getTaskStats(): TaskStats {
    const total = this.tasks.length;
    const todo = this.tasks.filter(t => t.status === 'todo').length;
    const inProgress = this.tasks.filter(t => t.status === 'in-progress').length;
    const done = this.tasks.filter(t => t.status === 'done').length;
    const overdue = this.getOverdueTasks().length;

    return { total, todo, inProgress, done, overdue };
  }

  // Create new task
  createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tasks.unshift(newTask);
    this.saveToStorage();
    this.notifyListeners();
    return newTask;
  }

  // Update task
  updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Task | null {
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return null;

    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      ...updates,
      updatedAt: new Date()
    };

    this.saveToStorage();
    this.notifyListeners();
    return this.tasks[taskIndex];
  }

  // Delete task
  deleteTask(id: string): boolean {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(t => t.id !== id);
    
    if (this.tasks.length < initialLength) {
      this.saveToStorage();
      this.notifyListeners();
      return true;
    }
    return false;
  }

  // Get priority color
  getPriorityColor(priority: Task['priority']): string {
    const colors = {
      low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      high: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[priority];
  }

  // Get status color
  getStatusColor(status: Task['status']): string {
    const colors = {
      todo: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'in-progress': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      done: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return colors[status];
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

  // Format due date
  formatDueDate(date: Date): { text: string; isOverdue: boolean; isToday: boolean; isTomorrow: boolean } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const isOverdue = taskDate < today;
    const isToday = taskDate.getTime() === today.getTime();
    const isTomorrow = taskDate.getTime() === tomorrow.getTime();

    let text = '';
    if (isOverdue) {
      const daysDiff = Math.floor((today.getTime() - taskDate.getTime()) / (24 * 60 * 60 * 1000));
      text = `Overdue by ${daysDiff} day${daysDiff !== 1 ? 's' : ''}`;
    } else if (isToday) {
      text = 'Due today';
    } else if (isTomorrow) {
      text = 'Due tomorrow';
    } else {
      text = `Due ${formatDisplayDate(date)}`;
    }

    return { text, isOverdue, isToday, isTomorrow };
  }

  // Subscribe to task changes
  subscribe(listener: (tasks: Task[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getTasks()));
  }
}

export const taskService = new TaskService();
