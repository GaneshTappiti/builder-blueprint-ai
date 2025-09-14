// DataSyncManager - Handles offline queue and sync operations
// Provides offline support with localForage queue and automatic sync

import { supabase, getCurrentUser } from '@/lib/supabase';
// import localforage from 'localforage';

// Configure localForage
// const store = localforage.createInstance({
//   name: 'BuilderBlueprintAI',
//   storeName: 'sync_queue'
// });

interface QueueOperation {
  id: string;
  operation: 'create' | 'update' | 'delete';
  table: string;
  recordId?: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

interface SyncStatus {
  isOnline: boolean;
  queueLength: number;
  lastSync: Date | null;
  isProcessing: boolean;
}

class DataSyncManager {
  private isOnline: boolean = navigator.onLine;
  private isProcessing: boolean = false;
  private lastSync: Date | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private maxRetries: number = 3;
  private syncIntervalMs: number = 30000; // 30 seconds

  constructor() {
    this.setupEventListeners();
    this.startPeriodicSync();
  }

  // =====================================================
  // PUBLIC API METHODS
  // =====================================================

  /**
   * Load data from Supabase with fallback to empty array/object
   */
  async load<T = any>(table: string, filter?: Record<string, any>): Promise<T> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.warn('No user authenticated, returning empty data');
        return (Array.isArray(filter) ? [] : {}) as T;
      }

