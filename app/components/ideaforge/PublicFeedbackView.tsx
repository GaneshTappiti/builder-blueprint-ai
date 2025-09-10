"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePublicFeedbackOnly } from "@/hooks/usePublicFeedbackOnly";
import { FeedbackItem, FeedbackReply } from "@/utils/ideaforge-persistence";
import { useToast } from "@/hooks/use-toast";
import { FeedbackRating } from "./RatingSystem";
import { FeedbackCard } from "./ThreadedReplies";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Send,
  Star,
  TrendingUp,
  Reply,
  Heart,
  Smile,
  Meh,
  Angry
} from "lucide-react";

interface PublicFeedbackViewProps {
  ideaId: string;
}

const PublicFeedbackView: React.FC<PublicFeedbackViewProps> = ({ ideaId }) => {
  const {
    idea,
    feedback,
    loading,
    error,
    addFeedback,
    updateFeedback,
    deleteFeedback,
    addReply,
    updateReply,
    deleteReply
  } = usePublicFeedbackOnly(ideaId);

  // Form state
  const [newFeedback, setNewFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative' | 'suggestion'>('positive');
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState<number>(0);
  const [newEmojiReaction, setNewEmojiReaction] = useState<'❤️' | '😊' | '😐' | '👎' | '😡' | undefined>(undefined);
  
  const { toast } = useToast();

  const handleSubmitFeedback = async () => {
    if (!newFeedback.trim() || !newAuthor.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both your name and feedback.",
        variant: "destructive",
      });
      return;
    }
    
    const success = await addFeedback({
      author: newAuthor.trim(),
      content: newFeedback.trim(),
      type: feedbackType,
      timestamp: new Date().toISOString(),
      likes: 0,
      rating: newRating > 0 ? newRating : undefined,
      emojiReaction: newEmojiReaction,
      replies: []
    });

    if (success) {
      setNewFeedback('');
      setNewAuthor('');
      setFeedbackType('positive');
      setNewRating(0);
      setNewEmojiReaction(undefined);
      
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLikeFeedback = async (feedbackId: string) => {
    const feedbackItem = feedback.find(f => f.id === feedbackId);
    if (feedbackItem) {
      await updateFeedback(feedbackId, { likes: feedbackItem.likes + 1 });
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (confirm('Are you sure you want to delete this feedback?')) {
      await deleteFeedback(feedbackId);
    }
  };

  const handleAddReply = async (parentId: string, content: string, author: string) => {
    await addReply(parentId, {
      author: author,
      content: content,
      timestamp: new Date().toISOString(),
      likes: 0,
      parentId: parentId
    });
  };

  const handleLikeReply = async (feedbackId: string, replyId: string) => {
    const parentFeedback = feedback.find(f => f.replies?.some(r => r.id === replyId));
    if (!parentFeedback) return;

    const reply = parentFeedback.replies?.find(r => r.id === replyId);
    if (reply) {
      await updateReply(feedbackId, replyId, { likes: reply.likes + 1 });
    }
  };

  const handleDeleteReply = async (feedbackId: string, replyId: string) => {
    if (confirm('Are you sure you want to delete this reply?')) {
      await deleteReply(feedbackId, replyId);
    }
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'positive': return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case 'negative': return <ThumbsDown className="h-4 w-4 text-red-500" />;
      case 'suggestion': return <Star className="h-4 w-4 text-yellow-500" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getFeedbackBadgeColor = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'negative': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'suggestion': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getFeedbackStats = () => {
    const positive = feedback.filter(f => f.type === 'positive').length;
    const negative = feedback.filter(f => f.type === 'negative').length;
    const suggestions = feedback.filter(f => f.type === 'suggestion').length;
    const totalLikes = feedback.reduce((sum, f) => sum + f.likes, 0);
    
    return { positive, negative, suggestions, totalLikes };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading feedback...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-red-500 mb-4">
            <MessageSquare className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Error Loading Feedback</h3>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!idea) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <MessageSquare className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Idea Not Found</h3>
          <p className="text-muted-foreground">The requested idea could not be found.</p>
        </CardContent>
      </Card>
    );
  }

  const stats = getFeedbackStats();

  return (
    <div className="space-y-6">
      {/* Feedback Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Feedback Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{stats.positive}</div>
              <div className="text-sm text-muted-foreground">Positive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{stats.suggestions}</div>
              <div className="text-sm text-muted-foreground">Suggestions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{stats.negative}</div>
              <div className="text-sm text-muted-foreground">Negative</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{stats.totalLikes}</div>
              <div className="text-sm text-muted-foreground">Total Likes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Share Your Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Your Name
              </label>
              <input
                type="text"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-2 border border-input rounded-md bg-background"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Feedback Type
              </label>
              <div className="flex gap-2">
                {(['positive', 'negative', 'suggestion'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={feedbackType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFeedbackType(type)}
                    className="flex items-center gap-2"
                  >
                    {getFeedbackIcon(type)}
                    <span className="capitalize">{type}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Your Feedback
            </label>
            <Textarea
              placeholder="Share your thoughts, suggestions, or concerns about this idea..."
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
              rows={4}
              className="bg-background"
            />
          </div>

          {/* Rating System */}
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <FeedbackRating
              rating={newRating}
              emojiReaction={newEmojiReaction}
              onRatingChange={setNewRating}
              onEmojiChange={setNewEmojiReaction}
              showBoth={true}
            />
          </div>

          <Button
            onClick={handleSubmitFeedback}
            disabled={!newFeedback.trim() || !newAuthor.trim()}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Feedback
          </Button>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Community Feedback ({feedback.length})
        </h3>

        {feedback.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No feedback yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to share your thoughts and help improve this idea.
              </p>
            </CardContent>
          </Card>
        ) : (
          feedback
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((item) => (
              <FeedbackCard
                key={item.id}
                feedback={item}
                onLike={handleLikeFeedback}
                onDelete={handleDeleteFeedback}
                onAddReply={handleAddReply}
                onLikeReply={(replyId) => handleLikeReply(item.id, replyId)}
                onDeleteReply={(replyId) => handleDeleteReply(item.id, replyId)}
                showReplies={true}
              />
            ))
        )}
      </div>
    </div>
  );
};

export default PublicFeedbackView;
