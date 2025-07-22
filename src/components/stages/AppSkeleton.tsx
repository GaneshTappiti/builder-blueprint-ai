import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Layout, Smartphone } from "lucide-react";

export const AppSkeleton = () => {
  const screens = [
    { name: "Home", description: "Main landing with categories", type: "List" },
    { name: "Search", description: "Filter and browse items", type: "Search" },
    { name: "Item Details", description: "Full item info and contact", type: "Detail" },
    { name: "Upload Item", description: "Add new item form", type: "Form" },
    { name: "Chat", description: "Messaging between users", type: "Chat" },
    { name: "Profile", description: "User profile and listings", type: "Profile" },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">App Structure Overview</h1>
        <p className="text-muted-foreground">
          Based on your idea, here's the suggested app structure. You can modify screens as needed.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5 text-primary" />
              App Screens ({screens.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {screens.map((screen, index) => (
                <div key={index} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Smartphone className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">{screen.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{screen.description}</p>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {screen.type}
                  </span>
                </div>
              ))}
              
              <button className="p-4 border border-dashed border-border rounded-lg hover:bg-muted/50 transition-colors flex flex-col items-center justify-center min-h-[120px]">
                <Plus className="h-6 w-6 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Add Screen</span>
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline">
            Back to Idea
          </Button>
          <Button>
            Generate UI Prompts
          </Button>
        </div>
      </div>
    </div>
  );
};