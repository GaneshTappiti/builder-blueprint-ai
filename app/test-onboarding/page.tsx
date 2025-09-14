"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, User, Clock } from 'lucide-react';

export default function TestOnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, getProfileCompletion, isProfileComplete } = useProfile();

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900/20">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const completionPercentage = getProfileCompletion();
  const isComplete = isProfileComplete();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900/20 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white mb-8">Onboarding Test Page</h1>
        
        {/* Auth Status */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Authentication Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-green-400">User Authenticated</span>
                </div>
                <div className="text-gray-300 text-sm">
                  <div>ID: {user.id}</div>
                  <div>Email: {user.email}</div>
                  <div>Name: {user.name}</div>
                  <div>Created: {user.created_at ? new Date(user.created_at).toLocaleString() : 'Unknown'}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-red-400">Not Authenticated</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Status */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Profile Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {isComplete ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-orange-400" />
                  )}
                  <span className={isComplete ? "text-green-400" : "text-orange-400"}>
                    Profile {isComplete ? 'Complete' : 'Incomplete'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Profile ID:</div>
                    <div className="text-white font-mono text-xs">{profile.id}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Onboarding Completed:</div>
                    <Badge variant={profile.onboardingCompleted ? "default" : "destructive"}>
                      {profile.onboardingCompleted ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-gray-400">Completion %:</div>
                    <div className="text-white">{completionPercentage}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Profile Status:</div>
                    <Badge variant={profile.isActive ? "default" : "destructive"}>
                      {profile.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <div className="text-gray-300 text-sm">
                  <div><strong>First Name:</strong> {profile.firstName || 'Not set'}</div>
                  <div><strong>Last Name:</strong> {profile.lastName || 'Not set'}</div>
                  <div><strong>Display Name:</strong> {profile.displayName || 'Not set'}</div>
                  <div><strong>Bio:</strong> {profile.bio || 'Not set'}</div>
                  <div><strong>Job Title:</strong> {profile.jobTitle || 'Not set'}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-red-400">No Profile Found</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Test Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={() => window.location.href = '/profile/setup'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Go to Profile Setup
              </Button>
              <Button 
                onClick={() => window.location.href = '/workspace'}
                className="bg-green-600 hover:bg-green-700"
              >
                Go to Workspace
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Refresh Page
              </Button>
            </div>
            
            <div className="text-gray-400 text-sm">
              <p><strong>Expected Behavior:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>If profile is incomplete, you should be redirected to /profile/setup</li>
                <li>If profile is complete, you should be able to access /workspace</li>
                <li>Check the browser console for debug logs</li>
                <li><strong>Development mode bypass has been removed - onboarding always enforced</strong></li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
