/**
 * MVP Project Storage Hook
 * Integrates MVP Studio storage with BuilderContext
 * Provides auto-save and project management functionality
 */

import { useEffect, useCallback, useState } from 'react';
import { useBuilder, builderActions } from '@/lib/builderContext';
import { mvpStudioStorage, StoredMVPProject } from '@/utils/mvp-studio-storage';
import { useToast } from '@/hooks/use-toast';

export interface UseMVPProjectStorageOptions {
  autoSave?: boolean;
  autoSaveInterval?: number; // in milliseconds
  projectId?: string;
}

export function useMVPProjectStorage(options: UseMVPProjectStorageOptions = {}) {
  const { state, dispatch } = useBuilder();
  const { toast } = useToast();
  const [currentProject, setCurrentProject] = useState<StoredMVPProject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    autoSave = true,
    autoSaveInterval = 30000, // 30 seconds
    projectId
  } = options;

  // Load project from storage
  const loadProject = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const project = mvpStudioStorage.getProject(id);
      if (project) {
        setCurrentProject(project);
        
        // Restore builder state from project
        dispatch(builderActions.updateAppIdea(project.appIdea));
        dispatch(builderActions.updateValidation(project.validationQuestions));
        
        if (project.appBlueprint) {
          dispatch(builderActions.setAppBlueprint(project.appBlueprint));
        }
        
        if (project.screenPrompts) {
          dispatch(builderActions.clearScreenPrompts());
          project.screenPrompts.forEach(prompt => {
            dispatch(builderActions.addScreenPrompt(prompt));
          });
        }
        
        if (project.appFlow) {
          dispatch(builderActions.setAppFlow(project.appFlow));
        }

        toast({
          title: "Project loaded",
          description: `"${project.name}" has been loaded successfully.`,
        });
      } else {
        toast({
          title: "Project not found",
          description: "The requested project could not be found.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: "Error loading project",
        description: "Failed to load the project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, toast]);

  // Save current state to project
  const saveProject = useCallback(async (projectData?: Partial<StoredMVPProject>) => {
    if (!state.appIdea.ideaDescription.trim()) {
      toast({
        title: "Cannot save empty project",
        description: "Please add an app idea before saving.",
        variant: "destructive",
      });
      return null;
    }

    setIsSaving(true);
    try {
      // Calculate progress
      const progress = {
        idea: state.appIdea.ideaDescription ? 100 : 0,
        validation: state.validationQuestions.motivation ? 100 : 0,
        blueprint: state.appBlueprint?.screens?.length ? 100 : 0,
        prompts: state.screenPrompts?.length ? 100 : 0,
        flow: state.appFlow?.flowLogic ? 100 : 0,
        export: 0 // Will be updated when exports are created
      };

      // Determine project status based on progress
      const totalProgress = Object.values(progress).reduce((sum, val) => sum + val, 0);
      const averageProgress = totalProgress / 6;
      
      let projectStatus = projectData?.status || 'draft';
      if (averageProgress >= 100) {
        projectStatus = 'completed';
      } else if (averageProgress >= 50) {
        projectStatus = 'building';
      }

      const projectToSave: Partial<StoredMVPProject> = {
        ...projectData,
        name: projectData?.name || state.appIdea.appName || 'Untitled MVP Project',
        description: projectData?.description || state.appIdea.ideaDescription,
        status: projectStatus,
        appIdea: state.appIdea,
        validationQuestions: state.validationQuestions,
        appBlueprint: state.appBlueprint || undefined,
        screenPrompts: state.screenPrompts,
        appFlow: state.appFlow || undefined,
        progress,
        metadata: {
          version: 1,
          toolUsed: state.validationQuestions.selectedTool,
          estimatedComplexity: state.appBlueprint?.screens?.length 
            ? state.appBlueprint.screens.length > 10 ? 'complex' : 'moderate'
            : 'simple',
          tags: [],
          isPublic: false,
          viewCount: 0,
          likeCount: 0,
          ...currentProject?.metadata,
          ...projectData?.metadata,
        }
      };

      const savedProject = mvpStudioStorage.saveProject(projectToSave);
      setCurrentProject(savedProject);

      toast({
        title: "Project saved",
        description: `"${savedProject.name}" has been saved successfully.`,
      });

      return savedProject;
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: "Error saving project",
        description: "Failed to save the project. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [state, currentProject, dispatch, toast]);

  // Create new project
  const createNewProject = useCallback(async (name?: string) => {
    // Reset builder state
    dispatch(builderActions.resetState());
    
    // Create new project
    const newProject = await saveProject({
      name: name || 'New MVP Project',
      status: 'draft'
    });

    return newProject;
  }, [dispatch, saveProject]);

  // Duplicate current project
  const duplicateProject = useCallback(async (newName?: string) => {
    if (!currentProject) return null;

    const duplicatedProject = mvpStudioStorage.duplicateProject(
      currentProject.id, 
      newName || `${currentProject.name} (Copy)`
    );

    if (duplicatedProject) {
      toast({
        title: "Project duplicated",
        description: `"${duplicatedProject.name}" has been created.`,
      });
    }

    return duplicatedProject;
  }, [currentProject, toast]);

  // Delete current project
  const deleteProject = useCallback(async () => {
    if (!currentProject) return false;

    const success = mvpStudioStorage.deleteProject(currentProject.id);
    
    if (success) {
      setCurrentProject(null);
      dispatch(builderActions.resetState());
      toast({
        title: "Project deleted",
        description: `"${currentProject.name}" has been deleted.`,
      });
    }

    return success;
  }, [currentProject, dispatch, toast]);

  // Export to Idea Forge
  const exportToIdeaForge = useCallback(async () => {
    if (!currentProject) return null;

    const ideaForgeData = mvpStudioStorage.exportToIdeaForge(currentProject.id);
    
    if (ideaForgeData) {
      toast({
        title: "Exported to Idea Forge",
        description: "Project has been exported successfully.",
      });
    }

    return ideaForgeData;
  }, [currentProject, toast]);

  // Get recent projects
  const getRecentProjects = useCallback((limit: number = 10) => {
    return mvpStudioStorage.getRecentProjects(limit);
  }, []);

  // Search projects
  const searchProjects = useCallback((query: string) => {
    return mvpStudioStorage.searchProjects(query);
  }, []);

  // Get project statistics
  const getProjectStats = useCallback(() => {
    return mvpStudioStorage.getProjectStats();
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (!autoSave || !currentProject) return;

    const interval = setInterval(() => {
      if (state.appIdea.ideaDescription.trim()) {
        saveProject();
      }
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [autoSave, autoSaveInterval, currentProject, state.appIdea.ideaDescription, saveProject]);

  // Load project on mount if projectId is provided
  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId, loadProject]);

  return {
    // State
    currentProject,
    isLoading,
    isSaving,
    
    // Actions
    loadProject,
    saveProject,
    createNewProject,
    duplicateProject,
    deleteProject,
    exportToIdeaForge,
    
    // Utilities
    getRecentProjects,
    searchProjects,
    getProjectStats,
    
    // Storage instance
    storage: mvpStudioStorage
  };
}
