import { useState } from 'react';
import { StageNavigation } from "@/components/StageNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Settings,
  GitBranch,
  Eye,
  Code,
  Layers
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Screen {
  id: string;
  name: string;
  purpose: string;
  dataNeeds: string[];
  icon: any;
  connections: string[];
  userActions: string[];
  dataStructure: {
    collections: string[];
    fields: { [key: string]: string[] };
  };
}

interface AppFlow {
  screens: Screen[];
  dataModels: DataModel[];
  navigationFlow: string;
}

interface DataModel {
  name: string;
  fields: { name: string; type: string; required: boolean }[];
  relationships: string[];
}

const defaultScreens: Screen[] = [
  {
    id: "home",
    name: "Home",
    purpose: "Main dashboard showing featured resources and quick actions",
    dataNeeds: ["Featured listings", "User activity", "Notifications"],
    icon: Home,
    connections: ["search", "profile", "messages"],
    userActions: ["Browse featured items", "Quick search", "View notifications", "Access profile"],
    dataStructure: {
      collections: ["listings", "users", "notifications"],
      fields: {
        listings: ["title", "description", "price", "category", "featured"],
        users: ["name", "avatar", "university"],
        notifications: ["message", "timestamp", "read"]
      }
    }
  },
  {
    id: "search",
    name: "Search & Browse",
    purpose: "Find and filter academic resources by category, subject, or location",
    dataNeeds: ["Resource listings", "Categories", "Filters", "User location"],
    icon: Search,
    connections: ["home", "listing-detail", "filters"],
    userActions: ["Search by keyword", "Apply filters", "Sort results", "View item details"],
    dataStructure: {
      collections: ["listings", "categories", "filters"],
      fields: {
        listings: ["title", "description", "price", "category", "location", "condition"],
        categories: ["name", "icon", "count"],
        filters: ["type", "values", "active"]
      }
    }
  },
  {
    id: "listing-detail",
    name: "Resource Details",
    purpose: "Detailed view of a specific resource with contact options",
    dataNeeds: ["Resource info", "Images", "Owner details", "Reviews"],
    icon: Layout,
    connections: ["search", "messages", "profile"],
    userActions: ["View images", "Contact owner", "Save to favorites", "Report listing"],
    dataStructure: {
      collections: ["listings", "users", "reviews", "images"],
      fields: {
        listings: ["title", "description", "price", "condition", "availability"],
        users: ["name", "avatar", "rating", "university", "verified"],
        reviews: ["rating", "comment", "timestamp", "reviewer"],
        images: ["url", "caption", "order"]
      }
    }
  },
  {
    id: "chat",
    name: "Messaging",
    purpose: "In-app communication between users for resource exchange",
    dataNeeds: ["Messages", "Conversation history", "User status"],
    icon: MessageSquare,
    connections: ["home", "listing-detail", "profile"],
    userActions: ["Send message", "View conversation", "Share listing", "Block user"],
    dataStructure: {
      collections: ["conversations", "messages", "users"],
      fields: {
        conversations: ["participants", "lastMessage", "timestamp", "unreadCount"],
        messages: ["content", "sender", "timestamp", "messageType", "read"],
        users: ["name", "avatar", "online", "lastSeen"]
      }
    }
  },
  {
    id: "profile",
    name: "User Profile",
    purpose: "User's listings, reviews, and account management",
    dataNeeds: ["User info", "Own listings", "Reviews", "Exchange history"],
    icon: User,
    connections: ["home", "settings", "listing-detail"],
    userActions: ["Edit profile", "View own listings", "Check reviews", "Manage account"],
    dataStructure: {
      collections: ["users", "listings", "reviews", "transactions"],
      fields: {
        users: ["name", "email", "university", "avatar", "bio", "verified"],
        listings: ["title", "status", "views", "favorites", "dateCreated"],
        reviews: ["rating", "comment", "reviewer", "timestamp"],
        transactions: ["listing", "buyer", "seller", "status", "date"]
      }
    }
  }
];

