"use client";

import { useState, useEffect } from "react";
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
import { useProfile } from "@/contexts/ProfileContext";
import { useAuth } from "@/contexts/AuthContext";
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
  Eye,
  Smartphone,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Award,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Users,
  Lightbulb,
  CheckSquare,
  Star,
  Brain,
  Heart,
  Trophy,
  Medal,
  Flame,
  Filter,
  MoreHorizontal,
  EyeOff,
  Building,
  Info,
  PieChart
} from "lucide-react";

export default function AccountSettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    profile, 
    loading, 
    error, 
    updateProfile, 
    updatePreferences, 
    updatePrivacySettings,
    exportProfileData,
    deleteProfile
  } = useProfile();

  // Local form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    jobTitle: "",
    website: "",
    firstName: "",
    lastName: "",
    skills: [] as string[],
    interests: [] as string[],
    linkedin: "",
    twitter: "",
    github: "",
    portfolio: "",
    isPublic: false,
    showContact: false,
    showSocial: false
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        location: profile.location || "",
        bio: profile.bio || "",
        jobTitle: profile.jobTitle || "",
        website: profile.website || "",
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        skills: profile.skills?.map(skill => skill.name) || [],
        interests: profile.interests || [],
        linkedin: profile.linkedin || "",
        twitter: profile.twitter || "",
        github: profile.github || "",
        portfolio: profile.website || "",
        isPublic: profile.privacy?.profileVisibility === 'public' || false,
        showContact: profile.privacy?.contactInfoVisibility === 'public' || false,
        showSocial: profile.privacy?.activityVisibility === 'public' || false
      });
    }
  }, [profile]);

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

  const handleSave = async () => {
    if (!profile) return;
    
    try {
      const success = await updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        jobTitle: formData.jobTitle,
        website: formData.website,
        firstName: formData.firstName,
        lastName: formData.lastName,
        skills: formData.skills.map(skillName => ({
          id: crypto.randomUUID(),
          name: skillName,
          category: 'technical' as const,
          level: 'intermediate' as const,
          verified: false,
          endorsements: 0,
          endorsers: [],
          isPublic: true
        })),
        interests: formData.interests,
        linkedin: formData.linkedin,
        twitter: formData.twitter,
        github: formData.github,
        privacy: {
          profileVisibility: formData.isPublic ? 'public' : 'team',
          contactInfoVisibility: formData.showContact ? 'public' : 'team',
          activityVisibility: formData.showSocial ? 'public' : 'team',
          skillsVisibility: 'team',
          availabilityVisibility: 'team',
          allowDirectMessages: true,
          allowMeetingInvites: true,
          showOnlineStatus: true,
          showLastActive: true
        }
      });

      if (success) {
        setIsEditing(false);
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    // Reset form data to current profile data
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        location: profile.location || "",
        bio: profile.bio || "",
        jobTitle: profile.jobTitle || "",
        website: profile.website || "",
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        skills: profile.skills?.map(skill => skill.name) || [],
        interests: profile.interests || [],
        linkedin: profile.linkedin || "",
        twitter: profile.twitter || "",
        github: profile.github || "",
        portfolio: profile.website || "",
        isPublic: profile.privacy?.profileVisibility === 'public' || false,
        showContact: profile.privacy?.contactInfoVisibility === 'public' || false,
        showSocial: profile.privacy?.activityVisibility === 'public' || false
      });
    }
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

  const handleExportData = async () => {
    try {
      const exportData = await exportProfileData();
      if (exportData) {
        // Create and download the file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `profile-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export profile data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        const success = await deleteProfile("User requested account deletion");
        if (success) {
          toast({
            title: "Account Deletion Requested",
            description: "Your account has been scheduled for deletion.",
          });
        }
      } catch (error) {
        toast({
          title: "Deletion Failed",
          description: "Failed to delete account. Please try again.",
          variant: "destructive"
        });
      }
    }
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
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading your profile...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="text-red-400">{error}</p>
                </div>
              </div>
            )}

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
              <TabsList className="grid w-full grid-cols-7 bg-black/20 border-white/10">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="gamification" className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Achievements
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="billing" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Billing
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Privacy
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
                          <AvatarImage src={profile?.avatar_url || "/placeholder-avatar.jpg"} alt={profile?.name || "User"} />
                          <AvatarFallback className="bg-green-600 text-white text-2xl font-bold">
                            {profile?.name ? profile.name.split(' ').map(n => n[0]).join('') : "U"}
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
                          <h2 className="text-3xl font-bold text-white">{profile?.name || "Loading..."}</h2>
                          {profile?.jobTitle && (
                            <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-500/30 w-fit">
                              {profile.jobTitle}
                            </Badge>
                          )}
                        </div>
                        <p className="text-lg text-gray-300">{profile?.email || "Loading..."}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-400">
                          {profile?.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{profile.location}</span>
                            </div>
                          )}
                          {profile?.created_at && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                            </div>
                          )}
                        </div>
                        {profile?.profileCompletion !== undefined && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-400">Profile Completion</span>
                              <span className="text-sm text-green-400">{profile.profileCompletion}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${profile.profileCompletion}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
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
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          disabled={!isEditing}
                          className="workspace-input"
                          placeholder="Enter your email address"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="phone" className="text-white font-medium">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          disabled={!isEditing}
                          className="workspace-input"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="location" className="text-white font-medium">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
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
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
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
                        <Label htmlFor="jobTitle" className="text-white font-medium">Job Title</Label>
                        <Input
                          id="jobTitle"
                          value={formData.jobTitle}
                          onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                          disabled={!isEditing}
                          className="workspace-input"
                          placeholder="Enter your job title"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="website" className="text-white font-medium">Website</Label>
                        <Input
                          id="website"
                          value={formData.website}
                          onChange={(e) => setFormData({...formData, website: e.target.value})}
                          disabled={!isEditing}
                          className="workspace-input"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Skills & Interests */}
                <Card className="workspace-card">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-xl text-white">Skills & Interests</CardTitle>
                    <CardDescription className="text-gray-400">
                      Showcase your expertise and interests to connect with like-minded entrepreneurs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="skills" className="text-white font-medium">Skills</Label>
                      <Input
                        id="skills"
                        value={Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills}
                        onChange={(e) => setFormData({...formData, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                        disabled={!isEditing}
                        className="workspace-input"
                        placeholder="e.g., Product Management, Marketing, Development, Design"
                      />
                      <p className="text-sm text-gray-400">Separate multiple skills with commas</p>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="interests" className="text-white font-medium">Interests</Label>
                      <Input
                        id="interests"
                        value={Array.isArray(formData.interests) ? formData.interests.join(', ') : formData.interests}
                        onChange={(e) => setFormData({...formData, interests: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                        disabled={!isEditing}
                        className="workspace-input"
                        placeholder="e.g., AI, Fintech, Sustainability, E-commerce"
                      />
                      <p className="text-sm text-gray-400">What industries or topics interest you most?</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Social Links */}
                <Card className="workspace-card">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-xl text-white">Social Links</CardTitle>
                    <CardDescription className="text-gray-400">
                      Connect your social profiles and professional networks.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="linkedin" className="text-white font-medium">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          value={formData.linkedin || ""}
                          onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                          disabled={!isEditing}
                          className="workspace-input"
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="twitter" className="text-white font-medium">Twitter/X</Label>
                        <Input
                          id="twitter"
                          value={formData.twitter || ""}
                          onChange={(e) => setFormData({...formData, twitter: e.target.value})}
                          disabled={!isEditing}
                          className="workspace-input"
                          placeholder="https://twitter.com/yourhandle"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="github" className="text-white font-medium">GitHub</Label>
                        <Input
                          id="github"
                          value={formData.github || ""}
                          onChange={(e) => setFormData({...formData, github: e.target.value})}
                          disabled={!isEditing}
                          className="workspace-input"
                          placeholder="https://github.com/yourusername"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="portfolio" className="text-white font-medium">Portfolio</Label>
                        <Input
                          id="portfolio"
                          value={formData.portfolio || ""}
                          onChange={(e) => setFormData({...formData, portfolio: e.target.value})}
                          disabled={!isEditing}
                          className="workspace-input"
                          placeholder="https://yourportfolio.com"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Visibility */}
                <Card className="workspace-card">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-xl text-white">Profile Visibility</CardTitle>
                    <CardDescription className="text-gray-400">
                      Control who can see your profile information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Public Profile</Label>
                        <p className="text-gray-400 text-sm">Allow others to view your profile</p>
                      </div>
                      <Switch
                        checked={formData.isPublic || false}
                        onCheckedChange={(checked) => setFormData({...formData, isPublic: checked})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Show Contact Information</Label>
                        <p className="text-gray-400 text-sm">Display email and phone in public profile</p>
                      </div>
                      <Switch
                        checked={formData.showContact || false}
                        onCheckedChange={(checked) => setFormData({...formData, showContact: checked})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Show Social Links</Label>
                        <p className="text-gray-400 text-sm">Display social media and professional links</p>
                      </div>
                      <Switch
                        checked={formData.showSocial || false}
                        onCheckedChange={(checked) => setFormData({...formData, showSocial: checked})}
                        disabled={!isEditing}
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

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                {/* Performance Overview */}
                <Card className="workspace-card">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Performance Analytics
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Track your productivity, collaboration, and growth metrics.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Performance Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Productivity Score</span>
                          <TrendingUp className="h-4 w-4 text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">85</div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Collaboration</span>
                          <Activity className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">78</div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Innovation</span>
                          <Lightbulb className="h-4 w-4 text-purple-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">92</div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Productivity Insights</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Tasks Completed</span>
                            <span className="font-medium text-white">42</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Ideas Submitted</span>
                            <span className="font-medium text-white">12</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Projects Involved</span>
                            <span className="font-medium text-white">8</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Peak Hours</span>
                            <span className="font-medium text-white">9-11 AM, 2-4 PM</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Collaboration Metrics</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Team Interactions</span>
                            <span className="font-medium text-white">156</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Cross-Department Work</span>
                            <span className="font-medium text-white">23</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Mentoring Sessions</span>
                            <span className="font-medium text-white">8</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Feedback Given</span>
                            <span className="font-medium text-white">45</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Team Rankings */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white">Team Rankings</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-black/20 rounded-lg border border-white/10">
                          <div className="text-2xl font-bold text-green-400">#3</div>
                          <div className="text-sm text-gray-400">Overall</div>
                          <div className="text-xs text-gray-500">of 12 members</div>
                        </div>
                        <div className="text-center p-4 bg-black/20 rounded-lg border border-white/10">
                          <div className="text-2xl font-bold text-blue-400">#2</div>
                          <div className="text-sm text-gray-400">Productivity</div>
                        </div>
                        <div className="text-center p-4 bg-black/20 rounded-lg border border-white/10">
                          <div className="text-2xl font-bold text-purple-400">#1</div>
                          <div className="text-sm text-gray-400">Innovation</div>
                        </div>
                        <div className="text-center p-4 bg-black/20 rounded-lg border border-white/10">
                          <div className="text-2xl font-bold text-yellow-400">#5</div>
                          <div className="text-sm text-gray-400">Leadership</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="workspace-card">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Personalized Recommendations
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      AI-powered suggestions to help you grow and improve.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h5 className="font-semibold text-white flex items-center gap-2">
                          <Brain className="h-4 w-4 text-blue-400" />
                          Skill Development
                        </h5>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <Star className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-300">Consider learning React Native for mobile development</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Star className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-300">Advanced project management certification would benefit your career</span>
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <h5 className="font-semibold text-white flex items-center gap-2">
                          <Users className="h-4 w-4 text-green-400" />
                          Collaboration
                        </h5>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <Target className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-300">Increase cross-department collaboration opportunities</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Target className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-300">Consider mentoring junior team members</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Gamification Tab */}
              <TabsContent value="gamification" className="space-y-6">
                {/* Level Progress */}
                <Card className="workspace-card">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Achievements & Progress
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Level 8 • 2,450 points • #3 on leaderboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Level Progress */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">Level 8</span>
                        <span className="text-sm text-gray-400">2,450 / 3,000 points</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full" style={{ width: '82%' }}></div>
                      </div>
                      <div className="text-xs text-gray-400">
                        550 points to next level (estimated: 2 weeks)
                      </div>
                    </div>

                    {/* Progress Rings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-green-400" />
                            <span className="text-sm font-medium text-white">Profile Completion</span>
                          </div>
                          <span className="text-sm text-gray-400">85%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-400" />
                            <span className="text-sm font-medium text-white">Skill Development</span>
                          </div>
                          <span className="text-sm text-gray-400">12/20</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-purple-400" />
                            <span className="text-sm font-medium text-white">Collaboration</span>
                          </div>
                          <span className="text-sm text-gray-400">75%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Streaks */}
                <Card className="workspace-card">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <Flame className="h-5 w-5" />
                      Current Streaks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-orange-400" />
                          <div>
                            <div className="text-sm font-medium text-white">Daily Login</div>
                            <div className="text-xs text-gray-400">Best: 45 days</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-orange-400">12</div>
                          <div className="text-xs text-gray-400">days</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-400" />
                          <div>
                            <div className="text-sm font-medium text-white">Task Completion</div>
                            <div className="text-xs text-gray-400">Best: 20 days</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400">8</div>
                          <div className="text-xs text-gray-400">days</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Badges */}
                <Card className="workspace-card">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Recent Badges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-4 bg-black/20 rounded-lg border border-white/10">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">💡</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-medium text-white">Innovation Champion</h4>
                              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                                rare
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-400 mb-2">
                              Submitted 10+ innovative ideas
                            </p>
                            <div className="text-xs text-gray-500">
                              {new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-black/20 rounded-lg border border-white/10">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">🤝</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-medium text-white">Team Player</h4>
                              <Badge variant="outline" className="text-xs bg-gray-100 text-gray-800 border-gray-200">
                                common
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-400 mb-2">
                              Collaborated on 20+ projects
                            </p>
                            <div className="text-xs text-gray-500">
                              {new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-black/20 rounded-lg border border-white/10">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">🎯</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-medium text-white">Skill Master</h4>
                              <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 border-purple-200">
                                epic
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-400 mb-2">
                              Achieved expert level in 5+ skills
                            </p>
                            <div className="text-xs text-gray-500">
                              {new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Next Milestone */}
                <Card className="workspace-card">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Next Milestone
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-white">Level 9</h4>
                      <p className="text-sm text-gray-400">
                        Reach 3,000 points to unlock Level 9
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white">2,450 / 3,000</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Reward:</span>
                      <span className="font-medium text-white">New profile customization options</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Estimated completion:</span>
                      <span className="font-medium text-white">2 weeks</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="space-y-6">
                <Card className="workspace-card">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Activity Timeline
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Recent activities and achievements
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Timeline Events */}
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center justify-center">
                          <Award className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-white">
                              Earned "Innovation Champion" Badge
                            </h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="text-xs">Public</Badge>
                              <span className="text-xs text-gray-400">2 days ago</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            Successfully implemented 5 innovative ideas this quarter
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-1">
                              <MoreHorizontal className="h-3 w-3" />
                              <span>Points: 100, Category: innovation</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 bg-blue-100 text-blue-800 border-blue-200 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-white">
                              Added React Native Skill
                            </h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="text-xs">Public</Badge>
                              <span className="text-xs text-gray-400">5 days ago</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            Completed advanced React Native course and added to profile
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-1">
                              <MoreHorizontal className="h-3 w-3" />
                              <span>Skill: React Native, Level: intermediate</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 bg-green-100 text-green-800 border-green-200 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-white">
                              Completed "Mobile App Redesign" Project
                            </h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="text-xs">Public</Badge>
                              <span className="text-xs text-gray-400">1 week ago</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            Led the redesign of the company mobile application
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-1">
                              <MoreHorizontal className="h-3 w-3" />
                              <span>Project ID: proj-123, Team Size: 5</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 bg-purple-100 text-purple-800 border-purple-200 flex items-center justify-center">
                          <Lightbulb className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-white">
                              Submitted "AI-Powered Analytics" Idea
                            </h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="text-xs">Public</Badge>
                              <span className="text-xs text-gray-400">10 days ago</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            Proposed new AI analytics feature for better insights
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-1">
                              <MoreHorizontal className="h-3 w-3" />
                              <span>Idea ID: idea-456, Votes: 12</span>
                            </div>
                          </div>
                        </div>
                      </div>
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
                        onClick={handleExportData}
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
                        onClick={handleDeleteAccount}
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