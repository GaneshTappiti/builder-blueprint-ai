"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Target,
  Users,
  Lightbulb
} from 'lucide-react';

interface ProfileSetupData {
  // Personal Information
  firstName: string;
  lastName: string;
  displayName: string;
  bio: string;
  phone: string;
  location: string;
  timezone: string;
  website: string;
  linkedin: string;
  twitter: string;
  github: string;
  
  // Professional Information
  jobTitle: string;
  department: string;
  workLocation: 'remote' | 'hybrid' | 'office';
  
  // Skills and Interests
  skills: string[];
  interests: string[];
  
  // Availability
  status: 'online' | 'offline' | 'busy' | 'away';
}

const REQUIRED_FIELDS = [
  'firstName', 'lastName', 'bio', 'jobTitle', 'location', 'timezone'
];

const SKILL_OPTIONS = [
  'Frontend Development', 'Backend Development', 'Full Stack Development',
  'UI/UX Design', 'Product Management', 'Marketing', 'Sales',
  'Data Analysis', 'DevOps', 'QA Testing', 'Project Management',
  'Business Analysis', 'Content Writing', 'Graphic Design',
  'Mobile Development', 'AI/ML', 'Blockchain', 'Cloud Computing'
];

const INTEREST_OPTIONS = [
  'Web3', 'AI/ML', 'SaaS', 'E-commerce', 'FinTech', 'HealthTech',
  'EdTech', 'ClimateTech', 'AgriTech', 'PropTech', 'Gaming',
  'Social Media', 'Marketplace', 'B2B', 'B2C', 'Enterprise'
];

