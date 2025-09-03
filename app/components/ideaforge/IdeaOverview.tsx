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
  EyeOff,
  Brain,
  Rocket,
  Star,
  Award,
  Compass,
  Search,
  Send,
  FileDown
} from 'lucide-react';
import { StoredIdea } from '@/types/ideaforge';
import { aiEngine } from '@/services/aiEngine';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIOverviewContent {
  problemStatement: string;
  proposedSolution: string;
  targetAudience: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  uniqueValue: string;
  coreFeatures: string[];
  narrative: string;
  lastGenerated?: Date;
}

interface IdeaStage {
  current: 'researching' | 'validated' | 'blueprinted' | 'mvp-studio';
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

interface QuickStats {
  status: string;
  createdDate: string;
  lastUpdated: string;
  currentStage: IdeaStage;
  aiValidated: boolean;
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
  const [aiOverview, setAiOverview] = useState<AIOverviewContent | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [isGeneratingOverview, setIsGeneratingOverview] = useState(false);
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pitchOneLiner, setPitchOneLiner] = useState<string>('');

  // AI Generation Functions
  const generateAIOverview = async () => {
    setIsGeneratingOverview(true);
    try {
      const prompt = `You are a senior startup consultant and pitch deck specialist. Transform this basic idea into a comprehensive, professional overview that makes founders feel their idea has already taken shape.

IDEA TITLE: "${idea.title}"
CURRENT DESCRIPTION: "${idea.description}"

CRITICAL INSTRUCTIONS:
- Base your response ENTIRELY on the specific idea provided above
- Be specific, actionable, and inspiring
- Use concrete examples and data where possible
- Make it compelling for founders, team members, mentors, and investors
- Create content that feels like the idea is already a real business

For the idea "${idea.title}", create a comprehensive overview with:

1. PROBLEM STATEMENT: A clear, sharp, human-readable problem statement that goes beyond what the user typed
2. PROPOSED SOLUTION: A solution story that explains how the idea works and why it's effective
3. TARGET AUDIENCE: Auto-detect and specify primary, secondary, and tertiary audiences
4. UNIQUE VALUE: Highlight what makes this different from competitors with specific positioning
5. CORE FEATURES: List 4-6 essential features that make this solution work
6. NARRATIVE: A professional one-pager that tells the story of this idea in an inspiring way

Example transformation for "students share notes app":
- Problem: "Students waste hours searching WhatsApp groups, Telegram channels, or scattered Google Drives to find quality notes. This leads to stress, uneven preparation, and missed opportunities for collaborative learning."
- Solution: "Scollab is a peer-to-peer note-sharing platform where students can upload, rate, and access verified notes instantly. With intelligent search, version history, and gamified rewards, students save time, find quality resources, and feel motivated to contribute."
- Target Audience: Primary: College students, Secondary: Tutors/coaching centers, Tertiary: Academic admins
- Unique Value: "Unlike Google Drive folders or Telegram groups, Scollab ensures quality through peer ratings + gamification credits for contributors."
- Core Features: ["Upload & share notes", "Intelligent search & filters", "Peer rating system", "Contributor rewards system", "Profile & collaboration features"]
- Narrative: "Scollab – Peer-to-Peer Learning Made Simple. Today's students waste hours hunting for notes. Scollab transforms this experience by creating a trusted academic hub where knowledge flows seamlessly. Whether preparing for exams, collaborating on projects, or revising concepts, students can instantly find and share resources. With AI-enhanced organization, gamified motivation, and a community-driven trust system, Scollab empowers students to learn faster, together."

Respond ONLY in this JSON format:
{
  "problemStatement": "refined problem statement for this exact idea",
  "proposedSolution": "solution story for this exact idea",
  "targetAudience": {
    "primary": "primary target audience",
    "secondary": "secondary target audience", 
    "tertiary": "tertiary target audience"
  },
  "uniqueValue": "unique positioning and competitive advantage",
  "coreFeatures": ["feature 1", "feature 2", "feature 3", "feature 4", "feature 5"],
  "narrative": "professional one-pager narrative"
}`;

      const response = await aiEngine.generateText(prompt, {
        maxTokens: 1500,
        temperature: 0.8
      });

      console.log('AI Overview Response:', response.text);

      try {
        const parsed = JSON.parse(response.text);
        const overview: AIOverviewContent = {
          problemStatement: parsed.problemStatement || `The problem "${idea.title}" addresses is a specific market need that current solutions don't adequately solve.`,
          proposedSolution: parsed.proposedSolution || `"${idea.title}" solves this problem through its innovative approach and unique value proposition.`,
          targetAudience: {
            primary: parsed.targetAudience?.primary || 'Primary target users',
            secondary: parsed.targetAudience?.secondary || 'Secondary market segment',
            tertiary: parsed.targetAudience?.tertiary || 'Tertiary opportunity'
          },
          uniqueValue: parsed.uniqueValue || `"${idea.title}" differentiates itself through its unique approach and competitive advantages.`,
          coreFeatures: parsed.coreFeatures || ['Core feature 1', 'Core feature 2', 'Core feature 3', 'Core feature 4'],
          narrative: parsed.narrative || `"${idea.title}" represents an innovative solution that addresses real market needs through its unique approach and value proposition.`,
          lastGenerated: new Date()
        };
        setAiOverview(overview);
        
        toast({
          title: "✅ AI Overview Generated",
          description: "Your idea has been transformed into a professional overview",
          duration: 3000,
        });
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        
        // Fallback content
        const overview: AIOverviewContent = {
          problemStatement: `The problem "${idea.title}" addresses is a specific market need that current solutions don't adequately solve. Users face challenges that this solution directly targets.`,
          proposedSolution: `"${idea.title}" solves this problem through its innovative approach. The solution provides specific value by addressing the core issues users face in this domain.`,
          targetAudience: {
            primary: 'Primary target users who need this solution',
            secondary: 'Secondary market segment with related needs',
            tertiary: 'Tertiary opportunity for expansion'
          },
          uniqueValue: `"${idea.title}" differentiates itself through its unique approach and competitive advantages over existing alternatives.`,
          coreFeatures: ['Core functionality', 'User experience features', 'Key capabilities', 'Essential tools'],
          narrative: `"${idea.title}" represents an innovative solution that addresses real market needs. This platform provides value by solving specific problems that users face, offering a compelling alternative to existing solutions.`,
          lastGenerated: new Date()
        };
        setAiOverview(overview);
        
        toast({
          title: "⚠️ Partial Generation",
          description: "AI generated content but formatting was incomplete. Showing enhanced version.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error generating AI overview:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate AI overview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingOverview(false);
    }
  };

  const generatePitchOneLiner = async () => {
    setIsGeneratingPitch(true);
    try {
      const prompt = `You are a startup pitch expert. Create a compelling one-liner for this idea that's perfect for LinkedIn posts, tweets, or elevator pitches.

IDEA: "${idea.title}"
DESCRIPTION: "${idea.description}"

Create a punchy, memorable one-liner (under 15 words) that:
- Captures the essence and value proposition
- Is LinkedIn/tweet-friendly
- Makes people want to learn more
- Sounds professional and exciting

Examples:
- "Personal AI trainer that adapts workouts to your schedule and progress"
- "Peer-to-peer note sharing platform that gamifies academic collaboration"
- "AI-powered meal planning that eliminates food waste and saves money"

Respond with just the one-liner, no quotes or extra text.`;

      const response = await aiEngine.generateText(prompt, {
        maxTokens: 50,
        temperature: 0.9
      });

      const oneLiner = response.text.trim().replace(/^["']|["']$/g, '');
      setPitchOneLiner(oneLiner);
        
        toast({
        title: "✅ Pitch One-Liner Generated",
        description: "Perfect for LinkedIn, tweets, and elevator pitches",
          duration: 3000,
        });
    } catch (error) {
      console.error('Error generating pitch one-liner:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate pitch one-liner. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const getCurrentStage = (): IdeaStage => {
    const progress = idea.progress || { wiki: 0, blueprint: 0, feedback: 0 };
    const overallProgress = Math.round((progress.wiki + progress.blueprint + progress.feedback) / 3);
    
    if (overallProgress < 25) {
      return {
        current: 'researching',
        label: 'Researching',
        description: 'Building foundation with market research',
        color: 'text-blue-400',
        bgColor: 'bg-blue-600/20'
      };
    } else if (overallProgress < 50) {
      return {
        current: 'validated',
        label: 'Validated',
        description: 'Problem-solution fit confirmed',
        color: 'text-green-400',
        bgColor: 'bg-green-600/20'
      };
    } else if (overallProgress < 75) {
      return {
        current: 'blueprinted',
        label: 'Blueprinted',
        description: 'Product architecture defined',
        color: 'text-purple-400',
        bgColor: 'bg-purple-600/20'
      };
    } else {
      return {
        current: 'mvp-studio',
        label: 'MVP Studio',
        description: 'Ready for development',
        color: 'text-orange-400',
        bgColor: 'bg-orange-600/20'
      };
    }
  };

  const initializeQuickStats = () => {
    const stats: QuickStats = {
      status: idea.status || 'draft',
      createdDate: new Date(idea.createdAt).toLocaleDateString(),
      lastUpdated: new Date(idea.updatedAt).toLocaleDateString(),
      currentStage: getCurrentStage(),
      aiValidated: !!aiOverview
    };
    setQuickStats(stats);
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

  const exportIdeaOverview = async () => {
    setIsExporting(true);
    try {
      if (!aiOverview) {
        toast({
          title: "No Overview Available",
          description: "Please generate AI overview first",
          variant: "destructive",
        });
        return;
      }

      const overview = `# ${idea.title} - AI-Generated Overview

## Problem Statement
${aiOverview.problemStatement}

## Proposed Solution
${aiOverview.proposedSolution}

## Target Audience
- **Primary:** ${aiOverview.targetAudience.primary}
- **Secondary:** ${aiOverview.targetAudience.secondary}
- **Tertiary:** ${aiOverview.targetAudience.tertiary}

## Unique Value Proposition
${aiOverview.uniqueValue}

## Core Features
${aiOverview.coreFeatures.map(feature => `- ${feature}`).join('\n')}

## Professional Narrative
${aiOverview.narrative}

${pitchOneLiner ? `\n## Pitch One-Liner\n"${pitchOneLiner}"` : ''}

---
Generated by IdeaForge AI • ${new Date().toLocaleDateString()}`;

      await copyToClipboard(overview, "Idea overview");
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export overview",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Auto-generate content on component mount
  useEffect(() => {
    if (!aiOverview) {
      generateAIOverview();
    }
    initializeQuickStats();
  }, [idea.id]);

  useEffect(() => {
    initializeQuickStats();
  }, [aiOverview]);

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

  return (
    <div className="space-y-6">
      {/* AI-Powered Idea Overview Header */}
      <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border-purple-500/30">
        <CardContent className="pt-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <Brain className="h-8 w-8 text-purple-400" />
              AI-Powered Idea Overview
            </h2>
            <p className="text-gray-300 mb-6 text-lg">
              Transform your basic idea into a professional, inspiring overview that makes you feel like your startup has already taken shape
            </p>
            <Button
              onClick={generateAIOverview}
              disabled={isGeneratingOverview}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-3"
            >
              {isGeneratingOverview ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                  Generating AI Overview...
                </>
              ) : (
                <>
                  <Rocket className="h-5 w-5 mr-3" />
                  Generate AI Overview
                </>
              )}
            </Button>
            <p className="text-xs text-gray-400 mt-3">
              Creates: Problem Statement, Solution Story, Target Audience, Unique Value, Core Features, and Professional Narrative
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI-Generated Overview Content */}
      {isGeneratingOverview ? (
        <Card className="bg-black/40 backdrop-blur-sm border-white/10">
          <CardContent className="py-12">
            <div className="text-center">
              <RefreshCw className="h-16 w-16 mx-auto text-purple-400 animate-spin mb-6" />
              <h3 className="text-2xl font-bold text-white mb-3">Generating AI Overview</h3>
              <p className="text-gray-400 text-lg">AI is transforming your idea into a professional, inspiring overview...</p>
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Analyzing problem statement
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Crafting solution story
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                  <RefreshCw className="h-4 w-4 text-purple-400 animate-spin" />
                  Identifying target audience
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : aiOverview ? (
        <div className="space-y-6">
          {/* Professional Narrative */}
          <Card className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-400" />
                Professional Narrative
              </CardTitle>
              <p className="text-gray-400 text-sm">The story of your idea that inspires and excites</p>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-white prose-p:text-gray-200 prose-strong:text-white">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {aiOverview.narrative}
                </ReactMarkdown>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => copyToClipboard(aiOverview.narrative, "Narrative")}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-400 hover:bg-gray-600/10"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Narrative
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Problem & Solution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-red-600/10 backdrop-blur-sm border-red-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  Problem Statement
                </CardTitle>
                <p className="text-gray-400 text-sm">The refined, sharp problem your idea solves</p>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-white prose-p:text-gray-200 prose-strong:text-white">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {aiOverview.problemStatement}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-600/10 backdrop-blur-sm border-green-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-400" />
                  Proposed Solution
                </CardTitle>
                <p className="text-gray-400 text-sm">How your idea solves the problem</p>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-white prose-p:text-gray-200 prose-strong:text-white">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {aiOverview.proposedSolution}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Target Audience */}
          <Card className="bg-blue-600/10 backdrop-blur-sm border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Target Audience
              </CardTitle>
              <p className="text-gray-400 text-sm">Auto-detected audience segments</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-600/20 p-4 rounded-lg">
                  <h4 className="text-blue-400 font-medium mb-2">Primary</h4>
                  <p className="text-gray-200 text-sm">{aiOverview.targetAudience.primary}</p>
                </div>
                <div className="bg-blue-600/20 p-4 rounded-lg">
                  <h4 className="text-blue-400 font-medium mb-2">Secondary</h4>
                  <p className="text-gray-200 text-sm">{aiOverview.targetAudience.secondary}</p>
                </div>
                <div className="bg-blue-600/20 p-4 rounded-lg">
                  <h4 className="text-blue-400 font-medium mb-2">Tertiary</h4>
                  <p className="text-gray-200 text-sm">{aiOverview.targetAudience.tertiary}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unique Value & Core Features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-purple-600/10 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-400" />
                  Unique Value Proposition
                </CardTitle>
                <p className="text-gray-400 text-sm">What makes you different from competitors</p>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-white prose-p:text-gray-200 prose-strong:text-white">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {aiOverview.uniqueValue}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-600/10 backdrop-blur-sm border-orange-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-400" />
                  Core Features
                </CardTitle>
                <p className="text-gray-400 text-sm">Essential features that make your solution work</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {aiOverview.coreFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-orange-600/20 rounded-lg">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span className="text-gray-200 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {aiOverview.lastGenerated && (
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Generated: {aiOverview.lastGenerated.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      ) : (
        <Card className="bg-black/40 backdrop-blur-sm border-white/10">
          <CardContent className="py-12">
            <div className="text-center">
              <Brain className="h-16 w-16 mx-auto text-gray-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-3">Transform Your Idea</h3>
              <p className="text-gray-400 text-lg mb-6">
                Even a simple idea like "students share notes app" becomes a comprehensive, professional overview that makes founders feel their startup has already taken shape
              </p>
              <div className="bg-yellow-600/10 border border-yellow-500/20 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
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
                onClick={generateAIOverview}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                size="lg"
              >
                <Rocket className="h-5 w-5 mr-2" />
                Generate AI Overview
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Quick Stats */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Quick Stats
          </CardTitle>
          <p className="text-gray-400 text-sm">AI-validated status and progress tracking</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-black/20 p-4 rounded-lg border border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-green-600/20">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>
                <span className="text-white font-medium">Status</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={quickStats?.currentStage.bgColor + ' ' + quickStats?.currentStage.color}>
                  {quickStats?.currentStage.label || 'Draft'}
                </Badge>
                {quickStats?.aiValidated && (
                  <Badge className="bg-green-600/20 text-green-400">
                    AI Validated
                  </Badge>
                )}
              </div>
            </div>

            <div className="bg-black/20 p-4 rounded-lg border border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-600/20">
                  <Calendar className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-white font-medium">Created</span>
              </div>
              <p className="text-gray-300 text-sm">{quickStats?.createdDate || new Date(idea.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="bg-black/20 p-4 rounded-lg border border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-purple-600/20">
                  <RefreshCw className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-white font-medium">Last Updated</span>
              </div>
              <p className="text-gray-300 text-sm">{quickStats?.lastUpdated || new Date(idea.updatedAt).toLocaleDateString()}</p>
            </div>

            <div className="bg-black/20 p-4 rounded-lg border border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-orange-600/20">
                  <Compass className="h-4 w-4 text-orange-400" />
                </div>
                <span className="text-white font-medium">Current Stage</span>
              </div>
              <p className="text-gray-300 text-sm">{quickStats?.currentStage.description || 'Building foundation'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Quick Actions */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-400" />
            Smart Quick Actions
          </CardTitle>
          <p className="text-gray-400 text-sm">AI-powered actions to refine and share your idea</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={generateAIOverview}
              disabled={isGeneratingOverview}
              className="bg-blue-600 hover:bg-blue-700 h-auto p-4 flex flex-col items-start"
            >
              <div className="flex items-center gap-2 mb-2">
                <Edit3 className="h-4 w-4" />
                <span className="font-medium">Refine Problem</span>
              </div>
              <span className="text-sm text-blue-100">AI asks clarifying questions and regenerates</span>
            </Button>

            <Button
              onClick={generatePitchOneLiner}
              disabled={isGeneratingPitch}
              className="bg-green-600 hover:bg-green-700 h-auto p-4 flex flex-col items-start"
            >
              <div className="flex items-center gap-2 mb-2">
                {isGeneratingPitch ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="font-medium">Generate Pitch One-Liner</span>
              </div>
              <span className="text-sm text-green-100">Instant LinkedIn/tweet-friendly tagline</span>
            </Button>

            <Button
              onClick={() => onNavigateToTab?.('wiki')}
              className="bg-purple-600 hover:bg-purple-700 h-auto p-4 flex flex-col items-start"
            >
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4" />
                <span className="font-medium">Send to Wiki</span>
              </div>
              <span className="text-sm text-purple-100">Move deeper into competitor analysis</span>
            </Button>

            <Button
              onClick={exportIdeaOverview}
              disabled={isExporting}
              className="bg-orange-600 hover:bg-orange-700 h-auto p-4 flex flex-col items-start"
            >
              <div className="flex items-center gap-2 mb-2">
                {isExporting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                <span className="font-medium">Export Idea Overview</span>
              </div>
              <span className="text-sm text-orange-100">PDF, Markdown, or copy to clipboard</span>
            </Button>
          </div>

          {/* Pitch One-Liner Display */}
          {pitchOneLiner && (
            <div className="mt-6 p-4 bg-green-600/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Send className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">Generated Pitch One-Liner</span>
              </div>
              <p className="text-white font-medium text-lg mb-3">"{pitchOneLiner}"</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => copyToClipboard(pitchOneLiner, "Pitch one-liner")}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-400 hover:bg-gray-600/10"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  onClick={generatePitchOneLiner}
                  disabled={isGeneratingPitch}
                  variant="outline"
                  size="sm"
                  className="border-orange-500/30 text-orange-400 hover:bg-orange-600/10"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress & Next Action */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Progress & Next Action
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
    </div>
  );
};

export default IdeaOverview;
