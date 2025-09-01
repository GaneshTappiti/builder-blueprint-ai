'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, CheckCircle, XCircle, Zap, Settings, Users, Database } from 'lucide-react';
import { RAGTool, MVPWizardData, AppType } from '@/types/ideaforge';
import { UniversalPromptTemplateService, DEFAULT_CONFIGS } from '@/services/universalPromptTemplate';
import { getAllRAGToolProfiles } from '@/services/ragToolProfiles';

/**
 * Universal Prompt Template Test Page
 * Tests the comprehensive app blueprint generation with different configurations
 */

export default function TestUniversalTemplatePage() {
  const [selectedTool, setSelectedTool] = useState<RAGTool>('lovable');
  const [appType, setAppType] = useState<AppType>('web-app');
  const [userIdea, setUserIdea] = useState('A comprehensive task management application with real-time collaboration, project tracking, team productivity analytics, automated workflow management, and AI-powered insights for optimizing team performance.');
  const [testPreset, setTestPreset] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ prompt: string; analysis: any } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Universal config state
  const [universalConfig, setUniversalConfig] = useState({
    includeErrorStates: true,
    includeBackendModels: true,
    includeUIComponents: true,
    includeModalsPopups: true,
    appDepth: 'advanced' as 'mvp' | 'advanced' | 'production',
    appType: 'web' as 'web' | 'mobile' | 'hybrid'
  });

  const availableTools = getAllRAGToolProfiles();

  // Complex app test presets
  const complexAppPresets = [
    {
      id: 'enterprise-pm',
      name: 'Enterprise Project Management',
      idea: 'A comprehensive enterprise project management platform with real-time collaboration, advanced analytics, resource allocation, time tracking, budget management, client portals, automated reporting, AI-powered insights, multi-tenant architecture, role-based permissions, integration with 20+ third-party tools, custom workflows, and advanced security features.',
      appType: 'saas-tool' as AppType,
      expectedScreens: '25+'
    },
    {
      id: 'healthcare-system',
      name: 'Healthcare Management System',
      idea: 'A complete healthcare management system for hospitals with patient records, appointment scheduling, doctor availability, medical history tracking, prescription management, billing integration, insurance processing, lab results, imaging integration, telemedicine capabilities, emergency protocols, staff scheduling, inventory management, and compliance reporting.',
      appType: 'web-app' as AppType,
      expectedScreens: '30+'
    },
    {
      id: 'elearning-ai',
      name: 'AI-Powered E-Learning Platform',
      idea: 'An advanced e-learning platform with AI-powered personalized learning paths, video streaming, interactive quizzes, progress tracking, peer collaboration, instructor tools, content creation suite, analytics dashboard, certification management, payment processing, mobile app, offline content, gamification, and social learning features.',
      appType: 'web-app' as AppType,
      expectedScreens: '22+'
    },
    {
      id: 'marketplace',
      name: 'Multi-Vendor E-commerce Marketplace',
      idea: 'A comprehensive multi-vendor e-commerce marketplace with vendor onboarding, product catalog management, inventory tracking, order processing, payment gateway integration, shipping management, customer reviews, analytics dashboard, dispute resolution, commission tracking, marketing tools, mobile apps, and advanced search with AI recommendations.',
      appType: 'web-app' as AppType,
      expectedScreens: '28+'
    },
    {
      id: 'smart-city',
      name: 'Smart City Management Platform',
      idea: 'A smart city management platform with IoT device monitoring, traffic management, utility tracking, citizen services portal, emergency response coordination, environmental monitoring, public transportation integration, budget allocation, permit processing, complaint management, data visualization, predictive analytics, and mobile citizen app.',
      appType: 'saas-tool' as AppType,
      expectedScreens: '35+'
    }
  ];

  // Sample wizard data for testing
  const sampleWizardData: MVPWizardData = {
    step1: {
      appName: 'TaskMaster Pro',
      appType: appType
    },
    step2: {
      theme: 'dark',
      designStyle: 'minimal',
      selectedTool: selectedTool
    },
    step3: {
      platforms: appType === 'mobile-app' ? ['ios', 'android'] : ['web']
    },
    step4: {
      selectedAI: 'gemini'
    },
    userPrompt: userIdea
  };

  const handleGeneratePrompt = async () => {
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const universalPrompt = UniversalPromptTemplateService.generateUniversalPrompt(
        userIdea,
        sampleWizardData,
        universalConfig,
        selectedTool
      );

      // Analyze the prompt for expected outcomes
      const analysis = analyzePrompt(universalPrompt, universalConfig);

      setResult({
        prompt: universalPrompt,
        analysis
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzePrompt = (prompt: string, config: any) => {
    const sections = prompt.split('##').length - 1;
    const hasScreensSection = prompt.includes('COMPREHENSIVE SCREENS LIST');
    const hasRolesSection = prompt.includes('USER ROLES');
    const hasModelsSection = prompt.includes('DATA MODELS');
    const hasStatesSection = prompt.includes('STATES');
    const hasModalsSection = prompt.includes('MODALS');

    // Estimate expected screens based on complexity
    const expectedScreens = config.appDepth === 'mvp' ? '10-15' :
                           config.appDepth === 'advanced' ? '15-25' : '25+';

    return {
      sections,
      hasScreensSection,
      hasRolesSection,
      hasModelsSection,
      hasStatesSection,
      hasModalsSection,
      expectedScreens,
      promptQuality: sections >= 6 ? 'High' : sections >= 4 ? 'Medium' : 'Low',
      comprehensiveness: [
        hasScreensSection && 'Screens',
        hasRolesSection && 'Roles',
        hasModelsSection && 'Models',
        hasStatesSection && 'States',
        hasModalsSection && 'Modals'
      ].filter(Boolean).join(', ')
    };
  };

  const handleTestPreset = (presetId: string) => {
    const preset = complexAppPresets.find(p => p.id === presetId);
    if (preset) {
      setUserIdea(preset.idea);
      setAppType(preset.appType);
      setTestPreset(presetId);
      // Set production config for complex apps
      setUniversalConfig(prev => ({
        ...prev,
        appDepth: 'production',
        includeErrorStates: true,
        includeBackendModels: true,
        includeUIComponents: true,
        includeModalsPopups: true
      }));
    }
  };

  const handleConfigPreset = (preset: 'mvp' | 'advanced' | 'production') => {
    const presetConfig = {
      mvp: {
        includeErrorStates: false,
        includeBackendModels: false,
        includeUIComponents: false,
        includeModalsPopups: false,
        appDepth: 'mvp' as const,
        appType: universalConfig.appType
      },
      advanced: {
        includeErrorStates: true,
        includeBackendModels: true,
        includeUIComponents: true,
        includeModalsPopups: true,
        appDepth: 'advanced' as const,
        appType: universalConfig.appType
      },
      production: {
        includeErrorStates: true,
        includeBackendModels: true,
        includeUIComponents: true,
        includeModalsPopups: true,
        appDepth: 'production' as const,
        appType: universalConfig.appType
      }
    };

    setUniversalConfig(presetConfig[preset]);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Universal Prompt Template Test</h1>
        <p className="text-muted-foreground">
          Test the comprehensive app blueprint generation that creates 15+ screens with user roles, data models, and edge cases
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* App Type */}
              <div>
                <Label className="text-sm font-medium mb-2 block">App Type</Label>
                <Select value={appType} onValueChange={(value: AppType) => setAppType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web-app">Web App</SelectItem>
                    <SelectItem value="mobile-app">Mobile App</SelectItem>
                    <SelectItem value="saas-tool">SaaS Tool</SelectItem>
                    <SelectItem value="ai-app">AI App</SelectItem>
                    <SelectItem value="chrome-extension">Chrome Extension</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tool Selection */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Development Tool</Label>
                <Select value={selectedTool} onValueChange={(value: RAGTool) => setSelectedTool(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTools.map((tool) => (
                      <SelectItem key={tool.id} value={tool.id}>
                        <div className="flex items-center gap-2">
                          <span>{tool.icon}</span>
                          <span>{tool.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Complex App Test Presets */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Complex App Test Presets</Label>
                <Select value={testPreset} onValueChange={handleTestPreset}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a complex app to test..." />
                  </SelectTrigger>
                  <SelectContent>
                    {complexAppPresets.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{preset.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {preset.appType.replace('-', ' ')} • Expected: {preset.expectedScreens} screens
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {testPreset && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                    <strong>Testing:</strong> {complexAppPresets.find(p => p.id === testPreset)?.name}
                  </div>
                )}
              </div>

              {/* Quick Config Presets */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Quick Config Presets</Label>
                <div className="flex gap-2">
                  <Button
                    variant={universalConfig.appDepth === 'mvp' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleConfigPreset('mvp')}
                  >
                    MVP
                  </Button>
                  <Button
                    variant={universalConfig.appDepth === 'advanced' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleConfigPreset('advanced')}
                  >
                    Advanced
                  </Button>
                  <Button
                    variant={universalConfig.appDepth === 'production' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleConfigPreset('production')}
                  >
                    Production
                  </Button>
                </div>
              </div>

              {/* Complexity Level */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Complexity Level</Label>
                <RadioGroup
                  value={universalConfig.appDepth}
                  onValueChange={(value: 'mvp' | 'advanced' | 'production') => 
                    setUniversalConfig(prev => ({ ...prev, appDepth: value }))
                  }
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mvp" id="mvp" />
                    <Label htmlFor="mvp" className="text-sm">MVP (10-15 screens)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="advanced" id="advanced" />
                    <Label htmlFor="advanced" className="text-sm">Advanced (15-25 screens)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="production" id="production" />
                    <Label htmlFor="production" className="text-sm">Production (25+ screens)</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Feature Checkboxes */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Include Features</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="error-states"
                      checked={universalConfig.includeErrorStates}
                      onCheckedChange={(checked) => 
                        setUniversalConfig(prev => ({ ...prev, includeErrorStates: !!checked }))
                      }
                    />
                    <Label htmlFor="error-states" className="text-sm">
                      Error/Loading/Empty States
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="backend-models"
                      checked={universalConfig.includeBackendModels}
                      onCheckedChange={(checked) => 
                        setUniversalConfig(prev => ({ ...prev, includeBackendModels: !!checked }))
                      }
                    />
                    <Label htmlFor="backend-models" className="text-sm">
                      Backend Data Models
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ui-components"
                      checked={universalConfig.includeUIComponents}
                      onCheckedChange={(checked) => 
                        setUniversalConfig(prev => ({ ...prev, includeUIComponents: !!checked }))
                      }
                    />
                    <Label htmlFor="ui-components" className="text-sm">
                      UI Component Library
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="modals-popups"
                      checked={universalConfig.includeModalsPopups}
                      onCheckedChange={(checked) => 
                        setUniversalConfig(prev => ({ ...prev, includeModalsPopups: !!checked }))
                      }
                    />
                    <Label htmlFor="modals-popups" className="text-sm">
                      Modals & Popups
                    </Label>
                  </div>
                </div>
              </div>

              {/* User Idea Input */}
              <div>
                <Label className="text-sm font-medium mb-2 block">App Idea</Label>
                <Textarea
                  value={userIdea}
                  onChange={(e) => setUserIdea(e.target.value)}
                  className="min-h-[120px]"
                  placeholder="Describe your app idea in detail..."
                />
              </div>

              <Button 
                onClick={handleGeneratePrompt} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Blueprint...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Generate Universal Prompt
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Generated Universal Prompt
                {result && (
                  <Badge variant="outline" className="text-xs">
                    {Math.round(result.length / 100) / 10}k chars
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium text-red-800">Error</p>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-green-800">Universal Prompt Generated</p>
                      <p className="text-sm text-green-600">
                        Comprehensive blueprint with {universalConfig.appDepth} complexity level
                      </p>
                    </div>
                  </div>

                  {/* Analysis Results */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Quality Analysis
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Sections:</strong> {result.analysis.sections}</p>
                        <p><strong>Quality:</strong> {result.analysis.promptQuality}</p>
                        <p><strong>Expected Screens:</strong> {result.analysis.expectedScreens}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Comprehensiveness
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Includes:</strong> {result.analysis.comprehensiveness}</p>
                        <p><strong>Screens Section:</strong> {result.analysis.hasScreensSection ? '✅' : '❌'}</p>
                        <p><strong>Roles Section:</strong> {result.analysis.hasRolesSection ? '✅' : '❌'}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Advanced Features
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Data Models:</strong> {result.analysis.hasModelsSection ? '✅' : '❌'}</p>
                        <p><strong>App States:</strong> {result.analysis.hasStatesSection ? '✅' : '❌'}</p>
                        <p><strong>Modals:</strong> {result.analysis.hasModalsSection ? '✅' : '❌'}</p>
                      </div>
                    </div>
                  </div>

                  <Textarea
                    value={result.prompt}
                    readOnly
                    className="min-h-[600px] font-mono text-sm"
                  />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(result.prompt)}
                    >
                      Copy Prompt
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setResult(null)}
                    >
                      Clear
                    </Button>
                    {testPreset && (
                      <Badge variant="outline" className="ml-auto">
                        Testing: {complexAppPresets.find(p => p.id === testPreset)?.name}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {!result && !error && !isGenerating && (
                <div className="text-center py-12 text-muted-foreground">
                  <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Ready to Generate</p>
                  <p>Configure your settings and click "Generate" to create a comprehensive app blueprint</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Configuration Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Current Configuration Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2">Basic Settings</h4>
              <div className="space-y-1 text-sm">
                <p><strong>App Type:</strong> {appType.replace('-', ' ')}</p>
                <p><strong>Tool:</strong> {availableTools.find(t => t.id === selectedTool)?.name}</p>
                <p><strong>Complexity:</strong> {universalConfig.appDepth}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Expected Output</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Screens:</strong> {
                  universalConfig.appDepth === 'mvp' ? '10-15' : 
                  universalConfig.appDepth === 'advanced' ? '15-25' : '25+'
                }</p>
                <p><strong>User Roles:</strong> 3-5 roles</p>
                <p><strong>Data Models:</strong> {universalConfig.includeBackendModels ? '5-10' : 'Basic'}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Features Included</h4>
              <div className="space-y-1 text-sm">
                <p>✅ Comprehensive screens</p>
                <p>{universalConfig.includeErrorStates ? '✅' : '❌'} Error/Loading states</p>
                <p>{universalConfig.includeBackendModels ? '✅' : '❌'} Backend models</p>
                <p>{universalConfig.includeUIComponents ? '✅' : '❌'} UI components</p>
                <p>{universalConfig.includeModalsPopups ? '✅' : '❌'} Modals & popups</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
