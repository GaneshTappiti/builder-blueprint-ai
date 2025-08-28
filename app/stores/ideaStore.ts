// Idea management using React Context API
import React, { createContext, useReducer, useContext, useEffect } from 'react';
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

interface IdeaState {
  currentStep: string;
  hasActiveIdea: boolean;
  activeIdea: ActiveIdea | null;
  ideas: ActiveIdea[];
  isLoading: boolean;
  error: string | null;
}

type IdeaAction = 
  | { type: 'SET_CURRENT_STEP'; payload: string }
  | { type: 'SET_HAS_ACTIVE_IDEA'; payload: boolean }
  | { type: 'SET_ACTIVE_IDEA'; payload: ActiveIdea | null }
  | { type: 'SET_IDEAS'; payload: ActiveIdea[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: IdeaState = {
  currentStep: 'workshop',
  hasActiveIdea: false,
  activeIdea: null,
  ideas: [],
  isLoading: false,
  error: null
};

const ideaReducer = (state: IdeaState, action: IdeaAction): IdeaState => {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_HAS_ACTIVE_IDEA':
      return { ...state, hasActiveIdea: action.payload };
    case 'SET_ACTIVE_IDEA':
      return { ...state, activeIdea: action.payload };
    case 'SET_IDEAS':
      return { ...state, ideas: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

interface IdeaContextType extends IdeaState {
  setCurrentStep: (step: string) => void;
  setHasActiveIdea: (hasIdea: boolean) => void;
  setActiveIdea: (idea: ActiveIdea | null) => Promise<void>;
  fetchUserIdeas: () => Promise<void>;
  saveIdeaToSupabase: (idea: ActiveIdea) => Promise<void>;
  canCreateNewIdea: () => boolean;
}

const IdeaContext = createContext<IdeaContextType | undefined>(undefined);

export const IdeaProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [state, dispatch] = useReducer(ideaReducer, initialState);

  const setCurrentStep = useCallback((step: string) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  }, []);

  const setHasActiveIdea = useCallback((hasIdea: boolean) => {
    dispatch({ type: 'SET_HAS_ACTIVE_IDEA', payload: hasIdea });
  }, []);

  const canCreateNewIdea = useCallback(() => !state.hasActiveIdea, [state.hasActiveIdea]);

  const saveIdeaToSupabase = useCallback(async (idea: ActiveIdea) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
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
        dispatch({ type: 'SET_ACTIVE_IDEA', payload: idea });
        dispatch({ type: 'SET_IDEAS', payload: state.ideas.map(i => i.id === idea.id ? idea : i) });
      } else {
        // Create new idea
        const newIdea = { ...ideaWithUser, id: crypto.randomUUID(), created_at: new Date().toISOString() };
        const { error } = await supabase
          .from('ideas')
          .insert(newIdea);

        if (error) throw error;
        toast({ title: 'Idea saved to vault' });
        dispatch({ type: 'SET_IDEAS', payload: [newIdea, ...state.ideas] });
        dispatch({ type: 'SET_HAS_ACTIVE_IDEA', payload: true });
        dispatch({ type: 'SET_ACTIVE_IDEA', payload: newIdea });
      }
    } catch (error) {
      console.error('Error saving idea:', error);
      toast({ title: 'Failed to save idea', variant: 'destructive' });
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to save idea' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setActiveIdea = async (idea: ActiveIdea | null) => {
    if (idea) {
      await saveIdeaToSupabase(idea);
    } else {
      dispatch({ type: 'SET_ACTIVE_IDEA', payload: null });
    }
  };

  const fetchUserIdeas = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        dispatch({ type: 'SET_IDEAS', payload: [] });
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      const ideas = data as ActiveIdea[];
      dispatch({ type: 'SET_IDEAS', payload: ideas });
      dispatch({ type: 'SET_HAS_ACTIVE_IDEA', payload: ideas.length > 0 });
      dispatch({ type: 'SET_ACTIVE_IDEA', payload: ideas.length > 0 ? ideas[0] : null });
    } catch (error) {
      console.error('Error fetching ideas:', error);
      toast({ title: 'Failed to load ideas', variant: 'destructive' });
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load ideas' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <IdeaContext.Provider value={{ ...state, setCurrentStep, setHasActiveIdea, setActiveIdea, fetchUserIdeas, saveIdeaToSupabase, canCreateNewIdea }}>
      {children}
    </IdeaContext.Provider>
  );
};

export const useIdeaContext = () => {
  const context = useContext(IdeaContext);
  if (context === undefined) {
    throw new Error('useIdeaContext must be used within an IdeaProvider');
  }
  return context;
};

// Helper hook to maintain backward compatibility

export const useActiveIdea = () => {
  const context = useIdeaContext();
  return {
    activeIdea: context.activeIdea,
    setActiveIdea: context.setActiveIdea,
    fetchUserIdeas: context.fetchUserIdeas,
    isLoading: context.isLoading,
    error: context.error
  };
};

// Deprecated export for backward compatibility - will be removed in future versions

export const useIdeaStore = () => {
  console.warn('useIdeaStore is deprecated, use useIdeaContext instead');
  return useIdeaContext();
};

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
