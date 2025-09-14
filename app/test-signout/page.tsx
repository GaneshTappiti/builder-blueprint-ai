"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, User, LogOut } from 'lucide-react';

export default function TestSignOutPage() {
  const { user, signOut, loading } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testSignOut = async () => {
    setIsSigningOut(true);
    addTestResult("🧪 Starting sign out test...");
    
    try {
      addTestResult("🔓 Calling signOut() function...");
      await signOut();
      addTestResult("✅ Sign out completed successfully");
    } catch (error) {
      addTestResult(`❌ Sign out failed: ${error}`);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900/20 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white mb-8">Sign Out Test Page</h1>
        
        {/* Current Auth Status */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Current Authentication Status
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
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-red-400">Not Authenticated</span>
              </div>
            )}
            <div className="mt-4">
              <Badge variant={loading ? "default" : "outline"}>
                {loading ? 'Loading...' : 'Ready'}
              </Badge>
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
                onClick={testSignOut}
                disabled={isSigningOut || loading}
                className="bg-red-600 hover:bg-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isSigningOut ? 'Signing Out...' : 'Test Sign Out'}
              </Button>
              <Button 
                onClick={() => window.location.href = '/auth'}
                variant="outline"
                className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
              >
                Go to Auth Page
              </Button>
              <Button 
                onClick={() => window.location.href = '/workspace'}
                variant="outline"
                className="border-green-500 text-green-400 hover:bg-green-500/10"
              >
                Go to Workspace
              </Button>
            </div>
            
            <div className="text-gray-400 text-sm">
              <p><strong>Test Instructions:</strong></p>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>Click "Test Sign Out" to test the sign out functionality</li>
                <li>Check the test results below for detailed feedback</li>
                <li>After signing out, you should be redirected to the auth page</li>
                <li>Check the browser console for debug logs</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                No tests run yet. Click "Test Sign Out" to start.
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
            <CardTitle className="text-white">Expected Behavior</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-400 text-sm space-y-2">
              <p><strong>When you click "Test Sign Out":</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>Console should show: "🔓 AuthContext: Starting sign out process..."</li>
                <li>Console should show: "✅ AuthContext: Successfully signed out from Supabase"</li>
                <li>Console should show: "✅ AuthContext: User state cleared"</li>
                <li>Console should show: "🔄 AuthContext: Redirecting to auth page..."</li>
                <li>You should be redirected to the auth page</li>
                <li>User status should change to "Not Authenticated"</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
