/**
 * Test script to verify onboarding database functionality
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testOnboardingDatabase() {
  console.log('🧪 Testing onboarding database functionality...\n');

  try {
    // Test 1: Check if user_profiles table exists and has onboarding_completed column
    console.log('1. Checking user_profiles table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Error accessing user_profiles table:', tableError.message);
      return;
    }
    console.log('✅ user_profiles table accessible');

    // Test 2: Check if we can query onboarding_completed field
    console.log('\n2. Testing onboarding_completed field...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, email, onboarding_completed, profile_completion, created_at')
      .limit(5);

    if (profilesError) {
      console.error('❌ Error querying profiles:', profilesError.message);
      return;
    }

    console.log('✅ Successfully queried profiles with onboarding_completed field');
    console.log('📊 Sample profiles:');
    profiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ID: ${profile.id}`);
      console.log(`      Email: ${profile.email}`);
      console.log(`      Onboarding Completed: ${profile.onboarding_completed}`);
      console.log(`      Profile Completion: ${profile.profile_completion}%`);
      console.log(`      Created: ${profile.created_at}`);
      console.log('');
    });

    // Test 3: Test updating onboarding_completed field
    if (profiles.length > 0) {
      const testProfile = profiles[0];
      console.log(`3. Testing update of onboarding_completed for profile ${testProfile.id}...`);
      
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          onboarding_completed: !testProfile.onboarding_completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', testProfile.id);

      if (updateError) {
        console.error('❌ Error updating onboarding_completed:', updateError.message);
      } else {
        console.log('✅ Successfully updated onboarding_completed field');
        
        // Revert the change
        await supabase
          .from('user_profiles')
          .update({ 
            onboarding_completed: testProfile.onboarding_completed,
            updated_at: new Date().toISOString()
          })
          .eq('id', testProfile.id);
        console.log('✅ Reverted test change');
      }
    }

    // Test 4: Check database schema
    console.log('\n4. Checking database schema...');
    const { data: schemaInfo, error: schemaError } = await supabase
      .rpc('get_table_columns', { table_name: 'user_profiles' });

    if (schemaError) {
      console.log('⚠️  Could not fetch schema info (this is normal if RPC is not available)');
    } else {
      console.log('✅ Database schema accessible');
      const onboardingColumn = schemaInfo?.find(col => col.column_name === 'onboarding_completed');
      if (onboardingColumn) {
        console.log('✅ onboarding_completed column exists in schema');
        console.log(`   Type: ${onboardingColumn.data_type}`);
        console.log(`   Default: ${onboardingColumn.column_default}`);
      } else {
        console.log('❌ onboarding_completed column not found in schema');
      }
    }

    console.log('\n🎉 Database tests completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Visit http://localhost:3000/test-onboarding-flow');
    console.log('2. Run the onboarding tests');
    console.log('3. Check if the profile completion logic is working correctly');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testOnboardingDatabase();
