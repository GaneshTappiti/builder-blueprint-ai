"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Users, MessageSquare, Target } from "lucide-react";
import { useBuilder, builderActions } from "@/lib/builderContext";
import { useToast } from "@/hooks/use-toast";

const validationQuestions = [
  {
    id: 'hasValidated',
    question: 'Have you validated this idea?',
    description: 'Have you tested this concept with potential users, conducted surveys, or done market research?',
    icon: CheckCircle,
    examples: ['User interviews', 'Surveys', 'Landing page tests', 'Competitor analysis']
  },
  {
    id: 'hasDiscussed',
    question: 'Have you discussed this with others?',
    description: 'Have you shared this idea with friends, colleagues, mentors, or potential customers?',
    icon: MessageSquare,
    examples: ['Feedback from friends', 'Mentor advice', 'Industry expert opinions', 'Online community discussions']
  }
];

export function ValidationCard() {
  const { state, dispatch } = useBuilder();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCheckboxChange = (field: 'hasValidated' | 'hasDiscussed', checked: boolean) => {
    dispatch(builderActions.updateValidation({ [field]: checked }));
  };

  const generateBlueprint = async () => {
    // Validation
    if (!state.validationQuestions.motivation.trim()) {
      toast({
        title: "Motivation Required",
        description: "Please share what motivates you to build this app.",
        variant: "destructive"
      });
      return;
    }

    if (state.validationQuestions.motivation.trim().length < 30) {
      toast({
        title: "More Detail Needed",
        description: "Please provide more detail about your motivation (at least 30 characters).",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    dispatch(builderActions.setGenerating(true));
    dispatch(builderActions.setGenerationProgress(0));

    // Simulate blueprint generation with progress
    const progressSteps = [
      { progress: 20, delay: 800, message: "Analyzing your app concept..." },
      { progress: 40, delay: 1000, message: "Identifying core screens..." },
      { progress: 60, delay: 1200, message: "Mapping user journeys..." },
      { progress: 80, delay: 1000, message: "Defining data models..." },
      { progress: 100, delay: 800, message: "Finalizing blueprint..." }
    ];

    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      dispatch(builderActions.setGenerationProgress(step.progress));
    }

    // Generate mock blueprint based on the app idea
    const mockBlueprint = {
      screens: [
        {
          id: 'login',
          name: 'Login/Signup',
          purpose: 'User authentication and onboarding',
          components: ['Email input', 'Password input', 'Social login buttons', 'Forgot password link'],
          navigation: ['Dashboard', 'Onboarding']
        },
        {
          id: 'dashboard',
          name: 'Dashboard',
          purpose: 'Main hub showing overview and quick actions',
          components: ['Header with user info', 'Quick stats cards', 'Recent activity', 'Action buttons'],
          navigation: ['Profile', 'Main features', 'Settings']
        },
        {
          id: 'main-feature',
          name: getMainFeatureName(),
          purpose: 'Core functionality of the app',
          components: ['Feature interface', 'Action buttons', 'Data display', 'Navigation menu'],
          navigation: ['Dashboard', 'Details', 'Settings']
        },
        {
          id: 'profile',
          name: 'Profile',
          purpose: 'User profile management and settings',
          components: ['Profile picture', 'User info form', 'Preferences', 'Account settings'],
          navigation: ['Dashboard', 'Settings']
        }
      ],
      userRoles: getUserRoles(),
      navigationFlow: 'Login → Dashboard → Main Features → Profile/Settings',
      dataModels: getDataModels()
    };

    dispatch(builderActions.setAppBlueprint(mockBlueprint));
    dispatch(builderActions.setGenerating(false));
    dispatch(builderActions.setCurrentCard(3));
    setIsGenerating(false);

    toast({
      title: "Blueprint Generated!",
      description: "Your app structure is ready. Review the generated blueprint below.",
    });
  };

  const getMainFeatureName = () => {
    const idea = state.appIdea.ideaDescription.toLowerCase();
    if (idea.includes('habit') || idea.includes('track')) return 'Habit Tracker';
    if (idea.includes('task') || idea.includes('todo')) return 'Task Manager';
    if (idea.includes('social') || idea.includes('chat')) return 'Social Feed';
    if (idea.includes('shop') || idea.includes('store')) return 'Product Catalog';
    if (idea.includes('learn') || idea.includes('course')) return 'Learning Hub';
    return 'Main Feature';
  };

  const getUserRoles = () => {
    const idea = state.appIdea.ideaDescription.toLowerCase();
    const roles = ['User'];
    if (idea.includes('admin') || idea.includes('manage')) roles.push('Admin');
    if (idea.includes('teacher') || idea.includes('instructor')) roles.push('Instructor');
    if (idea.includes('business') || idea.includes('owner')) roles.push('Business Owner');
    return roles;
  };

  const getDataModels = () => {
    return [
      { name: 'User', fields: ['id', 'email', 'name', 'avatar', 'preferences'] },
      { name: 'Session', fields: ['id', 'userId', 'createdAt', 'expiresAt'] },
      { name: getMainFeatureName().replace(' ', ''), fields: ['id', 'userId', 'title', 'description', 'createdAt', 'updatedAt'] }
    ];
  };

  return (
    <div className="space-y-6">
      {/* Validation Questions */}
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold flex items-center justify-center gap-2 text-white">
            <Target className="h-5 w-5 text-blue-400" />
            Product Maturity Assessment
          </h3>
          <p className="text-sm text-gray-400">
            Help us understand where you are in your product journey
          </p>
        </div>

        {validationQuestions.map((q) => {
          const Icon = q.icon;
          const fieldName = q.id as 'hasValidated' | 'hasDiscussed';
          const isChecked = state.validationQuestions[fieldName];

          return (
            <Card key={q.id} className={`bg-black/40 backdrop-blur-sm border-white/10 transition-all duration-200 ${isChecked ? 'ring-1 ring-green-500/50 bg-green-500/10' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center space-x-2 mt-1">
                    <Checkbox
                      id={q.id}
                      checked={isChecked}
                      onCheckedChange={(checked) => handleCheckboxChange(fieldName, checked as boolean)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={q.id} className="flex items-center gap-2 cursor-pointer text-base font-medium text-white">
                      <Icon className="h-4 w-4 text-blue-400" />
                      {q.question}
                    </Label>
                    <p className="text-sm text-gray-400">
                      {q.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {q.examples.map((example, index) => (
                        <span key={index} className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded backdrop-blur-sm">
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Motivation */}
      <div className="space-y-2">
        <Label htmlFor="motivation" className="text-base font-medium flex items-center gap-2 text-white">
          <Users className="h-4 w-4 text-purple-400" />
          What motivates you to build this app? *
        </Label>
        <Textarea
          id="motivation"
          placeholder="Share your personal motivation, the problem you're solving, or the impact you want to make. For example: 'I struggled with habit tracking myself and existing apps are too complex. I want to create something simple that actually helps people build lasting habits...'"
          value={state.validationQuestions.motivation}
          onChange={(e) => dispatch(builderActions.updateValidation({ motivation: e.target.value }))}
          className="min-h-[100px] bg-black/40 backdrop-blur-sm border-white/10 text-white placeholder:text-gray-500"
        />
        <div className="text-xs text-gray-400">
          {state.validationQuestions.motivation.length}/30 characters minimum
        </div>
      </div>

      {/* Validation Summary */}
      {(state.validationQuestions.hasValidated || state.validationQuestions.hasDiscussed) && (
        <Card className="bg-green-500/10 backdrop-blur-sm border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-300">Great progress!</h4>
                <p className="text-sm text-gray-300">
                  {state.validationQuestions.hasValidated && state.validationQuestions.hasDiscussed
                    ? "You've both validated your idea and discussed it with others. This gives you a strong foundation for building."
                    : state.validationQuestions.hasValidated
                    ? "You've validated your idea, which is excellent. Consider discussing it with more people for additional insights."
                    : "You've discussed your idea with others, which is valuable. Consider doing some validation research to strengthen your concept."
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Blueprint Button */}
      <div className="flex justify-end pt-4">
        <Button 
          onClick={generateBlueprint}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          size="lg"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Generating Blueprint...
            </>
          ) : (
            <>
              Generate Blueprint
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
