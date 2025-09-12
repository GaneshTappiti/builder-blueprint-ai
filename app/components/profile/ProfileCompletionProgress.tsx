"use client";

import React from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface ProfileCompletionProgressProps {
  showDetails?: boolean;
  compact?: boolean;
  onComplete?: () => void;
}

export default function ProfileCompletionProgress({ 
  showDetails = false, 
  compact = false,
  onComplete 
}: ProfileCompletionProgressProps) {
  const { profile, getProfileCompletion, isProfileComplete } = useProfile();
  
  const completionPercentage = getProfileCompletion();
  const isComplete = isProfileComplete();

  if (isComplete) {
    return (
      <Card className="workspace-card border-green-500/30 bg-green-900/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="flex-1">
              <p className="text-green-400 font-medium">Profile Complete</p>
              <p className="text-gray-400 text-sm">All features unlocked</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-orange-900/10 border border-orange-500/30 rounded-lg">
        <User className="h-4 w-4 text-orange-400" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-orange-400 text-sm font-medium">Profile {completionPercentage}% Complete</span>
            <span className="text-gray-400 text-xs">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-1" />
        </div>
        <Button asChild size="sm" variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10">
          <Link href="/profile/setup">
            Complete
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Card className="workspace-card border-orange-500/30 bg-orange-900/10">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-orange-500/20 rounded-full">
            <User className="h-6 w-6 text-orange-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">Complete Your Profile</h3>
            <p className="text-gray-400 text-sm mb-4">
              Your profile is {completionPercentage}% complete. Complete your profile to unlock all features including team invitations, idea vault, and collaborative tools.
            </p>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Profile Completion</span>
                  <span className="text-orange-400 font-medium">{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
              
              {showDetails && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Required fields:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center gap-2 ${profile?.firstName ? 'text-green-400' : 'text-gray-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${profile?.firstName ? 'bg-green-400' : 'bg-gray-500'}`} />
                      First Name
                    </div>
                    <div className={`flex items-center gap-2 ${profile?.lastName ? 'text-green-400' : 'text-gray-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${profile?.lastName ? 'bg-green-400' : 'bg-gray-500'}`} />
                      Last Name
                    </div>
                    <div className={`flex items-center gap-2 ${profile?.bio ? 'text-green-400' : 'text-gray-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${profile?.bio ? 'bg-green-400' : 'bg-gray-500'}`} />
                      Bio
                    </div>
                    <div className={`flex items-center gap-2 ${profile?.jobTitle ? 'text-green-400' : 'text-gray-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${profile?.jobTitle ? 'bg-green-400' : 'bg-gray-500'}`} />
                      Job Title
                    </div>
                    <div className={`flex items-center gap-2 ${profile?.location ? 'text-green-400' : 'text-gray-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${profile?.location ? 'bg-green-400' : 'bg-gray-500'}`} />
                      Location
                    </div>
                    <div className={`flex items-center gap-2 ${profile?.timezone ? 'text-green-400' : 'text-gray-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${profile?.timezone ? 'bg-green-400' : 'bg-gray-500'}`} />
                      Timezone
                    </div>
                    <div className={`flex items-center gap-2 ${profile?.skills && profile.skills.length > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${profile?.skills && profile.skills.length > 0 ? 'bg-green-400' : 'bg-gray-500'}`} />
                      Skills
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button asChild className="workspace-button">
                  <Link href="/profile/setup">
                    <User className="mr-2 h-4 w-4" />
                    Complete Profile
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                
                {onComplete && (
                  <Button 
                    variant="outline" 
                    onClick={onComplete}
                    className="workspace-button-secondary"
                  >
                    Maybe Later
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
