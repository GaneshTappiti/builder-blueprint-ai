"use client";

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BarChart3, 
  PieChart, 
  Activity,
  Target,
  Users,
  Lightbulb,
  CheckSquare,
  Clock,
  Star,
  Zap,
  Brain,
  Heart
} from 'lucide-react';
import { TrendAnalytics, SkillGrowthTrend, ProjectContributionTrend, CollaborationTrend, ProductivityTrend } from '@/types/profile';

interface ProfileTrendAnalyticsProps {
  userId?: string;
  className?: string;
}

export function ProfileTrendAnalytics({ userId, className = '' }: ProfileTrendAnalyticsProps) {
  const { profile } = useProfile();
  const [trendData, setTrendData] = useState<TrendAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    loadTrendData();
  }, [userId, selectedPeriod]);

  const loadTrendData = async () => {
    try {
      setLoading(true);
      // This would be implemented in ProfileService
      // const data = await ProfileService.getTrendAnalytics(userId, selectedPeriod);
      // setTrendData(data);
      
      // Mock data for now
      const mockData: TrendAnalytics = {
        period: selectedPeriod,
        skillsGrowth: [
          {
            skill: 'React',
            currentLevel: 8.5,
            previousLevel: 7.2,
            growthRate: 18.1,
            trend: 'increasing'
          },
          {
            skill: 'TypeScript',
            currentLevel: 7.8,
            previousLevel: 6.5,
            growthRate: 20.0,
            trend: 'increasing'
          },
          {
            skill: 'Node.js',
            currentLevel: 6.2,
            previousLevel: 6.0,
            growthRate: 3.3,
            trend: 'stable'
          },
          {
            skill: 'Python',
            currentLevel: 5.5,
            previousLevel: 6.1,
            growthRate: -9.8,
            trend: 'decreasing'
          }
        ],
        projectContributions: [
          {
            projectId: 'proj-1',
            projectName: 'Mobile App Redesign',
            contributions: 45,
            period: '2024-01',
            trend: 'increasing'
          },
          {
            projectId: 'proj-2',
            projectName: 'API Optimization',
            contributions: 32,
            period: '2024-01',
            trend: 'stable'
          },
          {
            projectId: 'proj-3',
            projectName: 'Data Migration',
            contributions: 18,
            period: '2024-01',
            trend: 'decreasing'
          }
        ],
        collaborationPatterns: [
          {
            collaboratorId: 'user-1',
            collaboratorName: 'Sarah Johnson',
            interactionCount: 25,
            lastInteraction: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            trend: 'increasing'
          },
          {
            collaboratorId: 'user-2',
            collaboratorName: 'Mike Chen',
            interactionCount: 18,
            lastInteraction: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            trend: 'stable'
          },
          {
            collaboratorId: 'user-3',
            collaboratorName: 'Emily Davis',
            interactionCount: 12,
            lastInteraction: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            trend: 'decreasing'
          }
        ],
        productivityMetrics: [
          {
            metric: 'Tasks Completed',
            value: 45,
            previousValue: 38,
            change: 18.4,
            trend: 'increasing'
          },
          {
            metric: 'Ideas Submitted',
            value: 8,
            previousValue: 12,
            change: -33.3,
            trend: 'decreasing'
          },
          {
            metric: 'Code Reviews',
            value: 23,
            previousValue: 25,
            change: -8.0,
            trend: 'stable'
          },
          {
            metric: 'Meeting Hours',
            value: 15,
            previousValue: 18,
            change: -16.7,
            trend: 'decreasing'
          }
        ]
      };
      
      setTrendData(mockData);
    } catch (error) {
      console.error('Error loading trend data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-green-600';
      case 'decreasing': return 'text-red-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case 'increasing': return <Badge variant="outline" className="text-green-600 border-green-200">Growing</Badge>;
      case 'decreasing': return <Badge variant="outline" className="text-red-600 border-red-200">Declining</Badge>;
      case 'stable': return <Badge variant="outline" className="text-gray-600 border-gray-200">Stable</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!trendData) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No trend data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Trend Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Performance trends over {trendData.period}
          </p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'quarter', 'year'] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="capitalize"
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="skills" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="skills">Skills Growth</TabsTrigger>
          <TabsTrigger value="projects">Project Contributions</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
        </TabsList>

        {/* Skills Growth Tab */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Skills Development
              </CardTitle>
              <CardDescription>
                Track your skill growth and development over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendData.skillsGrowth.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Brain className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{skill.skill}</h4>
                        <p className="text-sm text-muted-foreground">
                          Level {skill.currentLevel.toFixed(1)} / 10
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getTrendColor(skill.trend)}`}>
                          {skill.growthRate > 0 ? '+' : ''}{skill.growthRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          vs previous {trendData.period}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(skill.trend)}
                        {getTrendBadge(skill.trend)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Contributions Tab */}
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Project Contributions
              </CardTitle>
              <CardDescription>
                Your involvement and contributions across different projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendData.projectContributions.map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CheckSquare className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{project.projectName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {project.contributions} contributions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {project.contributions} contributions
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {project.period}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(project.trend)}
                        {getTrendBadge(project.trend)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collaboration Tab */}
        <TabsContent value="collaboration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Collaboration Patterns
              </CardTitle>
              <CardDescription>
                Your collaboration frequency and patterns with team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendData.collaborationPatterns.map((collaborator, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{collaborator.collaboratorName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {collaborator.interactionCount} interactions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {collaborator.interactionCount} interactions
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last: {new Date(collaborator.lastInteraction).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(collaborator.trend)}
                        {getTrendBadge(collaborator.trend)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Productivity Tab */}
        <TabsContent value="productivity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Productivity Metrics
              </CardTitle>
              <CardDescription>
                Key productivity indicators and their trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendData.productivityMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Zap className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{metric.metric}</h4>
                        <p className="text-sm text-muted-foreground">
                          Current: {metric.value}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                          {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          vs previous {trendData.period}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(metric.trend)}
                        {getTrendBadge(metric.trend)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
