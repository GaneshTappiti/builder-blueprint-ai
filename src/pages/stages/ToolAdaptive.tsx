import { useState } from 'react';
import { StageNavigation } from "@/components/StageNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Database, CheckCircle, Settings, Zap, Code2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ToolProfile {
  name: string;
  description: string;
  capabilities: string[];
  status: "active" | "coming-soon";
  promptGuidelines: {
    layoutStyle: string;
    promptTags: string[];
    dos: string[];
    donts: string[];
    syntaxNotes: string;
  };
  documentationEmbedded: boolean;
}

const supportedTools: ToolProfile[] = [
  {
    name: "Framer",
    description: "Design and publish websites with AI",
    capabilities: ["Responsive Design", "Component Library", "CMS Integration"],
    status: "active",
    promptGuidelines: {
      layoutStyle: "Component-based with responsive breakpoints",
      promptTags: ["#framer", "#responsive", "#component"],
      dos: [
        "Use semantic component names",
        "Specify responsive behavior",
        "Include hover states",
        "Define component variants"
      ],
      donts: [
        "Don't use absolute positioning",
        "Avoid complex animations in initial prompt",
        "Don't specify pixel-perfect dimensions"
      ],
      syntaxNotes: "Framer prefers natural language descriptions with component hierarchy"
    },
    documentationEmbedded: true
  },
  {
    name: "Uizard",
    description: "Transform wireframes into code",
    capabilities: ["Wireframe Scanning", "Mobile First", "Export Code"],
    status: "active",
    promptGuidelines: {
      layoutStyle: "Mobile-first wireframe structure",
      promptTags: ["#uizard", "#mobile", "#wireframe"],
      dos: [
        "Start with wireframe layout",
        "Use standard UI patterns",
        "Specify screen sizes",
        "Include navigation flow"
      ],
      donts: [
        "Don't use complex custom components",
        "Avoid detailed styling in initial prompt",
        "Don't specify backend logic"
      ],
      syntaxNotes: "Uizard works best with structured layout descriptions and standard UI elements"
    },
    documentationEmbedded: true
  },
  {
    name: "Builder.io",
    description: "Visual development platform",
    capabilities: ["Headless CMS", "A/B Testing", "Performance Optimization"],
    status: "active",
    promptGuidelines: {
      layoutStyle: "Block-based visual builder approach",
      promptTags: ["#builder", "#headless", "#cms"],
      dos: [
        "Define content blocks",
        "Specify data binding",
        "Include CMS field types",
        "Plan for A/B testing"
      ],
      donts: [
        "Don't hardcode content",
        "Avoid complex state management",
        "Don't ignore SEO considerations"
      ],
      syntaxNotes: "Builder.io excels with structured content and reusable blocks"
    },
    documentationEmbedded: true
  },
  {
    name: "Adalo",
    description: "No-code mobile app builder",
    capabilities: ["Native Apps", "Database", "Push Notifications"],
    status: "active",
    promptGuidelines: {
      layoutStyle: "Screen-based mobile app structure",
      promptTags: ["#adalo", "#mobile", "#database"],
      dos: [
        "Define database collections",
        "Specify user actions",
        "Include push notification triggers",
        "Plan user authentication"
      ],
      donts: [
        "Don't use web-specific patterns",
        "Avoid complex API integrations",
        "Don't ignore mobile UX patterns"
      ],
      syntaxNotes: "Adalo requires clear database schema and action definitions"
    },
    documentationEmbedded: true
  },
  {
    name: "FlutterFlow",
    description: "Build Flutter apps visually",
    capabilities: ["Cross Platform", "Firebase Integration", "Custom Code"],
    status: "coming-soon",
    promptGuidelines: {
      layoutStyle: "Widget-based Flutter structure",
      promptTags: ["#flutterflow", "#flutter", "#firebase"],
      dos: [
        "Use Flutter widget terminology",
        "Specify Firebase collections",
        "Include state management",
        "Plan for both iOS and Android"
      ],
      donts: [
        "Don't use platform-specific UI",
        "Avoid web-only features",
        "Don't ignore performance considerations"
      ],
      syntaxNotes: "FlutterFlow understands Flutter widget hierarchy and Firebase integration"
    },
    documentationEmbedded: false
  }
];

