// src/lib/usageTracker.ts
// Plan-aware usage tracking and enforcement

import { createClient } from '@/lib/supabase/server';
import { getFeatureLimit, isFeatureLocked, UserRole } from './planConfig';

export interface UsageCheckResult {
  allowed: boolean;
  reason: 'ok' | 'locked' | 'limit_reached' | 'error';
  current: number;
  limit: number | 'locked' | 'included' | 'one-time';
  remaining: number;
  plan: string;
  role: UserRole;
  upgradeRequired?: string;
  message?: string;
}

// Get user's current plan from Supabase
export async function getUserPlan(userId: string): Promise<{
  plan: string;
  role: UserRole;
  expiresAt: string | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_plans')
    .select('plan, role, plan_expires_at, is_active')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return { plan: 'free', role: 'student', expiresAt: null };
  }

  // Check if paid plan has expired
  if (data.plan !== 'free' && data.plan_expires_at) {
    const expired = new Date(data.plan_expires_at) < new Date();
    if (expired) {
      // Downgrade to free
      await supabase
        .from('user_plans')
        .update({ plan: 'free', is_active: true })
        .eq('user_id', userId);
      return { plan: 'free', role: data.role as UserRole, expiresAt: null };
    }
  }

  return {
    plan: data.plan,
    role: data.role as UserRole,
    expiresAt: data.plan_expires_at,
  };
}

// Check and increment usage for a feature
export async function checkAndTrackUsage(
  userId: string,
  feature: string
): Promise<UsageCheckResult> {
  const supabase = await createClient();

  try {
    // Get user plan
    const { plan, role } = await getUserPlan(userId);

    // Get limit for this feature
    const limit = getFeatureLimit(role, plan, feature);

    // Feature is locked
    if (limit === 'locked') {
      const upgradeMap: Record<string, Record<string, string>> = {
        student: {
          'edufinder': 'Pro', 'interview': 'Max', 'career-guide': 'Max',
        },
        founder: {
          'validate': 'Builder', 'competitor-research': 'Founder Pro', 'interview': 'Founder Pro',
        },
      };
      const upgradeTo = upgradeMap[role]?.[feature] || 'a paid plan';

      return {
        allowed: false,
        reason: 'locked',
        current: 0,
        limit: 'locked',
        remaining: 0,
        plan,
        role,
        upgradeRequired: upgradeTo,
        message: `This feature requires ${upgradeTo}. Upgrade to unlock it.`,
      };
    }

    // Feature is always included
    if (limit === 'included') {
      return {
        allowed: true,
        reason: 'ok',
        current: 0,
        limit: 'included',
        remaining: 999,
        plan,
        role,
      };
    }

    // One-time feature (Business Ideas on Starter)
    if (limit === 'one-time') {
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase
        .from('daily_usage')
        .select('count')
        .eq('user_id', userId)
        .eq('feature', feature)
        .single();

      const totalUsed = existing?.count || 0;
      if (totalUsed >= 1) {
        return {
          allowed: false,
          reason: 'limit_reached',
          current: totalUsed,
          limit: 'one-time',
          remaining: 0,
          plan,
          role,
          message: 'You have used your one-time access. Upgrade to Builder for daily access.',
        };
      }

      // Increment
      await supabase.from('daily_usage').upsert({
        user_id: userId, feature,
        usage_date: today,
        count: 1,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,feature,usage_date' });

      return {
        allowed: true, reason: 'ok',
        current: 1, limit: 'one-time',
        remaining: 0, plan, role,
      };
    }

    // Numeric daily limit
    const numLimit = limit as number;
    const today = new Date().toISOString().split('T')[0];

    // Get today's usage
    const { data: usage } = await supabase
      .from('daily_usage')
      .select('count')
      .eq('user_id', userId)
      .eq('feature', feature)
      .eq('usage_date', today)
      .single();

    const currentCount = usage?.count || 0;

    if (currentCount >= numLimit) {
      return {
        allowed: false,
        reason: 'limit_reached',
        current: currentCount,
        limit: numLimit,
        remaining: 0,
        plan, role,
        message: `Daily limit of ${numLimit} reached for this feature. Resets at midnight.`,
      };
    }

    // Increment usage
    const { error: upsertError } = await supabase
      .from('daily_usage')
      .upsert({
        user_id: userId,
        feature,
        usage_date: today,
        count: currentCount + 1,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,feature,usage_date' });

    if (upsertError) {
      console.error('[Usage] Upsert failed:', upsertError.message);
    }

    const remaining = numLimit - (currentCount + 1);
    console.log(`[Usage] ${feature} | Plan: ${plan} | ${currentCount + 1}/${numLimit} | Remaining: ${remaining}`);

    return {
      allowed: true, reason: 'ok',
      current: currentCount + 1,
      limit: numLimit,
      remaining,
      plan, role,
    };

  } catch (err: any) {
    console.error('[Usage] checkAndTrackUsage error:', err.message);
    // Fail open — allow request if tracking fails
    return {
      allowed: true, reason: 'error',
      current: 0, limit: 0,
      remaining: 999,
      plan: 'free', role: 'student',
    };
  }
}

// Check image upload limit (1 per day total across all features)
export async function checkImageLimit(userId: string): Promise<{
  allowed: boolean;
  message?: string;
}> {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('image_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('usage_date', today)
    .single();

  const count = data?.count || 0;
  if (count >= 1) {
    return {
      allowed: false,
      message: 'You can only upload 1 image per day. Come back tomorrow!',
    };
  }

  // Increment
  await supabase.from('image_usage').upsert({
    user_id: userId,
    usage_date: today,
    count: 1,
  }, { onConflict: 'user_id,usage_date' });

  return { allowed: true };
}

export async function checkPowerfulModeLimit(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  message?: string;
}> {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];
  const POWERFUL_MODE_LIMIT = 2;

  const { data } = await supabase
    .from('daily_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('feature', 'powerful-mode')
    .eq('usage_date', today)
    .single();

  const count = data?.count || 0;

  if (count >= POWERFUL_MODE_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      message: `Powerful Mode limit of ${POWERFUL_MODE_LIMIT} per day reached. Resets at midnight.`,
    };
  }

  await supabase.from('daily_usage').upsert({
    user_id: userId,
    feature: 'powerful-mode',
    usage_date: today,
    count: count + 1,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,feature,usage_date' });

  return { allowed: true, remaining: POWERFUL_MODE_LIMIT - (count + 1) };
}

// Standard blocked response for API routes
export function buildUsageBlockedResponse(result: UsageCheckResult) {
  return {
    error: result.reason === 'locked' ? 'feature_locked' : 'limit_reached',
    message: result.message,
    plan: result.plan,
    role: result.role,
    upgradeRequired: result.upgradeRequired,
    limit: result.limit,
    remaining: result.remaining,
  };
}
