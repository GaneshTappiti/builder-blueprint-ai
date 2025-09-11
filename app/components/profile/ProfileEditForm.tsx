"use client";

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { UserProfile, UserSkill, UserCertification, UserLanguage } from '@/types/profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Linkedin, 
  Twitter, 
  Github,
  Plus,
  X,
  Save,
  X as CloseIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileEditFormProps {
  profile: UserProfile;
  onClose: () => void;
  onSave: (updatedProfile: Partial<UserProfile>) => void;
  className?: string;
}

export function ProfileEditForm({ 
  profile, 
  onClose, 
  onSave, 
  className = '' 
}: ProfileEditFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);

  // Show loading state if profile is not available
  if (!profile) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Form state
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    timezone: profile?.timezone || 'UTC',
    website: profile?.website || '',
    linkedin: profile?.linkedin || '',
    twitter: profile?.twitter || '',
    github: profile?.github || '',
    jobTitle: profile?.jobTitle || '',
    department: typeof profile?.department === 'string' ? { id: '', name: profile?.department, description: '', color: '', icon: '', memberCount: 0, isActive: true, createdBy: '', createdAt: '' } : profile?.department || { id: '', name: '', description: '', color: '', icon: '', memberCount: 0, isActive: true, createdBy: '', createdAt: '' },
    workLocation: profile?.workLocation || 'remote',
    interests: profile?.interests || [],
    status: profile?.status || 'offline',
    availability: profile?.availability || {
      isAvailable: true,
      workingDays: [1, 2, 3, 4, 5],
      workingHours: profile?.workingHours || { start: '09:00', end: '17:00', days: [1, 2, 3, 4, 5], timezone: 'UTC' },
      timezone: profile?.timezone || 'UTC',
      vacationMode: false
    }
  });

  // Skills state
  const [skills, setSkills] = useState<UserSkill[]>(profile?.skills || []);
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'technical' as const,
    level: 'beginner' as const,
    yearsOfExperience: 0,
    isPublic: true
  });

  // Certifications state
  const [certifications, setCertifications] = useState<UserCertification[]>(profile?.certifications || []);
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuer: '',
    credentialId: '',
    issueDate: '',
    expiryDate: '',
    credentialUrl: '',
    isPublic: true
  });

  // Languages state
  const [languages, setLanguages] = useState<UserLanguage[]>(profile?.languages || []);
  const [newLanguage, setNewLanguage] = useState({
    language: '',
    proficiency: 'elementary' as const,
    isPublic: true
  });

  // New interest input
  const [newInterest, setNewInterest] = useState('');

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'department' ? { id: '', name: value, description: '', color: '', icon: '', memberCount: 0, isActive: true, createdBy: '', createdAt: '' } : value
    }));
  };

  const handleNestedInputChange = (field: keyof UserProfile, subField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...(prev[field] as any),
        [subField]: value
      }
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests?.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...(prev.interests || []), newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests?.filter(i => i !== interest) || []
    }));
  };

  const addSkill = () => {
    if (newSkill.name.trim()) {
      const skill: UserSkill = {
        id: crypto.randomUUID(),
        ...newSkill,
        verified: false,
        endorsements: 0,
        endorsers: []
      };
      setSkills(prev => [...prev, skill]);
      setNewSkill({
        name: '',
        category: 'technical',
        level: 'beginner',
        yearsOfExperience: 0,
        isPublic: true
      });
    }
  };

  const removeSkill = (skillId: string) => {
    setSkills(prev => prev.filter(skill => skill.id !== skillId));
  };

  const addCertification = () => {
    if (newCertification.name.trim() && newCertification.issuer.trim()) {
      const certification: UserCertification = {
        id: crypto.randomUUID(),
        ...newCertification,
        isVerified: false
      };
      setCertifications(prev => [...prev, certification]);
      setNewCertification({
        name: '',
        issuer: '',
        credentialId: '',
        issueDate: '',
        expiryDate: '',
        credentialUrl: '',
        isPublic: true
      });
    }
  };

  const removeCertification = (certificationId: string) => {
    setCertifications(prev => prev.filter(cert => cert.id !== certificationId));
  };

  const addLanguage = () => {
    if (newLanguage.language.trim()) {
      const language: UserLanguage = {
        id: crypto.randomUUID(),
        ...newLanguage
      };
      setLanguages(prev => [...prev, language]);
      setNewLanguage({
        language: '',
        proficiency: 'elementary',
        isPublic: true
      });
    }
  };

  const removeLanguage = (languageId: string) => {
    setLanguages(prev => prev.filter(lang => lang.id !== languageId));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedProfile = {
        ...formData,
        skills,
        certifications,
        languages
      };
      
      await onSave(updatedProfile);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Edit Profile</h2>
        <Button variant="outline" onClick={onClose}>
          <CloseIcon className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="skills">Skills & Expertise</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName || ''}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  placeholder="How you'd like to be displayed"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Your phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Your location"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={formData.timezone || 'UTC'}
                  onValueChange={(value) => handleInputChange('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Europe/Paris">Paris</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={formData.linkedin || ''}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={formData.twitter || ''}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      placeholder="https://twitter.com/yourhandle"
                    />
                  </div>
                  <div>
                    <Label htmlFor="github">GitHub</Label>
                    <Input
                      id="github"
                      value={formData.github || ''}
                      onChange={(e) => handleInputChange('github', e.target.value)}
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Interests</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.interests?.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {interest}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeInterest(interest)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Add an interest"
                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                  />
                  <Button onClick={addInterest} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional Information Tab */}
        <TabsContent value="professional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>Your work and career details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle || ''}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    placeholder="Your job title"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={typeof formData.department === 'string' ? formData.department : formData.department?.name || ''}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="Your department"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="workLocation">Work Location</Label>
                <Select
                  value={formData.workLocation || 'remote'}
                  onValueChange={(value) => handleInputChange('workLocation', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select work location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Current Status</Label>
                <Select
                  value={formData.status || 'offline'}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="away">Away</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills & Expertise Tab */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skills & Expertise</CardTitle>
              <CardDescription>Add your technical and professional skills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Skill */}
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-medium">Add New Skill</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="skillName">Skill Name</Label>
                    <Input
                      id="skillName"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., JavaScript, Project Management"
                    />
                  </div>
                  <div>
                    <Label htmlFor="skillCategory">Category</Label>
                    <Select
                      value={newSkill.category}
                      onValueChange={(value) => setNewSkill(prev => ({ ...prev, category: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="soft">Soft Skills</SelectItem>
                        <SelectItem value="language">Language</SelectItem>
                        <SelectItem value="tool">Tool</SelectItem>
                        <SelectItem value="framework">Framework</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="skillLevel">Level</Label>
                    <Select
                      value={newSkill.level}
                      onValueChange={(value) => setNewSkill(prev => ({ ...prev, level: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="skillExperience">Years of Experience</Label>
                    <Input
                      id="skillExperience"
                      type="number"
                      value={newSkill.yearsOfExperience}
                      onChange={(e) => setNewSkill(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="skillPublic"
                    checked={newSkill.isPublic}
                    onCheckedChange={(checked) => setNewSkill(prev => ({ ...prev, isPublic: checked }))}
                  />
                  <Label htmlFor="skillPublic">Make this skill public</Label>
                </div>
                <Button onClick={addSkill} className="w-full">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Skill
                </Button>
              </div>

              {/* Current Skills */}
              <div className="space-y-2">
                <h3 className="font-medium">Current Skills</h3>
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{skill.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {skill.category} • {skill.level}
                        {skill.yearsOfExperience && skill.yearsOfExperience > 0 && ` • ${skill.yearsOfExperience} years`}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeSkill(skill.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferences & Settings</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium">Notification Preferences</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <Switch
                      id="emailNotifications"
                      checked={profile.preferences?.notifications?.email || false}
                      onCheckedChange={(checked) => 
                        handleNestedInputChange('preferences', 'notifications', {
                          ...profile.preferences?.notifications,
                          email: checked
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <Switch
                      id="pushNotifications"
                      checked={profile.preferences?.notifications?.push || false}
                      onCheckedChange={(checked) => 
                        handleNestedInputChange('preferences', 'notifications', {
                          ...profile.preferences?.notifications,
                          push: checked
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-1" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

export default ProfileEditForm;
