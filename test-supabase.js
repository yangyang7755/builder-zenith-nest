// Test script to verify Supabase connection
// Run with: node test-supabase.js

import { createClient } from '@supabase/supabase-js';

// Your Supabase credentials (replace with real values)
const supabaseUrl = 'PASTE_YOUR_PROJECT_URL_HERE';
const supabaseKey = 'PASTE_YOUR_ANON_KEY_HERE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Check if we can connect
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return;
    }
    
    console.log('✅ Connection successful!');
    console.log('📊 Sample data:', data);
    
    // Test 2: Check if tables exist
    const tables = ['profiles', 'activities', 'clubs', 'activity_participants'];
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
        
      if (error) {
        console.log(`❌ Table '${table}' missing or inaccessible:`, error.message);
      } else {
        console.log(`✅ Table '${table}' exists and accessible`);
      }
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testConnection();
