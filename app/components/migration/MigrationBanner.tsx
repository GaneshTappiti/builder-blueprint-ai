// Migration Banner Component
// Shows migration status and allows users to run migration

import React from 'react';
import { useLocalStorageMigration } from '@/hooks/useLocalStorageMigration';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Database, 
  RefreshCw,
  X
} from 'lucide-react';

interface MigrationBannerProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function MigrationBanner({ onClose, showCloseButton = true }: MigrationBannerProps) {
  const {
    isComplete,
    canMigrate,
    isMigrating,
    error,
    lastResult,
    runMigration,
    checkMigrationStatus
  } = useLocalStorageMigration();

  const handleMigration = async () => {
    try {
      await runMigration();
    } catch (error) {
      console.error('Migration failed:', error);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Don't show banner if migration is complete and no errors
  if (isComplete && !error && !lastResult?.errors.length) {
    return null;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mb-6 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg">Data Migration Available</CardTitle>
            {isComplete && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            )}
            {isMigrating && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Migrating
              </Badge>
            )}
          </div>
          {showCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Migration failed: {error}
            </AlertDescription>
          </Alert>
        )}

        {lastResult && (
          <div className="space-y-2">
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-green-600">
                ✅ {lastResult.migrated} items migrated
              </span>
              {lastResult.skipped.length > 0 && (
                <span className="text-gray-600">
                  ⏭️ {lastResult.skipped.length} items skipped
                </span>
              )}
              {lastResult.errors.length > 0 && (
                <span className="text-red-600">
                  ❌ {lastResult.errors.length} errors
                </span>
              )}
            </div>
            
            {lastResult.errors.length > 0 && (
              <div className="text-xs text-red-600 space-y-1">
                {lastResult.errors.map((error, index) => (
                  <div key={index}>• {error}</div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="text-sm text-gray-600">
          {isComplete ? (
            <p>
              Your data has been successfully migrated to Supabase. 
              You can now access your data across all devices and sessions.
            </p>
          ) : canMigrate ? (
            <p>
              We've improved our data storage system! Your current data is stored locally 
              and will be migrated to our secure cloud database. This ensures your data 
              is backed up and accessible across all your devices.
            </p>
          ) : (
            <p>
              Migration status is being checked...
            </p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {canMigrate && !isMigrating && (
            <Button onClick={handleMigration} className="bg-blue-600 hover:bg-blue-700">
              <Database className="h-4 w-4 mr-2" />
              Start Migration
            </Button>
          )}
          
          {isMigrating && (
            <Button disabled className="bg-blue-600">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Migrating Data...
            </Button>
          )}
          
          {isComplete && (
            <Button variant="outline" onClick={checkMigrationStatus}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Status
            </Button>
          )}
        </div>

        {canMigrate && (
          <div className="text-xs text-gray-500">
            <p>
              <strong>What happens during migration:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Your ideas, projects, and settings will be copied to our secure database</li>
              <li>Your data will be accessible across all devices</li>
              <li>Local data will be removed after successful migration</li>
              <li>Migration is safe and can be run multiple times</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MigrationBanner;
