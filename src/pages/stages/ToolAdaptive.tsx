import { useState } from 'react';
import { StageNavigation } from "@/components/StageNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Database, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const supportedTools = [
  {
    name: "Framer",
    description: "Design and publish websites with AI",
    capabilities: ["Responsive Design", "Component Library", "CMS Integration"],
    status: "active"
  },
  {
    name: "Uizard",
    description: "Transform wireframes into code",
    capabilities: ["Wireframe Scanning", "Mobile First", "Export Code"],
    status: "active"
  },
  {
    name: "Builder.io",
    description: "Visual development platform",
    capabilities: ["Headless CMS", "A/B Testing", "Performance Optimization"],
    status: "active"
  },
  {
    name: "Adalo",
    description: "No-code mobile app builder",
    capabilities: ["Native Apps", "Database", "Push Notifications"],
    status: "active"
  },
  {
    name: "FlutterFlow",
    description: "Build Flutter apps visually",
    capabilities: ["Cross Platform", "Firebase Integration", "Custom Code"],
    status: "coming-soon"
  }
];

const ToolAdaptive = () => {
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleToolSelection = (tool: string) => {
    setSelectedTool(tool);
    toast({
      title: "Tool Selected",
      description: `${tool} has been configured as your target builder.`,
    });
  };

  const handleDocUpload = () => {
    setIsProcessing(true);
    // Simulate document processing
    setTimeout(() => {
      setUploadedDocs(prev => [...prev, `${selectedTool} Documentation`]);
      setIsProcessing(false);
      toast({
        title: "Documentation Processed",
        description: "Tool documentation has been parsed and embedded into the system.",
      });
    }, 2000);
  };

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

              {selectedTool && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {supportedTools
                    .filter(tool => tool.name === selectedTool)
                    .map((tool) => (
                      <Card key={tool.name} className="border-primary/20">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {tool.name}
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {tool.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Capabilities:</p>
                            <div className="flex flex-wrap gap-1">
                              {tool.capabilities.map((cap) => (
                                <Badge key={cap} variant="secondary" className="text-xs">
                                  {cap}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documentation Upload */}
          {selectedTool && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Documentation Processing
                </CardTitle>
                <CardDescription>
                  Upload additional documentation or use our pre-loaded knowledge base for {selectedTool}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop documentation files or use our pre-loaded {selectedTool} knowledge base
                  </p>
                  <Button onClick={handleDocUpload} disabled={isProcessing}>
                    {isProcessing ? "Processing..." : `Load ${selectedTool} Documentation`}
                  </Button>
                </div>

                {uploadedDocs.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-medium">Processed Documentation:</p>
                    {uploadedDocs.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-secondary rounded">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{doc}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* System Status */}
          {selectedTool && uploadedDocs.length > 0 && (
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Tool-Adaptive Engine Configured
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      All future prompts will be optimized for {selectedTool}'s syntax and capabilities.
                    </p>
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