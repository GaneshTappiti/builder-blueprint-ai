"use client";

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Archive, 
  Star,
  MessageSquare,
  ThumbsUp,
  Eye,
  BarChart3,
  Target,
  Users
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface IdeaVaultProfileIntegrationProps {
  className?: string;
}

interface IdeaStats {
  totalIdeas: number;
  ideasByStatus: {
    draft: number;
    validated: number;
    exploring: number;
    archived: number;
  };
  ideasByCategory: Record<string, number>;
  totalVotes: number;
  totalComments: number;
  averageValidationScore: number;
  topPerformingIdeas: Array<{
    id: string;
    title: string;
    votes: number;
    validationScore: number;
    status: string;
  }>;
  recentIdeas: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
    votes: number;
  }>;
}

export function IdeaVaultProfileIntegration({ className = '' }: IdeaVaultProfileIntegrationProps) {
  const { profile } = useProfile();
  const [ideaStats, setIdeaStats] = useState<IdeaStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - in a real app, this would come from the idea vault service
  useEffect(() => {
    const loadIdeaStats = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data based on profile
        const mockStats: IdeaStats = {
          totalIdeas: 12,
          ideasByStatus: {
            draft: 3,
            validated: 5,
            exploring: 3,
            archived: 1
          },
          ideasByCategory: {
            'Technology': 4,
            'Business': 3,
            'Product': 3,
            'Marketing': 2
          },
          totalVotes: 47,
          totalComments: 23,
          averageValidationScore: 78,
          topPerformingIdeas: [
            {
              id: '1',
              title: 'AI-Powered Customer Support Chatbot',
              votes: 15,
              validationScore: 92,
              status: 'validated'
            },
            {
              id: '2',
              title: 'Mobile App for Remote Team Collaboration',
              votes: 12,
              validationScore: 85,
              status: 'exploring'
            },
            {
              id: '3',
              title: 'Blockchain-based Supply Chain Tracking',
              votes: 8,
              validationScore: 76,
              status: 'validated'
            }
          ],
          recentIdeas: [
            {
              id: '4',
              title: 'Voice-Activated Home Automation System',
              status: 'draft',
              createdAt: new Date().toISOString(),
              votes: 0
            },
            {
              id: '5',
              title: 'Sustainable Packaging Solution',
              status: 'validated',
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              votes: 5
            },
            {
              id: '6',
              title: 'AR-Based Learning Platform',
              status: 'exploring',
              createdAt: new Date(Date.now() - 172800000).toISOString(),
              votes: 3
            }
          ]
        };
        
        setIdeaStats(mockStats);
      } catch (error) {
        console.error('Error loading idea stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIdeaStats();
  }, [profile]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Loading idea statistics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!ideaStats) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No idea statistics available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'exploring': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'draft': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'archived': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validated': return <CheckCircle className="h-3 w-3" />;
      case 'exploring': return <Clock className="h-3 w-3" />;
      case 'draft': return <Clock className="h-3 w-3" />;
      case 'archived': return <Archive className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Idea Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            Idea Vault Overview
          </CardTitle>
          <CardDescription>
            Your contribution to the team's idea generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{ideaStats.totalIdeas}</p>
              <p className="text-sm text-muted-foreground">Total Ideas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{ideaStats.totalVotes}</p>
              <p className="text-sm text-muted-foreground">Total Votes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{ideaStats.totalComments}</p>
              <p className="text-sm text-muted-foreground">Comments</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{ideaStats.averageValidationScore}%</p>
              <p className="text-sm text-muted-foreground">Avg. Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ideas by Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Ideas by Status
          </CardTitle>
          <CardDescription>
            Distribution of your ideas across different stages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(ideaStats.ideasByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status)}
                  <span className="capitalize font-medium">{status}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(count / ideaStats.totalIdeas) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ideas by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Ideas by Category
          </CardTitle>
          <CardDescription>
            Your ideas organized by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(ideaStats.ideasByCategory).map(([category, count]) => (
              <Badge key={category} variant="outline" className="flex items-center space-x-1">
                <span>{category}</span>
                <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs">
                  {count}
                </span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Ideas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Top Performing Ideas
          </CardTitle>
          <CardDescription>
            Your most successful ideas by votes and validation score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ideaStats.topPerformingIdeas.map((idea, index) => (
              <div key={idea.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                    <h4 className="font-medium truncate">{idea.title}</h4>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{idea.votes} votes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BarChart3 className="h-3 w-3" />
                      <span>{idea.validationScore}% score</span>
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(idea.status)}>
                  {getStatusIcon(idea.status)}
                  <span className="ml-1 capitalize">{idea.status}</span>
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Ideas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Ideas
          </CardTitle>
          <CardDescription>
            Your latest idea submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ideaStats.recentIdeas.map((idea) => (
              <div key={idea.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium truncate">{idea.title}</h4>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                    <span>
                      {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
                    </span>
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{idea.votes} votes</span>
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(idea.status)}>
                  {getStatusIcon(idea.status)}
                  <span className="ml-1 capitalize">{idea.status}</span>
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
            Common actions for idea management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="justify-start">
              <Lightbulb className="h-4 w-4 mr-2" />
              New Idea
            </Button>
            <Button variant="outline" className="justify-start">
              <Eye className="h-4 w-4 mr-2" />
              View All Ideas
            </Button>
            <Button variant="outline" className="justify-start">
              <MessageSquare className="h-4 w-4 mr-2" />
              Comment on Ideas
            </Button>
            <Button variant="outline" className="justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default IdeaVaultProfileIntegration;
