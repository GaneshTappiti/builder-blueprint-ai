"use client";

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Target,
  Users,
  Building,
  Globe,
  Award,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { BenchmarkingData, BenchmarkingRecommendation } from '@/types/profile';

interface ProfileBenchmarkingProps {
  userId?: string;
  className?: string;
}

export function ProfileBenchmarking({ userId, className = '' }: ProfileBenchmarkingProps) {
  const { profile } = useProfile();
  const [benchmarkingData, setBenchmarkingData] = useState<BenchmarkingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBenchmarkingData();
  }, [userId]);

  const loadBenchmarkingData = async () => {
    try {
      setLoading(true);
      // This would be implemented in ProfileService
      // const data = await ProfileService.getBenchmarkingData(userId);
      // setBenchmarkingData(data);
      
      // Mock data for now
      const mockData: BenchmarkingData = {
        teamAverage: {
          'Tasks Completed': 35,
          'Ideas Submitted': 6,
          'Collaboration Score': 7.2,
          'Skill Development': 3.1,
          'Meeting Participation': 85
        },
        departmentAverage: {
          'Tasks Completed': 42,
          'Ideas Submitted': 8,
          'Collaboration Score': 7.8,
          'Skill Development': 3.5,
          'Meeting Participation': 90
        },
        companyAverage: {
          'Tasks Completed': 38,
          'Ideas Submitted': 7,
          'Collaboration Score': 7.5,
          'Skill Development': 3.3,
          'Meeting Participation': 88
        },
        industryAverage: {
          'Tasks Completed': 40,
          'Ideas Submitted': 9,
          'Collaboration Score': 7.6,
          'Skill Development': 3.4,
          'Meeting Participation': 87
        },
        percentileRankings: {
          'Tasks Completed': 75,
          'Ideas Submitted': 60,
          'Collaboration Score': 80,
          'Skill Development': 65,
          'Meeting Participation': 70
        },
        recommendations: [
          {
            area: 'Ideas Submitted',
            currentValue: 8,
            benchmarkValue: 9,
            gap: 1,
            recommendation: 'Consider submitting more innovative ideas to reach industry average',
            priority: 'medium'
          },
          {
            area: 'Skill Development',
            currentValue: 3.1,
            benchmarkValue: 3.4,
            gap: 0.3,
            recommendation: 'Focus on continuous learning to improve skill development score',
            priority: 'high'
          },
          {
            area: 'Meeting Participation',
            currentValue: 85,
            benchmarkValue: 88,
            gap: 3,
            recommendation: 'Increase meeting participation to align with company standards',
            priority: 'low'
          }
        ]
      };
      
      setBenchmarkingData(mockData);
    } catch (error) {
      console.error('Error loading benchmarking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 90) return 'text-green-600';
    if (percentile >= 75) return 'text-blue-600';
    if (percentile >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPercentileBadge = (percentile: number) => {
    if (percentile >= 90) return <Badge className="bg-green-100 text-green-800">Top 10%</Badge>;
    if (percentile >= 75) return <Badge className="bg-blue-100 text-blue-800">Top 25%</Badge>;
    if (percentile >= 50) return <Badge className="bg-yellow-100 text-yellow-800">Above Average</Badge>;
    return <Badge className="bg-red-100 text-red-800">Below Average</Badge>;
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

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!benchmarkingData) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No benchmarking data available</p>
        </div>
      </div>
    );
  }

  const metrics = Object.keys(benchmarkingData.teamAverage);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Performance Benchmarking</h3>
          <p className="text-sm text-muted-foreground">
            Compare your performance against team, department, and industry averages
          </p>
        </div>
      </div>

      {/* Percentile Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Your Percentile Rankings
          </CardTitle>
          <CardDescription>
            How you rank compared to your peers across different metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <div key={metric} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">{metric}</h4>
                  {getPercentileBadge(benchmarkingData.percentileRankings[metric])}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Percentile</span>
                    <span className={`font-medium ${getPercentileColor(benchmarkingData.percentileRankings[metric])}`}>
                      {benchmarkingData.percentileRankings[metric]}th
                    </span>
                  </div>
                  <Progress 
                    value={benchmarkingData.percentileRankings[metric]} 
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Comparison
          </CardTitle>
          <CardDescription>
            Your performance vs team, department, company, and industry averages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {metrics.map((metric) => (
              <div key={metric} className="space-y-3">
                <h4 className="text-sm font-medium">{metric}</h4>
                <div className="space-y-2">
                  {/* Your Performance */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="text-sm">You</span>
                    </div>
                    <span className="text-sm font-medium">
                      {benchmarkingData.teamAverage[metric]}
                    </span>
                  </div>
                  
                  {/* Team Average */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Team Average</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {benchmarkingData.teamAverage[metric]}
                    </span>
                  </div>
                  
                  {/* Department Average */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Department Average</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {benchmarkingData.departmentAverage[metric]}
                    </span>
                  </div>
                  
                  {/* Company Average */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Company Average</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {benchmarkingData.companyAverage[metric]}
                    </span>
                  </div>
                  
                  {/* Industry Average */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Industry Average</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {benchmarkingData.industryAverage[metric]}
                    </span>
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
            Improvement Recommendations
          </CardTitle>
          <CardDescription>
            Areas where you can improve to meet or exceed benchmarks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {benchmarkingData.recommendations.map((rec, index) => (
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
                    <p className="text-sm text-muted-foreground mb-3">
                      {rec.recommendation}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Current: {rec.currentValue}</span>
                      <span>Target: {rec.benchmarkValue}</span>
                      <span>Gap: {rec.gap}</span>
                    </div>
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
