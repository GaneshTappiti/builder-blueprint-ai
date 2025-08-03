"use client"

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Plus, FileText, Edit, Trash2, Search, Save, X, Brain } from "lucide-react";
import { StoredIdea } from "@/types/ideaforge";
import IdeaProgressOverview from "./IdeaProgressOverview";
import AIAssistant from "./AIAssistant";
import { useIdeaForgePersistence } from "@/hooks/useIdeaForgePersistence";

interface WikiSection {
  id: string;
  title: string;
  content: string;
  category: 'market' | 'problem' | 'solution' | 'competition' | 'business' | 'technical' | 'other';
  lastUpdated: Date;
  tags: string[];
}

interface WikiViewProps {
  idea: StoredIdea;
  onUpdate?: (updates: Partial<StoredIdea>) => void;
}

const WikiView: React.FC<WikiViewProps> = ({ idea, onUpdate }) => {
  const {
    wikiSections: sections,
    addWikiSection,
    updateWikiSection,
    deleteWikiSection,
    isLoading,
    lastSaved
  } = useIdeaForgePersistence(idea.id);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [editingSection, setEditingSection] = useState<WikiSection | null>(null);
  const [newSection, setNewSection] = useState({
    title: '',
    content: '',
    category: 'other' as WikiSection['category'],
    tags: ''
  });

  // No longer need to initialize sections - handled by persistence hook

  const categoryColors = {
    market: 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30',
    problem: 'bg-red-600/20 text-red-400 border-red-600/30',
    solution: 'bg-green-600/20 text-green-400 border-green-600/30',
    competition: 'bg-teal-600/20 text-teal-400 border-teal-600/30',
    business: 'bg-lime-600/20 text-lime-400 border-lime-600/30',
    technical: 'bg-cyan-600/20 text-cyan-400 border-cyan-600/30',
    other: 'bg-gray-600/20 text-gray-400 border-gray-600/30'
  };

  const categoryIcons = {
    market: '📊',
    problem: '❗',
    solution: '💡',
    competition: '⚔️',
    business: '💼',
    technical: '⚙️',
    other: '📝'
  };

  const filteredSections = sections.filter(section => {
    const matchesSearch = section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddSection = () => {
    if (!newSection.title.trim() || !newSection.content.trim()) return;

    addWikiSection({
      title: newSection.title,
      content: newSection.content,
      category: newSection.category,
      tags: newSection.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    });

    setNewSection({ title: '', content: '', category: 'other', tags: '' });
    setIsAddingSection(false);
  };

  const handleEditSection = (section: WikiSection) => {
    setEditingSection(section);
  };

  const handleUpdateSection = () => {
    if (!editingSection) return;

    updateWikiSection(editingSection.id, {
      title: editingSection.title,
      content: editingSection.content,
      category: editingSection.category,
      tags: editingSection.tags
    });
    setEditingSection(null);
  };

  const handleDeleteSection = (sectionId: string) => {
    deleteWikiSection(sectionId);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="glass-effect-theme p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading wiki sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <IdeaProgressOverview
        wikiProgress={Math.round((sections.length / 10) * 100)} // Dynamic progress based on sections
        blueprintProgress={60}
        journeyProgress={40}
        feedbackProgress={30}
        showOverallProgress={true}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-green-400" />
          <h2 className="workspace-title">Wiki Knowledge Base</h2>
          <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
            {sections.length} sections
          </Badge>
          {lastSaved && (
            <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
              Saved {getTimeAgo(lastSaved)}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddingSection} onOpenChange={setIsAddingSection}>
            <DialogTrigger asChild>
              <Button className="workspace-button">
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl glass-effect-theme border-green-500/20">
          <DialogContent className="sm:max-w-2xl glass-effect-theme border-green-500/20">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Wiki Section</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Title</label>
                <Input
                  value={newSection.title}
                  onChange={(e) => setNewSection(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter section title..."
                  className="bg-black/30 border-green-500/20 text-white focus:border-green-500/40"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Category</label>
                <Select value={newSection.category} onValueChange={(value: WikiSection['category']) =>
                  setNewSection(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="bg-black/30 border-green-500/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-effect-theme border-green-500/20">
                    <SelectItem value="market">📊 Market Research</SelectItem>
                    <SelectItem value="problem">❗ Problem Statement</SelectItem>
                    <SelectItem value="solution">💡 Solution</SelectItem>
                    <SelectItem value="competition">⚔️ Competition</SelectItem>
                    <SelectItem value="business">💼 Business Model</SelectItem>
                    <SelectItem value="technical">⚙️ Technical</SelectItem>
                    <SelectItem value="other">📝 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Content</label>
                <Textarea
                  value={newSection.content}
                  onChange={(e) => setNewSection(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter section content..."
                  className="bg-black/30 border-green-500/20 text-white min-h-[120px] focus:border-green-500/40"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Tags (comma-separated)</label>
                <Input
                  value={newSection.tags}
                  onChange={(e) => setNewSection(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g., market-research, user-feedback, competitive-analysis"
                  className="bg-black/30 border-green-500/20 text-white focus:border-green-500/40"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingSection(false)} className="border-green-500/30 text-green-400 hover:bg-green-600/10">
                  Cancel
                </Button>
                <Button onClick={handleAddSection} className="workspace-button">
                  <Save className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <AIAssistant
          onContentGenerated={(content, category) => {
            if (category === 'wiki') {
              addWikiSection({
                title: 'AI Generated Content',
                content: content,
                category: 'other',
                tags: ['ai-generated']
              });
            }
          }}
          ideaContext={{
            title: idea.title,
            description: idea.description,
            category: 'wiki'
          }}
        />
      </div>
    </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sections, content, or tags..."
            className="pl-10 bg-black/30 border-green-500/20 text-white focus:border-green-500/40 placeholder:text-gray-500"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48 bg-black/30 border-green-500/20 text-white">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent className="glass-effect-theme border-green-500/20">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="market">📊 Market Research</SelectItem>
            <SelectItem value="problem">❗ Problem Statement</SelectItem>
            <SelectItem value="solution">💡 Solution</SelectItem>
            <SelectItem value="competition">⚔️ Competition</SelectItem>
            <SelectItem value="business">💼 Business Model</SelectItem>
            <SelectItem value="technical">⚙️ Technical</SelectItem>
            <SelectItem value="other">📝 Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Wiki Sections */}
      <div className="grid gap-4">
        {filteredSections.length === 0 ? (
          <Card className="glass-effect border-dashed border-green-500/20">
            <CardContent className="p-8 text-center">
              <FileText className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                {searchTerm || selectedCategory !== 'all' ? 'No sections found' : 'No sections yet'}
              </h3>
              <p className="text-gray-400 mb-4">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start building your knowledge base by adding your first section.'
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && (
                <Button
                  variant="outline"
                  className="border-green-500/30 text-green-400 hover:bg-green-600/10"
                  onClick={() => setIsAddingSection(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Section
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredSections.map((section) => (
            <Card key={section.id} className="glass-effect-theme hover:bg-white/5 transition-all workspace-hover">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <span className="text-lg">{categoryIcons[section.category]}</span>
                    {section.title}
                    <Badge className={`ml-2 ${categoryColors[section.category]}`}>
                      {section.category}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSection(section)}
                      className="text-gray-400 hover:text-green-400 hover:bg-green-600/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSection(section.id)}
                      className="text-gray-400 hover:text-red-400 hover:bg-red-600/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4 whitespace-pre-wrap">
                  {section.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>Last updated: {getTimeAgo(section.lastUpdated)}</span>
                  </div>
                  {section.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {section.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-green-500/30 text-green-400">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Section Dialog */}
      <Dialog open={!!editingSection} onOpenChange={() => setEditingSection(null)}>
        <DialogContent className="sm:max-w-2xl glass-effect-theme border-green-500/20">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Wiki Section</DialogTitle>
          </DialogHeader>
          {editingSection && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Title</label>
                <Input
                  value={editingSection.title}
                  onChange={(e) => setEditingSection(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="bg-black/30 border-green-500/20 text-white focus:border-green-500/40"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Category</label>
                <Select
                  value={editingSection.category}
                  onValueChange={(value: WikiSection['category']) =>
                    setEditingSection(prev => prev ? { ...prev, category: value } : null)
                  }
                >
                  <SelectTrigger className="bg-black/30 border-green-500/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-effect-theme border-green-500/20">
                    <SelectItem value="market">📊 Market Research</SelectItem>
                    <SelectItem value="problem">❗ Problem Statement</SelectItem>
                    <SelectItem value="solution">💡 Solution</SelectItem>
                    <SelectItem value="competition">⚔️ Competition</SelectItem>
                    <SelectItem value="business">💼 Business Model</SelectItem>
                    <SelectItem value="technical">⚙️ Technical</SelectItem>
                    <SelectItem value="other">📝 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Content</label>
                <Textarea
                  value={editingSection.content}
                  onChange={(e) => setEditingSection(prev => prev ? { ...prev, content: e.target.value } : null)}
                  className="bg-black/30 border-green-500/20 text-white min-h-[120px] focus:border-green-500/40"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Tags (comma-separated)</label>
                <Input
                  value={editingSection.tags.join(', ')}
                  onChange={(e) => setEditingSection(prev => prev ? {
                    ...prev,
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  } : null)}
                  className="bg-black/30 border-green-500/20 text-white focus:border-green-500/40"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingSection(null)} className="border-green-500/30 text-green-400 hover:bg-green-600/10">
                  Cancel
                </Button>
                <Button onClick={handleUpdateSection} className="workspace-button">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WikiView;
