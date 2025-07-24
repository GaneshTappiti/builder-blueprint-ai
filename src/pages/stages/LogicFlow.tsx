import { useState } from 'react';
import { StageNavigation } from "@/components/StageNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  GitBranch, 
  Plus, 
  Trash2, 
  Database, 
  Zap,
  ArrowRight,
  Shield,
  Bell,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LogicRule {
  id: string;
  trigger: string;
  condition: string;
  action: string;
  category: 'navigation' | 'auth' | 'data' | 'notification';
}

const defaultRules: LogicRule[] = [
  {
    id: "1",
    trigger: "User taps 'Contact Owner'",
    condition: "User is authenticated",
    action: "Navigate to chat screen with owner",
    category: "navigation"
  },
  {
    id: "2", 
    trigger: "User taps 'Contact Owner'",
    condition: "User is NOT authenticated",
    action: "Show login modal, then proceed to chat",
    category: "auth"
  },
  {
    id: "3",
    trigger: "User submits new listing",
    condition: "All required fields filled",
    action: "Save to database, show success message, navigate to listing",
    category: "data"
  },
  {
    id: "4",
    trigger: "New message received",
    condition: "App is in background",
    action: "Send push notification",
    category: "notification"
  },
  {
    id: "5",
    trigger: "User searches resources",
    condition: "Location permission granted",
    action: "Show results sorted by distance",
    category: "data"
  }
];

const LogicFlow = () => {
  const [rules, setRules] = useState<LogicRule[]>(defaultRules);
  const [newRule, setNewRule] = useState({ trigger: "", condition: "", action: "", category: "navigation" as const });
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();

  const addRule = () => {
    if (!newRule.trigger || !newRule.condition || !newRule.action) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields for the logic rule.",
        variant: "destructive"
      });
      return;
    }

    const rule: LogicRule = {
      id: Date.now().toString(),
      ...newRule
    };

    setRules([...rules, rule]);
    setNewRule({ trigger: "", condition: "", action: "", category: "navigation" });
    toast({
      title: "Logic Rule Added",
      description: "The new rule has been added to your app flow.",
    });
  };

  const removeRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
    toast({
      title: "Rule Removed",
      description: "The logic rule has been removed.",
    });
  };

  const filteredRules = selectedCategory === "all" 
    ? rules 
    : rules.filter(rule => rule.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'navigation': return ArrowRight;
      case 'auth': return Shield;
      case 'data': return Database;
      case 'notification': return Bell;
      default: return GitBranch;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'navigation': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'auth': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'data': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'notification': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <StageNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Logic & Navigation Flow Builder</h1>
            <p className="text-xl text-muted-foreground">
              Define conditional logic, navigation rules, and state management for your app
            </p>
          </div>

          {/* Add New Rule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Logic Rule
              </CardTitle>
              <CardDescription>
                Define what happens when users interact with your app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Trigger (When)</label>
                  <Input
                    placeholder="e.g., User taps login button"
                    value={newRule.trigger}
                    onChange={(e) => setNewRule({...newRule, trigger: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Condition (If)</label>
                  <Input
                    placeholder="e.g., User is not authenticated"
                    value={newRule.condition}
                    onChange={(e) => setNewRule({...newRule, condition: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Action (Then)</label>
                  <Input
                    placeholder="e.g., Show login modal"
                    value={newRule.action}
                    onChange={(e) => setNewRule({...newRule, action: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={newRule.category} onValueChange={(value: any) => setNewRule({...newRule, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="navigation">Navigation</SelectItem>
                      <SelectItem value="auth">Authentication</SelectItem>
                      <SelectItem value="data">Data Operations</SelectItem>
                      <SelectItem value="notification">Notifications</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={addRule} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Logic Rule
              </Button>
            </CardContent>
          </Card>

          {/* Filter */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Filter by category:</span>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="navigation">Navigation</SelectItem>
                <SelectItem value="auth">Authentication</SelectItem>
                <SelectItem value="data">Data Operations</SelectItem>
                <SelectItem value="notification">Notifications</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logic Rules */}
          <div className="space-y-4">
            {filteredRules.map((rule) => {
              const Icon = getCategoryIcon(rule.category);
              return (
                <Card key={rule.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge className={getCategoryColor(rule.category)}>
                            <Icon className="h-3 w-3 mr-1" />
                            {rule.category}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-blue-600 dark:text-blue-400 mb-1">WHEN</p>
                            <p className="text-muted-foreground">{rule.trigger}</p>
                          </div>
                          <div>
                            <p className="font-medium text-orange-600 dark:text-orange-400 mb-1">IF</p>
                            <p className="text-muted-foreground">{rule.condition}</p>
                          </div>
                          <div>
                            <p className="font-medium text-green-600 dark:text-green-400 mb-1">THEN</p>
                            <p className="text-muted-foreground">{rule.action}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRule(rule.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Backend Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backend Integration
              </CardTitle>
              <CardDescription>
                Data operations and API connections for your app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Database Operations</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>User authentication (Firebase Auth)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Resource listings (Firestore)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Real-time messaging (Firebase)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Image uploads (Firebase Storage)</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">External APIs</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>Location services (Google Maps)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>Push notifications (FCM)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>Payment processing (Stripe)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>Image optimization (Cloudinary)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="h-5 w-5 text-green-600" />
                <p className="font-medium text-green-800 dark:text-green-200">
                  Logic Flow Complete
                </p>
              </div>
              <p className="text-sm text-green-600 dark:text-green-300">
                Defined {rules.length} logic rules covering navigation, authentication, data operations, and notifications. 
                Your app now has comprehensive behavioral instructions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LogicFlow;