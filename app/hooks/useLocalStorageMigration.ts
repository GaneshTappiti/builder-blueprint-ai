// Hook for localStorage to Supabase migration
// Provides migration status and triggers migration when needed

import { useState, useEffect, useCallback } from 'react';
import { localStorageMigration } from '@/services/LocalStorageMigration';

interface MigrationStatus {
  isComplete: boolean;
  canMigrate: boolean;
  isMigrating: boolean;
  error?: string;
  lastResult?: {
    success: boolean;
    migrated: number;
    errors: string[];
    skipped: string[];
  };
}

export function useLocalStorageMigration() {
  const [status, setStatus] = useState<MigrationStatus>({
    isComplete: false,
    canMigrate: false,
    isMigrating: false
  });

  // Check migration status on mount
  useEffect(() => {
    checkMigrationStatus();
  }, []);

  const checkMigrationStatus = useCallback(async () => {
    try {
      const migrationStatus = await localStorageMigration.getMigrationStatus();
      setStatus(prev => ({
        ...prev,
        ...migrationStatus,
        isMigrating: false
      }));
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        isComplete: false,
        canMigrate: false,
        isMigrating: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, []);

  const runMigration = useCallback(async () => {
    if (status.isMigrating || status.isComplete) {
      return;
    }

    setStatus(prev => ({ ...prev, isMigrating: true, error: undefined }));

    try {
      const result = await localStorageMigration.migrateAllData();
      
      setStatus(prev => ({
        ...prev,
        isMigrating: false,
        isComplete: result.success,
        canMigrate: !result.success,
        lastResult: result
      }));

      // Refresh the page after successful migration to ensure all components use Supabase
      if (result.success && result.migrated > 0) {
        console.log('🔄 Migration successful, refreshing page...');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(prev => ({
        ...prev,
        isMigrating: false,
        error: errorMessage
      }));
      throw error;
    }
  }, [status.isMigrating, status.isComplete]);

  return {
    ...status,
    runMigration,
    checkMigrationStatus
  };
}
