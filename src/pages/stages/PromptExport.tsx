import { useState } from 'react';
import { StageNavigation } from "@/components/StageNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Package, 
  Download, 
  Copy, 
  FileText, 
  Code, 
  CheckCircle,
  Eye,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PromptExport = () => {
  const [selectedFormat, setSelectedFormat] = useState("master");
  const [qualityScore] = useState(92);
  const { toast } = useToast();

  const masterPrompt = `# College Resource Exchange App - Complete Build Guide

## App Overview
A mobile-first platform for college students to exchange academic resources like textbooks, notes, and equipment through secure in-app communication and location-based discovery.

## Target Tool: Framer
This prompt is optimized for Framer's AI assistant and component system.

## Design System
- **Primary Color:** Professional Blue (#2563eb)
- **Design Language:** Material Design principles
- **Device Target:** Mobile-first with responsive scaling
- **Typography:** Clean, readable fonts with proper hierarchy

## Complete App Structure

### 1. Home Screen
Create a welcoming dashboard with:
- Top navigation: app logo (left), notification bell (right)
- Search bar with placeholder "What are you looking for?"
- Personal greeting: "Hi, [Username]"
- Featured resources carousel (3-4 items)
- Quick action grid (2x2): "Post Resource", "Browse Books", "My Exchanges", "Messages"
- Recent activity feed showing latest community activity
- Bottom tab navigation: Home, Search, Post, Messages, Profile

### 2. Search & Browse Screen
Design a comprehensive search interface:
- Persistent search input with filter icon
- Horizontal category chips: "Textbooks", "Notes", "Equipment", "Study Guides"
- Sort dropdown: "Recent", "Distance", "Price", "Rating"
- Resource grid (2 columns mobile, 3-4 desktop)
- Each card: thumbnail, title, price/type, distance, user rating
- Infinite scroll with loading states

### 3. Resource Details Screen
Create detailed resource view:
- Full-width image carousel with multiple photos
- Share and favorite icons (top-right overlay)
- Resource info card: title, condition badge, price/exchange type
- Owner profile section: avatar, name, rating, "Message" button
- Expandable description with "Read more"
- Subject/course tags
- Primary CTA: "Contact Owner" button
- Secondary actions: "Add to Wishlist", "Report"
- Reviews/comments section
- "Similar Resources" recommendations

### 4. Messaging Screen
Build communication hub:
- Conversation list with user avatars, names, last message, timestamp
- Unread indicators and online status
- Search conversations capability
- Individual chat view with message bubbles (sent: right/blue, received: left/gray)
- Photo/image sharing
- Quick actions: "Share Location", "Make Offer"
- Input field with send button and attachments

### 5. User Profile Screen
Design comprehensive profile:
- Large avatar with edit option
- Username, join date, location, rating
- Stats cards: Items Listed, Successful Exchanges, Average Rating
- Activity tabs: "My Listings", "Exchange History", "Reviews", "Wishlist"
- Settings access and logout

## Navigation Logic
- Unauthenticated users redirected to login when accessing protected features
- "Contact Owner" → Login check → Chat screen
- Tab navigation accessible from any screen
- Back navigation with proper state management

## Data Requirements
- User authentication (Firebase Auth)
- Resource listings database (Firestore)
- Real-time messaging (Firebase Realtime Database)
- Image storage (Firebase Storage)
- Push notifications (FCM)
- Location services integration

## Key Interactions
- Tap resource card → Navigate to details
- Tap "Message" → Start conversation
- Pull to refresh on lists
- Swipe actions where appropriate
- Loading states for all async operations

## Responsive Behavior
- Mobile: 2-column grids, bottom navigation
- Tablet: 3-column grids, side navigation option
- Desktop: 4-column grids, full sidebar navigation

This prompt provides complete specifications for building a fully functional college resource exchange app in Framer.`;

  const screenPrompts = {
    home: `Create Home Screen:
- Top nav with logo and notifications
- Search bar with "What are you looking for?"
- User greeting section
- Featured resources carousel
- 2x2 quick action buttons
- Activity feed
- Bottom tab navigation`,

    search: `Create Search Screen:
- Search input with filters
- Category chips (horizontal scroll)
- Sort dropdown
- 2-column resource grid
- Cards with image, title, price, distance
- Infinite scroll loading`,

    details: `Create Resource Details:
- Image carousel with share/favorite
- Resource info card
- Owner profile section with message button
- Expandable description
- Tags and categories
- Contact and wishlist actions
- Reviews section`,

    messaging: `Create Messaging Interface:
- Conversation list with avatars
- Unread indicators
- Individual chat with message bubbles
- Photo sharing capability
- Quick action buttons
- Input with send/attach`,

    profile: `Create User Profile:
- Large avatar with edit
- User stats and ratings
- Activity tabs (listings, history, reviews)
- Settings access
- Clean, card-based layout`
  };

  const jsonExport = {
    app: {
      name: "College Resource Exchange",
      type: "mobile-first-web-app",
      builder: "framer",
      designSystem: "material-design",
      colorScheme: "professional-blue"
    },
    screens: [
      { id: "home", name: "Home", priority: "high" },
      { id: "search", name: "Search & Browse", priority: "high" },
      { id: "details", name: "Resource Details", priority: "high" },
      { id: "messaging", name: "Messaging", priority: "medium" },
      { id: "profile", name: "Profile", priority: "medium" }
    ],
    features: [
      "user-authentication",
      "resource-listings",
      "real-time-chat",
      "image-uploads",
      "location-services",
      "push-notifications"
    ],
    backend: {
      authentication: "firebase-auth",
      database: "firestore",
      storage: "firebase-storage",
      messaging: "firebase-realtime"
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to Clipboard",
      description: "The prompt has been copied and is ready to paste into Framer.",
    });
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: `${filename} has been downloaded to your computer.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <StageNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Prompt Export Composer</h1>
            <p className="text-xl text-muted-foreground">
              Export your complete prompt package, ready for your chosen AI builder
            </p>
          </div>

          {/* Quality Score */}
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Star className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Prompt Quality Score: {qualityScore}%
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      Excellent! Your prompts are optimized and ready for Framer.
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Production Ready
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Tabs value={selectedFormat} onValueChange={setSelectedFormat}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="master" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Master Prompt
              </TabsTrigger>
              <TabsTrigger value="screens" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Screen by Screen
              </TabsTrigger>
              <TabsTrigger value="json" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                JSON Export
              </TabsTrigger>
            </TabsList>

            {/* Master Prompt */}
            <TabsContent value="master" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Complete Master Prompt
                  </CardTitle>
                  <CardDescription>
                    Single, comprehensive prompt containing all screens, logic, and specifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary">Framer Optimized</Badge>
                    <Badge variant="outline">Mobile First</Badge>
                    <Badge variant="outline">Material Design</Badge>
                    <Badge variant="outline">{masterPrompt.length} characters</Badge>
                  </div>
                  
                  <Textarea
                    value={masterPrompt}
                    readOnly
                    className="min-h-[400px] font-mono text-xs"
                  />
                  
                  <div className="flex gap-2">
                    <Button onClick={() => copyToClipboard(masterPrompt)} className="flex-1">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Master Prompt
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => downloadFile(masterPrompt, 'college-exchange-app-prompt.txt')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Screen by Screen */}
            <TabsContent value="screens" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Individual Screen Prompts
                  </CardTitle>
                  <CardDescription>
                    Separate prompts for each screen, ideal for iterative building
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(screenPrompts).map(([screenId, prompt]) => (
                    <div key={screenId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium capitalize">{screenId.replace('-', ' ')} Screen</h4>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => copyToClipboard(prompt)}>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>
                      <div className="bg-secondary p-3 rounded text-sm font-mono">
                        {prompt}
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    onClick={() => downloadFile(
                      Object.entries(screenPrompts).map(([screen, prompt]) => 
                        `## ${screen.toUpperCase()} SCREEN\n\n${prompt}\n\n`
                      ).join('---\n\n'), 
                      'screen-prompts.txt'
                    )}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download All Screen Prompts
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* JSON Export */}
            <TabsContent value="json" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Structured JSON Export
                  </CardTitle>
                  <CardDescription>
                    Machine-readable format for advanced integrations and automation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={JSON.stringify(jsonExport, null, 2)}
                    readOnly
                    className="min-h-[300px] font-mono text-xs"
                  />
                  
                  <div className="flex gap-2">
                    <Button onClick={() => copyToClipboard(JSON.stringify(jsonExport, null, 2))} className="flex-1">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy JSON
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => downloadFile(JSON.stringify(jsonExport, null, 2), 'app-config.json')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download JSON
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Usage Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                How to Use These Prompts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">In Framer:</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Open Framer and create new project</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Paste the master prompt into Framer AI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Review and refine the generated components</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Publish and test your app</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Best Practices:</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <span>Start with master prompt for full context</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <span>Use screen prompts for iterative improvements</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <span>Test on mobile devices early and often</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <span>Customize colors and branding to match your vision</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PromptExport;