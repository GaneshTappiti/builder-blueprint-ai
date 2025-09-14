"use client";

import { useState, useEffect, useCallback } from 'react';
import { FeedbackItem, FeedbackReply } from '@/utils/ideaforge-persistence';
import { publicFeedbackPersistence, PublicIdeaData } from '@/utils/public-feedback-persistence';

interface UsePublicFeedbackOnlyReturn {
  idea: PublicIdeaData | null;
  feedback: FeedbackItem[];
  loading: boolean;
  error: string | null;
  addFeedback: (feedback: Omit<FeedbackItem, 'id'>) => Promise<boolean>;
  updateFeedback: (feedbackId: string, updates: Partial<FeedbackItem>) => Promise<boolean>;
  deleteFeedback: (feedbackId: string) => Promise<boolean>;
  addReply: (feedbackId: string, reply: Omit<FeedbackReply, 'id'>) => Promise<boolean>;
  updateReply: (feedbackId: string, replyId: string, updates: Partial<FeedbackReply>) => Promise<boolean>;
  deleteReply: (feedbackId: string, replyId: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

export function usePublicFeedbackOnly(ideaId: string): UsePublicFeedbackOnlyReturn {
  const [idea, setIdea] = useState<PublicIdeaData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get public idea data
      let publicIdea = await publicFeedbackPersistence.getPublicIdea(ideaId);

      if (!publicIdea) {
        setError('Idea not found. The idea may have been deleted or the ID is invalid.');
        return;
      }

      if (publicIdea) {
        setIdea(publicIdea);
        setFeedback(publicIdea.feedback || []);
      }

    } catch (err) {
      console.error('Error loading feedback data:', err);
      setError('Failed to load feedback data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [ideaId]);

  useEffect(() => {
    if (ideaId) {
      loadData();
    }
  }, [ideaId, loadData]);

  const addFeedback = useCallback(async (newFeedback: Omit<FeedbackItem, 'id'>): Promise<boolean> => {
    try {
      const success = await publicFeedbackPersistence.addFeedback(ideaId, newFeedback);
      if (success) {
        await loadData(); // Refresh data
      }
      return success;
    } catch (err) {
      console.error('Error adding feedback:', err);
      return false;
    }
  }, [ideaId, loadData]);

  const updateFeedback = useCallback(async (feedbackId: string, updates: Partial<FeedbackItem>): Promise<boolean> => {
    try {
      const success = publicFeedbackPersistence.updateFeedback(ideaId, feedbackId, updates);
      if (success) {
        await loadData(); // Refresh data
      }
      return success;
    } catch (err) {
      console.error('Error updating feedback:', err);
      return false;
    }
  }, [ideaId, loadData]);

  const deleteFeedback = useCallback(async (feedbackId: string): Promise<boolean> => {
    try {
      const success = publicFeedbackPersistence.deleteFeedback(ideaId, feedbackId);
      if (success) {
        await loadData(); // Refresh data
      }
      return success;
    } catch (err) {
      console.error('Error deleting feedback:', err);
      return false;
    }
  }, [ideaId, loadData]);

  const addReply = useCallback(async (feedbackId: string, reply: Omit<FeedbackReply, 'id'>): Promise<boolean> => {
    try {
      const success = publicFeedbackPersistence.addReply(ideaId, feedbackId, reply);
      if (success) {
        await loadData(); // Refresh data
      }
      return success;
    } catch (err) {
      console.error('Error adding reply:', err);
      return false;
    }
  }, [ideaId, loadData]);

  const updateReply = useCallback(async (feedbackId: string, replyId: string, updates: Partial<FeedbackReply>): Promise<boolean> => {
    try {
      const success = publicFeedbackPersistence.updateReply(ideaId, feedbackId, replyId, updates);
      if (success) {
        await loadData(); // Refresh data
      }
      return success;
    } catch (err) {
      console.error('Error updating reply:', err);
      return false;
    }
  }, [ideaId, loadData]);

  const deleteReply = useCallback(async (feedbackId: string, replyId: string): Promise<boolean> => {
    try {
      const success = publicFeedbackPersistence.deleteReply(ideaId, feedbackId, replyId);
      if (success) {
        await loadData(); // Refresh data
      }
      return success;
    } catch (err) {
      console.error('Error deleting reply:', err);
      return false;
    }
  }, [ideaId, loadData]);

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return {
    idea,
    feedback,
    loading,
    error,
    addFeedback,
    updateFeedback,
    deleteFeedback,
    addReply,
    updateReply,
    deleteReply,
    refreshData
  };
}
