"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoredIdea, IdeaForgeTab } from "@/types/ideaforge";
import { BookOpen, Target, MessageSquare, Share2, Download, Plus } from "lucide-react";

interface IdeaOverviewProps {
  idea: StoredIdea;
  onUpdate: (updates: Partial<StoredIdea>) => void;
  onNavigateToTab: (tab: IdeaForgeTab) => void;
  onAddNote: () => void;
  onShare: () => void;
  onExport: (format: string) => void;
}

const IdeaOverview: React.FC<IdeaOverviewProps> = ({
  idea,
  onUpdate,
  onNavigateToTab,
  onAddNote,
  onShare,
  onExport,
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Idea Header */}
      <Card className="workspace-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl text-white">{idea.title}</CardTitle>
              <p className="text-gray-400">{idea.description}</p>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(idea.status)}>
                  {idea.status}
                </Badge>
                <div className="flex flex-wrap gap-1">
                  {idea.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-gray-400 border-gray-500/30 text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onShare}
                className="workspace-button-secondary"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('summary')}
                className="workspace-button-secondary"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <Card className="workspace-card">
        <CardHeader>
          <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="workspace-button-secondary h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => onNavigateToTab('wiki')}
            >
              <BookOpen className="h-6 w-6" />
              <span>Wiki</span>
            </Button>
            <Button
              variant="outline"
              className="workspace-button-secondary h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => onNavigateToTab('blueprint')}
            >
              <Target className="h-6 w-6" />
              <span>Blueprint</span>
            </Button>
            <Button
              variant="outline"
              className="workspace-button-secondary h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => onNavigateToTab('feedback')}
            >
              <MessageSquare className="h-6 w-6" />
              <span>Feedback</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card className="workspace-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-white">Notes</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddNote}
              className="workspace-button-secondary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm">
            Add notes and insights about your idea to keep track of important details.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default IdeaOverview;
