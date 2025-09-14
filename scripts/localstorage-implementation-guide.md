
# localStorage to Supabase Migration Implementation Guide

## 🎯 Overview
This guide helps you migrate all localStorage data to Supabase with proper conflict resolution, offline support, and automatic sync.

## 📋 Prerequisites
- ✅ Supabase project configured
- ✅ MCP server available
- ✅ User authentication working
- ✅ Database tables created

## 🚀 Implementation Steps

### 1. Run Database Migration
```bash
# Execute the SQL migration
node scripts/localstorage-migration.js
```

### 2. Update Components
Replace localStorage usage with Supabase calls:

#### Before (localStorage):
```typescript
// Save data
localStorage.setItem('key', JSON.stringify(data));

// Load data
const data = JSON.parse(localStorage.getItem('key') || '[]');
```

#### After (Supabase):
```typescript
import { localStorageSyncer } from '@/services/localStorageSyncer';

// Save data
await localStorageSyncer.saveToSupabase('table_name', data);

// Load data
const data = await localStorageSyncer.loadFromSupabase('table_name');
```

### 3. Add Sync Service
Import and initialize the sync service in your app:

```typescript
// In your main app component
import { localStorageSyncer } from '@/services/localStorageSyncer';

useEffect(() => {
  // Initialize sync on app start
  localStorageSyncer.syncAllData();
}, []);
```

### 4. Handle Offline Mode
The sync service automatically handles offline mode by queuing writes and syncing when online.

### 5. Test Migration
1. Run the migration script
2. Check that data appears in Supabase
3. Verify sync works in both directions
4. Test offline/online transitions
5. Clear localStorage after verification

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Sync Settings
- Auto-sync interval: 30 seconds
- Conflict resolution: lastModified timestamp
- Offline queue: unlimited (with retry limits)

## 📊 Monitoring

### Check Sync Status
```typescript
const status = localStorageSyncer.getSyncStatus();
console.log('Online:', status.isOnline);
console.log('Queue length:', status.queueLength);
console.log('Last sync:', status.lastSync);
```

### View Migration Progress
Check the browser console for detailed migration logs.

## 🚨 Troubleshooting

### Common Issues
1. **Authentication errors**: Ensure user is logged in
2. **Permission errors**: Check RLS policies
3. **Sync failures**: Check network connection
4. **Data conflicts**: Review conflict resolution strategy

### Debug Mode
Enable debug logging by setting `localStorage.debug = 'true'` in browser console.

## ✅ Success Criteria
- [ ] No critical data stored only in localStorage
- [ ] Data persists across browser sessions
- [ ] Sync works in both directions
- [ ] Offline mode queues writes properly
- [ ] Conflict resolution works correctly
- [ ] No data loss during migration

## 🎉 Benefits
- ✅ Data persistence across devices
- ✅ Real-time sync and collaboration
- ✅ Offline support with queue
- ✅ Conflict resolution
- ✅ Better data integrity
- ✅ Scalable storage solution
