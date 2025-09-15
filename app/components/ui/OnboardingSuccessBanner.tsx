"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, X, Sparkles, ArrowRight, Users, FileText, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingSuccessBannerProps {
  className?: string;
  onDismiss?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number; // in milliseconds
}

export function OnboardingSuccessBanner({ 
  className = '', 
  onDismiss,
  autoHide = true,
  autoHideDelay = 10000 
}: OnboardingSuccessBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if user just completed onboarding
    const showBanner = sessionStorage.getItem('showOnboardingSuccess');
    
    if (showBanner === 'true') {
      setIsVisible(true);
      setIsAnimating(true);
      
      // Remove the flag so it doesn't show again
      sessionStorage.removeItem('showOnboardingSuccess');
      
      // Auto-hide if enabled
      if (autoHide) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, autoHideDelay);
        
        return () => clearTimeout(timer);
      }
    }
    
    // Return cleanup function for all code paths
    return () => {};
  }, [autoHide, autoHideDelay]);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full mx-4",
      "transition-all duration-300 ease-in-out",
      isAnimating ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
      className
    )} data-testid="onboarding-success-banner">
      <Card className="bg-gradient-to-r from-green-900/90 via-green-800/90 to-emerald-900/90 border-green-400/30 shadow-2xl backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Success Icon */}
            <div className="flex-shrink-0">
              <div className="relative">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
                <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-white">
                  🎉 Profile Setup Complete!
                </h3>
              </div>
              
              <p className="text-gray-300 mb-4">
                Welcome to Builder Blueprint AI! Your profile is all set up and you now have access to all features.
              </p>
              
              {/* Feature highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="flex items-center gap-2 text-green-200">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Team Invitations</span>
                </div>
                <div className="flex items-center gap-2 text-green-200">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Idea Vault</span>
                </div>
                <div className="flex items-center gap-2 text-green-200">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">Project Tools</span>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700 text-white border-0"
                  onClick={() => window.location.href = '/workspace'}
                >
                  Explore Workspace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-green-400/30 text-green-200 hover:bg-green-800/20"
                  onClick={() => window.location.href = '/profile'}
                >
                  View Profile
                </Button>
              </div>
            </div>
            
            {/* Dismiss button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="flex-shrink-0 h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to trigger the banner
export function useOnboardingSuccessBanner() {
  const triggerBanner = () => {
    sessionStorage.setItem('showOnboardingSuccess', 'true');
  };

  return { triggerBanner };
}

export default OnboardingSuccessBanner;