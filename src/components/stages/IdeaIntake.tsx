import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Target, Zap, ArrowRight } from "lucide-react";

export const IdeaIntake = () => {
  const [idea, setIdea] = useState("");
  const [suggestedTools, setSuggestedTools] = useState<any[]>([]);

  const analyzeIdea = () => {
    // Mock AI analysis
    setSuggestedTools([
      {
        name: "Framer",
        match: 95,
        reason: "Perfect for web-based MVP with interactive prototyping",
        features: ["Web UI", "Animations", "Components"]
      },
      {
        name: "FlutterFlow",
        match: 80,
        reason: "Great for mobile-first approach with backend integration",
        features: ["Mobile", "Firebase", "Native"]
      }
    ]);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tell us your app idea</h1>
        <p className="text-muted-foreground">
          Describe your startup idea in plain English. Our AI will analyze it and suggest the best tools.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Your App Idea
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Example: A platform where college students can exchange textbooks, with photo uploads, chat messaging, and rating system..."
              className="min-h-[120px]"
            />
            <Button 
              onClick={analyzeIdea} 
              disabled={!idea.trim()}
              className="w-full sm:w-auto"
            >
              <Target className="h-4 w-4 mr-2" />
              Analyze Idea & Suggest Tools
            </Button>
          </CardContent>
        </Card>

        {suggestedTools.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Recommended AI Builders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suggestedTools.map((tool, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{tool.name}</h3>
                        <Badge variant="secondary">{tool.match}% match</Badge>
                      </div>
                      <Button size="sm" variant="outline">
                        Select Tool
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{tool.reason}</p>
                    <div className="flex gap-1 flex-wrap">
                      {tool.features.map((feature: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};