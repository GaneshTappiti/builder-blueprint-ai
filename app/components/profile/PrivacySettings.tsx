"use client";

import React, { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { PrivacySettings as PrivacySettingsType } from '@/types/profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Users, 
  Lock, 
  Globe, 
  MessageSquare,
  Calendar,
  Activity,
  Settings,
  Save,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PrivacySettingsProps {
  className?: string;
}

export function PrivacySettings({ className = '' }: PrivacySettingsProps) {
  const { profile, updatePrivacySettings, loading } = useProfile();
  const { toast } = useToast();
  const [privacySettings, setPrivacySettings] = useState<PrivacySettingsType>(profile?.privacy || {
    profileVisibility: 'team',
    contactInfoVisibility: 'team',
    activityVisibility: 'team',
    skillsVisibility: 'team',
    availabilityVisibility: 'team',
    allowDirectMessages: true,
    allowMeetingInvites: true,
    showOnlineStatus: true,
    showLastActive: true
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (setting: keyof PrivacySettingsType, value: PrivacySettingsType[keyof PrivacySettingsType]) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await updatePrivacySettings(privacySettings);
      if (success) {
        toast({
          title: "Privacy Settings Updated",
          description: "Your privacy settings have been saved successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update privacy settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4 text-green-500" />;
      case 'team': return <Users className="h-4 w-4 text-blue-500" />;
      case 'private': return <Lock className="h-4 w-4 text-red-500" />;
      default: return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getVisibilityDescription = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'Visible to everyone';
      case 'team': return 'Visible to team members only';
      case 'private': return 'Visible to you only';
      default: return 'Not specified';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Loading privacy settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Shield className="h-6 w-6 mr-2" />
            Privacy Settings
          </h2>
          <p className="text-muted-foreground">
            Control who can see your information and how you can be contacted
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-1" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        {/* Profile Visibility Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Profile Visibility
              </CardTitle>
              <CardDescription>
                Control who can see your profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Profile Visibility */}
              <div className="space-y-2">
                <Label htmlFor="profileVisibility">Overall Profile Visibility</Label>
                <Select
                  value={privacySettings.profileVisibility}
                  onValueChange={(value) => handleSettingChange('profileVisibility', value as 'public' | 'team' | 'private')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4" />
                        <span>Public - Everyone can see your profile</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="team">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Team - Only team members can see your profile</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4" />
                        <span>Private - Only you can see your profile</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {getVisibilityDescription(privacySettings.profileVisibility)}
                </p>
              </div>

              {/* Skills Visibility */}
              <div className="space-y-2">
                <Label htmlFor="skillsVisibility">Skills & Expertise</Label>
                <Select
                  value={privacySettings.skillsVisibility}
                  onValueChange={(value) => handleSettingChange('skillsVisibility', value as 'public' | 'team' | 'private')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="team">Team Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Control who can see your skills, certifications, and expertise
                </p>
              </div>

              {/* Availability Visibility */}
              <div className="space-y-2">
                <Label htmlFor="availabilityVisibility">Availability Status</Label>
                <Select
                  value={privacySettings.availabilityVisibility}
                  onValueChange={(value) => handleSettingChange('availabilityVisibility', value as 'public' | 'team' | 'private')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="team">Team Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Control who can see your online status and availability
                </p>
              </div>

              {/* Online Status */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showOnlineStatus">Show Online Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Display when you're online, busy, or away
                  </p>
                </div>
                <Switch
                  id="showOnlineStatus"
                  checked={privacySettings.showOnlineStatus}
                  onCheckedChange={(checked) => handleSettingChange('showOnlineStatus', checked)}
                />
              </div>

              {/* Last Active */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showLastActive">Show Last Active Time</Label>
                  <p className="text-sm text-muted-foreground">
                    Display when you were last active on the platform
                  </p>
                </div>
                <Switch
                  id="showLastActive"
                  checked={privacySettings.showLastActive}
                  onCheckedChange={(checked) => handleSettingChange('showLastActive', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Information Tab */}
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
              <CardDescription>
                Control who can see your contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contact Info Visibility */}
              <div className="space-y-2">
                <Label htmlFor="contactInfoVisibility">Contact Information Visibility</Label>
                <Select
                  value={privacySettings.contactInfoVisibility}
                  onValueChange={(value) => handleSettingChange('contactInfoVisibility', value as 'public' | 'team' | 'private')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="team">Team Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Controls visibility of phone, email, and other contact information
                </p>
              </div>

              {/* Direct Messages */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowDirectMessages">Allow Direct Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Let team members send you direct messages
                  </p>
                </div>
                <Switch
                  id="allowDirectMessages"
                  checked={privacySettings.allowDirectMessages}
                  onCheckedChange={(checked) => handleSettingChange('allowDirectMessages', checked)}
                />
              </div>

              {/* Meeting Invites */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowMeetingInvites">Allow Meeting Invites</Label>
                  <p className="text-sm text-muted-foreground">
                    Let team members invite you to meetings
                  </p>
                </div>
                <Switch
                  id="allowMeetingInvites"
                  checked={privacySettings.allowMeetingInvites}
                  onCheckedChange={(checked) => handleSettingChange('allowMeetingInvites', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Activity Visibility
              </CardTitle>
              <CardDescription>
                Control who can see your activity and work history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Activity Visibility */}
              <div className="space-y-2">
                <Label htmlFor="activityVisibility">Activity Visibility</Label>
                <Select
                  value={privacySettings.activityVisibility}
                  onValueChange={(value) => handleSettingChange('activityVisibility', value as 'public' | 'team' | 'private')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="team">Team Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Controls visibility of your recent activity, tasks completed, and work history
                </p>
              </div>

              {/* Activity Privacy Notice */}
              <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Note:</p>
                  <p>
                    Some activity data may still be visible to administrators for team management purposes, 
                    regardless of your privacy settings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Communication Preferences
              </CardTitle>
              <CardDescription>
                Control how others can communicate with you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Communication Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowDirectMessages">Direct Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow team members to send you direct messages
                    </p>
                  </div>
                  <Switch
                    id="allowDirectMessages"
                    checked={privacySettings.allowDirectMessages}
                    onCheckedChange={(checked) => handleSettingChange('allowDirectMessages', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowMeetingInvites">Meeting Invites</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow team members to invite you to meetings
                    </p>
                  </div>
                  <Switch
                    id="allowMeetingInvites"
                    checked={privacySettings.allowMeetingInvites}
                    onCheckedChange={(checked) => handleSettingChange('allowMeetingInvites', checked)}
                  />
                </div>
              </div>

              {/* Privacy Summary */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Current Privacy Summary</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <div className="flex items-center space-x-2">
                    {getVisibilityIcon(privacySettings.profileVisibility)}
                    <span>Profile: {privacySettings.profileVisibility}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getVisibilityIcon(privacySettings.contactInfoVisibility)}
                    <span>Contact Info: {privacySettings.contactInfoVisibility}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getVisibilityIcon(privacySettings.activityVisibility)}
                    <span>Activity: {privacySettings.activityVisibility}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {privacySettings.allowDirectMessages ? (
                      <MessageSquare className="h-4 w-4 text-green-500" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-red-500" />
                    )}
                    <span>Direct Messages: {privacySettings.allowDirectMessages ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PrivacySettings;
