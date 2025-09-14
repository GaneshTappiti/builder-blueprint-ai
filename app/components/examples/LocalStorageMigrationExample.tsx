/**
 * Example Component: localStorage to Supabase Migration
 * 
 * This component shows how to update existing components to use Supabase
 * instead of localStorage for data persistence.
 */

import React, { useState, useEffect } from 'react';
import { localStorageSyncer } from '@/services/localStorageSyncer';

// Example: Migrating Idea Vault component
export function IdeaVaultMigrationExample() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load ideas from Supabase instead of localStorage
  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      setLoading(true);
      
      // OLD WAY (localStorage):
      // const storedIdeas = JSON.parse(localStorage.getItem('ideaVault') || '[]');
      // setIdeas(storedIdeas);
      
      // NEW WAY (Supabase):
      const data = await localStorageSyncer.loadFromSupabase('ideas');
      setIdeas(data || []);
      
    } catch (err) {
      console.error('Failed to load ideas:', err);
      setError('Failed to load ideas');
      
      // Fallback to localStorage if Supabase fails
      try {
        const fallbackIdeas = JSON.parse(localStorage.getItem('ideaVault') || '[]');
        setIdeas(fallbackIdeas);
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveIdea = async (idea) => {
    try {
      // OLD WAY (localStorage):
      // const existingIdeas = JSON.parse(localStorage.getItem('ideaVault') || '[]');
      // const updatedIdeas = [...existingIdeas, idea];
      // localStorage.setItem('ideaVault', JSON.stringify(updatedIdeas));
      // setIdeas(updatedIdeas);
      
      // NEW WAY (Supabase):
      const updatedIdeas = [...ideas, idea];
      await localStorageSyncer.saveToSupabase('ideas', updatedIdeas);
      setIdeas(updatedIdeas);
      
    } catch (err) {
      console.error('Failed to save idea:', err);
      setError('Failed to save idea');
    }
  };

  if (loading) return <div>Loading ideas...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Ideas ({ideas.length})</h2>
      {/* Render ideas */}
    </div>
  );
}

// Example: Migrating MVP Studio component
export function MVPStudioMigrationExample() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      
      // NEW WAY (Supabase):
      const data = await localStorageSyncer.loadFromSupabase('mvp_studio_projects');
      setProjects(data || []);
      
    } catch (err) {
      console.error('Failed to load projects:', err);
      
      // Fallback to localStorage
      try {
        const fallbackProjects = JSON.parse(localStorage.getItem('mvp_studio_projects') || '[]');
        setProjects(fallbackProjects);
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveProject = async (project) => {
    try {
      const updatedProjects = [...projects, project];
      await localStorageSyncer.saveToSupabase('mvp_studio_projects', updatedProjects);
      setProjects(updatedProjects);
    } catch (err) {
      console.error('Failed to save project:', err);
    }
  };

  if (loading) return <div>Loading projects...</div>;

  return (
    <div>
      <h2>MVP Projects ({projects.length})</h2>
      {/* Render projects */}
    </div>
  );
}

// Example: Migrating BMC Canvas component
export function BMCCanvasMigrationExample({ ideaId }) {
  const [canvas, setCanvas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCanvas();
  }, [ideaId]);

  const loadCanvas = async () => {
    try {
      setLoading(true);
      
      // NEW WAY (Supabase):
      const canvasId = `bmc-${ideaId}`;
      const data = await localStorageSyncer.loadFromSupabase('bmc_canvas_data', canvasId);
      setCanvas(data);
      
    } catch (err) {
      console.error('Failed to load canvas:', err);
      
      // Fallback to localStorage
      try {
        const fallbackCanvas = JSON.parse(localStorage.getItem(`bmc-${ideaId}`) || 'null');
        setCanvas(fallbackCanvas);
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveCanvas = async (canvasData) => {
    try {
      const canvasId = `bmc-${ideaId}`;
      await localStorageSyncer.saveToSupabase('bmc_canvas_data', canvasData, canvasId);
      setCanvas(canvasData);
    } catch (err) {
      console.error('Failed to save canvas:', err);
    }
  };

  if (loading) return <div>Loading canvas...</div>;

  return (
    <div>
      <h2>Business Model Canvas</h2>
      {/* Render canvas */}
    </div>
  );
}

// Example: Migrating Notification Settings component
export function NotificationSettingsMigrationExample() {
  const [preferences, setPreferences] = useState({
    browserNotifications: false,
    toastNotifications: true,
    soundNotifications: true,
    mentionNotifications: true,
    messageNotifications: true,
    callNotifications: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      // NEW WAY (Supabase):
      const data = await localStorageSyncer.loadFromSupabase('notification_preferences');
      if (data) {
        setPreferences(data);
      }
    } catch (err) {
      console.error('Failed to load preferences:', err);
      
      // Fallback to localStorage
      try {
        const fallbackPrefs = JSON.parse(localStorage.getItem('notificationPreferences') || '{}');
        setPreferences(fallbackPrefs);
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
    }
  };

  const savePreferences = async (newPreferences) => {
    try {
      await localStorageSyncer.saveToSupabase('notification_preferences', newPreferences);
      setPreferences(newPreferences);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    }
  };

  return (
    <div>
      <h2>Notification Settings</h2>
      {/* Render preferences form */}
    </div>
  );
}

// Example: Sync Status Component
export function SyncStatusComponent() {
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    const updateStatus = () => {
      const status = localStorageSyncer.getSyncStatus();
      setSyncStatus(status);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!syncStatus) return null;

  return (
    <div className="sync-status">
      <div className={`status-indicator ${syncStatus.isOnline ? 'online' : 'offline'}`}>
        {syncStatus.isOnline ? '🟢 Online' : '🔴 Offline'}
      </div>
      {syncStatus.queueLength > 0 && (
        <div className="queue-indicator">
          📤 {syncStatus.queueLength} items queued
        </div>
      )}
      {syncStatus.lastSync && (
        <div className="last-sync">
          Last sync: {new Date(syncStatus.lastSync).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

export default {
  IdeaVaultMigrationExample,
  MVPStudioMigrationExample,
  BMCCanvasMigrationExample,
  NotificationSettingsMigrationExample,
  SyncStatusComponent
};
