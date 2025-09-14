/**
 * Profile Integration Service
 * Bridges the gap between the profile system and other features
 * Ensures all features can access and use profile data effectively
 */

import { UserProfile } from '@/types/profile';
import { ProfileService } from './profileService';

export interface ProfileIntegrationData {
  userProfile: UserProfile | null;
  userContext: {
    id: string;
    name: string;
    industry: string;
    experience: 'beginner' | 'intermediate' | 'expert';
    role: 'founder' | 'developer' | 'designer' | 'marketer' | 'investor' | 'consultant';
    preferences: {
      communicationStyle: 'technical' | 'business' | 'casual' | 'formal';
      detailLevel: 'high' | 'medium' | 'low';
      focusAreas: string[];
      avoidTopics: string[];
    };
    behavior: {
      averageSessionLength: number;
      preferredCategories: string[];
      interactionHistory: string[];
      successPatterns: string[];
    };
    projectContext?: {
      currentProject: string;
      projectStage: 'ideation' | 'validation' | 'development' | 'launch' | 'growth';
      teamSize: number;
      budget: 'low' | 'medium' | 'high';
      timeline: 'urgent' | 'normal' | 'flexible';
      technologies: string[];
    };
  } | null;
  isProfileComplete: boolean;
  profileCompletion: number;
}

class ProfileIntegrationService {
  private static instance: ProfileIntegrationService;
  private profileCache = new Map<string, ProfileIntegrationData>();

  static getInstance(): ProfileIntegrationService {
    if (!ProfileIntegrationService.instance) {
      ProfileIntegrationService.instance = new ProfileIntegrationService();
    }
    return ProfileIntegrationService.instance;
  }

  /**
   * Get comprehensive profile data for feature integration
   */
  async getProfileIntegrationData(userId: string): Promise<ProfileIntegrationData> {
    // Check cache first
    const cached = this.profileCache.get(userId);
    if (cached) {
      return cached;
    }

    try {
      const userProfile = await ProfileService.getProfile(userId);
      
      if (!userProfile) {
        const emptyData: ProfileIntegrationData = {
          userProfile: null,
          userContext: null,
          isProfileComplete: false,
          profileCompletion: 0
        };
        this.profileCache.set(userId, emptyData);
        return emptyData;
      }

      const userContext = this.transformProfileToUserContext(userProfile);
      const isProfileComplete = userProfile.onboardingCompleted || (userProfile.profileCompletion || 0) >= 80;
      const profileCompletion = userProfile.profileCompletion || 0;

      const integrationData: ProfileIntegrationData = {
        userProfile,
        userContext,
        isProfileComplete,
        profileCompletion
      };

      // Cache the result
      this.profileCache.set(userId, integrationData);
      
      return integrationData;
    } catch (error) {
      console.error('Error getting profile integration data:', error);
      const emptyData: ProfileIntegrationData = {
        userProfile: null,
        userContext: null,
        isProfileComplete: false,
        profileCompletion: 0
      };
      this.profileCache.set(userId, emptyData);
      return emptyData;
    }
  }

  /**
   * Transform UserProfile to UserContext for AI services
   */
  private transformProfileToUserContext(profile: UserProfile) {
    // Determine experience level based on skills and profile completion
    const experienceLevel = this.determineExperienceLevel(profile);
    
    // Determine role based on job title and skills
    const role = this.determineRole(profile);
    
    // Determine industry based on interests and job title
    const industry = this.determineIndustry(profile);

    return {
      id: profile.id,
      name: profile.displayName || profile.name,
      industry,
      experience: experienceLevel,
      role,
      preferences: {
        communicationStyle: this.getCommunicationStyle(profile),
        detailLevel: this.getDetailLevel(profile),
        focusAreas: profile.interests || [],
        avoidTopics: this.getAvoidTopics(profile)
      },
      behavior: {
        averageSessionLength: this.getAverageSessionLength(profile),
        preferredCategories: this.getPreferredCategories(profile),
        interactionHistory: this.getInteractionHistory(profile),
        successPatterns: this.getSuccessPatterns(profile)
      },
      projectContext: this.getProjectContext(profile)
    };
  }