const TIMEZONE_OPTIONS = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid', 'Europe/Rome',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Asia/Dubai', 'Australia/Sydney'
];

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, updateProfile, loading: profileLoading } = useProfile();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileSetupData>({
    firstName: '',
    lastName: '',
    displayName: '',
    bio: '',
    phone: '',
    location: '',
    timezone: 'UTC',
    website: '',
    linkedin: '',
    twitter: '',
    github: '',
    jobTitle: '',
    department: '',
    workLocation: 'remote',
    skills: [],
    interests: [],
    status: 'online'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if user has already completed onboarding or is not authenticated
  useEffect(() => {
    if (!user) {
      console.log('User not authenticated, redirecting to auth');
      router.push('/auth');
      return;
    }
    
    if (profile && profile.onboardingCompleted) {
      console.log('User has already completed onboarding, redirecting to profile page');
      toast({
        title: "Onboarding Already Complete",
        description: "You have already completed your profile setup. Redirecting to your profile page where you can make changes.",
      });
      router.push('/profile');
      return;
    }
  }, [user, profile, router, toast]);

  // Initialize form data from existing profile
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        location: profile.location || '',
        timezone: profile.timezone || 'UTC',
        website: profile.website || '',
        linkedin: profile.linkedin || '',
        twitter: profile.twitter || '',
        github: profile.github || '',
        jobTitle: profile.jobTitle || '',
        department: profile.department?.name || '',
        workLocation: profile.workLocation || 'remote',
        skills: profile.skills?.map(skill => skill.name) || [],
        interests: profile.interests || [],
        status: profile.status || 'online'
      });
    }
  }, [profile]);

  // Calculate completion percentage
  const calculateCompletion = () => {
    const totalFields = REQUIRED_FIELDS.length + 1; // +1 for skills
    let completedFields = 0;
    
    REQUIRED_FIELDS.forEach(field => {
      if (formData[field as keyof ProfileSetupData] && formData[field as keyof ProfileSetupData] !== '') {
        completedFields++;
      }
    });
    
    if (formData.skills.length > 0) {
      completedFields++;
    }
    
    return Math.round((completedFields / totalFields) * 100);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    REQUIRED_FIELDS.forEach(field => {
      const value = formData[field as keyof ProfileSetupData];
      if (!value || value === '') {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });
    
    if (formData.skills.length === 0) {
      newErrors.skills = 'At least one skill is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProfileSetupData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const success = await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: formData.displayName,
        bio: formData.bio,
        phone: formData.phone,
        location: formData.location,
        timezone: formData.timezone,
        website: formData.website,
        linkedin: formData.linkedin,
        twitter: formData.twitter,
        github: formData.github,
        jobTitle: formData.jobTitle,
        department: { 
          id: '', 
          name: formData.department, 
          description: '', 
          color: '', 
          icon: '', 
          memberCount: 0, 
          isActive: true, 
          createdBy: user?.id || '', 
          createdAt: new Date().toISOString() 
        },
        workLocation: formData.workLocation,
        skills: formData.skills.map(skill => ({
          id: `skill-${Date.now()}-${Math.random()}`,
          name: skill,
          level: 'intermediate',
          category: 'technical',
          yearsOfExperience: 1,
          verified: false,
          verifiedAt: undefined,
          verifiedBy: undefined,
          endorsements: 0,
          endorsers: [],
          isPublic: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })),
        interests: formData.interests,
        status: formData.status,
        onboardingCompleted: true
      });

      if (success) {
        toast({
          title: "Profile Updated!",
          description: "Your profile has been completed successfully.",
        });
        
        // Redirect to workspace
        setTimeout(() => {
          router.push('/workspace');
        }, 1500);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completionPercentage = calculateCompletion();

  // Show loading while checking user status
  if (!user || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900/20">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-2 border-green-400 border-t-transparent rounded-full"></div>
          <p className="text-gray-400">Loading profile...</p>
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
            <Sparkles className="h-8 w-8 text-green-400" />
            <h1 className="text-3xl font-bold text-white">Complete Your Profile</h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Set up your profile to unlock all features including team invitations, idea vault, and collaborative tools.
          </p>
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg max-w-2xl mx-auto">
            <p className="text-sm text-blue-300">
              <strong>Note:</strong> This is your initial profile setup. After completion, you can make changes anytime from your profile page.
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Profile Completion</span>
            <span>{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="workspace-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Step {currentStep} of 4
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={currentStep.toString()} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="1" className="text-xs">Personal</TabsTrigger>
                  <TabsTrigger value="2" className="text-xs">Professional</TabsTrigger>
                  <TabsTrigger value="3" className="text-xs">Skills & Interests</TabsTrigger>
                  <TabsTrigger value="4" className="text-xs">Review</TabsTrigger>
                </TabsList>

                {/* Step 1: Personal Information */}
                <TabsContent value="1" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={errors.firstName ? 'border-red-500' : ''}
                        placeholder="Enter your first name"
                      />
                      {errors.firstName && <p className="text-red-400 text-sm">{errors.firstName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={errors.lastName ? 'border-red-500' : ''}
                        placeholder="Enter your last name"
                      />
                      {errors.lastName && <p className="text-red-400 text-sm">{errors.lastName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-white">Display Name</Label>
                      <Input
                        id="displayName"
                        value={formData.displayName}
                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                        placeholder="How you'd like to be called"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-white">Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className={errors.location ? 'border-red-500' : ''}
                        placeholder="City, Country"
                      />
                      {errors.location && <p className="text-red-400 text-sm">{errors.location}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone" className="text-white">Timezone *</Label>
                      <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                        <SelectTrigger className={errors.timezone ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMEZONE_OPTIONS.map(tz => (
                            <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.timezone && <p className="text-red-400 text-sm">{errors.timezone}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-white">Bio *</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className={errors.bio ? 'border-red-500' : ''}
                      placeholder="Tell us about yourself, your background, and what you're passionate about..."
                      rows={4}
                    />
                    {errors.bio && <p className="text-red-400 text-sm">{errors.bio}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-white">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedin" className="text-white">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={formData.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="github" className="text-white">GitHub</Label>
                      <Input
                        id="github"
                        value={formData.github}
                        onChange={(e) => handleInputChange('github', e.target.value)}
                        placeholder="https://github.com/username"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Step 2: Professional Information */}
                <TabsContent value="2" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle" className="text-white">Job Title *</Label>
                      <Input
                        id="jobTitle"
                        value={formData.jobTitle}
                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                        className={errors.jobTitle ? 'border-red-500' : ''}
                        placeholder="e.g., Software Engineer, Product Manager"
                      />
                      {errors.jobTitle && <p className="text-red-400 text-sm">{errors.jobTitle}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-white">Department</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        placeholder="e.g., Engineering, Product, Marketing"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workLocation" className="text-white">Work Location</Label>
                      <Select value={formData.workLocation} onValueChange={(value: 'remote' | 'hybrid' | 'office') => handleInputChange('workLocation', value)}>
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

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-white">Current Status</Label>
                      <Select value={formData.status} onValueChange={(value: 'online' | 'offline' | 'busy' | 'away') => handleInputChange('status', value)}>
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
                  </div>
                </TabsContent>

                {/* Step 3: Skills & Interests */}
                <TabsContent value="3" className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white text-lg font-semibold">Skills *</Label>
                      <p className="text-gray-400 text-sm mb-4">Select your areas of expertise</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {SKILL_OPTIONS.map(skill => (
                          <div key={skill} className="flex items-center space-x-2">
                            <Checkbox
                              id={skill}
                              checked={formData.skills.includes(skill)}
                              onCheckedChange={() => handleSkillToggle(skill)}
                            />
                            <Label htmlFor={skill} className="text-sm text-gray-300 cursor-pointer">
                              {skill}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {errors.skills && <p className="text-red-400 text-sm">{errors.skills}</p>}
                    </div>

                    <div>
                      <Label className="text-white text-lg font-semibold">Interests</Label>
                      <p className="text-gray-400 text-sm mb-4">Select areas you're interested in</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {INTEREST_OPTIONS.map(interest => (
                          <div key={interest} className="flex items-center space-x-2">
                            <Checkbox
                              id={interest}
                              checked={formData.interests.includes(interest)}
                              onCheckedChange={() => handleInterestToggle(interest)}
                            />
                            <Label htmlFor={interest} className="text-sm text-gray-300 cursor-pointer">
                              {interest}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Step 4: Review */}
                <TabsContent value="4" className="space-y-6">
                  <div className="space-y-6">
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Review Your Profile</h3>
                      <p className="text-gray-400">Please review your information before saving</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Personal Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-400">Name:</span> {formData.firstName} {formData.lastName}</p>
                          <p><span className="text-gray-400">Display Name:</span> {formData.displayName || 'Not set'}</p>
                          <p><span className="text-gray-400">Location:</span> {formData.location}</p>
                          <p><span className="text-gray-400">Timezone:</span> {formData.timezone}</p>
                          <p><span className="text-gray-400">Bio:</span> {formData.bio}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          Professional Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-400">Job Title:</span> {formData.jobTitle}</p>
                          <p><span className="text-gray-400">Department:</span> {formData.department || 'Not set'}</p>
                          <p><span className="text-gray-400">Work Location:</span> {formData.workLocation}</p>
                          <p><span className="text-gray-400">Status:</span> {formData.status}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.skills.map(skill => (
                            <Badge key={skill} variant="secondary" className="bg-green-600/20 text-green-400 border-green-500/30">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Lightbulb className="h-5 w-5" />
                          Interests
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.interests.map(interest => (
                            <Badge key={interest} variant="outline" className="border-blue-500/30 text-blue-400">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="workspace-button-secondary"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                {currentStep < 4 ? (
                  <Button
                    onClick={nextStep}
                    className="workspace-button"
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="workspace-button"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Complete Profile
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
