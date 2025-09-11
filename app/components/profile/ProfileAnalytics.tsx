"use client";

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Activity,
  Target,
  Award,
  Users,
  Lightbulb,
  CheckSquare,
  Clock,
  Star,
  Zap,
  Brain,
  Heart
} from 'lucide-react';

interface ProfileAnalyticsProps {
  className?: string;
}

interface AnalyticsData {
  productivity: {
    score: number;
    trend: 'up' | 'down' | 'stable';
    weeklyAverage: number;
    monthlyAverage: number;
    peakHours: number[];
    peakDays: number[];
  };
  collaboration: {
    score: number;
    trend: 'up' | 'down' | 'stable';
    teamInteractions: number;
    crossDepartmentWork: number;
    mentoringSessions: number;
    feedbackGiven: number;
    feedbackReceived: number;
  };
  innovation: {
    score: number;
    trend: 'up' | 'down' | 'stable';
    ideasSubmitted: number;
    ideasImplemented: number;
    patentsFiled: number;
    processImprovements: number;
    creativeSolutions: number;
  };
  leadership: {
    score: number;
    trend: 'up' | 'down' | 'stable';
    projectsLed: number;
    teamMembersMentored: number;
    decisionsMade: number;
    conflictsResolved: number;
    strategicContributions: number;
  };
  learning: {
    score: number;
    trend: 'up' | 'down' | 'stable';
    skillsLearned: number;
    certificationsEarned: number;
    coursesCompleted: number;
    booksRead: number;
    trainingHours: number;
  };
  wellbeing: {
    score: number;
    trend: 'up' | 'down' | 'stable';
    workLifeBalance: number;
    stressLevel: number;
    satisfactionScore: number;
    energyLevel: number;
    motivationScore: number;
  };
  teamRankings: {
    overall: number;
    productivity: number;
    collaboration: number;
    innovation: number;
    leadership: number;
    totalTeamMembers: number;
  };
  recommendations: {
    skillDevelopment: string[];
    collaboration: string[];
    careerGrowth: string[];
    wellbeing: string[];
  };
}

