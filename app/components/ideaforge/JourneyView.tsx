"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  Target, 
  TrendingUp,
  Users,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Copy,
  RefreshCw,
  Sparkles,
  Info,
  Plus,
  Trash2,
  MapPin,
  ArrowRight,
  Edit3,
  Save,
  X,
  Circle
} from 'lucide-react';
import { aiEngine } from '@/services/aiEngine';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed' | 'blocked';
  dueDate?: Date;
  priority: 'high' | 'medium' | 'low';
  category: 'research' | 'development' | 'testing' | 'launch' | 'marketing';
  insights?: string;
}

interface JourneySection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  content: string;
  isExpanded: boolean;
  isLoading: boolean;
  lastUpdated?: Date;
  status: 'empty' | 'loading' | 'generated' | 'error';
  milestones?: Milestone[];
}

interface JourneyNode {
  id: string;
  title: string;
  description: string;
  type: 'discovery' | 'first-use' | 'habit-building' | 'long-term';
  x: number;
  y: number;
  completed: boolean;
  insights?: string;
}

interface JourneyViewProps {
  ideaContext: {
    title: string;
    description: string;
    category: string;
  };
  onContentUpdate?: (sectionId: string, content: string) => void;
  onMilestoneUpdate?: (milestone: Milestone) => void;
  className?: string;
}

