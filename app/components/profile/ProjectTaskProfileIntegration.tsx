"use client";

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FolderOpen, 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  Users,
  Target,
  BarChart3,
  Plus,
  Eye,
  Edit
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProjectTaskProfileIntegrationProps {
  className?: string;
}

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  projectsByStage: {
    idea: number;
    planning: number;
    development: number;
    testing: number;
    launch: number;
  };
  totalTasks: number;
  completedTasks: number;
  tasksByStatus: {
    todo: number;
    'in-progress': number;
    done: number;
  };
  tasksByPriority: {
    low: number;
    medium: number;
    high: number;
  };
  averageTaskCompletionTime: number; // in hours
  currentProjects: Array<{
    id: string;
    name: string;
    stage: string;
    progress: number;
    dueDate?: string;
    teamMembers: number;
  }>;
  recentTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate?: string;
    projectName: string;
  }>;
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    type: 'project' | 'task';
    dueDate: string;
    priority: string;
  }>;
}

export function ProjectTaskProfileIntegration({ className = '' }: ProjectTaskProfileIntegrationProps) {
  const { profile } = useProfile();
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - in a real app, this would come from the project/task service
  useEffect(() => {
    const loadProjectStats = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data based on profile
        const mockStats: ProjectStats = {
          totalProjects: 8,
          activeProjects: 3,
          completedProjects: 5,
          projectsByStage: {
            idea: 1,
            planning: 1,
            development: 2,
            testing: 0,
            launch: 0
          },
          totalTasks: 24,
          completedTasks: 18,
          tasksByStatus: {
            todo: 3,
            'in-progress': 3,
            done: 18
          },
          tasksByPriority: {
            low: 8,
            medium: 12,
            high: 4
          },
          averageTaskCompletionTime: 4.5,
          currentProjects: [
            {
              id: '1',
              name: 'AI-Powered Analytics Dashboard',
              stage: 'development',
              progress: 65,
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              teamMembers: 4
            },
            {
              id: '2',
              name: 'Mobile App Redesign',
              stage: 'planning',
              progress: 25,
              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              teamMembers: 3
            },
            {
              id: '3',
              name: 'API Integration Project',
              stage: 'development',
              progress: 80,
              dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              teamMembers: 2
            }
          ],
          recentTasks: [
            {
              id: '1',
              title: 'Implement user authentication',
              status: 'done',
              priority: 'high',
              dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              projectName: 'AI-Powered Analytics Dashboard'
            },
            {
              id: '2',
              title: 'Design mobile wireframes',
              status: 'in-progress',
              priority: 'medium',
              dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              projectName: 'Mobile App Redesign'
            },
            {
              id: '3',
              title: 'Test API endpoints',
              status: 'todo',
              priority: 'high',
              dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
              projectName: 'API Integration Project'
            }
          ],
          upcomingDeadlines: [
            {
              id: '1',
              title: 'API Integration Project',
              type: 'project',
              dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              priority: 'high'
            },
            {
              id: '2',
              title: 'Test API endpoints',
              type: 'task',
              dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
              priority: 'high'
            },
            {
              id: '3',
              title: 'Design mobile wireframes',
              type: 'task',
              dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              priority: 'medium'
            }
          ]
        };
        
        setProjectStats(mockStats);
      } catch (error) {
        console.error('Error loading project stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjectStats();
  }, [profile]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Loading project statistics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!projectStats) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <FolderOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No project statistics available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'todo': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckSquare className="h-3 w-3" />;
      case 'in-progress': return <Clock className="h-3 w-3" />;
      case 'todo': return <AlertCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'idea': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'planning': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'development': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'testing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'launch': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FolderOpen className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{projectStats.totalProjects}</p>
                <p className="text-sm text-muted-foreground">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{projectStats.activeProjects}</p>
                <p className="text-sm text-muted-foreground">Active Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{projectStats.totalTasks}</p>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round((projectStats.completedTasks / projectStats.totalTasks) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FolderOpen className="h-5 w-5 mr-2" />
            Current Projects
          </CardTitle>
          <CardDescription>
            Projects you're currently working on
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectStats.currentProjects.map((project) => (
              <div key={project.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{project.name}</h3>
                  <Badge className={getStageColor(project.stage)}>
                    {project.stage}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{project.teamMembers} members</span>
                    </div>
                    {project.dueDate && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Due {formatDistanceToNow(new Date(project.dueDate), { addSuffix: true })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tasks Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tasks by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Tasks by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(projectStats.tasksByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(status)}
                    <span className="capitalize font-medium">{status.replace('-', ' ')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(count / projectStats.totalTasks) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tasks by Priority */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Tasks by Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(projectStats.tasksByPriority).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${
                      priority === 'high' ? 'bg-red-500' : 
                      priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <span className="capitalize font-medium">{priority}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(count / projectStats.totalTasks) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckSquare className="h-5 w-5 mr-2" />
            Recent Tasks
          </CardTitle>
          <CardDescription>
            Your latest task activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {projectStats.recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="text-sm text-muted-foreground">{task.projectName}</p>
                  {task.dueDate && (
                    <p className="text-xs text-muted-foreground">
                      Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(task.status)}>
                    {getStatusIcon(task.status)}
                    <span className="ml-1 capitalize">{task.status.replace('-', ' ')}</span>
                  </Badge>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Upcoming Deadlines
          </CardTitle>
          <CardDescription>
            Important deadlines coming up
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {projectStats.upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{deadline.title}</h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {deadline.type} • Due {formatDistanceToNow(new Date(deadline.dueDate), { addSuffix: true })}
                  </p>
                </div>
                <Badge className={getPriorityColor(deadline.priority)}>
                  {deadline.priority}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common actions for project and task management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="justify-start">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
            <Button variant="outline" className="justify-start">
              <CheckSquare className="h-4 w-4 mr-2" />
              New Task
            </Button>
            <Button variant="outline" className="justify-start">
              <Eye className="h-4 w-4 mr-2" />
              View All Projects
            </Button>
            <Button variant="outline" className="justify-start">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProjectTaskProfileIntegration;
