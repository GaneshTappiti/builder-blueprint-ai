"use client";

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  TrendingUp,
  Award,
  Crown,
  Medal,
  Flame,
  Calendar,
  Users,
  BarChart3,
  CheckCircle,
  Lightbulb,
  User
} from 'lucide-react';
import { GamificationData, Badge as ProfileBadge, Streak, ProgressRing, Milestone } from '@/types/profile';

interface ProfileGamificationProps {
  userId?: string;
  className?: string;
}

export function ProfileGamification({ userId, className = '' }: ProfileGamificationProps) {
  const { profile } = useProfile();
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGamificationData();
  }, [userId]);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      // This would be implemented in ProfileService
      // const data = await ProfileService.getGamificationData(userId);
      // setGamificationData(data);
      
      // Mock data for now
      const mockData: GamificationData = {
        totalPoints: 2450,
        level: 8,
        badges: [
          {
            id: '1',
            name: 'Innovation Champion',
            description: 'Submitted 10+ innovative ideas',
            icon: '💡',
            earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            category: 'innovation',
            rarity: 'rare'
          } as ProfileBadge,
          {
            id: '2',
            name: 'Team Player',
            description: 'Collaborated on 20+ projects',
            icon: '🤝',
            earnedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            category: 'collaboration',
            rarity: 'common'
          } as ProfileBadge,
          {
            id: '3',
            name: 'Skill Master',
            description: 'Achieved expert level in 5+ skills',
            icon: '🎯',
            earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            category: 'learning',
            rarity: 'epic'
          } as ProfileBadge
        ],
        streaks: [
          {
            type: 'daily_login',
            current: 12,
            longest: 45,
            lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            type: 'task_completion',
            current: 8,
            longest: 20,
            lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          }
        ],
        progressRings: [
          {
            type: 'profile_completion',
            current: 85,
            target: 100,
            unit: 'percentage'
          },
          {
            type: 'skill_development',
            current: 12,
            target: 20,
            unit: 'count'
          },
          {
            type: 'collaboration',
            current: 75,
            target: 100,
            unit: 'percentage'
          }
        ],
        leaderboardPosition: 3,
        nextMilestone: {
          name: 'Level 9',
          description: 'Reach 3000 points to unlock Level 9',
          target: 3000,
          current: 2450,
          reward: 'New profile customization options',
          estimatedCompletion: '2 weeks'
        }
      };
      
      setGamificationData(mockData);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'uncommon': return 'bg-green-100 text-green-800 border-green-200';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStreakIcon = (type: string) => {
    switch (type) {
      case 'daily_login': return <Calendar className="h-4 w-4" />;
      case 'task_completion': return <CheckCircle className="h-4 w-4" />;
      case 'idea_submission': return <Lightbulb className="h-4 w-4" />;
      case 'collaboration': return <Users className="h-4 w-4" />;
      default: return <Flame className="h-4 w-4" />;
    }
  };

  const getProgressRingIcon = (type: string) => {
    switch (type) {
      case 'profile_completion': return <User className="h-4 w-4" />;
      case 'skill_development': return <TrendingUp className="h-4 w-4" />;
      case 'collaboration': return <Users className="h-4 w-4" />;
      case 'innovation': return <Lightbulb className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!gamificationData) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No gamification data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Achievements & Progress</h3>
          <p className="text-sm text-muted-foreground">
            Level {gamificationData.level} • {gamificationData.totalPoints} points
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Crown className="h-3 w-3" />
          #{gamificationData.leaderboardPosition} on leaderboard
        </Badge>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Level {gamificationData.level}</span>
              <span className="text-sm text-muted-foreground">
                {gamificationData.totalPoints} / {gamificationData.nextMilestone.target} points
              </span>
            </div>
            <Progress 
              value={(gamificationData.totalPoints / gamificationData.nextMilestone.target) * 100} 
              className="h-2"
            />
            <div className="text-xs text-muted-foreground">
              {gamificationData.nextMilestone.target - gamificationData.totalPoints} points to next level
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Rings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Progress Rings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gamificationData.progressRings.map((ring, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getProgressRingIcon(ring.type)}
                    <span className="text-sm font-medium capitalize">
                      {ring.type.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {ring.current} / {ring.target} {ring.unit === 'percentage' ? '%' : ''}
                  </span>
                </div>
                <Progress value={(ring.current / ring.target) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Streaks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Current Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gamificationData.streaks.map((streak, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStreakIcon(streak.type)}
                  <div>
                    <div className="text-sm font-medium capitalize">
                      {streak.type.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Best: {streak.longest} days
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-orange-600">
                    {streak.current}
                  </div>
                  <div className="text-xs text-muted-foreground">days</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Recent Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gamificationData.badges.map((badge) => (
              <div key={badge.id} className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{badge.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium truncate">{badge.name}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getRarityColor(badge.rarity)}`}
                      >
                        {badge.rarity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {badge.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {new Date(badge.earnedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Milestone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Next Milestone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium">{gamificationData.nextMilestone.name}</h4>
              <p className="text-sm text-muted-foreground">
                {gamificationData.nextMilestone.description}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>
                  {gamificationData.nextMilestone.current} / {gamificationData.nextMilestone.target}
                </span>
              </div>
              <Progress 
                value={(gamificationData.nextMilestone.current / gamificationData.nextMilestone.target) * 100} 
                className="h-2"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Reward:</span>
              <span className="font-medium">{gamificationData.nextMilestone.reward}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estimated completion:</span>
              <span className="font-medium">{gamificationData.nextMilestone.estimatedCompletion}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
