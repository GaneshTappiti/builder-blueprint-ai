import { useState } from 'react';
import { StageNavigation } from "@/components/StageNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Layout
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

const UIPromptGenerator = () => {
  const [activeScreen, setActiveScreen] = useState("home");
  const [designSystem, setDesignSystem] = useState("");
  const [colorScheme, setColorScheme] = useState("");
  const [deviceTarget, setDeviceTarget] = useState("mobile-first");
  const [generatedPrompts, setGeneratedPrompts] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePrompt = async (screenId: string) => {
    setIsGenerating(true);
    
    // Simulate AI prompt generation
    setTimeout(() => {
      const mockPrompts: Record<string, string> = {
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
- Ensure touch targets are minimum 44px for accessibility`,

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
- Apply/Clear buttons at bottom`,

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
- "Similar Resources" horizontal scroll section at bottom`,

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
- Input field with send button and attachment icon`,

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
- Help/Support and logout options`
      };

      setGeneratedPrompts(prev => ({
        ...prev,
        [screenId]: mockPrompts[screenId] || "Prompt generation failed. Please try again."
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
            <CardContent className="grid md:grid-cols-3 gap-4">
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
            </CardContent>
          </Card>

          {/* Generate All Button */}
          <div className="text-center">
            <Button onClick={generateAllPrompts} size="lg" disabled={isGenerating}>
              <Wand2 className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating All Prompts..." : "Generate All Screen Prompts"}
            </Button>
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
                          <Badge variant="secondary">Framer Optimized</Badge>
                          <Badge variant="outline">{deviceTarget === 'mobile-first' ? 'Mobile First' : 'Desktop First'}</Badge>
                          {designSystem && <Badge variant="outline">{designSystem}</Badge>}
                        </div>
                        <div className="bg-secondary p-4 rounded-lg">
                          <pre className="whitespace-pre-wrap text-sm font-mono">
                            {generatedPrompts[screen.id]}
                          </pre>
                        </div>
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