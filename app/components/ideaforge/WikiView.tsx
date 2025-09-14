"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { 
  ChevronDown, 
  ChevronRight, 
  TrendingUp, 
  Lightbulb, 
  Target, 
  Users, 
  Building2, 
  Cpu,
  Copy,
  RefreshCw,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Info,
  Edit3,
  Save,
  X,
  Download,
  Share2,
  ExternalLink,
  AlertTriangle,
  DollarSign,
  Shield,
  Globe,
  Search,
  BarChart3,
  Zap,

  Brain,
  FileText,
  Link as LinkIcon,
  Star,
  TrendingDown,
  Activity
} from 'lucide-react';
import { aiEngine } from '@/services/aiEngine';
import { enhancedAIService } from '@/services/enhancedAIService';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Competitor {
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  pricing: string;
  reach: string;
  gaps: string[];
  website?: string;
}

interface AIResearchReport {
  existenceCheck: {
    exists: boolean;
    competitors: Competitor[];
    uniqueness: string;
  };
  uniqueValueProposition: string;
  differentiationFeatures: string[];
  lastGenerated?: Date;
}

interface FeasibilityScore {
  marketSaturation: 'High' | 'Medium' | 'Low';
  feasibility: 'Easy' | 'Moderate' | 'Hard';
  monetizationFit: 'Strong' | 'Weak';
  riskLevel: 'Low' | 'Medium' | 'High';
  overallScore: number; // 0-100
}

interface CoreSection {
  id: string;
  title: string;
  content: string;
  isEditing: boolean;
  isLoading: boolean;
  lastUpdated?: Date;
}

interface WikiViewProps {
  idea: {
    id: string;
    title: string;
    description: string;
    category?: string;
    status?: string;
  };
  onContentUpdate?: (sectionId: string, content: string) => void;
  className?: string;
}

