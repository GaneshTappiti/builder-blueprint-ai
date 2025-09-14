// In-browser localStorage to Supabase Migration
// This service handles one-time migration of localStorage data to Supabase

import { supabase, getCurrentUser } from '@/lib/supabase';

interface MigrationMapping {
  key: string;
  table: string;
  transform: (data: any) => any;
  userIdField: string;
  dataField: string;
  idField?: string;
}

interface MigrationResult {
  success: boolean;
  migrated: number;
  errors: string[];
  skipped: string[];
}

class LocalStorageMigration {
  private readonly MIGRATION_FLAG_KEY = 'migration_localstorage_done';
  
  // Mapping of localStorage keys to Supabase tables
  private readonly mappings: MigrationMapping[] = [
    {
      key: 'ideaVault',
      table: 'ideas',
      transform: (data) => data,
      userIdField: 'user_id',
      dataField: 'idea_data',
      idField: 'id'
    },
    {
      key: 'mvp_studio_projects',
      table: 'mvp_studio_projects',
      transform: (data) => data,
      userIdField: 'user_id',
      dataField: 'project_data',
      idField: 'project_id'
    },
    {
      key: 'builder-blueprint-history',
      table: 'builder_context',
      transform: (data) => data,
      userIdField: 'user_id',
      dataField: 'context_data',
      idField: 'project_id'
    },
    {
      key: 'ideaforge_ideas',
      table: 'ideaforge_data',
      transform: (data) => data,
      userIdField: 'user_id',
      dataField: 'idea_data',
      idField: 'idea_id'
    },
    {
      key: 'public_feedback_ideas',
      table: 'public_feedback_ideas',
      transform: (data) => data,
      userIdField: 'user_id',
      dataField: 'feedback_data',
      idField: 'id'
    },
    {
      key: 'notificationPreferences',
      table: 'notification_preferences',
      transform: (data) => data,
      userIdField: 'user_id',
      dataField: 'preferences',
      idField: 'id'
    },
    {
      key: 'chat-notification-preferences',
      table: 'chat_notification_preferences',
      transform: (data) => data,
      userIdField: 'user_id',
      dataField: 'preferences',
      idField: 'id'
    }
  ];

  // BMC Canvas data mapping (dynamic keys)
  private readonly bmcMapping: MigrationMapping = {
    key: 'bmc-*',
    table: 'bmc_canvas_data',
    transform: (data) => data,
    userIdField: 'user_id',
    dataField: 'canvas_data',
    idField: 'canvas_id'
  };

