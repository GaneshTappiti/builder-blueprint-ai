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
  // Privacy and team settings
  isPrivate: boolean;
  teamId?: string;
  visibility: 'private' | 'team';
  // Team collaboration features
  teamComments?: Array<{
    id: string;
    userId: string;
    userName: string;
    content: string;
    created_at: string;
    updated_at: string;
  }>;
  teamSuggestions?: Array<{
    id: string;
    userId: string;
    userName: string;
    field: string;
    originalValue: string;
    suggestedValue: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    updated_at: string;
  }>;
  teamStatus?: 'under_review' | 'in_progress' | 'approved' | 'rejected';
  lastModifiedBy?: string;
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

  // Ideas - Get both private and team ideas
  async getIdeas(userId?: string) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }
    
    try {
      // Get private ideas for the user and all team ideas
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .or(`user_id.eq.${userId},is_private.eq.false`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching ideas:', error);
        return { data: null, error };
      }
      
      // Transform database fields to match frontend interface
      const transformedData = data?.map(idea => ({
        ...idea,
        isPrivate: idea.is_private,
        teamId: idea.team_id,
        teamComments: idea.team_comments || [],
        teamSuggestions: idea.team_suggestions || [],
        teamStatus: idea.team_status,
        lastModifiedBy: idea.last_modified_by
      })) || [];
      
      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Unexpected error fetching ideas:', error);
      return { data: null, error: error as Error };
    }
  },

  // Get only private ideas for a user
  async getPrivateIdeas(userId: string) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }
    
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('user_id', userId)
        .eq('is_private', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        return { data: null, error };
      }
      
      const transformedData = data?.map(idea => ({
        ...idea,
        isPrivate: idea.is_private,
        teamId: idea.team_id,
        teamComments: idea.team_comments || [],
        teamSuggestions: idea.team_suggestions || [],
        teamStatus: idea.team_status,
        lastModifiedBy: idea.last_modified_by
      })) || [];
      
      return { data: transformedData, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Get only team ideas
  async getTeamIdeas() {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }
    
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('is_private', false)
        .order('created_at', { ascending: false });
      
      if (error) {
        return { data: null, error };
      }
      
      const transformedData = data?.map(idea => ({
        ...idea,
        isPrivate: idea.is_private,
        teamId: idea.team_id,
        teamComments: idea.team_comments || [],
        teamSuggestions: idea.team_suggestions || [],
        teamStatus: idea.team_status,
        lastModifiedBy: idea.last_modified_by
      })) || [];
      
      return { data: transformedData, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async createIdea(idea: Omit<Idea, 'id' | 'created_at' | 'updated_at' | 'user_id'>, userId: string) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }

    try {
      // Transform frontend interface to database fields
      const dbIdea = {
        title: idea.title,
        description: idea.description,
        category: idea.category,
        status: idea.status,
        tags: idea.tags,
        votes: idea.votes || 0,
        comments: idea.comments || 0,
        validation_score: idea.validation_score,
        market_opportunity: idea.market_opportunity,
        risk_assessment: idea.risk_assessment,
        monetization_strategy: idea.monetization_strategy,
        key_features: idea.key_features || [],
        next_steps: idea.next_steps || [],
        competitor_analysis: idea.competitor_analysis,
        target_market: idea.target_market,
        problem_statement: idea.problem_statement,
        is_private: idea.isPrivate,
        team_id: idea.teamId,
        visibility: idea.visibility,
        team_comments: idea.teamComments || [],
        team_suggestions: idea.teamSuggestions || [],
        team_status: idea.teamStatus,
        last_modified_by: idea.lastModifiedBy,
        user_id: userId
      };

      const { data, error } = await supabase
        .from('ideas')
        .insert([dbIdea])
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      // Transform back to frontend interface
      const transformedData = {
        ...data,
        isPrivate: data.is_private,
        teamId: data.team_id,
        teamComments: data.team_comments || [],
        teamSuggestions: data.team_suggestions || [],
        teamStatus: data.team_status,
        lastModifiedBy: data.last_modified_by
      };

      return { data: transformedData, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
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

  // Team collaboration methods
  async toggleIdeaPrivacy(ideaId: string, userId: string) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }

    // First get the current idea to check ownership
    const { data: currentIdea, error: fetchError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', ideaId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !currentIdea) {
      return { data: null, error: new Error('Idea not found or access denied') };
    }

    // Toggle privacy
    const { data, error } = await supabase
      .from('ideas')
      .update({ 
        isPrivate: !currentIdea.isPrivate,
        visibility: currentIdea.isPrivate ? 'team' : 'private',
        updated_at: new Date().toISOString()
      })
      .eq('id', ideaId)
      .eq('user_id', userId)
      .select()
      .single();

    return { data, error };
  },

  async addTeamComment(ideaId: string, userId: string, userName: string, content: string) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }

    // Get current idea to add comment
    const { data: idea, error: fetchError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', ideaId)
      .eq('isPrivate', false)
      .single();

    if (fetchError || !idea) {
      return { data: null, error: new Error('Team idea not found') };
    }

    const newComment = {
      id: Date.now().toString(),
      userId,
      userName,
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedComments = [...(idea.teamComments || []), newComment];

    const { data, error } = await supabase
      .from('ideas')
      .update({
        teamComments: updatedComments,
        comments: (idea.comments || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', ideaId)
      .select()
      .single();

    return { data, error };
  },

  async updateTeamStatus(ideaId: string, status: 'under_review' | 'in_progress' | 'approved' | 'rejected', userId: string) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }

    const { data, error } = await supabase
      .from('ideas')
      .update({
        teamStatus: status,
        lastModifiedBy: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', ideaId)
      .eq('isPrivate', false)
      .select()
      .single();

    return { data, error };
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
