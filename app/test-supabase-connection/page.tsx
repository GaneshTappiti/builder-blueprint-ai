"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { 
  Database, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Settings,
  User
} from 'lucide-react';

export default function TestSupabaseConnectionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runConnectionTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    const tests = [];

    try {
      // Test 1: Basic connection test
      try {
        const { data, error } = await supabase
          .from('auth.users')
          .select('count')
          .limit(1);
        
        tests.push({
          name: 'Basic Connection',
          status: error ? 'error' : 'success',
          message: error ? `Connection failed: ${error.message}` : 'Connected to Supabase successfully',
          details: error
        });
      } catch (err) {
        tests.push({
          name: 'Basic Connection',
          status: 'error',
          message: `Exception: ${err.message}`,
          details: err
        });
      }

      // Test 2: Check if user_profiles table exists
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id')
          .limit(1);
        
        tests.push({
          name: 'User Profiles Table',
          status: error ? 'error' : 'success',
          message: error ? `Table doesn't exist: ${error.message}` : 'user_profiles table exists',
          details: error
        });
      } catch (err) {
        tests.push({
          name: 'User Profiles Table',
          status: 'error',
          message: `Exception: ${err.message}`,
          details: err
        });
      }

      // Test 3: Check if ideas table exists
      try {
        const { data, error } = await supabase
          .from('ideas')
          .select('id')
          .limit(1);
        
        tests.push({
          name: 'Ideas Table',
          status: error ? 'error' : 'success',
          message: error ? `Table doesn't exist: ${error.message}` : 'ideas table exists',
          details: error
        });
      } catch (err) {
        tests.push({
          name: 'Ideas Table',
          status: 'error',
          message: `Exception: ${err.message}`,
          details: err
        });
      }

      // Test 4: Check if projects table exists
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id')
          .limit(1);
        
        tests.push({
          name: 'Projects Table',
          status: error ? 'error' : 'success',
          message: error ? `Table doesn't exist: ${error.message}` : 'projects table exists',
          details: error
        });
      } catch (err) {
        tests.push({
          name: 'Projects Table',
          status: 'error',
          message: `Exception: ${err.message}`,
          details: err
        });
      }

      // Test 5: Check if tasks table exists
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('id')
          .limit(1);
        
        tests.push({
          name: 'Tasks Table',
          status: error ? 'error' : 'success',
          message: error ? `Table doesn't exist: ${error.message}` : 'tasks table exists',
          details: error
        });
      } catch (err) {
        tests.push({
          name: 'Tasks Table',
          status: 'error',
          message: `Exception: ${err.message}`,
          details: err
        });
      }

      // Test 6: Test authentication
      try {
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        
        tests.push({
          name: 'Authentication',
          status: authUser ? 'success' : 'warning',
          message: authUser ? `Authenticated as: ${authUser.email}` : 'Not authenticated',
          details: { user: authUser, error }
        });
      } catch (err) {
        tests.push({
          name: 'Authentication',
          status: 'error',
          message: `Exception: ${err.message}`,
          details: err
        });
      }

      // Test 7: Test profile creation (if user is authenticated)
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .insert([{
              id: user.id,
              email: user.email || 'test@example.com',
              name: user.name || 'Test User',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
            .select()
            .single();
          
          tests.push({
            name: 'Profile Creation Test',
            status: error ? 'warning' : 'success',
            message: error ? `Profile creation failed: ${error.message}` : 'Profile created successfully',
            details: { data, error }
          });
        } catch (err) {
          tests.push({
            name: 'Profile Creation Test',
            status: 'error',
            message: `Exception: ${err.message}`,
            details: err
          });
        }
      }

    } catch (error) {
      tests.push({
        name: 'General Error',
        status: 'error',
        message: `Unexpected error: ${error.message}`,
        details: error
      });
    }

    setTestResults(tests);
    setIsLoading(false);
  };

  useEffect(() => {
    runConnectionTests();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Database className="h-8 w-8 text-green-400" />
            <h1 className="text-3xl font-bold text-white">Supabase Connection Test</h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Test your Supabase connection and database setup.
          </p>
        </div>

        {/* Test Controls */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="workspace-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Connection Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={runConnectionTests} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Run Connection Tests
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <Card className="workspace-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Test Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testResults.map((test, index) => (
                    <div 
                      key={index} 
                      className={`flex items-start justify-between p-4 rounded-lg ${
                        test.status === 'success' ? 'bg-green-900/20 border border-green-500/30' :
                        test.status === 'warning' ? 'bg-yellow-900/20 border border-yellow-500/30' :
                        'bg-red-900/20 border border-red-500/30'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="text-white font-medium mb-1">{test.name}</div>
                        <div className="text-sm text-gray-300 mb-2">{test.message}</div>
                        {test.details && (
                          <details className="text-xs text-gray-400">
                            <summary className="cursor-pointer hover:text-gray-300">View Details</summary>
                            <pre className="mt-2 p-2 bg-gray-900/50 rounded overflow-auto">
                              {JSON.stringify(test.details, null, 2)}
                            </pre>
                          </details>
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
          </div>
        )}

        {/* User Info */}
        {user && (
          <div className="max-w-4xl mx-auto mt-8">
            <Card className="workspace-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Current User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">ID:</span>
                    <span className="text-white font-mono">{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white">{user.name || 'Not set'}</span>
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
