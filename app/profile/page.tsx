"use client";

import React, { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  MapPin, 
  Briefcase, 
  Globe, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Edit,
  Target,
  Award,
  Users,
  Settings
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { profile, loading, error, profileCreationStatus, retryProfileCreation, validateProfileSync, clearError } = useProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetryProfileCreation = async () => {
    setIsRetrying(true);
    try {
      const success = await retryProfileCreation();
      if (success) {
        toast({
          title: "Success!",
          description: "Your profile has been created successfully.",
        });
      }
    } catch (error) {
      console.error('Error retrying profile creation:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleValidateSync = async () => {
    try {
      const isValid = await validateProfileSync();
      if (isValid) {
        toast({
          title: "Profile Sync Valid",
          description: "Your profile data is up to date.",
        });
      }
    } catch (error) {
      console.error('Error validating sync:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900/20">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-2 border-green-400 border-t-transparent rounded-full"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900/20">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Profile Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={handleRetryProfileCreation} disabled={isRetrying} className="w-full">
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Profile Creation
                </>
              )}
            </Button>
            <Button variant="outline" onClick={clearError} className="w-full">
              Clear Error
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900/20">
        <div className="max-w-md mx-auto text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Profile Found</h2>
          <p className="text-gray-400 mb-6">Your profile could not be loaded. This might be a temporary issue.</p>
          <div className="space-y-3">
            <Button onClick={handleRetryProfileCreation} disabled={isRetrying} className="w-full">
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Create Profile
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleValidateSync} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Validate Sync
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const profileCompletion = profile.profileCompletion || 0;
  const isComplete = profile.onboardingCompleted || profileCompletion >= 80;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <User className="h-8 w-8 text-green-400" />
            <h1 className="text-3xl font-bold text-white">Profile Dashboard</h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Manage your profile information and track your progress across all features.
          </p>
        </div>

        {/* Profile Status */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="workspace-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Profile Status
                </CardTitle>
                <Badge variant={isComplete ? "default" : "secondary"} className={isComplete ? "bg-green-600" : "bg-yellow-600"}>
                  {isComplete ? "Complete" : "Incomplete"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Profile Completion</span>
                    <span>{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="h-2" />
                </div>
                
                {profileCreationStatus && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Creation Status:</span>
                    <Badge variant="outline" className={
                      profileCreationStatus === 'completed' ? 'border-green-500 text-green-400' :
                      profileCreationStatus === 'failed' ? 'border-red-500 text-red-400' :
                      'border-yellow-500 text-yellow-400'
                    }>
                      {profileCreationStatus}
                    </Badge>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleValidateSync}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Validate Sync
                  </Button>
                  <Link href="/profile/setup">
                    <Button size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Information */}
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="professional">Professional</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="workspace-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">{profile.firstName} {profile.lastName}</span>
                    </div>
                    {profile.displayName && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-300">@{profile.displayName}</span>
                      </div>
                    )}
                    {profile.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-300">{profile.phone}</span>
                      </div>
                    )}
                    {profile.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-300">{profile.location}</span>
                      </div>
                    )}
                    {profile.timezone && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-300">{profile.timezone}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="workspace-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Online Presence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profile.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300">
                          {profile.website}
                        </a>
                      </div>
                    )}
                    {profile.linkedin && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300">
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                    {profile.github && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300">
                          GitHub Profile
                        </a>
                      </div>
                    )}
                    {profile.twitter && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300">
                          Twitter Profile
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {profile.bio && (
                <Card className="workspace-card">
                  <CardHeader>
                    <CardTitle className="text-white">Bio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">{profile.bio}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Professional Tab */}
            <TabsContent value="professional" className="space-y-6">
              <Card className="workspace-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.jobTitle && (
                    <div>
                      <label className="text-sm text-gray-400">Job Title</label>
                      <p className="text-white">{profile.jobTitle}</p>
                    </div>
                  )}
                  {profile.department && (
                    <div>
                      <label className="text-sm text-gray-400">Department</label>
                      <p className="text-white">{typeof profile.department === 'string' ? profile.department : profile.department.name}</p>
                    </div>
                  )}
                  {profile.workLocation && (
                    <div>
                      <label className="text-sm text-gray-400">Work Location</label>
                      <p className="text-white capitalize">{profile.workLocation}</p>
                    </div>
                  )}
                  {profile.status && (
                    <div>
                      <label className="text-sm text-gray-400">Status</label>
                      <Badge variant="outline" className="capitalize">
                        {profile.status}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-6">
              <Card className="workspace-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Skills & Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-600/20 text-green-400 border-green-500/30">
                          {typeof skill === 'string' ? skill : skill.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No skills added yet.</p>
                  )}
                </CardContent>
              </Card>

              {profile.interests && profile.interests.length > 0 && (
                <Card className="workspace-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Interests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, index) => (
                        <Badge key={index} variant="outline" className="border-blue-500/30 text-blue-400">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card className="workspace-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Activity & Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{profileCompletion}%</div>
                      <div className="text-sm text-gray-400">Profile Complete</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {profile.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : 'Never'}
                      </div>
                      <div className="text-sm text-gray-400">Last Login</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-400">Member Since</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
