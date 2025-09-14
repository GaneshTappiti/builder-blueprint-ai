
# 🚀 localStorage to Supabase Migration Instructions

## ✅ Database Tables Created
The following Supabase tables have been created to replace localStorage:

1. **user_settings** - General user settings
2. **user_drafts** - Ephemeral drafts (messages, forms)
3. **builder_context** - Builder context and project history
4. **mvp_studio_projects** - MVP Studio project data
5. **ideaforge_data** - Idea Forge storage data
6. **bmc_canvas_data** - Business Model Canvas data
7. **notification_preferences** - Notification settings
8. **chat_notification_preferences** - Chat notification settings
9. **public_feedback_ideas** - Public feedback data
10. **offline_queue** - Offline write queue

## 🔧 Next Steps

### 1. Run Browser Inventory
Open your browser console and run:
```javascript
// Copy and paste the contents of browser-localstorage-migration.js
// This will inventory your localStorage data
```

### 2. Update Your Components
Replace localStorage calls with Supabase calls using the localStorageSyncer service:

```typescript
import { localStorageSyncer } from '@/services/localStorageSyncer';

// Instead of localStorage.setItem()
await localStorageSyncer.saveToSupabase('table_name', data);

// Instead of localStorage.getItem()
const data = await localStorageSyncer.loadFromSupabase('table_name');
```

### 3. Initialize Sync Service
Add to your main app component:

```typescript
import { localStorageSyncer } from '@/services/localStorageSyncer';

useEffect(() => {
  // Start automatic sync
  localStorageSyncer.syncAllData();
}, []);
```

### 4. Test Migration
1. Open your app in the browser
2. Check that data loads from Supabase
3. Verify sync works in both directions
4. Test offline/online transitions

## 📊 Migration Status
- ✅ Database tables created
- ✅ Sync service implemented
- ✅ Conflict resolution ready
- ✅ Offline queue implemented
- 🔄 Component updates needed
- 🔄 Testing required

## 🎯 Benefits
- ✅ No data loss on browser refresh
- ✅ Data syncs across devices
- ✅ Offline support with queue
- ✅ Conflict resolution
- ✅ Unlimited storage (vs 5MB localStorage limit)

## 🚨 Important Notes
- Always backup your data before migration
- Test thoroughly before clearing localStorage
- Monitor sync status in console
- Check for any errors during migration

## 📞 Support
If you encounter issues:
1. Check browser console for errors
2. Verify Supabase connection
3. Check RLS policies
4. Review the localStorageSyncer service logs
