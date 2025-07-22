import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, GitBranch, Database } from "lucide-react";

export const LogicFlow = () => {
  const flows = [
    {
      from: "Home",
      to: "Search",
      trigger: "Tap category or search icon",
      condition: "Always available"
    },
    {
      from: "Search",
      to: "Item Details",
      trigger: "Tap on book card",
      condition: "Item exists"
    },
    {
      from: "Item Details",
      to: "Chat",
      trigger: "Contact Seller button",
      condition: "User logged in"
    },
    {
      from: "Any Screen",
      to: "Login",
      trigger: "Protected action",
      condition: "User not authenticated"
    }
  ];

  const apiActions = [
    { screen: "Upload Item", action: "Create item in database", api: "POST /items" },
    { screen: "Chat", action: "Send message", api: "POST /messages" },
    { screen: "Profile", action: "Load user data", api: "GET /user/:id" },
    { screen: "Search", action: "Filter items", api: "GET /items?category=" }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Navigation & Logic Flow</h1>
        <p className="text-muted-foreground">
          Define how users move between screens and what happens on each interaction.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              Navigation Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {flows.map((flow, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-medium text-sm">{flow.from}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{flow.to}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {flow.trigger}
                  </div>
                  <div className="text-xs bg-muted px-2 py-1 rounded">
                    {flow.condition}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              API & Data Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {apiActions.map((action, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border border-border rounded-lg">
                  <div className="font-medium text-sm flex-1">
                    {action.screen}
                  </div>
                  <div className="text-sm text-muted-foreground flex-1">
                    {action.action}
                  </div>
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                    {action.api}
                  </code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline">
            Back to UI Prompts
          </Button>
          <Button>
            Generate Prompt Pack
          </Button>
        </div>
      </div>
    </div>
  );
};