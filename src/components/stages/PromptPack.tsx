import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, CheckCircle } from "lucide-react";

export const PromptPack = () => {
  const promptFormats = ["Master Prompt", "Screen-by-Screen", "JSON Export"];
  
  const masterPrompt = `# Book Exchange App - Complete Framer Prompt

## App Overview
Create a mobile-first book exchange platform for college students with clean, modern design.

## Design System
- Primary: #6366f1 (Indigo)
- Secondary: #f1f5f9 (Slate)
- Font: Inter
- Style: Clean, rounded corners, subtle shadows

## Screens & Components
[Complete 6-screen structure with detailed UI descriptions...]

## Navigation Logic
[Full flow between screens with conditions...]

## API Integration
[Backend actions and data structure...]`;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Final Prompt Pack</h1>
        <p className="text-muted-foreground">
          Your complete prompt package, optimized for Framer AI. Ready to copy and deploy.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Prompt Quality: Excellent
              </CardTitle>
              <Badge variant="secondary">Framer Optimized</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={promptFormats[0]} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {promptFormats.map((format) => (
                  <TabsTrigger key={format} value={format}>
                    {format}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value="Master Prompt" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Complete App Prompt</h3>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                
                <Card>
                  <CardContent className="p-4">
                    <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/50 p-4 rounded max-h-96 overflow-auto">
                      {masterPrompt}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="Screen-by-Screen" className="space-y-4">
                <div className="space-y-3">
                  {["Home", "Search", "Item Details", "Upload", "Chat", "Profile"].map((screen) => (
                    <Card key={screen}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">{screen} Screen Prompt</h4>
                          <Button size="sm" variant="outline">
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm bg-muted/50 p-3 rounded font-mono">
                          Detailed {screen.toLowerCase()} screen prompt for Framer...
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="JSON Export" className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <pre className="text-sm font-mono bg-muted/50 p-4 rounded max-h-96 overflow-auto">
{`{
  "app": {
    "name": "BookExchange",
    "platform": "mobile-first",
    "tool": "framer",
    "screens": [...],
    "navigation": [...],
    "styling": {...}
  }
}`}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline">
            Back to Logic Flow
          </Button>
          <Button>
            Export & Deploy
          </Button>
        </div>
      </div>
    </div>
  );
};