const AppSkeleton = () => {
  const [screens, setScreens] = useState<Screen[]>(defaultScreens);
  const [newScreenName, setNewScreenName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFlowDiagram, setShowFlowDiagram] = useState(false);
  const [dataModels, setDataModels] = useState<DataModel[]>([]);
  const { toast } = useToast();

  const addScreen = () => {
    if (!newScreenName.trim()) return;

    const newScreen: Screen = {
      id: newScreenName.toLowerCase().replace(/\s+/g, '-'),
      name: newScreenName,
      purpose: "Define the purpose of this screen",
      dataNeeds: ["Define data requirements"],
      icon: Settings,
      connections: [],
      userActions: ["Define user actions"],
      dataStructure: {
        collections: [],
        fields: {}
      }
    };

    setScreens([...screens, newScreen]);
    setNewScreenName("");
    toast({
      title: "Screen Added",
      description: `${newScreenName} has been added to your app structure.`,
    });
  };

  const generateDataModels = () => {
    const allCollections = new Set<string>();
    const modelMap = new Map<string, DataModel>();

    // Extract all unique collections from screens
    screens.forEach(screen => {
      screen.dataStructure.collections.forEach(collection => {
        allCollections.add(collection);

        if (!modelMap.has(collection)) {
          modelMap.set(collection, {
            name: collection,
            fields: [],
            relationships: []
          });
        }

        // Add fields from this screen's data structure
        const fields = screen.dataStructure.fields[collection] || [];
        const model = modelMap.get(collection)!;

        fields.forEach(fieldName => {
          if (!model.fields.find(f => f.name === fieldName)) {
            model.fields.push({
              name: fieldName,
              type: inferFieldType(fieldName),
              required: isRequiredField(fieldName)
            });
          }
        });
      });
    });

    setDataModels(Array.from(modelMap.values()));
  };

  const inferFieldType = (fieldName: string): string => {
    const lowerName = fieldName.toLowerCase();
    if (lowerName.includes('email')) return 'email';
    if (lowerName.includes('password')) return 'password';
    if (lowerName.includes('date') || lowerName.includes('timestamp')) return 'datetime';
    if (lowerName.includes('price') || lowerName.includes('rating')) return 'number';
    if (lowerName.includes('verified') || lowerName.includes('read') || lowerName.includes('active')) return 'boolean';
    if (lowerName.includes('url') || lowerName.includes('avatar') || lowerName.includes('image')) return 'url';
    if (lowerName.includes('description') || lowerName.includes('bio') || lowerName.includes('comment')) return 'text';
    return 'string';
  };

  const isRequiredField = (fieldName: string): boolean => {
    const requiredFields = ['name', 'title', 'email', 'id'];
    return requiredFields.some(req => fieldName.toLowerCase().includes(req));
  };

  const generateMermaidFlow = (): string => {
    let mermaid = 'graph TD\n';

    // Add all screens as nodes
    screens.forEach(screen => {
      mermaid += `    ${screen.id}["${screen.name}"]\n`;
    });

    mermaid += '\n';

    // Add connections between screens
    screens.forEach(screen => {
      screen.connections.forEach(connection => {
        if (screens.find(s => s.id === connection)) {
          mermaid += `    ${screen.id} --> ${connection}\n`;
        }
      });
    });

    return mermaid;
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

          {/* Flow Visualization & Data Models */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Flow Diagram */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Navigation Flow
                </CardTitle>
                <CardDescription>
                  Visualize screen connections and user journey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => {
                    generateDataModels();
                    setShowFlowDiagram(true);
                  }}
                  className="w-full"
                  variant="outline"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Generate Flow Diagram
                </Button>

                {showFlowDiagram && (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="text-sm text-muted-foreground mb-2">Navigation Flow Diagram:</div>
                    <div className="bg-background p-3 rounded border">
                      <div className="text-xs text-muted-foreground mb-2">
                        Interactive diagram showing screen connections and user flow
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // This would trigger the Mermaid rendering in a real implementation
                          toast({
                            title: "Flow Diagram",
                            description: "Interactive diagram would be rendered here using Mermaid.js",
                          });
                        }}
                      >
                        <Layers className="h-3 w-3 mr-1" />
                        View Interactive Diagram
                      </Button>
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer text-muted-foreground">View Mermaid Code</summary>
                        <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-x-auto">
                          {generateMermaidFlow()}
                        </pre>
                      </details>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Data Models */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Architecture
                </CardTitle>
                <CardDescription>
                  Generated data models from screen requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={generateDataModels}
                  className="w-full"
                  variant="outline"
                >
                  <Code className="h-4 w-4 mr-2" />
                  Generate Data Models
                </Button>

                {dataModels.length > 0 && (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {dataModels.map((model, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-muted/30">
                        <div className="font-medium text-sm mb-2 capitalize">{model.name}</div>
                        <div className="space-y-1">
                          {model.fields.slice(0, 4).map((field, fieldIndex) => (
                            <div key={fieldIndex} className="flex items-center gap-2 text-xs">
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                {field.type}
                              </Badge>
                              <span className={field.required ? "font-medium" : "text-muted-foreground"}>
                                {field.name}
                              </span>
                              {field.required && <span className="text-red-500">*</span>}
                            </div>
                          ))}
                          {model.fields.length > 4 && (
                            <div className="text-xs text-muted-foreground">
                              +{model.fields.length - 4} more fields
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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

                    {/* User Actions */}
                    <div>
                      <p className="text-sm font-medium mb-2 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        User Actions:
                      </p>
                      <div className="space-y-1">
                        {screen.userActions.slice(0, 3).map((action, index) => (
                          <div key={index} className="text-xs text-muted-foreground">• {action}</div>
                        ))}
                        {screen.userActions.length > 3 && (
                          <div className="text-xs text-muted-foreground">+{screen.userActions.length - 3} more</div>
                        )}
                      </div>
                    </div>

                    {/* Connections */}
                    {screen.connections.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2 flex items-center gap-1">
                          <ArrowRight className="h-3 w-3" />
                          Connects to:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {screen.connections.map((connection, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {screens.find(s => s.id === connection)?.name || connection}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Data Collections */}
                    <div>
                      <p className="text-sm font-medium mb-2 flex items-center gap-1">
                        <Database className="h-3 w-3" />
                        Data Collections:
                      </p>
                      <div className="space-y-1">
                        {screen.dataStructure.collections.length > 0 ? (
                          screen.dataStructure.collections.map((collection, index) => (
                            <Badge key={index} variant="secondary" className="text-xs mr-1 mb-1">
                              {collection}
                            </Badge>
                          ))
                        ) : (
                          screen.dataNeeds.map((need, index) => (
                            <Badge key={index} variant="secondary" className="text-xs mr-1 mb-1">
                              {need}
                            </Badge>
                          ))
                        )}
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