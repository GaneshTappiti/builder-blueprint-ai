"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Users, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface TeamComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface TeamSuggestion {
  id: string;
  userId: string;
  userName: string;
  field: string;
  originalValue: string;
  suggestedValue: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface TeamCollaborationProps {
  ideaId: string;
  isPrivate: boolean;
  teamComments?: TeamComment[];
  teamSuggestions?: TeamSuggestion[];
  teamStatus?: 'under_review' | 'in_progress' | 'approved' | 'rejected';
  onStatusChange?: (status: 'under_review' | 'in_progress' | 'approved' | 'rejected') => void;
  onCommentAdd?: (content: string) => void;
}

export default function TeamCollaboration({
  ideaId,
  isPrivate,
  teamComments = [],
  teamSuggestions = [],
  teamStatus = 'under_review',
  onStatusChange,
  onCommentAdd
}: TeamCollaborationProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  if (isPrivate) {
    return null; // Don't show team features for private ideas
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);
    try {
      if (onCommentAdd) {
        await onCommentAdd(newComment);
        setNewComment("");
        toast({
          title: "Comment Added",
          description: "Your comment has been added to the team discussion.",
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: 'under_review' | 'in_progress' | 'approved' | 'rejected') => {
    if (onStatusChange) {
      try {
        await onStatusChange(newStatus);
        toast({
          title: "Status Updated",
          description: `Idea status changed to ${newStatus.replace('_', ' ')}.`,
        });
      } catch (error) {
        console.error('Error updating status:', error);
        toast({
          title: "Error",
          description: "Failed to update status. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'under_review':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under_review':
        return "bg-yellow-600/20 text-yellow-400";
      case 'in_progress':
        return "bg-blue-600/20 text-blue-400";
      case 'approved':
        return "bg-green-600/20 text-green-400";
      case 'rejected':
        return "bg-red-600/20 text-red-400";
      default:
        return "bg-gray-600/20 text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Team Status */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(teamStatus)}
              <Badge className={getStatusColor(teamStatus)}>
                {teamStatus.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <Select value={teamStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Team Comments */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Team Discussion ({teamComments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Comment */}
          <div className="space-y-2">
            <Textarea
              placeholder="Add a comment for the team..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              rows={3}
            />
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || isSubmitting}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Adding..." : "Add Comment"}
            </Button>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {teamComments.length === 0 ? (
              <p className="text-gray-400 text-sm">No comments yet. Start the discussion!</p>
            ) : (
              teamComments.map((comment) => (
                <div key={comment.id} className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{comment.userName}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Suggestions */}
      {teamSuggestions.length > 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">Team Suggestions ({teamSuggestions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{suggestion.userName}</span>
                    <Badge 
                      className={
                        suggestion.status === 'accepted' 
                          ? "bg-green-600/20 text-green-400"
                          : suggestion.status === 'rejected'
                          ? "bg-red-600/20 text-red-400"
                          : "bg-yellow-600/20 text-yellow-400"
                      }
                    >
                      {suggestion.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">Field: {suggestion.field}</p>
                    <p className="text-sm text-gray-300">
                      <span className="text-red-400">- {suggestion.originalValue}</span>
                    </p>
                    <p className="text-sm text-gray-300">
                      <span className="text-green-400">+ {suggestion.suggestedValue}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