  /**
   * Determine experience level based on profile data
   */
  private determineExperienceLevel(profile: UserProfile): 'beginner' | 'intermediate' | 'expert' {
    const skills = profile.skills || [];
    const profileCompletion = profile.profileCompletion || 0;
    
    // Count verified skills and years of experience
    const verifiedSkills = skills.filter(skill => 
      typeof skill === 'object' && skill.verified
    ).length;
    
    const totalYearsExperience = skills.reduce((total, skill) => {
      if (typeof skill === 'object' && skill.yearsOfExperience) {
        return total + skill.yearsOfExperience;
      }
      return total;
    }, 0);

    if (verifiedSkills >= 5 && totalYearsExperience >= 5 && profileCompletion >= 90) {
      return 'expert';
    } else if (verifiedSkills >= 2 && totalYearsExperience >= 2 && profileCompletion >= 60) {
      return 'intermediate';
    } else {
      return 'beginner';
    }
  }

  /**
   * Determine role based on job title and skills
   */
  private determineRole(profile: UserProfile): 'founder' | 'developer' | 'designer' | 'marketer' | 'investor' | 'consultant' {
    const jobTitle = (profile.jobTitle || '').toLowerCase();
    const skills = profile.skills || [];
    const skillNames = skills.map((skill: any) => 
      typeof skill === 'string' ? skill.toLowerCase() : skill.name.toLowerCase()
    );

    if (jobTitle.includes('founder') || jobTitle.includes('ceo') || jobTitle.includes('co-founder')) {
      return 'founder';
    } else if (jobTitle.includes('developer') || jobTitle.includes('engineer') || 
               skillNames.some(skill => skill.includes('development') || skill.includes('programming'))) {
      return 'developer';
    } else if (jobTitle.includes('designer') || jobTitle.includes('ux') || jobTitle.includes('ui') ||
               skillNames.some(skill => skill.includes('design') || skill.includes('ux'))) {
      return 'designer';
    } else if (jobTitle.includes('marketing') || jobTitle.includes('marketer') ||
               skillNames.some(skill => skill.includes('marketing') || skill.includes('growth'))) {
      return 'marketer';
    } else if (jobTitle.includes('investor') || jobTitle.includes('vc') || jobTitle.includes('angel')) {
      return 'investor';
    } else {
      return 'consultant';
    }
  }

  /**
   * Determine industry based on interests and job title
   */
  private determineIndustry(profile: UserProfile): string {
    const interests = profile.interests || [];
    const jobTitle = (profile.jobTitle || '').toLowerCase();
    
    // Check interests first
    if (interests.some(interest => interest.toLowerCase().includes('fintech'))) {
      return 'fintech';
    } else if (interests.some(interest => interest.toLowerCase().includes('health'))) {
      return 'healthtech';
    } else if (interests.some(interest => interest.toLowerCase().includes('education'))) {
      return 'edtech';
    } else if (interests.some(interest => interest.toLowerCase().includes('climate'))) {
      return 'climatetech';
    } else if (interests.some(interest => interest.toLowerCase().includes('ai'))) {
      return 'ai';
    } else if (interests.some(interest => interest.toLowerCase().includes('saas'))) {
      return 'saas';
    }
    
    // Check job title
    if (jobTitle.includes('fintech') || jobTitle.includes('finance')) {
      return 'fintech';
    } else if (jobTitle.includes('health') || jobTitle.includes('medical')) {
      return 'healthtech';
    } else if (jobTitle.includes('education') || jobTitle.includes('edtech')) {
      return 'edtech';
    } else if (jobTitle.includes('climate') || jobTitle.includes('sustainability')) {
      return 'climatetech';
    } else if (jobTitle.includes('ai') || jobTitle.includes('machine learning')) {
      return 'ai';
    } else if (jobTitle.includes('saas') || jobTitle.includes('software')) {
      return 'saas';
    }
    
    return 'general';
  }

