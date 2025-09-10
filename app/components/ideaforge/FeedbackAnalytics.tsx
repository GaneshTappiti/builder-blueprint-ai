"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  Heart, 
  Smile, 
  Meh, 
  ThumbsDown, 
  Angry, 
  TrendingUp, 
  MessageSquare, 
  Users,
  BarChart3,
  Target,
  Clock
} from "lucide-react";
import { FeedbackItem } from "@/utils/ideaforge-persistence";
import { cn } from "@/lib/utils";

interface FeedbackAnalyticsProps {
  feedback: FeedbackItem[];
  ideaTitle: string;
}

interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

interface EmojiDistribution {
  emoji: '❤️' | '😊' | '😐' | '👎' | '😡';
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export const FeedbackAnalytics: React.FC<FeedbackAnalyticsProps> = ({
  feedback,
  ideaTitle
}) => {
  // Calculate overall stats
  const totalFeedback = feedback.length;
  const totalReplies = feedback.reduce((sum, item) => sum + (item.replies?.length || 0), 0);
  const totalLikes = feedback.reduce((sum, item) => sum + item.likes, 0);
  
  // Calculate average rating
  const ratings = feedback.filter(f => f.rating && f.rating > 0).map(f => f.rating!);
  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
    : 0;

  // Calculate rating distribution
  const ratingDistribution: RatingDistribution[] = [1, 2, 3, 4, 5].map(rating => {
    const count = feedback.filter(f => f.rating === rating).length;
    return {
      rating,
      count,
      percentage: totalFeedback > 0 ? (count / totalFeedback) * 100 : 0
    };
  });

  // Calculate emoji distribution
  const emojiData: EmojiDistribution[] = [
    { emoji: '❤️', label: 'Love', color: 'text-red-500', count: 0, percentage: 0 },
    { emoji: '😊', label: 'Like', color: 'text-green-500', count: 0, percentage: 0 },
    { emoji: '😐', label: 'Neutral', color: 'text-yellow-500', count: 0, percentage: 0 },
    { emoji: '👎', label: 'Dislike', color: 'text-orange-500', count: 0, percentage: 0 },
    { emoji: '😡', label: 'Hate', color: 'text-red-600', count: 0, percentage: 0 }
  ];

  feedback.forEach(item => {
    if (item.emojiReaction) {
      const emoji = emojiData.find(e => e.emoji === item.emojiReaction);
      if (emoji) {
        emoji.count++;
      }
    }
  });

  emojiData.forEach(emoji => {
    emoji.percentage = totalFeedback > 0 ? (emoji.count / totalFeedback) * 100 : 0;
  });

  // Calculate sentiment analysis
  const positiveCount = feedback.filter(f => f.type === 'positive').length;
  const negativeCount = feedback.filter(f => f.type === 'negative').length;
  const suggestionCount = feedback.filter(f => f.type === 'suggestion').length;

  // Calculate recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentFeedback = feedback.filter(f => new Date(f.timestamp) > sevenDaysAgo).length;

  // Get top keywords (simple implementation)
  const allContent = feedback.map(f => f.content).join(' ').toLowerCase();
  const words = allContent.split(/\s+/).filter(word => word.length > 3);
  const wordCount: { [key: string]: number } = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  const topKeywords = Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary">{totalFeedback}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total Feedback</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary">{totalReplies}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Replies</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary">{totalLikes}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total Likes</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary">{recentFeedback}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">This Week</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Rating */}
      {averageRating > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="text-2xl sm:text-3xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-5 w-5 sm:h-6 sm:w-6",
                      star <= Math.round(averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                ({ratings.length} ratings)
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rating Distribution */}
      {ratings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-4 w-4 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <Progress value={percentage} className="h-2" />
                  </div>
                  <div className="text-sm text-muted-foreground w-12 text-right">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emoji Reactions */}
      <Card>
        <CardHeader>
          <CardTitle>Emoji Reactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {emojiData
              .filter(emoji => emoji.count > 0)
              .sort((a, b) => b.count - a.count)
              .map(({ emoji, label, count, percentage, color }) => (
                <div key={emoji} className="flex items-center gap-3">
                  <span className="text-2xl">{emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Positive</span>
              </div>
              <div className="text-sm font-medium">{positiveCount}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Suggestions</span>
              </div>
              <div className="text-sm font-medium">{suggestionCount}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Negative</span>
              </div>
              <div className="text-sm font-medium">{negativeCount}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Keywords */}
      {topKeywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {topKeywords.map(({ word, count }) => (
                <Badge key={word} variant="secondary" className="text-xs">
                  {word} ({count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Feedback Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Feedback Collection</span>
              <span className="text-sm font-medium">{totalFeedback}/100</span>
            </div>
            <Progress value={Math.min(totalFeedback, 100)} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {totalFeedback < 100 
                ? `${100 - totalFeedback} more feedback needed for comprehensive analysis`
                : 'Great! You have enough feedback for analysis'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
