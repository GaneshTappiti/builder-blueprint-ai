import { useState } from 'react';
import { StageNavigation } from "@/components/StageNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GitBranch,
  Plus,
  Trash2,
  Database,
  Zap,
  ArrowRight,
  Shield,
  Bell,
  RefreshCw,
  Route,
  Settings,
  Code,
  Eye,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LogicRule {
  id: string;
  trigger: string;
  condition: string;
  action: string;
  category: 'navigation' | 'auth' | 'data' | 'notification' | 'modal' | 'backend';
  priority: 'high' | 'medium' | 'low';
  dataBinding?: string;
  errorHandling?: string;
}

interface NavigationFlow {
  id: string;
  fromScreen: string;
  toScreen: string;
  trigger: string;
  conditions: string[];
  animation: string;
  dataPassthrough?: string;
}

interface ModalLogic {
  id: string;
  modalType: string;
  trigger: string;
  content: string;
  actions: string[];
  dismissConditions: string[];
}

interface BackendIntegration {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  trigger: string;
  dataModel: string;
  errorHandling: string;
  successAction: string;
}

const defaultRules: LogicRule[] = [
  {
    id: "1",
    trigger: "User taps 'Contact Owner'",
    condition: "User is authenticated",
    action: "Navigate to chat screen with owner",
    category: "navigation",
    priority: "high",
    dataBinding: "Pass listing ID and owner details to chat screen"
  },
  {
    id: "2",
    trigger: "User taps 'Contact Owner'",
    condition: "User is NOT authenticated",
    action: "Show login modal, then proceed to chat",
    category: "auth",
    priority: "high",
    errorHandling: "If login fails, show error message and remain on listing page"
  },
  {
    id: "3",
    trigger: "User submits new listing",
    condition: "All required fields filled",
    action: "Save to database, show success message, navigate to listing",
    category: "data",
    priority: "high",
    dataBinding: "POST /api/listings with form data",
    errorHandling: "Show validation errors inline, don't navigate on failure"
  },
  {
    id: "4",
    trigger: "New message received",
    condition: "App is in background",
    action: "Send push notification",
    category: "notification",
    priority: "medium"
  },
  {
    id: "5",
    trigger: "User searches for resources",
    condition: "Search query length > 2 characters",
    action: "Fetch filtered results from API",
    category: "backend",
    priority: "medium",
    dataBinding: "GET /api/listings?search={query}&filters={activeFilters}",
    errorHandling: "Show 'No results found' message if empty, retry button on network error"
  },
  {
    id: "6",
    trigger: "User taps 'Save to Favorites'",
    condition: "User is authenticated",
    action: "Add to favorites, update UI state",
    category: "data",
    priority: "low",
    dataBinding: "POST /api/users/{userId}/favorites with listing ID"
  }
];

const defaultNavigationFlows: NavigationFlow[] = [
  {
    id: "nav1",
    fromScreen: "home",
    toScreen: "search",
    trigger: "User taps search bar",
    conditions: ["Always available"],
    animation: "slide_right",
    dataPassthrough: "Pre-fill search query if provided"
  },
  {
    id: "nav2",
    fromScreen: "search",
    toScreen: "listing-detail",
    trigger: "User taps resource card",
    conditions: ["Resource exists", "Not deleted"],
    animation: "slide_up",
    dataPassthrough: "Pass listing ID, mark as viewed"
  },
  {
    id: "nav3",
    fromScreen: "listing-detail",
    toScreen: "chat",
    trigger: "User taps 'Contact Owner'",
    conditions: ["User authenticated", "Owner is not current user"],
    animation: "modal_slide_up",
    dataPassthrough: "Pass listing context, owner ID"
  }
];

const defaultModalLogic: ModalLogic[] = [
  {
    id: "modal1",
    modalType: "Authentication",
    trigger: "User attempts protected action while unauthenticated",
    content: "Login/signup form with social auth options",
    actions: ["Login", "Sign up", "Continue with Google", "Cancel"],
    dismissConditions: ["Successful authentication", "User cancels", "Tap outside"]
  },
  {
    id: "modal2",
    modalType: "Confirmation",
    trigger: "User attempts to delete listing",
    content: "Are you sure you want to delete this listing?",
    actions: ["Delete", "Cancel"],
    dismissConditions: ["User confirms or cancels"]
  },
  {
    id: "modal3",
    modalType: "Filter Panel",
    trigger: "User taps filter button on search screen",
    content: "Price range, distance, category, condition filters",
    actions: ["Apply Filters", "Clear All", "Close"],
    dismissConditions: ["Apply filters", "Swipe down", "Tap outside"]
  }
];

