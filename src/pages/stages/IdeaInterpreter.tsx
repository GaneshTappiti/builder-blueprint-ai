import { useState } from 'react';
import { StageNavigation } from "@/components/StageNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Users, DollarSign, Target, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const IdeaInterpreter = () => {
  const [idea, setIdea] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
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
    
    // Simulate AI analysis
    setTimeout(() => {
      setAnalysis({
        appPurpose: "A mobile-first platform connecting college students for academic resource exchange and collaboration",
        targetAudience: "College and university students aged 18-25 seeking affordable academic resources",
        keyFeatures: [
          "User authentication and profiles",
          "Resource listing and browsing",
          "Search and filter functionality", 
          "In-app messaging system",
          "Rating and review system",
          "Location-based discovery",
          "Push notifications"
        ],
        monetization: [
          "Freemium model with premium features",
          "Small transaction fees on exchanges",
          "Sponsored listings for bookstores"
        ],
        toolNotes: "Ideal for Framer due to web-first approach with mobile responsiveness. Consider FlutterFlow if native mobile features are priority."
      });
      setIsAnalyzing(false);
      toast({
        title: "Analysis Complete",
        description: "Your app idea has been structured and analyzed.",
      });
    }, 3000);
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
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing your idea...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze & Structure Idea
                  </>
                )}
              </Button>
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
                  <p className="text-foreground">{analysis.appPurpose}</p>
                </CardContent>
              </Card>

              {/* Target Audience */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Target Audience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground">{analysis.targetAudience}</p>
                </CardContent>
              </Card>

              {/* Key Features */}
              <Card>
                <CardHeader>
                  <CardTitle>Core Features</CardTitle>
                  <CardDescription>
                    Essential functionality your app needs to succeed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {analysis.keyFeatures.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Monetization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Monetization Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.monetization.map((strategy: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <span className="text-sm">{strategy}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tool Notes */}
              <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                <CardHeader>
                  <CardTitle className="text-blue-800 dark:text-blue-200">
                    Builder Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-700 dark:text-blue-300">{analysis.toolNotes}</p>
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