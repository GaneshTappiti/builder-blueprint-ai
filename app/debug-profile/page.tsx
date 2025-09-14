"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { ProfileService } from '@/services/profileService';
import { 
  Database, 
  User, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Settings
} from 'lucide-react';

export default function DebugProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDebug = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const info: any = {
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date().toISOString(),
      tests: []
    };

    try {
      // Test 1: Check if user_profiles table exists
      try {
        const { data: tableCheck, error: tableError } = await supabase
          .from('user_profiles')
          .select('id')
          .limit(1);
        
        info.tests.push({
          name: 'Table Exists Check',
          status: tableError ? 'error' : 'success',
          message: tableError ? `Error: ${tableError.message}` : 'user_profiles table exists',
          error: tableError
        });
      } catch (err) {
        info.tests.push({
          name: 'Table Exists Check',
          status: 'error',
          message: `Exception: ${err instanceof Error ? err.message : 'Unknown error'}`,
          error: err
        });
      }

      // Test 2: Try to get current profile
      try {
        const profile = await ProfileService.getCurrentProfile();
        info.tests.push({
          name: 'Get Current Profile',
          status: profile ? 'success' : 'warning',
          message: profile ? 'Profile found' : 'No profile found',
          data: profile
        });
        info.currentProfile = profile;
      } catch (err) {
        info.tests.push({
          name: 'Get Current Profile',
          status: 'error',
          message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
          error: err
        });
      }

      // Test 3: Try to create profile
      try {
        const created = await ProfileService.createProfile(user.id, {
          email: user.email,
          name: user.name || 'Test User',
          firstName: 'Test',
          lastName: 'User',
          bio: 'Test profile for debugging'
        });
        
        info.tests.push({
          name: 'Create Profile',
          status: created ? 'success' : 'error',
          message: created ? 'Profile created successfully' : 'Failed to create profile'
        });
      } catch (err) {
        info.tests.push({
          name: 'Create Profile',
          status: 'error',
          message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
          error: err
        });
      }

      // Test 4: Check profile creation status
      try {
        const status = await ProfileService.getProfileCreationStatus(user.id);
        info.tests.push({
          name: 'Profile Creation Status',
          status: 'success',
          message: `Status: ${status?.status}`,
          data: status
        });
      } catch (err) {
        info.tests.push({
          name: 'Profile Creation Status',
          status: 'error',
          message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
          error: err
        });
      }

      // Test 5: Check database connection
      try {
        const { data: connectionTest, error: connectionError } = await supabase
          .from('user_profiles')
          .select('count')
          .limit(1);
        
        info.tests.push({
          name: 'Database Connection',
          status: connectionError ? 'error' : 'success',
          message: connectionError ? `Connection error: ${connectionError.message}` : 'Database connection successful'
        });
      } catch (err) {
        info.tests.push({
          name: 'Database Connection',
          status: 'error',
          message: `Exception: ${err instanceof Error ? err.message : 'Unknown error'}`,
          error: err
        });
      }

    } catch (error) {
      info.tests.push({
        name: 'General Error',
        status: 'error',
        message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error
      });
    }

    setDebugInfo(info);
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      runDebug();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900/20">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
          <p className="text-gray-400">Please log in to debug the profile system.</p>
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
            <Settings className="h-8 w-8 text-green-400" />
            <h1 className="text-3xl font-bold text-white">Profile System Debug</h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Debug information for the profile system to identify issues.
          </p>
        </div>

        {/* Debug Controls */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="workspace-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="h-5 w-5" />
                Debug Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={runDebug} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Running Debug...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Run Debug Tests
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Debug Results */}
        {debugInfo && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* User Info */}
            <Card className="workspace-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">User ID:</span>
                    <span className="text-white font-mono">{debugInfo.userId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white">{debugInfo.userEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Timestamp:</span>
                    <span className="text-white">{debugInfo.timestamp}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Results */}
            <Card className="workspace-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Test Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {debugInfo.tests.map((test: any, index: number) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        test.status === 'success' ? 'bg-green-900/20 border border-green-500/30' :
                        test.status === 'warning' ? 'bg-yellow-900/20 border border-yellow-500/30' :
                        'bg-red-900/20 border border-red-500/30'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="text-white font-medium">{test.name}</div>
                        <div className="text-sm text-gray-400">{test.message}</div>
                        {test.error && (
                          <div className="text-xs text-red-400 mt-1">
                            {JSON.stringify(test.error, null, 2)}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className={
                        test.status === 'success' ? 'border-green-500 text-green-400' :
                        test.status === 'warning' ? 'border-yellow-500 text-yellow-400' :
                        'border-red-500 text-red-400'
                      }>
                        {test.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current Profile Data */}
            {debugInfo.currentProfile && (
              <Card className="workspace-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Current Profile Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs text-gray-300 bg-gray-900/50 p-4 rounded overflow-auto">
                    {JSON.stringify(debugInfo.currentProfile, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