const defaultBackendIntegrations: BackendIntegration[] = [
  {
    id: "api1",
    endpoint: "/api/listings",
    method: "GET",
    trigger: "Screen load, search, filter change",
    dataModel: "Listing[]",
    errorHandling: "Show retry button, cache last successful response",
    successAction: "Update listings grid, hide loading state"
  },
  {
    id: "api2",
    endpoint: "/api/listings",
    method: "POST",
    trigger: "User submits new listing form",
    dataModel: "CreateListingRequest",
    errorHandling: "Show validation errors inline, don't clear form",
    successAction: "Navigate to new listing detail, show success toast"
  },
  {
    id: "api3",
    endpoint: "/api/messages",
    method: "POST",
    trigger: "User sends message in chat",
    dataModel: "MessageRequest",
    errorHandling: "Show message as failed, allow retry",
    successAction: "Add message to chat, clear input field"
  }
];
const LogicFlow = () => {
  const [rules, setRules] = useState<LogicRule[]>(defaultRules);
  const [navigationFlows, setNavigationFlows] = useState<NavigationFlow[]>(defaultNavigationFlows);
  const [modalLogic, setModalLogic] = useState<ModalLogic[]>(defaultModalLogic);
  const [backendIntegrations, setBackendIntegrations] = useState<BackendIntegration[]>(defaultBackendIntegrations);
  const [newRule, setNewRule] = useState({
    trigger: "",
    condition: "",
    action: "",
    category: "navigation" as const,
    priority: "medium" as const,
    dataBinding: "",
    errorHandling: ""
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("rules");
  const [showFlowDiagram, setShowFlowDiagram] = useState(false);
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
    setNewRule({
      trigger: "",
      condition: "",
      action: "",
      category: "navigation",
      priority: "medium",
      dataBinding: "",
      errorHandling: ""
    });
    toast({
      title: "Logic Rule Added",
      description: "The new rule has been added to your app flow.",
    });
  };

  const generateFlowDiagram = (): string => {
    let mermaid = 'graph TD\n';

    // Add navigation flows
    navigationFlows.forEach(flow => {
      mermaid += `    ${flow.fromScreen}["${flow.fromScreen}"] -->|"${flow.trigger}"| ${flow.toScreen}["${flow.toScreen}"]\n`;
    });

    // Add conditional logic
    rules.filter(rule => rule.category === 'navigation').forEach(rule => {
      const ruleId = `rule_${rule.id}`;
      mermaid += `    ${ruleId}{"${rule.condition}"}\n`;
    });

    return mermaid;
  };

  const generateBackendFlowCode = (): string => {
    let code = '// Backend Integration Flow\n\n';

    backendIntegrations.forEach(integration => {
      code += `// ${integration.trigger}\n`;
      code += `async function handle${integration.endpoint.replace(/[^a-zA-Z]/g, '')}() {\n`;
      code += `  try {\n`;
      code += `    const response = await fetch('${integration.endpoint}', {\n`;
      code += `      method: '${integration.method}',\n`;
      code += `      headers: { 'Content-Type': 'application/json' },\n`;
      if (integration.method !== 'GET') {
        code += `      body: JSON.stringify(requestData)\n`;
      }
      code += `    });\n`;
      code += `    \n`;
      code += `    if (response.ok) {\n`;
      code += `      // ${integration.successAction}\n`;
      code += `      const data = await response.json();\n`;
      code += `      return data;\n`;
      code += `    } else {\n`;
      code += `      throw new Error('Request failed');\n`;
      code += `    }\n`;
      code += `  } catch (error) {\n`;
      code += `    // ${integration.errorHandling}\n`;
      code += `    console.error(error);\n`;
      code += `  }\n`;
      code += `}\n\n`;
    });

    return code;
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
      case 'modal': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      case 'backend': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
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
              Define comprehensive app logic, navigation flows, and backend integrations
            </p>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="rules" className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Logic Rules
              </TabsTrigger>
              <TabsTrigger value="navigation" className="flex items-center gap-2">
                <Route className="h-4 w-4" />
                Navigation
              </TabsTrigger>
              <TabsTrigger value="modals" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Modals
              </TabsTrigger>
              <TabsTrigger value="backend" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Backend
              </TabsTrigger>
            </TabsList>

            {/* Logic Rules Tab */}
            <TabsContent value="rules" className="space-y-6">
              {/* Add New Rule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add Logic Rule
                  </CardTitle>
                  <CardDescription>
                    Define conditional logic and user interaction flows
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Action (Then)</label>
                    <Input
                      placeholder="e.g., Show login modal"
                      value={newRule.action}
                      onChange={(e) => setNewRule({...newRule, action: e.target.value})}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select value={newRule.category} onValueChange={(value: any) => setNewRule({...newRule, category: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="navigation">Navigation</SelectItem>
                          <SelectItem value="auth">Authentication</SelectItem>
                          <SelectItem value="data">Data</SelectItem>
                          <SelectItem value="notification">Notification</SelectItem>
                          <SelectItem value="modal">Modal</SelectItem>
                          <SelectItem value="backend">Backend</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Priority</label>
                      <Select value={newRule.priority} onValueChange={(value: any) => setNewRule({...newRule, priority: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addRule} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Rule
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data Binding (Optional)</label>
                      <Textarea
                        placeholder="e.g., Pass user ID to next screen"
                        value={newRule.dataBinding}
                        onChange={(e) => setNewRule({...newRule, dataBinding: e.target.value})}
                        className="min-h-[60px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Error Handling (Optional)</label>
                      <Textarea
                        placeholder="e.g., Show error message and retry button"
                        value={newRule.errorHandling}
                        onChange={(e) => setNewRule({...newRule, errorHandling: e.target.value})}
                        className="min-h-[60px]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Filter and Rules List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Logic Rules ({filteredRules.length})</CardTitle>
                    <div className="flex items-center gap-2">
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="navigation">Navigation</SelectItem>
                          <SelectItem value="auth">Authentication</SelectItem>
                          <SelectItem value="data">Data</SelectItem>
                          <SelectItem value="notification">Notification</SelectItem>
                          <SelectItem value="modal">Modal</SelectItem>
                          <SelectItem value="backend">Backend</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredRules.map((rule) => {
                      const IconComponent = getCategoryIcon(rule.category);
                      return (
                        <div key={rule.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4 text-muted-foreground" />
                              <Badge className={getCategoryColor(rule.category)}>
                                {rule.category}
                              </Badge>
                              <Badge className={getPriorityColor(rule.priority)}>
                                {rule.priority}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeRule(rule.id)}
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="font-medium">When:</span> {rule.trigger}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">If:</span> {rule.condition}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Then:</span> {rule.action}
                            </div>
                            {rule.dataBinding && (
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Data:</span> {rule.dataBinding}
                              </div>
                            )}
                            {rule.errorHandling && (
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Error:</span> {rule.errorHandling}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Navigation Flows Tab */}
            <TabsContent value="navigation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Route className="h-5 w-5" />
                    Navigation Flows
                  </CardTitle>
                  <CardDescription>
                    Define screen-to-screen navigation patterns and data flow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {navigationFlows.map((flow) => (
                      <div key={flow.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{flow.fromScreen}</Badge>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline">{flow.toScreen}</Badge>
                          <Badge variant="secondary">{flow.animation}</Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Trigger:</span> {flow.trigger}</div>
                          <div><span className="font-medium">Conditions:</span> {flow.conditions.join(', ')}</div>
                          {flow.dataPassthrough && (
                            <div><span className="font-medium">Data:</span> {flow.dataPassthrough}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <Button
                      onClick={() => setShowFlowDiagram(!showFlowDiagram)}
                      variant="outline"
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {showFlowDiagram ? 'Hide' : 'Show'} Flow Diagram
                    </Button>

                    {showFlowDiagram && (
                      <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                        <div className="text-sm font-medium mb-2">Mermaid Flow Diagram:</div>
                        <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
                          {generateFlowDiagram()}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Modal Logic Tab */}
            <TabsContent value="modals" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Modal Logic
                  </CardTitle>
                  <CardDescription>
                    Define modal behaviors, triggers, and dismissal conditions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {modalLogic.map((modal) => (
                      <div key={modal.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                            {modal.modalType}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Trigger:</span> {modal.trigger}</div>
                          <div><span className="font-medium">Content:</span> {modal.content}</div>
                          <div><span className="font-medium">Actions:</span> {modal.actions.join(', ')}</div>
                          <div><span className="font-medium">Dismiss:</span> {modal.dismissConditions.join(', ')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Backend Integration Tab */}
            <TabsContent value="backend" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Backend Integrations
                  </CardTitle>
                  <CardDescription>
                    Define API calls, data models, and error handling strategies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {backendIntegrations.map((integration) => (
                      <div key={integration.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge className={`${integration.method === 'GET' ? 'bg-green-100 text-green-800' :
                                           integration.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                                           integration.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                                           'bg-red-100 text-red-800'}`}>
                            {integration.method}
                          </Badge>
                          <code className="text-sm bg-muted px-2 py-1 rounded">{integration.endpoint}</code>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Trigger:</span> {integration.trigger}</div>
                          <div><span className="font-medium">Data Model:</span> {integration.dataModel}</div>
                          <div><span className="font-medium">Success:</span> {integration.successAction}</div>
                          <div><span className="font-medium">Error:</span> {integration.errorHandling}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const code = generateBackendFlowCode();
                        navigator.clipboard.writeText(code);
                        toast({
                          title: "Code Copied",
                          description: "Backend integration code has been copied to clipboard.",
                        });
                      }}
                    >
                      <Code className="h-4 w-4 mr-2" />
                      Copy Backend Integration Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LogicFlow;