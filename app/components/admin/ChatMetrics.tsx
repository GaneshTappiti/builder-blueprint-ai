"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Activity,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Download,
  Settings,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ChatMetrics {
  activeUsers: number;
  totalMessages: number;
  messagesPerMinute: number;
  averageResponseTime: number;
  channelCount: number;
  errorRate: number;
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
}

interface ChannelMetrics {
  id: string;
  name: string;
  messageCount: number;
  activeUsers: number;
  lastActivity: string;
  growthRate: number;
}

interface UserActivity {
  id: string;
  name: string;
  messageCount: number;
  lastSeen: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  responseTime: number;
}

interface TimeSeriesData {
  timestamp: string;
  value: number;
  label: string;
}

export function ChatMetrics() {
  const [metrics, setMetrics] = useState<ChatMetrics>({
    activeUsers: 0,
    totalMessages: 0,
    messagesPerMinute: 0,
    averageResponseTime: 0,
    channelCount: 0,
    errorRate: 0,
    uptime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    networkLatency: 0
  });

  const [channelMetrics, setChannelMetrics] = useState<ChannelMetrics[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [messageTrends, setMessageTrends] = useState<TimeSeriesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Mock data - in production, this would come from your monitoring service
  const fetchMetrics = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data
    setMetrics({
      activeUsers: Math.floor(Math.random() * 50) + 20,
      totalMessages: Math.floor(Math.random() * 10000) + 5000,
      messagesPerMinute: Math.floor(Math.random() * 20) + 5,
      averageResponseTime: Math.floor(Math.random() * 500) + 200,
      channelCount: Math.floor(Math.random() * 20) + 10,
      errorRate: Math.random() * 2,
      uptime: 99.9,
      memoryUsage: Math.random() * 30 + 40,
      cpuUsage: Math.random() * 20 + 10,
      networkLatency: Math.floor(Math.random() * 50) + 20
    });

    setChannelMetrics([
      {
        id: '1',
        name: 'general',
        messageCount: Math.floor(Math.random() * 1000) + 500,
        activeUsers: Math.floor(Math.random() * 20) + 10,
        lastActivity: new Date().toISOString(),
        growthRate: Math.random() * 20 - 10
      },
      {
        id: '2',
        name: 'development',
        messageCount: Math.floor(Math.random() * 800) + 300,
        activeUsers: Math.floor(Math.random() * 15) + 5,
        lastActivity: new Date().toISOString(),
        growthRate: Math.random() * 15 - 5
      },
      {
        id: '3',
        name: 'design',
        messageCount: Math.floor(Math.random() * 600) + 200,
        activeUsers: Math.floor(Math.random() * 10) + 3,
        lastActivity: new Date().toISOString(),
        growthRate: Math.random() * 25 - 5
      }
    ]);

    setUserActivity([
      {
        id: '1',
        name: 'John Doe',
        messageCount: Math.floor(Math.random() * 100) + 50,
        lastSeen: new Date().toISOString(),
        status: 'online',
        responseTime: Math.floor(Math.random() * 300) + 100
      },
      {
        id: '2',
        name: 'Jane Smith',
        messageCount: Math.floor(Math.random() * 80) + 30,
        lastSeen: new Date().toISOString(),
        status: 'away',
        responseTime: Math.floor(Math.random() * 500) + 200
      },
      {
        id: '3',
        name: 'Mike Johnson',
        messageCount: Math.floor(Math.random() * 60) + 20,
        lastSeen: new Date().toISOString(),
        status: 'busy',
        responseTime: Math.floor(Math.random() * 400) + 150
      }
    ]);

    // Generate mock time series data
    const trends: TimeSeriesData[] = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      trends.push({
        timestamp: timestamp.toISOString(),
        value: Math.floor(Math.random() * 50) + 10,
        label: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
    setMessageTrends(trends);

    setIsLoading(false);
  };

  useEffect(() => {
    fetchMetrics();
    
    const interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthStatus = () => {
    if (metrics.errorRate > 1) return { status: 'error', color: 'text-red-400' };
    if (metrics.errorRate > 0.5) return { status: 'warning', color: 'text-yellow-400' };
    return { status: 'healthy', color: 'text-green-400' };
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Chat Metrics</h2>
          <p className="text-gray-400">Real-time performance monitoring</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={fetchMetrics}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Users"
          value={metrics.activeUsers}
          icon={<Users className="h-5 w-5" />}
          trend={12.5}
          isLoading={isLoading}
        />
        <MetricCard
          title="Messages/min"
          value={metrics.messagesPerMinute}
          icon={<MessageSquare className="h-5 w-5" />}
          trend={-2.3}
          isLoading={isLoading}
        />
        <MetricCard
          title="Avg Response"
          value={`${metrics.averageResponseTime}ms`}
          icon={<Clock className="h-5 w-5" />}
          trend={-8.1}
          isLoading={isLoading}
        />
        <MetricCard
          title="Error Rate"
          value={`${metrics.errorRate.toFixed(2)}%`}
          icon={<AlertCircle className="h-5 w-5" />}
          trend={-15.2}
          isLoading={isLoading}
          status={healthStatus.status}
        />
      </div>

      {/* System Health */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Uptime</span>
                <Badge variant="secondary" className="bg-green-900 text-green-400">
                  {metrics.uptime}%
                </Badge>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${metrics.uptime}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Memory Usage</span>
                <span className="text-sm text-gray-300">{metrics.memoryUsage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full",
                    metrics.memoryUsage > 80 ? "bg-red-500" : 
                    metrics.memoryUsage > 60 ? "bg-yellow-500" : "bg-green-500"
                  )}
                  style={{ width: `${metrics.memoryUsage}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">CPU Usage</span>
                <span className="text-sm text-gray-300">{metrics.cpuUsage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full",
                    metrics.cpuUsage > 80 ? "bg-red-500" : 
                    metrics.cpuUsage > 60 ? "bg-yellow-500" : "bg-green-500"
                  )}
                  style={{ width: `${metrics.cpuUsage}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      <Tabs defaultValue="channels" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="channels" className="data-[state=active]:bg-gray-700">
            <BarChart3 className="h-4 w-4 mr-2" />
            Channels
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-gray-700">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-gray-700">
            <LineChart className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="channels">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Channel Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channelMetrics.map((channel) => (
                  <div key={channel.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">#</span>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{channel.name}</h4>
                        <p className="text-gray-400 text-sm">
                          {channel.activeUsers} active users
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{channel.messageCount}</p>
                      <p className="text-gray-400 text-sm">messages</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={cn(
                        "text-sm font-medium",
                        channel.growthRate > 0 ? "text-green-400" : "text-red-400"
                      )}>
                        {channel.growthRate > 0 ? '+' : ''}{channel.growthRate.toFixed(1)}%
                      </span>
                      {channel.growthRate > 0 ? 
                        <TrendingUp className="h-4 w-4 text-green-400" /> : 
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      }
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">User Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userActivity.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className={cn(
                          "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-800",
                          getStatusColor(user.status)
                        )} />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{user.name}</h4>
                        <p className="text-gray-400 text-sm">
                          Last seen {new Date(user.lastSeen).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{user.messageCount}</p>
                      <p className="text-gray-400 text-sm">messages</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{user.responseTime}ms</p>
                      <p className="text-gray-400 text-sm">avg response</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Message Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end space-x-1">
                {messageTrends.map((data, index) => (
                  <div
                    key={index}
                    className="bg-blue-500 rounded-t flex-1 min-h-0"
                    style={{ height: `${(data.value / 60) * 100}%` }}
                    title={`${data.label}: ${data.value} messages`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>24h ago</span>
                <span>Now</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  status?: string;
  isLoading?: boolean;
}

function MetricCard({ title, value, icon, trend, status, isLoading }: MetricCardProps) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-white">
              {isLoading ? '...' : value}
            </p>
            {trend !== undefined && !isLoading && (
              <div className="flex items-center mt-1">
                {trend > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400 mr-1" />
                )}
                <span className={cn(
                  "text-xs font-medium",
                  trend > 0 ? "text-green-400" : "text-red-400"
                )}>
                  {Math.abs(trend)}%
                </span>
              </div>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-full",
            status === 'error' ? "bg-red-900/20 text-red-400" :
            status === 'warning' ? "bg-yellow-900/20 text-yellow-400" :
            "bg-blue-900/20 text-blue-400"
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
