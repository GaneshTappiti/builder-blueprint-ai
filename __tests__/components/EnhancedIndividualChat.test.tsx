import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import EnhancedIndividualChat from '@/components/teamspace/EnhancedIndividualChat';
import { ChatProvider } from '@/contexts/ChatContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { TeamManagementProvider } from '@/contexts/TeamManagementContext';
import { TeamMember } from '@/types/teamManagement';

// Mock the hooks and services
jest.mock('@/contexts/ChatContext');
jest.mock('@/contexts/AuthContext');
jest.mock('@/hooks/useTeamPermissions');

const mockTeamMember: TeamMember = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: {
    id: 'member',
    name: 'Member',
    displayName: 'Team Member',
    description: 'Can add tasks/ideas, start meetings, and collaborate with the team',
    permissions: [],
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    isSystemRole: true,
    canBeAssigned: true,
    order: 2
  },
  department: {
    id: 'dev',
    name: 'Development',
    description: 'Software development team',
    memberCount: 5,
    createdBy: 'admin',
    createdAt: '2024-01-01T00:00:00Z'
  },
  status: 'online',
  joinedAt: '2024-01-01T00:00:00Z',
  lastActiveAt: '2024-01-01T00:00:00Z',
  permissions: [],
  isActive: true
};

const mockUser = {
  id: 'current-user',
  email: 'current@example.com',
  name: 'Current User'
};

const mockChatContext = {
  channels: [],
  currentChannel: null,
  messages: [],
  typingUsers: [],
  unreadCounts: {},
  loading: false,
  error: null,
  createChannel: jest.fn(),
  updateChannel: jest.fn(),
  deleteChannel: jest.fn(),
  joinChannel: jest.fn(),
  leaveChannel: jest.fn(),
  setCurrentChannel: jest.fn(),
  sendMessage: jest.fn(),
  editMessage: jest.fn(),
  deleteMessage: jest.fn(),
  reactToMessage: jest.fn(),
  removeReaction: jest.fn(),
  replyToMessage: jest.fn(),
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
  startTyping: jest.fn(),
  stopTyping: jest.fn(),
  markAsRead: jest.fn(),
  markMessageAsRead: jest.fn(),
  searchMessages: jest.fn(),
  getMessagesByDate: jest.fn(),
  getMessagesByUser: jest.fn(),
  subscribeToChannel: jest.fn(),
  unsubscribeFromChannel: jest.fn(),
  subscribeToTyping: jest.fn(),
  unsubscribeFromTyping: jest.fn(),
  getChannelById: jest.fn(),
  getChannelMembers: jest.fn(),
  getUserPermissions: jest.fn(),
  canUserPerformAction: jest.fn()
};

const mockAuthContext = {
  user: mockUser,
  loading: false,
  signIn: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn()
};

const mockTeamManagementContext = {
  teamMembers: [mockTeamMember],
  roles: [],
  departments: [],
  settings: null,
  invitations: [],
  activities: [],
  stats: null,
  loading: false,
  error: null,
  addMember: jest.fn(),
  updateMember: jest.fn(),
  removeMember: jest.fn(),
  updateMemberRole: jest.fn(),
  updateMemberDepartment: jest.fn(),
  createDepartment: jest.fn(),
  updateDepartment: jest.fn(),
  deleteDepartment: jest.fn(),
  createRole: jest.fn(),
  updateRole: jest.fn(),
  deleteRole: jest.fn(),
  inviteMember: jest.fn(),
  acceptInvitation: jest.fn(),
  declineInvitation: jest.fn(),
  cancelInvitation: jest.fn(),
  updateSettings: jest.fn(),
  getMemberById: jest.fn(),
  getMembersByDepartment: jest.fn(),
  getMembersByRole: jest.fn(),
  getTeamStats: jest.fn(),
  refreshData: jest.fn()
};

const mockUseTeamPermissions = {
  hasPermission: jest.fn(() => true),
  hasAnyPermission: jest.fn(() => true),
  hasAllPermissions: jest.fn(() => true),
  isAdmin: false,
  isMember: true,
  isViewer: false,
  hasRole: jest.fn(() => true),
  canManageMembers: false,
  canManageDepartments: false,
  canManageSettings: false,
  canInviteMembers: false,
  canViewAnalytics: false,
  canCreateTasks: true,
  canEditAllTasks: false,
  canEditOwnTasks: true,
  canDeleteTasks: false,
  canViewAllTasks: true,
  canCreateMeetings: true,
  canEditAllMeetings: false,
  canDeleteMeetings: false,
  canStartInstantMeetings: true,
  canSendMessages: true,
  canManageChannels: false,
  canCreateProjects: true,
  canEditAllProjects: false,
  canDeleteProjects: false,
  getAvailablePermissions: jest.fn(() => []),
  canPerformAction: jest.fn(() => true)
};

