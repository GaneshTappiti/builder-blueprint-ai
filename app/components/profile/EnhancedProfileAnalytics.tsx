"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Users,
  BarChart3,
  Activity,
  Target,
  Clock,
  Brain,
  Zap,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProfile } from '@/contexts/ProfileContext';

interface TimeBasedTrend {
  period: string;
  value: number;
  change: number;
  changePercent: number;
}

interface TeamCollaboration {
  userId: string;
  name: string;
  avatar?: string;
  collaborations: number;
  lastCollaboration: string;
  strength: 'strong' | 'moderate' | 'weak';
}

interface AnalyticsInsight {
  title: string;
  description: string;
  trend: 'up' | 'down' | 'stable';
  impact: 'high' | 'medium' | 'low';
  recommendation?: string;
}

export function EnhancedProfileAnalytics({ className = '' }: { className?: string }) {
  const { profile, analytics } = useProfile();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  // Simulated data - in real implementation, this would come from the analytics service
  const [timeBasedTrends, setTimeBasedTrends] = useState<Record<string, TimeBasedTrend[]>>({
    skills: [
      { period: 'Q1 2024', value: 5, change: 2, changePercent: 66.7 },
      { period: 'Q2 2024', value: 8, change: 3, changePercent: 60.0 },
      { period: 'Q3 2024', value: 12, change: 4, changePercent: 50.0 },
      { period: 'Q4 2024', value: 15, change: 3, changePercent: 25.0 },
    ],
    contributions: [
      { period: 'Q1 2024', value: 12, change: 0, changePercent: 0 },
      { period: 'Q2 2024', value: 18, change: 6, changePercent: 50.0 },
      { period: 'Q3 2024', value: 24, change: 6, changePercent: 33.3 },
      { period: 'Q4 2024', value: 31, change: 7, changePercent: 29.2 },
    ],
    collaborations: [
      { period: 'Q1 2024', value: 8, change: 0, changePercent: 0 },
      { period: 'Q2 2024', value: 15, change: 7, changePercent: 87.5 },
      { period: 'Q3 2024', value: 22, change: 7, changePercent: 46.7 },
      { period: 'Q4 2024', value: 28, change: 6, changePercent: 27.3 },
    ]
  });

  const [teamHeatmap, setTeamHeatmap] = useState<TeamCollaboration[]>([
    { userId: '1', name: 'Alice Johnson', collaborations: 15, lastCollaboration: '2024-01-10', strength: 'strong' },
    { userId: '2', name: 'Bob Smith', collaborations: 12, lastCollaboration: '2024-01-08', strength: 'strong' },
    { userId: '3', name: 'Carol White', collaborations: 8, lastCollaboration: '2024-01-05', strength: 'moderate' },
    { userId: '4', name: 'David Brown', collaborations: 5, lastCollaboration: '2024-01-03', strength: 'moderate' },
    { userId: '5', name: 'Eva Davis', collaborations: 3, lastCollaboration: '2024-01-01', strength: 'weak' },
  ]);

  const [insights, setInsights] = useState<AnalyticsInsight[]>([
    {
      title: 'Skill Growth Acceleration',
      description: 'Your skill acquisition rate has increased by 25% this quarter',
      trend: 'up',
      impact: 'high',
      recommendation: 'Consider pursuing advanced certifications in your top skills'
    },
    {
      title: 'Team Collaboration Peak',
      description: 'Your collaboration frequency is at an all-time high',
      trend: 'up',
      impact: 'medium',
      recommendation: 'Great momentum! Consider mentoring newer team members'
    },
    {
      title: 'Weekend Activity Pattern',
      description: 'Detected increased weekend activity - consider work-life balance',
      trend: 'stable',
      impact: 'medium',
      recommendation: 'Schedule some downtime to prevent burnout'
    }
  ]);

  useEffect(() => {
    // Simulate loading analytics data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeRange]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4 text-green-400" />;
      case 'down':
        return <ArrowDownRight className="h-4 w-4 text-red-400" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCollaborationStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'bg-green-500';
      case 'moderate':
        return 'bg-yellow-500';
      case 'weak':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderTrendChart = (data: TimeBasedTrend[], title: string, icon: React.ReactNode) => (
    <Card className="workspace-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.slice(-4).map((trend, index) => (
            <div key={trend.period} className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{trend.period}</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{trend.value}</span>
                {trend.change !== 0 && (
                  <div className={cn(
                    "flex items-center gap-1 text-xs px-2 py-1 rounded",
                    trend.change > 0 ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                  )}>
                    {trend.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(trend.changePercent).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Card className={cn("workspace-card", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin h-8 w-8 border-2 border-green-400 border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Enhanced Analytics</h2>
        <div className="flex gap-2">
          {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={timeRange === range ? "workspace-button" : "workspace-button-secondary"}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
          <TabsTrigger value="trends" className="text-gray-400 data-[state=active]:text-white">
            Time-Based Trends
          </TabsTrigger>
          <TabsTrigger value="collaboration" className="text-gray-400 data-[state=active]:text-white">
            Team Heatmap
          </TabsTrigger>
          <TabsTrigger value="insights" className="text-gray-400 data-[state=active]:text-white">
            AI Insights
          </TabsTrigger>
        </TabsList>

        {/* Time-Based Trends */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderTrendChart(timeBasedTrends.skills, 'Skills Added', <Brain className="h-5 w-5" />)}
            {renderTrendChart(timeBasedTrends.contributions, 'Contributions', <Target className="h-5 w-5" />)}
            {renderTrendChart(timeBasedTrends.collaborations, 'Collaborations', <Users className="h-5 w-5" />)}
          </div>

          {/* Performance Metrics Over Time */}
          <Card className="workspace-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Review Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">94%</div>
                  <div className="text-sm text-gray-400">Task Completion Rate</div>
                  <div className="text-xs text-green-400 mt-1">↑ 12% from last quarter</div>
                </div>
                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">4.8</div>
                  <div className="text-sm text-gray-400">Team Satisfaction</div>
                  <div className="text-xs text-blue-400 mt-1">↑ 0.3 from last quarter</div>
                </div>
                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">15</div>
                  <div className="text-sm text-gray-400">Skills Mastered</div>
                  <div className="text-xs text-purple-400 mt-1">↑ 3 this quarter</div>
                </div>
                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">28</div>
                  <div className="text-sm text-gray-400">Active Collaborations</div>
                  <div className="text-xs text-yellow-400 mt-1">↑ 6 this quarter</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Collaboration Heatmap */}
        <TabsContent value="collaboration" className="space-y-6">
          <Card className="workspace-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Collaboration Heatmap
              </CardTitle>
              <p className="text-gray-400 text-sm">
                Visualizes collaboration strength and frequency with team members
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamHeatmap.map((member) => (
                  <div key={member.userId} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        getCollaborationStrengthColor(member.strength)
                      )}></div>
                      <div>
                        <div className="text-white font-medium">{member.name}</div>
                        <div className="text-xs text-gray-400">
                          Last collaboration: {new Date(member.lastCollaboration).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{member.collaborations}</div>
                      <div className="text-xs text-gray-400">collaborations</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
                <div className="text-sm font-medium text-white mb-2">Collaboration Strength</div>
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-400">Strong (10+ collaborations)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-gray-400">Moderate (5-9 collaborations)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    <span className="text-gray-400">Weak (1-4 collaborations)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Collaboration Recommendations */}
          <Card className="workspace-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Collaboration Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <Star className="h-4 w-4 text-blue-400" />
                  <div>
                    <div className="text-white text-sm font-medium">
                      Consider reaching out to Sarah Chen
                    </div>
                    <div className="text-gray-400 text-xs">
                      Similar skills in React and TypeScript - potential collaboration synergy
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <Star className="h-4 w-4 text-green-400" />
                  <div>
                    <div className="text-white text-sm font-medium">
                      Strengthen partnership with Alice Johnson
                    </div>
                    <div className="text-gray-400 text-xs">
                      High collaboration frequency - consider joint project leadership
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI-Powered Insights */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.map((insight, index) => (
              <Card key={index} className="workspace-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    {getTrendIcon(insight.trend)}
                    {insight.title}
                  </CardTitle>
                  <Badge variant={insight.impact === 'high' ? 'default' : 'secondary'} className="w-fit">
                    {insight.impact} impact
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-3">{insight.description}</p>
                  {insight.recommendation && (
                    <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <div className="text-green-400 text-xs font-medium mb-1">💡 Recommendation</div>
                      <div className="text-green-200 text-sm">{insight.recommendation}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Predictive Analytics */}
          <Card className="workspace-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Predictive Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                  <div className="text-lg font-bold text-purple-400">Next Quarter</div>
                  <div className="text-sm text-gray-400 mt-1">Projected to gain 4-6 new skills</div>
                  <div className="text-xs text-purple-300 mt-2">Based on current learning velocity</div>
                </div>
                <div className="text-center p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <div className="text-lg font-bold text-blue-400">Performance</div>
                  <div className="text-sm text-gray-400 mt-1">Likely to exceed targets by 15%</div>
                  <div className="text-xs text-blue-300 mt-2">Confidence: 87%</div>
                </div>
                <div className="text-center p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <div className="text-lg font-bold text-green-400">Team Impact</div>
                  <div className="text-sm text-gray-400 mt-1">High influence potential</div>
                  <div className="text-xs text-green-300 mt-2">Consider leadership opportunities</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default EnhancedProfileAnalytics;