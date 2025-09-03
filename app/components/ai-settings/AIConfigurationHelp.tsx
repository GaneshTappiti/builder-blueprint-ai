"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  HelpCircle, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  XCircle,
  Settings,
  Key,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AIConfigurationHelp() {
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const copyEnvTemplate = () => {
    const envTemplate = `# AI Configuration
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here`;

    navigator.clipboard.writeText(envTemplate);
    toast({
      title: "Environment Template Copied",
      description: "Paste this into your .env.local file and add your API key",
    });
  };

  const quickSteps = [
    {
      step: 1,
      title: "Create .env.local file",
      description: "In your project root directory",
      action: copyEnvTemplate,
      actionText: "Copy Template"
    },
    {
      step: 2,
      title: "Get API Key",
      description: "From Google AI Studio",
      action: () => window.open('https://makersuite.google.com/app/apikey', '_blank'),
      actionText: "Get API Key"
    },
    {
      step: 3,
      title: "Add your key",
      description: "Replace placeholder with actual key",
      action: null,
      actionText: null
    },
    {
      step: 4,
      title: "Test configuration",
      description: "Run diagnostics to verify",
      action: () => window.open('/diagnostic', '_blank'),
      actionText: "Run Tests"
    }
  ];

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-900">AI Configuration Help</CardTitle>
          </div>
          <Badge variant="outline" className="border-blue-300 text-blue-700">
            Quick Fix
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Status Check */}
        <Alert className="border-blue-200 bg-blue-50">
          <Key className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center justify-between">
              <span className="font-medium">AI Configuration Status</span>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">Not Configured</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Quick Steps */}
        <div className="space-y-3">
          <h4 className="font-medium text-blue-900">Quick Setup Steps:</h4>
          {quickSteps.map((step) => (
            <div key={step.step} className="flex items-center gap-3 p-2 rounded-lg bg-white/50">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xs font-medium text-blue-700">{step.step}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-900">{step.title}</p>
                <p className="text-xs text-blue-600">{step.description}</p>
              </div>
              {step.action && (
                <Button
                  onClick={step.action}
                  size="sm"
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  {step.actionText}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => window.open('/diagnostic', '_blank')}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            Run Diagnostics
          </Button>
          <Button
            onClick={() => window.open('/settings', '_blank')}
            variant="outline"
            size="sm"
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Toggle Details */}
        <Button
          onClick={() => setShowDetails(!showDetails)}
          variant="ghost"
          size="sm"
          className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-100"
        >
          {showDetails ? 'Hide' : 'Show'} Detailed Instructions
        </Button>

        {/* Detailed Instructions */}
        {showDetails && (
          <div className="space-y-3 pt-3 border-t border-blue-200">
            <div className="text-sm text-blue-800">
              <h5 className="font-medium mb-2">Detailed Setup:</h5>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Create a <code className="bg-blue-100 px-1 rounded">.env.local</code> file in your project root</li>
                <li>Add <code className="bg-blue-100 px-1 rounded">GOOGLE_GEMINI_API_KEY=your_actual_key</code></li>
                <li>Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a></li>
                <li>Restart your development server</li>
                <li>Run diagnostics to verify the setup</li>
              </ol>
            </div>
            
            <div className="text-xs text-blue-600">
              <p className="font-medium mb-1">Need Help?</p>
              <p>Check the full setup guide or run the diagnostic tool for detailed error messages.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
