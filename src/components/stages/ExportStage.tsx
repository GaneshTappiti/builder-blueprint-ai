import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Download, ExternalLink, FileText, Code, Database } from "lucide-react";

export const ExportStage = () => {
  const exportOptions = [
    {
      title: "Master Prompt (.txt)",
      description: "Single file with complete app prompt",
      icon: FileText,
      format: "TXT"
    },
    {
      title: "Structured Prompt (.md)",
      description: "Markdown format with organized sections",
      icon: FileText,
      format: "MD"
    },
    {
      title: "JSON Configuration",
      description: "Machine-readable format for API integration",
      icon: Code,
      format: "JSON"
    },
    {
      title: "Database Schema",
      description: "SQL structure for your app's data",
      icon: Database,
      format: "SQL"
    }
  ];

  const deploymentTips = [
    {
      tool: "Framer",
      steps: [
        "Copy the master prompt",
        "Open Framer AI assistant",
        "Paste prompt and hit generate",
        "Refine individual components as needed"
      ]
    },
    {
      tool: "Uizard",
      steps: [
        "Use screen-by-screen prompts",
        "Start with wireframe mode",
        "Apply design system afterwards",
        "Connect screens with navigation"
      ]
    }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Export & Deploy</h1>
        <p className="text-muted-foreground">
          Download your prompts and get step-by-step guidance for deployment.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Your Prompt Pack is Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {exportOptions.map((option, index) => (
                <div key={index} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <option.icon className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm">{option.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {option.format}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        {option.description}
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deployment Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {deploymentTips.map((tip, index) => (
                <div key={index}>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    How to use with {tip.tool}
                    <Badge variant="secondary">{tip.tool}</Badge>
                  </h3>
                  <ol className="space-y-2">
                    {tip.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-2 text-sm">
                        <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                          {stepIndex + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button className="h-auto p-4 text-left">
                <div>
                  <div className="font-medium mb-1">Start Building</div>
                  <div className="text-xs text-muted-foreground">
                    Open your AI builder and paste the prompts
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto" />
              </Button>
              
              <Button variant="outline" className="h-auto p-4 text-left">
                <div>
                  <div className="font-medium mb-1">Save Project</div>
                  <div className="text-xs text-muted-foreground">
                    Keep this prompt pack for future reference
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline">
            Back to Prompt Pack
          </Button>
          <Button>
            Start New Project
          </Button>
        </div>
      </div>
    </div>
  );
};