export function ProfileAnalytics({ className = '' }: ProfileAnalyticsProps) {
  const { profile, analytics } = useProfile();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in a real app, this would come from the analytics service
  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data based on profile
        const mockData: AnalyticsData = {
          productivity: {
            score: 85,
            trend: 'up',
            weeklyAverage: 42,
            monthlyAverage: 168,
            peakHours: [9, 10, 14, 15],
            peakDays: [1, 2, 3, 4, 5]
          },
          collaboration: {
            score: 78,
            trend: 'stable',
            teamInteractions: 156,
            crossDepartmentWork: 23,
            mentoringSessions: 8,
            feedbackGiven: 45,
            feedbackReceived: 32
          },
          innovation: {
            score: 92,
            trend: 'up',
            ideasSubmitted: 12,
            ideasImplemented: 3,
            patentsFiled: 1,
            processImprovements: 7,
            creativeSolutions: 15
          },
          leadership: {
            score: 73,
            trend: 'up',
            projectsLed: 4,
            teamMembersMentored: 3,
            decisionsMade: 28,
            conflictsResolved: 5,
            strategicContributions: 12
          },
          learning: {
            score: 88,
            trend: 'up',
            skillsLearned: 6,
            certificationsEarned: 2,
            coursesCompleted: 4,
            booksRead: 8,
            trainingHours: 32
          },
          wellbeing: {
            score: 76,
            trend: 'stable',
            workLifeBalance: 8,
            stressLevel: 3,
            satisfactionScore: 9,
            energyLevel: 7,
            motivationScore: 8
          },
          teamRankings: {
            overall: 3,
            productivity: 2,
            collaboration: 4,
            innovation: 1,
            leadership: 5,
            totalTeamMembers: 12
          },
          recommendations: {
            skillDevelopment: [
              'Consider learning React Native for mobile development',
              'Advanced project management certification would benefit your career',
              'Data analysis skills are in high demand in your field'
            ],
            collaboration: [
              'Increase cross-department collaboration opportunities',
              'Consider mentoring junior team members',
              'Participate more in team brainstorming sessions'
            ],
            careerGrowth: [
              'Apply for senior developer position',
              'Lead a major project to demonstrate leadership skills',
              'Build a portfolio of successful project deliveries'
            ],
            wellbeing: [
              'Take regular breaks during long work sessions',
              'Consider flexible working hours for better work-life balance',
              'Engage in team building activities to reduce stress'
            ]
          }
        };
        
        setAnalyticsData(mockData);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [profile]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No analytics data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-blue-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'productivity': return <Zap className="h-5 w-5" />;
      case 'collaboration': return <Users className="h-5 w-5" />;
      case 'innovation': return <Lightbulb className="h-5 w-5" />;
      case 'leadership': return <Award className="h-5 w-5" />;
      case 'learning': return <Brain className="h-5 w-5" />;
      case 'wellbeing': return <Heart className="h-5 w-5" />;
      default: return <BarChart3 className="h-5 w-5" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(analyticsData).slice(0, 6).map(([category, data]) => (
          <Card key={category}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(category)}
                  <span className="font-medium capitalize">{category}</span>
                </div>
                {getTrendIcon(data.trend)}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-2xl font-bold ${getScoreColor(data.score)}`}>
                  {data.score}
                </span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
              <div className="mt-2">
                <Progress value={data.score} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Team Rankings
          </CardTitle>
          <CardDescription>
            Your position within the team across different metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                #{analyticsData.teamRankings.overall}
              </p>
              <p className="text-sm text-muted-foreground">Overall</p>
              <p className="text-xs text-muted-foreground">
                of {analyticsData.teamRankings.totalTeamMembers}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                #{analyticsData.teamRankings.productivity}
              </p>
              <p className="text-sm text-muted-foreground">Productivity</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                #{analyticsData.teamRankings.innovation}
              </p>
              <p className="text-sm text-muted-foreground">Innovation</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">
                #{analyticsData.teamRankings.leadership}
              </p>
              <p className="text-sm text-muted-foreground">Leadership</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Productivity Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Productivity Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Weekly Average</span>
                    <span className="font-medium">{analyticsData.productivity.weeklyAverage} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Average</span>
                    <span className="font-medium">{analyticsData.productivity.monthlyAverage} hours</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Peak Hours</p>
                    <div className="flex flex-wrap gap-1">
                      {analyticsData.productivity.peakHours.map(hour => (
                        <Badge key={hour} variant="outline" className="text-xs">
                          {hour}:00
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Collaboration Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Collaboration Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Team Interactions</span>
                    <span className="font-medium">{analyticsData.collaboration.teamInteractions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cross-Department Work</span>
                    <span className="font-medium">{analyticsData.collaboration.crossDepartmentWork}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Mentoring Sessions</span>
                    <span className="font-medium">{analyticsData.collaboration.mentoringSessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Feedback Given</span>
                    <span className="font-medium">{analyticsData.collaboration.feedbackGiven}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Detailed Metrics Tab */}
        <TabsContent value="detailed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Innovation Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Innovation Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Ideas Submitted</span>
                    <span className="font-medium">{analyticsData.innovation.ideasSubmitted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Ideas Implemented</span>
                    <span className="font-medium">{analyticsData.innovation.ideasImplemented}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Patents Filed</span>
                    <span className="font-medium">{analyticsData.innovation.patentsFiled}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Process Improvements</span>
                    <span className="font-medium">{analyticsData.innovation.processImprovements}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Learning Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Skills Learned</span>
                    <span className="font-medium">{analyticsData.learning.skillsLearned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Certifications Earned</span>
                    <span className="font-medium">{analyticsData.learning.certificationsEarned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Courses Completed</span>
                    <span className="font-medium">{analyticsData.learning.coursesCompleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Training Hours</span>
                    <span className="font-medium">{analyticsData.learning.trainingHours}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Skill Development */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Skill Development
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.recommendations.skillDevelopment.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Career Growth */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Career Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.recommendations.careerGrowth.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Collaboration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.recommendations.collaboration.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Users className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Wellbeing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Wellbeing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.recommendations.wellbeing.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Heart className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProfileAnalytics;
