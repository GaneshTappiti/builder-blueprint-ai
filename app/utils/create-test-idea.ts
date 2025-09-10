"use client";

import { publicFeedbackPersistence } from './public-feedback-persistence';

export function createTestIdea(ideaId: string) {
  const testIdea = {
    id: ideaId,
    title: `Test Idea ${ideaId}`,
    description: `This is a test idea with ID ${ideaId}. You can use this to test the feedback system.`,
    tags: ['test', 'feedback', 'demo'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    feedback: []
  };

  return publicFeedbackPersistence.savePublicIdea(testIdea);
}

export function createTestIdeaWithFeedback(ideaId: string) {
  const testIdea = {
    id: ideaId,
    title: `AI-Powered Learning Assistant for Small Businesses`,
    description: `An intelligent learning platform that helps small business owners acquire new skills through personalized, bite-sized lessons powered by AI.`,
    elevatorPitch: `Transform your small business with AI-guided learning that adapts to your schedule and goals.`,
    problemStatement: `Small business owners struggle to find time for professional development while managing day-to-day operations. Traditional courses are too long, generic, and don't fit their specific needs or busy schedules.`,
    solution: `Our AI-powered learning assistant creates personalized, 15-minute daily lessons tailored to each business owner's industry, current challenges, and learning pace. It uses real business scenarios and provides actionable insights that can be immediately applied.`,
    keyFeatures: [
      'AI-generated personalized learning paths based on business type and goals',
      '15-minute daily micro-lessons that fit any schedule',
      'Real-world business scenarios and case studies',
      'Progress tracking with actionable insights',
      'Community forum for peer learning and networking',
      'Mobile app with offline learning capabilities'
    ],
    targetAudience: 'Small business owners, entrepreneurs, and freelancers',
    marketSize: '2.5M+ small businesses in the US alone',
    tags: ['AI', 'Education', 'Small Business', 'Learning', 'Productivity'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    feedback: [
      {
        id: '1',
        author: 'John Doe',
        content: 'This is a great idea! I think it has a lot of potential.',
        type: 'positive' as const,
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        likes: 3,
        rating: 5,
        emojiReaction: '❤️' as const,
        replies: [
          {
            id: '1-1',
            author: 'Jane Smith',
            content: 'I agree! The concept is solid.',
            timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
            likes: 1,
            parentId: '1'
          }
        ]
      },
      {
        id: '2',
        author: 'Mike Johnson',
        content: 'I have some concerns about the implementation. It might be too complex.',
        type: 'negative' as const,
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        likes: 1,
        rating: 2,
        emojiReaction: '👎' as const,
        replies: []
      },
      {
        id: '3',
        author: 'Sarah Wilson',
        content: 'What if we added a mobile app version? That could increase accessibility.',
        type: 'suggestion' as const,
        timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        likes: 5,
        rating: 4,
        emojiReaction: '😊' as const,
        replies: [
          {
            id: '3-1',
            author: 'Alex Brown',
            content: 'Great suggestion! Mobile would definitely help reach more users.',
            timestamp: new Date(Date.now() - 129600000).toISOString(), // 1.5 days ago
            likes: 2,
            parentId: '3'
          },
          {
            id: '3-2',
            author: 'John Doe',
            content: 'I could help with the mobile development if needed.',
            timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            likes: 0,
            parentId: '3'
          }
        ]
      }
    ]
  };

  return publicFeedbackPersistence.savePublicIdea(testIdea);
}
