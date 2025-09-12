"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";
import {
  Bell,
  Brain,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FileSpreadsheet,
  Globe2,
  Lightbulb,
  LogOut,
  Palette,
  Rocket,
  Search,
  Settings,
  Shield,
  Sparkles,
  User,
  TrendingUp,
  BarChart3,
  CalendarDays,
  Zap,
  X,
  Menu,
  Save
} from "lucide-react";

// Import AI services and components
import StartupBriefGenerator from "@/components/StartupBriefGenerator";
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useProfile } from '@/contexts/ProfileContext';
import ProfileCompletionProgress from '@/components/profile/ProfileCompletionProgress';
import { aiEngine } from '@/services/aiEngine';
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAI } from '@/hooks/useEnhancedAI';
// import FlowProgress from "@/components/dashboard/FlowProgress";
// import QuickStats from "@/components/dashboard/QuickStats";
import { useActiveIdea, useIdeaContext, type ActiveIdea } from "@/stores/ideaStore";
// import { AISettingsPanel } from '@/components/ai-settings';
// import AdminStatusIndicator from '@/components/admin/AdminStatusIndicator';
// import AdminQuickActions from '@/components/admin/AdminQuickActions';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabaseHelpers } from '@/lib/supabase-connection-helpers';
// import { WorkspaceContainer, WorkspaceHeader } from '@/components/ui/workspace-layout';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { searchService, SearchResult } from '@/services/searchService';
import SearchResults from '@/components/SearchResults';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import NotificationPanel from '@/components/notifications/NotificationPanel';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useLoadingState } from '@/hooks/useLoadingState';
import ErrorBoundary from '@/components/ErrorBoundary';
import { LoadingSpinner, ProjectCardSkeleton, TaskCardSkeleton, NotificationSkeleton } from '@/components/LoadingSpinner';

interface Project {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
  stage?: 'idea' | 'planning' | 'development' | 'testing' | 'launch';
  progress?: number;
}

interface Task {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  status?: 'todo' | 'in-progress' | 'done';
}

interface Module {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  isNew?: boolean;
  badge?: string;
}

// Brainstorm Ideas Types
interface BrainstormIdea {
  id: string;
  title: string;
  problem: string;
  whyNow: string;
  audience: string;
  category: string;
  trendConnection: string;
  createdAt: string;
}

type BrainstormCategory = 'WebTech' | 'EduTech' | 'AgriTech' | 'FinTech' | 'HealthTech' | 'ClimateTech' | 'Other';

interface GPTFeature {
  icon: React.ReactNode;
  title: string;
  desc: string;
  action: string;
  onClick: () => void;
  tooltip: string;
}

interface WeeklyGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  dueDate: string;
}

interface TrendingIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  popularity: number;
}

type Category = 'ideation' | 'planning' | 'execution' | 'validation';

