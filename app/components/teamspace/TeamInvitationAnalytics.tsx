"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  RefreshCw,
  Download,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InvitationAnalytics {
  totalInvitations: number;
  pendingInvitations: number;
  acceptedInvitations: number;
  declinedInvitations: number;
  expiredInvitations: number;
  acceptanceRate: number;
  averageResponseTime: number;
}

interface TeamInvitationAnalyticsProps {
  teamId: string;
  className?: string;
}

const TeamInvitationAnalytics: React.FC<TeamInvitationAnalyticsProps> = ({
  teamId,
  className = ''
}) => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<InvitationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/team-invitations/analytics?teamId=${teamId}`);
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        throw new Error(data.error || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invitation analytics. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [teamId]);

  const handleRefresh = () => {
    fetchAnalytics();
  };

  const handleExport = () => {
    if (!analytics) return;

    const csvContent = `Metric,Value
Total Invitations,${analytics.totalInvitations}
Pending Invitations,${analytics.pendingInvitations}
Accepted Invitations,${analytics.acceptedInvitations}
Declined Invitations,${analytics.declinedInvitations}
Expired Invitations,${analytics.expiredInvitations}
Acceptance Rate,${analytics.acceptanceRate.toFixed(2)}%
Average Response Time,${analytics.averageResponseTime} hours`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-invitation-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card className={`workspace-card ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-green-400" />
            <span className="ml-2 text-gray-400">Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card className={`workspace-card ${className}`}>
        <CardContent className="p-6 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Analytics Available</h3>
          <p className="text-gray-400 mb-4">
            No invitation data available for this team yet.
          </p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-400 bg-green-600/20';
      case 'pending': return 'text-yellow-400 bg-yellow-600/20';
      case 'declined': return 'text-red-400 bg-red-600/20';
      case 'expired': return 'text-gray-400 bg-gray-600/20';
      default: return 'text-gray-400 bg-gray-600/20';
    }
  };

  const getAcceptanceRateColor = (rate: number) => {
    if (rate >= 70) return 'text-green-400';
    if (rate >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="workspace-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="h-5 w-5 text-green-400" />
              Invitation Analytics
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="workspace-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Invitations</p>
                <p className="text-2xl font-bold text-white">{analytics.totalInvitations}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="workspace-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Acceptance Rate</p>
                <p className={`text-2xl font-bold ${getAcceptanceRateColor(analytics.acceptanceRate)}`}>
                  {analytics.acceptanceRate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
            <div className="mt-2">
              <Progress 
                value={analytics.acceptanceRate} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="workspace-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Response Time</p>
                <p className="text-2xl font-bold text-white">{analytics.averageResponseTime}h</p>
              </div>
              <Clock className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="workspace-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{analytics.pendingInvitations}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="workspace-card">
          <CardHeader>
            <CardTitle className="text-lg">Invitation Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-white">Accepted</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor('accepted')}>
                  {analytics.acceptedInvitations}
                </Badge>
                <span className="text-sm text-gray-400">
                  {analytics.totalInvitations > 0 
                    ? ((analytics.acceptedInvitations / analytics.totalInvitations) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-400" />
                <span className="text-white">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor('pending')}>
                  {analytics.pendingInvitations}
                </Badge>
                <span className="text-sm text-gray-400">
                  {analytics.totalInvitations > 0 
                    ? ((analytics.pendingInvitations / analytics.totalInvitations) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-red-400" />
                <span className="text-white">Declined</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor('declined')}>
                  {analytics.declinedInvitations}
                </Badge>
                <span className="text-sm text-gray-400">
                  {analytics.totalInvitations > 0 
                    ? ((analytics.declinedInvitations / analytics.totalInvitations) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className="text-white">Expired</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor('expired')}>
                  {analytics.expiredInvitations}
                </Badge>
                <span className="text-sm text-gray-400">
                  {analytics.totalInvitations > 0 
                    ? ((analytics.expiredInvitations / analytics.totalInvitations) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="workspace-card">
          <CardHeader>
            <CardTitle className="text-lg">Performance Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Acceptance Rate</span>
                  <span className="text-white">{analytics.acceptanceRate.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={analytics.acceptanceRate} 
                  className="h-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.acceptanceRate >= 70 
                    ? 'Excellent! Your team invitations are highly effective.'
                    : analytics.acceptanceRate >= 50
                    ? 'Good acceptance rate. Consider improving invitation messaging.'
                    : 'Low acceptance rate. Review your invitation strategy.'
                  }
                </p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Response Time</span>
                  <span className="text-white">{analytics.averageResponseTime}h</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      analytics.averageResponseTime <= 24 
                        ? 'bg-green-500' 
                        : analytics.averageResponseTime <= 72
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min((analytics.averageResponseTime / 168) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.averageResponseTime <= 24 
                    ? 'Fast responses! People are engaging quickly.'
                    : analytics.averageResponseTime <= 72
                    ? 'Moderate response time. Consider follow-up reminders.'
                    : 'Slow responses. Review invitation timing and content.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamInvitationAnalytics;
