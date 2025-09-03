"use client"

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Brain, Sparkles, Wand2, Copy, RefreshCw, Send, Lightbulb, 
  Target, TrendingUp, Users, Zap, CheckCircle
} from "lucide-react";
import { aiEngine } from '@/services/aiEngine';
import { useToast } from '@/hooks/use-toast';

interface AIPrompt {
  id: string;
  title: string;
  description: string;
  category: 'wiki' | 'blueprint' | 'journey' | 'feedback';
  prompt: string;
  icon: React.ComponentType<any>;
}

interface AIAssistantProps {
  onContentGenerated: (content: string, category: string) => void;
  ideaContext?: {
    title: string;
    description: string;
    category: string;
  };
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onContentGenerated, ideaContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<AIPrompt | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'templates' | 'custom'>('templates');
  const { toast } = useToast();

  const aiPrompts: AIPrompt[] = [
    // Wiki Analysis Prompts
    {
      id: 'market-research',
      title: 'Market Research Analysis',
      description: 'Generate comprehensive market analysis and opportunity assessment',
      category: 'wiki',
      icon: TrendingUp,
      prompt: `Analyze the market opportunity for: ${ideaContext?.title || '[Your Idea]'}

Please provide:
1. Market size and growth potential (TAM, SAM, SOM)
2. Target customer segments and demographics
3. Key market trends and drivers
4. Competitive landscape overview
5. Market entry opportunities and barriers
6. Regulatory considerations
7. Geographic market analysis`
    },
    {
      id: 'problem-solution',
      title: 'Problem-Solution Fit',
      description: 'Define clear problem statement and solution approach',
      category: 'wiki',
      icon: Lightbulb,
      prompt: `Define the problem-solution fit for: ${ideaContext?.title || '[Your Idea]'}

Include:
1. Core problem statement (clear and specific)
2. Target user pain points and frustrations
3. Current alternatives and their limitations
4. Proposed solution approach
5. Unique value proposition
6. Problem validation evidence
7. Solution differentiation factors`
    },
    {
      id: 'user-personas',
      title: 'User Personas',
      description: 'Generate detailed user personas and use cases',
      category: 'wiki',
      icon: Users,
      prompt: `Create user personas for: ${ideaContext?.title || '[Your Idea]'}

For each persona include:
1. Demographics and background
2. Goals and motivations
3. Pain points and challenges
4. Technology comfort level
5. How they would use the product
6. Decision-making process
7. Budget and purchasing behavior`
    },
    {
      id: 'business-model',
      title: 'Business Model Analysis',
      description: 'Develop comprehensive business model and revenue strategy',
      category: 'wiki',
      icon: Target,
      prompt: `Develop a business model for: ${ideaContext?.title || '[Your Idea]'}

Include:
1. Revenue streams and pricing models
2. Cost structure and key resources
3. Key partnerships and channels
4. Customer acquisition strategy
5. Unit economics and profitability
6. Scalability and growth strategy
7. Risk assessment and mitigation`
    },
    {
      id: 'competition-analysis',
      title: 'Competition Analysis',
      description: 'Analyze competitive landscape and positioning',
      category: 'wiki',
      icon: TrendingUp,
      prompt: `Analyze the competitive landscape for: ${ideaContext?.title || '[Your Idea]'}

Provide:
1. Direct competitors and their offerings
2. Indirect competitors and alternatives
3. Competitive positioning analysis
4. Competitive advantages and disadvantages
5. Market gaps and opportunities
6. Competitive response strategies
7. Barriers to entry analysis`
    },

    // Blueprint Planning Prompts
    {
      id: 'feature-breakdown',
      title: 'Feature Breakdown',
      description: 'Generate detailed feature list with priorities',
      category: 'blueprint',
      icon: Target,
      prompt: `Create a comprehensive feature breakdown for: ${ideaContext?.title || '[Your Idea]'}

Organize by:
1. Core MVP features (must-have for launch)
2. Enhancement features (nice-to-have)
3. Future roadmap features
4. Technical requirements for each
5. Estimated development effort
6. Feature dependencies and sequencing
7. Success metrics for each feature`
    },
    {
      id: 'tech-stack',
      title: 'Technology Recommendations',
      description: 'Suggest optimal technology stack and architecture',
      category: 'blueprint',
      icon: Zap,
      prompt: `Recommend a technology stack for: ${ideaContext?.title || '[Your Idea]'}

Consider:
1. Frontend technologies and frameworks
2. Backend architecture and services
3. Database solutions and data management
4. Third-party integrations and APIs
5. Scalability and performance requirements
6. Security and compliance considerations
7. Development team expertise and learning curve`
    },
    {
      id: 'technical-architecture',
      title: 'Technical Architecture',
      description: 'Design system architecture and infrastructure',
      category: 'blueprint',
      icon: Zap,
      prompt: `Design the technical architecture for: ${ideaContext?.title || '[Your Idea]'}

Include:
1. System architecture overview and components
2. Scalability considerations and load balancing
3. Security architecture and data protection
4. Infrastructure requirements and deployment
5. Monitoring and observability setup
6. Disaster recovery and backup strategies
7. Performance optimization techniques`
    },
    {
      id: 'development-roadmap',
      title: 'Development Roadmap',
      description: 'Create detailed development timeline and phases',
      category: 'blueprint',
      icon: CheckCircle,
      prompt: `Create a development roadmap for: ${ideaContext?.title || '[Your Idea]'}

Structure:
1. Phase 1: Foundation & Planning (Weeks 1-4)
2. Phase 2: MVP Development (Weeks 5-12)
3. Phase 3: Testing & Refinement (Weeks 13-16)
4. Phase 4: Launch Preparation (Weeks 17-20)
5. Post-Launch Phases and iterations
6. Risk mitigation strategies
7. Resource allocation and team scaling`
    },

    // Journey Tracking Prompts
    {
      id: 'milestone-planning',
      title: 'Milestone Planning',
      description: 'Create development timeline with key milestones',
      category: 'journey',
      icon: CheckCircle,
      prompt: `Create a development milestone plan for: ${ideaContext?.title || '[Your Idea]'}

Structure:
1. Pre-development phase (research, planning)
2. MVP development milestones
3. Testing and validation phases
4. Launch preparation
5. Post-launch iterations
6. Success metrics and KPIs
7. Risk assessment and contingency plans`
    },
    {
      id: 'insights-research',
      title: 'Insights & Research',
      description: 'Generate key insights and research findings',
      category: 'journey',
      icon: Lightbulb,
      prompt: `Generate key insights and research findings for: ${ideaContext?.title || '[Your Idea]'}

Include:
1. Key market insights and trends
2. Technical insights and considerations
3. User research findings and behavior patterns
4. Business model insights and opportunities
5. Risk assessment insights and mitigation strategies
6. Learning outcomes and next steps
7. Competitive intelligence and positioning`
    },
    {
      id: 'goals-objectives',
      title: 'Goals & Objectives',
      description: 'Define strategic goals and success metrics',
      category: 'journey',
      icon: Target,
      prompt: `Define strategic goals and objectives for: ${ideaContext?.title || '[Your Idea]'}

Include:
1. Strategic goals and long-term vision
2. Key Performance Indicators (KPIs)
3. Success metrics and benchmarks
4. Milestone tracking and progress indicators
5. Risk management goals and mitigation
6. Review and adjustment processes
7. Stakeholder expectations and deliverables`
    },

    // Feedback & Validation Prompts
    {
      id: 'feedback-strategy',
      title: 'Feedback Collection Strategy',
      description: 'Develop comprehensive feedback collection framework',
      category: 'feedback',
      icon: Users,
      prompt: `Develop a feedback collection strategy for: ${ideaContext?.title || '[Your Idea]'}

Include:
1. Feedback collection methods and channels
2. Feedback categories and prioritization
3. Feedback analysis framework and tools
4. Response and implementation process
5. Feedback metrics and KPIs
6. Continuous improvement process
7. Stakeholder engagement strategies`
    },
    {
      id: 'validation-framework',
      title: 'Validation Framework',
      description: 'Create validation testing and metrics framework',
      category: 'feedback',
      icon: CheckCircle,
      prompt: `Create a validation framework for: ${ideaContext?.title || '[Your Idea]'}

Include:
1. Validation methodology and hypothesis testing
2. Key validation metrics and success criteria
3. Testing and experimentation framework
4. Data collection and analysis methods
5. Validation results and insights
6. Continuous validation process
7. Risk assessment and mitigation strategies`
    },
    {
      id: 'stakeholder-feedback',
      title: 'Stakeholder Feedback',
      description: 'Develop stakeholder feedback management system',
      category: 'feedback',
      icon: Users,
      prompt: `Develop a stakeholder feedback management system for: ${ideaContext?.title || '[Your Idea]'}

Include:
1. Stakeholder identification and mapping
2. Feedback collection strategies and channels
3. Feedback processing and analysis methods
4. Response and implementation processes
5. Relationship management and engagement
6. Feedback integration and learning
7. Communication and reporting strategies`
    }
  ];

