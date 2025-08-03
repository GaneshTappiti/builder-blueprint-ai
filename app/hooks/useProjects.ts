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

  const createProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    return projectService.createProject(projectData);
  };

  const updateProject = (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => {
    return projectService.updateProject(id, updates);
  };

  const deleteProject = (id: string) => {
    return projectService.deleteProject(id);
  };

  const archiveProject = (id: string) => {
    return projectService.archiveProject(id);
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
