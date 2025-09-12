"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Search, 
  Clock, 
  Play, 
  CheckCircle, 
  Archive, 
  Copy, 
  Trash2, 
  ExternalLink,
  FolderOpen,
  BarChart3,
  Tag
} from 'lucide-react';
import { StoredMVPProject } from '@/utils/mvp-studio-storage';
import { mvpStudioStorage } from '@/utils/mvp-studio-storage';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface ProjectManagerSimpleProps {
  onProjectSelect?: (project: StoredMVPProject) => void;
  onNewProject?: () => void;
  showStats?: boolean;
}

export function ProjectManagerSimple({ 
  onProjectSelect, 
  onNewProject, 
  showStats = true 
}: ProjectManagerSimpleProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [projects, setProjects] = useState<StoredMVPProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<StoredMVPProject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  // Load projects and stats
  useEffect(() => {
    loadProjects();
    if (showStats) {
      loadStats();
    }
  }, [showStats]);

  // Filter projects based on search and status
  useEffect(() => {
    let filtered = projects;

    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.appIdea.ideaDescription.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(project => project.status === selectedStatus);
    }

    setFilteredProjects(filtered);
  }, [projects, searchQuery, selectedStatus]);

  const loadProjects = () => {
    const allProjects = mvpStudioStorage.getAllProjects();
    setProjects(allProjects);
    setIsLoading(false);
  };

  const loadStats = () => {
    const projectStats = mvpStudioStorage.getProjectStats();
    setStats(projectStats);
  };

  const handleProjectClick = (project: StoredMVPProject) => {
    if (onProjectSelect) {
      onProjectSelect(project);
    } else {
      router.push(`/workspace/mvp-studio/builder?project=${project.id}`);
    }
  };

  const handleNewProject = () => {
    if (onNewProject) {
      onNewProject();
    } else {
      router.push('/workspace/mvp-studio/builder');
    }
  };

  const handleDuplicateProject = async (project: StoredMVPProject) => {
    const duplicated = mvpStudioStorage.duplicateProject(project.id);
    if (duplicated) {
      loadProjects();
      toast({
        title: "Project duplicated",
        description: `"${duplicated.name}" has been created.`,
      });
    }
  };

  const handleDeleteProject = async (project: StoredMVPProject) => {
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      const success = mvpStudioStorage.deleteProject(project.id);
      if (success) {
        loadProjects();
        toast({
          title: "Project deleted",
          description: `"${project.name}" has been deleted.`,
        });
      }
    }
  };

  const getStatusIcon = (status: StoredMVPProject['status']) => {
    switch (status) {
      case 'draft': return <Clock className="w-4 h-4" />;
      case 'building': return <Play className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'archived': return <Archive className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: StoredMVPProject['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'building': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'archived': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateOverallProgress = (project: StoredMVPProject) => {
    const progressValues = Object.values(project.progress);
    return Math.round(progressValues.reduce((sum, val) => sum + val, 0) / progressValues.length);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">MVP Projects</h2>
          <p className="text-muted-foreground">
            Manage your MVP Studio projects and track progress
          </p>
        </div>
        <Button onClick={handleNewProject} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {/* Stats */}
      {showStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.byStatus.building || 0}</p>
                  <p className="text-sm text-muted-foreground">Building</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.byStatus.completed || 0}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.averageProgress}%</p>
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-input bg-background rounded-md"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="building">Building</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedStatus !== 'all' 
                ? 'Try adjusting your search or filters.'
                : 'Create your first MVP project to get started.'
              }
            </p>
            <Button onClick={handleNewProject}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleProjectClick(project)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">
                      {project.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {project.description || project.appIdea.ideaDescription}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <Badge 
                      variant="secondary" 
                      className={`${getStatusColor(project.status)} text-white`}
                    >
                      {getStatusIcon(project.status)}
                      <span className="ml-1 capitalize">{project.status}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{calculateOverallProgress(project)}%</span>
                  </div>
                  <Progress value={calculateOverallProgress(project)} className="h-2" />
                </div>

                {/* Metadata */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                  
                  {project.metadata.toolUsed && (
                    <div className="flex items-center gap-2">
                      <Tag className="w-3 h-3" />
                      <span>Tool: {project.metadata.toolUsed}</span>
                    </div>
                  )}

                  {project.metadata.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <Tag className="w-3 h-3" />
                      {project.metadata.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {project.metadata.tags.length > 3 && (
                        <span className="text-xs">+{project.metadata.tags.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateProject(project);
                    }}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                  <div className="flex-1" />
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProjectClick(project);
                    }}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
