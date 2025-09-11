"use client";

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  TrendingUp, 
  TrendingDown,
  Users,
  Lightbulb,
  Award,
  AlertCircle,
  CheckCircle,
  Info,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react';
import { EngagementSentiment, SentimentPattern, SentimentRecommendation } from '@/types/profile';

interface ProfileEngagementSentimentProps {
  userId?: string;
  className?: string;
}

export function ProfileEngagementSentiment({ userId, className = '' }: ProfileEngagementSentimentProps) {
  const { profile } = useProfile();
  const [sentimentData, setSentimentData] = useState<EngagementSentiment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSentimentData();
  }, [userId]);

  const loadSentimentData = async () => {
    try {
      setLoading(true);
      // This would be implemented in ProfileService
      // const data = await ProfileService.getEngagementSentiment(userId);
      // setSentimentData(data);
      
      // Mock data for now
      const mockData: EngagementSentiment = {
        overallSentiment: 'positive',
        collaborationSentiment: 0.7,
        recognitionSentiment: 0.8,
        ideaAdoptionSentiment: 0.6,
        patterns: [
          {
            type: 'collaboration',
            pattern: 'High engagement during morning hours',
            frequency: 85,
            impact: 'positive'
          },
          {
            type: 'recognition',
            pattern: 'Peak recognition during project completions',
            frequency: 70,
            impact: 'positive'
          },
          {
            type: 'idea_adoption',
            pattern: 'Ideas get more traction when presented in team meetings',
            frequency: 60,
            impact: 'positive'
          },
          {
            type: 'collaboration',
            pattern: 'Lower engagement on Fridays',
            frequency: 45,
            impact: 'negative'
          }
        ],
        recommendations: [
          {
            area: 'Idea Presentation',
            issue: 'Ideas presented via email have lower adoption rates',
            recommendation: 'Present ideas in team meetings or use visual presentations',
            priority: 'medium'
          },
          {
            area: 'Friday Collaboration',
            issue: 'Engagement drops significantly on Fridays',
            recommendation: 'Schedule important collaborations earlier in the week',
            priority: 'low'
          },
          {
            area: 'Recognition Timing',
            issue: 'Recognition peaks are tied to project completions',
            recommendation: 'Seek feedback and recognition throughout project lifecycle',
            priority: 'high'
          }
        ]
      };
      
      setSentimentData(mockData);
    } catch (error) {
      console.error('Error loading sentiment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'neutral': return 'text-yellow-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <Badge className="bg-green-100 text-green-800">Positive</Badge>;
      case 'neutral': return <Badge className="bg-yellow-100 text-yellow-800">Neutral</Badge>;
      case 'negative': return <Badge className="bg-red-100 text-red-800">Negative</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'neutral': return <BarChart3 className="h-4 w-4 text-yellow-600" />;
      case 'negative': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSentimentScore = (score: number) => {
    if (score >= 0.7) return { label: 'High', color: 'text-green-600' };
    if (score >= 0.4) return { label: 'Medium', color: 'text-yellow-600' };
    return { label: 'Low', color: 'text-red-600' };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <TrendingUp className="h-4 w-4" />;
      case 'negative': return <TrendingDown className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!sentimentData) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Heart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No sentiment data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Engagement Sentiment</h3>
          <p className="text-sm text-muted-foreground">
            Analysis of your collaboration and recognition patterns
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getSentimentIcon(sentimentData.overallSentiment)}
          {getSentimentBadge(sentimentData.overallSentiment)}
        </div>
      </div>

      {/* Overall Sentiment Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Overall Engagement Health
          </CardTitle>
          <CardDescription>
            Your overall engagement sentiment across all interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getSentimentColor(sentimentData.overallSentiment)}`}>
                {sentimentData.overallSentiment.charAt(0).toUpperCase() + sentimentData.overallSentiment.slice(1)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Based on collaboration, recognition, and idea adoption patterns
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Sentiment Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Detailed Sentiment Breakdown
          </CardTitle>
          <CardDescription>
            Individual sentiment scores for different engagement areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Collaboration Sentiment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Collaboration Sentiment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${getSentimentScore(sentimentData.collaborationSentiment).color}`}>
                    {getSentimentScore(sentimentData.collaborationSentiment).label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(sentimentData.collaborationSentiment * 100)}%
                  </span>
                </div>
              </div>
              <Progress value={sentimentData.collaborationSentiment * 100} className="h-2" />
            </div>

            {/* Recognition Sentiment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span className="text-sm font-medium">Recognition Sentiment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${getSentimentScore(sentimentData.recognitionSentiment).color}`}>
                    {getSentimentScore(sentimentData.recognitionSentiment).label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(sentimentData.recognitionSentiment * 100)}%
                  </span>
                </div>
              </div>
              <Progress value={sentimentData.recognitionSentiment * 100} className="h-2" />
            </div>

            {/* Idea Adoption Sentiment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  <span className="text-sm font-medium">Idea Adoption Sentiment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${getSentimentScore(sentimentData.ideaAdoptionSentiment).color}`}>
                    {getSentimentScore(sentimentData.ideaAdoptionSentiment).label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(sentimentData.ideaAdoptionSentiment * 100)}%
                  </span>
                </div>
              </div>
              <Progress value={sentimentData.ideaAdoptionSentiment * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Engagement Patterns
          </CardTitle>
          <CardDescription>
            Identified patterns in your collaboration and recognition interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sentimentData.patterns.map((pattern, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 ${getImpactColor(pattern.impact)}`}>
                    {getImpactIcon(pattern.impact)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium capitalize">
                        {pattern.type.replace('_', ' ')} Pattern
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={`${getImpactColor(pattern.impact)}`}
                      >
                        {pattern.impact}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {pattern.pattern}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Frequency: {pattern.frequency}%</span>
                      <span>Impact: {pattern.impact}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Engagement Recommendations
          </CardTitle>
          <CardDescription>
            Suggestions to improve your engagement and collaboration effectiveness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sentimentData.recommendations.map((rec, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 ${getPriorityColor(rec.priority)}`}>
                    {getPriorityIcon(rec.priority)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{rec.area}</h4>
                      <Badge 
                        variant="outline" 
                        className={`${getPriorityColor(rec.priority)} capitalize`}
                      >
                        {rec.priority} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Issue:</strong> {rec.issue}
                    </p>
                    <p className="text-sm">
                      <strong>Recommendation:</strong> {rec.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
