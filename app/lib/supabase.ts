import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { validateEnvironment, logEnvironmentStatus } from './env-validation';

// Database interfaces
interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  project_id?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Validate environment variables (only on client side to avoid SSR issues)
let envConfig: any = { isSupabaseConfigured: false };
if (typeof window !== 'undefined') {
  envConfig = validateEnvironment();
  logEnvironmentStatus();
} else {
  // Server-side fallback
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  envConfig = {
    supabaseUrl,
    supabaseAnonKey,
    isSupabaseConfigured: !!(supabaseUrl && supabaseAnonKey && 
      supabaseUrl !== 'https://placeholder.supabase.co' && 
      supabaseAnonKey !== 'placeholder-key')
  };
}

// Create Supabase client for client-side operations
export const supabase = envConfig.isSupabaseConfigured
  ? createBrowserClient(envConfig.supabaseUrl!, envConfig.supabaseAnonKey!)
  : createBrowserClient('https://placeholder.supabase.co', 'placeholder-key');

// Create Supabase client for server-side operations
export const createServerClient = () => {
  if (!envConfig.isSupabaseConfigured) {
    throw new Error('Supabase environment variables are not configured');
  }
  return createClient(envConfig.supabaseUrl!, envConfig.supabaseAnonKey!);
};

// Helper to check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return envConfig.isSupabaseConfigured;
};

// Database helpers
export const supabaseHelpers = {
  // Projects
  async getProjects(userId: string) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'>, userId: string) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }
    
    const { data, error } = await supabase
      .from('projects')
      .insert([{ ...project, user_id: userId }])
      .select()
      .single();
    
    return { data, error };
  },

  async updateProject(id: string, updates: Partial<Project>, userId: string) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }
    
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    return { data, error };
  },

  async deleteProject(id: string, userId: string) {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase not configured') };
    }
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    return { error };
  },

  // Tasks
  async getTasks(userId: string, projectId?: string) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }
    
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query;
    return { data, error };
  },

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>, userId: string) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...task, user_id: userId }])
      .select()
      .single();
    
    return { data, error };
  },

  async updateTask(id: string, updates: Partial<Task>, userId: string) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    return { data, error };
  },

  async deleteTask(id: string, userId: string) {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase not configured') };
    }
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    return { error };
  },

  // Ideas
  async getIdeas(userId: string) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }
    
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  async createIdea(idea: Omit<Idea, 'id' | 'created_at' | 'updated_at' | 'user_id'>, userId: string) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }
    
    const { data, error } = await supabase
      .from('ideas')
      .insert([{ ...idea, user_id: userId }])
      .select()
      .single();
    
    return { data, error };
  },

  async updateIdea(id: string, updates: Partial<Idea>, userId: string) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }
    
    const { data, error } = await supabase
      .from('ideas')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    return { data, error };
  },

  async deleteIdea(id: string, userId: string) {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase not configured') };
    }
    
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    return { error };
  },

  // Real-time subscriptions
  subscribeToProjects(userId: string, callback: (payload: any) => void) {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, subscription will not work');
      return { unsubscribe: () => {} };
    }
    
    return supabase
      .channel('projects')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'projects',
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe();
  },

  subscribeToTasks(userId: string, callback: (payload: any) => void) {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, subscription will not work');
      return { unsubscribe: () => {} };
    }
    
    return supabase
      .channel('tasks')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe();
  },

  subscribeToIdeas(userId: string, callback: (payload: any) => void) {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, subscription will not work');
      return { unsubscribe: () => {} };
    }
    
    return supabase
      .channel('ideas')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'ideas',
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe();
  }
};
