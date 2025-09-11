import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ProfileProvider, useProfile } from '@/contexts/ProfileContext';
import { AuthProvider } from '@/contexts/AuthContext';
import ProfileService from '@/services/profileService';

// Mock ProfileService
jest.mock('@/services/profileService');
const mockProfileService = ProfileService as jest.Mocked<typeof ProfileService>;

// Mock AuthContext
const mockAuthContext = {
  user: { id: 'test-user-id', email: 'test@example.com' },
  loading: false,
  signIn: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn()
};

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

// Test component that uses the context
const TestComponent = () => {
  const { profile, loading, error, updateProfile, addSkill } = useProfile();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="error">{error || 'No Error'}</div>
      <div data-testid="profile-name">{profile?.name || 'No Profile'}</div>
      <button 
        data-testid="update-profile" 
        onClick={() => updateProfile({ bio: 'Updated bio' })}
      >
        Update Profile
      </button>
      <button 
        data-testid="add-skill" 
        onClick={() => addSkill({ 
          name: 'JavaScript', 
          category: 'technical', 
          level: 'advanced',
          yearsOfExperience: 5,
          verified: false,
          endorsements: 0,
          endorsers: [],
          isPublic: true
        })}
      >
        Add Skill
      </button>
    </div>
  );
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <AuthProvider>
      <ProfileProvider>
        {ui}
      </ProfileProvider>
    </AuthProvider>
  );
};

describe('ProfileContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockProfileService.getCurrentProfile.mockResolvedValue(null);
    mockProfileService.createProfile.mockResolvedValue(true);
    mockProfileService.updateProfile.mockResolvedValue(true);
    mockProfileService.addSkill.mockResolvedValue(true);
  });

  it('should provide profile context', () => {
    renderWithProviders(<TestComponent />);
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByTestId('profile-name')).toBeInTheDocument();
  });

  it('should load profile on mount', async () => {
    const mockProfile = {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      bio: 'Test bio',
      profileCompletion: 80
    };

    mockProfileService.getCurrentProfile.mockResolvedValue(mockProfile as any);

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(mockProfileService.getCurrentProfile).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('profile-name')).toHaveTextContent('Test User');
    });
  });

  it('should create profile if not exists', async () => {
    mockProfileService.getCurrentProfile.mockResolvedValue(null);
    mockProfileService.createProfile.mockResolvedValue(true);

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(mockProfileService.createProfile).toHaveBeenCalled();
    });
  });

  it('should update profile', async () => {
    const mockProfile = {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      bio: 'Test bio',
      profileCompletion: 80
    };

    mockProfileService.getCurrentProfile.mockResolvedValue(mockProfile as any);
    mockProfileService.updateProfile.mockResolvedValue(true);

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-name')).toHaveTextContent('Test User');
    });

    const updateButton = screen.getByTestId('update-profile');
    await act(async () => {
      updateButton.click();
    });

    await waitFor(() => {
      expect(mockProfileService.updateProfile).toHaveBeenCalledWith('test-user-id', { bio: 'Updated bio' });
    });
  });

  it('should add skill', async () => {
    const mockProfile = {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      skills: []
    };

    mockProfileService.getCurrentProfile.mockResolvedValue(mockProfile as any);
    mockProfileService.addSkill.mockResolvedValue(true);

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-name')).toHaveTextContent('Test User');
    });

    const addSkillButton = screen.getByTestId('add-skill');
    await act(async () => {
      addSkillButton.click();
    });

    await waitFor(() => {
      expect(mockProfileService.addSkill).toHaveBeenCalledWith('test-user-id', {
        name: 'JavaScript',
        category: 'technical',
        level: 'advanced',
        yearsOfExperience: 5,
        verified: false,
        endorsements: 0,
        endorsers: [],
        isPublic: true
      });
    });
  });

  it('should handle profile loading errors', async () => {
    mockProfileService.getCurrentProfile.mockRejectedValue(new Error('Failed to load profile'));

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to load profile');
    });
  });

  it('should handle profile update errors', async () => {
    const mockProfile = {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      bio: 'Test bio',
      profileCompletion: 80
    };

    mockProfileService.getCurrentProfile.mockResolvedValue(mockProfile as any);
    mockProfileService.updateProfile.mockResolvedValue(false);

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-name')).toHaveTextContent('Test User');
    });

    const updateButton = screen.getByTestId('update-profile');
    await act(async () => {
      updateButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to update profile');
    });
  });
});

describe('useProfile hook', () => {
  it('should throw error when used outside provider', () => {
    const TestComponent = () => {
      useProfile();
      return <div>Test</div>;
    };

    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useProfile must be used within a ProfileProvider');

    console.error = originalError;
  });
});
