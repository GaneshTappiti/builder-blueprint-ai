"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reply, ThumbsUp, MoreHorizontal, ChevronDown, ChevronRight } from "lucide-react";
import { FeedbackItem, FeedbackReply } from "@/utils/ideaforge-persistence";
import { cn } from "@/lib/utils";

interface ThreadedRepliesProps {
  feedback: FeedbackItem;
  onAddReply: (parentId: string, content: string, author: string) => void;
  onLikeReply: (replyId: string) => void;
  onDeleteReply?: (replyId: string) => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

interface ReplyFormProps {
  parentId: string;
  onSubmit: (content: string, author: string) => void;
  onCancel: () => void;
  placeholder?: string;
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  parentId,
  onSubmit,
  onCancel,
  placeholder = "Write a reply..."
}) => {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && author.trim()) {
      onSubmit(content.trim(), author.trim());
      setContent('');
      setAuthor('');
    }
  };

  return (
    <Card className="mt-2 ml-8">
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              placeholder="Your name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
              required
            />
          </div>
          <div>
            <Textarea
              placeholder={placeholder}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[80px]"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={!content.trim() || !author.trim()}>
              Reply
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const ReplyItem: React.FC<{
  reply: FeedbackReply;
  onLike: (replyId: string) => void;
  onDelete?: (replyId: string) => void;
}> = ({ reply, onLike, onDelete }) => {
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

  return (
    <div className="flex gap-3 py-3 border-b border-border/50 last:border-b-0">
      <Avatar className="h-6 w-6">
        <AvatarFallback className="text-xs">
          {reply.author.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{reply.author}</span>
          <span className="text-xs text-muted-foreground">
            {formatDate(reply.timestamp)}
          </span>
        </div>
        <p className="text-sm text-foreground mb-2">{reply.content}</p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onLike(reply.id)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ThumbsUp className="h-3 w-3" />
            {reply.likes > 0 && <span>{reply.likes}</span>}
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(reply.id)}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const ThreadedReplies: React.FC<ThreadedRepliesProps> = ({
  feedback,
  onAddReply,
  onLikeReply,
  onDeleteReply,
  isExpanded = false,
  onToggleExpanded
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [newReplyAuthor, setNewReplyAuthor] = useState('');

  const handleAddReply = (content: string, author: string) => {
    onAddReply(feedback.id, content, author);
    setShowReplyForm(false);
  };

  const handleToggleExpanded = () => {
    if (onToggleExpanded) {
      onToggleExpanded();
    }
  };

  const replyCount = feedback.replies?.length || 0;

  return (
    <div className="mt-3">
      {/* Reply Toggle and Count */}
      {replyCount > 0 && (
        <button
          onClick={handleToggleExpanded}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span>
            {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
          </span>
        </button>
      )}

      {/* Replies List */}
      {isExpanded && replyCount > 0 && (
        <div className="ml-8 space-y-0">
          {feedback.replies?.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              onLike={onLikeReply}
              onDelete={onDeleteReply}
            />
          ))}
        </div>
      )}

      {/* Reply Form Toggle */}
      <div className="mt-2">
        {!showReplyForm ? (
          <button
            onClick={() => setShowReplyForm(true)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Reply className="h-4 w-4" />
            Reply
          </button>
        ) : (
          <ReplyForm
            parentId={feedback.id}
            onSubmit={handleAddReply}
            onCancel={() => setShowReplyForm(false)}
            placeholder={`Reply to ${feedback.author}...`}
          />
        )}
      </div>
    </div>
  );
};

interface FeedbackCardProps {
  feedback: FeedbackItem;
  onLike: (feedbackId: string) => void;
  onDelete?: (feedbackId: string) => void;
  onAddReply: (parentId: string, content: string, author: string) => void;
  onLikeReply: (replyId: string) => void;
  onDeleteReply?: (replyId: string) => void;
  showReplies?: boolean;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  feedback,
  onLike,
  onDelete,
  onAddReply,
  onLikeReply,
  onDeleteReply,
  showReplies = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'positive': return '👍';
      case 'negative': return '👎';
      case 'suggestion': return '💡';
      default: return '💬';
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

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {feedback.author.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">{feedback.author}</span>
              <Badge 
                variant="outline" 
                className={cn("text-xs", getFeedbackBadgeColor(feedback.type))}
              >
                {getFeedbackIcon(feedback.type)} {feedback.type}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatDate(feedback.timestamp)}
              </span>
            </div>

            {/* Rating and Emoji */}
            {(feedback.rating || feedback.emojiReaction) && (
              <div className="flex items-center gap-4 mb-3">
                {feedback.rating && (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">Rating:</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={cn(
                            "text-sm",
                            star <= feedback.rating! ? "text-yellow-400" : "text-gray-300"
                          )}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {feedback.emojiReaction && (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">Reaction:</span>
                    <span className="text-lg">{feedback.emojiReaction}</span>
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <p className="text-sm text-foreground mb-3">{feedback.content}</p>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => onLike(feedback.id)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ThumbsUp className="h-4 w-4" />
                {feedback.likes > 0 && <span>{feedback.likes}</span>}
              </button>
              
              {onDelete && (
                <button
                  onClick={() => onDelete(feedback.id)}
                  className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                >
                  Delete
                </button>
              )}
            </div>

            {/* Threaded Replies */}
            {showReplies && (
              <ThreadedReplies
                feedback={feedback}
                onAddReply={onAddReply}
                onLikeReply={onLikeReply}
                onDeleteReply={onDeleteReply}
                isExpanded={isExpanded}
                onToggleExpanded={() => setIsExpanded(!isExpanded)}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