const ToolAdaptive = () => {
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [vectorDbStatus, setVectorDbStatus] = useState<"idle" | "processing" | "ready">("idle");
  const [promptGuidelines, setPromptGuidelines] = useState<ToolProfile["promptGuidelines"] | null>(null);
  const { toast } = useToast();

  const handleToolSelection = (tool: string) => {
    setSelectedTool(tool);
    const toolProfile = supportedTools.find(t => t.name === tool);

    if (toolProfile) {
      setPromptGuidelines(toolProfile.promptGuidelines);

      // Simulate vector DB retrieval of tool-specific guidelines
      setVectorDbStatus("processing");
      setTimeout(() => {
        setVectorDbStatus("ready");
        toast({
          title: "Tool Profile Loaded",
          description: `${tool} prompt guidelines have been injected into the system.`,
        });
      }, 1500);
    }
  };

  const handleDocUpload = () => {
    setIsProcessing(true);
    // Simulate document processing and vector embedding
    setTimeout(() => {
      setUploadedDocs(prev => [...prev, `${selectedTool} Documentation`, `${selectedTool} Best Practices`, `${selectedTool} API Reference`]);
      setIsProcessing(false);
      toast({
        title: "Documentation Embedded",
        description: "Documentation has been processed and added to the vector database.",
      });
    }, 2000);
  };

  const selectedToolProfile = supportedTools.find(tool => tool.name === selectedTool);

  return (
    <div className="min-h-screen bg-background">
      <StageNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Tool-Adaptive Engine</h1>
            <p className="text-xl text-muted-foreground">
              Configure PromptForge to generate outputs perfectly suited for your chosen AI app builder
            </p>
          </div>

          {/* Tool Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Select Your AI App Builder
              </CardTitle>
              <CardDescription>
                Choose the tool you'll be using to build your app. This ensures all prompts are formatted correctly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedTool} onValueChange={handleToolSelection}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an AI app builder..." />
                </SelectTrigger>
                <SelectContent>
                  {supportedTools.map((tool) => (
                    <SelectItem key={tool.name} value={tool.name} disabled={tool.status === 'coming-soon'}>
                      <div className="flex items-center gap-2">
                        {tool.name}
                        {tool.status === 'coming-soon' && (
                          <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedToolProfile && (
                <div className="space-y-6">
                  {/* Tool Profile Card */}
                  <Card className="border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {selectedToolProfile.name}
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {vectorDbStatus === "ready" && (
                          <Badge variant="default" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            Guidelines Active
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {selectedToolProfile.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Capabilities:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedToolProfile.capabilities.map((cap) => (
                              <Badge key={cap} variant="secondary" className="text-xs">
                                {cap}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {vectorDbStatus === "ready" && promptGuidelines && (
                          <div className="border-t pt-4">
                            <p className="text-sm font-medium mb-2">Layout Style:</p>
                            <p className="text-sm text-muted-foreground mb-3">{promptGuidelines.layoutStyle}</p>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">✓ Best Practices:</p>
                                <ul className="space-y-1">
                                  {promptGuidelines.dos.slice(0, 3).map((item, index) => (
                                    <li key={index} className="text-xs text-muted-foreground">• {item}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">✗ Avoid:</p>
                                <ul className="space-y-1">
                                  {promptGuidelines.donts.slice(0, 3).map((item, index) => (
                                    <li key={index} className="text-xs text-muted-foreground">• {item}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Vector DB Status */}
                  {vectorDbStatus !== "idle" && (
                    <Card className={`${vectorDbStatus === "ready" ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" : "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          {vectorDbStatus === "processing" ? (
                            <>
                              <Settings className="h-5 w-5 text-blue-600 animate-spin" />
                              <div>
                                <p className="font-medium text-blue-800 dark:text-blue-200">
                                  Loading Prompt Guidelines
                                </p>
                                <p className="text-sm text-blue-600 dark:text-blue-300">
                                  Retrieving {selectedTool}-specific prompt rules from vector database...
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="font-medium text-green-800 dark:text-green-200">
                                  Prompt Guidelines Injected
                                </p>
                                <p className="text-sm text-green-600 dark:text-green-300">
                                  All future prompts will follow {selectedTool}'s syntax and best practices.
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documentation Upload & Vector DB */}
          {selectedTool && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Vector Database & Documentation
                </CardTitle>
                <CardDescription>
                  Embed additional documentation into the vector database for enhanced prompt generation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pre-loaded Documentation Status */}
                {selectedToolProfile?.documentationEmbedded && (
                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        Pre-loaded Documentation Available
                      </span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-300">
                      {selectedTool} documentation is already embedded in our vector database with 1,247 indexed sections.
                    </p>
                  </div>
                )}

                {/* Upload Additional Documentation */}
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                    <Code2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload custom documentation, API references, or style guides for {selectedTool}
                  </p>
                  <Button onClick={handleDocUpload} disabled={isProcessing} variant="outline">
                    {isProcessing ? (
                      <>
                        <Settings className="h-4 w-4 mr-2 animate-spin" />
                        Embedding into Vector DB...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload & Embed Documentation
                      </>
                    )}
                  </Button>
                </div>

                {/* Vector Database Status */}
                {uploadedDocs.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-primary" />
                      <p className="font-medium">Vector Database Entries:</p>
                    </div>
                    <div className="grid gap-2">
                      {uploadedDocs.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{doc}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {Math.floor(Math.random() * 500) + 100} chunks
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                      💡 These documents are now searchable via semantic similarity for context-aware prompt generation.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* System Status */}
          {selectedTool && vectorDbStatus === "ready" && (
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">
                        Tool-Adaptive Engine Fully Configured
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        System is now optimized for {selectedTool} with embedded documentation and prompt guidelines.
                      </p>
                    </div>
                  </div>

                  {/* Configuration Summary */}
                  <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-green-200 dark:border-green-800">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-800 dark:text-green-200">
                        {promptGuidelines?.promptTags.length || 0}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-300">Active Tags</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-800 dark:text-green-200">
                        {uploadedDocs.length + (selectedToolProfile?.documentationEmbedded ? 1 : 0)}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-300">Doc Sources</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-800 dark:text-green-200">
                        {(promptGuidelines?.dos.length || 0) + (promptGuidelines?.donts.length || 0)}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-300">Guidelines</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolAdaptive;