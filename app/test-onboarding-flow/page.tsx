"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, User, Clock, AlertTriangle } from 'lucide-react';

export default function TestOnboardingFlowPage() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, getProfileCompletion, isProfileComplete, updateProfile } = useProfile();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runOnboardingTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    addTestResult("🧪 Starting onboarding flow tests...");
    
    // Test 1: Check if user is authenticated
    if (!user) {
      addTestResult("❌ FAIL: User not authenticated");
      setIsRunningTests(false);
      return;
    }
    addTestResult("✅ PASS: User is authenticated");

    // Test 2: Check if profile exists
    if (!profile) {
      addTestResult("❌ FAIL: Profile not found");
      setIsRunningTests(false);
      return;
    }
    addTestResult("✅ PASS: Profile exists");

    // Test 3: Check current onboarding status
    const currentOnboardingStatus = profile.onboardingCompleted;
    addTestResult(`📊 Current onboarding status: ${currentOnboardingStatus ? 'COMPLETED' : 'NOT COMPLETED'}`);

    // Test 4: Check profile completion percentage
    const completionPercentage = getProfileCompletion();
    addTestResult(`📊 Profile completion: ${completionPercentage}%`);

    // Test 5: Check if profile is considered complete
    const isComplete = isProfileComplete();
    addTestResult(`📊 Profile is complete: ${isComplete ? 'YES' : 'NO'}`);

    // Test 6: Test setting onboarding to incomplete
    addTestResult("🔄 Testing: Setting onboarding to incomplete...");
    try {
      const success = await updateProfile({ onboardingCompleted: false });
      if (success) {
        addTestResult("✅ PASS: Successfully set onboarding to incomplete");
      } else {
        addTestResult("❌ FAIL: Failed to set onboarding to incomplete");
      }
    } catch (error) {
      addTestResult(`❌ FAIL: Error setting onboarding to incomplete: ${error}`);
    }

    // Wait a moment for the update to propagate
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 7: Test setting onboarding to complete
    addTestResult("🔄 Testing: Setting onboarding to complete...");
    try {
      const success = await updateProfile({ onboardingCompleted: true });
      if (success) {
        addTestResult("✅ PASS: Successfully set onboarding to complete");
      } else {
        addTestResult("❌ FAIL: Failed to set onboarding to complete");
      }
    } catch (error) {
      addTestResult(`❌ FAIL: Error setting onboarding to complete: ${error}`);
    }

    addTestResult("🎉 Onboarding flow tests completed!");
    setIsRunningTests(false);
  };

  const resetOnboarding = async () => {
    if (!profile) return;
    
    try {
      await updateProfile({ onboardingCompleted: false });
      addTestResult("🔄 Reset onboarding status to incomplete");
    } catch (error) {
      addTestResult(`❌ Error resetting onboarding: ${error}`);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900/20">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-2 border-green-400 border-t-transparent rounded-full"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const completionPercentage = getProfileCompletion();
  const isComplete = isProfileComplete();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900/20 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white mb-8">Onboarding Flow Test Suite</h1>
        
        {/* Current Status */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{completionPercentage}%</div>
                <div className="text-gray-400 text-sm">Profile Completion</div>
              </div>
              <div className="text-center">
                <Badge variant={profile?.onboardingCompleted ? "default" : "destructive"} className="text-lg px-4 py-2">
                  {profile?.onboardingCompleted ? 'COMPLETED' : 'INCOMPLETE'}
                </Badge>
                <div className="text-gray-400 text-sm mt-1">Onboarding Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{isComplete ? 'YES' : 'NO'}</div>
                <div className="text-gray-400 text-sm">Profile Complete</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Test Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={runOnboardingTests}
                disabled={isRunningTests}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isRunningTests ? 'Running Tests...' : 'Run Onboarding Tests'}
              </Button>
              <Button 
                onClick={resetOnboarding}
                variant="outline"
                className="border-orange-500 text-orange-400 hover:bg-orange-500/10"
              >
                Reset to Incomplete
              </Button>
              <Button 
                onClick={() => window.location.href = '/workspace'}
                className="bg-green-600 hover:bg-green-700"
              >
                Test Workspace Access
              </Button>
            </div>
            
            <div className="text-gray-400 text-sm">
              <p><strong>Test Instructions:</strong></p>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>Click "Run Onboarding Tests" to test the onboarding flow</li>
                <li>Click "Reset to Incomplete" to set onboarding as incomplete</li>
                <li>Click "Test Workspace Access" to see if you get redirected to profile setup</li>
                <li>Check the test results below for detailed feedback</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                No tests run yet. Click "Run Onboarding Tests" to start.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expected Behavior */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Expected Behavior
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-400 text-sm space-y-2">
              <p><strong>When onboarding is INCOMPLETE:</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>Accessing /workspace should redirect to /profile/setup</li>
                <li>ProfileCompletionGuard should block access</li>
                <li>isProfileComplete() should return false</li>
              </ul>
              
              <p className="mt-4"><strong>When onboarding is COMPLETED:</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>Accessing /workspace should work normally</li>
                <li>ProfileCompletionGuard should allow access</li>
                <li>isProfileComplete() should return true</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
