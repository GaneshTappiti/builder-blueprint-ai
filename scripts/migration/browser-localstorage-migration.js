
// Browser localStorage Migration Script
// Run this in your browser console or add to your app

console.log('🚀 Starting localStorage to Supabase migration...');

// localStorage keys to migrate
const LOCALSTORAGE_KEYS = [
  'builder-blueprint-history',
  'mvp_studio_projects', 
  'ideaforge_ideas',
  'ideaVault',
  'notificationPreferences',
  'chat-notification-preferences',
  'public_feedback_ideas'
];

// BMC canvas keys (dynamic)
const BMC_KEYS_PATTERN = /^bmc-/;

// Inventory localStorage data
function inventoryLocalStorageData() {
  console.log('📊 Inventorying localStorage data...');
  
  const inventory = {
    totalKeys: 0,
    totalSize: 0,
    dataTypes: {},
    bmcKeys: [],
    errors: []
  };
  
  // Check standard keys
  for (const key of LOCALSTORAGE_KEYS) {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const size = new Blob([data]).size;
        inventory.totalKeys++;
        inventory.totalSize += size;
        inventory.dataTypes[key] = {
          size: size,
          type: Array.isArray(JSON.parse(data)) ? 'array' : 'object',
          count: Array.isArray(JSON.parse(data)) ? JSON.parse(data).length : 1
        };
        console.log(`  📦 ${key}: ${size} bytes, ${inventory.dataTypes[key].count} items`);
      }
    } catch (error) {
      inventory.errors.push(`Failed to read ${key}: ${error.message}`);
    }
  }
  
  // Check BMC canvas keys
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && BMC_KEYS_PATTERN.test(key)) {
        const data = localStorage.getItem(key);
        if (data) {
          const size = new Blob([data]).size;
          inventory.totalKeys++;
          inventory.totalSize += size;
          inventory.bmcKeys.push({ key, size });
        }
      }
    }
    
    if (inventory.bmcKeys.length > 0) {
      console.log(`  🎨 BMC Canvas keys: ${inventory.bmcKeys.length} keys`);
    }
  } catch (error) {
    inventory.errors.push(`Failed to scan BMC keys: ${error.message}`);
  }
  
  console.log(`\n📊 Inventory Summary:`);
  console.log(`  Total keys: ${inventory.totalKeys}`);
  console.log(`  Total size: ${(inventory.totalSize / 1024).toFixed(2)} KB`);
  console.log(`  BMC keys: ${inventory.bmcKeys.length}`);
  console.log(`  Errors: ${inventory.errors.length}`);
  
  if (inventory.errors.length > 0) {
    console.warn('⚠️ Some errors occurred during inventory:');
    inventory.errors.forEach(error => console.log(`  ❌ ${error}`));
  }
  
  return inventory;
}

// Run the inventory
const inventory = inventoryLocalStorageData();

// Export for use in your app
window.localStorageInventory = inventory;
console.log('✅ localStorage inventory complete! Check window.localStorageInventory for results.');