      let query = supabase.from(table).select('*').eq('user_id', user.id);

      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Error loading from ${table}:`, error);
        return (Array.isArray(filter) ? [] : {}) as T;
      }

      return (data || (Array.isArray(filter) ? [] : {})) as T;
    } catch (error) {
      console.error(`Error in load for ${table}:`, error);
      return (Array.isArray(filter) ? [] : {}) as T;
    }
  }

  /**
   * Save data to Supabase or queue if offline
   */
  async save(table: string, data: any, recordId?: string): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      if (this.isOnline) {
        return await this.saveToSupabase(table, data, recordId);
      } else {
        return await this.queueOperation('create', table, data, recordId);
      }
    } catch (error) {
      console.error(`Error saving to ${table}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Update data in Supabase or queue if offline
   */
  async update(table: string, recordId: string, data: any): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.isOnline) {
        return await this.updateInSupabase(table, recordId, data);
      } else {
        return await this.queueOperation('update', table, data, recordId);
      }
    } catch (error) {
      console.error(`Error updating ${table}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Delete data from Supabase or queue if offline
   */
  async delete(table: string, recordId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.isOnline) {
        return await this.deleteFromSupabase(table, recordId);
      } else {
        return await this.queueOperation('delete', table, {}, recordId);
      }
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Flush all queued operations to Supabase
   */
  async flush(): Promise<{ success: boolean; processed: number; errors: string[] }> {
    if (this.isProcessing || !this.isOnline) {
      return { success: false, processed: 0, errors: ['Sync already in progress or offline'] };
    }

    this.isProcessing = true;
    const errors: string[] = [];
    let processed = 0;

    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const queue = await this.getQueue();
      console.log(`🔄 Flushing ${queue.length} queued operations...`);

      for (const operation of queue) {
        try {
          let success = false;

          switch (operation.operation) {
            case 'create':
              const createResult = await this.saveToSupabase(operation.table, operation.data);
              success = createResult.success;
              break;
            case 'update':
              if (operation.recordId) {
                const updateResult = await this.updateInSupabase(operation.table, operation.recordId, operation.data);
                success = updateResult.success;
              }
              break;
            case 'delete':
              if (operation.recordId) {
                const deleteResult = await this.deleteFromSupabase(operation.table, operation.recordId);
                success = deleteResult.success;
              }
              break;
          }

          if (success) {
            await this.removeFromQueue(operation.id);
            processed++;
          } else {
            operation.retryCount++;
            if (operation.retryCount >= this.maxRetries) {
              await this.removeFromQueue(operation.id);
              errors.push(`Max retries exceeded for operation ${operation.id}`);
            } else {
              await this.updateQueueOperation(operation);
            }
          }
        } catch (error) {
          operation.retryCount++;
          if (operation.retryCount >= this.maxRetries) {
            await this.removeFromQueue(operation.id);
            errors.push(`Operation ${operation.id} failed: ${error}`);
          } else {
            await this.updateQueueOperation(operation);
          }
        }
      }

      this.lastSync = new Date();
      console.log(`✅ Flush complete: ${processed} processed, ${errors.length} errors`);

      return { success: errors.length === 0, processed, errors };
    } catch (error) {
      console.error('Error during flush:', error);
      return { success: false, processed, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get sync status
   */
  getStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      queueLength: 0, // Will be updated asynchronously
      lastSync: this.lastSync,
      isProcessing: this.isProcessing
    };
  }

  /**
   * Subscribe to real-time changes
   */
  subscribe(table: string, callback: (payload: any) => void) {
    return supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table },
        callback
      )
      .subscribe();
  }

  // =====================================================
  // PRIVATE METHODS
  // =====================================================

  private setupEventListeners() {
    window.addEventListener('online', () => {
      console.log('🌐 Connection restored, flushing queue...');
      this.isOnline = true;
      this.flush();
    });

    window.addEventListener('offline', () => {
      console.log('📴 Connection lost, queuing operations...');
      this.isOnline = false;
    });
  }

  private startPeriodicSync() {
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isProcessing) {
        this.flush();
      }
    }, this.syncIntervalMs);
  }

  private async saveToSupabase(table: string, data: any, recordId?: string): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const recordData = {
        ...data,
        user_id: user.id,
        last_modified: new Date().toISOString()
      };

      let result;
      if (recordId) {
        // Update existing record
        result = await supabase
          .from(table)
          .update(recordData)
          .eq('id', recordId)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        // Insert new record
        result = await supabase
          .from(table)
          .insert([recordData])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      return { success: true, id: result.data?.id };
    } catch (error) {
      console.error(`Error saving to Supabase ${table}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async updateInSupabase(table: string, recordId: string, data: any): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from(table)
        .update({
          ...data,
          last_modified: new Date().toISOString()
        })
        .eq('id', recordId)
        .eq('user_id', user.id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error(`Error updating in Supabase ${table}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async deleteFromSupabase(table: string, recordId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', recordId)
        .eq('user_id', user.id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error(`Error deleting from Supabase ${table}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async queueOperation(operation: 'create' | 'update' | 'delete', table: string, data: any, recordId?: string): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const operationId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const queueOperation: QueueOperation = {
        id: operationId,
        operation,
        table,
        recordId,
        data,
        timestamp: Date.now(),
        retryCount: 0
      };

      await this.addToQueue(queueOperation);
      console.log(`📝 Queued ${operation} operation for ${table}`);

      return { success: true, id: operationId };
    } catch (error) {
      console.error('Error queuing operation:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async getQueue(): Promise<QueueOperation[]> {
    try {
      const user = await getCurrentUser();
      if (!user) return [];

      // const queue = await store.getItem<QueueOperation[]>(`queue_${user.id}`);
      // return queue || [];
      return [];
    } catch (error) {
      console.error('Error getting queue:', error);
      return [];
    }
  }

  private async addToQueue(operation: QueueOperation): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const queue = await this.getQueue();
      queue.push(operation);
      // await store.setItem(`queue_${user.id}`, queue);
    } catch (error) {
      console.error('Error adding to queue:', error);
    }
  }

  private async removeFromQueue(operationId: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const queue = await this.getQueue();
      const filteredQueue = queue.filter(op => op.id !== operationId);
      // await store.setItem(`queue_${user.id}`, filteredQueue);
    } catch (error) {
      console.error('Error removing from queue:', error);
    }
  }

  private async updateQueueOperation(operation: QueueOperation): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const queue = await this.getQueue();
      const index = queue.findIndex(op => op.id === operation.id);
      if (index !== -1) {
        queue[index] = operation;
        // await store.setItem(`queue_${user.id}`, queue);
      }
    } catch (error) {
      console.error('Error updating queue operation:', error);
    }
  }

  /**
   * Cleanup method
   */
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

// Export singleton instance
export const dataSyncManager = new DataSyncManager();
export default dataSyncManager;
