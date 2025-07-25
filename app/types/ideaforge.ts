// IdeaForge Types
export type IdeaStatus = 'draft' | 'researching' | 'validated' | 'building';
export type IdeaForgeTab = 'overview' | 'wiki' | 'blueprint' | 'journey' | 'feedback';

export interface IdeaInput {
  title: string;
  description?: string;
  tags?: string[];
}

export interface StoredIdea {
  id: string;
  title: string;
  description: string;
  content: string;
  status: IdeaStatus;
  tags: string[];
  coverImage?: string;
  favorited: boolean;
  createdAt: string;
  updatedAt: string;
  progress: {
    wiki: number;
    blueprint: number;
    journey: number;
    feedback: number;
  };
}

export interface IdeaForgeSidebarItem {
  id: IdeaForgeTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  progress?: number;
}

export interface ExportData {
  idea?: {
    title?: string;
    description?: string;
    status?: string;
    tags?: string[];
    createdAt?: string;
  };
  wiki?: {
    sections?: Array<{
      title?: string;
      content?: string;
    }>;
  };
  blueprint?: {
    appType?: string;
    features?: Array<{
      name?: string;
      description?: string;
      priority?: string;
    }>;
    techStack?: Array<{
      name?: string;
      description?: string;
      category?: string;
    }>;
  };
  journey?: {
    entries?: Array<{
      title?: string;
      content?: string;
      date?: string;
      type?: string;
    }>;
  };
  feedback?: {
    items?: Array<{
      title?: string;
      content?: string;
      author?: string;
    }>;
  };
}
