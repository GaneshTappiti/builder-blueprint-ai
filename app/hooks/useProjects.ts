import { useState, useEffect } from 'react';
import { projectService, Project, ProjectStats } from '@/services/projectService';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats>({ total: 0, active: 0, completed: 0, inProgress: 0 });

  useEffect(() => {
    // Initial load
    setProjects(projectService.getProjects());
    setStats(projectService.getProjectStats());

    // Subscribe to changes
    const unsubscribe = projectService.subscribe((updatedProjects) => {
      setProjects(updatedProjects);
      setStats(projectService.getProjectStats());
    });

    return unsubscribe;
  }, []);

  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'user_id'>) => {
    return await projectService.createProject(projectData);
  };

  const updateProject = async (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt' | 'user_id'>>) => {
    return await projectService.updateProject(id, updates);
  };

  const deleteProject = async (id: string) => {
    return await projectService.deleteProject(id);
  };

  const archiveProject = async (id: string) => {
    return await projectService.archiveProject(id);
  };

  const getProject = (id: string) => {
    return projectService.getProject(id);
  };

  const getRecentProjects = () => {
    return projectService.getRecentProjects();
  };

  const getProjectsByStatus = (status: Project['status']) => {
    return projectService.getProjectsByStatus(status);
  };

  return {
    projects,
    stats,
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
    getProject,
    getRecentProjects,
    getProjectsByStatus,
    formatTimeAgo: projectService.formatTimeAgo.bind(projectService),
    getStageColor: projectService.getStageColor.bind(projectService),
    getPriorityColor: projectService.getPriorityColor.bind(projectService)
  };
};
