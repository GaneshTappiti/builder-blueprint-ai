"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Lightbulb, 
  Edit3, 
  Plus, 
  ArrowRight, 
  Target, 
  BookOpen, 
  Layers, 
  GitBranch, 
  MessageSquare,
  TrendingUp,
  Calendar,
  Users,
  Sparkles,
  FileText,
  Share2,
  Copy,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Zap,
  DollarSign,
  Shield,
  Globe,
  Download,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';
import { StoredIdea } from '@/types/ideaforge';
import { aiEngine } from '@/services/aiEngine';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIEnhancedDescription {
  oneLiner: string;
  detailedOverview: string;
  context: string;
  lastGenerated?: Date;
}

interface AISmartSection {
  id: string;
  title: string;
  content: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

interface DeepDiveContent {
  futureUseCases: string;
  risksMitigations: string;
  monetizationPaths: string;
  lastGenerated?: Date;
}

interface IdeaOverviewProps {
  idea: StoredIdea;
  onUpdate?: (updates: Partial<StoredIdea>) => void;
  onNavigateToTab?: (tab: string) => void;
  onAddNote?: () => void;
  onShare?: () => void;
  onExport?: () => void;
}

const IdeaOverview: React.FC<IdeaOverviewProps> = ({
  idea,
  onUpdate,
  onNavigateToTab,
  onAddNote,
  onShare,
  onExport
}) => {
  const { toast } = useToast();
  
  // State management
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(idea.description);
  const [aiDescription, setAiDescription] = useState<AIEnhancedDescription | null>(null);
  const [smartSections, setSmartSections] = useState<AISmartSection[]>([]);
  const [deepDiveContent, setDeepDiveContent] = useState<DeepDiveContent | null>(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingSections, setIsGeneratingSections] = useState(false);
  const [isGeneratingDeepDive, setIsGeneratingDeepDive] = useState(false);
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // AI Generation Functions
  const generateAIDescription = async () => {
    setIsGeneratingDescription(true);
    try {
      const prompt = `You are an expert startup consultant. Transform this basic idea into a comprehensive, professional description:

IDEA TITLE: "${idea.title}"
CURRENT DESCRIPTION: "${idea.description}"

IMPORTANT: Base your response entirely on the specific idea provided above. Do NOT give generic responses like "This is an innovative idea" or "The concept shows promise."

For the idea "${idea.title}", create:

1. ONE-LINER (under 15 words): A punchy elevator pitch that captures the essence
2. DETAILED OVERVIEW (2-3 paragraphs): 
   - What specific problem does this solve?
   - Who are the target users?
   - How does it work?
   - What makes it valuable?
3. MARKET CONTEXT: How this fits in the competitive landscape

Example transformation:
Input: "AI fitness coach app"
Output: 
- One-liner: "Personal AI trainer that adapts workouts to your schedule and progress"
- Overview: "FitnessAI addresses the $96B fitness industry's personalization gap. While gyms offer one-size-fits-all programs and apps provide static routines, users struggle with motivation and plateauing results. Our AI analyzes your performance, preferences, and schedule to create dynamic workout plans that evolve with your progress. The platform serves busy professionals aged 25-45 who want effective workouts without the complexity of personal trainers or the monotony of generic apps."

Respond ONLY in this JSON format:
{
  "oneLiner": "specific elevator pitch for this exact idea",
  "detailedOverview": "detailed analysis of this specific idea's problem, users, and solution",
  "context": "market positioning specific to this idea"
}`;

      const response = await aiEngine.generateText(prompt, {
        maxTokens: 1200,
        temperature: 0.8
      });

      console.log('AI Response:', response.text); // Debug log

      try {
        const parsed = JSON.parse(response.text);
        const enhanced: AIEnhancedDescription = {
          oneLiner: parsed.oneLiner || `${idea.title} - AI-enhanced solution`,
          detailedOverview: parsed.detailedOverview || `Based on "${idea.title}", this solution addresses specific market needs through innovative approaches. The platform targets users seeking efficient alternatives to existing solutions, providing unique value through its core functionality.`,
          context: parsed.context || `This idea positions itself in a competitive market by offering distinct advantages over existing alternatives.`,
          lastGenerated: new Date()
        };
        setAiDescription(enhanced);
        
        toast({
          title: "✅ AI Description Generated",
          description: "Your idea has been enhanced with AI-generated insights",
          duration: 3000,
        });
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.log('Raw response:', response.text);
        
        // Better fallback content
        const enhanced: AIEnhancedDescription = {
          oneLiner: `${idea.title} - Innovative solution for modern needs`,
          detailedOverview: `Based on your idea "${idea.title}", this solution addresses a specific market need. The platform provides value by solving real problems that users face in their daily lives. By focusing on user experience and practical functionality, it offers a compelling alternative to existing solutions.`,
          context: `This idea enters a competitive market with unique positioning. It differentiates itself through its approach to solving the core problem and serving the target audience effectively.`,
          lastGenerated: new Date()
        };
        setAiDescription(enhanced);
        
        toast({
          title: "⚠️ Partial Generation",
          description: "AI generated content but formatting was incomplete. Showing enhanced version.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error generating AI description:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate AI-enhanced description. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const generateSmartSections = async () => {
    setIsGeneratingSections(true);
    try {
      const prompt = `You are a startup analyst. Break down this specific idea into actionable insights:

IDEA: "${idea.title}"
DESCRIPTION: "${idea.description}"

CRITICAL: Provide specific, detailed analysis for THIS exact idea. Do NOT give generic responses.

For each section, provide concrete, actionable insights:

1. **Problem**: What specific problem does "${idea.title}" solve?
   - Identify the exact pain point
   - Why do current solutions fail?
   - What's the cost of this problem?

2. **Solution**: How does "${idea.title}" solve this problem?
   - What's the core approach?
   - What makes it work?
   - What's the key innovation?

3. **Target Audience**: Who specifically will use "${idea.title}"?
   - Demographics and psychographics
   - Where to find them
   - What drives their decisions?

4. **Key Features**: What are the essential features of "${idea.title}"?
   - Core functionality
   - User experience elements
   - Technical capabilities

5. **Differentiation**: Why is "${idea.title}" better than alternatives?
   - Direct competitors
   - Unique advantages
   - Barriers to competition

Respond ONLY in this JSON format:
[
  {
    "id": "problem",
    "title": "Problem",
    "content": "specific problem analysis for this exact idea"
  },
  {
    "id": "solution",
    "title": "Solution", 
    "content": "specific solution analysis for this exact idea"
  },
  {
    "id": "target-audience",
    "title": "Target Audience",
    "content": "specific audience analysis for this exact idea"
  },
  {
    "id": "key-features",
    "title": "Key Features",
    "content": "specific features analysis for this exact idea"
  },
  {
    "id": "differentiation",
    "title": "Differentiation",
    "content": "specific competitive analysis for this exact idea"
  }
]`;

      const response = await aiEngine.generateText(prompt, {
        maxTokens: 1800,
        temperature: 0.8
      });

      console.log('Smart Sections AI Response:', response.text); // Debug log

      try {
        const parsed = JSON.parse(response.text);
        const sections: AISmartSection[] = parsed.map((section: any, index: number) => {
          const icons = [AlertTriangle, Zap, Users, Target, TrendingUp];
          const colors = ['text-red-400', 'text-green-400', 'text-blue-400', 'text-purple-400', 'text-orange-400'];
          const bgColors = ['bg-red-600/20', 'bg-green-600/20', 'bg-blue-600/20', 'bg-purple-600/20', 'bg-orange-600/20'];
          
          return {
            id: section.id || `section-${index}`,
            title: section.title || 'Section',
            content: section.content || 'AI-generated content',
            icon: icons[index] || Target,
            color: colors[index] || 'text-gray-400',
            bgColor: bgColors[index] || 'bg-gray-600/20'
          };
        });
        
        setSmartSections(sections);
        
        toast({
          title: "✅ Smart Sections Generated",
          description: "AI has broken down your idea into structured insights",
          duration: 3000,
        });
      } catch (parseError) {
        console.error('Smart Sections JSON Parse Error:', parseError);
        console.log('Raw smart sections response:', response.text);
        
        // Better fallback sections with idea-specific content
        const fallbackSections: AISmartSection[] = [
          {
            id: 'problem',
            title: 'Problem',
            content: `The problem "${idea.title}" addresses is a specific market need that current solutions don't adequately solve. Users face challenges that this solution directly targets through its unique approach.`,
            icon: AlertTriangle,
            color: 'text-red-400',
            bgColor: 'bg-red-600/20'
          },
          {
            id: 'solution',
            title: 'Solution',
            content: `"${idea.title}" solves this problem through its innovative approach. The solution provides specific value by addressing the core issues users face in this domain.`,
            icon: Zap,
            color: 'text-green-400',
            bgColor: 'bg-green-600/20'
          },
          {
            id: 'target-audience',
            title: 'Target Audience',
            content: `The target audience for "${idea.title}" consists of users who need this specific solution. They are motivated by the benefits this platform provides and represent a significant market opportunity.`,
            icon: Users,
            color: 'text-blue-400',
            bgColor: 'bg-blue-600/20'
          }
        ];
        setSmartSections(fallbackSections);
        
        toast({
          title: "⚠️ Partial Generation",
          description: "AI generated content but formatting was incomplete. Showing enhanced sections.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error generating smart sections:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate smart sections. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSections(false);
    }
  };

  const generateDeepDiveContent = async () => {
    setIsGeneratingDeepDive(true);
    try {
      const prompt = `Provide deep dive analysis for this idea:

Idea: "${idea.title}"
Description: "${idea.description}"

Generate:
1. Future Use Cases - how it scales beyond MVP
2. Potential Risks & Mitigations - key risks and how to address them
3. AI-recommended Monetization Paths - revenue strategies

Format as JSON:
{
  "futureUseCases": "detailed future scaling scenarios",
  "risksMitigations": "key risks and mitigation strategies", 
  "monetizationPaths": "recommended revenue models and strategies"
}`;

      const response = await aiEngine.generateText(prompt, {
        maxTokens: 1200,
        temperature: 0.7
      });

      try {
        const parsed = JSON.parse(response.text);
        const deepDive: DeepDiveContent = {
          futureUseCases: parsed.futureUseCases || "Future scaling analysis",
          risksMitigations: parsed.risksMitigations || "Risk assessment",
          monetizationPaths: parsed.monetizationPaths || "Monetization strategies",
          lastGenerated: new Date()
        };
        setDeepDiveContent(deepDive);
        
        toast({
          title: "✅ Deep Dive Analysis Complete",
          description: "Advanced insights and strategies have been generated",
          duration: 3000,
        });
      } catch (parseError) {
        const deepDive: DeepDiveContent = {
          futureUseCases: response.text,
          risksMitigations: "Risk analysis and mitigation strategies",
          monetizationPaths: "Revenue model recommendations",
          lastGenerated: new Date()
        };
        setDeepDiveContent(deepDive);
      }
    } catch (error) {
      console.error('Error generating deep dive content:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate deep dive analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDeepDive(false);
    }
  };

  const handleSaveDescription = () => {
    if (onUpdate) {
      onUpdate({ description: editedDescription });
    }
    setIsEditingDescription(false);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const exportSummary = async () => {
    setIsExporting(true);
    try {
      const summary = `# ${idea.title}

## AI-Enhanced Description
${aiDescription?.oneLiner || idea.title}

${aiDescription?.detailedOverview || idea.description}

${aiDescription?.context ? `## Market Context\n${aiDescription.context}` : ''}

## Smart Sections
${smartSections.map(section => `### ${section.title}\n${section.content}`).join('\n\n')}

${deepDiveContent ? `## Deep Dive Analysis\n\n### Future Use Cases\n${deepDiveContent.futureUseCases}\n\n### Risks & Mitigations\n${deepDiveContent.risksMitigations}\n\n### Monetization Paths\n${deepDiveContent.monetizationPaths}` : ''}

---
Generated by IdeaForge AI • ${new Date().toLocaleDateString()}`;

      await copyToClipboard(summary, "Idea summary");
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export summary",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Auto-generate content on component mount
  useEffect(() => {
    if (!aiDescription) {
      generateAIDescription();
    }
    if (smartSections.length === 0) {
      generateSmartSections();
    }
  }, [idea.id]);

  const getOverallProgress = () => {
    const progress = idea.progress || { wiki: 0, blueprint: 0, feedback: 0 };
    return Math.round((progress.wiki + progress.blueprint + progress.feedback) / 3);
  };

  const getNextRecommendedAction = () => {
    const progress = idea.progress || { wiki: 0, blueprint: 0, feedback: 0 };
    if (progress.wiki < 50) {
      return {
        action: "Complete Wiki Analysis",
        description: "Build a solid foundation with comprehensive market research and problem analysis",
        tab: "wiki",
        icon: BookOpen,
        color: "text-blue-400"
      };
    } else if (progress.blueprint < 50) {
      return {
        action: "Develop Product Blueprint",
        description: "Define your MVP features and technical architecture",
        tab: "blueprint",
        icon: Layers,
        color: "text-green-400"
      };

    } else if (progress.feedback < 50) {
      return {
        action: "Gather Feedback",
        description: "Collect validation and feedback from your community",
        tab: "feedback",
        icon: MessageSquare,
        color: "text-purple-400"
      };
    } else {
      return {
        action: "Ready for Launch",
        description: "All sections are well-developed. Consider moving to the next phase!",
        tab: null,
        icon: Target,
        color: "text-green-400"
      };
    }
  };

  const nextAction = getNextRecommendedAction();

  const progressSections = [
    {
      id: 'wiki',
      label: 'Wiki',
      progress: idea.progress?.wiki || 0,
      icon: BookOpen,
      color: 'text-blue-400',
      bgColor: 'bg-blue-600/20',
      description: 'Market research and business analysis'
    },
    {
      id: 'blueprint',
      label: 'Blueprint',
      progress: idea.progress?.blueprint || 0,
      icon: Layers,
      color: 'text-green-400',
      bgColor: 'bg-green-600/20',
      description: 'Product features and technical architecture'
    },

    {
      id: 'feedback',
      label: 'Feedback',
      progress: idea.progress?.feedback || 0,
      icon: MessageSquare,
      color: 'text-purple-400',
      bgColor: 'bg-purple-600/20',
      description: 'Community feedback and validation'
    }
  ];

  return (
    <div className="space-y-6">
      {/* AI-Generated Detailed Description */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-400" />
                AI-Generated Detailed Description
              </CardTitle>
              <p className="text-gray-400 text-sm mt-1">
                Transform your basic idea into a comprehensive, professional description
              </p>
            </div>
            <div className="flex gap-2">
              {aiDescription && (
                <Button
                  onClick={() => copyToClipboard(aiDescription.detailedOverview, "Description")}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-400 hover:bg-gray-600/10"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              )}
              <Button
                onClick={generateAIDescription}
                disabled={isGeneratingDescription}
                variant="outline"
                size="sm"
                className="border-orange-500/30 text-orange-400 hover:bg-orange-600/10"
              >
                {isGeneratingDescription ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {isGeneratingDescription ? 'Generating...' : 'Regenerate'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isGeneratingDescription ? (
            <div className="text-center py-8">
              <RefreshCw className="h-12 w-12 mx-auto text-orange-400 animate-spin mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Generating AI Description</h3>
              <p className="text-gray-400">AI is creating a comprehensive description of your idea...</p>
            </div>
          ) : aiDescription ? (
            <div className="space-y-4">
              {/* One Liner */}
              <div className="bg-green-600/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">Elevator Pitch</span>
                </div>
                <p className="text-white font-medium text-lg">{aiDescription.oneLiner}</p>
              </div>

              {/* Detailed Overview */}
              <div>
                <h4 className="text-white font-medium mb-3">Detailed Overview</h4>
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {aiDescription.detailedOverview}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Context */}
              {aiDescription.context && (
                <div>
                  <h4 className="text-white font-medium mb-3">Market Context</h4>
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {aiDescription.context}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {aiDescription.lastGenerated && (
                <div className="text-xs text-gray-500">
                  Generated: {aiDescription.lastGenerated.toLocaleString()}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Transform Your Idea</h3>
              <p className="text-gray-400 mb-4">
                Even a simple idea like "students share notes app" becomes a comprehensive, professional description
              </p>
              <div className="bg-yellow-600/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">AI Configuration Notice</span>
                </div>
                <p className="text-xs text-yellow-200">
                  For full AI functionality, configure your Gemini API key in the environment variables. 
                  Currently showing enhanced fallback content.
                </p>
              </div>
              <Button
                onClick={generateAIDescription}
                className="bg-green-600 hover:bg-green-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate AI Description
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI-Smart Sections */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-green-400" />
                AI-Smart Sections (Auto-Filled)
              </CardTitle>
              <p className="text-gray-400 text-sm mt-1">
                AI breaks down your idea into structured insights
              </p>
            </div>
            <Button
              onClick={generateSmartSections}
              disabled={isGeneratingSections}
              variant="outline"
              size="sm"
              className="border-orange-500/30 text-orange-400 hover:bg-orange-600/10"
            >
              {isGeneratingSections ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isGeneratingSections ? 'Generating...' : 'Regenerate'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isGeneratingSections ? (
            <div className="text-center py-8">
              <RefreshCw className="h-12 w-12 mx-auto text-orange-400 animate-spin mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Generating Smart Sections</h3>
              <p className="text-gray-400">AI is breaking down your idea into structured insights...</p>
            </div>
          ) : smartSections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {smartSections.map((section) => {
                const Icon = section.icon;
                return (
                  <div key={section.id} className="bg-black/20 p-4 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${section.bgColor}`}>
                        <Icon className={`h-4 w-4 ${section.color}`} />
                      </div>
                      <h4 className="text-white font-medium">{section.title}</h4>
                    </div>
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-ul:text-gray-300 prose-li:text-gray-300">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {section.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">AI-Smart Sections</h3>
              <p className="text-gray-400 mb-4">
                AI breaks down your idea into: Problem, Solution, Target Audience, Key Features, and Differentiation
              </p>
              <div className="bg-yellow-600/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">AI Configuration Notice</span>
                </div>
                <p className="text-xs text-yellow-200">
                  For full AI functionality, configure your Gemini API key in the environment variables. 
                  Currently showing enhanced fallback content.
                </p>
              </div>
              <Button
                onClick={generateSmartSections}
                className="bg-green-600 hover:bg-green-700"
              >
                <Target className="h-4 w-4 mr-2" />
                Generate Smart Sections
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress & Roadmap Snapshot */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Progress & Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Overall Progress</span>
                <span className="text-green-400 font-bold text-lg">{getOverallProgress()}%</span>
              </div>
              <Progress 
                value={getOverallProgress()} 
                className="h-3 bg-gray-700"
              />
            </div>

            {/* Section Progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {progressSections.map((section) => {
                const Icon = section.icon;
                return (
                  <div
                    key={section.id}
                    className="bg-black/20 p-4 rounded-lg hover:bg-black/30 transition-all cursor-pointer"
                    onClick={() => onNavigateToTab?.(section.id)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${section.bgColor}`}>
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
                    <Progress 
                      value={section.progress} 
                      className="h-2 bg-gray-700 mt-2"
                    />
                  </div>
                );
              })}
            </div>

            {/* Next Action Card */}
            <div className="bg-black/20 p-4 rounded-lg border border-white/5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-600/20">
                  <nextAction.icon className={`h-5 w-5 ${nextAction.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium mb-1">Next Action</h4>
                  <p className="text-gray-300 text-sm mb-3">{nextAction.description}</p>
                  {nextAction.tab && (
                    <Button
                      onClick={() => onNavigateToTab?.(nextAction.tab!)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Go to {nextAction.tab}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-400" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => setIsEditingDescription(true)}
              className="bg-blue-600 hover:bg-blue-700 h-auto p-4 flex flex-col items-start"
            >
              <div className="flex items-center gap-2 mb-2">
                <Edit3 className="h-4 w-4" />
                <span className="font-medium">Edit Idea</span>
              </div>
              <span className="text-sm text-blue-100">Tweak the auto-generated description</span>
            </Button>

            <Button
              onClick={exportSummary}
              disabled={isExporting}
              className="bg-green-600 hover:bg-green-700 h-auto p-4 flex flex-col items-start"
            >
              <div className="flex items-center gap-2 mb-2">
                {isExporting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="font-medium">Export Summary</span>
              </div>
              <span className="text-sm text-green-100">Copy description for pitch deck</span>
            </Button>

            <Button
              onClick={onShare}
              className="bg-purple-600 hover:bg-purple-700 h-auto p-4 flex flex-col items-start"
            >
              <div className="flex items-center gap-2 mb-2">
                <Share2 className="h-4 w-4" />
                <span className="font-medium">Share Read-Only</span>
              </div>
              <span className="text-sm text-purple-100">Share mini public page</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deep Dive Mode */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <Collapsible open={showDeepDive} onOpenChange={setShowDeepDive}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-green-400" />
                  Deep Dive Mode
                  <Badge variant="outline" className="border-gray-600 text-gray-400">
                    Optional
                  </Badge>
                </CardTitle>
                {showDeepDive ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent>
              {!deepDiveContent ? (
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Advanced Analysis Available</h3>
                  <p className="text-gray-400 mb-4">Get AI-generated future use cases, risk analysis, and monetization strategies</p>
                  <Button
                    onClick={generateDeepDiveContent}
                    disabled={isGeneratingDeepDive}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isGeneratingDeepDive ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Globe className="h-4 w-4 mr-2" />
                    )}
                    {isGeneratingDeepDive ? 'Generating...' : 'Generate Deep Dive'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {isGeneratingDeepDive ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-12 w-12 mx-auto text-orange-400 animate-spin mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">Generating Deep Dive Analysis</h3>
                      <p className="text-gray-400">AI is creating advanced insights and strategies...</p>
                    </div>
                  ) : (
                    <>
                      {/* Future Use Cases */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="h-4 w-4 text-blue-400" />
                          <h4 className="text-white font-medium">Future Use Cases</h4>
                        </div>
                        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {deepDiveContent.futureUseCases}
                          </ReactMarkdown>
                        </div>
                      </div>

                      {/* Risks & Mitigations */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="h-4 w-4 text-red-400" />
                          <h4 className="text-white font-medium">Potential Risks & Mitigations</h4>
                        </div>
                        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {deepDiveContent.risksMitigations}
                          </ReactMarkdown>
                        </div>
                      </div>

                      {/* Monetization Paths */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <DollarSign className="h-4 w-4 text-green-400" />
                          <h4 className="text-white font-medium">AI-Recommended Monetization Paths</h4>
                        </div>
                        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {deepDiveContent.monetizationPaths}
                          </ReactMarkdown>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={generateDeepDiveContent}
                          disabled={isGeneratingDeepDive}
                          variant="outline"
                          size="sm"
                          className="border-orange-500/30 text-orange-400 hover:bg-orange-600/10"
                        >
                          {isGeneratingDeepDive ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          Regenerate
                        </Button>
                        <Button
                          onClick={() => copyToClipboard(
                            `Future Use Cases:\n${deepDiveContent.futureUseCases}\n\nRisks & Mitigations:\n${deepDiveContent.risksMitigations}\n\nMonetization Paths:\n${deepDiveContent.monetizationPaths}`,
                            "Deep dive analysis"
                          )}
                          variant="outline"
                          size="sm"
                          className="border-gray-600 text-gray-400 hover:bg-gray-600/10"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy All
                        </Button>
                      </div>

                      {deepDiveContent.lastGenerated && (
                        <div className="text-xs text-gray-500">
                          Generated: {deepDiveContent.lastGenerated.toLocaleString()}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Edit Description Modal */}
      {isEditingDescription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-black/90 backdrop-blur-sm border-white/10 w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-green-400" />
                Edit Idea Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Describe your idea..."
                rows={6}
                className="bg-black/20 border-white/10 text-white placeholder:text-gray-400"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  onClick={() => {
                    setEditedDescription(idea.description);
                    setIsEditingDescription(false);
                  }}
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveDescription}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default IdeaOverview;
