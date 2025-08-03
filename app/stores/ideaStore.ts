// Mock Zustand store for idea management
// In a real application, this would use actual Zustand

interface ActiveIdea {
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
}

interface IdeaStore {
  currentStep: string;
  hasActiveIdea: boolean;
  canCreateNewIdea: () => boolean;
  setCurrentStep: (step: string) => void;
  setHasActiveIdea: (hasIdea: boolean) => void;
}

// Mock store state
let storeState = {
  currentStep: 'workshop',
  hasActiveIdea: false
};

// Mock store implementation
export const useIdeaStore = (selector: (state: IdeaStore) => any) => {
  const store: IdeaStore = {
    currentStep: storeState.currentStep,
    hasActiveIdea: storeState.hasActiveIdea,
    canCreateNewIdea: () => !storeState.hasActiveIdea,
    setCurrentStep: (step: string) => {
      storeState.currentStep = step;
    },
    setHasActiveIdea: (hasIdea: boolean) => {
      storeState.hasActiveIdea = hasIdea;
    }
  };
  
  return selector(store);
};

// Mock active idea hook
let activeIdeaState: ActiveIdea | null = null;

export const useActiveIdea = () => {
  return {
    activeIdea: activeIdeaState,
    setActiveIdea: (idea: ActiveIdea | null) => {
      activeIdeaState = idea;
    }
  };
};