export default function WorkspacePage() {
  console.log("🔥 WorkspacePage component started rendering");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  console.log("🔥 State initialized");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showPromptHistory, setShowPromptHistory] = useState(false);

  // Workshop/Idea validation state
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [showValidationResult, setShowValidationResult] = useState(false);

  // Store hooks
  const { canCreateNewIdea, setHasActiveIdea, setCurrentStep, setActiveIdea } = useIdeaContext();

  const [showTemplates, setShowTemplates] = useState(false);

  const { toast } = useToast();
  const { canUseFeature } = useFeatureAccess();
  const ai = useEnhancedAI();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    formatTimeAgo
  } = useRealtimeNotifications();

  const {
    projects: allProjects,
    stats: projectStats,
    getRecentProjects,
    getStageColor,
    formatTimeAgo: formatProjectTime
  } = useProjects();

  const {
    tasks: allTasks,
    stats: taskStats,
    getRecentTasks,
    getPriorityColor,
    formatDueDate,
    formatTimeAgo: formatTaskTime
  } = useTasks();

  // Error handling and loading states
  const { errorState, handleError, clearError, withErrorHandling } = useErrorHandler();
  const {
    isLoading,
    startLoading,
    stopLoading,
    withLoading
  } = useLoadingState();

  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<GPTFeature | null>(null);
  const [showAISettings, setShowAISettings] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>('ideation');
  const [gptInput, setGptInput] = useState("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [showResponse, setShowResponse] = useState(false);

  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [trendingIdeas, setTrendingIdeas] = useState<TrendingIdea[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const [showStartupBrief, setShowStartupBrief] = useState(false);
  const [briefPrompt, setBriefPrompt] = useState("");
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Brainstorm Ideas State
  const [showBrainstorm, setShowBrainstorm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BrainstormCategory>('WebTech');
  const [brainstormIdeas, setBrainstormIdeas] = useState<BrainstormIdea[]>([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [savedIdeas, setSavedIdeas] = useState<BrainstormIdea[]>([]);
  const [savedIdeaIds, setSavedIdeaIds] = useState<Set<string>>(new Set());
  
  // Detailed Idea View State
  const [showIdeaDetail, setShowIdeaDetail] = useState(false);
  const [selectedIdeaDetail, setSelectedIdeaDetail] = useState<BrainstormIdea | null>(null);

  const notificationRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { signOut, user, loading } = useAuth();
  const { isAdmin } = useAdmin();
  const { profile, isProfileComplete } = useProfile();

  // Click outside handlers for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(target)) {
        setShowSettings(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setShowProfile(false);
      }
      if (searchRef.current && !searchRef.current.contains(target)) {
        setShowSearchResults(false);
      }
    };

    // Use capture phase to ensure we catch the event before it bubbles
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, []);

  // Fetch initial data - Mock implementation
  useEffect(() => {
    const fetchData = async () => {
      // Data is now handled by hooks
    };

    // Initialize with empty data - users will create their own content
    const initializeEnhancedData = () => {
      setWeeklyGoals([]);
      setTrendingIdeas([]);
      setUpcomingEvents([]);
    };

    fetchData();
    initializeEnhancedData();
  }, []);

  // Idea validation function (from Workshop)
  const validateIdea = async (ideaText: string) => {
    if (!canUseFeature('create_idea')) {
      toast({
        title: "Feature Limited",
        description: "Please upgrade to validate more ideas.",
        variant: "destructive",
      });
      return;
    }
  };

  const performIdeaValidation = async (ideaText: string) => {
    if (!canCreateNewIdea()) {
      toast({
        title: "Cannot Create New Idea",
        description: "You already have an active idea. Archive it first or upgrade to Pro.",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);
    setShowValidationResult(false);

    try {
      const prompt = `
      Analyze this startup idea comprehensively and provide a detailed validation report:

      Idea: "${ideaText}"

      Please provide a structured analysis with clear sections and proper formatting:

      ## 1. VALIDATION SCORE (0-100)
      Provide an overall viability score with brief justification.

      ## 2. MARKET OPPORTUNITY
      Analyze market size, demand, and potential. Include specific data points where possible.

      ## 3. RISK ASSESSMENT
      List key risks and challenges:
      - Risk 1: Description
      - Risk 2: Description
      - Risk 3: Description

      ## 4. MONETIZATION STRATEGY
      Describe revenue model suggestions with specific examples.

      ## 5. KEY FEATURES
      Essential features for MVP:
      - Feature 1: Description
      - Feature 2: Description
      - Feature 3: Description

      ## 6. NEXT STEPS
      Immediate actionable steps:
      - Step 1: Description
      - Step 2: Description
      - Step 3: Description

      ## 7. COMPETITOR ANALYSIS
      Similar solutions and differentiation opportunities.

      ## 8. TARGET MARKET
      Primary customer segments with demographics and characteristics.

      ## 9. PROBLEM STATEMENT
      Core problem being solved and its significance.

      Use proper markdown formatting with headers (##), bullet points (-), and clear section separation.
      `;

      // Use real AI service for validation
      const validationResponse = await ai.validateIdea(prompt);
      const mockValidationText = (validationResponse as any).text || validationResponse;

      // Parse the response to extract structured data
      const validationScore = extractValidationScore(mockValidationText);
      const sections = parseValidationResponse(mockValidationText);

      // Generate static ID to prevent hydration mismatch
      let idCounter = 1;
      const generateId = () => `idea-${idCounter++}`;
      
      const validatedIdea = {
        id: generateId(),
        title: extractIdeaTitle(ideaText),
        description: ideaText,
        status: 'active' as const,
        validation_score: validationScore,
        market_opportunity: sections.marketOpportunity,
        risk_assessment: sections.riskAssessment,
        monetization_strategy: sections.monetizationStrategy,
        key_features: sections.keyFeatures,
        next_steps: sections.nextSteps,
        competitor_analysis: sections.competitorAnalysis,
        target_market: sections.targetMarket,
        problem_statement: sections.problemStatement,
        created_at: '2025-08-04T00:00:00.000Z',
        updated_at: '2025-08-04T00:00:00.000Z'
      };

      setValidationResult({
        idea: validatedIdea,
        fullResponse: mockValidationText,
        score: validationScore
      });

      setShowValidationResult(true);

      toast({
        title: "Idea Validated!",
        description: `Your idea scored ${validationScore}/100. Review the analysis below.`,
      });

    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Validation Failed",
        description: "Could not validate your idea. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Helper functions for parsing validation response
  const extractValidationScore = (text: string): number => {
    const scoreMatch = text.match(/VALIDATION SCORE.*?(\d+)/i);
    return scoreMatch ? parseInt(scoreMatch[1]) : 75;
  };

  const extractIdeaTitle = (description: string): string => {
    const words = description.split(' ').slice(0, 6);
    return words.join(' ') + (description.split(' ').length > 6 ? '...' : '');
  };

  const parseValidationResponse = (text: string) => {
    const sections = {
      marketOpportunity: extractSection(text, 'MARKET OPPORTUNITY'),
      riskAssessment: extractSection(text, 'RISK ASSESSMENT'),
      monetizationStrategy: extractSection(text, 'MONETIZATION STRATEGY'),
      keyFeatures: extractListSection(text, 'KEY FEATURES'),
      nextSteps: extractListSection(text, 'NEXT STEPS'),
      competitorAnalysis: extractSection(text, 'COMPETITOR ANALYSIS'),
      targetMarket: extractSection(text, 'TARGET MARKET'),
      problemStatement: extractSection(text, 'PROBLEM STATEMENT')
    };
    return sections;
  };

  const extractSection = (text: string, sectionName: string): string => {
    const regex = new RegExp(`${sectionName}:?\\s*([\\s\\S]*?)(?=\\n\\d+\\.|\\n[A-Z][A-Z\\s]+:|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  };

  const extractListSection = (text: string, sectionName: string): string[] => {
    const sectionText = extractSection(text, sectionName);
    return sectionText.split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[-*•]\s*/, '').trim())
      .filter(item => item.length > 0);
  };

  const saveValidatedIdea = () => {
    if (!validationResult) return;

    setActiveIdea(validationResult.idea);
    setHasActiveIdea(true);
    setCurrentStep('vault');

    toast({
      title: "Idea Saved!",
      description: "Your validated idea has been saved to your Idea Vault.",
    });

    // Navigate to Idea Vault
    router.push('/workspace/idea-vault');
  };

  const handleSubmit = withErrorHandling(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gptInput.trim()) return;

    startLoading('aiResponse');
    setShowResponse(true);
    clearError();

    try {
      // Enhanced prompt for Founder's GPT expertise with better structure
      const enhancedPrompt = `
      As an AI co-founder with deep expertise in startup journeys, provide detailed advice on: ${gptInput}

      Please structure your response with clear sections:
      
      ## Strategic Analysis
      - Market opportunity assessment
      - Competitive landscape overview
      - Key success factors
      
      ## Actionable Recommendations
      - Specific next steps (prioritized)
      - Resource requirements
      - Timeline considerations
      
      ## Potential Challenges & Solutions
      - Common pitfalls to avoid
      - Risk mitigation strategies
      - Alternative approaches
      
      ## Next Steps
      - Immediate actions (next 30 days)
      - Medium-term goals (3-6 months)
      - Long-term vision (6+ months)

      Draw from Y Combinator principles, IndieHackers insights, and successful founder strategies. Provide specific, practical guidance with concrete examples.`

      // Use the AI instance from useEnhancedAI hook with enhanced options
      console.log('Sending AI request with enhanced prompt');
      const response = await ai.generateText(enhancedPrompt, {
        temperature: 0.8,
        maxTokens: 2000
      });
      
      console.log('AI response received with confidence:', response.confidence);

      if (!response || !response.text) {
        console.error('Invalid response format:', response);
        throw new Error('No response received from AI service');
      }

      setAiResponse(response.text);

      // Enhanced auto-sync to Idea Vault with better idea detection
      const responseText = response.text.toLowerCase();
      const isStartupRelated = responseText.includes('startup') || 
                              responseText.includes('business') ||
                              responseText.includes('idea') ||
                              responseText.includes('venture') ||
                              responseText.includes('entrepreneur') ||
                              gptInput.toLowerCase().includes('idea') ||
                              gptInput.toLowerCase().includes('app') ||
                              gptInput.toLowerCase().includes('startup') ||
                              gptInput.toLowerCase().includes('build');

      if (isStartupRelated) {
        setIsGeneratingIdea(true);

        try {
          // Enhanced idea extraction with better patterns
          const ideaPatterns = [
            /(?:idea|concept|solution|opportunity):\s*([^\n]+)/i,
            /(?:build|create|develop)\s+(?:a\s+)?([^.!?]+)/i,
            /(?:startup|business|venture)\s+(?:idea|concept):\s*([^\n]+)/i
          ];

          let extractedIdea = null;
          for (const pattern of ideaPatterns) {
            const match = response.text.match(pattern);
            if (match && match[1]) {
              extractedIdea = match[1].trim();
              break;
            }
          }

          const ideaTitle = extractedIdea || (gptInput.length > 50 ? gptInput.substring(0, 50) + '...' : gptInput);

          // Set validation result for better idea tracking
          setValidationResult({
            idea: ideaTitle,
            score: Math.min(85, 70 + (response.confidence * 20)),
            feedback: `AI-generated insight (Confidence: ${Math.round(response.confidence * 100)}%)`,
            suggestions: [
              "Validate with market research",
              "Test with potential customers", 
              "Analyze competitive landscape",
              "Define clear value proposition"
            ],
            marketPotential: Math.min(85, 65 + (response.confidence * 25)),
            technicalFeasibility: Math.min(85, 70 + (response.confidence * 20)),
            competitiveAdvantage: Math.min(85, 60 + (response.confidence * 30))
          });

          toast({
            title: "💡 Idea Detected!",
            description: "We've identified a potential startup idea in the AI response. Check the validation section below.",
            duration: 5000,
          });
        } catch (ideaError) {
          console.error('Error processing idea:', ideaError);
        } finally {
          setIsGeneratingIdea(false);
        }
      }

    } catch (error) {
      console.error("AI Generation Error:", error);

      let errorMessage = "Failed to generate AI response";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setAiResponse(`❌ ${errorMessage}\n\nPlease try again or check your AI configuration in Settings.`);
      handleError(error, "Failed to generate AI response");
    } finally {
      stopLoading('aiResponse');
    }
  }, "Failed to process AI request");

  // Enhanced logout function
  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Failed",
        description: "Unable to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Get recent projects for display
  const recentProjects = getRecentProjects().map(project => ({
    id: project.id,
    name: project.name,
    description: project.description,
    lastUpdated: formatProjectTime(project.updatedAt),
    stage: project.stage,
    progress: project.progress
  }));

  // Get recent tasks for display
  const recentTaskItems = getRecentTasks().map(task => ({
    id: task.id,
    title: task.title,
    priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
    dueDate: task.dueDate ? formatDueDate(task.dueDate).text : 'No due date',
    status: task.status,
    isOverdue: task.dueDate ? formatDueDate(task.dueDate).isOverdue : false
  }));

  // Debug logging
  console.log('🔥 Recent Projects:', recentProjects);
  console.log('🔥 Recent Tasks:', recentTaskItems);

  const modules: Module[] = [
    {
      id: "workshop",
      name: "Workshop",
      description: "Free playground for idea validation with AI",
      path: "/workspace/workshop",
      icon: "🧠"
    },
    {
      id: "idea-vault",
      name: "Idea Vault",
      description: "Store and manage your startup ideas",
      path: "/workspace/idea-vault",
      icon: "💡"
    },
    {
      id: "ideaforge",
      name: "IdeaForge",
      description: "🆕 Turn ideas into actionable product frameworks with AI-powered Business Model Canvas, blueprints, and strategic planning tools.",
      path: "/workspace/idea-forge",
      icon: "⚙️",
      isNew: true
    },
    {
      id: "mvp-studio",
      name: "MVP Studio",
      description: "Your AI-powered build orchestrator. Generate prompts, get tool recommendations, and build your MVP with the best AI builders in the market.",
      path: "/workspace/mvp-studio",
      icon: "🚀"
    },
    {
      id: "docs-decks",
      name: "Docs & Decks",
      description: "Create and manage your startup documents",
      path: "/workspace/docs-decks",
      icon: "📄"
    },
    {
      id: "investor-radar",
      name: "Investor Radar",
      description: "🆕 Browse and connect with 100+ verified investors. Access complete profiles with direct contact information, investment preferences, and focus areas. No signup required - start connecting immediately.",
      path: "/workspace/investor-radar",
      icon: "🎯",
      isNew: true
    }
  ];





  const quickActions = [
    {
      title: "Validate Idea",
      description: "Get AI-powered validation for your startup concept",
      icon: <Lightbulb className="h-5 w-5 text-yellow-400" />,
      category: 'ideation',
      onClick: () => {
        // Navigate to Workshop for idea validation
        router.push('/workspace/workshop');
      }
    },
    {
      title: "Brainstorm Ideas",
      description: "Generate new startup ideas based on trends",
      icon: <Sparkles className="h-5 w-5 text-yellow-400" />,
      category: 'ideation',
      onClick: () => {
        setShowBrainstorm(true);
      }
    },
    {
      title: "Business Model",
      description: "Create a business model canvas",
      icon: <FileSpreadsheet className="h-5 w-5 text-blue-400" />,
      category: 'planning',
      onClick: () => {
        // Navigate to Idea Forge with BMC tab
        router.push('/workspace/idea-forge?tab=bmc');
      }
    },
    {
      title: "Roadmap Planning",
      description: "Create a strategic roadmap",
      icon: <CalendarDays className="h-5 w-5 text-blue-400" />,
      category: 'planning',
      onClick: () => {
        // Navigate to Task Planner for roadmap creation
        router.push('/workspace/task-planner');
      }
    },
    {
      title: "MVP Features",
      description: "Define your minimum viable product",
      icon: <Rocket className="h-5 w-5 text-green-400" />,
      category: 'execution',
      onClick: () => {
        // Navigate to MVP Studio
        router.push('/workspace/mvp-studio');
      }
    },
    {
      title: "Tech Stack",
      description: "Choose the right technology stack",
      icon: <Zap className="h-5 w-5 text-green-400" />,
      category: 'execution',
      onClick: () => {
        // Use AI to recommend tech stack
        setGptInput("I need recommendations for a technology stack. Please analyze my project requirements and suggest: 1) Frontend technologies 2) Backend technologies 3) Database options 4) Deployment platforms 5) Development tools. My project is: ");
        setShowResponse(true);
      }
    },
    {
      title: "Market Analysis",
      description: "Analyze your target market",
      icon: <Globe2 className="h-5 w-5 text-purple-400" />,
      category: 'validation',
      onClick: () => {
        // Use AI for market analysis
        setGptInput("Conduct a comprehensive market analysis for my startup idea. Include: 1) Market size and growth potential 2) Target customer segments 3) Competitor analysis 4) Market trends 5) Entry barriers 6) Opportunities and threats. My idea is: ");
        setShowResponse(true);
      }
    },
    {
      title: "User Research",
      description: "Design user research strategy",
      icon: <User className="h-5 w-5 text-purple-400" />,
      category: 'validation',
      onClick: () => {
        // Use AI for user research strategy
        setGptInput("Help me design a user research strategy. Provide: 1) Research objectives 2) Target user personas 3) Research methods (surveys, interviews, etc.) 4) Key questions to ask 5) Success metrics 6) Timeline. My product is: ");
        setShowResponse(true);
      }
    }
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Handler functions for non-functional buttons


  const handleViewAllProjects = () => {
    console.log('🔥 handleViewAllProjects called - navigating to idea-vault');
    router.push('/workspace/idea-vault');
  };

  const handleViewAllTasks = () => {
    console.log('🔥 handleViewAllTasks called - navigating to task-planner');
    router.push('/workspace/task-planner');
  };



  const handleProjectClick = (projectId: string) => {
    router.push(`/workspace/idea-vault/${projectId}`);
  };

  // Search functionality
  const performSearch = withErrorHandling(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    startLoading('search');
    setShowSearchResults(true);

    try {
      const results = await searchService.search(query, { limit: 10 });
      setSearchResults(results);
    } finally {
      stopLoading('search');
    }
  }, "Failed to perform search");

  // Brainstorm Ideas Functions
  const generateBrainstormIdeas = withErrorHandling(async (category: BrainstormCategory) => {
    setIsGeneratingIdeas(true);
    
    try {
      const prompt = `Generate 5 innovative startup ideas in the ${category} category. For each idea, provide:
1. A catchy title (one-liner)
2. The specific problem it solves
3. Why this is the right time (trend connection)
4. Target audience
5. Key trend connection

Format the response as JSON with this structure:
{
  "ideas": [
    {
      "title": "Idea Title",
      "problem": "Problem description",
      "whyNow": "Why now explanation",
      "audience": "Target audience",
      "trendConnection": "Trend connection"
    }
  ]
}`;

      const response = await ai.generateText(prompt);
      
      try {
        const parsed = JSON.parse(response);
        const ideas: BrainstormIdea[] = parsed.ideas.map((idea: any, index: number) => ({
          id: `brainstorm-${Date.now()}-${index}`,
          title: idea.title,
          problem: idea.problem,
          whyNow: idea.whyNow,
          audience: idea.audience,
          category: category,
          trendConnection: idea.trendConnection,
          createdAt: new Date().toISOString()
        }));
        
        setBrainstormIdeas(ideas);
        toast({
          title: "Ideas Generated!",
          description: `Generated ${ideas.length} fresh ${category} startup ideas`,
        });
      } catch (parseError) {
        // Fallback if JSON parsing fails
        const fallbackIdeas: BrainstormIdea[] = [
          {
            id: `brainstorm-${Date.now()}-1`,
            title: `AI-Powered ${category} Solution`,
            problem: "Current solutions lack intelligence and automation",
            whyNow: "AI adoption is accelerating across industries",
            audience: `${category} professionals and businesses`,
            category: category,
            trendConnection: "AI and automation trends",
            createdAt: new Date().toISOString()
          }
        ];
        setBrainstormIdeas(fallbackIdeas);
      }
    } finally {
      setIsGeneratingIdeas(false);
    }
  }, "Failed to generate brainstorm ideas");

  const saveIdea = withErrorHandling(async (idea: BrainstormIdea) => {
    try {
      // Save to idea vault using supabaseHelpers
      const { data, error } = await supabaseHelpers.createIdea({
        title: idea.title,
        description: `**Problem:** ${idea.problem}\n\n**Why Now:** ${idea.whyNow}\n\n**Target Audience:** ${idea.audience}\n\n**Trend Connection:** ${idea.trendConnection}`,
        category: idea.category.toLowerCase(),
        tags: ['brainstorm', 'ai-generated', idea.category.toLowerCase()]
      });

      if (error) {
        throw new Error(error.message || 'Failed to save idea');
      }

      // Add to local saved ideas for UI
      setSavedIdeas(prev => [...prev, idea]);
      setSavedIdeaIds(prev => {
        const newSet = new Set(prev);
        newSet.add(idea.id);
        return newSet;
      });
      
      toast({
        title: "Idea Saved to Vault!",
        description: `"${idea.title}" has been saved to your Idea Vault`,
      });
    } catch (error) {
      console.error('Failed to save idea to Supabase:', error);
      // Fallback to local storage if supabase fails
      setSavedIdeas(prev => [...prev, idea]);
      setSavedIdeaIds(prev => {
        const newSet = new Set(prev);
        newSet.add(idea.id);
        return newSet;
      });
      toast({
        title: "Idea Saved Locally!",
        description: `"${idea.title}" has been saved locally`,
      });
    }
  }, "Failed to save idea");

  const expandIdea = (idea: BrainstormIdea) => {
    // Show detailed idea view modal instead of navigating to IdeaForge
    setSelectedIdeaDetail(idea);
    setShowIdeaDetail(true);
  };

  const regenerateIdeas = () => {
    // Clear current ideas before regenerating
    setBrainstormIdeas([]);
    generateBrainstormIdeas(selectedCategory);
  };

  const regenerateSpecificIdea = (ideaId: string) => {
    // Remove the specific idea and generate a new one
    setBrainstormIdeas(prev => prev.filter(idea => idea.id !== ideaId));
    generateBrainstormIdeas(selectedCategory);
  };

  const saveAllIdeas = withErrorHandling(async () => {
    if (brainstormIdeas.length === 0) return;
    
    let savedCount = 0;
    const newSavedIdeas: BrainstormIdea[] = [];
    const newSavedIds = new Set(savedIdeaIds);
    
    for (const idea of brainstormIdeas) {
      // Skip if already saved
      if (savedIdeaIds.has(idea.id)) {
        savedCount++;
        continue;
      }
      
      try {
        const { error } = await supabaseHelpers.createIdea({
          title: idea.title,
          description: `**Problem:** ${idea.problem}\n\n**Why Now:** ${idea.whyNow}\n\n**Target Audience:** ${idea.audience}\n\n**Trend Connection:** ${idea.trendConnection}`,
          category: idea.category.toLowerCase(),
          tags: ['brainstorm', 'ai-generated', idea.category.toLowerCase()]
        });
        
        if (!error) {
          savedCount++;
          newSavedIdeas.push(idea);
          newSavedIds.add(idea.id);
        }
      } catch (error) {
        console.error('Failed to save idea:', idea.title, error);
      }
    }
    
    // Update state with all new saved ideas
    if (newSavedIdeas.length > 0) {
      setSavedIdeas(prev => [...prev, ...newSavedIdeas]);
      setSavedIdeaIds(newSavedIds);
    }
    
    toast({
      title: "Ideas Saved!",
      description: `${savedCount} out of ${brainstormIdeas.length} ideas saved to your Idea Vault`,
    });
  }, "Failed to save all ideas");

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Show loading state while the app initializes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-glass">
        <div className="text-center workspace-card p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // User display helpers
  const getUserDisplayName = () => {
    if ((user as any)?.displayName) return (user as any).displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserEmail = () => {
    return user?.email || 'user@example.com';
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      performSearch(searchQuery);
    } else if (e.key === 'Escape') {
      setShowSearchResults(false);
      setSearchQuery('');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim()) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  };

  const handleSearchResultClick = (result: SearchResult) => {
    setShowSearchResults(false);
    setSearchQuery('');
    // Navigation is handled by the Link component in SearchResults
  };

  const handleNotificationClick = (notificationId: string) => {
    console.log('🔥 Notification clicked:', notificationId);
    markAsRead(notificationId);
    const notification = notifications.find(n => n.id === notificationId);
    if (notification?.data?.actionUrl) {
      console.log('🔥 Navigating to:', notification.data.actionUrl);
      router.push(notification.data.actionUrl);
    }
    setShowNotifications(false);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    toast({
      title: "Notifications",
      description: "All notifications marked as read",
    });
  };

  const handleTestNotification = () => {
    // Test notification functionality is now handled by the notification panel
    toast({
      title: "Test Notification",
      description: "A test notification has been added",
    });
  };



  console.log("🔥 About to render main content");

  return (
    <ErrorBoundary>
      <div className="workspace-full-height bg-green-glass">
        <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="w-full workspace-full-height">
        <div className="flex flex-col w-full workspace-full-height">
          {/* Enhanced Top Navigation Bar */}
          <div className="workspace-nav-enhanced w-full">
            <div className="flex items-center justify-between w-full px-4 md:px-6 py-3 md:py-4">
              {/* Left Section - Hamburger, Search & Context */}
              <div className="flex items-center gap-2 md:gap-4 flex-1">
                {/* Hamburger Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-black/30"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>
                {/* Enhanced Search bar */}
                <div ref={searchRef} className="relative flex-1 max-w-xs md:max-w-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search workspace..."
                    className="pl-10 pr-4 py-2 w-full md:w-80 workspace-input-enhanced"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                    onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden md:block">
                    <kbd className="px-2 py-1 text-xs text-gray-400 bg-black/30 rounded border border-white/10">
                      ⌘K
                    </kbd>
                  </div>

                  {/* Search Results */}
                  {showSearchResults && (
                    <SearchResults
                      results={searchResults}
                      query={searchQuery}
                      onResultClick={handleSearchResultClick}
                      isLoading={isLoading('search')}
                    />
                  )}
                </div>

                {/* Context Switcher - Hidden on mobile */}
                <div className="hidden md:flex items-center gap-2">
                  <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-black/30 px-3 py-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    Today
                    <ChevronDown className="h-3 w-3 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Right Section - Actions & Profile */}
              <div className="flex items-center gap-2 md:gap-3">
                {/* AI Status Indicator - Hidden on mobile */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400 font-medium">AI Ready</span>
                </div>

                {/* Divider - Hidden on mobile */}
                <div className="hidden md:block h-6 w-px bg-white/10"></div>

                {/* Notification Button */}
                <div ref={notificationRef} className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white hover:bg-black/30 relative"
                    onClick={() => {
                      console.log('🔥 Notification button clicked, current state:', showNotifications);
                      setShowNotifications((v) => !v);
                    }}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-green-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Button>
                  <NotificationPanel 
                    isOpen={showNotifications} 
                    onClose={() => setShowNotifications(false)} 
                  />
                </div>

                {/* Settings Button */}
                <div ref={settingsRef} className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white hover:bg-black/30"
                    onClick={() => setShowSettings((v) => !v)}
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                  {showSettings && (
                    <div className="absolute right-0 mt-2 w-72 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 p-4 workspace-dropdown">
                      <h3 className="font-semibold text-white mb-3">Settings</h3>
                      <div className="space-y-2">
                        <button
                          className="w-full text-left p-2 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-3"
                          onClick={() => {
                            setShowAISettings(true);
                            setShowSettings(false);
                          }}
                        >
                          <Brain className="h-4 w-4 text-green-400" />
                          <span className="text-sm text-gray-300">AI Provider Settings</span>
                        </button>
                        <button
                          className="w-full text-left p-2 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-3"
                          onClick={() => {
                            toast({
                              title: "Theme Settings",
                              description: "Theme customization coming soon!",
                            });
                            setShowSettings(false);
                          }}
                        >
                          <Palette className="h-4 w-4 text-blue-400" />
                          <span className="text-sm text-gray-300">Theme Preferences</span>
                        </button>
                        <button
                          className="w-full text-left p-2 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-3"
                          onClick={() => {
                            toast({
                              title: "Privacy Settings",
                              description: "Privacy & security settings coming soon!",
                            });
                            setShowSettings(false);
                          }}
                        >
                          <Shield className="h-4 w-4 text-purple-400" />
                          <span className="text-sm text-gray-300">Privacy &amp; Security</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Button with Avatar */}
                <div ref={profileRef} className="relative">
                  <Button
                    variant="ghost"
                    className="text-gray-300 hover:text-white hover:bg-black/30 px-3 py-2 flex items-center gap-2"
                    onClick={() => setShowProfile((v) => !v)}
                  >
                    <div className="h-7 w-7 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{getUserInitials()}</span>
                    </div>
                    <span className="text-sm font-medium hidden md:inline">{getUserDisplayName()}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  {showProfile && (
                    <div className="absolute right-0 mt-2 w-64 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 p-4 workspace-dropdown">
                      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                        <div className="h-10 w-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">{getUserInitials()}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{getUserDisplayName()}</p>
                          <p className="text-xs text-gray-400">{getUserEmail()}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Link href="/account" className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-300">Account Settings</span>
                        </Link>
                        {isAdmin && (
                          <>
                            <div className="border-t border-white/10 my-2"></div>
                            <Link href="/admin" className="flex items-center gap-3 p-2 hover:bg-green-500/10 rounded-lg transition-colors">
                              <Shield className="h-4 w-4 text-green-400" />
                              <span className="text-sm text-green-400">Admin Panel</span>
                            </Link>
                          </>
                        )}
                        <div className="border-t border-white/10 my-2"></div>
                        <button
                          className="w-full flex items-center gap-3 p-2 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                          onClick={handleSignOut}
                        >
                          <LogOut className="h-4 w-4 text-red-400" />
                          <span className="text-sm text-red-400">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="workspace-background workspace-content-area overflow-y-auto">
            <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-6 workspace-content-spacing">
              <div className="workspace-card-solid p-6 sm:p-8 lg:p-10 min-h-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Dashboard</h1>
                    <p className="text-gray-400">Manage your startup journey with AI-powered tools and insights.</p>
                  </div>
                  <div className="flex items-center gap-3 mt-4 sm:mt-0">
                      {isGeneratingIdea && (
                        <div className="flex items-center gap-2 text-green-400 text-sm px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-green-400 border-t-transparent" />
                          <span className="font-medium">Saving idea...</span>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        className="bg-green-600/20 border-green-500/30 text-green-400 hover:bg-green-600/30 hover:border-green-500/50"
                        onClick={() => router.push('/workspace/workshop')}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Quick Start
                      </Button>
                  </div>
                </div>

                {/* Profile Completion Progress */}
                {profile && !isProfileComplete() && (
                  <div className="mb-8">
                    <ProfileCompletionProgress showDetails={true} />
                  </div>
                )}

                {/* Founder's GPT - Redesigned as AI Co-founder */}
                <section className="mb-6 md:mb-8 flex justify-center items-center min-h-[60vh]">
                  <div className="bg-black/20 backdrop-blur-xl rounded-2xl shadow-xl p-4 md:p-10 w-full flex flex-col items-center border border-white/10">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-6 md:mb-8">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-green-400" />
                        <h2 className="text-xl md:text-3xl font-bold text-white">Your AI Co-founder</h2>
                      </div>
                      <p className="text-gray-400 text-center max-w-md text-sm md:text-base">
                        From ideation to execution — I'm here to help you build your startup faster.
                      </p>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="w-full mb-6 md:mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base md:text-lg font-semibold text-white">Quick Actions</h3>
                      </div>
                      <Tabs
                        defaultValue="ideation"
                        value={activeCategory}
                        onValueChange={(value) => setActiveCategory(value as Category)}
                        className="w-full"
                      >
                        <TabsList className="grid grid-cols-4 mb-4 w-full">
                          <TabsTrigger
                            value="ideation"
                            className="text-xs md:text-sm data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400"
                          >
                            Ideation
                          </TabsTrigger>
                          <TabsTrigger
                            value="planning"
                            className="text-xs md:text-sm data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400"
                          >
                            Planning
                          </TabsTrigger>
                          <TabsTrigger
                            value="execution"
                            className="text-xs md:text-sm data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400"
                          >
                            Execution
                          </TabsTrigger>
                          <TabsTrigger
                            value="validation"
                            className="text-xs md:text-sm data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400"
                          >
                            Validation
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value={activeCategory} className="mt-0">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                            {quickActions
                              .filter(action => action.category === activeCategory)
                              .map((action, i) => (
                                <button
                                  key={i}
                                  onClick={action.onClick}
                                  className="group bg-black/20 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10 hover:border-white/20 transition-all duration-200 hover:bg-black/30 text-left"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="p-2 bg-green-600/20 rounded-lg group-hover:scale-[1.02] transition-transform duration-200">
                                      {action.icon}
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-white mb-1 text-sm md:text-base">{action.title}</h4>
                                      <p className="text-xs md:text-sm text-gray-400">{action.description}</p>
                                    </div>
                                  </div>
                                </button>
                              ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                    {/* Smart Prompt Input */}
                    <div className="w-full">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                          <Input
                            value={gptInput}
                            onChange={e => setGptInput(e.target.value)}
                            placeholder="Ask your AI co-founder anything..."
                            className="bg-black/20 backdrop-blur-sm border-white/10 pr-24 text-white placeholder:text-gray-400 h-10 md:h-12 text-sm md:text-base"
                          />
                          <Button
                            type="submit"
                            className="absolute right-1 top-1 bg-green-600 hover:bg-green-500 h-8 md:h-10"
                            disabled={!!(isLoading('aiResponse') || !gptInput.trim())}
                          >
                            {isLoading('aiResponse') ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                              <Rocket className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </form>

                      {/* AI Response Section */}
                      {showResponse && (
                        <div className="mt-4 md:mt-6 bg-black/20 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
                              <h3 className="text-base md:text-lg font-semibold text-white">AI Response</h3>
                            </div>
                            {!isLoading('aiResponse') && aiResponse && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setBriefPrompt(gptInput);
                                  setShowStartupBrief(true);
                                }}
                                className="bg-green-600 hover:bg-green-500"
                              >
                                <Rocket className="h-4 w-4 mr-2" />
                                Generate Startup Brief
                              </Button>
                            )}
                          </div>
                          {isLoading('aiResponse') ? (
                            <LoadingSpinner
                              size="md"
                              text="AI is analyzing your request..."
                              className="py-8"
                            />
                          ) : (
                            <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-code:bg-gray-800 prose-code:text-gray-200 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-pre:bg-gray-800 prose-pre:text-gray-200 prose-pre:p-4 prose-pre:rounded prose-blockquote:border-l-blue-400 prose-blockquote:bg-gray-800/50 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:rounded-r prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-li:text-gray-300 prose-table:border prose-table:border-gray-600 prose-th:border prose-th:border-gray-600 prose-th:bg-gray-800 prose-th:p-3 prose-th:text-white prose-td:border prose-td:border-gray-600 prose-td:p-3 prose-td:text-gray-300 prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  h1: ({ children }) => <h1 className="text-xl font-bold text-white mb-4">{children}</h1>,
                                  h2: ({ children }) => <h2 className="text-lg font-semibold text-white mb-3">{children}</h2>,
                                  h3: ({ children }) => <h3 className="text-base font-medium text-white mb-2">{children}</h3>,
                                  p: ({ children }) => <p className="text-gray-300 mb-3 leading-relaxed text-sm md:text-base">{children}</p>,
                                  ul: ({ children }) => <ul className="list-disc list-inside text-gray-300 mb-3 space-y-1">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal list-inside text-gray-300 mb-3 space-y-1">{children}</ol>,
                                  li: ({ children }) => <li className="text-gray-300">{children}</li>,
                                  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                                  em: ({ children }) => <em className="italic text-gray-200">{children}</em>,
                                  code: ({ children }) => <code className="bg-gray-800 text-gray-200 px-2 py-1 rounded text-sm font-mono">{children}</code>,
                                  blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-400 bg-gray-800/50 pl-4 py-2 rounded-r text-gray-300 italic">{children}</blockquote>,
                                }}
                              >
                                {aiResponse}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Quick Access Modules */}
                <div className="mb-6 md:mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base md:text-xl font-semibold text-white">Quick Access</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    {modules.map((module) => (
                      <Link
                        key={module.id}
                        href={module.path}
                        className={`group bg-black/20 backdrop-blur-xl rounded-xl p-4 md:p-4 border transition-all duration-200 h-[120px] md:h-[120px] flex flex-col justify-center hover:scale-[1.02] hover:bg-black/30 relative transform-gpu ${
                          module.isNew
                            ? 'border-green-500/40 hover:border-green-500/60 shadow-lg shadow-green-500/10'
                            : 'border-white/10 hover:border-green-500/30'
                        }`}
                      >
                        {module.isNew && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                            NEW
                          </div>
                        )}
                        {module.badge && (
                          <div className="absolute top-2 right-2 bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded border border-blue-500/30">
                            {module.badge}
                          </div>
                        )}
                        <div className="flex flex-col items-center text-center md:flex-row md:items-center md:text-left gap-2 md:gap-3">
                          <span className="text-2xl md:text-2xl group-hover:scale-105 transition-transform duration-200 mb-1 md:mb-0">{module.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white text-sm md:text-base group-hover:text-green-400 transition-colors leading-tight">{module.name}</h3>
                            <p className="text-xs md:text-sm text-gray-400 line-clamp-2 mt-1">{module.description}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Recent Projects */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 workspace-last-section">
                  <Card className="workspace-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-green-400" />
                        Recent Projects
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Your latest startup ideas and projects
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {isLoading('projects') ? (
                        <div className="space-y-3">
                          <ProjectCardSkeleton />
                          <ProjectCardSkeleton />
                          <ProjectCardSkeleton />
                        </div>
                      ) : recentProjects.length > 0 ? (
                        recentProjects.map((project) => (
                          <div
                            key={project.id}
                            className="p-3 bg-black/20 rounded-lg border border-white/10 hover:border-green-500/30 transition-colors cursor-pointer"
                            onClick={() => handleProjectClick(project.id)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-white">{project.name}</h4>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={`text-xs px-2 py-0.5 ${getStageColor(project.stage)}`}
                                >
                                  {project.stage}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-gray-400 mb-2 line-clamp-2">{project.description}</p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500">Updated {project.lastUpdated}</p>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-green-500 transition-all duration-300"
                                    style={{ width: `${project.progress}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-400">{project.progress}%</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <Building2 className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm">No projects yet</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-400 hover:text-green-300 mt-2"
                            onClick={() => {
                              console.log('🔥 Create first project button clicked');
                              handleViewAllProjects();
                            }}
                          >
                            Create your first project
                          </Button>
                        </div>
                      )}
                      {recentProjects.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-green-400 hover:text-green-300 mt-3"
                          onClick={handleViewAllProjects}
                        >
                          View All Projects
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Tasks */}
                  <Card className="workspace-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-blue-400" />
                        Tasks
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Your upcoming tasks and deadlines
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {isLoading('tasks') ? (
                        <div className="space-y-3">
                          <TaskCardSkeleton />
                          <TaskCardSkeleton />
                          <TaskCardSkeleton />
                        </div>
                      ) : recentTaskItems.length > 0 ? (
                        recentTaskItems.map((task) => (
                          <div
                            key={task.id}
                            className={`p-3 bg-black/20 rounded-lg border border-white/10 hover:border-blue-500/30 transition-colors cursor-pointer ${
                              task.isOverdue ? 'border-l-2 border-l-red-400' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <h4 className="font-medium text-white mb-1">{task.title}</h4>
                                <div className="flex items-center gap-2 text-xs">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs px-2 py-0.5 ${getPriorityColor(task.priority.toLowerCase() as any)}`}
                                  >
                                    {task.priority}
                                  </Badge>
                                  <span className={`${task.isOverdue ? 'text-red-400' : 'text-gray-500'}`}>
                                    {task.dueDate}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <CheckCircle2 className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm">No tasks yet</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-400 hover:text-blue-300 mt-2"
                            onClick={() => {
                              console.log('🔥 Create first task button clicked');
                              handleViewAllTasks();
                            }}
                          >
                            Create your first task
                          </Button>
                        </div>
                      )}
                      {recentTaskItems.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-blue-400 hover:text-blue-300 mt-3"
                          onClick={handleViewAllTasks}
                        >
                          View All Tasks
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Startup Brief Modal */}
      <Dialog open={showStartupBrief} onOpenChange={setShowStartupBrief}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Comprehensive Startup Analysis</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStartupBrief(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <StartupBriefGenerator
              ideaDescription={briefPrompt}
              onGenerated={(brief) => {
                console.log('Startup brief generated:', brief);
                toast({
                  title: "Startup Brief Generated!",
                  description: "Your comprehensive startup analysis is ready.",
                });
              }}
              onSaveToVault={async (brief) => {
                console.log('🚀 onSaveToVault called with brief:', brief.substring(0, 100) + '...');
                
                if (!user) {
                  console.log('❌ No user found');
                  toast({
                    title: "Authentication Required",
                    description: "Please sign in to save ideas to your vault.",
                    variant: "destructive"
                  });
                  return;
                }

                try {
                  console.log('💾 Starting save process...');
                  
                  // Extract title from brief (first line or first 50 chars)
                  const title = brief.split('\n')[0].replace(/^#+\s*/, '') || 
                               brief.substring(0, 50) + (brief.length > 50 ? '...' : '');
                  
                  console.log('📝 Extracted title:', title);
                  
                  // Test localStorage access first
                  console.log('🧪 Testing localStorage access...');
                  const testKey = 'test-idea-vault';
                  localStorage.setItem(testKey, 'test-value');
                  const testValue = localStorage.getItem(testKey);
                  console.log('🧪 localStorage test result:', testValue);
                  localStorage.removeItem(testKey);
                  
                  // Use the proper supabaseHelpers.createIdea method
                  const { data, error } = await supabaseHelpers.createIdea({
                    title: title,
                    description: brief,
                    category: 'startup-brief',
                    tags: ['startup-brief', 'ai-generated', 'comprehensive-analysis']
                  });

                  console.log('💾 Save result:', { data, error });

                  if (error) {
                    console.error('❌ Save error:', error);
                    throw new Error(error.message || 'Failed to save idea');
                  }

                  if (data && data.length > 0) {
                    const savedIdea = data[0]; // Get the first (and only) idea from the array
                    console.log('✅ Idea saved successfully:', savedIdea);
                    
                    // Verify the idea was actually saved to localStorage
                    const savedIdeas = JSON.parse(localStorage.getItem('ideaVault') || '[]');
                    console.log('🔍 Verification - Ideas in localStorage:', savedIdeas.length);
                    console.log('🔍 Latest saved idea:', savedIdeas[0]);
                    
                    // Set this as the active idea in the store
                    try {
                      await setActiveIdea({
                        id: savedIdea.id,
                        title: savedIdea.title,
                        description: savedIdea.description,
                        status: 'validated',
                        category: savedIdea.category,
                        tags: savedIdea.tags,
                        validation_score: 85,
                        market_opportunity: extractSection(brief, 'Market Opportunity'),
                        problem_statement: extractSection(brief, 'Problem Statement'),
                        target_market: extractSection(brief, 'Target Market'),
                        monetization_strategy: extractSection(brief, 'Business Model'),
                        key_features: extractListSection(brief, 'Key Features'),
                        next_steps: extractListSection(brief, 'Next Steps'),
                        competitor_analysis: extractSection(brief, 'Competitive Advantage'),
                        created_at: savedIdea.created_at,
                        updated_at: savedIdea.updated_at,
                        user_id: user.id
                      });
                      console.log('✅ Active idea set successfully');
                    } catch (storeError) {
                      console.warn('⚠️ Failed to set active idea in store:', storeError);
                      // Continue anyway since the idea is saved to localStorage
                    }
                    
                    // Show success toast immediately
                    toast({
                      title: "Saved to Idea Vault!",
                      description: "Your startup brief has been saved to your Idea Vault.",
                    });

                    // Close modal and navigate to idea vault
                    setShowStartupBrief(false);
                    router.push('/workspace/idea-vault');
                  } else {
                    console.error('❌ No data returned from save');
                    throw new Error('No data returned from save operation');
                  }
                } catch (error) {
                  console.error('❌ Error saving to idea vault:', error);
                  toast({
                    title: "Save Failed",
                    description: `Failed to save to Idea Vault: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    variant: "destructive"
                  });
                }
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Brainstorm Ideas Modal */}
      <Dialog open={showBrainstorm} onOpenChange={setShowBrainstorm}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-yellow-400" />
                  Brainstorm Ideas
                </h2>
                <p className="text-gray-400 mt-1">Generate fresh startup ideas based on current trends</p>
              </div>
            </div>

            <div className="flex-1 overflow-hidden p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                {/* Left Sidebar - Category Selection & Controls */}
                <div className="space-y-6 overflow-y-auto pr-2">
                  {/* Category Filter Chips */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Choose Category</h3>
                    <div className="flex flex-wrap gap-2">
                      {(['WebTech', 'EduTech', 'AgriTech', 'FinTech', 'HealthTech', 'ClimateTech', 'Other'] as BrainstormCategory[]).map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                            selectedCategory === category
                              ? 'bg-green-600 text-white shadow-lg shadow-green-600/25'
                              : 'bg-black/30 border border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <div>
                    <Button
                      onClick={() => generateBrainstormIdeas(selectedCategory)}
                      disabled={isGeneratingIdeas}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-600/25 h-12 text-base font-semibold"
                    >
                      {isGeneratingIdeas ? (
                        <div className="flex items-center gap-3">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Generating Ideas...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Sparkles className="h-5 w-5" />
                          <span>Generate Ideas</span>
                        </div>
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      AI will generate 5 fresh {selectedCategory} ideas
                    </p>
                  </div>

                  {/* Saved Ideas Panel */}
                  {savedIdeas.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Saved Ideas ({savedIdeas.length})</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {savedIdeas.map((idea) => (
                          <div key={idea.id} className="p-3 bg-black/20 rounded-lg border border-white/10 hover:bg-black/30 transition-colors">
                            <div className="text-sm font-medium text-white truncate mb-1">{idea.title}</div>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-500/30 text-xs">
                                {idea.category}
                              </Badge>
                              <button
                                onClick={() => expandIdea(idea)}
                                className="text-xs text-green-400 hover:text-green-300"
                              >
                                Expand →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Main Area - Generated Ideas Grid */}
                <div className="lg:col-span-3 overflow-y-auto pl-2">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        Generated Ideas
                        {brainstormIdeas.length > 0 && (
                          <span className="ml-2 text-green-400">({brainstormIdeas.length})</span>
                        )}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">
                        {selectedCategory} startup ideas powered by AI and trend analysis
                      </p>
                    </div>
                    {brainstormIdeas.length > 0 && (
                      <div className="flex gap-2">
                        <Button
                          onClick={saveAllIdeas}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save All
                        </Button>
                        <Button
                          onClick={regenerateIdeas}
                          variant="outline"
                          disabled={isGeneratingIdeas}
                          className="border-white/20 text-gray-300 hover:bg-white/10"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Regenerate All
                        </Button>
                      </div>
                    )}
                  </div>

                  {brainstormIdeas.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="bg-gradient-to-br from-green-600/20 to-blue-600/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="h-12 w-12 text-green-400" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-300 mb-2">Ready to brainstorm?</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        Select a category and click "Generate Ideas" to discover fresh startup opportunities
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {brainstormIdeas.map((idea, index) => (
                        <Card key={idea.id} className={`bg-gradient-to-br from-black/30 to-black/20 border-white/10 hover:border-white/20 transition-all duration-300 group ${
                          savedIdeaIds.has(idea.id) ? 'ring-2 ring-green-500/30 bg-green-900/10' : ''
                        }`}>
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {index + 1}
                                  </div>
                                  <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-500/30">
                                    {idea.category}
                                  </Badge>
                                  {savedIdeaIds.has(idea.id) && (
                                    <Badge variant="secondary" className="bg-green-600/30 text-green-300 border-green-500/50">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Saved
                                    </Badge>
                                  )}
                                </div>
                                <CardTitle className="text-white text-lg leading-tight group-hover:text-green-400 transition-colors">
                                  {idea.title}
                                </CardTitle>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                                  Problem
                                </h4>
                                <p className="text-gray-400 text-sm leading-relaxed">{idea.problem}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                                  Why Now
                                </h4>
                                <p className="text-gray-400 text-sm leading-relaxed">{idea.whyNow}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                  Target Audience
                                </h4>
                                <p className="text-gray-400 text-sm leading-relaxed">{idea.audience}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                                  Trend Connection
                                </h4>
                                <p className="text-gray-400 text-sm leading-relaxed">{idea.trendConnection}</p>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 pt-4 border-t border-white/10">
                              <Button
                                onClick={() => saveIdea(idea)}
                                size="sm"
                                variant="outline"
                                disabled={savedIdeaIds.has(idea.id)}
                                className={`flex-1 ${
                                  savedIdeaIds.has(idea.id)
                                    ? 'border-green-500/50 text-green-400 bg-green-900/20 cursor-not-allowed'
                                    : 'border-white/20 text-gray-300 hover:bg-white/10 hover:text-white'
                                }`}
                              >
                                {savedIdeaIds.has(idea.id) ? (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Saved
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save to Vault
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={() => expandIdea(idea)}
                                size="sm"
                                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                              >
                                <ChevronRight className="h-4 w-4 mr-2" />
                                Expand
                              </Button>
                              <Button
                                onClick={() => regenerateSpecificIdea(idea.id)}
                                size="sm"
                                variant="outline"
                                disabled={isGeneratingIdeas}
                                className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/50"
                                title="Generate a new idea to replace this one"
                              >
                                <Sparkles className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detailed Idea View Modal */}
      <Dialog open={showIdeaDetail} onOpenChange={setShowIdeaDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedIdeaDetail && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Lightbulb className="h-6 w-6 text-yellow-400" />
                    {selectedIdeaDetail.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-500/30">
                      {selectedIdeaDetail.category}
                    </Badge>
                    <span className="text-gray-400 text-sm">
                      Generated {new Date(selectedIdeaDetail.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Content */}
              <div className="space-y-6">
                {/* Problem Statement */}
                <div className="bg-red-900/10 border border-red-500/20 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Problem Statement</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{selectedIdeaDetail.problem}</p>
                </div>

                {/* Why Now */}
                <div className="bg-yellow-900/10 border border-yellow-500/20 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Why Now?</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{selectedIdeaDetail.whyNow}</p>
                </div>

                {/* Target Audience */}
                <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Target Audience</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{selectedIdeaDetail.audience}</p>
                </div>

                {/* Trend Connection */}
                <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Trend Connection</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{selectedIdeaDetail.trendConnection}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-white/10">
                  <Button
                    onClick={() => saveIdea(selectedIdeaDetail)}
                    disabled={savedIdeaIds.has(selectedIdeaDetail.id)}
                    className={`flex-1 ${
                      savedIdeaIds.has(selectedIdeaDetail.id)
                        ? 'bg-green-600/20 text-green-400 border border-green-500/30 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {savedIdeaIds.has(selectedIdeaDetail.id) ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Already Saved
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save to Idea Vault
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowIdeaDetail(false)}
                    variant="outline"
                    className="flex-1 border-white/20 text-gray-300 hover:bg-white/10"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </ErrorBoundary>
  );
}
