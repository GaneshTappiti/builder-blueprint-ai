"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  User, 
  Database,
  Settings,
  TestTube
} from 'lucide-react';
import { ProfileService } from '@/services/profileService';
import { profileIntegrationService } from '@/services/profileIntegrationService';

export default function TestProfileSystemPage() {
  const { user } = useAuth();
  const { profile, loading, error, profileCreationStatus, retryProfileCreation, validateProfileSync } = useProfile();
  const { toast } = useToast();
  
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const runTests = async () => {
    if (!user) return;
    
    setIsRunningTests(true);
    setTestResults([]);
    
    const tests = [
      {
        name: "Profile Service - Get Current Profile",
        test: async () => {
          const result = await ProfileService.getCurrentProfile();
          return result ? "✅ Profile loaded successfully" : "❌ Failed to load profile";
        }
      },
      {
        name: "Profile Service - Get Profile by ID",
        test: async () => {
          const result = await ProfileService.getProfile(user.id);
          return result ? "✅ Profile found by ID" : "❌ Profile not found by ID";
        }
      },
      {
        name: "Profile Service - Profile Creation Status",
        test: async () => {
          const result = await ProfileService.getProfileCreationStatus(user.id);
          return result ? `✅ Status: ${result.status}` : "❌ Failed to get status";
        }
      },
      {
        name: "Profile Service - Validate Sync",
        test: async () => {
          const result = await ProfileService.validateProfileSync(user.id);
          return result ? "✅ Profile sync is valid" : "❌ Profile sync is invalid";
        }
      },
      {
        name: "Profile Integration Service - Get Integration Data",
        test: async () => {
          const result = await profileIntegrationService.getProfileIntegrationData(user.id);
          return result.userProfile ? "✅ Integration data loaded" : "❌ Failed to load integration data";
        }
      },
      {
        name: "Profile Context - Profile State",
        test: async () => {
          return profile ? "✅ Profile context has data" : "❌ Profile context is empty";
        }
      },
      {
        name: "Profile Context - Loading State",
        test: async () => {
          return !loading ? "✅ Not loading" : "⏳ Still loading";
        }
      },
      {
        name: "Profile Context - Error State",
        test: async () => {
          return !error ? "✅ No errors" : `❌ Error: ${error}`;
        }
      }
    ];

    const results = [];
    for (const test of tests) {
      try {
        const result = await test.test();
        results.push({ name: test.name, result, status: 'success' });
      } catch (error) {
        results.push({ 
          name: test.name, 
          result: `❌ Test failed: ${error.message}`, 
          status: 'error' 
        });
      }
    }
    
    setTestResults(results);
    setIsRunningTests(false);
  };

  const testProfileCreation = async () => {
    if (!user) return;
    
    try {
      const success = await retryProfileCreation();
      toast({
        title: success ? "Profile Creation Test" : "Profile Creation Failed",
        description: success ? "Profile creation test passed!" : "Profile creation test failed",
        variant: success ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Profile Creation Error",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const testProfileSync = async () => {
    try {
      const isValid = await validateProfileSync();
      toast({
        title: "Profile Sync Test",
        description: isValid ? "Profile sync is valid!" : "Profile sync is invalid",
        variant: isValid ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Profile Sync Error",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      runTests();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900/20">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
          <p className="text-gray-400">Please log in to test the profile system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TestTube className="h-8 w-8 text-green-400" />
            <h1 className="text-3xl font-bold text-white">Profile System Test</h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Comprehensive testing of the profile system integration and functionality.
          </p>
        </div>

        {/* Current Status */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="workspace-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="h-5 w-5" />
                Current Profile Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {profile ? "✅" : "❌"}
                  </div>
                  <div className="text-sm text-gray-400">Profile Loaded</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {loading ? "⏳" : "✅"}
                  </div>
                  <div className="text-sm text-gray-400">Loading State</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {error ? "❌" : "✅"}
                  </div>
                  <div className="text-sm text-gray-400">Error State</div>
                </div>
              </div>
              
              {profileCreationStatus && (
                <div className="mt-4 text-center">
                  <Badge variant="outline" className={
                    profileCreationStatus === 'completed' ? 'border-green-500 text-green-400' :
                    profileCreationStatus === 'failed' ? 'border-red-500 text-red-400' :
                    'border-yellow-500 text-yellow-400'
                  }>
                    Creation Status: {profileCreationStatus}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Test Controls */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="workspace-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Test Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={runTests} 
                  disabled={isRunningTests}
                  className="flex-1 min-w-[200px]"
                >
                  {isRunningTests ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Run All Tests
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={testProfileCreation} 
                  variant="outline"
                  className="flex-1 min-w-[200px]"
                >
                  <User className="mr-2 h-4 w-4" />
                  Test Profile Creation
                </Button>
                
                <Button 
                  onClick={testProfileSync} 
                  variant="outline"
                  className="flex-1 min-w-[200px]"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Test Profile Sync
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        <div className="max-w-4xl mx-auto">
          <Card className="workspace-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No tests run yet. Click "Run All Tests" to start.</p>
              ) : (
                <div className="space-y-3">
                  {testResults.map((test, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        test.status === 'success' ? 'bg-green-900/20 border border-green-500/30' :
                        test.status === 'error' ? 'bg-red-900/20 border border-red-500/30' :
                        'bg-gray-900/20 border border-gray-500/30'
                      }`}
                    >
                      <span className="text-white font-medium">{test.name}</span>
                      <span className={`text-sm ${
                        test.status === 'success' ? 'text-green-400' :
                        test.status === 'error' ? 'text-red-400' :
                        'text-gray-400'
                      }`}>
                        {test.result}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Data Display */}
        {profile && (
          <div className="max-w-4xl mx-auto mt-8">
            <Card className="workspace-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Current Profile Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">ID:</span>
                    <span className="text-white font-mono">{profile.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white">{profile.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white">{profile.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Profile Completion:</span>
                    <span className="text-white">{profile.profileCompletion || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Onboarding Completed:</span>
                    <span className="text-white">{profile.onboardingCompleted ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Skills Count:</span>
                    <span className="text-white">{profile.skills?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Interests Count:</span>
                    <span className="text-white">{profile.interests?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
