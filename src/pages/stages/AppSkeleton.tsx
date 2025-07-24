import { useState } from 'react';
import { StageNavigation } from "@/components/StageNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Layout, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Database, 
  Users, 
  MessageSquare,
  Home,
  Search,
  User,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Screen {
  id: string;
  name: string;
  purpose: string;
  dataNeeds: string[];
  icon: any;
}

const defaultScreens: Screen[] = [
  {
    id: "home",
    name: "Home",
    purpose: "Main dashboard showing featured resources and quick actions",
    dataNeeds: ["Featured listings", "User activity", "Notifications"],
    icon: Home
  },
  {
    id: "search",
    name: "Search & Browse",
    purpose: "Find and filter academic resources by category, subject, or location",
    dataNeeds: ["Resource listings", "Categories", "Filters", "User location"],
    icon: Search
  },
  {
    id: "listing-detail",
    name: "Resource Details",
    purpose: "Detailed view of a specific resource with contact options",
    dataNeeds: ["Resource info", "Images", "Owner details", "Reviews"],
    icon: Layout
  },
  {
    id: "chat",
    name: "Messaging",
    purpose: "In-app communication between users for resource exchange",
    dataNeeds: ["Messages", "Conversation history", "User status"],
    icon: MessageSquare
  },
  {
    id: "profile",
    name: "User Profile",
    purpose: "User's listings, reviews, and account management",
    dataNeeds: ["User info", "Own listings", "Reviews", "Exchange history"],
    icon: User
  }
];

const AppSkeleton = () => {
  const [screens, setScreens] = useState<Screen[]>(defaultScreens);
  const [newScreenName, setNewScreenName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const addScreen = () => {
    if (!newScreenName.trim()) return;
    
    const newScreen: Screen = {
      id: newScreenName.toLowerCase().replace(/\s+/g, '-'),
      name: newScreenName,
      purpose: "Define the purpose of this screen",
      dataNeeds: ["Define data requirements"],
      icon: Settings
    };
    
    setScreens([...screens, newScreen]);
    setNewScreenName("");
    toast({
      title: "Screen Added",
      description: `${newScreenName} has been added to your app structure.`,
    });
  };

  const removeScreen = (id: string) => {
    setScreens(screens.filter(screen => screen.id !== id));
    toast({
      title: "Screen Removed",
      description: "The screen has been removed from your app structure.",
    });
  };

  const generateFlowDiagram = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Flow Diagram Generated",
        description: "Navigation flow has been mapped for all screens.",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <StageNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Application Skeleton Generator</h1>
            <p className="text-xl text-muted-foreground">
              Define your app's structure, screens, and data architecture
            </p>
          </div>

          {/* Add Screen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Custom Screen
              </CardTitle>
              <CardDescription>
                Add additional screens specific to your app's needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Screen name (e.g., Settings, Notifications)"
                  value={newScreenName}
                  onChange={(e) => setNewScreenName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addScreen()}
                />
                <Button onClick={addScreen} disabled={!newScreenName.trim()}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Screens Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {screens.map((screen) => {
              const IconComponent = screen.icon;
              return (
                <Card key={screen.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{screen.name}</CardTitle>
                      </div>
                      {!defaultScreens.find(s => s.id === screen.id) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeScreen(screen.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{screen.purpose}</p>
                    
                    <div>
                      <p className="text-sm font-medium mb-2 flex items-center gap-1">
                        <Database className="h-3 w-3" />
                        Data Requirements:
                      </p>
                      <div className="space-y-1">
                        {screen.dataNeeds.map((need, index) => (
                          <Badge key={index} variant="secondary" className="text-xs mr-1 mb-1">
                            {need}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Navigation Flow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Navigation Flow
              </CardTitle>
              <CardDescription>
                Basic navigation structure between your app screens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="font-medium text-sm">Primary Flow</p>
                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                    <div>Home → Search & Browse</div>
                    <div>Search → Resource Details</div>
                    <div>Details → Messaging</div>
                  </div>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="font-medium text-sm">User Actions</p>
                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                    <div>Any Screen → Profile</div>
                    <div>Profile → User's Listings</div>
                    <div>Home → Quick Post</div>
                  </div>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="font-medium text-sm">Communication</p>
                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                    <div>Details → Start Chat</div>
                    <div>Chat → User Profile</div>
                    <div>Chat History → Messages</div>
                  </div>
                </div>
              </div>
              
              <Button onClick={generateFlowDiagram} disabled={isGenerating} className="w-full">
                {isGenerating ? "Generating..." : "Generate Detailed Flow Diagram"}
              </Button>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Layout className="h-5 w-5 text-green-600" />
                <p className="font-medium text-green-800 dark:text-green-200">
                  App Structure Complete
                </p>
              </div>
              <p className="text-sm text-green-600 dark:text-green-300">
                Your app consists of {screens.length} screens with defined purposes and data requirements. 
                Ready to generate detailed UI prompts for each screen.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppSkeleton;