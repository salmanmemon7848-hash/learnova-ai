import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectAll() {
  console.log('Inspecting all accessible tables in Supabase...');

  const tables = ['profiles', 'user_profiles', 'user_plans', 'payment_orders', 'daily_usage', 'image_usage'];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ Table "${table}": Error or does not exist (${error.message})`);
    } else {
      console.log(`\n✅ Table "${table}": EXISTS`);
      if (data && data.length > 0) {
        console.log(`   Columns:`, Object.keys(data[0]));
        console.log(`   Sample:`, data[0]);
      } else {
        console.log(`   Columns: Empty table (unable to auto-detect columns from empty result)`);
        
        // Try to insert a dummy to read or fetch schema info
      }
    }
  }
}

inspectAll();
