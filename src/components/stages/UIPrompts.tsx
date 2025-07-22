import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Code, Wand2 } from "lucide-react";

export const UIPrompts = () => {
  const [selectedTool, setSelectedTool] = useState("framer");
  
  const screens = ["Home", "Search", "Item Details", "Upload Item", "Chat", "Profile"];

  const mockPrompt = `Create a "Home" screen for a book exchange app:

Layout:
- Header with app logo and search icon
- Welcome message "Find your next read"
- Category grid (4x2): Textbooks, Fiction, Science, History, etc.
- Featured books carousel
- Bottom navigation: Home, Search, Upload, Profile

Styling:
- Clean, modern design with rounded corners
- Primary color: #6366f1 (indigo)
- White background with subtle shadows
- Typography: Inter font family

Interactions:
- Tap category → navigate to Search with filter
- Tap featured book → navigate to Item Details
- Pull to refresh for new featured items`;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">UI Prompts Generator</h1>
        <p className="text-muted-foreground">
          Generate detailed UI prompts for each screen, tailored to your chosen AI builder.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Tool-Specific Prompts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4 flex-wrap">
              {["framer", "uizard", "flutterflow"].map((tool) => (
                <Button
                  key={tool}
                  variant={selectedTool === tool ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTool(tool)}
                  className="capitalize"
                >
                  {tool}
                </Button>
              ))}
            </div>

            <Tabs defaultValue={screens[0]} className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                {screens.map((screen) => (
                  <TabsTrigger key={screen} value={screen} className="text-xs">
                    {screen}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {screens.map((screen) => (
                <TabsContent key={screen} value={screen} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      {screen} Screen
                      <Badge variant="secondary">{selectedTool}</Badge>
                    </h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm">
                        <Wand2 className="h-3 w-3 mr-1" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                  
                  <Card>
                    <CardContent className="p-4">
                      <Textarea
                        value={mockPrompt}
                        readOnly
                        className="min-h-[300px] font-mono text-sm"
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline">
            Back to Structure
          </Button>
          <Button>
            Generate Logic Flow
          </Button>
        </div>
      </div>
    </div>
  );
};