  /**
   * Check if migration has already been completed
   */
  async isMigrationComplete(): Promise<boolean> {
    try {
      const user = await getCurrentUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_settings')
        .select('value')
        .eq('user_id', user.id)
        .eq('key', this.MIGRATION_FLAG_KEY)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking migration status:', error);
        return false;
      }

      return data?.value === true;
    } catch (error) {
      console.error('Error checking migration status:', error);
      return false;
    }
  }

  /**
   * Run the complete migration process
   */
  async migrateAllData(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migrated: 0,
      errors: [],
      skipped: []
    };

    try {
      console.log('🔄 Starting localStorage to Supabase migration...');

      // Check if already migrated
      if (await this.isMigrationComplete()) {
        console.log('✅ Migration already completed, skipping...');
        return result;
      }

      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Migrate each localStorage key
      for (const mapping of this.mappings) {
        try {
          const migrationResult = await this.migrateKey(mapping, user.id);
          result.migrated += migrationResult.migrated;
          result.errors.push(...migrationResult.errors);
          result.skipped.push(...migrationResult.skipped);
        } catch (error) {
          const errorMsg = `Failed to migrate ${mapping.key}: ${error}`;
          console.error('❌', errorMsg);
          result.errors.push(errorMsg);
          result.success = false;
        }
      }

      // Migrate BMC canvas data (dynamic keys)
      try {
        const bmcResult = await this.migrateBMCData(user.id);
        result.migrated += bmcResult.migrated;
        result.errors.push(...bmcResult.errors);
        result.skipped.push(...bmcResult.skipped);
      } catch (error) {
        const errorMsg = `Failed to migrate BMC data: ${error}`;
        console.error('❌', errorMsg);
        result.errors.push(errorMsg);
        result.success = false;
      }

      // Mark migration as complete
      if (result.success || result.migrated > 0) {
        await this.markMigrationComplete(user.id);
        console.log(`✅ Migration complete: ${result.migrated} items migrated, ${result.errors.length} errors`);
      }

      return result;
    } catch (error) {
      console.error('❌ Migration failed:', error);
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      return result;
    }
  }

  /**
   * Migrate a specific localStorage key
   */
  private async migrateKey(mapping: MigrationMapping, userId: string): Promise<{
    success: boolean;
    migrated: number;
    errors: string[];
    skipped: string[];
  }> {
    const result: {
      success: boolean;
      migrated: number;
      errors: string[];
      skipped: string[];
    } = {
      success: true,
      migrated: 0,
      errors: [],
      skipped: []
    };

    try {
      const rawData = localStorage.getItem(mapping.key);
      if (!rawData) {
        console.log(`⏭️  Skipping ${mapping.key} - no data`);
        result.skipped.push(mapping.key);
        return result;
      }

      const data = JSON.parse(rawData);
      if (!data || (Array.isArray(data) && data.length === 0)) {
        console.log(`⏭️  Skipping ${mapping.key} - empty data`);
        result.skipped.push(mapping.key);
        return result;
      }

      console.log(`📦 Migrating ${mapping.key}...`);

      // Handle array data
      if (Array.isArray(data)) {
        for (const item of data) {
          try {
            const transformedData = mapping.transform(item);
            const recordData = {
              [mapping.userIdField]: userId,
              [mapping.dataField]: transformedData,
              last_modified: new Date().toISOString()
            };

            // Add ID field if specified
            if (mapping.idField && item.id) {
              recordData[mapping.idField] = item.id;
            }

            const { error } = await supabase
              .from(mapping.table)
              .upsert(recordData, { 
                onConflict: mapping.idField ? `${mapping.userIdField},${mapping.idField}` : mapping.userIdField 
              });

            if (error) throw error;
            result.migrated++;
          } catch (error) {
            result.errors.push(`Failed to migrate item in ${mapping.key}: ${error}`);
          }
        }
      } else {
        // Handle single object data
        const transformedData = mapping.transform(data);
        const recordData = {
          [mapping.userIdField]: userId,
          [mapping.dataField]: transformedData,
          last_modified: new Date().toISOString()
        };

        // Add ID field if specified
        if (mapping.idField && data.id) {
          recordData[mapping.idField] = data.id;
        }

        const { error } = await supabase
          .from(mapping.table)
          .upsert(recordData, { 
            onConflict: mapping.idField ? `${mapping.userIdField},${mapping.idField}` : mapping.userIdField 
          });

        if (error) throw error;
        result.migrated++;
      }

      // Remove from localStorage after successful migration
      localStorage.removeItem(mapping.key);
      console.log(`✅ Migrated ${mapping.key}: ${result.migrated} items`);

    } catch (error) {
      result.errors.push(`Failed to migrate ${mapping.key}: ${error}`);
    }

    return result;
  }

  /**
   * Migrate BMC canvas data (dynamic keys)
   */
  private async migrateBMCData(userId: string): Promise<{
    success: boolean;
    migrated: number;
    errors: string[];
    skipped: string[];
  }> {
    const result: {
      success: boolean;
      migrated: number;
      errors: string[];
      skipped: string[];
    } = {
      success: true,
      migrated: 0,
      errors: [],
      skipped: []
    };

    try {
      // Find all BMC-related keys
      const bmcKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('bmc-') || key === 'bmc-canvas'
      );

      if (bmcKeys.length === 0) {
        console.log('⏭️  No BMC canvas data to migrate');
        result.skipped.push('bmc-*');
        return result;
      }

      console.log(`📦 Migrating ${bmcKeys.length} BMC canvas items...`);

      for (const key of bmcKeys) {
        try {
          const rawData = localStorage.getItem(key);
          if (!rawData) continue;

          const data = JSON.parse(rawData);
          if (!data) continue;

          const transformedData = this.bmcMapping.transform(data);
          const recordData = {
            [this.bmcMapping.userIdField]: userId,
            canvas_id: key,
            [this.bmcMapping.dataField]: transformedData,
            last_modified: new Date().toISOString()
          };

          // Extract idea ID if it's a bmc-{ideaId} key
          if (key.startsWith('bmc-') && key !== 'bmc-canvas') {
            const ideaId = key.replace('bmc-', '');
            recordData.idea_id = ideaId;
          }

          const { error } = await supabase
            .from(this.bmcMapping.table)
            .upsert(recordData, { 
              onConflict: `${this.bmcMapping.userIdField},canvas_id` 
            });

          if (error) throw error;

          // Remove from localStorage after successful migration
          localStorage.removeItem(key);
          result.migrated++;
        } catch (error) {
          result.errors.push(`Failed to migrate BMC key ${key}: ${error}`);
        }
      }

      console.log(`✅ Migrated BMC canvas data: ${result.migrated} items`);

    } catch (error) {
      result.errors.push(`Failed to migrate BMC data: ${error}`);
    }

    return result;
  }

  /**
   * Mark migration as complete
   */
  private async markMigrationComplete(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          key: this.MIGRATION_FLAG_KEY,
          value: true,
          last_modified: new Date().toISOString()
        }, { onConflict: 'user_id,key' });

      if (error) throw error;
      console.log('✅ Migration marked as complete');
    } catch (error) {
      console.error('❌ Failed to mark migration as complete:', error);
    }
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(): Promise<{
    isComplete: boolean;
    canMigrate: boolean;
    error?: string;
  }> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return { isComplete: false, canMigrate: false, error: 'User not authenticated' };
      }

      const isComplete = await this.isMigrationComplete();
      return { isComplete, canMigrate: !isComplete };
    } catch (error) {
      return { 
        isComplete: false, 
        canMigrate: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Export singleton instance
export const localStorageMigration = new LocalStorageMigration();
export default localStorageMigration;
