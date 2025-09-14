// Real Supabase Helpers - Replaces localStorage-based helpers
// This file provides actual Supabase operations instead of localStorage fallbacks

import { supabase, getCurrentUser } from './supabase';

// =====================================================
// IDEA VAULT HELPERS
// =====================================================

export const ideaHelpers = {
  async getIdeas() {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return { data: [], error: null };
      }

      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error getting ideas:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Failed to get ideas' };
    }
  },

  async createIdea(idea: any) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newIdea = {
        user_id: user.id,
        title: idea.title,
        description: idea.description,
        content: idea.content || idea.description,
        category: idea.category || 'general',
        tags: idea.tags || [],
        status: idea.status || 'draft',
        is_public: idea.is_public || false,
        team_suggestions: idea.team_suggestions || [],
        collaboration_data: idea.collaboration_data || {},
        metadata: idea.metadata || {},
        last_modified: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('ideas')
        .insert([newIdea])
        .select()
        .single();

      if (error) throw error;
      return { data: [data], error: null };
    } catch (error) {
      console.error('Error creating idea:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create idea' };
    }
  },

  async updateIdea(id: string, updates: any) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('ideas')
        .update({
          ...updates,
          last_modified: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating idea:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update idea' };
    }
  },

  async deleteIdea(id: string) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return { data: { id }, error: null };
    } catch (error) {
      console.error('Error deleting idea:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to delete idea' };
    }
  }
};

// =====================================================
// MVP STUDIO PROJECTS HELPERS
// =====================================================

export const mvpStudioHelpers = {
  async getProjects() {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return { data: [], error: null };
      }

      const { data, error } = await supabase
        .from('mvp_studio_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error getting projects:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Failed to get projects' };
    }
  },

  async createProject(project: any) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newProject = {
        user_id: user.id,
        project_data: project,
        title: project.title || 'Untitled Project',
        description: project.description || '',
        status: project.status || 'draft',
        is_public: project.is_public || false,
        team_id: project.team_id || null,
        last_modified: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('mvp_studio_projects')
        .insert([newProject])
        .select()
        .single();

      if (error) throw error;
      return { data: [data], error: null };
    } catch (error) {
      console.error('Error creating project:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create project' };
    }
  },

  async updateProject(id: string, updates: any) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('mvp_studio_projects')
        .update({
          ...updates,
          last_modified: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating project:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update project' };
    }
  },

  async deleteProject(id: string) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('mvp_studio_projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return { data: { id }, error: null };
    } catch (error) {
      console.error('Error deleting project:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to delete project' };
    }
  }
};

// =====================================================
// BUILDER CONTEXT HELPERS
// =====================================================

export const builderContextHelpers = {
  async getContext() {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return { data: [], error: null };
      }

      const { data, error } = await supabase
        .from('builder_context')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error getting builder context:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Failed to get builder context' };
    }
  },

  async saveContext(contextData: any, projectId?: string) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('builder_context')
        .upsert({
          user_id: user.id,
          project_id: projectId,
          context_data: contextData,
          context_type: 'blueprint',
          last_modified: new Date().toISOString()
        }, { onConflict: 'user_id,project_id' })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error saving builder context:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to save builder context' };
    }
  }
};

// =====================================================
// NOTIFICATION PREFERENCES HELPERS
// =====================================================

export const notificationHelpers = {
  async getPreferences() {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return { data: null, error: null };
      }

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { data: data?.preferences || {}, error: null };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return { data: {}, error: error instanceof Error ? error.message : 'Failed to get preferences' };
    }
  },

  async savePreferences(preferences: any) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          preferences,
          last_modified: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to save preferences' };
    }
  },

  async getChatPreferences() {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return { data: null, error: null };
      }

      const { data, error } = await supabase
        .from('chat_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { data: data?.preferences || {}, error: null };
    } catch (error) {
      console.error('Error getting chat notification preferences:', error);
      return { data: {}, error: error instanceof Error ? error.message : 'Failed to get chat preferences' };
    }
  },

  async saveChatPreferences(preferences: any) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('chat_notification_preferences')
        .upsert({
          user_id: user.id,
          preferences,
          last_modified: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error saving chat notification preferences:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to save chat preferences' };
    }
  }
};

