"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIdeaForgePersistence } from "@/hooks/useIdeaForgePersistence";
import { FeedbackItem, FeedbackReply } from "@/utils/ideaforge-persistence";
import { aiEngine } from "@/services/aiEngine";
import { enhancedAIService } from "@/services/enhancedAIService";
import { useToast } from "@/hooks/use-toast";
import { FeedbackRating } from "./RatingSystem";
import { FeedbackCard } from "./ThreadedReplies";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Send,
  Star,
  Users,
  TrendingUp,
  Heart,
  Reply,
  Brain,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Target,
  Link as LinkIcon,
  Copy,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Share2,
  ExternalLink,
  GraduationCap,
  Building,
  Briefcase,
  Zap,
  Instagram,
  Linkedin,
  Globe
} from "lucide-react";
import { StoredIdea } from "@/types/ideaforge";

interface FeedbackViewProps {
  idea: StoredIdea;
  onUpdate?: (updates: Partial<StoredIdea>) => void;
}

interface AIRealityCheck {
  feasibilityIssues: string[];
  marketRisks: string[];
  userRisks: string[];
  techConstraints: string[];
  overallScore: number;
  lastGenerated: Date;
}

interface SurveyResponse {
  id: string;
  clarity: number;
  usefulness: number;
  feasibility: number;
  comment: string;
  features: string[];
  timestamp: Date;
}

interface TargetAudience {
  id: string;
  name: string;
  description: string;
  priority: 'primary' | 'secondary' | 'tertiary';
  channels: string[];
  icon: React.ComponentType<any>;
}

interface FeedbackStatus {
  status: 'open' | 'in-progress' | 'completed';
  feedbackCount: number;
  aiInsightsAvailable: boolean;
}

