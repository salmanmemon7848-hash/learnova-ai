import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectSchema() {
  console.log('Inspecting Supabase database tables...');

  // Inspect profiles table
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (pError) {
    console.error('Error reading profiles table:', pError.message);
  } else {
    console.log('Successfully read profiles table. Columns available:');
    if (profiles && profiles.length > 0) {
      console.log(Object.keys(profiles[0]));
      console.log('Sample row:', profiles[0]);
    } else {
      console.log('profiles table is empty, trying to fetch schema info...');
    }
  }

  // Inspect user_plans table
  const { data: userPlans, error: uError } = await supabase
    .from('user_plans')
    .select('*')
    .limit(1);

  if (uError) {
    console.error('Error reading user_plans table:', uError.message);
  } else {
    console.log('Successfully read user_plans table. Columns available:');
    if (userPlans && userPlans.length > 0) {
      console.log(Object.keys(userPlans[0]));
      console.log('Sample row:', userPlans[0]);
    } else {
      console.log('user_plans table is empty.');
    }
  }
}

inspectSchema();
