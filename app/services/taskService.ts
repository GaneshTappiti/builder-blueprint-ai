// Task Service
import { formatDisplayDate } from '@/utils/dateUtils';

import { supabase } from '@/lib/supabase';

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
  user_id: string;
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
    this.initialize();
  }

  private async initialize() {
    await this.loadFromSupabase();
  }

  private async loadFromSupabase() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        this.tasks = [];
        return;
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('updatedAt', { ascending: false });

      if (error) throw error;

      this.tasks = data.map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
        dueDate: t.dueDate ? new Date(t.dueDate) : undefined
      }));
    } catch (error) {
      console.error('Failed to load tasks from Supabase:', error);
      // Add some sample data for testing when database is not available
      this.tasks = [
        {
          id: 'sample-task-1',
          title: 'Sample Task 1',
          description: 'A sample task to demonstrate the interface',
          status: 'todo' as const,
          priority: 'high' as const,
          user_id: 'sample-user',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
    }
  }

  private async saveToSupabase(task: Task) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No user authenticated, skipping database save');
        return;
      }

      const { error } = await supabase
        .from('tasks')
        .upsert({
          ...task,
          user_id: user.id,
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString(),
          dueDate: task.dueDate?.toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save task to Supabase:', error);
      throw error;
    }
  }

  // Removed mock data initialization

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
  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'user_id'>): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('No user authenticated, cannot create task');
      throw new Error('Authentication required to create tasks');
    }

    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      user_id: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.saveToSupabase(newTask);
    this.tasks.unshift(newTask);
    this.notifyListeners();
    return newTask;
  }

  // Update task
  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'user_id'>>): Promise<Task | null> {
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return null;

    const updatedTask = {
      ...this.tasks[taskIndex],
      ...updates,
      updatedAt: new Date()
    };

    this.tasks[taskIndex] = updatedTask;
    await this.saveToSupabase(updatedTask);
    this.notifyListeners();
    return updatedTask;
  }

  // Delete task
  async deleteTask(id: string): Promise<boolean> {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(t => t.id !== id);
    
    if (this.tasks.length < initialLength) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Failed to delete task from Supabase:', error);
        return false;
      }

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
