import { useState } from 'react';
import { StageNavigation } from "@/components/StageNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Palette,
  Smartphone,
  Monitor,
  Copy,
  Wand2,
  Home,
  Search,
  MessageSquare,
  User,
  Layout,
  Settings,
  Code2,
  Zap,
  Eye,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ToolSyntax {
  name: string;
  componentStyle: string;
  layoutApproach: string;
  interactionPatterns: string[];
  syntaxNotes: string;
}

interface UIPrompt {
  screenId: string;
  basePrompt: string;
  toolSpecific: Record<string, string>;
  components: ComponentSpec[];
  interactions: InteractionSpec[];
}

interface ComponentSpec {
  name: string;
  type: string;
  properties: Record<string, any>;
  children?: ComponentSpec[];
}

interface InteractionSpec {
  trigger: string;
  action: string;
  feedback: string;
  conditions?: string;
}

const screens = [
  { id: "home", name: "Home", icon: Home },
  { id: "search", name: "Search & Browse", icon: Search },
  { id: "listing-detail", name: "Resource Details", icon: Layout },
  { id: "chat", name: "Messaging", icon: MessageSquare },
  { id: "profile", name: "User Profile", icon: User }
];

const designSystems = [
  "Material Design",
  "Apple Human Interface",
  "Fluent Design",
  "Ant Design",
  "Chakra UI",
  "Custom Minimalist"
];

const colorSchemes = [
  "Professional Blue",
  "Academic Green",
  "Warm Orange",
  "Modern Purple",
  "Clean Monochrome"
];

const toolSyntaxes: Record<string, ToolSyntax> = {
  "Framer": {
    name: "Framer",
    componentStyle: "Component-based with variants and overrides",
    layoutApproach: "Auto Layout with responsive breakpoints",
    interactionPatterns: ["Smart Animate", "Page transitions", "Hover states", "Scroll triggers"],
    syntaxNotes: "Use component instances, define variants for states, specify responsive behavior with breakpoints"
  },
  "Uizard": {
    name: "Uizard",
    componentStyle: "Standard UI elements and patterns",
    layoutApproach: "Grid-based layout with mobile-first approach",
    interactionPatterns: ["Tap gestures", "Swipe navigation", "Form interactions", "Modal overlays"],
    syntaxNotes: "Focus on wireframe structure, use standard UI patterns, specify screen sizes and orientations"
  },
  "Adalo": {
    name: "Adalo",
    componentStyle: "Native mobile components with actions",
    layoutApproach: "Screen-based with component lists and forms",
    interactionPatterns: ["Database actions", "Navigation actions", "Conditional visibility", "Push notifications"],
    syntaxNotes: "Define database collections, specify user actions, include conditional logic and data binding"
  },
  "Builder.io": {
    name: "Builder.io",
    componentStyle: "Block-based visual components",
    layoutApproach: "Drag-and-drop blocks with responsive containers",
    interactionPatterns: ["Click actions", "Form submissions", "Dynamic content", "A/B test variants"],
    syntaxNotes: "Structure content in blocks, define data sources, specify responsive behavior and SEO elements"
  },
  "FlutterFlow": {
    name: "FlutterFlow",
    componentStyle: "Flutter widgets with custom properties",
    layoutApproach: "Widget tree with flexible layouts",
    interactionPatterns: ["Widget state changes", "Navigation routes", "Firebase actions", "Custom functions"],
    syntaxNotes: "Use Flutter widget terminology, define state management, specify Firebase integration and custom code"
  }
};

