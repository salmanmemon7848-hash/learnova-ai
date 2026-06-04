import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load env variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function runMigrations() {
  console.log('Running database migrations via Prisma raw execution...');
  try {
    // 1. Alter profiles table to add missing columns
    console.log('Adding columns to "profiles" table if they do not exist...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE public.profiles
        ADD COLUMN IF NOT EXISTS has_seen_pricing BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
        ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT,
        ADD COLUMN IF NOT EXISTS daily_usage JSONB DEFAULT '{}';
    `);
    console.log('Columns added successfully.');

    // 2. Create indices if they do not exist
    console.log('Creating indices...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS profiles_has_seen_pricing_idx ON public.profiles(has_seen_pricing);
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
    `);
    console.log('Indices created successfully.');

    // 3. Mark existing users as has_seen_pricing = true
    console.log('Updating existing profile records...');
    await prisma.$executeRawUnsafe(`
      UPDATE public.profiles
      SET has_seen_pricing = TRUE
      WHERE has_seen_pricing IS FALSE OR has_seen_pricing IS NULL;
    `);
    console.log('Profile records updated successfully.');

    // 4. Create user_plans table if it doesn't exist
    console.log("Creating user_plans table if it doesn't exist...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public.user_plans (
        user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        plan TEXT DEFAULT 'free',
        role TEXT DEFAULT 'student',
        plan_expires_at TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT TRUE,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('user_plans table verified/created.');

    // 5. Create payment_orders table if it doesn't exist
    console.log("Creating payment_orders table if it doesn't exist...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public.payment_orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        razorpay_order_id TEXT UNIQUE NOT NULL,
        razorpay_payment_id TEXT,
        amount INTEGER NOT NULL,
        currency TEXT NOT NULL,
        plan TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('payment_orders table verified/created.');

    console.log('MIGRATION COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

runMigrations();
