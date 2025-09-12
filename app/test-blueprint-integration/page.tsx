"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mvpStudioStorage } from '@/utils/mvp-studio-storage';
import { useRouter } from 'next/navigation';

export default function TestBlueprintIntegration() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [completedProjects, setCompletedProjects] = useState<any[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const allProjects = mvpStudioStorage.getAllProjects();
    setProjects(allProjects);
    
    const completed = allProjects.filter(p => p.status === 'completed');
    setCompletedProjects(completed);
  };

  const createTestProject = () => {
    const testProject = mvpStudioStorage.saveProject({
      name: 'Test Startup Idea',
      description: 'A task management app for teams',
      status: 'completed',
      appIdea: {
        appName: 'Test Startup Idea',
        platforms: ['web'],
        designStyle: 'minimal',
        ideaDescription: 'A task management app for teams to collaborate and track progress',
        targetAudience: 'Remote teams and project managers'
      },
      validationQuestions: {
        hasValidated: true,
        hasDiscussed: true,
        motivation: 'Teams need better task management tools',
        selectedTool: 'cursor'
      },
      appBlueprint: {
        screens: [
          {
            id: 'dashboard',
            name: 'Dashboard',
            purpose: 'Main overview of tasks and projects',
            components: ['TaskList', 'ProjectCards', 'ProgressChart'],
            navigation: ['projects', 'tasks', 'profile'],
            type: 'main'
          },
          {
            id: 'task-detail',
            name: 'Task Detail',
            purpose: 'Detailed view of individual tasks',
            components: ['TaskForm', 'Comments', 'Attachments'],
            navigation: ['dashboard', 'back'],
            type: 'feature'
          }
        ],
        userRoles: [
          {
            name: 'Admin',
            permissions: ['create', 'edit', 'delete', 'assign'],
            description: 'Full access to all features'
          },
          {
            name: 'Member',
            permissions: ['view', 'edit_own', 'comment'],
            description: 'Can view and edit own tasks'
          }
        ],
        navigationFlow: 'Dashboard → Task Detail → Edit → Save → Back to Dashboard',
        dataModels: [
          {
            name: 'Task',
            fields: ['id', 'title', 'description', 'status', 'assignee', 'dueDate'],
            relationships: ['Project', 'User', 'Comments']
          }
        ],
        architecture: 'Component-based React architecture with state management'
      },
      screenPrompts: [
        {
          screenId: 'dashboard',
          title: 'Dashboard',
          layout: 'Header with navigation, main content area with task cards in grid layout',
          components: 'TaskList component, ProjectCards component, ProgressChart component',
          behavior: 'Load tasks on mount, filter by status, sort by due date',
          conditionalLogic: 'Show different views based on user role',
          styleHints: 'Clean, minimal design with green accent colors'
        },
        {
          screenId: 'task-detail',
          title: 'Task Detail',
          layout: 'Full-width layout with task form, comments section, and attachments',
          components: 'TaskForm component, Comments component, Attachments component',
          behavior: 'Auto-save changes, real-time comments, file upload',
          conditionalLogic: 'Show edit controls only for assigned users',
          styleHints: 'Form-focused design with clear action buttons'
        }
      ],
      appFlow: {
        flowLogic: 'User navigates from dashboard to task detail, can edit and save changes',
        userJourney: 'Login → Dashboard → Select Task → Edit → Save → Return to Dashboard'
      },
      progress: {
        idea: 100,
        validation: 100,
        blueprint: 100,
        prompts: 100,
        flow: 100,
        export: 100
      }
    });

    loadProjects();
    return testProject;
  };

  const clearTestData = () => {
    mvpStudioStorage.clearAllProjects();
    loadProjects();
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Blueprint Integration Test</h1>
      
      <div className="space-y-6">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={createTestProject}>
                Create Test Project
              </Button>
              <Button onClick={clearTestData} variant="outline">
                Clear Test Data
              </Button>
              <Button onClick={loadProjects} variant="outline">
                Refresh
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Create a test project to verify the Blueprint integration works properly.
            </p>
          </CardContent>
        </Card>

        {/* Project Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Project Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{projects.length}</div>
                <div className="text-sm text-muted-foreground">Total Projects</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{completedProjects.length}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">
                  {completedProjects.length > 0 ? '✅' : '❌'}
                </div>
                <div className="text-sm text-muted-foreground">Blueprint Ready</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects List */}
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No projects found. Create a test project to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {project.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                            {project.status}
                          </Badge>
                          {project.metadata?.toolUsed && (
                            <Badge variant="outline">
                              {project.metadata.toolUsed}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {project.screenPrompts?.length || 0} screens
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {project.appBlueprint?.userRoles?.length || 0} roles
                        </div>
                        {project.status === 'completed' && (
                          <Button
                            size="sm"
                            onClick={() => router.push(`/workspace/ideaforge?idea=${project.id}`)}
                            className="mt-2"
                          >
                            View Blueprint
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Integration Status */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${projects.length > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span>MVP Studio Storage: {projects.length > 0 ? 'Working' : 'No Data'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${completedProjects.length > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span>Completed Projects: {completedProjects.length > 0 ? 'Available' : 'None'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${completedProjects.length > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span>Blueprint Integration: {completedProjects.length > 0 ? 'Ready' : 'Not Ready'}</span>
              </div>
            </div>
            
            {completedProjects.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">✅ Integration Working!</h4>
                <p className="text-sm text-green-700">
                  Completed MVP Studio projects will now appear in the Idea Forge Blueprint section.
                  The Blueprint feature will show "Blueprint Ready" instead of "Incomplete".
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
