/**
 * MVP Studio Storage Utility
 * Handles local storage operations for MVP Studio projects
 * Integrates with existing Idea Forge storage system
 */

import { AppIdea, AppBlueprint, ScreenPrompt, AppFlow, ValidationQuestions } from '@/lib/builderContext';
import { RAGTool } from '@/types/ideaforge';

export interface StoredMVPProject {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'building' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
  
  // MVP Studio specific data
  appIdea: AppIdea;
  validationQuestions: ValidationQuestions;
  appBlueprint?: AppBlueprint;
  screenPrompts?: ScreenPrompt[];
  appFlow?: AppFlow;
  
  // Progress tracking
  progress: {
    idea: number;        // 0-100%
    validation: number;  // 0-100%
    blueprint: number;   // 0-100%
    prompts: number;     // 0-100%
    flow: number;        // 0-100%
    export: number;      // 0-100%
  };
  
  // Metadata
  metadata: {
    version: number;
    toolUsed?: RAGTool;
    estimatedComplexity?: 'simple' | 'moderate' | 'complex';
    estimatedTime?: string;
    tags: string[];
    isPublic: boolean;
    viewCount: number;
    likeCount: number;
  };
  
  // Export data
  exports?: {
    id: string;
    type: 'prompts' | 'blueprint' | 'full' | 'custom';
    format: 'json' | 'markdown' | 'pdf' | 'docx';
    content: any;
    createdAt: string;
  }[];
}

class MVPStudioStorage {
  private readonly STORAGE_KEY = 'mvp_studio_projects';
  private readonly VERSION = '1.0.0';

