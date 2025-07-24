import { useState } from 'react';
import { StageNavigation } from "@/components/StageNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lightbulb, Users, DollarSign, Target, Sparkles, Brain, Zap, TrendingUp, Shield, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DetailedAnalysis {
  appPurpose: string;
  targetAudience: {
    primary: string;
    secondary: string;
    demographics: string[];
    painPoints: string[];
    goals: string[];
  };
  keyFeatures: {
    core: string[];
    advanced: string[];
    future: string[];
  };
  monetization: {
    primary: string;
    secondary: string[];
    revenueStreams: string[];
  };
  technicalConsiderations: {
    platform: string;
    complexity: "Low" | "Medium" | "High";
    integrations: string[];
    scalability: string;
  };
  competitiveAnalysis: {
    directCompetitors: string[];
    advantages: string[];
    differentiators: string[];
  };
  toolRecommendation: {
    primary: string;
    reasoning: string;
    alternatives: string[];
  };
}

const IdeaInterpreter = () => {
  const [idea, setIdea] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysis, setAnalysis] = useState<DetailedAnalysis | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!idea.trim()) {
      toast({
        title: "Please enter your app idea",
        description: "Describe your app concept in the text area above.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate progressive AI analysis with multiple stages
    const analysisStages = [
      { progress: 20, message: "Extracting core concept..." },
      { progress: 40, message: "Analyzing target audience..." },
      { progress: 60, message: "Identifying key features..." },
      { progress: 80, message: "Evaluating monetization strategies..." },
      { progress: 100, message: "Finalizing recommendations..." }
    ];

    for (const stage of analysisStages) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setAnalysisProgress(stage.progress);
    }

    // Generate detailed analysis
    setAnalysis({
      appPurpose: "A comprehensive mobile-first platform that connects college students for academic resource exchange, fostering a collaborative learning ecosystem while addressing the financial burden of educational materials.",
      targetAudience: {
        primary: "College and university students aged 18-25",
        secondary: "Graduate students, professors, and academic institutions",
        demographics: ["Budget-conscious students", "STEM and liberal arts majors", "Urban and suburban campuses", "Tech-savvy millennials and Gen Z"],
        painPoints: ["High textbook costs", "Limited access to study materials", "Difficulty finding study partners", "Lack of resource sharing platforms"],
        goals: ["Save money on academic materials", "Access diverse study resources", "Connect with peers", "Reduce academic stress"]
      },
      keyFeatures: {
        core: [
          "User authentication with university verification",
          "Resource listing with detailed descriptions",
          "Advanced search and filtering system",
          "Secure in-app messaging",
          "Rating and review system",
          "Location-based discovery"
        ],
        advanced: [
          "AI-powered resource recommendations",
          "Study group formation tools",
          "Calendar integration for meetups",
          "Push notifications for relevant listings",
          "Photo recognition for textbook scanning",
          "Price comparison with bookstores"
        ],
        future: [
          "Virtual study rooms",
          "Blockchain-based transaction verification",
          "AR textbook preview",
          "Integration with learning management systems",
          "Peer tutoring marketplace"
        ]
      },
      monetization: {
        primary: "Freemium subscription model with premium features",
        secondary: ["Transaction fees", "Sponsored content", "University partnerships"],
        revenueStreams: [
          "Premium subscriptions ($4.99/month)",
          "Transaction fees (2-3% per exchange)",
          "Sponsored listings from bookstores",
          "University partnership programs",
          "Featured listing promotions"
        ]
      },
      technicalConsiderations: {
        platform: "Cross-platform mobile with web companion",
        complexity: "Medium",
        integrations: ["University APIs", "Payment gateways", "Maps/location services", "Push notification services"],
        scalability: "Designed for horizontal scaling with microservices architecture"
      },
      competitiveAnalysis: {
        directCompetitors: ["Chegg", "Facebook Marketplace", "OfferUp", "Mercari"],
        advantages: ["University-specific focus", "Academic verification", "Study collaboration features"],
        differentiators: ["Peer-to-peer academic focus", "Built-in study tools", "University integration", "Academic calendar sync"]
      },
      toolRecommendation: {
        primary: "Adalo",
        reasoning: "Best suited for mobile-first apps with database requirements, user authentication, and native mobile features like push notifications and location services.",
        alternatives: ["FlutterFlow for advanced customization", "Framer for web-first approach with mobile responsiveness"]
      }
    });

    setIsAnalyzing(false);
    toast({
      title: "Comprehensive Analysis Complete",
      description: "Your app idea has been thoroughly analyzed across multiple dimensions.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <StageNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Idea Interpreter</h1>
            <p className="text-xl text-muted-foreground">
              Transform your vague app concept into a structured, builder-ready blueprint
            </p>
          </div>

          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Describe Your App Idea
              </CardTitle>
              <CardDescription>
                Tell us about your app in plain language. Don't worry about technical details - just describe what you envision.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Example: A mobile app for college students to exchange textbooks and study materials with each other. They can post what they have, search for what they need, and chat to arrange meetups..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                className="min-h-[120px]"
              />
              <div className="space-y-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Brain className="h-4 w-4 mr-2 animate-pulse" />
                      Analyzing your idea...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Deep Analyze & Structure Idea
                    </>
                  )}
                </Button>

                {isAnalyzing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Analysis Progress</span>
                      <span>{analysisProgress}%</span>
                    </div>
                    <Progress value={analysisProgress} className="w-full" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-6">
              {/* App Purpose */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    App Purpose & Vision
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed">{analysis.appPurpose}</p>
                </CardContent>
              </Card>

              {/* Target Audience - Enhanced */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Target Audience Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Primary Audience</h4>
                    <p className="text-sm text-muted-foreground">{analysis.targetAudience.primary}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Secondary Audience</h4>
                    <p className="text-sm text-muted-foreground">{analysis.targetAudience.secondary}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 text-red-700 dark:text-red-400">Pain Points</h4>
                      <ul className="space-y-1">
                        {analysis.targetAudience.painPoints.map((point, index) => (
                          <li key={index} className="text-xs text-muted-foreground">• {point}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-green-700 dark:text-green-400">Goals</h4>
                      <ul className="space-y-1">
                        {analysis.targetAudience.goals.map((goal, index) => (
                          <li key={index} className="text-xs text-muted-foreground">• {goal}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Demographics</h4>
                    <div className="flex flex-wrap gap-1">
                      {analysis.targetAudience.demographics.map((demo, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{demo}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Features - Tiered */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Feature Roadmap
                  </CardTitle>
                  <CardDescription>
                    Structured feature development plan from MVP to advanced functionality
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">MVP Core</Badge>
                      <span className="text-sm font-medium">Essential for launch</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2">
                      {analysis.keyFeatures.core.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Advanced</Badge>
                      <span className="text-sm font-medium">Phase 2 enhancements</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2">
                      {analysis.keyFeatures.advanced.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Future</Badge>
                      <span className="text-sm font-medium">Long-term vision</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2">
                      {analysis.keyFeatures.future.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-950 rounded">
                          <div className="w-2 h-2 bg-purple-500 rounded-full" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monetization Strategy - Enhanced */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Monetization Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Primary Revenue Model</h4>
                    <p className="text-sm text-muted-foreground bg-green-50 dark:bg-green-950 p-3 rounded">
                      {analysis.monetization.primary}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Revenue Streams</h4>
                    <div className="grid gap-2">
                      {analysis.monetization.revenueStreams.map((stream, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-secondary rounded">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{stream}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Considerations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Technical Considerations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Platform Strategy</h4>
                      <p className="text-sm text-muted-foreground">{analysis.technicalConsiderations.platform}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Development Complexity</h4>
                      <Badge variant={analysis.technicalConsiderations.complexity === "Low" ? "secondary" : analysis.technicalConsiderations.complexity === "Medium" ? "default" : "destructive"}>
                        {analysis.technicalConsiderations.complexity}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Required Integrations</h4>
                    <div className="flex flex-wrap gap-1">
                      {analysis.technicalConsiderations.integrations.map((integration, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{integration}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Scalability Plan</h4>
                    <p className="text-sm text-muted-foreground">{analysis.technicalConsiderations.scalability}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Competitive Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Competitive Landscape
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Direct Competitors</h4>
                    <div className="flex flex-wrap gap-1">
                      {analysis.competitiveAnalysis.directCompetitors.map((competitor, index) => (
                        <Badge key={index} variant="secondary">{competitor}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 text-green-700 dark:text-green-400">Your Advantages</h4>
                      <ul className="space-y-1">
                        {analysis.competitiveAnalysis.advantages.map((advantage, index) => (
                          <li key={index} className="text-xs text-muted-foreground">✓ {advantage}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-400">Key Differentiators</h4>
                      <ul className="space-y-1">
                        {analysis.competitiveAnalysis.differentiators.map((diff, index) => (
                          <li key={index} className="text-xs text-muted-foreground">⭐ {diff}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tool Recommendation - Enhanced */}
              <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                <CardHeader>
                  <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    AI Builder Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Recommended Tool</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-600 text-white">{analysis.toolRecommendation.primary}</Badge>
                      <span className="text-sm text-blue-700 dark:text-blue-300">Best Match</span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{analysis.toolRecommendation.reasoning}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Alternative Options</h4>
                    <div className="space-y-1">
                      {analysis.toolRecommendation.alternatives.map((alt, index) => (
                        <p key={index} className="text-xs text-blue-600 dark:text-blue-400">• {alt}</p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdeaInterpreter;