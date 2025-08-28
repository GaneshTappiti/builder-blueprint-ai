// Idea management store using Zustand
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface ActiveIdea {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'validated' | 'exploring' | 'archived';
  category: string;
  tags: string[];
  validation_score?: number;
  market_opportunity?: string;
  risk_assessment?: string;
  monetization_strategy?: string;
  key_features?: string[];
  next_steps?: string[];
  competitor_analysis?: string;
  target_market?: string;
  problem_statement?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface IdeaStore {
  currentStep: string;
  hasActiveIdea: boolean;
  activeIdea: ActiveIdea | null;
  ideas: ActiveIdea[];
  isLoading: boolean;
  error: string | null;
  canCreateNewIdea: () => boolean;
  setCurrentStep: (step: string) => void;
  setHasActiveIdea: (hasIdea: boolean) => void;
  setActiveIdea: (idea: ActiveIdea | null) => Promise<void>;
  fetchUserIdeas: () => Promise<void>;
  saveIdeaToSupabase: (idea: ActiveIdea) => Promise<void>;
}

export const useIdeaStore = create<IdeaStore>((set, get) => ({
  currentStep: 'workshop',
  hasActiveIdea: false,
  activeIdea: null,
  ideas: [],
  isLoading: false,
  error: null,

  canCreateNewIdea: () => !get().hasActiveIdea,

  setCurrentStep: (step: string) => set({ currentStep: step }),

  setHasActiveIdea: (hasIdea: boolean) => set({ hasActiveIdea: hasIdea }),

  saveIdeaToSupabase: async (idea: ActiveIdea) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user authenticated');

      const ideaWithUser = { ...idea, user_id: user.id, updated_at: new Date().toISOString() };

      if (idea.id) {
        // Update existing idea
        const { error } = await supabase
          .from('ideas')
          .update(ideaWithUser)
          .eq('id', idea.id);

        if (error) throw error;
        toast({ title: 'Idea updated successfully' });
        set(state => ({
          ideas: state.ideas.map(i => i.id === idea.id ? idea : i),
          activeIdea: idea
        }));
      } else {
        // Create new idea
        const newIdea = { ...ideaWithUser, id: crypto.randomUUID(), created_at: new Date().toISOString() };
        const { error } = await supabase
          .from('ideas')
          .insert(newIdea);

        if (error) throw error;
        toast({ title: 'Idea saved to vault' });
        set(state => ({
          ideas: [newIdea, ...state.ideas],
          hasActiveIdea: true,
          activeIdea: newIdea as ActiveIdea
        }));
      }
    } catch (error) {
      console.error('Error saving idea:', error);
      toast({ title: 'Failed to save idea', variant: 'destructive' });
      throw error;
    }
  },

  setActiveIdea: async (idea: ActiveIdea | null) => {
    if (idea) {
      await get().saveIdeaToSupabase(idea);
    } else {
      set({ activeIdea: null });
    }
  },

  fetchUserIdeas: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ ideas: [], isLoading: false });
        return;
      }

      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      const ideas = data as ActiveIdea[];
      set({
        ideas,
        hasActiveIdea: ideas.length > 0,
        activeIdea: ideas.length > 0 ? ideas[0] : null,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching ideas:', error);
      toast({ title: 'Failed to load ideas', variant: 'destructive' });
      set({ error: error instanceof Error ? error.message : 'Failed to load ideas', isLoading: false });
    }
  }
}));

// Helper hook to access active idea functionality
export const useActiveIdea = () => {
  const ideaStore = useIdeaStore();
  return {
    activeIdea: ideaStore.activeIdea,
    setActiveIdea: ideaStore.setActiveIdea,
    fetchUserIdeas: ideaStore.fetchUserIdeas,
    isLoading: ideaStore.isLoading,
    error: ideaStore.error
  };
};