  /**
   * Get communication style preference
   */
  private getCommunicationStyle(profile: UserProfile): 'technical' | 'business' | 'casual' | 'formal' {
    const role = this.determineRole(profile);
    const experience = this.determineExperienceLevel(profile);
    
    if (role === 'developer' && experience === 'expert') {
      return 'technical';
    } else if (role === 'founder' || role === 'investor') {
      return 'business';
    } else if (experience === 'beginner') {
      return 'casual';
    } else {
      return 'formal';
    }
  }

  /**
   * Get detail level preference
   */
  private getDetailLevel(profile: UserProfile): 'high' | 'medium' | 'low' {
    const experience = this.determineExperienceLevel(profile);
    const profileCompletion = profile.profileCompletion || 0;
    
    if (experience === 'expert' && profileCompletion >= 90) {
      return 'high';
    } else if (experience === 'intermediate' || profileCompletion >= 60) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Get topics to avoid based on profile
   */
  private getAvoidTopics(profile: UserProfile): string[] {
    const avoidTopics: string[] = [];
    
    // Avoid topics based on role
    const role = this.determineRole(profile);
    if (role === 'developer') {
      avoidTopics.push('marketing strategies', 'sales techniques');
    } else if (role === 'marketer') {
      avoidTopics.push('technical implementation', 'code architecture');
    }
    
    return avoidTopics;
  }

  /**
   * Get average session length (mock implementation)
   */
  private getAverageSessionLength(profile: UserProfile): number {
    // This would be calculated from actual usage data
    const experience = this.determineExperienceLevel(profile);
    return experience === 'expert' ? 45 : experience === 'intermediate' ? 30 : 20;
  }

  /**
   * Get preferred categories based on interests and skills
   */
  private getPreferredCategories(profile: UserProfile): string[] {
    const interests = profile.interests || [];
    const skills = profile.skills || [];
    
    const categories = [...interests];
    
    // Add skill-based categories
    skills.forEach(skill => {
      const skillName = typeof skill === 'string' ? skill : skill.name;
      if (skillName.toLowerCase().includes('frontend')) {
        categories.push('frontend development');
      } else if (skillName.toLowerCase().includes('backend')) {
        categories.push('backend development');
      } else if (skillName.toLowerCase().includes('design')) {
        categories.push('design');
      }
    });
    
    return Array.from(new Set(categories)); // Remove duplicates
  }

  /**
   * Get interaction history (mock implementation)
   */
  private getInteractionHistory(profile: UserProfile): string[] {
    // This would be populated from actual interaction data
    return ['idea_generation', 'market_analysis', 'project_planning'];
  }

  /**
   * Get success patterns (mock implementation)
   */
  private getSuccessPatterns(profile: UserProfile): string[] {
    // This would be calculated from actual success data
    const experience = this.determineExperienceLevel(profile);
    return experience === 'expert' ? 
      ['detailed_analysis', 'technical_depth', 'comprehensive_planning'] :
      ['step_by_step_guidance', 'clear_explanations', 'practical_examples'];
  }

  /**
   * Get project context (mock implementation)
   */
  private getProjectContext(profile: UserProfile) {
    // This would be populated from actual project data
    return {
      currentProject: 'Startup Idea Validation',
      projectStage: 'ideation' as const,
      teamSize: 1,
      budget: 'low' as const,
      timeline: 'normal' as const,
      technologies: profile.skills?.map(skill => 
        typeof skill === 'string' ? skill : skill.name
      ).slice(0, 5) || []
    };
  }

  /**
   * Clear cache for a user
   */
  clearUserCache(userId: string): void {
    this.profileCache.delete(userId);
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.profileCache.clear();
  }
}

export const profileIntegrationService = ProfileIntegrationService.getInstance();
