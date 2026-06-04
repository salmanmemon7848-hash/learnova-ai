import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserPlan() {
  const email = 'test_pricing_verified@gmail.com';
  
  // 1. Get user ID
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError.message);
    process.exit(1);
  }

  const user = listData.users.find(u => u.email === email);
  if (!user) {
    console.error(`User ${email} not found.`);
    process.exit(1);
  }

  console.log(`User ID for ${email} is: ${user.id}`);

  // 2. Fetch profiles
  const { data: profile, error: pError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  console.log('Profile details:', profile || pError?.message);

  // 3. Fetch user_plans
  const { data: userPlan, error: uError } = await supabase
    .from('user_plans')
    .select('*')
    .eq('user_id', user.id)
    .single();

  console.log('User Plan details:', userPlan || uError?.message);
}

checkUserPlan();