// Mock the useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

// Mock the useTeamPermissions hook
jest.mock('@/hooks/useTeamPermissions', () => ({
  useTeamPermissions: () => mockUseTeamPermissions
}));

// Mock the ChatContext
jest.mock('@/contexts/ChatContext', () => ({
  useChat: () => mockChatContext,
  ChatProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock the AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock the TeamManagementContext
jest.mock('@/contexts/TeamManagementContext', () => ({
  useTeamManagement: () => mockTeamManagementContext,
  TeamManagementProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <TeamManagementProvider>
        <ChatProvider>
          {component}
        </ChatProvider>
      </TeamManagementProvider>
    </AuthProvider>
  );
};

describe('EnhancedIndividualChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(
      <EnhancedIndividualChat
        member={mockTeamMember}
        currentUserId="current-user"
        onBack={jest.fn()}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Online • Private Chat')).toBeInTheDocument();
  });

  it('displays member information correctly', () => {
    renderWithProviders(
      <EnhancedIndividualChat
        member={mockTeamMember}
        currentUserId="current-user"
        onBack={jest.fn()}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Online • Private Chat')).toBeInTheDocument();
  });

  it('handles back button click', () => {
    const mockOnBack = jest.fn();
    renderWithProviders(
      <EnhancedIndividualChat
        member={mockTeamMember}
        currentUserId="current-user"
        onBack={mockOnBack}
      />
    );

    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('handles message input and sending', async () => {
    renderWithProviders(
      <EnhancedIndividualChat
        member={mockTeamMember}
        currentUserId="current-user"
        onBack={jest.fn()}
      />
    );

    const messageInput = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(messageInput, { target: { value: 'Hello, John!' } });
    fireEvent.click(sendButton);

    expect(mockChatContext.sendMessage).toHaveBeenCalledWith(
      'Hello, John!',
      'text',
      expect.any(Object)
    );
  });

  it('handles Enter key press to send message', async () => {
    renderWithProviders(
      <EnhancedIndividualChat
        member={mockTeamMember}
        currentUserId="current-user"
        onBack={jest.fn()}
      />
    );

    const messageInput = screen.getByPlaceholderText('Type a message...');
    
    fireEvent.change(messageInput, { target: { value: 'Hello, John!' } });
    fireEvent.keyPress(messageInput, { key: 'Enter', code: 'Enter' });

    expect(mockChatContext.sendMessage).toHaveBeenCalledWith(
      'Hello, John!',
      'text',
      expect.any(Object)
    );
  });

  it('handles file upload', async () => {
    renderWithProviders(
      <EnhancedIndividualChat
        member={mockTeamMember}
        currentUserId="current-user"
        onBack={jest.fn()}
      />
    );

    const fileInput = screen.getByRole('button', { name: /attach/i });
    fireEvent.click(fileInput);

    // Note: File upload testing would require more complex setup
    // This is a basic test to ensure the button is clickable
    expect(fileInput).toBeInTheDocument();
  });

  it('handles voice recording toggle', async () => {
    renderWithProviders(
      <EnhancedIndividualChat
        member={mockTeamMember}
        currentUserId="current-user"
        onBack={jest.fn()}
      />
    );

    const voiceButton = screen.getByRole('button', { name: /voice/i });
    fireEvent.click(voiceButton);

    // Note: Voice recording testing would require more complex setup
    // This is a basic test to ensure the button is clickable
    expect(voiceButton).toBeInTheDocument();
  });

  it('handles search toggle', async () => {
    renderWithProviders(
      <EnhancedIndividualChat
        member={mockTeamMember}
        currentUserId="current-user"
        onBack={jest.fn()}
      />
    );

    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    expect(screen.getByPlaceholderText('Search messages...')).toBeInTheDocument();
  });

  it('handles settings toggle', async () => {
    renderWithProviders(
      <EnhancedIndividualChat
        member={mockTeamMember}
        currentUserId="current-user"
        onBack={jest.fn()}
      />
    );

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);

    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Permissions')).toBeInTheDocument();
  });

  it('displays empty state when no messages', () => {
    renderWithProviders(
      <EnhancedIndividualChat
        member={mockTeamMember}
        currentUserId="current-user"
        onBack={jest.fn()}
      />
    );

    expect(screen.getByText('No messages yet. Start the conversation!')).toBeInTheDocument();
  });

  it('displays loading state when creating channel', () => {
    // Mock the case where no private channel exists yet
    const mockChatContextWithoutChannel = {
      ...mockChatContext,
      channels: []
    };

    jest.mocked(require('@/contexts/ChatContext').useChat).mockReturnValue(mockChatContextWithoutChannel);

    renderWithProviders(
      <EnhancedIndividualChat
        member={mockTeamMember}
        currentUserId="current-user"
        onBack={jest.fn()}
      />
    );

    expect(screen.getByText('Creating private channel...')).toBeInTheDocument();
  });

  it('handles message reactions', async () => {
    const mockMessage = {
      id: '1',
      channel_id: 'channel-1',
      sender_id: '1',
      content: 'Hello!',
      message_type: 'text',
      metadata: {},
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      is_deleted: false,
      sender: { id: '1', name: 'John Doe', email: 'john@example.com' },
      reactions: []
    };

    const mockChatContextWithMessages = {
      ...mockChatContext,
      messages: [mockMessage]
    };

    jest.mocked(require('@/contexts/ChatContext').useChat).mockReturnValue(mockChatContextWithMessages);

    renderWithProviders(
      <EnhancedIndividualChat
        member={mockTeamMember}
        currentUserId="current-user"
        onBack={jest.fn()}
      />
    );

    // Find and click the reaction button
    const reactionButton = screen.getByRole('button', { name: /reaction/i });
    fireEvent.click(reactionButton);

    expect(mockChatContext.reactToMessage).toHaveBeenCalledWith('1', '👍');
  });

  it('handles message editing', async () => {
    const mockMessage = {
      id: '1',
      channel_id: 'channel-1',
      sender_id: 'current-user',
      content: 'Hello!',
      message_type: 'text',
      metadata: {},
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      is_deleted: false,
      sender: { id: 'current-user', name: 'Current User', email: 'current@example.com' },
      reactions: []
    };

    const mockChatContextWithMessages = {
      ...mockChatContext,
      messages: [mockMessage]
    };

    jest.mocked(require('@/contexts/ChatContext').useChat).mockReturnValue(mockChatContextWithMessages);

    renderWithProviders(
      <EnhancedIndividualChat
        member={mockTeamMember}
        currentUserId="current-user"
        onBack={jest.fn()}
      />
    );

    // Find and click the edit button
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    // The edit functionality would be tested more thoroughly in integration tests
    expect(editButton).toBeInTheDocument();
  });

  it('handles message deletion', async () => {
    const mockMessage = {
      id: '1',
      channel_id: 'channel-1',
      sender_id: 'current-user',
      content: 'Hello!',
      message_type: 'text',
      metadata: {},
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      is_deleted: false,
      sender: { id: 'current-user', name: 'Current User', email: 'current@example.com' },
      reactions: []
    };

    const mockChatContextWithMessages = {
      ...mockChatContext,
      messages: [mockMessage]
    };

    jest.mocked(require('@/contexts/ChatContext').useChat).mockReturnValue(mockChatContextWithMessages);

    renderWithProviders(
      <EnhancedIndividualChat
        member={mockTeamMember}
        currentUserId="current-user"
        onBack={jest.fn()}
      />
    );

    // Find and click the delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockChatContext.deleteMessage).toHaveBeenCalledWith('1');
  });

  it('handles search functionality', async () => {
    renderWithProviders(
      <EnhancedIndividualChat
        member={mockTeamMember}
        currentUserId="current-user"
        onBack={jest.fn()}
      />
    );

    // Open search
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    const searchInput = screen.getByPlaceholderText('Search messages...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    const searchSubmitButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchSubmitButton);

    expect(mockChatContext.searchMessages).toHaveBeenCalledWith('test query', undefined);
  });

  it('handles notification settings', async () => {
    renderWithProviders(
      <EnhancedIndividualChat
        member={mockTeamMember}
        currentUserId="current-user"
        onBack={jest.fn()}
      />
    );

    // Open settings
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);

    // Check notification settings
    const mentionsCheckbox = screen.getByRole('checkbox', { name: /mentions/i });
    expect(mentionsCheckbox).toBeChecked();

    fireEvent.click(mentionsCheckbox);
    expect(mentionsCheckbox).not.toBeChecked();
  });

  it('handles keyboard shortcuts', async () => {
    renderWithProviders(
      <EnhancedIndividualChat
        member={mockTeamMember}
        currentUserId="current-user"
        onBack={jest.fn()}
      />
    );

    const messageInput = screen.getByPlaceholderText('Type a message...');
    
    // Test Enter key
    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    fireEvent.keyPress(messageInput, { key: 'Enter', code: 'Enter' });

    expect(mockChatContext.sendMessage).toHaveBeenCalled();

    // Test Shift+Enter (should not send)
    fireEvent.change(messageInput, { target: { value: 'Test message\n' } });
    fireEvent.keyPress(messageInput, { key: 'Enter', code: 'Enter', shiftKey: true });

    // Should not call sendMessage again
    expect(mockChatContext.sendMessage).toHaveBeenCalledTimes(1);
  });
});
