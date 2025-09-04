"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Menu,
  Shield,
  Bell,
  Globe,
  Lock,
  ChevronLeft,
  User,
  CreditCard,
  Settings as SettingsIcon,
  Crown,
  Zap,
  Palette,
  Eye,
  Smartphone,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function AccountSettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  // Profile data
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    bio: "Passionate entrepreneur building the next big thing in tech. Love solving problems and creating innovative solutions.",
    company: "StartWise",
    role: "Founder & CEO",
    website: "https://startwise.com",
    joinedDate: "January 2024"
  });

  // Subscription data
  const currentPlan = {
    name: "Pro Plan",
    price: 29,
    interval: "month",
    tier: "pro",
    features: [
      "Unlimited AI-generated ideas",
      "Advanced document templates", 
      "Priority support",
      "5 team members",
      "MVP Studio access"
    ]
  };

  const isFreeTier = false;
  const isOnTrial = false;
  const trialDaysRemaining = 0;


  // Appearance & Accessibility
  const [appearance, setAppearance] = useState({
    theme: "system",
    fontSize: "medium",
    highContrast: false,
    reducedMotion: false
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
    frequency: "real-time"
  });

  // Security
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    activeSessions: [
      { id: "1", device: "Chrome on Windows", location: "San Francisco, CA", lastActive: "2 hours ago" },
      { id: "2", device: "Safari on iPhone", location: "San Francisco, CA", lastActive: "1 day ago" }
    ]
  });

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Settings updated",
      description: "Your account settings have been successfully updated.",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleStartTrial = async () => {
    toast({
      title: "Trial Started!",
      description: "Your 7-day Pro trial has begun.",
    });
  };

  const handleCancelSubscription = async () => {
    toast({
      title: "Subscription Cancelled",
      description: "Your subscription will be cancelled at the end of the current period.",
    });
  };

  const handleSavePreferences = () => {
    toast({
      title: "Preferences Saved",
      description: "Your preferences have been updated.",
    });
  };

  const handleSignOut = () => {
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
  };

  return (
    <div className="dark min-h-screen bg-green-glass">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
      )}
      
      <div className={`fixed left-0 top-0 h-full transition-transform duration-300 z-50 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <WorkspaceSidebar />
      </div>

      <main className="flex-1 transition-all duration-300">
        <div className="flex flex-col w-full">
          {/* Enhanced Top Navigation Bar */}
          <div className="workspace-nav-enhanced">
            <div className="flex items-center justify-between w-full px-4 md:px-6 py-3 md:py-4">
              {/* Left Section - Hamburger & Back */}
              <div className="flex items-center gap-2 md:gap-4 flex-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-black/30"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>

                <Link
                  href="/workspace"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Workspace</span>
                </Link>
              </div>

              {/* Right Section - Title */}
              <div className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-gray-400" />
                <span className="text-white font-medium">Account Settings</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Account Settings</h1>
                <p className="text-gray-400">Manage your profile, preferences, and account settings in one place.</p>
              </div>
              <div className="flex items-center gap-3 mt-4 sm:mt-0">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="bg-red-600/20 border-red-500/30 text-red-400 hover:bg-red-600/30 hover:border-red-500/50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="workspace-button"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-green-600/20 border-green-500/30 text-green-400 hover:bg-green-600/30 hover:border-green-500/50"
                    variant="outline"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Settings
                  </Button>
                )}
              </div>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6 bg-black/20 border-white/10">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="billing" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Billing & Plans
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Privacy & Security
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-8">
                {/* Profile Header */}
                <Card className="workspace-card">
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                      <div className="relative">
                        <Avatar className="h-28 w-28">
                          <AvatarImage src="/placeholder-avatar.jpg" alt={profileData.name} />
                          <AvatarFallback className="bg-green-600 text-white text-2xl font-bold">
                            {profileData.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {isEditing && (
                          <Button
                            size="icon"
                            className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-green-600 hover:bg-green-500 shadow-lg"
                          >
                            <Camera className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <h2 className="text-3xl font-bold text-white">{profileData.name}</h2>
                          <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-500/30 w-fit">
                            {profileData.role}
                          </Badge>
                        </div>
                        <p className="text-lg text-gray-300">{profileData.email}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{profileData.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Joined {profileData.joinedDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Information */}
                <Card className="workspace-card">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-xl text-white">Personal Information</CardTitle>
                    <CardDescription className="text-gray-400">
                      Update your personal details and contact information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-white font-medium">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          disabled={!isEditing}
                          className="workspace-input"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-white font-medium">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          disabled={!isEditing}
                          className="workspace-input"
                          placeholder="Enter your email address"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="phone" className="text-white font-medium">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          disabled={!isEditing}
                          className="workspace-input"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="location" className="text-white font-medium">Location</Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                          disabled={!isEditing}
                          className="workspace-input"
                          placeholder="Enter your location"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="bio" className="text-white font-medium">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        disabled={!isEditing}
                        className="workspace-input min-h-[120px] resize-none"
                        placeholder="Tell us about yourself and your entrepreneurial journey..."
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Information */}
                <Card className="workspace-card">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-xl text-white">Professional Information</CardTitle>
                    <CardDescription className="text-gray-400">
                      Your work and business details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="company" className="text-white font-medium">Company</Label>
                        <Input
                          id="company"
                          value={profileData.company}
                          onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                          disabled={!isEditing}
                          className="workspace-input"
                          placeholder="Enter your company name"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="role" className="text-white font-medium">Role/Position</Label>
                        <Input
                          id="role"
                          value={profileData.role}
                          onChange={(e) => setProfileData({...profileData, role: e.target.value})}
                          disabled={!isEditing}
                          className="workspace-input"
                          placeholder="Enter your role or position"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="website" className="text-white font-medium">Website</Label>
                      <Input
                        id="website"
                        value={profileData.website}
                        onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                        disabled={!isEditing}
                        className="workspace-input"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Sign Out */}
                <Card className="workspace-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Sign Out</h3>
                        <p className="text-gray-400">Sign out of your account on this device</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleSignOut}
                        className="border-red-500/30 text-red-400 hover:bg-red-600/10 hover:border-red-500/50"
                      >
                        Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Billing & Plans Tab */}
              <TabsContent value="billing" className="space-y-6">
                <Card className="workspace-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Current Subscription
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {currentPlan?.name || 'Free Plan'}
                        </h3>
                        <p className="text-gray-400">
                          {currentPlan?.price === 0 
                            ? 'No cost' 
                            : `$${currentPlan?.price}/${currentPlan?.interval}`
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isOnTrial && (
                          <Badge className="bg-blue-600/20 text-blue-400">
                            Trial - {trialDaysRemaining} days left
                          </Badge>
                        )}
                        <Badge 
                          className={
                            isFreeTier 
                              ? 'bg-gray-600/20 text-gray-400' 
                              : 'bg-yellow-600/20 text-yellow-400'
                          }
                        >
                          {currentPlan?.tier || 'free'}
                        </Badge>
                      </div>
                    </div>

                    {currentPlan?.features && (
                      <div>
                        <h4 className="text-white font-medium mb-2">Features</h4>
                        <ul className="space-y-1">
                          {currentPlan.features.map((feature, index) => (
                            <li key={index} className="text-gray-300 text-sm flex items-center gap-2">
                              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-gray-700">
                      {isFreeTier && !isOnTrial && (
                        <Button
                          onClick={handleStartTrial}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Start Free Trial
                        </Button>
                      )}
                      
                      {isFreeTier && (
                        <Button
                          onClick={() => toast({ title: "Upgrade", description: "Payment integration coming soon!" })}
                          className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                        >
                          <Crown className="h-4 w-4 mr-2" />
                          Upgrade to Pro
                        </Button>
                      )}

                      {!isFreeTier && (
                        <Button
                          variant="outline"
                          onClick={handleCancelSubscription}
                          className="border-red-600 text-red-400 hover:bg-red-600/10"
                        >
                          Cancel Subscription
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>


              {/* Appearance & Accessibility Tab */}
              <TabsContent value="appearance" className="space-y-6">
                <Card className="workspace-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Appearance & Accessibility
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Customize your visual experience and accessibility settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-white font-medium">Theme</Label>
                      <Select 
                        value={appearance.theme} 
                        onValueChange={(value) => setAppearance({...appearance, theme: value})}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="workspace-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-white font-medium">Font Size</Label>
                      <Select 
                        value={appearance.fontSize} 
                        onValueChange={(value) => setAppearance({...appearance, fontSize: value})}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="workspace-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">High Contrast</Label>
                        <p className="text-gray-400 text-sm">Increase contrast for better visibility</p>
                      </div>
                      <Switch
                        checked={appearance.highContrast}
                        onCheckedChange={(checked) => setAppearance({...appearance, highContrast: checked})}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Reduced Motion</Label>
                        <p className="text-gray-400 text-sm">Minimize animations and transitions</p>
                      </div>
                      <Switch
                        checked={appearance.reducedMotion}
                        onCheckedChange={(checked) => setAppearance({...appearance, reducedMotion: checked})}
                        disabled={!isEditing}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6">
                <Card className="workspace-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Choose what notifications you want to receive and how often.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Email Notifications</Label>
                        <p className="text-gray-400 text-sm">Receive updates about your account and features</p>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Push Notifications</Label>
                        <p className="text-gray-400 text-sm">Get notified about important updates</p>
                      </div>
                      <Switch
                        checked={notifications.push}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Marketing Communications</Label>
                        <p className="text-gray-400 text-sm">Receive tips, tutorials, and product updates</p>
                      </div>
                      <Switch
                        checked={notifications.marketing}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked }))}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-white font-medium">Notification Frequency</Label>
                      <Select 
                        value={notifications.frequency} 
                        onValueChange={(value) => setNotifications({...notifications, frequency: value})}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="workspace-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="real-time">Real-time</SelectItem>
                          <SelectItem value="daily">Daily Digest</SelectItem>
                          <SelectItem value="weekly">Weekly Summary</SelectItem>
                          <SelectItem value="off">Off</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button className="w-full mt-6 workspace-button" onClick={handleSavePreferences}>
                      Save Preferences
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Privacy & Security Tab */}
              <TabsContent value="privacy" className="space-y-6">
                <Card className="workspace-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security Settings
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage your account security and authentication.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-black/20 rounded-xl border border-white/10 hover:border-green-500/30 transition-colors">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-white">Change Password</h4>
                        <p className="text-sm text-gray-400">Update your account password for better security</p>
                      </div>
                      <Button
                        variant="outline"
                        className="bg-green-600/20 border-green-500/30 text-green-400 hover:bg-green-600/30 hover:border-green-500/50"
                        disabled={!isEditing}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-black/20 rounded-xl border border-white/10 hover:border-green-500/30 transition-colors">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-white">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-400">
                          {security.twoFactorEnabled ? "Enabled" : "Add an extra layer of security to your account"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {security.twoFactorEnabled ? (
                          <Badge className="bg-green-600/20 text-green-400">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Enabled
                          </Badge>
                        ) : (
                          <Button
                            variant="outline"
                            className="bg-green-600/20 border-green-500/30 text-green-400 hover:bg-green-600/30 hover:border-green-500/50"
                            disabled={!isEditing}
                          >
                            <Smartphone className="h-4 w-4 mr-2" />
                            Enable 2FA
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="workspace-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Active Sessions
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage your active sessions across devices.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {security.activeSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 bg-black/10 rounded-lg border border-white/5">
                        <div className="space-y-1">
                          <p className="text-white font-medium">{session.device}</p>
                          <p className="text-gray-400 text-sm">{session.location}</p>
                          <p className="text-gray-500 text-xs">Last active: {session.lastActive}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-400 hover:bg-red-600/10 hover:border-red-500/50"
                          disabled={!isEditing}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="workspace-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Data & Privacy
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage your data and privacy settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-black/10 rounded-lg border border-white/5">
                      <div>
                        <h4 className="font-semibold text-white">Export Data</h4>
                        <p className="text-sm text-gray-400">Download a copy of your data</p>
                      </div>
                      <Button
                        variant="outline"
                        className="bg-blue-600/20 border-blue-500/30 text-blue-400 hover:bg-blue-600/30 hover:border-blue-500/50"
                        disabled={!isEditing}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black/10 rounded-lg border border-red-500/20">
                      <div>
                        <h4 className="font-semibold text-red-400">Delete Account</h4>
                        <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
                      </div>
                      <Button
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-600/10 hover:border-red-500/50"
                        disabled={!isEditing}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}