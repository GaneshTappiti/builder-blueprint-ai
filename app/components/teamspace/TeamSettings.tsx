"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  Save, 
  Users, 
  Bell, 
  Clock, 
  Globe,
  Shield,
  Mail,
  Smartphone,
  Calendar,
  Target,
  AtSign
} from "lucide-react";
import { useTeamManagement } from '@/contexts/TeamManagementContext';
import { useTeamPermissions } from '@/hooks/useTeamPermissions';
import { useToast } from '@/hooks/use-toast';

interface TeamSettingsProps {
  className?: string;
}

const TeamSettings: React.FC<TeamSettingsProps> = ({ className }) => {
  const { 
    settings, 
    updateSettings,
    loading 
  } = useTeamManagement();
  
  const { canManageSettings } = useTeamPermissions();
  const { toast } = useToast();
  
  // State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    teamName: '',
    teamDescription: '',
    allowMemberInvites: false,
    allowSelfRegistration: false,
    requireApprovalForNewMembers: false,
    defaultRole: '',
    maxMembers: 50,
    isPublic: false,
    timezone: 'UTC',
    workingHours: {
      start: '09:00',
      end: '17:00',
      days: [1, 2, 3, 4, 5] // Monday to Friday
    },
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      meetingReminders: true,
      taskAssignments: true,
      mentions: true
    }
  });

  // Initialize form data when settings change
  React.useEffect(() => {
    if (settings) {
      setFormData({
        teamName: settings.teamName,
        teamDescription: settings.teamDescription,
        allowMemberInvites: settings.allowMemberInvites,
        allowSelfRegistration: settings.allowSelfRegistration,
        requireApprovalForNewMembers: settings.requireApprovalForNewMembers,
        defaultRole: settings.defaultRole,
        maxMembers: settings.maxMembers,
        isPublic: settings.isPublic,
        timezone: settings.timezone,
        workingHours: settings.workingHours,
        notificationSettings: settings.notificationSettings
      });
    }
  }, [settings]);

  // Handle save
  const handleSave = async () => {
    if (!settings) return;

    try {
      await updateSettings(formData);
      setIsEditing(false);
      toast({
        title: "Settings updated",
        description: "Team settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (settings) {
      setFormData({
        teamName: settings.teamName,
        teamDescription: settings.teamDescription,
        allowMemberInvites: settings.allowMemberInvites,
        allowSelfRegistration: settings.allowSelfRegistration,
        requireApprovalForNewMembers: settings.requireApprovalForNewMembers,
        defaultRole: settings.defaultRole,
        maxMembers: settings.maxMembers,
        isPublic: settings.isPublic,
        timezone: settings.timezone,
        workingHours: settings.workingHours,
        notificationSettings: settings.notificationSettings
      });
    }
    setIsEditing(false);
  };

  // Timezone options
  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Australia/Sydney'
  ];

  // Day options
  const dayOptions = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 0, label: 'Sunday' }
  ];

  if (!canManageSettings) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Access Denied</h3>
            <p className="text-gray-400">
              You don't have permission to manage team settings. Contact an administrator for access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Team Settings</h2>
          <p className="text-gray-400">Configure your team's settings and preferences</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
              <Settings className="h-4 w-4 mr-2" />
              Edit Settings
            </Button>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamName" className="text-white">Team Name *</Label>
            <Input
              id="teamName"
              value={formData.teamName}
              onChange={(e) => setFormData(prev => ({ ...prev, teamName: e.target.value }))}
              className="bg-black/20 border-white/10 text-white"
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamDescription" className="text-white">Team Description</Label>
            <Textarea
              id="teamDescription"
              value={formData.teamDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, teamDescription: e.target.value }))}
              className="bg-black/20 border-white/10 text-white"
              rows={3}
              disabled={!isEditing}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxMembers" className="text-white">Maximum Members</Label>
              <Input
                id="maxMembers"
                type="number"
                value={formData.maxMembers}
                onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) || 0 }))}
                className="bg-black/20 border-white/10 text-white"
                disabled={!isEditing}
                min="1"
                max="1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-white">Timezone</Label>
              <Select 
                value={formData.timezone} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
                disabled={!isEditing}
              >
                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10">
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz} className="text-white hover:bg-white/10">
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
              disabled={!isEditing}
            />
            <Label htmlFor="isPublic" className="text-white">
              Make team public (visible to everyone)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Member Management */}
      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5" />
            Member Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultRole" className="text-white">Default Role for New Members</Label>
            <Select 
              value={formData.defaultRole} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, defaultRole: value }))}
              disabled={!isEditing}
            >
              <SelectTrigger className="bg-black/20 border-white/10 text-white">
                <SelectValue placeholder="Select default role" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/10">
                <SelectItem value="member" className="text-white hover:bg-white/10">Member</SelectItem>
                <SelectItem value="viewer" className="text-white hover:bg-white/10">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="allowMemberInvites"
                checked={formData.allowMemberInvites}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowMemberInvites: checked }))}
                disabled={!isEditing}
              />
              <Label htmlFor="allowMemberInvites" className="text-white">
                Allow members to invite others
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="allowSelfRegistration"
                checked={formData.allowSelfRegistration}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowSelfRegistration: checked }))}
                disabled={!isEditing}
              />
              <Label htmlFor="allowSelfRegistration" className="text-white">
                Allow self-registration
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="requireApprovalForNewMembers"
                checked={formData.requireApprovalForNewMembers}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requireApprovalForNewMembers: checked }))}
                disabled={!isEditing}
              />
              <Label htmlFor="requireApprovalForNewMembers" className="text-white">
                Require approval for new members
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Clock className="h-5 w-5" />
            Working Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-white">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.workingHours.start}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  workingHours: { ...prev.workingHours, start: e.target.value }
                }))}
                className="bg-black/20 border-white/10 text-white"
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-white">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.workingHours.end}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  workingHours: { ...prev.workingHours, end: e.target.value }
                }))}
                className="bg-black/20 border-white/10 text-white"
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Working Days</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {dayOptions.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Switch
                    id={`day-${day.value}`}
                    checked={formData.workingHours.days.includes(day.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData(prev => ({
                          ...prev,
                          workingHours: {
                            ...prev.workingHours,
                            days: [...prev.workingHours.days, day.value]
                          }
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          workingHours: {
                            ...prev.workingHours,
                            days: prev.workingHours.days.filter(d => d !== day.value)
                          }
                        }));
                      }
                    }}
                    disabled={!isEditing}
                  />
                  <Label htmlFor={`day-${day.value}`} className="text-white text-sm">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="emailNotifications"
                checked={formData.notificationSettings.emailNotifications}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  notificationSettings: { ...prev.notificationSettings, emailNotifications: checked }
                }))}
                disabled={!isEditing}
              />
              <Label htmlFor="emailNotifications" className="text-white flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email notifications
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="pushNotifications"
                checked={formData.notificationSettings.pushNotifications}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  notificationSettings: { ...prev.notificationSettings, pushNotifications: checked }
                }))}
                disabled={!isEditing}
              />
              <Label htmlFor="pushNotifications" className="text-white flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Push notifications
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="meetingReminders"
                checked={formData.notificationSettings.meetingReminders}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  notificationSettings: { ...prev.notificationSettings, meetingReminders: checked }
                }))}
                disabled={!isEditing}
              />
              <Label htmlFor="meetingReminders" className="text-white flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Meeting reminders
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="taskAssignments"
                checked={formData.notificationSettings.taskAssignments}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  notificationSettings: { ...prev.notificationSettings, taskAssignments: checked }
                }))}
                disabled={!isEditing}
              />
              <Label htmlFor="taskAssignments" className="text-white flex items-center gap-2">
                <Target className="h-4 w-4" />
                Task assignments
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="mentions"
                checked={formData.notificationSettings.mentions}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  notificationSettings: { ...prev.notificationSettings, mentions: checked }
                }))}
                disabled={!isEditing}
              />
              <Label htmlFor="mentions" className="text-white flex items-center gap-2">
                <AtSign className="h-4 w-4" />
                Mentions
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-red-500/10 border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <Shield className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <h4 className="text-red-400 font-semibold mb-2">Delete Team</h4>
            <p className="text-red-300 text-sm mb-3">
              Permanently delete this team and all its data. This action cannot be undone.
            </p>
            <Button 
              variant="destructive" 
              className="bg-red-600 hover:bg-red-700"
              disabled={!isEditing}
            >
              Delete Team
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamSettings;