const UIPromptGenerator = () => {
  const [activeScreen, setActiveScreen] = useState("home");
  const [designSystem, setDesignSystem] = useState("");
  const [colorScheme, setColorScheme] = useState("");
  const [deviceTarget, setDeviceTarget] = useState("mobile-first");
  const [selectedTool, setSelectedTool] = useState("Framer");
  const [generatedPrompts, setGeneratedPrompts] = useState<Record<string, UIPrompt>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showComponentSpecs, setShowComponentSpecs] = useState(false);
  const [customRequirements, setCustomRequirements] = useState("");
  const { toast } = useToast();

  const generateToolSpecificPrompt = (basePrompt: string, tool: string): string => {
    const syntax = toolSyntaxes[tool];
    if (!syntax) return basePrompt;

    let toolPrompt = `# ${tool} Implementation\n\n`;
    toolPrompt += `**Component Style:** ${syntax.componentStyle}\n`;
    toolPrompt += `**Layout Approach:** ${syntax.layoutApproach}\n\n`;
    toolPrompt += `**${tool}-Specific Instructions:**\n`;
    toolPrompt += `${syntax.syntaxNotes}\n\n`;
    toolPrompt += `**Base Design:**\n${basePrompt}\n\n`;
    toolPrompt += `**Interaction Patterns:**\n`;
    syntax.interactionPatterns.forEach(pattern => {
      toolPrompt += `- ${pattern}\n`;
    });

    return toolPrompt;
  };

  const generateComponentSpecs = (screenId: string): ComponentSpec[] => {
    const componentSpecs: Record<string, ComponentSpec[]> = {
      home: [
        {
          name: "AppHeader",
          type: "container",
          properties: { height: "auto", padding: "16px", backgroundColor: "primary" },
          children: [
            { name: "Logo", type: "image", properties: { width: "120px", height: "40px" } },
            { name: "NotificationIcon", type: "icon", properties: { size: "24px", color: "white" } }
          ]
        },
        {
          name: "SearchBar",
          type: "input",
          properties: { placeholder: "What are you looking for?", borderRadius: "8px", padding: "12px" }
        },
        {
          name: "QuickActions",
          type: "grid",
          properties: { columns: 2, gap: "16px", padding: "20px" },
          children: [
            { name: "PostButton", type: "button", properties: { variant: "primary", text: "Post Resource" } },
            { name: "BrowseButton", type: "button", properties: { variant: "secondary", text: "Browse Books" } }
          ]
        }
      ],
      search: [
        {
          name: "SearchHeader",
          type: "container",
          properties: { position: "sticky", top: 0, backgroundColor: "background" },
          children: [
            { name: "SearchInput", type: "input", properties: { placeholder: "Search resources...", fullWidth: true } },
            { name: "FilterButton", type: "button", properties: { variant: "ghost", icon: "filter" } }
          ]
        },
        {
          name: "CategoryChips",
          type: "scrollable",
          properties: { direction: "horizontal", gap: "8px" },
          children: [
            { name: "CategoryChip", type: "chip", properties: { text: "Textbooks", selectable: true } }
          ]
        }
      ]
    };

    return componentSpecs[screenId] || [];
  };

  const generateInteractionSpecs = (screenId: string): InteractionSpec[] => {
    const interactionSpecs: Record<string, InteractionSpec[]> = {
      home: [
        {
          trigger: "User taps Search Bar",
          action: "Navigate to Search screen",
          feedback: "Smooth transition animation",
          conditions: "Always available"
        },
        {
          trigger: "User taps Post Resource",
          action: "Open create listing form",
          feedback: "Modal slide up animation",
          conditions: "User must be authenticated"
        }
      ],
      search: [
        {
          trigger: "User types in search input",
          action: "Filter results in real-time",
          feedback: "Loading skeleton while searching",
          conditions: "Debounce input by 300ms"
        },
        {
          trigger: "User taps filter button",
          action: "Open filter panel",
          feedback: "Slide in from right",
          conditions: "Always available"
        }
      ]
    };

    return interactionSpecs[screenId] || [];
  };

  const generatePrompt = async (screenId: string) => {
    setIsGenerating(true);

    // Simulate AI prompt generation
    setTimeout(() => {
      const basePrompts: Record<string, string> = {
        home: `Create a mobile-first home screen with the following layout:

**Header Section:**
- Top navigation bar with app logo on left, notification bell icon on right
- Search bar below with placeholder "What are you looking for?"
- User avatar and "Hi, [Name]" greeting

**Main Content:**
- Hero banner showcasing "Featured Resources" with carousel of 3-4 book covers
- Quick action buttons in 2x2 grid: "Post Resource", "Browse Books", "My Exchanges", "Messages"
- Recent activity feed showing latest listings and exchanges

**Bottom Navigation:**
- Tab bar with 5 icons: Home, Search, Post, Messages, Profile
- Use ${colorScheme || 'Professional Blue'} as primary color
- Apply ${designSystem || 'Material Design'} principles
- Ensure touch targets are minimum 44px for accessibility

${customRequirements ? `**Custom Requirements:**\n${customRequirements}` : ''}`,

        search: `Design a comprehensive search and browse interface:

**Search Header:**
- Persistent search input with filter icon on right
- Horizontal scrollable category chips: "Textbooks", "Notes", "Equipment", etc.
- Sort dropdown: "Recent", "Distance", "Price"

**Main Content:**
- Grid layout of resource cards (2 columns on mobile, 3-4 on desktop)
- Each card contains: thumbnail image, title, price/exchange type, distance, user rating
- Infinite scroll loading with skeleton placeholders

**Filter Panel (slide-in):**
- Price range slider
- Distance radius selector
- Subject/course filters
- Condition dropdown
- Apply/Clear buttons at bottom

${customRequirements ? `**Custom Requirements:**\n${customRequirements}` : ''}`,

        "listing-detail": `Create a detailed resource view page:

**Image Section:**
- Full-width carousel with multiple resource photos
- Share and favorite icons overlaid on top-right

**Details Card:**
- Resource title, condition badge, price/exchange type
- Owner profile section with avatar, name, rating, and "Message" button
- Description text with "Read more" expansion
- Tags for subject, course, and categories

**Action Section:**
- Primary CTA button: "Contact Owner" or "Make Offer"
- Secondary actions: "Add to Wishlist", "Report Listing"
- Recent reviews/comments section

**Related Items:**
- "Similar Resources" horizontal scroll section at bottom

${customRequirements ? `**Custom Requirements:**\n${customRequirements}` : ''}`,

        chat: `Build an in-app messaging interface:

**Chat List View:**
- Header with "Messages" title and new message icon
- List of conversations with user avatar, name, last message preview, timestamp
- Unread message indicators and active status dots
- Search conversations input at top

**Individual Chat View:**
- Header: other user's name, avatar, online status, and menu (3 dots)
- Message bubbles: sent (right, primary color), received (left, gray)
- Image/photo sharing capability
- Quick action buttons: "Share Location", "Send Photo", "Make Offer"
- Input field with send button and attachment icon

${customRequirements ? `**Custom Requirements:**\n${customRequirements}` : ''}`,

        profile: `Design a comprehensive user profile interface:

**Profile Header:**
- Large user avatar with edit option
- Username, join date, location
- Rating stars and total reviews count
- "Edit Profile" button

**Stats Section:**
- Cards showing: Items Listed, Successful Exchanges, Rating Average
- Trust badges or verification indicators

**Activity Tabs:**
- "My Listings" - grid of user's posted resources
- "Exchange History" - list of completed transactions
- "Reviews" - feedback from other users
- "Wishlist" - saved/favorited items

**Settings Access:**
- Account settings, notification preferences, privacy controls
- Help/Support and logout options

${customRequirements ? `**Custom Requirements:**\n${customRequirements}` : ''}`
      };

      const basePrompt = basePrompts[screenId] || "Screen not found";
      const components = generateComponentSpecs(screenId);
      const interactions = generateInteractionSpecs(screenId);

      const toolSpecificPrompts: Record<string, string> = {};
      Object.keys(toolSyntaxes).forEach(tool => {
        toolSpecificPrompts[tool] = generateToolSpecificPrompt(basePrompt, tool);
      });

      const uiPrompt: UIPrompt = {
        screenId,
        basePrompt,
        toolSpecific: toolSpecificPrompts,
        components,
        interactions
      };

      setGeneratedPrompts(prev => ({
        ...prev,
        [screenId]: uiPrompt
      }));
      
      setIsGenerating(false);
      toast({
        title: "Prompt Generated",
        description: `UI prompt for ${screens.find(s => s.id === screenId)?.name} screen has been created.`,
      });
    }, 2000);
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Copied to Clipboard",
      description: "The prompt has been copied to your clipboard.",
    });
  };

  const generateAllPrompts = async () => {
    for (const screen of screens) {
      await generatePrompt(screen.id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <StageNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">UI Prompt Generator</h1>
            <p className="text-xl text-muted-foreground">
              Generate detailed UI prompts for each screen, optimized for your chosen AI builder
            </p>
          </div>

          {/* Design Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Design Configuration
              </CardTitle>
              <CardDescription>
                Set your design preferences to influence all generated prompts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Tool</label>
                  <Select value={selectedTool} onValueChange={setSelectedTool}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(toolSyntaxes).map((tool) => (
                        <SelectItem key={tool} value={tool}>{tool}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Design System</label>
                  <Select value={designSystem} onValueChange={setDesignSystem}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose design system..." />
                    </SelectTrigger>
                    <SelectContent>
                      {designSystems.map((system) => (
                        <SelectItem key={system} value={system}>{system}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color Scheme</label>
                  <Select value={colorScheme} onValueChange={setColorScheme}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose color scheme..." />
                    </SelectTrigger>
                    <SelectContent>
                      {colorSchemes.map((scheme) => (
                        <SelectItem key={scheme} value={scheme}>{scheme}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Device</label>
                  <Select value={deviceTarget} onValueChange={setDeviceTarget}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="mobile-first">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Mobile First
                      </div>
                    </SelectItem>
                    <SelectItem value="desktop-first">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        Desktop First
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Requirements */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Custom Requirements</label>
                <Textarea
                  placeholder="Add any specific requirements, constraints, or special features for your UI..."
                  value={customRequirements}
                  onChange={(e) => setCustomRequirements(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              {/* Tool Syntax Info */}
              {selectedTool && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Code2 className="h-4 w-4" />
                    <span className="font-medium">{selectedTool} Syntax Guidelines</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Component Style:</strong> {toolSyntaxes[selectedTool]?.componentStyle}</p>
                    <p><strong>Layout Approach:</strong> {toolSyntaxes[selectedTool]?.layoutApproach}</p>
                    <p><strong>Key Patterns:</strong> {toolSyntaxes[selectedTool]?.interactionPatterns.slice(0, 3).join(', ')}</p>
                  </div>
                </div>
              )}
              </div>
            </CardContent>
          </Card>

          {/* Generate All Button */}
          <div className="text-center space-y-4">
            <Button onClick={generateAllPrompts} size="lg" disabled={isGenerating}>
              <Wand2 className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating All Prompts..." : "Generate All Screen Prompts"}
            </Button>

            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComponentSpecs(!showComponentSpecs)}
              >
                <Eye className="h-3 w-3 mr-1" />
                {showComponentSpecs ? "Hide" : "Show"} Component Specs
              </Button>
            </div>
          </div>

          {/* Screen Tabs */}
          <Tabs value={activeScreen} onValueChange={setActiveScreen} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {screens.map((screen) => {
                const IconComponent = screen.icon;
                return (
                  <TabsTrigger key={screen.id} value={screen.id} className="flex items-center gap-1">
                    <IconComponent className="h-4 w-4" />
                    <span className="hidden sm:inline">{screen.name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {screens.map((screen) => (
              <TabsContent key={screen.id} value={screen.id} className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <screen.icon className="h-5 w-5" />
                        {screen.name} Screen
                      </CardTitle>
                      <div className="flex gap-2">
                        {generatedPrompts[screen.id] && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyPrompt(generatedPrompts[screen.id])}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => generatePrompt(screen.id)}
                          disabled={isGenerating}
                        >
                          <Wand2 className="h-4 w-4 mr-1" />
                          {generatedPrompts[screen.id] ? "Regenerate" : "Generate"}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {generatedPrompts[screen.id] ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{selectedTool} Optimized</Badge>
                          <Badge variant="outline">{deviceTarget === 'mobile-first' ? 'Mobile First' : 'Desktop First'}</Badge>
                          {designSystem && <Badge variant="outline">{designSystem}</Badge>}
                          {colorScheme && <Badge variant="outline">{colorScheme}</Badge>}
                        </div>

                        {/* Tool-Specific Prompt Tabs */}
                        <Tabs defaultValue={selectedTool} className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="base">Base Prompt</TabsTrigger>
                            <TabsTrigger value={selectedTool}>{selectedTool} Specific</TabsTrigger>
                            <TabsTrigger value="specs">Components & Interactions</TabsTrigger>
                          </TabsList>

                          <TabsContent value="base" className="space-y-4">
                            <div className="bg-muted/30 p-4 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Universal Base Prompt</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyPrompt(generatedPrompts[screen.id].basePrompt)}
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy
                                </Button>
                              </div>
                              <pre className="text-sm whitespace-pre-wrap bg-background p-3 rounded border overflow-x-auto">
                                {generatedPrompts[screen.id].basePrompt}
                              </pre>
                            </div>
                          </TabsContent>

                          <TabsContent value={selectedTool} className="space-y-4">
                            <div className="bg-muted/30 p-4 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">{selectedTool}-Specific Prompt</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyPrompt(generatedPrompts[screen.id].toolSpecific[selectedTool])}
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy
                                </Button>
                              </div>
                              <pre className="text-sm whitespace-pre-wrap bg-background p-3 rounded border overflow-x-auto">
                                {generatedPrompts[screen.id].toolSpecific[selectedTool]}
                              </pre>
                            </div>
                          </TabsContent>

                          <TabsContent value="specs" className="space-y-4">
                            {showComponentSpecs && (
                              <>
                                {/* Component Specifications */}
                                <div className="bg-muted/30 p-4 rounded-lg">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Layers className="h-4 w-4" />
                                    <span className="text-sm font-medium">Component Specifications</span>
                                  </div>
                                  <div className="space-y-3">
                                    {generatedPrompts[screen.id].components.map((component, index) => (
                                      <div key={index} className="bg-background p-3 rounded border">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Badge variant="outline" className="text-xs">{component.type}</Badge>
                                          <span className="font-medium text-sm">{component.name}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {Object.entries(component.properties).map(([key, value]) => (
                                            <span key={key} className="mr-3">{key}: {String(value)}</span>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Interaction Specifications */}
                                <div className="bg-muted/30 p-4 rounded-lg">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Zap className="h-4 w-4" />
                                    <span className="text-sm font-medium">Interaction Specifications</span>
                                  </div>
                                  <div className="space-y-3">
                                    {generatedPrompts[screen.id].interactions.map((interaction, index) => (
                                      <div key={index} className="bg-background p-3 rounded border">
                                        <div className="text-sm font-medium mb-1">{interaction.trigger}</div>
                                        <div className="text-xs text-muted-foreground space-y-1">
                                          <div><strong>Action:</strong> {interaction.action}</div>
                                          <div><strong>Feedback:</strong> {interaction.feedback}</div>
                                          {interaction.conditions && (
                                            <div><strong>Conditions:</strong> {interaction.conditions}</div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}
                          </TabsContent>
                        </Tabs>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Wand2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Click "Generate" to create a detailed UI prompt for this screen</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UIPromptGenerator;