const FeedbackView: React.FC<FeedbackViewProps> = ({ idea, onUpdate }) => {
  const {
    feedback,
    addFeedback,
    updateFeedback,
    deleteFeedback,
    isLoading
  } = useIdeaForgePersistence(idea.id);

  // Existing state
  const [newFeedback, setNewFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative' | 'suggestion'>('positive');
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState<number>(0);
  const [newEmojiReaction, setNewEmojiReaction] = useState<'❤️' | '😊' | '😐' | '👎' | '😡' | undefined>(undefined);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  // New state for comprehensive feedback system
  const [activeTab, setActiveTab] = useState('reality-check');
  const [aiRealityCheck, setAiRealityCheck] = useState<AIRealityCheck | null>(null);
  const [isGeneratingRealityCheck, setIsGeneratingRealityCheck] = useState(false);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([]);
  const [targetAudiences, setTargetAudiences] = useState<TargetAudience[]>([]);
  const [isGeneratingAudiences, setIsGeneratingAudiences] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatus>({
    status: 'open',
    feedbackCount: 0,
    aiInsightsAvailable: false
  });
  const [publicLink, setPublicLink] = useState<string>('');
  
  const { toast } = useToast();

  const handleSubmitFeedback = () => {
    if (!newFeedback.trim() || !newAuthor.trim()) return;
    
    addFeedback({
      author: newAuthor.trim(),
      content: newFeedback.trim(),
      type: feedbackType,
      timestamp: new Date().toISOString(),
      likes: 0,
      rating: newRating > 0 ? newRating : undefined,
      emojiReaction: newEmojiReaction,
      replies: []
    });

    setNewFeedback('');
    setNewAuthor('');
    setFeedbackType('positive');
    setNewRating(0);
    setNewEmojiReaction(undefined);
  };

  const handleLikeFeedback = (feedbackId: string) => {
    const feedbackItem = feedback.find(f => f.id === feedbackId);
    if (feedbackItem) {
      updateFeedback(feedbackId, { likes: feedbackItem.likes + 1 });
    }
  };

  const handleDeleteFeedback = (feedbackId: string) => {
    if (confirm('Are you sure you want to delete this feedback?')) {
      deleteFeedback(feedbackId);
    }
  };

  const handleAddReply = (parentId: string, content: string, author: string) => {
    const parentFeedback = feedback.find(f => f.id === parentId);
    if (!parentFeedback) return;

    const newReply: FeedbackReply = {
      id: Date.now().toString(),
      author: author,
      content: content,
      timestamp: new Date().toISOString(),
      likes: 0,
      parentId: parentId
    };

    const updatedReplies = [...(parentFeedback.replies || []), newReply];
    updateFeedback(parentId, { replies: updatedReplies });
  };

  const handleLikeReply = (replyId: string) => {
    // Find the parent feedback item
    const parentFeedback = feedback.find(f => f.replies?.some(r => r.id === replyId));
    if (!parentFeedback) return;

    const updatedReplies = parentFeedback.replies?.map(reply => 
      reply.id === replyId 
        ? { ...reply, likes: reply.likes + 1 }
        : reply
    ) || [];

    updateFeedback(parentFeedback.id, { replies: updatedReplies });
  };

  const handleDeleteReply = (replyId: string) => {
    if (!confirm('Are you sure you want to delete this reply?')) return;

    // Find the parent feedback item
    const parentFeedback = feedback.find(f => f.replies?.some(r => r.id === replyId));
    if (!parentFeedback) return;

    const updatedReplies = parentFeedback.replies?.filter(reply => reply.id !== replyId) || [];
    updateFeedback(parentFeedback.id, { replies: updatedReplies });
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

  const generateAISummary = async () => {
    if (feedback.length === 0) {
      toast({
        title: "No Feedback Available",
        description: "Add some feedback first to generate an AI summary.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingSummary(true);
    
    try {
      const feedbackText = feedback.map(f => 
        `${f.type.toUpperCase()}: ${f.content} (by ${f.author})`
      ).join('\n\n');

      const prompt = `Analyze the following feedback for the idea "${idea.title}" and provide a comprehensive summary highlighting:

1. **Common Themes**: What are the most frequently mentioned topics or concerns?
2. **Sentiment Analysis**: Overall positive/negative sentiment breakdown
3. **Key Insights**: Most valuable insights and suggestions
4. **Action Items**: Specific recommendations based on the feedback
5. **Trends**: Any patterns or trends in the feedback

Feedback to analyze:
${feedbackText}

Please provide a structured summary with clear sections and actionable insights.`;

      const response = await aiEngine.generateText(prompt, {
        maxTokens: 1500,
        temperature: 0.7
      });

      setAiSummary(response.text);
      
      toast({
        title: "AI Summary Generated",
        description: "Feedback analysis complete with key insights and recommendations.",
        duration: 3000,
      });

    } catch (error) {
      console.error('Error generating AI summary:', error);
      
      // Provide fallback summary
      const fallbackSummary = `## AI Summary for "${idea.title}"

Based on the feedback collected, here are the key insights:

### Overall Sentiment
The feedback shows mixed responses with both positive and constructive criticism.

### Key Themes
- **User Experience**: Focus on improving usability and interface design
- **Feature Requests**: Consider implementing suggested features based on user demand
- **Market Validation**: Continue gathering feedback to validate product-market fit

### Recommendations
1. Address the most common pain points mentioned in feedback
2. Prioritize features that multiple users have requested
3. Consider user suggestions for improving the core functionality

### Next Steps
- Implement high-priority feedback items
- Conduct follow-up interviews with key users
- Monitor user engagement and satisfaction metrics

*Note: This is a fallback summary as AI generation was unavailable.*`;
      
      setAiSummary(fallbackSummary);
      
      toast({
        title: "⚠️ Using Fallback Summary",
        description: "AI service unavailable. Showing enhanced fallback analysis.",
        duration: 3000,
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // AI Reality Check - Brutally honest analysis
  const generateAIRealityCheck = async () => {
    setIsGeneratingRealityCheck(true);
    
    try {
      const prompt = `You are an expert startup advisor and investor. Conduct a brutally honest reality check for this specific idea:

IDEA: "${idea.title}"
DESCRIPTION: "${idea.description}"

CRITICAL: Provide specific, actionable analysis for THIS exact idea. Do NOT give generic responses.

For "${idea.title}", analyze these specific areas:

1. **Feasibility Issues**: What specific technical, financial, or operational challenges could kill this idea?
2. **Market Risks**: What are the specific competitive threats, market saturation issues, or demand problems?
3. **User Risks**: Why might users specifically NOT adopt "${idea.title}"? What behavioral barriers exist?
4. **Tech Constraints**: What are the specific technical limitations, scalability issues, or implementation challenges?

Be brutally honest like an investor's critique. Rate overall viability from 1-10.

IMPORTANT: Base your analysis on the specific idea provided. For example, if this is a fitness app, consider fitness industry challenges, not generic app challenges.

Respond ONLY in this JSON format:
{
  "feasibilityIssues": ["specific issue 1", "specific issue 2", "specific issue 3"],
  "marketRisks": ["specific risk 1", "specific risk 2", "specific risk 3"],
  "userRisks": ["specific risk 1", "specific risk 2", "specific risk 3"],
  "techConstraints": ["specific constraint 1", "specific constraint 2", "specific constraint 3"],
  "overallScore": 7
}`;

      const response = await aiEngine.generateText(prompt, {
        maxTokens: 2000,
        temperature: 0.8
      });

      console.log('Reality Check AI Response:', response.text); // Debug log

      try {
        const parsed = JSON.parse(response.text);
        const realityCheck: AIRealityCheck = {
          feasibilityIssues: parsed.feasibilityIssues || [],
          marketRisks: parsed.marketRisks || [],
          userRisks: parsed.userRisks || [],
          techConstraints: parsed.techConstraints || [],
          overallScore: parsed.overallScore || 5,
          lastGenerated: new Date()
        };
        setAiRealityCheck(realityCheck);
        setFeedbackStatus(prev => ({ ...prev, aiInsightsAvailable: true }));
        
        toast({
          title: "Reality Check Complete",
          description: `Overall viability score: ${realityCheck.overallScore}/10`,
          duration: 4000,
        });
      } catch (parseError) {
        console.error('Reality Check JSON Parse Error:', parseError);
        console.log('Raw reality check response:', response.text);
        
        // Better fallback with idea-specific content
        const realityCheck: AIRealityCheck = {
          feasibilityIssues: [
            `"${idea.title}" faces typical startup challenges including user acquisition costs and market competition`,
            `Technical implementation complexity may require significant development resources`,
            `Monetization strategy needs validation with target users`
          ],
          marketRisks: [
            `Competitive landscape in this space may be crowded with established players`,
            `Market demand for "${idea.title}" needs validation through user research`,
            `Economic conditions may affect user willingness to pay for this solution`
          ],
          userRisks: [
            `Users may have existing habits and preferences that make adoption challenging`,
            `Learning curve and onboarding process could impact user retention`,
            `Privacy and data concerns may affect user trust and adoption`
          ],
          techConstraints: [
            `Scalability requirements may need significant infrastructure investment`,
            `Integration with existing systems and platforms could be complex`,
            `Performance and reliability standards need to meet user expectations`
          ],
          overallScore: 6,
          lastGenerated: new Date()
        };
        setAiRealityCheck(realityCheck);
        
        toast({
          title: "⚠️ Partial Reality Check",
          description: "AI generated content but formatting was incomplete. Showing enhanced analysis.",
          duration: 3000,
        });
      }

    } catch (error) {
      console.error('Error generating reality check:', error);
      
      // Provide fallback reality check
      const fallbackRealityCheck: AIRealityCheck = {
        feasibilityIssues: [
          `"${idea.title}" faces typical startup challenges including user acquisition costs and market competition`,
          `Technical implementation complexity may require significant development resources`,
          `Monetization strategy needs validation with target users`
        ],
        marketRisks: [
          `Competitive landscape in this space may be crowded with established players`,
          `Market demand for "${idea.title}" needs validation through user research`,
          `Economic conditions may affect user willingness to pay for this solution`
        ],
        userRisks: [
          `Users may have existing habits and preferences that make adoption challenging`,
          `Learning curve and onboarding process could impact user retention`,
          `Privacy and data concerns may affect user trust and adoption`
        ],
        techConstraints: [
          `Scalability requirements may need significant infrastructure investment`,
          `Integration with existing systems and platforms could be complex`,
          `Performance and reliability standards need to meet user expectations`
        ],
        overallScore: 6,
        lastGenerated: new Date()
      };
      
      setAiRealityCheck(fallbackRealityCheck);
      
      toast({
        title: "⚠️ Using Fallback Reality Check",
        description: "AI service unavailable. Showing enhanced fallback analysis.",
        duration: 3000,
      });
    } finally {
      setIsGeneratingRealityCheck(false);
    }
  };

  // Target Audience Recommender
  const generateTargetAudiences = async () => {
    setIsGeneratingAudiences(true);
    
    try {
      console.log('Starting enhanced target audience generation for:', idea.title);
      
      // Use enhanced AI service for sophisticated target audience analysis
      const response = await enhancedAIService.generateTargetAudience(idea.title, {
        context: idea.description,
        temperature: 0.7
      });

      console.log('Enhanced Target Audiences AI Response:', response.text);

      try {
        // Parse the enhanced response - it should be structured JSON
        let cleanResponse = response.text.trim();
        
        // Remove any markdown code blocks
        if (cleanResponse.includes('```json')) {
          cleanResponse = cleanResponse.split('```json')[1].split('```')[0].trim();
        } else if (cleanResponse.includes('```')) {
          cleanResponse = cleanResponse.split('```')[1].split('```')[0].trim();
        }
        
        // Try to extract JSON array from the response
        const jsonStart = cleanResponse.indexOf('[');
        const jsonEnd = cleanResponse.lastIndexOf(']') + 1;
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
        }

        const parsed = JSON.parse(cleanResponse);
        
        // Validate the parsed data
        if (!Array.isArray(parsed)) {
          throw new Error('Response is not an array');
        }
        
        const audiences: TargetAudience[] = parsed.map((audience: any, index: number) => ({
          id: `audience-${index}`,
          name: audience.name || audience.PRIMARY_TARGET_AUDIENCE?.name || `Audience ${index + 1}`,
          description: audience.description || audience.PRIMARY_TARGET_AUDIENCE?.description || `Target audience for ${idea.title}`,
          priority: audience.priority || audience.PRIMARY_TARGET_AUDIENCE?.priority || 'secondary',
          channels: Array.isArray(audience.channels) ? audience.channels : 
                   Array.isArray(audience.PRIMARY_TARGET_AUDIENCE?.channels) ? audience.PRIMARY_TARGET_AUDIENCE.channels :
                   ['Social media', 'Direct outreach'],
          icon: getAudienceIcon(audience.name || `audience-${index}`)
        }));
        
        setTargetAudiences(audiences);
        
        toast({
          title: "✅ Enhanced Target Audiences Generated",
          description: `Found ${audiences.length} sophisticated audience profiles`,
          duration: 3000,
        });
      } catch (parseError) {
        console.error('Target Audiences JSON Parse Error:', parseError);
        console.log('Raw target audiences response:', response.text);
        
        // Enhanced fallback with idea-specific content
        const fallbackAudiences: TargetAudience[] = [
          {
            id: 'primary-users',
            name: 'Primary Users',
            description: `Users who would directly benefit from "${idea.title}" based on the core functionality described. These are the main target users who have the most to gain from this solution.`,
            priority: 'primary',
            channels: ['Social media', 'Industry forums', 'Direct outreach', 'Content marketing'],
            icon: Users
          },
          {
            id: 'early-adopters',
            name: 'Early Adopters',
            description: `Tech-savvy users who are likely to try new solutions like "${idea.title}". They are willing to test new products and provide feedback.`,
            priority: 'secondary',
            channels: ['Tech communities', 'Beta testing groups', 'Product Hunt', 'Developer forums'],
            icon: Zap
          },
          {
            id: 'influencers',
            name: 'Industry Influencers',
            description: `Key opinion leaders and influencers in the relevant industry who could help promote "${idea.title}" to their followers.`,
            priority: 'tertiary',
            channels: ['LinkedIn', 'Industry publications', 'Conferences', 'Partnership outreach'],
            icon: Star
          }
        ];
        
        setTargetAudiences(fallbackAudiences);
        
        toast({
          title: "⚠️ Enhanced Fallback Analysis",
          description: "AI generated content but formatting was incomplete. Showing enhanced analysis with specific audiences.",
          duration: 3000,
        });
      }

    } catch (error) {
      console.error('Error generating audiences:', error);
      
      // Always provide fallback audiences to prevent hanging
      const fallbackAudiences: TargetAudience[] = [
        {
          id: 'primary-users',
          name: 'Primary Users',
          description: `Users who would directly benefit from "${idea.title}" based on the core functionality described. These are the main target users who have the most to gain from this solution.`,
          priority: 'primary',
          channels: ['Social media', 'Industry forums', 'Direct outreach', 'Content marketing'],
          icon: Users
        },
        {
          id: 'early-adopters',
          name: 'Early Adopters',
          description: `Tech-savvy users who are likely to try new solutions like "${idea.title}". They are willing to test new products and provide feedback.`,
          priority: 'secondary',
          channels: ['Tech communities', 'Beta testing groups', 'Product Hunt', 'Developer forums'],
          icon: Zap
        },
        {
          id: 'influencers',
          name: 'Industry Influencers',
          description: `Key opinion leaders and influencers in the relevant industry who could help promote "${idea.title}" to their followers.`,
          priority: 'tertiary',
          channels: ['LinkedIn', 'Industry publications', 'Conferences', 'Partnership outreach'],
          icon: Star
        }
      ];
      
      setTargetAudiences(fallbackAudiences);
      
      toast({
        title: "⚠️ Using Enhanced Fallback Analysis",
        description: "AI service unavailable. Showing comprehensive fallback target audiences.",
        duration: 3000,
      });
    } finally {
      // Always ensure loading state is cleared
      setIsGeneratingAudiences(false);
    }
  };

  const getAudienceIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('student') || lowerName.includes('college')) return GraduationCap;
    if (lowerName.includes('business') || lowerName.includes('corporate')) return Building;
    if (lowerName.includes('professional') || lowerName.includes('freelancer')) return Briefcase;
    return Users;
  };

  const generatePublicLink = async () => {
    try {
      // Ensure we have a valid idea ID
      if (!idea?.id) {
        toast({
          title: "Error",
          description: "No idea selected. Please select an idea first.",
          variant: "destructive",
        });
        return;
      }

      // Import the public feedback persistence
      const { publicFeedbackPersistence } = await import('@/utils/public-feedback-persistence');
      const { createTestIdeaWithFeedback } = await import('@/utils/create-test-idea');

      // Check if public idea exists, if not create it
      const isPublic = await publicFeedbackPersistence.isPublicIdea(idea.id);
      if (!isPublic) {
        console.log('Creating public idea for feedback sharing:', idea.id);
        
        // Create a public version of the current idea
        const publicIdeaData = {
          id: idea.id,
          title: idea.title || `Idea ${idea.id}`,
          description: idea.description || 'Idea from Idea Forge',
          tags: idea.tags || ['idea', 'feedback'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          feedback: feedback || []
        };
        
        await publicFeedbackPersistence.savePublicIdea(publicIdeaData);
        console.log('Public idea created successfully');
      }

      // Generate the public link
      const link = `${window.location.origin}/feedback/${idea.id}`;
      setPublicLink(link);
      
      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(link);
        toast({
          title: "Link Copied!",
          description: "Public feedback link copied to clipboard",
          duration: 2000,
        });
      } catch (clipboardError) {
        // Fallback for browsers that don't support clipboard API
        console.warn('Clipboard API not available, showing link instead');
        toast({
          title: "Link Generated",
          description: `Public link: ${link}`,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error generating public link:', error);
      toast({
        title: "Error",
        description: "Failed to generate public link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportSurveyData = () => {
    if (surveyResponses.length === 0) {
      toast({
        title: "No Data to Export",
        description: "No survey responses available yet",
        variant: "destructive",
      });
      return;
    }

    const csvData = [
      ['Timestamp', 'Clarity', 'Usefulness', 'Feasibility', 'Comment', 'Features'],
      ...surveyResponses.map(response => [
        response.timestamp.toISOString(),
        response.clarity,
        response.usefulness,
        response.feasibility,
        response.comment,
        response.features.join('; ')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${idea.title}-survey-data.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported!",
      description: "Survey data downloaded as CSV",
      duration: 2000,
    });
  };

  const stats = getFeedbackStats();

  // Auto-generate reality check and target audiences on component mount
  useEffect(() => {
    console.log('useEffect triggered for idea:', idea.id);
    console.log('aiRealityCheck exists:', !!aiRealityCheck);
    console.log('targetAudiences length:', targetAudiences.length);
    
    if (!aiRealityCheck) {
      console.log('Generating reality check...');
      generateAIRealityCheck();
    }
    if (targetAudiences.length === 0) {
      console.log('Generating target audiences...');
      generateTargetAudiences();
    }
  }, [idea.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-green-400" />
            Feedback & Validation
          </h2>
          <p className="text-gray-400 mt-1">
            AI-powered reality check + crowdsourced validation + market guidance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`${
            feedbackStatus.status === 'completed' ? 'bg-green-600/20 text-green-400' :
            feedbackStatus.status === 'in-progress' ? 'bg-blue-600/20 text-blue-400' :
            'bg-gray-600/20 text-gray-400'
          } border-0 px-3 py-1`}>
            {feedbackStatus.status}
          </Badge>
          <div className="text-sm text-gray-400">
            {feedback.length + surveyResponses.length} feedback entries
            {feedbackStatus.aiInsightsAvailable && ' • AI insights available'}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={generatePublicLink}
          variant="outline"
          size="sm"
          className="border-blue-500/30 text-blue-400 hover:bg-blue-600/10"
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          Share Feedback Link
        </Button>
        <Button
          onClick={exportSurveyData}
          disabled={surveyResponses.length === 0}
          variant="outline"
          size="sm"
          className="border-purple-500/30 text-purple-400 hover:bg-purple-600/10"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Survey Data
        </Button>
        <Button
          onClick={() => {
            generateAIRealityCheck();
            generateTargetAudiences();
          }}
          variant="outline"
          size="sm"
          className="border-orange-500/30 text-orange-400 hover:bg-orange-600/10"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Regenerate AI Analysis
        </Button>
      </div>

      {/* Feedback Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-black/40 border-white/10">
          <TabsTrigger value="reality-check" className="data-[state=active]:bg-green-600">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Reality Check
          </TabsTrigger>
          <TabsTrigger value="survey-results" className="data-[state=active]:bg-green-600">
            <BarChart3 className="h-4 w-4 mr-2" />
            Survey Results
          </TabsTrigger>
          <TabsTrigger value="target-audiences" className="data-[state=active]:bg-green-600">
            <Target className="h-4 w-4 mr-2" />
            Target Audiences
          </TabsTrigger>
          <TabsTrigger value="raw-feedback" className="data-[state=active]:bg-green-600">
            <MessageSquare className="h-4 w-4 mr-2" />
            Raw Feedback
          </TabsTrigger>
        </TabsList>

        {/* AI Reality Check Tab */}
        <TabsContent value="reality-check" className="mt-6">
          <Card className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                AI Reality Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiRealityCheck ? (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className="text-center p-6 bg-black/20 rounded-lg">
                    <div className="text-4xl font-bold text-white mb-2">
                      {aiRealityCheck.overallScore}/10
                    </div>
                    <div className="text-gray-400">Overall Viability Score</div>
                    <div className={`text-sm mt-2 ${
                      aiRealityCheck.overallScore >= 7 ? 'text-green-400' :
                      aiRealityCheck.overallScore >= 5 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {aiRealityCheck.overallScore >= 7 ? 'Strong potential' :
                       aiRealityCheck.overallScore >= 5 ? 'Moderate potential' :
                       'High risk - reconsider'}
                    </div>
                  </div>

                  {/* Analysis Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Feasibility Issues */}
                    <Card className="bg-red-900/20 border-red-500/30">
                      <CardHeader>
                        <CardTitle className="text-red-400 flex items-center gap-2">
                          <XCircle className="h-5 w-5" />
                          Feasibility Issues
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {aiRealityCheck.feasibilityIssues.length > 0 ? (
                          <ul className="space-y-2">
                            {aiRealityCheck.feasibilityIssues.map((issue, index) => (
                              <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                                <span className="text-red-400 mt-1">•</span>
                                {issue}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400 text-sm">No major feasibility issues identified</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Market Risks */}
                    <Card className="bg-orange-900/20 border-orange-500/30">
                      <CardHeader>
                        <CardTitle className="text-orange-400 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Market Risks
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {aiRealityCheck.marketRisks.length > 0 ? (
                          <ul className="space-y-2">
                            {aiRealityCheck.marketRisks.map((risk, index) => (
                              <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                                <span className="text-orange-400 mt-1">•</span>
                                {risk}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400 text-sm">No major market risks identified</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* User Risks */}
                    <Card className="bg-yellow-900/20 border-yellow-500/30">
                      <CardHeader>
                        <CardTitle className="text-yellow-400 flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          User Risks
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {aiRealityCheck.userRisks.length > 0 ? (
                          <ul className="space-y-2">
                            {aiRealityCheck.userRisks.map((risk, index) => (
                              <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                                <span className="text-yellow-400 mt-1">•</span>
                                {risk}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400 text-sm">No major user adoption risks identified</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Tech Constraints */}
                    <Card className="bg-blue-900/20 border-blue-500/30">
                      <CardHeader>
                        <CardTitle className="text-blue-400 flex items-center gap-2">
                          <Brain className="h-5 w-5" />
                          Tech Constraints
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {aiRealityCheck.techConstraints.length > 0 ? (
                          <ul className="space-y-2">
                            {aiRealityCheck.techConstraints.map((constraint, index) => (
                              <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                {constraint}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400 text-sm">No major technical constraints identified</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="text-xs text-gray-500 text-center">
                    Generated: {aiRealityCheck.lastGenerated.toLocaleString()}
                  </div>
                </div>
              ) : isGeneratingRealityCheck ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-12 w-12 mx-auto text-red-400 animate-spin mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Generating Reality Check</h3>
                  <p className="text-gray-400">AI is conducting a brutally honest analysis of your idea...</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Generating Reality Check</h3>
                  <p className="text-gray-400">
                    AI is analyzing your idea's viability, risks, and challenges...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Survey Results Tab */}
        <TabsContent value="survey-results" className="mt-6">
          <Card className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  Survey Results
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={generatePublicLink}
                    variant="outline"
                    size="sm"
                    className="border-blue-500/30 text-blue-400 hover:bg-blue-600/10"
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Generate Public Link
                  </Button>
                  <Button
                    onClick={exportSurveyData}
                    disabled={surveyResponses.length === 0}
                    variant="outline"
                    size="sm"
                    className="border-green-500/30 text-green-400 hover:bg-green-600/10"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {surveyResponses.length > 0 ? (
                <div className="space-y-6">
                  {/* Survey Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-blue-900/20 border-blue-500/30">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {surveyResponses.length}
                        </div>
                        <div className="text-sm text-gray-400">Total Responses</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-900/20 border-green-500/30">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {(surveyResponses.reduce((sum, r) => sum + r.clarity, 0) / surveyResponses.length).toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-400">Avg Clarity</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-purple-900/20 border-purple-500/30">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-400">
                          {(surveyResponses.reduce((sum, r) => sum + r.feasibility, 0) / surveyResponses.length).toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-400">Avg Feasibility</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* AI Summary of Survey Results */}
                  {aiSummary && (
                    <Card className="bg-black/20 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Brain className="h-5 w-5 text-green-400" />
                          AI Survey Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-white prose-p:text-gray-300">
                          <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                            {aiSummary}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Individual Responses */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Individual Responses</h4>
                    {surveyResponses.map((response) => (
                      <Card key={response.id} className="bg-black/20 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex gap-4">
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-400">{response.clarity}</div>
                                <div className="text-xs text-gray-400">Clarity</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-400">{response.usefulness}</div>
                                <div className="text-xs text-gray-400">Usefulness</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-purple-400">{response.feasibility}</div>
                                <div className="text-xs text-gray-400">Feasibility</div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {response.timestamp.toLocaleDateString()}
                            </div>
                          </div>
                          {response.comment && (
                            <p className="text-gray-300 text-sm mb-2">{response.comment}</p>
                          )}
                          {response.features.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {response.features.map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-400">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Survey Responses Yet</h3>
                  <p className="text-gray-400 mb-4">
                    Generate a public link to collect feedback from your community.
                  </p>
                  <Button
                    onClick={generatePublicLink}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Generate Public Link
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Target Audiences Tab */}
        <TabsContent value="target-audiences" className="mt-6">
          <Card className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  Target Audience Recommender
                </CardTitle>
                <Button
                  onClick={generateTargetAudiences}
                  disabled={isGeneratingAudiences}
                  variant="outline"
                  size="sm"
                  className="border-purple-500/30 text-purple-400 hover:bg-purple-600/10"
                >
                  {isGeneratingAudiences ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {isGeneratingAudiences ? 'Generating...' : 'Regenerate'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {targetAudiences.length > 0 ? (
                <div className="space-y-6">
                  {targetAudiences.map((audience) => {
                    const Icon = audience.icon;
                    return (
                      <Card key={audience.id} className={`${
                        audience.priority === 'primary' ? 'bg-green-900/20 border-green-500/30' :
                        audience.priority === 'secondary' ? 'bg-blue-900/20 border-blue-500/30' :
                        'bg-gray-900/20 border-gray-500/30'
                      }`}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${
                              audience.priority === 'primary' ? 'bg-green-600/20' :
                              audience.priority === 'secondary' ? 'bg-blue-600/20' :
                              'bg-gray-600/20'
                            }`}>
                              <Icon className={`h-6 w-6 ${
                                audience.priority === 'primary' ? 'text-green-400' :
                                audience.priority === 'secondary' ? 'text-blue-400' :
                                'text-gray-400'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-lg font-semibold text-white">{audience.name}</h4>
                                <Badge className={`${
                                  audience.priority === 'primary' ? 'bg-green-600/20 text-green-400' :
                                  audience.priority === 'secondary' ? 'bg-blue-600/20 text-blue-400' :
                                  'bg-gray-600/20 text-gray-400'
                                } border-0`}>
                                  {audience.priority}
                                </Badge>
                              </div>
                              <p className="text-gray-300 mb-4">{audience.description}</p>
                              <div>
                                <h5 className="text-sm font-medium text-white mb-2">Recommended Channels:</h5>
                                <div className="flex flex-wrap gap-2">
                                  {audience.channels.map((channel, index) => (
                                    <Badge key={index} variant="outline" className="border-gray-600 text-gray-400">
                                      {channel}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : isGeneratingAudiences ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-12 w-12 mx-auto text-purple-400 animate-spin mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Generating Target Audiences</h3>
                  <p className="text-gray-400">AI is analyzing your idea to identify potential target audiences...</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Generating Target Audiences</h3>
                  <p className="text-gray-400">
                    AI is analyzing your idea to identify potential target audiences and how to reach them...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Raw Feedback Tab */}
        <TabsContent value="raw-feedback" className="mt-6">
          <div className="space-y-6">
            {/* Add New Feedback */}
            <Card className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-400" />
                  Share Your Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full p-2 bg-black/20 border border-white/10 rounded-md text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">
                      Feedback Type
                    </label>
                    <div className="flex gap-2">
                      {(['positive', 'negative', 'suggestion'] as const).map((type) => (
                        <Button
                          key={type}
                          variant={feedbackType === type ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFeedbackType(type)}
                          className={feedbackType === type ?
                            'bg-green-600 hover:bg-green-700' :
                            'border-green-500/30 text-green-400 hover:bg-green-600/10'
                          }
                        >
                          {getFeedbackIcon(type)}
                          <span className="ml-2 capitalize">{type}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    Your Feedback
                  </label>
                  <Textarea
                    placeholder="Share your thoughts, suggestions, or concerns about this idea..."
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    rows={4}
                    className="bg-black/20 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Rating System */}
                <div className="bg-black/20 border border-white/10 rounded-lg p-4">
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
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </Button>
              </CardContent>
            </Card>

            {/* Feedback List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Community Feedback
              </h3>

              {feedback.length === 0 ? (
                <Card className="bg-black/40 backdrop-blur-sm border-white/10 border-dashed border-green-500/20">
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No feedback yet</h3>
                    <p className="text-gray-400 mb-4">
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
                      onLikeReply={handleLikeReply}
                      onDeleteReply={handleDeleteReply}
                      showReplies={true}
                    />
                  ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeedbackView;