const JourneyView: React.FC<JourneyViewProps> = ({ 
  ideaContext, 
  onContentUpdate,
  onMilestoneUpdate,
  className = ""
}) => {
  const [sections, setSections] = useState<JourneySection[]>([
    {
      id: 'timeline-tracking',
      title: 'Timeline Tracking',
      icon: Clock,
      description: 'Development phases, milestones, and progress tracking',
      content: '',
      isExpanded: false,
      isLoading: false,
      status: 'empty',
      milestones: []
    },
    {
      id: 'insights-research',
      title: 'Insights & Research',
      icon: Lightbulb,
      description: 'Key insights, research findings, and learning outcomes',
      content: '',
      isExpanded: false,
      isLoading: false,
      status: 'empty'
    },
    {
      id: 'market-analysis',
      title: 'Market Analysis',
      icon: TrendingUp,
      description: 'Market research progress and competitive intelligence',
      content: '',
      isExpanded: false,
      isLoading: false,
      status: 'empty'
    },
    {
      id: 'user-validation',
      title: 'User Validation',
      icon: Users,
      description: 'User feedback, testing results, and validation metrics',
      content: '',
      isExpanded: false,
      isLoading: false,
      status: 'empty'
    },
    {
      id: 'goals-objectives',
      title: 'Goals & Objectives',
      icon: Target,
      description: 'Strategic goals, KPIs, and success metrics tracking',
      content: '',
      isExpanded: false,
      isLoading: false,
      status: 'empty'
    }
  ]);

  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    status: 'planned' as Milestone['status'],
    priority: 'medium' as Milestone['priority'],
    category: 'development' as Milestone['category'],
    dueDate: '',
    insights: ''
  });

  const [journeyNodes, setJourneyNodes] = useState<JourneyNode[]>([
    {
      id: '1',
      title: 'User Discovery',
      description: 'How users first discover your product',
      type: 'discovery',
      x: 50,
      y: 100,
      completed: false
    },
    {
      id: '2',
      title: 'First Workout',
      description: 'User\'s first experience with the app',
      type: 'first-use',
      x: 200,
      y: 100,
      completed: false
    },
    {
      id: '3',
      title: 'Habit Building',
      description: 'Building consistent workout habits',
      type: 'habit-building',
      x: 350,
      y: 100,
      completed: false
    },
    {
      id: '4',
      title: 'Long-term Engagement',
      description: 'Sustained engagement and growth',
      type: 'long-term',
      x: 500,
      y: 100,
      completed: false
    }
  ]);

  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');

  const { toast } = useToast();

  const generateSectionContent = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    setSections(prev => prev.map(s => 
      s.id === sectionId 
        ? { ...s, isLoading: true, status: 'loading' as const }
        : s
    ));

    try {
      let prompt = '';
      
      switch (sectionId) {
        case 'timeline-tracking':
          prompt = `Create a comprehensive development timeline for: ${ideaContext.title}
          
Description: ${ideaContext.description}

Please provide:
1. Phase 1: Foundation & Planning (Weeks 1-4)
2. Phase 2: MVP Development (Weeks 5-12)
3. Phase 3: Testing & Refinement (Weeks 13-16)
4. Phase 4: Launch Preparation (Weeks 17-20)
5. Post-Launch Phases
6. Risk Mitigation Strategies

Format as structured markdown with clear timelines and deliverables.`;
          break;
          
        case 'insights-research':
          prompt = `Generate key insights and research findings for: ${ideaContext.title}
          
Description: ${ideaContext.description}

Please provide:
1. Key Market Insights
2. Technical Insights
3. User Research Findings
4. Business Model Insights
5. Risk Assessment Insights
6. Learning Outcomes and Next Steps

Format as structured markdown with actionable insights.`;
          break;
          
        case 'market-analysis':
          prompt = `Conduct comprehensive market analysis for: ${ideaContext.title}
          
Description: ${ideaContext.description}

Please provide:
1. Market Size and Opportunity
2. Competitive Landscape
3. Market Trends and Drivers
4. Target Customer Segments
5. Market Entry Strategy
6. Market Validation Results

Format as structured markdown with data-driven insights.`;
          break;
          
        case 'user-validation':
          prompt = `Create user validation framework for: ${ideaContext.title}
          
Description: ${ideaContext.description}

Please provide:
1. Validation Methodology
2. Key Validation Metrics
3. User Feedback Analysis
4. Testing Results
5. Validation Insights
6. Next Steps for Validation

Format as structured markdown with actionable validation insights.`;
          break;
          
        case 'goals-objectives':
          prompt = `Define strategic goals and objectives for: ${ideaContext.title}
          
Description: ${ideaContext.description}

Please provide:
1. Strategic Goals
2. Key Performance Indicators (KPIs)
3. Success Metrics
4. Milestone Tracking
5. Risk Management Goals
6. Review and Adjustment Process

Format as structured markdown with measurable objectives.`;
          break;
      }

      const response = await aiEngine.generateText(prompt, {
        maxTokens: 2500,
        temperature: 0.7
      });

      const newContent = response.text;
      
      setSections(prev => prev.map(s => 
        s.id === sectionId 
          ? { 
              ...s, 
              content: newContent, 
              isLoading: false, 
              status: 'generated' as const,
              lastUpdated: new Date()
            }
          : s
      ));

      onContentUpdate?.(sectionId, newContent);

      toast({
        title: "✅ Journey Analysis Complete",
        description: `${section.title} has been generated successfully`,
        duration: 3000,
      });

    } catch (error) {
      console.error(`Error generating ${sectionId}:`, error);
      
      setSections(prev => prev.map(s => 
        s.id === sectionId 
          ? { ...s, isLoading: false, status: 'error' as const }
          : s
      ));

      toast({
        title: "Generation Failed",
        description: `Failed to generate ${section.title}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const toggleSection = (sectionId: string) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId 
        ? { ...s, isExpanded: !s.isExpanded }
        : s
    ));
  };

  const copyContent = async (content: string, sectionTitle: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: `${sectionTitle} content copied to clipboard`,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy content to clipboard",
        variant: "destructive",
      });
    }
  };

  const addMilestone = () => {
    if (!newMilestone.title.trim()) return;

    const milestone: Milestone = {
      id: Date.now().toString(),
      title: newMilestone.title.trim(),
      description: newMilestone.description.trim(),
      status: newMilestone.status,
      priority: newMilestone.priority,
      category: newMilestone.category,
      dueDate: newMilestone.dueDate ? new Date(newMilestone.dueDate) : undefined,
      insights: newMilestone.insights.trim() || undefined
    };

    setSections(prev => prev.map(s => 
      s.id === 'timeline-tracking'
        ? { 
            ...s, 
            milestones: [...(s.milestones || []), milestone]
          }
        : s
    ));

    onMilestoneUpdate?.(milestone);

    setNewMilestone({
      title: '',
      description: '',
      status: 'planned',
      priority: 'medium',
      category: 'development',
      dueDate: '',
      insights: ''
    });
    setIsAddingMilestone(false);

    toast({
      title: "Milestone Added",
      description: `${milestone.title} has been added to your timeline`,
      duration: 2000,
    });
  };

  const deleteMilestone = (milestoneId: string) => {
    setSections(prev => prev.map(s => 
      s.id === 'timeline-tracking'
        ? {
            ...s,
            milestones: s.milestones?.filter(m => m.id !== milestoneId)
          }
        : s
    ));
  };

  const handleNodeDrag = (nodeId: string, newX: number, newY: number) => {
    setJourneyNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, x: newX, y: newY } : node
    ));
  };

  const toggleNodeCompletion = (nodeId: string) => {
    setJourneyNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, completed: !node.completed } : node
    ));
  };

  const startEditingNode = (nodeId: string, content: string) => {
    setEditingNode(nodeId);
    setEditingContent(content);
  };

  const saveNodeEdit = (nodeId: string) => {
    setJourneyNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, description: editingContent } : node
    ));
    setEditingNode(null);
    setEditingContent('');
    
    toast({
      title: "Journey Updated",
      description: "Your journey map has been updated successfully",
      duration: 2000,
    });
  };

  const cancelNodeEdit = () => {
    setEditingNode(null);
    setEditingContent('');
  };

  const getNodeTypeIcon = (type: JourneyNode['type']) => {
    switch (type) {
      case 'discovery':
        return <Lightbulb className="h-4 w-4" />;
      case 'first-use':
        return <Target className="h-4 w-4" />;
      case 'habit-building':
        return <TrendingUp className="h-4 w-4" />;
      case 'long-term':
        return <Users className="h-4 w-4" />;
    }
  };

  const getNodeTypeColor = (type: JourneyNode['type']) => {
    switch (type) {
      case 'discovery':
        return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
      case 'first-use':
        return 'bg-green-600/20 text-green-400 border-green-500/30';
      case 'habit-building':
        return 'bg-orange-600/20 text-orange-400 border-orange-500/30';
      case 'long-term':
        return 'bg-purple-600/20 text-purple-400 border-purple-500/30';
    }
  };

  const getStatusIcon = (status: JourneySection['status']) => {
    switch (status) {
      case 'loading':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />;
      case 'generated':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default:
        return <Info className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: JourneySection['status']) => {
    switch (status) {
      case 'loading':
        return <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30">Generating</Badge>;
      case 'generated':
        return <Badge className="bg-green-600/20 text-green-400 border-green-500/30">Complete</Badge>;
      case 'error':
        return <Badge className="bg-red-600/20 text-red-400 border-red-500/30">Error</Badge>;
      default:
        return <Badge className="bg-gray-600/20 text-gray-400 border-gray-500/30">Empty</Badge>;
    }
  };

  const getMilestoneStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'planned':
        return <Calendar className="h-4 w-4 text-gray-400" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-400" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'blocked':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
    }
  };

  const getMilestoneStatusBadge = (status: Milestone['status']) => {
    switch (status) {
      case 'planned':
        return <Badge className="bg-gray-600/20 text-gray-400 border-gray-500/30">Planned</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-600/20 text-green-400 border-green-500/30">Completed</Badge>;
      case 'blocked':
        return <Badge className="bg-red-600/20 text-red-400 border-red-500/30">Blocked</Badge>;
    }
  };

  const getPriorityBadge = (priority: Milestone['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-600/20 text-red-400 border-red-500/30">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-500/30">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-600/20 text-green-400 border-green-500/30">Low</Badge>;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Development Journey</h2>
          <p className="text-gray-400">Track your progress, insights, and milestones</p>
        </div>
        <Button
          onClick={() => {
            sections.forEach(section => {
              if (section.status === 'empty') {
                generateSectionContent(section.id);
              }
            });
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Generate All Sections
        </Button>
      </div>

      {/* Interactive Journey Map */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MapPin className="h-5 w-5 text-orange-400" />
            Interactive Journey Map
            <Badge variant="outline" className="border-gray-600 text-gray-400">
              {journeyNodes.filter(n => n.completed).length}/{journeyNodes.length} completed
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-black/20 rounded-lg p-6 min-h-[400px] overflow-hidden">
            {/* Journey Timeline */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-gray-700 rounded-full">
              <div 
                className="h-1 bg-orange-500 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(journeyNodes.filter(n => n.completed).length / journeyNodes.length) * 100}%` 
                }}
              />
            </div>
            
            {/* Journey Nodes */}
            {journeyNodes.map((node, index) => (
              <div key={node.id} className="relative">
                {/* Connection Line */}
                {index < journeyNodes.length - 1 && (
                  <div 
                    className="absolute top-8 w-32 h-0.5 bg-gray-600"
                    style={{ 
                      left: `${node.x + 120}px`,
                      top: '32px'
                    }}
                  />
                )}
                
                {/* Node */}
                <div
                  className="absolute cursor-move"
                  style={{ left: `${node.x}px`, top: `${node.y}px` }}
                  draggable
                  onDragStart={(e) => setDraggedNode(node.id)}
                  onDragEnd={(e) => {
                    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                    if (rect) {
                      const newX = Math.max(0, Math.min(600, e.clientX - rect.left - 60));
                      const newY = Math.max(0, Math.min(300, e.clientY - rect.top - 60));
                      handleNodeDrag(node.id, newX, newY);
                    }
                    setDraggedNode(null);
                  }}
                >
                  <div className={`w-48 p-4 rounded-lg border-2 transition-all ${
                    node.completed 
                      ? 'bg-green-600/20 border-green-500/50' 
                      : 'bg-black/40 border-white/20 hover:border-orange-500/50'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1 rounded ${getNodeTypeColor(node.type)}`}>
                        {getNodeTypeIcon(node.type)}
                      </div>
                      <h4 className="text-white font-medium text-sm">{node.title}</h4>
                      <Button
                        onClick={() => toggleNodeCompletion(node.id)}
                        variant="ghost"
                        size="sm"
                        className="ml-auto p-1"
                      >
                        {node.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    
                    {editingNode === node.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="w-full p-2 bg-black/30 border border-white/10 rounded text-white text-xs resize-none"
                          rows={2}
                        />
                        <div className="flex gap-1">
                          <Button
                            onClick={() => saveNodeEdit(node.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 h-6 px-2"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={cancelNodeEdit}
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-gray-300 h-6 px-2"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-300 text-xs mb-2">{node.description}</p>
                        <Button
                          onClick={() => startEditingNode(node.id, node.description)}
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white h-6 px-2"
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Progress Indicator */}
            <div className="absolute bottom-4 right-4 bg-black/60 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                <span className="text-white text-sm">
                  {Math.round((journeyNodes.filter(n => n.completed).length / journeyNodes.length) * 100)}% Complete
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.id} className="bg-black/40 backdrop-blur-sm border-white/10">
              <Collapsible 
                open={section.isExpanded} 
                onOpenChange={() => toggleSection(section.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-600/20">
                          <Icon className="h-5 w-5 text-orange-400" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{section.title}</CardTitle>
                          <p className="text-gray-400 text-sm">{section.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusIcon(section.status)}
                        {getStatusBadge(section.status)}
                        {section.isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {section.status === 'empty' && (
                      <div className="text-center py-8">
                        <Icon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">No Journey Data Yet</h3>
                        <p className="text-gray-400 mb-4">Generate comprehensive journey analysis for this section</p>
                        <Button
                          onClick={() => generateSectionContent(section.id)}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Analysis
                        </Button>
                      </div>
                    )}

                    {section.status === 'loading' && (
                      <div className="text-center py-8">
                        <RefreshCw className="h-12 w-12 mx-auto text-orange-400 animate-spin mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">Generating Journey Analysis</h3>
                        <p className="text-gray-400">AI is creating comprehensive journey insights and recommendations...</p>
                      </div>
                    )}

                    {section.status === 'error' && (
                      <div className="text-center py-8">
                        <AlertTriangle className="h-12 w-12 mx-auto text-red-400 mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">Generation Failed</h3>
                        <p className="text-gray-400 mb-4">There was an error generating the journey analysis</p>
                        <Button
                          onClick={() => generateSectionContent(section.id)}
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-600/10"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Try Again
                        </Button>
                      </div>
                    )}

                    {section.status === 'generated' && section.content && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-sm text-gray-400">
                              Last updated: {section.lastUpdated?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => generateSectionContent(section.id)}
                              variant="outline"
                              size="sm"
                              className="border-orange-500/30 text-orange-400 hover:bg-orange-600/10"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Regenerate
                            </Button>
                            <Button
                              onClick={() => copyContent(section.content, section.title)}
                              variant="outline"
                              size="sm"
                              className="border-gray-500/30 text-gray-400 hover:bg-gray-600/10"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                        </div>
                        
                        <div className="bg-black/20 rounded-lg p-4 max-h-96 overflow-y-auto">
                          <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-code:bg-gray-800 prose-code:text-gray-200 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-pre:bg-gray-800 prose-pre:text-gray-200 prose-pre:p-4 prose-pre:rounded prose-blockquote:border-l-orange-400 prose-blockquote:bg-gray-800/50 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:rounded-r prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-li:text-gray-300 prose-table:border prose-table:border-gray-600 prose-th:border prose-th:border-gray-600 prose-th:bg-gray-800 prose-th:p-3 prose-th:text-white prose-td:border prose-td:border-gray-600 prose-td:p-3 prose-td:text-gray-300 prose-a:text-orange-400 prose-a:no-underline hover:prose-a:underline">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({ children }) => <h1 className="text-xl font-bold text-white mb-4">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-lg font-semibold text-white mb-3">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-base font-medium text-white mb-2">{children}</h3>,
                                p: ({ children }) => <p className="text-gray-300 mb-3 leading-relaxed">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc list-inside text-gray-300 mb-3 space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal list-inside text-gray-300 mb-3 space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="text-gray-300">{children}</li>,
                                strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                                em: ({ children }) => <em className="italic text-gray-200">{children}</em>,
                                code: ({ children }) => <code className="bg-gray-800 text-gray-200 px-2 py-1 rounded text-sm font-mono">{children}</code>,
                                blockquote: ({ children }) => <blockquote className="border-l-4 border-orange-400 bg-gray-800/50 pl-4 py-2 rounded-r text-gray-300 italic">{children}</blockquote>,
                              }}
                            >
                              {section.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Milestones for Timeline Tracking section */}
                    {section.id === 'timeline-tracking' && (
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-white">Milestones</h4>
                          <Button
                            onClick={() => setIsAddingMilestone(true)}
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Milestone
                          </Button>
                        </div>

                        {/* Add Milestone Form */}
                        {isAddingMilestone && (
                          <Card className="bg-black/20 border-orange-500/20">
                            <CardContent className="p-4 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-white mb-2 block">Title</label>
                                  <input
                                    value={newMilestone.title}
                                    onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                                    placeholder="Milestone title"
                                    className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded text-white placeholder-gray-400 focus:border-orange-500/50 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-white mb-2 block">Due Date</label>
                                  <input
                                    type="date"
                                    value={newMilestone.dueDate}
                                    onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                                    className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded text-white focus:border-orange-500/50 focus:outline-none"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-white mb-2 block">Description</label>
                                <textarea
                                  value={newMilestone.description}
                                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                                  placeholder="Describe this milestone..."
                                  rows={2}
                                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded text-white placeholder-gray-400 focus:border-orange-500/50 focus:outline-none"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={addMilestone} size="sm" className="bg-orange-600 hover:bg-orange-700">
                                  Add Milestone
                                </Button>
                                <Button
                                  onClick={() => setIsAddingMilestone(false)}
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-500/30 text-gray-400 hover:bg-gray-600/10"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Milestones List */}
                        {section.milestones && section.milestones.length > 0 ? (
                          <div className="space-y-3">
                            {section.milestones.map((milestone) => (
                              <Card key={milestone.id} className="bg-black/20 border-white/10">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                      {getMilestoneStatusIcon(milestone.status)}
                                      <div>
                                        <h5 className="font-medium text-white">{milestone.title}</h5>
                                        <p className="text-sm text-gray-400">{milestone.description}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {getMilestoneStatusBadge(milestone.status)}
                                      {getPriorityBadge(milestone.priority)}
                                      <Button
                                        onClick={() => deleteMilestone(milestone.id)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-400 hover:text-red-400 hover:bg-red-600/10"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  {milestone.dueDate && (
                                    <div className="text-xs text-gray-500">
                                      Due: {milestone.dueDate.toLocaleDateString()}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-400">
                            No milestones yet. Add your first milestone to track progress.
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default JourneyView;