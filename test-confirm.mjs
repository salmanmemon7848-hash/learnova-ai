import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  process.exit(1);
}

// Create Supabase client with admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createConfirmedUser() {
  const email = 'test_pricing_verified@gmail.com';
  const password = 'password123';
  const name = 'Test Pricing Verified';

  console.log(`Attempting to create and confirm admin-preverified user: ${email}...`);

  // Try to delete existing user if any, to avoid conflicts
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError.message);
  } else {
    const existingUser = listData.users.find(u => u.email === email);
    if (existingUser) {
      console.log(`Found existing user with ID ${existingUser.id}, deleting first...`);
      const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id);
      if (deleteError) {
        console.error('Error deleting user:', deleteError.message);
      } else {
        console.log('Successfully deleted old user.');
      }
    }
  }

  // Create pre-confirmed user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name }
  });

  if (error) {
    console.error('Failed to create user:', error.message);
    process.exit(1);
  }

  console.log('User created successfully:', data.user.id);

  // Set the onboarding role and pricing state
  console.log('Setting user role to student in profiles...');
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: data.user.id,
      role: 'student'
    }, { onConflict: 'id' });

  if (profileError) {
    console.error('Profile upsert warning/error:', profileError.message);
  } else {
    console.log('Profile setup successfully.');
  }

  console.log('Setting user plan to free in user_plans...');
  const { error: planError } = await supabase
    .from('user_plans')
    .upsert({
      user_id: data.user.id,
      role: 'student',
      plan: 'free',
      is_active: true
    }, { onConflict: 'user_id' });

  if (planError) {
    console.error('User plan upsert warning/error:', planError.message);
  } else {
    console.log('User plan setup successfully.');
  }

  console.log('--------------------------------------------------');
  console.log('SUCCESS! You can now log in with the following credentials:');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log('--------------------------------------------------');
}

createConfirmedUser();