  // Get all stored projects
  getAllProjects(): StoredMVPProject[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const data = JSON.parse(stored);
      const projects = Array.isArray(data) ? data : [];
      
      // Ensure backwards compatibility
      return projects.map(project => ({
        ...project,
        progress: project.progress || {
          idea: 0,
          validation: 0,
          blueprint: 0,
          prompts: 0,
          flow: 0,
          export: 0
        },
        metadata: {
          version: 1,
          tags: [],
          isPublic: false,
          viewCount: 0,
          likeCount: 0,
          ...project.metadata
        }
      }));
    } catch (error) {
      console.error('Error loading MVP projects from storage:', error);
      return [];
    }
  }

  // Get a specific project by ID
  getProject(id: string): StoredMVPProject | null {
    const projects = this.getAllProjects();
    return projects.find(project => project.id === id) || null;
  }

  // Get recent projects (last 10)
  getRecentProjects(limit: number = 10): StoredMVPProject[] {
    const projects = this.getAllProjects();
    return projects
      .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())
      .slice(0, limit);
  }

  // Get projects by status
  getProjectsByStatus(status: StoredMVPProject['status']): StoredMVPProject[] {
    const projects = this.getAllProjects();
    return projects.filter(project => project.status === status);
  }

  // Save a project (create or update)
  saveProject(project: Partial<StoredMVPProject>): StoredMVPProject {
    const projects = this.getAllProjects();
    const now = new Date().toISOString();
    
    let savedProject: StoredMVPProject;
    
    if (project.id) {
      // Update existing project
      const index = projects.findIndex(p => p.id === project.id);
      if (index >= 0) {
        savedProject = {
          ...projects[index],
          ...project,
          updatedAt: now,
          lastAccessedAt: now,
          metadata: {
            ...projects[index].metadata,
            version: (projects[index].metadata?.version || 0) + 1,
            ...project.metadata
          }
        } as StoredMVPProject;
        projects[index] = savedProject;
      } else {
        throw new Error('Project not found for update');
      }
    } else {
      // Create new project
      savedProject = {
        id: this.generateId(),
        name: project.name || 'Untitled MVP Project',
        description: project.description || '',
        status: project.status || 'draft',
        createdAt: now,
        updatedAt: now,
        lastAccessedAt: now,
        appIdea: project.appIdea || {
          appName: '',
          platforms: ['web'],
          designStyle: 'minimal',
          ideaDescription: '',
          targetAudience: ''
        },
        validationQuestions: project.validationQuestions || {
          hasValidated: false,
          hasDiscussed: false,
          motivation: '',
          selectedTool: undefined
        },
        appBlueprint: project.appBlueprint,
        screenPrompts: project.screenPrompts,
        appFlow: project.appFlow,
        progress: project.progress || {
          idea: 0,
          validation: 0,
          blueprint: 0,
          prompts: 0,
          flow: 0,
          export: 0
        },
        metadata: {
          version: 1,
          tags: [],
          isPublic: false,
          viewCount: 0,
          likeCount: 0,
          ...project.metadata
        },
        exports: project.exports || []
      };
      projects.push(savedProject);
    }

    this.saveToStorage(projects);
    return savedProject;
  }

  // Update project progress
  updateProgress(id: string, progress: Partial<StoredMVPProject['progress']>): boolean {
    const project = this.getProject(id);
    if (!project) return false;

    const updatedProject = {
      ...project,
      progress: { ...project.progress, ...progress },
      updatedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString()
    };

    this.saveProject(updatedProject);
    return true;
  }

  // Update project status
  updateStatus(id: string, status: StoredMVPProject['status']): boolean {
    const project = this.getProject(id);
    if (!project) return false;

    const updatedProject = {
      ...project,
      status,
      updatedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString()
    };

    this.saveProject(updatedProject);
    return true;
  }

  // Add export to project
  addExport(projectId: string, exportData: StoredMVPProject['exports'][0]): boolean {
    const project = this.getProject(projectId);
    if (!project) return false;

    const updatedProject = {
      ...project,
      exports: [...(project.exports || []), exportData],
      updatedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString()
    };

    this.saveProject(updatedProject);
    return true;
  }

  // Delete a project
  deleteProject(id: string): boolean {
    const projects = this.getAllProjects();
    const filteredProjects = projects.filter(project => project.id !== id);
    
    if (filteredProjects.length === projects.length) {
      return false; // Project not found
    }
    
    this.saveToStorage(filteredProjects);
    return true;
  }

  // Duplicate a project
  duplicateProject(id: string, newName?: string): StoredMVPProject | null {
    const project = this.getProject(id);
    if (!project) return null;

    const duplicatedProject = {
      ...project,
      id: this.generateId(),
      name: newName || `${project.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      status: 'draft' as const,
      metadata: {
        ...project.metadata,
        version: 1,
        viewCount: 0,
        likeCount: 0
      },
      exports: []
    };

    this.saveProject(duplicatedProject);
    return duplicatedProject;
  }

  // Search projects
  searchProjects(query: string): StoredMVPProject[] {
    const projects = this.getAllProjects();
    const lowercaseQuery = query.toLowerCase();
    
    return projects.filter(project => 
      project.name.toLowerCase().includes(lowercaseQuery) ||
      project.description.toLowerCase().includes(lowercaseQuery) ||
      project.appIdea.ideaDescription.toLowerCase().includes(lowercaseQuery) ||
      project.metadata.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Get project statistics
  getProjectStats(): {
    total: number;
    byStatus: Record<StoredMVPProject['status'], number>;
    byTool: Record<string, number>;
    totalExports: number;
    averageProgress: number;
  } {
    const projects = this.getAllProjects();
    
    const byStatus = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<StoredMVPProject['status'], number>);

    const byTool = projects.reduce((acc, project) => {
      if (project.metadata.toolUsed) {
        acc[project.metadata.toolUsed] = (acc[project.metadata.toolUsed] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const totalExports = projects.reduce((acc, project) => acc + (project.exports?.length || 0), 0);
    
    const averageProgress = projects.length > 0 
      ? projects.reduce((acc, project) => {
          const totalProgress = Object.values(project.progress).reduce((sum, val) => sum + val, 0);
          return acc + (totalProgress / 6); // 6 progress categories
        }, 0) / projects.length
      : 0;

    return {
      total: projects.length,
      byStatus,
      byTool,
      totalExports,
      averageProgress: Math.round(averageProgress)
    };
  }

  // Export project to Idea Forge format
  exportToIdeaForge(projectId: string): any {
    const project = this.getProject(projectId);
    if (!project) return null;

    return {
      id: project.id,
      title: project.name,
      description: project.description,
      status: project.status === 'completed' ? 'validated' : 'draft',
      tags: project.metadata.tags,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      progress: {
        wiki: Math.round(project.progress.idea),
        blueprint: Math.round(project.progress.blueprint),
        journey: Math.round(project.progress.flow),
        feedback: Math.round(project.progress.export)
      },
      content: {
        problemStatement: project.appIdea.ideaDescription,
        targetMarket: project.appIdea.targetAudience,
        keyFeatures: project.appBlueprint?.screens?.map(s => s.purpose) || [],
        technicalRequirements: project.appBlueprint?.architecture || '',
        timeline: project.metadata.estimatedTime || '',
        risks: project.appBlueprint?.screens?.map(s => s.edgeCases || []).flat() || []
      },
      metadata: {
        version: project.metadata.version,
        isPublic: project.metadata.isPublic,
        viewCount: project.metadata.viewCount,
        likeCount: project.metadata.likeCount,
        mvpStudioProject: true,
        toolUsed: project.metadata.toolUsed
      }
    };
  }

  // Import from Idea Forge
  importFromIdeaForge(ideaForgeData: any): StoredMVPProject | null {
    try {
      const project: Partial<StoredMVPProject> = {
        name: ideaForgeData.title,
        description: ideaForgeData.description,
        status: ideaForgeData.status === 'validated' ? 'completed' : 'draft',
        appIdea: {
          appName: ideaForgeData.title,
          platforms: ['web'],
          designStyle: 'minimal',
          ideaDescription: ideaForgeData.content?.problemStatement || '',
          targetAudience: ideaForgeData.content?.targetMarket || ''
        },
        validationQuestions: {
          hasValidated: ideaForgeData.status === 'validated',
          hasDiscussed: false,
          motivation: ideaForgeData.content?.problemStatement || '',
          selectedTool: undefined
        },
        progress: {
          idea: ideaForgeData.progress?.wiki || 0,
          validation: 0,
          blueprint: ideaForgeData.progress?.blueprint || 0,
          prompts: 0,
          flow: ideaForgeData.progress?.journey || 0,
          export: ideaForgeData.progress?.feedback || 0
        },
        metadata: {
          version: 1,
          tags: ideaForgeData.tags || [],
          isPublic: ideaForgeData.metadata?.isPublic || false,
          viewCount: ideaForgeData.metadata?.viewCount || 0,
          likeCount: ideaForgeData.metadata?.likeCount || 0
        }
      };

      return this.saveProject(project);
    } catch (error) {
      console.error('Error importing from Idea Forge:', error);
      return null;
    }
  }

  // Private helper methods
  private generateId(): string {
    return `mvp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveToStorage(projects: StoredMVPProject[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving MVP projects to storage:', error);
    }
  }

  // Clear all projects (for development/testing)
  clearAllProjects(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Export singleton instance
export const mvpStudioStorage = new MVPStudioStorage();

// Export types for use in components
export type { StoredMVPProject };
