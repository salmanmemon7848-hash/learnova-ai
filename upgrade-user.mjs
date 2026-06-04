import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function upgradeUser() {
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

  console.log(`Upgrading User ID: ${user.id} to "pro" plan...`);

  // 2. Update user_plans table
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from('user_plans')
    .upsert({
      user_id: user.id,
      role: 'student',
      plan: 'pro',
      plan_started_at: new Date().toISOString(),
      plan_expires_at: expiresAt,
      razorpay_payment_id: 'pay_mock_verified_' + Math.random().toString(36).substring(2, 11),
      razorpay_order_id: 'order_mock_verified_' + Math.random().toString(36).substring(2, 11),
      is_active: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

  if (error) {
    console.error('Failed to upgrade user plan:', error.message);
    process.exit(1);
  }

  console.log('SUCCESS! User upgraded to "pro" plan successfully in Supabase.');
}

upgradeUser();