  const handleGenerateContent = async () => {
    if (!selectedPrompt && !customPrompt.trim()) return;

    setIsGenerating(true);
    
    const prompt = selectedPrompt ? selectedPrompt.prompt : customPrompt;
    
    try {
      // Use the aiEngine service for actual AI content generation
      const response = await aiEngine.generateText(prompt, {
        maxTokens: 2500,
        temperature: 0.7
      });
      
      setGeneratedContent(response.text);
      
      // Show success toast
      toast({
        title: "✅ AI Analysis Complete",
        description: "Your comprehensive analysis has been generated",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error generating content:', error);
      
      // Fallback to mock content if AI fails
      const mockContent = generateMockContent(selectedPrompt?.category || 'wiki', prompt);
      setGeneratedContent(mockContent);
      
      toast({
        title: "AI Generation Failed",
        description: "Using fallback content. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockContent = (category: string, prompt: string): string => {
    const mockResponses = {
      wiki: `# Market Analysis

## Market Size & Opportunity
The target market for this solution shows significant growth potential, with an estimated TAM of $2.4B and growing at 15% CAGR.

## Target Segments
- **Primary**: Tech-savvy professionals aged 25-40
- **Secondary**: Small business owners seeking efficiency
- **Tertiary**: Enterprise teams looking for collaboration tools

## Key Trends
1. Increasing demand for remote-first solutions
2. Growing focus on productivity and automation
3. Rising adoption of AI-powered tools

## Competitive Landscape
Current solutions lack comprehensive integration and user-friendly interfaces, presenting a clear opportunity for disruption.`,
      
      blueprint: `# Feature Specification

## Core MVP Features
### 1. User Authentication & Onboarding
- **Priority**: High
- **Effort**: 2 weeks
- **Description**: Secure login, registration, and guided onboarding

### 2. Dashboard & Analytics
- **Priority**: High  
- **Effort**: 3 weeks
- **Description**: Central hub with key metrics and insights

### 3. Core Functionality
- **Priority**: High
- **Effort**: 4 weeks
- **Description**: Primary feature set that delivers core value

## Enhancement Features
- Advanced reporting and analytics
- Team collaboration tools
- Third-party integrations
- Mobile application

## Technical Requirements
- React/Next.js frontend
- Node.js/Express backend
- PostgreSQL database
- Redis for caching`,
      
      journey: `# Development Roadmap

## Phase 1: Foundation (Weeks 1-4)
- Market research and validation
- Technical architecture planning
- UI/UX design and prototyping
- Team setup and tooling

## Phase 2: MVP Development (Weeks 5-12)
- Core feature development
- Database design and implementation
- API development and testing
- Frontend implementation

## Phase 3: Testing & Refinement (Weeks 13-16)
- User acceptance testing
- Performance optimization
- Security audit and fixes
- Documentation completion

## Phase 4: Launch Preparation (Weeks 17-20)
- Beta testing with select users
- Marketing material preparation
- Deployment infrastructure setup
- Launch strategy execution`
    };

    return mockResponses[category as keyof typeof mockResponses] || mockResponses.wiki;
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(generatedContent);
  };

  const handleUseContent = () => {
    if (generatedContent && selectedPrompt) {
      onContentGenerated(generatedContent, selectedPrompt.category);
      setIsOpen(false);
      setGeneratedContent('');
      setSelectedPrompt(null);
    }
  };

  const filteredPrompts = aiPrompts.filter(prompt => 
    activeTab === 'templates' ? true : false
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="workspace-button">
          <Brain className="h-4 w-4 mr-2" />
          AI Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl glass-effect-theme border-green-500/20 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-400" />
            AI Content Assistant
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'templates' ? 'default' : 'outline'}
              onClick={() => setActiveTab('templates')}
              className={activeTab === 'templates' ? 'workspace-button' : 'border-green-500/30 text-green-400 hover:bg-green-600/10'}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button
              variant={activeTab === 'custom' ? 'default' : 'outline'}
              onClick={() => setActiveTab('custom')}
              className={activeTab === 'custom' ? 'workspace-button' : 'border-green-500/30 text-green-400 hover:bg-green-600/10'}
            >
              <Send className="h-4 w-4 mr-2" />
              Custom Prompt
            </Button>
          </div>

          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiPrompts.map((prompt) => {
                const Icon = prompt.icon;
                return (
                  <Card
                    key={prompt.id}
                    className={`glass-effect cursor-pointer transition-all hover:bg-white/5 ${
                      selectedPrompt?.id === prompt.id ? 'ring-2 ring-green-500/50' : ''
                    }`}
                    onClick={() => setSelectedPrompt(prompt)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-green-600/20">
                          <Icon className="h-4 w-4 text-green-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-white mb-1">{prompt.title}</h3>
                          <p className="text-sm text-gray-400 mb-2">{prompt.description}</p>
                          <Badge className="bg-green-600/20 text-green-400 border-green-500/30 text-xs">
                            {prompt.category}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Custom Prompt</label>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Enter your custom prompt for AI content generation..."
                  className="bg-black/30 border-green-500/20 text-white min-h-[120px] focus:border-green-500/40"
                />
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleGenerateContent}
              disabled={isGenerating || (!selectedPrompt && !customPrompt.trim())}
              className="workspace-button"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </div>

          {/* Generated Content */}
          {generatedContent && (
            <Card className="glass-effect-theme">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Generated Content</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyContent}
                      className="border-green-500/30 text-green-400 hover:bg-green-600/10"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleUseContent}
                      className="workspace-button"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Use Content
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-black/30 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans">
                    {generatedContent}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIAssistant;