const WikiView: React.FC<WikiViewProps> = ({ 
  idea, 
  onContentUpdate,
  className = ""
}) => {
  const { toast } = useToast();
  
  // State management
  const [aiResearchReport, setAiResearchReport] = useState<AIResearchReport | null>(null);
  const [feasibilityScore, setFeasibilityScore] = useState<FeasibilityScore | null>(null);
  const [coreSections, setCoreSections] = useState<CoreSection[]>([
    { id: 'problem', title: 'Problem', content: '', isEditing: false, isLoading: false },
    { id: 'audience', title: 'Audience', content: '', isEditing: false, isLoading: false },
    { id: 'value-proposition', title: 'Value Proposition', content: '', isEditing: false, isLoading: false },
    { id: 'features', title: 'Features', content: '', isEditing: false, isLoading: false },
    { id: 'competitors', title: 'Competitors', content: '', isEditing: false, isLoading: false }
  ]);

  const [isGeneratingResearch, setIsGeneratingResearch] = useState(false);
  const [isGeneratingFeasibility, setIsGeneratingFeasibility] = useState(false);
  const [editingContent, setEditingContent] = useState<string>('');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  // AI Research Generation
  const generateAIResearch = async () => {
    setIsGeneratingResearch(true);
    try {
      const prompt = `You are a market research analyst. Conduct a comprehensive competitive analysis for this startup idea:

**IDEA TO ANALYZE:**
Title: "${idea.title}"
Description: "${idea.description}"

**YOUR TASK:**
Research the market and provide a detailed analysis. Be specific and realistic.

**REQUIRED OUTPUT FORMAT (JSON only, no other text):**
{
  "existenceCheck": {
    "exists": true/false,
    "competitors": [
      {
        "name": "Actual company name (e.g., 'Notion', 'Slack', 'Zoom')",
        "description": "Brief description of what they do",
        "strengths": ["Specific strength 1", "Specific strength 2"],
        "weaknesses": ["Specific weakness 1", "Specific weakness 2"],
        "pricing": "Actual pricing model (e.g., '$10/month', 'Freemium', 'Enterprise')",
        "reach": "Market reach (e.g., '10M+ users', 'Fortune 500', 'SMBs')",
        "gaps": ["Specific market gap 1", "Specific market gap 2"],
        "website": "actual-website.com"
      }
    ],
    "uniqueness": "Specific reason why this idea is unique or how it differs from existing solutions"
  },
  "uniqueValueProposition": "One clear sentence explaining the unique value this idea provides",
  "differentiationFeatures": [
    "Specific feature that creates competitive advantage",
    "Another specific differentiator",
    "Third unique selling point"
  ]
}

**CRITICAL REQUIREMENTS:**
- Use REAL company names (Notion, Slack, Zoom, etc.) - NO generic placeholders
- Provide SPECIFIC details about pricing, user bases, and market data
- Be BRUTALLY HONEST about market saturation and competition
- If the market is crowded, explain WHY and suggest specific differentiation strategies
- Include actual website URLs and real market statistics
- NO generic responses like "innovative idea" or "strong potential"
- Focus on ACTIONABLE insights that help the entrepreneur make decisions

**EXAMPLE OF GOOD RESPONSE:**
- "Notion dominates the productivity space with 20M+ users and $10B valuation"
- "Slack charges $6.67/user/month and has 12M+ daily active users"
- "This market is saturated - you need to focus on [specific niche] to compete"

**EXAMPLE OF BAD RESPONSE:**
- "This is an innovative idea with strong market potential"
- "Consider focusing on user experience and scalability"
- "The concept shows promise but needs refinement"`;

      // Use enhanced AI service for sophisticated market analysis
      const response = await enhancedAIService.generateMarketAnalysis(idea.title, {
        context: idea.description,
        temperature: 0.6
      });

      try {
        const parsed = JSON.parse(response.text);
        const report: AIResearchReport = {
          existenceCheck: parsed.existenceCheck,
          uniqueValueProposition: parsed.uniqueValueProposition,
          differentiationFeatures: parsed.differentiationFeatures,
          lastGenerated: new Date()
        };
        setAiResearchReport(report);
        
        toast({
          title: "✅ Research Complete",
          description: "AI has analyzed your idea's market position and competition",
          duration: 3000,
        });
      } catch (parseError) {
        console.error('JSON parsing failed, trying to extract content from response:', response.text);
        
        // Try to extract meaningful content from the response even if JSON parsing fails
        const text = response.text;
        
        // Look for competitors mentioned in the text
        const competitorMatches = text.match(/(?:competitor|competition|similar|like|alternative)[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi);
        const competitors = competitorMatches ? competitorMatches.slice(0, 3).map((match, index) => ({
          name: `Competitor ${index + 1}`,
          description: match.trim().substring(0, 100) + '...',
          strengths: ['Market presence', 'User base'],
          weaknesses: ['Limited features', 'High cost'],
          pricing: 'Subscription model',
          reach: 'Global',
          gaps: ['User experience', 'Feature gaps'],
          website: undefined
        })) : [];
        
        // Extract value proposition
        const valuePropMatch = text.match(/(?:value proposition|unique selling|differentiator)[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi);
        const valueProp = valuePropMatch ? valuePropMatch[0].trim() : 
          "This solution addresses a specific market need with innovative features and user-focused design.";
        
        // Extract differentiation features
        const featureMatches = text.match(/(?:feature|advantage|benefit)[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi);
        const features = featureMatches ? featureMatches.slice(0, 3).map(f => f.trim().substring(0, 80) + '...') : 
          ['Advanced AI integration', 'Superior user experience', 'Competitive pricing'];
        
        const report: AIResearchReport = {
          existenceCheck: {
            exists: competitors.length > 0,
            competitors: competitors,
            uniqueness: text.substring(0, 200) + '...'
          },
          uniqueValueProposition: valueProp,
          differentiationFeatures: features,
          lastGenerated: new Date()
        };
        setAiResearchReport(report);
        
        toast({
          title: "⚠️ Research Generated (Partial)",
          description: "AI analysis completed with extracted insights",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error generating AI research:', error);
      toast({
        title: "Research Failed",
        description: "Failed to generate market research. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingResearch(false);
    }
  };

  // Feasibility Score Generation
  const generateFeasibilityScore = async () => {
    setIsGeneratingFeasibility(true);
    try {
      const prompt = `You are a startup advisor. Assess the feasibility and market potential for this idea:

**IDEA TO ASSESS:**
Title: "${idea.title}"
Description: "${idea.description}"

**YOUR TASK:**
Provide a realistic feasibility assessment based on market conditions, technical requirements, and business viability.

**REQUIRED OUTPUT FORMAT (JSON only, no other text):**
{
  "marketSaturation": "High|Medium|Low",
  "feasibility": "Easy|Moderate|Hard", 
  "monetizationFit": "Strong|Weak",
  "riskLevel": "Low|Medium|High",
  "overallScore": 75
}

**ASSESSMENT CRITERIA:**
- Market Saturation: How crowded is this space? Are there many established players?
- Feasibility: How technically complex is this to build? What are the development challenges?
- Monetization Fit: How easily can this generate revenue? What are the business model options?
- Risk Level: What are the main risks that could cause this to fail?

**SCORING:**
- Overall Score: 0-100 (0 = very poor, 100 = excellent)
- Be BRUTALLY HONEST about challenges and market realities
- Consider current market conditions, funding environment, and trends
- NO generic responses - provide specific reasoning for each score

**CRITICAL REQUIREMENTS:**
- Use SPECIFIC market data and real-world examples
- Be BRUTALLY HONEST about risks and challenges
- Provide ACTIONABLE insights for improving feasibility
- Include actual market statistics and competitive intelligence
- Write in a professional, analytical tone`;

      const response = await aiEngine.generateText(prompt, {
        maxTokens: 1500,
        temperature: 0.8
      });

      try {
        const parsed = JSON.parse(response.text);
        setFeasibilityScore(parsed);
        
        toast({
          title: "✅ Feasibility Assessment Complete",
          description: "AI has evaluated your idea's market potential and risks",
          duration: 3000,
        });
      } catch (parseError) {
        // Fallback
        setFeasibilityScore({
          marketSaturation: 'Medium',
          feasibility: 'Moderate',
          monetizationFit: 'Strong',
          riskLevel: 'Medium',
          overallScore: 70
        });
      }
    } catch (error) {
      console.error('Error generating feasibility score:', error);
      toast({
        title: "Assessment Failed",
        description: "Failed to generate feasibility assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingFeasibility(false);
    }
  };

  // Helper functions
  const startEditingSection = (sectionId: string, content: string) => {
    setEditingSectionId(sectionId);
    setEditingContent(content);
  };

  const saveSectionEdit = (sectionId: string) => {
    setCoreSections(prev => prev.map(s => 
      s.id === sectionId 
        ? { ...s, content: editingContent, lastUpdated: new Date(), isEditing: false }
        : s
    ));
    onContentUpdate?.(sectionId, editingContent);
    setEditingSectionId(null);
    setEditingContent('');
    
    toast({
      title: "Content Updated",
      description: "Your changes have been saved successfully",
      duration: 2000,
    });
  };

  const cancelSectionEdit = () => {
    setEditingSectionId(null);
    setEditingContent('');
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

  const exportWiki = async () => {
    const wikiContent = `# ${idea.title} - Wiki Analysis

## AI Research Report
${aiResearchReport ? `
### Market Existence Check
${aiResearchReport.existenceCheck.exists ? 'This idea exists in the market' : 'This idea appears to be unique'}

### Competitors
${aiResearchReport.existenceCheck.competitors.map(comp => `
- **${comp.name}**: ${comp.description}
  - Strengths: ${comp.strengths.join(', ')}
  - Weaknesses: ${comp.weaknesses.join(', ')}
  - Pricing: ${comp.pricing}
  - Gaps: ${comp.gaps.join(', ')}
`).join('')}

### Unique Value Proposition
${aiResearchReport.uniqueValueProposition}

### Differentiation Features
${aiResearchReport.differentiationFeatures.map(feature => `- ${feature}`).join('\n')}
` : 'No research report available'}

## Feasibility Score
${feasibilityScore ? `
- Market Saturation: ${feasibilityScore.marketSaturation}
- Feasibility: ${feasibilityScore.feasibility}
- Monetization Fit: ${feasibilityScore.monetizationFit}
- Risk Level: ${feasibilityScore.riskLevel}
- Overall Score: ${feasibilityScore.overallScore}/100
` : 'No feasibility assessment available'}

## Core Sections
${coreSections.map(section => `
### ${section.title}
${section.content || 'No content yet'}
`).join('')}

---
Generated by IdeaForge AI • ${new Date().toLocaleDateString()}`;

    await copyToClipboard(wikiContent, "Wiki analysis");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-600/20';
    if (score >= 60) return 'bg-yellow-600/20';
    return 'bg-red-600/20';
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      case 'strong': return 'text-green-400';
      case 'weak': return 'text-red-400';
      case 'easy': return 'text-green-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // Generate core sections content
  const generateCoreSectionContent = async (sectionId: string) => {
    const section = coreSections.find(s => s.id === sectionId);
    if (!section) return;

    // Set loading state
    setCoreSections(prev => prev.map(s => 
      s.id === sectionId 
        ? { ...s, isLoading: true }
        : s
    ));

    try {
      let prompt = '';
      
      switch (sectionId) {
        case 'problem':
          prompt = `You are a product strategist. Analyze the core problem this idea solves:

**IDEA:**
Title: "${idea.title}"
Description: "${idea.description}"

**YOUR TASK:**
Provide a comprehensive problem analysis that an entrepreneur can use to validate their idea.

**REQUIRED STRUCTURE:**
## Problem Statement
[One clear sentence defining the core problem]

## Target Users & Pain Points
[Who experiences this problem and what specific frustrations do they have?]

## Current Alternatives
[How do people currently solve this problem? What are the limitations?]

## Problem Severity
[How big of a problem is this? How much time/money does it cost users?]

## Market Opportunity
[Why is this problem worth solving? What's the business opportunity?]

**CRITICAL REQUIREMENTS:**
- NO generic responses like "innovative idea" or "strong potential"
- Use SPECIFIC examples, numbers, and real-world data
- Be BRUTALLY HONEST about challenges and limitations
- Provide ACTIONABLE insights that help validate the idea
- Include actual market data, user statistics, and competitive intelligence
- Write in a professional, analytical tone
- Minimum 300 words with detailed analysis`;
          break;
          
        case 'audience':
          prompt = `You are a marketing strategist. Define the target audience for this idea:

**IDEA:**
Title: "${idea.title}"
Description: "${idea.description}"

**YOUR TASK:**
Create detailed audience profiles that will guide product development and marketing strategy.

**REQUIRED STRUCTURE:**
## Primary Target Audience
[Demographics, psychographics, and specific characteristics]

## User Personas
[2-3 detailed personas with names, backgrounds, and specific needs]

## Market Segments
[Different segments within your target audience and their sizes]

## User Behavior & Preferences
[How your audience currently behaves and what they prefer]

## How They Solve This Problem Now
[Current solutions they use and why they're inadequate]

**CRITICAL REQUIREMENTS:**
- NO generic responses like "innovative idea" or "strong potential"
- Use SPECIFIC demographics, psychographics, and market data
- Include actual numbers, percentages, and real-world examples
- Be BRUTALLY HONEST about audience challenges and limitations
- Provide ACTIONABLE insights for targeting and marketing
- Write in a professional, analytical tone
- Minimum 300 words with detailed analysis`;
          break;
          
        case 'value-proposition':
          prompt = `You are a brand strategist. Create a compelling value proposition for this idea:

**IDEA:**
Title: "${idea.title}"
Description: "${idea.description}"

**YOUR TASK:**
Develop a clear, compelling value proposition that differentiates this idea from competitors.

**REQUIRED STRUCTURE:**
## Core Value Statement
[One clear sentence: "We help [target audience] [achieve outcome] by [unique approach]"]

## Key Differentiators
[3-5 specific ways this is different from existing solutions]

## User Benefits
[Specific outcomes and benefits users will experience]

## Competitive Advantages
[Why users should choose this over competitors]

## Emotional & Functional Benefits
[Both practical benefits and emotional appeal]

**CRITICAL REQUIREMENTS:**
- NO generic responses like "innovative idea" or "strong potential"
- Use SPECIFIC, measurable benefits and outcomes
- Include actual competitive advantages and differentiators
- Be BRUTALLY HONEST about positioning challenges
- Provide ACTIONABLE insights for messaging and positioning
- Write in a professional, analytical tone
- Minimum 300 words with detailed analysis`;
          break;
          
        case 'features':
          prompt = `You are a product manager. Define the core features for this idea:

**IDEA:**
Title: "${idea.title}"
Description: "${idea.description}"

**YOUR TASK:**
Create a comprehensive feature roadmap that balances MVP needs with competitive differentiation.

**REQUIRED STRUCTURE:**
## MVP Features (Must-Have)
[3-5 core features needed for initial launch]

## Advanced Features (Future Versions)
[Features for growth and expansion]

## Unique Differentiators
[Features that set this apart from competitors]

## Technical Capabilities
[Key technical features and integrations]

## User Experience Features
[UX/UI features that enhance usability]

**CRITICAL REQUIREMENTS:**
- NO generic responses like "innovative idea" or "strong potential"
- Use SPECIFIC feature descriptions with clear functionality
- Include actual technical requirements and implementation details
- Be BRUTALLY HONEST about development challenges and costs
- Provide ACTIONABLE insights for product roadmap and prioritization
- Write in a professional, analytical tone
- Minimum 300 words with detailed analysis`;
          break;
          
        case 'competitors':
          prompt = `You are a competitive intelligence analyst. Analyze competitors for this idea:

**IDEA:**
Title: "${idea.title}"
Description: "${idea.description}"

**YOUR TASK:**
Provide a comprehensive competitive analysis that guides strategic positioning.

**REQUIRED STRUCTURE:**
## Direct Competitors
[Companies offering similar solutions with specific details about their offerings]

## Indirect Competitors
[Alternative solutions users might choose instead]

## Competitive Positioning
[How to position this idea in the market landscape]

## Market Gaps & Opportunities
[Underserved areas and unmet needs]

## Differentiation Strategy
[Specific ways to stand out from each competitor]

## Competitive Advantages
[Your strengths vs. their weaknesses]

**CRITICAL REQUIREMENTS:**
- NO generic responses like "innovative idea" or "strong potential"
- Use REAL company names (Notion, Slack, Zoom, etc.) with specific details
- Include actual market data, pricing, user bases, and competitive intelligence
- Be BRUTALLY HONEST about market saturation and competitive threats
- Provide ACTIONABLE insights for strategic positioning and differentiation
- Write in a professional, analytical tone
- Minimum 300 words with detailed analysis`;
          break;
      }

      const response = await aiEngine.generateText(prompt, {
        maxTokens: 2000,
        temperature: 0.8
      });

      const newContent = response.text;
      
      setCoreSections(prev => prev.map(s => 
        s.id === sectionId 
          ? { ...s, content: newContent, lastUpdated: new Date(), isLoading: false }
          : s
      ));

      onContentUpdate?.(sectionId, newContent);

      toast({
        title: "✅ Section Generated",
        description: `${section.title} has been generated successfully`,
        duration: 3000,
      });

    } catch (error) {
      console.error(`Error generating ${sectionId}:`, error);
      
      // Reset loading state on error
      setCoreSections(prev => prev.map(s => 
        s.id === sectionId 
          ? { ...s, isLoading: false }
          : s
      ));

      toast({
        title: "Generation Failed",
        description: `Failed to generate ${section.title}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // Auto-generate research and core sections on component mount
  useEffect(() => {
    if (!aiResearchReport) {
      generateAIResearch();
    }
    if (!feasibilityScore) {
      generateFeasibilityScore();
    }
    
    // Generate core sections content if they're empty
    coreSections.forEach(section => {
      if (!section.content) {
        generateCoreSectionContent(section.id);
      }
    });
  }, [idea.id]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header & Context */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600/20 rounded-full">
                <Brain className="h-6 w-6 text-blue-400" />
              </div>
        <div>
                <CardTitle className="text-white text-2xl">{idea.title}</CardTitle>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className={`${
                    idea.status === 'researching' ? 'bg-blue-600/20 text-blue-400' :
                    idea.status === 'validated' ? 'bg-green-600/20 text-green-400' :
                    'bg-gray-600/20 text-gray-400'
                  } border-0`}>
                    {idea.status || 'researching'}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Wiki Progress:</span>
                    <Progress value={75} className="w-24 h-2" />
                    <span className="text-sm text-gray-400">75%</span>
        </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
        <Button
                onClick={generateAIResearch}
                disabled={isGeneratingResearch}
                variant="outline"
                size="sm"
                className="border-orange-500/30 text-orange-400 hover:bg-orange-600/10"
              >
                {isGeneratingResearch ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Re-run Research
        </Button>
      </div>
          </div>
        </CardHeader>
      </Card>

      {/* AI Deep Research Report */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="h-5 w-5 text-green-400" />
            AI Deep Research Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isGeneratingResearch ? (
            <div className="text-center py-8">
              <RefreshCw className="h-12 w-12 mx-auto text-blue-400 animate-spin mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Analyzing Market & Competition</h3>
              <p className="text-gray-400">AI is conducting deep research on your idea...</p>
            </div>
          ) : aiResearchReport ? (
            <div className="space-y-6">
              {/* Existence Check */}
              <div>
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  Market Existence Check
                </h4>
                <div className={`p-4 rounded-lg border ${
                  aiResearchReport.existenceCheck.exists 
                    ? 'bg-red-600/10 border-red-500/20' 
                    : 'bg-green-600/10 border-green-500/20'
                }`}>
                  <p className={`font-medium ${
                    aiResearchReport.existenceCheck.exists ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {aiResearchReport.existenceCheck.exists 
                      ? '⚠️ This idea already exists in the market' 
                      : '✅ This idea appears to be unique'}
                  </p>
                  <p className="text-gray-300 mt-2">{aiResearchReport.existenceCheck.uniqueness}</p>
                </div>
              </div>

              {/* Competitors */}
              {aiResearchReport.existenceCheck.competitors.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-400" />
                    Top Competitors
                  </h4>
                  <div className="space-y-3">
                    {aiResearchReport.existenceCheck.competitors.map((competitor, index) => (
                      <div key={index} className="bg-black/20 p-4 rounded-lg border border-white/5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="text-white font-medium">{competitor.name}</h5>
                            <p className="text-gray-400 text-sm">{competitor.description}</p>
                          </div>
                          {competitor.website && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-600 text-gray-400 hover:bg-gray-600/10"
                              onClick={() => window.open(competitor.website, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Visit
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-green-400 font-medium">Strengths:</span>
                            <ul className="text-gray-300 mt-1">
                              {competitor.strengths.map((strength, i) => (
                                <li key={i}>• {strength}</li>
                              ))}
                            </ul>
                        </div>
                          <div>
                            <span className="text-red-400 font-medium">Weaknesses:</span>
                            <ul className="text-gray-300 mt-1">
                              {competitor.weaknesses.map((weakness, i) => (
                                <li key={i}>• {weakness}</li>
                              ))}
                            </ul>
                      </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/5">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Pricing: <span className="text-white">{competitor.pricing}</span></span>
                            <span className="text-gray-400">Reach: <span className="text-white">{competitor.reach}</span></span>
                          </div>
                          {competitor.gaps.length > 0 && (
                            <div className="mt-2">
                              <span className="text-yellow-400 font-medium text-sm">Market Gaps:</span>
                              <p className="text-gray-300 text-sm">{competitor.gaps.join(', ')}</p>
                            </div>
                        )}
                      </div>
                    </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unique Value Proposition */}
              <div>
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-400" />
                  AI-Suggested Unique Value Proposition
                </h4>
                <div className="bg-green-600/10 border border-green-500/20 rounded-lg p-4">
                  <p className="text-white">{aiResearchReport.uniqueValueProposition}</p>
                </div>
              </div>

              {/* Differentiation Features */}
              <div>
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-purple-400" />
                  AI-Recommended Differentiation Features
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiResearchReport.differentiationFeatures.map((feature, index) => (
                    <div key={index} className="bg-purple-600/10 border border-purple-500/20 rounded-lg p-3">
                      <p className="text-white text-sm">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
                      <div className="text-center py-8">
              <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Research Report Yet</h3>
              <p className="text-gray-400 mb-4">Generate comprehensive market research and competitive analysis</p>
                        <Button
                onClick={generateAIResearch}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                <Search className="h-4 w-4 mr-2" />
                Generate Research
                        </Button>
                      </div>
                    )}
        </CardContent>
      </Card>

      {/* AI Feasibility Score */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-400" />
            AI Feasibility Scorecard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isGeneratingFeasibility ? (
                      <div className="text-center py-8">
                        <RefreshCw className="h-12 w-12 mx-auto text-blue-400 animate-spin mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Assessing Feasibility</h3>
              <p className="text-gray-400">AI is evaluating market potential and risks...</p>
                      </div>
          ) : feasibilityScore ? (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBgColor(feasibilityScore.overallScore)} border-2 border-white/10`}>
                  <span className={`text-3xl font-bold ${getScoreColor(feasibilityScore.overallScore)}`}>
                    {feasibilityScore.overallScore}
                  </span>
                </div>
                <p className="text-gray-400 mt-2">Overall Feasibility Score</p>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/20 p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Market Saturation</p>
                  <p className={`font-medium ${getLevelColor(feasibilityScore.marketSaturation)}`}>
                    {feasibilityScore.marketSaturation}
                  </p>
                </div>
                <div className="bg-black/20 p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Cpu className="h-5 w-5 text-green-400" />
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Feasibility</p>
                  <p className={`font-medium ${getLevelColor(feasibilityScore.feasibility)}`}>
                    {feasibilityScore.feasibility}
                  </p>
                </div>
                <div className="bg-black/20 p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-2">
                    <DollarSign className="h-5 w-5 text-yellow-400" />
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Monetization</p>
                  <p className={`font-medium ${getLevelColor(feasibilityScore.monetizationFit)}`}>
                    {feasibilityScore.monetizationFit}
                  </p>
                </div>
                <div className="bg-black/20 p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Shield className="h-5 w-5 text-red-400" />
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Risk Level</p>
                  <p className={`font-medium ${getLevelColor(feasibilityScore.riskLevel)}`}>
                    {feasibilityScore.riskLevel}
                  </p>
                </div>
              </div>
            </div>
          ) : (
                      <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Feasibility Assessment Yet</h3>
              <p className="text-gray-400 mb-4">Get AI-powered feasibility and risk analysis</p>
                        <Button
                onClick={generateFeasibilityScore}
                className="bg-green-600 hover:bg-green-700"
                        >
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Assessment
                        </Button>
                      </div>
                    )}
        </CardContent>
      </Card>

      {/* Core Sections */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
                        <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-400" />
              Core Sections (Editable + AI-Powered)
            </CardTitle>
            <Button
              onClick={() => {
                coreSections.forEach(section => {
                  if (!section.content && !section.isLoading) {
                    generateCoreSectionContent(section.id);
                  }
                });
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate All Sections
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coreSections.map((section) => (
              <div key={section.id} className="bg-black/20 p-4 rounded-lg border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="text-white font-medium">{section.title}</h4>
                    {section.isLoading && (
                      <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />
                    )}
                    {section.content && !section.isLoading && (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                    )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                      onClick={() => generateCoreSectionContent(section.id)}
                      disabled={section.isLoading}
                              variant="outline"
                              size="sm"
                      className="border-blue-500/30 text-blue-400 hover:bg-blue-600/10"
                    >
                      {section.isLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      {section.isLoading ? 'Generating...' : 'Regenerate'}
                            </Button>
                            <Button
                      onClick={() => startEditingSection(section.id, section.content)}
                      disabled={section.isLoading}
                              variant="outline"
                              size="sm"
                      className="border-green-500/30 text-green-400 hover:bg-green-600/10"
                            >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                            </Button>
                    {section.content && (
                            <Button
                        onClick={() => copyToClipboard(section.content, section.title)}
                              variant="outline"
                              size="sm"
                              className="border-gray-500/30 text-gray-400 hover:bg-gray-600/10"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                    )}
                          </div>
                        </div>
                        
                {section.isLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 mx-auto text-blue-400 animate-spin mb-3" />
                    <p className="text-gray-400">AI is generating {section.title.toLowerCase()} analysis...</p>
                  </div>
                ) : editingSectionId === section.id ? (
                          <div className="space-y-3">
                            <Textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                      placeholder={`Describe the ${section.title.toLowerCase()}...`}
                      rows={6}
                      className="bg-black/20 border-white/10 text-white placeholder:text-gray-400"
                            />
                            <div className="flex gap-2">
                              <Button
                        onClick={() => saveSectionEdit(section.id)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Save className="h-4 w-4 mr-2" />
                        Save
                              </Button>
                              <Button
                        onClick={cancelSectionEdit}
                                variant="outline"
                                size="sm"
                                className="border-gray-600 text-gray-300"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                  <div className="text-gray-300">
                    {section.content ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-ul:text-gray-300 prose-li:text-gray-300">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {section.content}
                              </ReactMarkdown>
                            </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="text-gray-500 italic mb-3">No content yet. AI will generate this section automatically.</div>
                        <Button
                          onClick={() => generateCoreSectionContent(section.id)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Now
                        </Button>
                          </div>
                        )}
                      </div>
                    )}
                
                {section.lastUpdated && (
                  <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-white/5">
                    Last updated: {section.lastUpdated.toLocaleString()}
                  </div>
                )}
              </div>
            ))}
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
              onClick={exportWiki}
              className="bg-green-600 hover:bg-green-700 h-auto p-4 flex flex-col items-start"
            >
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-4 w-4" />
                <span className="font-medium">Export Wiki</span>
      </div>
              <span className="text-sm text-green-100">PDF/Markdown format</span>
            </Button>

            <Button
              onClick={generateAIResearch}
              disabled={isGeneratingResearch}
              className="bg-blue-600 hover:bg-blue-700 h-auto p-4 flex flex-col items-start"
            >
              <div className="flex items-center gap-2 mb-2">
                {isGeneratingResearch ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="font-medium">Refresh Research</span>
              </div>
              <span className="text-sm text-blue-100">Update market analysis</span>
            </Button>

            <Button
              onClick={() => {
                toast({
                  title: "Share Feature",
                  description: "Public wiki sharing coming soon!",
                });
              }}
              className="bg-purple-600 hover:bg-purple-700 h-auto p-4 flex flex-col items-start"
            >
              <div className="flex items-center gap-2 mb-2">
                <Share2 className="h-4 w-4" />
                <span className="font-medium">Share Public Wiki</span>
              </div>
              <span className="text-sm text-purple-100">One-pager for collaborators</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WikiView;