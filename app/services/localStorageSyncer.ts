/**
 * localStorage to Supabase Syncer Service
 * 
 * This service handles migration of localStorage data to Supabase
 * with conflict resolution, offline support, and automatic sync.
 */

import { createClient } from '@supabase/supabase-js';

// Types for localStorage data mapping
interface LocalStorageMapping {
  key: string;
  table: string;
  userIdField: string;
  dataField: string;
  idField?: string;
}

interface SyncResult {
  success: boolean;
  migrated: number;
  errors: string[];
  conflicts: number;
}

interface ConflictResolution {
  strategy: 'local' | 'remote' | 'merge' | 'manual';
  resolved: boolean;
  data: any;
}

class LocalStorageSyncer {
  private supabase: any;
  private isOnline: boolean = navigator.onLine;
  private syncQueue: Array<{
    operation: 'create' | 'update' | 'delete';
    table: string;
    data: any;
    timestamp: number;
  }> = [];

  // Mapping of localStorage keys to Supabase tables
  private mappings: LocalStorageMapping[] = [
    {
      key: 'builder-blueprint-history',
      table: 'builder_context',
      userIdField: 'user_id',
      dataField: 'context_data',
      idField: 'project_id'
    },
    {
      key: 'mvp_studio_projects',
      table: 'mvp_studio_projects',
      userIdField: 'user_id',
      dataField: 'project_data',
      idField: 'project_id'
    },
    {
      key: 'ideaforge_ideas',
      table: 'ideaforge_data',
      userIdField: 'user_id',
      dataField: 'idea_data',
      idField: 'idea_id'
    },
    {
      key: 'ideaVault',
      table: 'ideas',
      userIdField: 'user_id',
      dataField: 'idea_data',
      idField: 'id'
    },
    {
      key: 'notificationPreferences',
      table: 'notification_preferences',
      userIdField: 'user_id',
      dataField: 'preferences'
    },
    {
      key: 'chat-notification-preferences',
      table: 'chat_notification_preferences',
      userIdField: 'user_id',
      dataField: 'preferences'
    }
  ];

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Auto-sync every 30 seconds when online
    setInterval(() => {
      if (this.isOnline) {
        this.syncAllData();
      }
    }, 30000);
  }

  /**
   * Migrate all localStorage data to Supabase
   */
  async migrateAllData(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      migrated: 0,
      errors: [],
      conflicts: 0
    };

    console.log('🔄 Starting localStorage to Supabase migration...');

    for (const mapping of this.mappings) {
      try {
        const localData = this.getLocalStorageData(mapping.key);
        if (!localData || (Array.isArray(localData) && localData.length === 0)) {
          console.log(`⏭️  Skipping ${mapping.key} - no data`);
          continue;
        }

        console.log(`📦 Migrating ${mapping.key}...`);
        const migrationResult = await this.migrateData(mapping, localData);
        
        result.migrated += migrationResult.migrated;
        result.conflicts += migrationResult.conflicts;
        result.errors.push(...migrationResult.errors);

        if (migrationResult.errors.length > 0) {
          result.success = false;
        }

      } catch (error) {
        const errorMsg = `Failed to migrate ${mapping.key}: ${error}`;
        console.error('❌', errorMsg);
        result.errors.push(errorMsg);
        result.success = false;
      }
    }

    console.log(`✅ Migration complete: ${result.migrated} items migrated, ${result.conflicts} conflicts, ${result.errors.length} errors`);
    return result;
  }

  /**
   * Migrate specific localStorage data
   */
  private async migrateData(mapping: LocalStorageMapping, localData: any): Promise<{
    migrated: number;
    conflicts: number;
    errors: string[];
  }> {
    const result = {
      migrated: 0,
      conflicts: 0,
      errors: []
    };

    try {
      // Get current user
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        result.errors.push('User not authenticated');
        return result;
      }

      // Handle array data (like ideas, projects)
      if (Array.isArray(localData)) {
        for (const item of localData) {
          try {
            const id = mapping.idField ? item[mapping.idField] : item.id || item.name || Date.now().toString();
            const conflictResolution = await this.handleConflict(
              mapping.table,
              mapping.idField || 'id',
              id,
              item,
              user.id
            );

            if (conflictResolution.resolved) {
              await this.saveToSupabase(mapping.table, {
                [mapping.userIdField]: user.id,
                [mapping.dataField]: item,
                [mapping.idField || 'id']: id,
                last_modified: new Date().toISOString()
              });

              result.migrated++;
            } else {
              result.conflicts++;
            }
          } catch (error) {
            result.errors.push(`Failed to migrate item ${item.id || 'unknown'}: ${error}`);
          }
        }
      } else {
        // Handle single object data (like preferences)
        const id = mapping.idField ? localData[mapping.idField] : 'default';
        const conflictResolution = await this.handleConflict(
          mapping.table,
          mapping.idField || 'id',
          id,
          localData,
          user.id
        );

        if (conflictResolution.resolved) {
          await this.saveToSupabase(mapping.table, {
            [mapping.userIdField]: user.id,
            [mapping.dataField]: localData,
            [mapping.idField || 'id']: id,
            last_modified: new Date().toISOString()
          });

          result.migrated++;
        } else {
          result.conflicts++;
        }
      }
    } catch (error) {
      result.errors.push(`Migration failed: ${error}`);
    }

    return result;
  }

  /**
   * Handle conflicts between local and remote data
   */
  private async handleConflict(
    table: string,
    idField: string,
    id: string,
    localData: any,
    userId: string
  ): Promise<ConflictResolution> {
    try {
      // Check if data exists in Supabase
      const { data: existingData, error } = await this.supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .eq(idField, id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (!existingData) {
        // No conflict - safe to create
        return {
          strategy: 'local',
          resolved: true,
          data: localData
        };
      }

      // Conflict exists - resolve based on lastModified
      const localModified = localData.lastModified || localData.updatedAt || localData.createdAt || 0;
      const remoteModified = new Date(existingData.last_modified || existingData.updated_at || existingData.created_at).getTime();

      if (localModified > remoteModified) {
        // Local data is newer
        return {
          strategy: 'local',
          resolved: true,
          data: localData
        };
      } else if (remoteModified > localModified) {
        // Remote data is newer
        return {
          strategy: 'remote',
          resolved: false,
          data: existingData
        };
      } else {
        // Same timestamp - merge if possible
        return this.mergeData(localData, existingData[mapping.dataField]);
      }
    } catch (error) {
      console.error('Conflict resolution failed:', error);
      return {
        strategy: 'manual',
        resolved: false,
        data: localData
      };
    }
  }

  /**
   * Merge local and remote data
   */
  private mergeData(localData: any, remoteData: any): ConflictResolution {
    try {
      // Simple merge strategy - prefer non-null values
      const merged = { ...remoteData };
      
      for (const key in localData) {
        if (localData[key] !== null && localData[key] !== undefined) {
          if (typeof localData[key] === 'object' && typeof merged[key] === 'object') {
            merged[key] = { ...merged[key], ...localData[key] };
          } else {
            merged[key] = localData[key];
          }
        }
      }

      return {
        strategy: 'merge',
        resolved: true,
        data: merged
      };
    } catch (error) {
      return {
        strategy: 'manual',
        resolved: false,
        data: localData
      };
    }
  }

  /**
   * Save data to Supabase
   */
  private async saveToSupabase(table: string, data: any): Promise<void> {
    if (!this.isOnline) {
      // Queue for later sync
      this.syncQueue.push({
        operation: 'create',
        table,
        data,
        timestamp: Date.now()
      });
      return;
    }

    const { error } = await this.supabase
      .from(table)
      .upsert(data, { onConflict: 'user_id,id' });

    if (error) {
      throw error;
    }
  }

  /**
   * Get data from localStorage
   */
  private getLocalStorageData(key: string): any {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Failed to parse localStorage data for ${key}:`, error);
      return null;
    }
  }

  /**
   * Sync all data from Supabase to localStorage (for offline access)
   */
  async syncFromSupabase(): Promise<void> {
    if (!this.isOnline) {
      console.log('📴 Offline - skipping sync from Supabase');
      return;
    }

    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        console.log('👤 No user - skipping sync');
        return;
      }

      console.log('🔄 Syncing data from Supabase to localStorage...');

      for (const mapping of this.mappings) {
        try {
          const { data, error } = await this.supabase
            .from(mapping.table)
            .select('*')
            .eq('user_id', user.id);

          if (error) {
            console.error(`Failed to fetch ${mapping.table}:`, error);
            continue;
          }

          if (data && data.length > 0) {
            // Convert back to localStorage format
            const localData = data.map(item => item[mapping.dataField]);
            
            if (Array.isArray(localData) && localData.length === 1) {
              // Single object - store as object
              localStorage.setItem(mapping.key, JSON.stringify(localData[0]));
            } else {
              // Array - store as array
              localStorage.setItem(mapping.key, JSON.stringify(localData));
            }

            console.log(`✅ Synced ${mapping.key}: ${localData.length} items`);
          }
        } catch (error) {
          console.error(`Failed to sync ${mapping.key}:`, error);
        }
      }
    } catch (error) {
      console.error('Sync from Supabase failed:', error);
    }
  }

  /**
   * Sync all data from localStorage to Supabase
   */
  async syncToSupabase(): Promise<void> {
    if (!this.isOnline) {
      console.log('📴 Offline - queuing sync to Supabase');
      return;
    }

    await this.migrateAllData();
  }

  /**
   * Sync all data (bidirectional)
   */
  async syncAllData(): Promise<void> {
    console.log('🔄 Starting bidirectional sync...');
    
    // First, sync from Supabase to localStorage (get latest remote data)
    await this.syncFromSupabase();
    
    // Then, sync from localStorage to Supabase (push local changes)
    await this.syncToSupabase();
  }

  /**
   * Process queued sync operations
   */
  private async processSyncQueue(): Promise<void> {
    if (this.syncQueue.length === 0) {
      return;
    }

    console.log(`🔄 Processing ${this.syncQueue.length} queued operations...`);

    for (const operation of this.syncQueue) {
      try {
        if (operation.operation === 'create' || operation.operation === 'update') {
          await this.saveToSupabase(operation.table, operation.data);
        }
        // Handle delete operations if needed
      } catch (error) {
        console.error('Failed to process queued operation:', error);
      }
    }

    this.syncQueue = [];
    console.log('✅ Queue processed');
  }

  /**
   * Clear all localStorage data (after successful migration)
   */
  clearLocalStorageData(): void {
    console.log('🧹 Clearing localStorage data...');
    
    for (const mapping of this.mappings) {
      localStorage.removeItem(mapping.key);
    }

    // Clear BMC canvas data
    const bmcKeys = Object.keys(localStorage).filter(key => key.startsWith('bmc-'));
    bmcKeys.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('bmc-canvas');

    console.log('✅ localStorage cleared');
  }

  /**
   * Get sync status
   */
  getSyncStatus(): {
    isOnline: boolean;
    queueLength: number;
    lastSync: Date | null;
  } {
    return {
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length,
      lastSync: this.lastSync
    };
  }

  private lastSync: Date | null = null;
}

// Export singleton instance
export const localStorageSyncer = new LocalStorageSyncer();
export default localStorageSyncer;
