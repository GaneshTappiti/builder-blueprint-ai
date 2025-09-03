"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Share2, 
  Copy, 
  CheckCircle, 
  Clock, 
  Target, 
  TrendingUp,
  Users,
  Lightbulb,
  BookOpen,
  Layers,
  GitBranch,
  MessageSquare,
  Calendar,
  Tag,
  Star,
  ArrowRight
} from 'lucide-react';
import { StoredIdea } from '@/types/ideaforge';
import { useToast } from '@/hooks/use-toast';

interface IdeaSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: StoredIdea;
  wikiContent?: Record<string, string>;
  blueprintContent?: {
    features: any[];
    techStack: any[];
    mvpPhases: any[];
  };
  journeyContent?: {
    sections: any[];
    nodes: any[];
  };
  feedbackContent?: {
    feedback: any[];
    aiSummary?: string;
  };
}

const IdeaSummaryModal: React.FC<IdeaSummaryModalProps> = ({
  isOpen,
  onClose,
  idea,
  wikiContent = {},
  blueprintContent = { features: [], techStack: [], mvpPhases: [] },
  journeyContent = { sections: [], nodes: [] },
  feedbackContent = { feedback: [], aiSummary: '' }
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'markdown' | 'json'>('markdown');
  const { toast } = useToast();

  const getOverallProgress = () => {
    // Handle missing progress property gracefully
    const progress = idea.progress || { wiki: 0, blueprint: 0, journey: 0, feedback: 0 };
    return Math.round((progress.wiki + progress.blueprint + progress.journey + progress.feedback) / 4);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-600/20 text-gray-400';
      case 'researching': return 'bg-blue-600/20 text-blue-400';
      case 'validated': return 'bg-green-600/20 text-green-400';
      case 'building': return 'bg-purple-600/20 text-purple-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const generateMarkdownExport = () => {
    const progress = idea.progress || { wiki: 0, blueprint: 0, journey: 0, feedback: 0 };
    const sections = [
      `# ${idea.title}`,
      `**Status:** ${idea.status}`,
      `**Created:** ${new Date(idea.createdAt).toLocaleDateString()}`,
      `**Last Updated:** ${new Date(idea.updatedAt).toLocaleDateString()}`,
      `**Overall Progress:** ${getOverallProgress()}%`,
      '',
      `## Description`,
      idea.description,
      '',
      `## Progress Overview`,
      `- Wiki: ${progress.wiki}%`,
      `- Blueprint: ${progress.blueprint}%`,
      `- Journey: ${progress.journey}%`,
      `- Feedback: ${progress.feedback}%`,
      ''
    ];

    if (idea.tags.length > 0) {
      sections.push(`## Tags`, idea.tags.map(tag => `- ${tag}`).join('\n'), '');
    }

    if (Object.keys(wikiContent).length > 0) {
      sections.push('## Wiki Analysis');
      Object.entries(wikiContent).forEach(([key, content]) => {
        sections.push(`### ${key.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`, content, '');
      });
    }

    if (blueprintContent.features.length > 0) {
      sections.push('## Product Features');
      blueprintContent.features.forEach(feature => {
        sections.push(`- **${feature.name}**: ${feature.description} (${feature.priority} priority)`);
      });
      sections.push('');
    }

    if (blueprintContent.techStack.length > 0) {
      sections.push('## Technology Stack');
      blueprintContent.techStack.forEach(tech => {
        sections.push(`- **${tech.name}** (${tech.category}): ${tech.description}`);
      });
      sections.push('');
    }

    if (feedbackContent.feedback.length > 0) {
      sections.push('## Feedback Summary');
      feedbackContent.feedback.forEach(feedback => {
        sections.push(`- **${feedback.type}** by ${feedback.author}: ${feedback.content}`);
      });
      sections.push('');
    }

    if (feedbackContent.aiSummary) {
      sections.push('## AI Analysis', feedbackContent.aiSummary, '');
    }

    return sections.join('\n');
  };

  const generateJSONExport = () => {
    const progress = idea.progress || { wiki: 0, blueprint: 0, journey: 0, feedback: 0 };
    return JSON.stringify({
      idea: {
        ...idea,
        progress: {
          wiki: progress.wiki,
          blueprint: progress.blueprint,
          journey: progress.journey,
          feedback: progress.feedback
        }
      },
      wiki: wikiContent,
      blueprint: blueprintContent,
      journey: journeyContent,
      feedback: feedbackContent,
      exportedAt: new Date().toISOString()
    }, null, 2);
  };

  const handleExport = () => {
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (exportFormat) {
      case 'markdown':
        content = generateMarkdownExport();
        filename = `${idea.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.md`;
        mimeType = 'text/markdown';
        break;
      case 'json':
        content = generateJSONExport();
        filename = `${idea.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_data.json`;
        mimeType = 'application/json';
        break;
      case 'pdf':
        toast({
          title: "PDF Export",
          description: "PDF export feature coming soon!",
        });
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `${filename} has been downloaded successfully.`,
    });
  };

  const handleCopyToClipboard = async () => {
    const content = generateMarkdownExport();
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: "Idea summary copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const progressSections = [
    {
      id: 'wiki',
      label: 'Wiki',
      progress: (idea.progress || { wiki: 0 }).wiki,
      icon: BookOpen,
      color: 'text-blue-400',
      description: 'Market research and business analysis'
    },
    {
      id: 'blueprint',
      label: 'Blueprint',
      progress: (idea.progress || { blueprint: 0 }).blueprint,
      icon: Layers,
      color: 'text-green-400',
      description: 'Product features and technical architecture'
    },
    {
      id: 'journey',
      label: 'Journey',
      progress: (idea.progress || { journey: 0 }).journey,
      icon: GitBranch,
      color: 'text-orange-400',
      description: 'Development timeline and milestones'
    },
    {
      id: 'feedback',
      label: 'Feedback',
      progress: (idea.progress || { feedback: 0 }).feedback,
      icon: MessageSquare,
      color: 'text-purple-400',
      description: 'Community feedback and validation'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/95 backdrop-blur-sm border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-3">
            <FileText className="h-6 w-6 text-green-400" />
            {idea.title} - Comprehensive Summary
            <Badge className={getStatusColor(idea.status)}>
              {idea.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/40">
            <TabsTrigger value="overview" className="data-[state=active]:bg-green-600">
              Overview
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-green-600">
              Progress
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-green-600">
              Content
            </TabsTrigger>
            <TabsTrigger value="export" className="data-[state=active]:bg-green-600">
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Project Details</h3>
                  <div className="bg-black/20 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <Badge className={getStatusColor(idea.status)}>{idea.status}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-white">{new Date(idea.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Updated:</span>
                      <span className="text-white">{new Date(idea.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Overall Progress:</span>
                      <span className="text-green-400 font-bold">{getOverallProgress()}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                  <p className="text-gray-300 bg-black/20 p-4 rounded-lg">{idea.description}</p>
                </div>

                {idea.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {idea.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="border-gray-600 text-gray-400">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/20 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-400">{blueprintContent.features.length}</div>
                    <div className="text-sm text-gray-400">Features</div>
                  </div>
                  <div className="bg-black/20 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-400">{blueprintContent.techStack.length}</div>
                    <div className="text-sm text-gray-400">Technologies</div>
                  </div>
                  <div className="bg-black/20 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-400">{journeyContent.nodes?.length || 0}</div>
                    <div className="text-sm text-gray-400">Journey Nodes</div>
                  </div>
                  <div className="bg-black/20 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-400">{feedbackContent.feedback.length}</div>
                    <div className="text-sm text-gray-400">Feedback Items</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Overall Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Total Progress</span>
                    <span className="text-green-400 font-bold text-lg">{getOverallProgress()}%</span>
                  </div>
                  <Progress value={getOverallProgress()} className="h-3 bg-gray-700" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {progressSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <div key={section.id} className="bg-black/20 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg bg-${section.color.split('-')[1]}-600/20`}>
                          <Icon className={`h-4 w-4 ${section.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-medium">{section.label}</span>
                            <span className={`text-sm font-bold ${section.color}`}>
                              {section.progress}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{section.description}</p>
                        </div>
                      </div>
                      <Progress value={section.progress} className="h-2 bg-gray-700 mt-2" />
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <div className="space-y-6">
              {Object.keys(wikiContent).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                    Wiki Analysis
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(wikiContent).map(([key, content]) => (
                      <div key={key} className="bg-black/20 p-4 rounded-lg">
                        <h4 className="text-white font-medium mb-2">
                          {key.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h4>
                        <p className="text-gray-300 text-sm line-clamp-3">{content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {feedbackContent.aiSummary && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    AI Analysis Summary
                  </h3>
                  <div className="bg-black/20 p-4 rounded-lg">
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{feedbackContent.aiSummary}</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Export Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      exportFormat === 'markdown' 
                        ? 'border-green-500 bg-green-600/10' 
                        : 'border-gray-600 bg-black/20 hover:border-gray-500'
                    }`}
                    onClick={() => setExportFormat('markdown')}
                  >
                    <FileText className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <h4 className="text-white font-medium text-center">Markdown</h4>
                    <p className="text-gray-400 text-sm text-center">Human-readable format</p>
                  </div>
                  <div 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      exportFormat === 'json' 
                        ? 'border-green-500 bg-green-600/10' 
                        : 'border-gray-600 bg-black/20 hover:border-gray-500'
                    }`}
                    onClick={() => setExportFormat('json')}
                  >
                    <FileText className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <h4 className="text-white font-medium text-center">JSON</h4>
                    <p className="text-gray-400 text-sm text-center">Machine-readable format</p>
                  </div>
                  <div 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      exportFormat === 'pdf' 
                        ? 'border-green-500 bg-green-600/10' 
                        : 'border-gray-600 bg-black/20 hover:border-gray-500'
                    }`}
                    onClick={() => setExportFormat('pdf')}
                  >
                    <FileText className="h-8 w-8 text-red-400 mx-auto mb-2" />
                    <h4 className="text-white font-medium text-center">PDF</h4>
                    <p className="text-gray-400 text-sm text-center">Coming soon</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleExport}
                  className="bg-green-600 hover:bg-green-700 flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export {exportFormat.toUpperCase()}
                </Button>
                <Button
                  onClick={handleCopyToClipboard}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-600/10"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default IdeaSummaryModal;