// =====================================================
// BMC CANVAS HELPERS
// =====================================================

export const bmcCanvasHelpers = {
  async getCanvas(canvasId: string) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return { data: null, error: null };
      }

      const { data, error } = await supabase
        .from('bmc_canvas_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('canvas_id', canvasId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { data: data?.canvas_data || null, error: null };
    } catch (error) {
      console.error('Error getting BMC canvas:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to get canvas' };
    }
  },

  async saveCanvas(canvasId: string, canvasData: any, ideaId?: string) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('bmc_canvas_data')
        .upsert({
          user_id: user.id,
          canvas_id: canvasId,
          idea_id: ideaId,
          canvas_data: canvasData,
          last_modified: new Date().toISOString()
        }, { onConflict: 'user_id,canvas_id' })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error saving BMC canvas:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to save canvas' };
    }
  }
};

// =====================================================
// USER SETTINGS HELPERS
// =====================================================

export const userSettingsHelpers = {
  async getSetting(key: string) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return { data: null, error: null };
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('key', key)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { data: data?.value || null, error: null };
    } catch (error) {
      console.error('Error getting user setting:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to get setting' };
    }
  },

  async setSetting(key: string, value: any) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          key,
          value,
          last_modified: new Date().toISOString()
        }, { onConflict: 'user_id,key' })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error setting user setting:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to set setting' };
    }
  }
};

// =====================================================
// DRAFTS HELPERS
// =====================================================

export const draftHelpers = {
  async getDrafts(type?: string) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return { data: [], error: null };
      }

      let query = supabase
        .from('drafts')
        .select('*')
        .eq('user_id', user.id);

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query.order('last_modified', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error getting drafts:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Failed to get drafts' };
    }
  },

  async saveDraft(type: string, content: any, contextId?: string) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('drafts')
        .upsert({
          user_id: user.id,
          type,
          context_id: contextId,
          content,
          last_modified: new Date().toISOString()
        }, { onConflict: 'user_id,type,context_id' })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error saving draft:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to save draft' };
    }
  },

  async deleteDraft(type: string, contextId?: string) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('drafts')
        .delete()
        .eq('user_id', user.id)
        .eq('type', type);

      if (contextId) {
        query = query.eq('context_id', contextId);
      }

      const { error } = await query;

      if (error) throw error;
      return { data: { success: true }, error: null };
    } catch (error) {
      console.error('Error deleting draft:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to delete draft' };
    }
  }
};

// =====================================================
// LEGACY COMPATIBILITY - supabaseHelpers
// =====================================================

export const supabaseHelpers = {
  // Idea Vault methods
  getIdeas: ideaHelpers.getIdeas,
  createIdea: ideaHelpers.createIdea,
  updateIdea: ideaHelpers.updateIdea,
  deleteIdea: ideaHelpers.deleteIdea,

  // MVP Studio methods
  getProjects: mvpStudioHelpers.getProjects,
  createProject: mvpStudioHelpers.createProject,
  updateProject: mvpStudioHelpers.updateProject,
  deleteProject: mvpStudioHelpers.deleteProject,

  // Builder Context methods
  getContext: builderContextHelpers.getContext,
  saveContext: builderContextHelpers.saveContext,

  // Notification methods
  getNotificationPreferences: notificationHelpers.getPreferences,
  saveNotificationPreferences: notificationHelpers.savePreferences,
  getChatPreferences: notificationHelpers.getChatPreferences,
  saveChatPreferences: notificationHelpers.saveChatPreferences,

  // BMC Canvas methods
  getCanvas: bmcCanvasHelpers.getCanvas,
  saveCanvas: bmcCanvasHelpers.saveCanvas,

  // User Settings methods
  getSetting: userSettingsHelpers.getSetting,
  setSetting: userSettingsHelpers.setSetting,

  // Draft methods
  getDrafts: draftHelpers.getDrafts,
  saveDraft: draftHelpers.saveDraft,
  deleteDraft: draftHelpers.deleteDraft
};
