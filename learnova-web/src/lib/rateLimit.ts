import { createClient } from '@/lib/supabase/server';

export type ResetType = 'daily' | 'monthly';

export interface FeatureLimit {
  limit: number;
  resetType: ResetType;
  displayName: string;
  warningThreshold: number;
  minGapSeconds: number;
  maxInputChars: number;
  newAccountMultiplier: number;
}

export const FEATURE_LIMITS: Record<string, FeatureLimit> = {
  chat: { limit: 10, resetType: 'daily', displayName: 'AI Chat', warningThreshold: 0.8, minGapSeconds: 5, maxInputChars: 500, newAccountMultiplier: 0.5 },
  'doubt-solver': { limit: 5, resetType: 'daily', displayName: 'Doubt Solver', warningThreshold: 0.8, minGapSeconds: 10, maxInputChars: 500, newAccountMultiplier: 0.5 },
  'career-guide': { limit: 3, resetType: 'daily', displayName: 'Career Guide', warningThreshold: 0.8, minGapSeconds: 15, maxInputChars: 300, newAccountMultiplier: 0.5 },
  edufinder: { limit: 2, resetType: 'daily', displayName: 'EduFinder', warningThreshold: 0.8, minGapSeconds: 30, maxInputChars: 300, newAccountMultiplier: 0.5 },
  exam: { limit: 10, resetType: 'monthly', displayName: 'Practice Tests', warningThreshold: 0.8, minGapSeconds: 30, maxInputChars: 500, newAccountMultiplier: 0.5 },
  planner: { limit: 3, resetType: 'monthly', displayName: 'Study Planner', warningThreshold: 0.8, minGapSeconds: 60, maxInputChars: 1000, newAccountMultiplier: 0.5 },
  interview: { limit: 5, resetType: 'monthly', displayName: 'Mock Interview', warningThreshold: 0.8, minGapSeconds: 30, maxInputChars: 1000, newAccountMultiplier: 0.5 },
  writer: { limit: 8, resetType: 'monthly', displayName: 'AI Writer', warningThreshold: 0.8, minGapSeconds: 30, maxInputChars: 1000, newAccountMultiplier: 0.5 },
  'business-ideas': { limit: 5, resetType: 'monthly', displayName: 'Business Ideas', warningThreshold: 0.8, minGapSeconds: 30, maxInputChars: 800, newAccountMultiplier: 0.5 },
  validate: { limit: 5, resetType: 'monthly', displayName: 'Business Validator', warningThreshold: 0.8, minGapSeconds: 30, maxInputChars: 800, newAccountMultiplier: 0.5 },
  'competitor-research': { limit: 5, resetType: 'monthly', displayName: 'Competitor Research', warningThreshold: 0.8, minGapSeconds: 60, maxInputChars: 1000, newAccountMultiplier: 0.5 },
};

export function getPeriodEnd(resetType: ResetType): Date {
  const now = new Date();
  if (resetType === 'daily') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }
  return new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
}

export function getTimeUntilReset(periodEnd: Date): string {
  const diff = new Date(periodEnd).getTime() - Date.now();
  if (diff <= 0) return 'soon';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${mins} minute${mins > 1 ? 's' : ''}`;
}

export interface RateLimitResult {
  allowed: boolean;
  blocked: boolean;
  currentCount: number;
  limit: number;
  remaining: number;
  resetType: ResetType;
  periodEnd: Date;
  timeUntilReset: string;
  isWarning: boolean;
  percentUsed: number;
  warningMessage?: string;
  blockMessage?: string;
  feature: string;
  displayName: string;
}

async function isNewAccount(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.created_at) return false;
    return Date.now() - new Date(user.created_at).getTime() < 3600000;
  } catch {
    return false;
  }
}

function secondsSince(dateStr: string): number {
  return (Date.now() - new Date(dateStr).getTime()) / 1000;
}

export async function checkAndIncrementUsage(
  userId: string,
  feature: string,
  ipAddress?: string
): Promise<RateLimitResult> {
  const config = FEATURE_LIMITS[feature];
  if (!config) {
    const periodEnd = new Date(Date.now() + 86400000);
    return {
      allowed: true, blocked: false, currentCount: 0, limit: 999, remaining: 999,
      resetType: 'daily', periodEnd, timeUntilReset: 'never', isWarning: false, percentUsed: 0, feature, displayName: feature,
    };
  }

  const supabase = await createClient();
  const now = new Date();
  const periodEnd = getPeriodEnd(config.resetType);
  const newAccount = await isNewAccount();
  const effectiveLimit = newAccount ? Math.max(1, Math.floor(config.limit * config.newAccountMultiplier)) : config.limit;

  try {
    let { data: record } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('feature', feature)
      .gte('period_end', now.toISOString())
      .order('period_end', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!record) {
      const { data: newRecord } = await supabase
        .from('user_usage')
        .upsert({
          user_id: userId,
          feature,
          count: 0,
          reset_type: config.resetType,
          period_start: now.toISOString(),
          period_end: periodEnd.toISOString(),
          last_request_at: now.toISOString(),
        }, { onConflict: 'user_id,feature,period_end' })
        .select()
        .single();
      record = newRecord;
    }

    const currentCount = record?.count || 0;
    if (record?.last_request_at) {
      const secondsAgo = secondsSince(record.last_request_at);
      if (secondsAgo < config.minGapSeconds) {
        const waitSeconds = Math.ceil(config.minGapSeconds - secondsAgo);
        return {
          allowed: false, blocked: true, currentCount, limit: effectiveLimit,
          remaining: Math.max(0, effectiveLimit - currentCount), resetType: config.resetType, periodEnd,
          timeUntilReset: getTimeUntilReset(periodEnd), isWarning: false,
          percentUsed: Math.round((currentCount / effectiveLimit) * 100),
          blockMessage: `Please wait ${waitSeconds} second${waitSeconds > 1 ? 's' : ''} before making another request.`,
          feature, displayName: config.displayName,
        };
      }
    }

    if (currentCount >= effectiveLimit) {
      const timeUntilReset = getTimeUntilReset(periodEnd);
      const resetLabel = config.resetType === 'daily' ? 'today' : 'this month';
      if (currentCount >= effectiveLimit * 1.5 && ipAddress) {
        try {
          await supabase.from('user_abuse_flags').upsert({
            user_id: userId,
            ip_address: ipAddress,
            flag_type: 'limit_exceeded',
            flagged_at: now.toISOString(),
          }, { onConflict: 'user_id' });
        } catch {
          /* non-fatal */
        }
      }
      return {
        allowed: false, blocked: true, currentCount, limit: effectiveLimit, remaining: 0, resetType: config.resetType,
        periodEnd, timeUntilReset, isWarning: false, percentUsed: 100,
        blockMessage: `You have used all ${effectiveLimit} ${config.displayName} requests ${resetLabel}. Resets in ${timeUntilReset}.`,
        feature, displayName: config.displayName,
      };
    }

    const newCount = currentCount + 1;
    await supabase
      .from('user_usage')
      .update({ count: newCount, last_request_at: now.toISOString() })
      .eq('user_id', userId)
      .eq('feature', feature)
      .gte('period_end', now.toISOString());

    const remaining = effectiveLimit - newCount;
    const percentUsed = Math.round((newCount / effectiveLimit) * 100);
    const isWarning = percentUsed >= config.warningThreshold * 100;
    const timeUntilReset = getTimeUntilReset(periodEnd);
    const resetLabel = config.resetType === 'daily' ? 'today' : 'this month';

    return {
      allowed: true, blocked: false, currentCount: newCount, limit: effectiveLimit, remaining,
      resetType: config.resetType, periodEnd, timeUntilReset, isWarning, percentUsed,
      warningMessage: isWarning
        ? `⚠️ Only ${remaining} ${config.displayName} request${remaining !== 1 ? 's' : ''} left ${resetLabel}. Resets in ${timeUntilReset}.`
        : undefined,
      feature, displayName: config.displayName,
    };
  } catch (error: any) {
    const fallbackEnd = getPeriodEnd(config.resetType);
    console.error('[RateLimit] Error — allowing request:', error?.message || error);
    return {
      allowed: true, blocked: false, currentCount: 0, limit: config.limit, remaining: config.limit,
      resetType: config.resetType, periodEnd: fallbackEnd, timeUntilReset: getTimeUntilReset(fallbackEnd),
      isWarning: false, percentUsed: 0, feature, displayName: config.displayName,
    };
  }
}

export async function getUserUsageSummary(userId: string) {
  const supabase = await createClient();
  const now = new Date();
  const { data: records } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .gte('period_end', now.toISOString());

  const summary: Record<string, any> = {};
  for (const [feature, config] of Object.entries(FEATURE_LIMITS)) {
    const record = records?.find((r) => r.feature === feature);
    const count = record?.count || 0;
    const periodEnd = record ? new Date(record.period_end) : getPeriodEnd(config.resetType);
    summary[feature] = {
      count,
      limit: config.limit,
      remaining: Math.max(0, config.limit - count),
      resetType: config.resetType,
      timeUntilReset: getTimeUntilReset(periodEnd),
      displayName: config.displayName,
      percentUsed: Math.round((count / config.limit) * 100),
    };
  }
  return summary;
}

export function buildBlockedResponse(result: RateLimitResult) {
  return {
    error: 'rate_limit_exceeded',
    message: result.blockMessage || `Limit reached for ${result.displayName}. Resets in ${result.timeUntilReset}.`,
    feature: result.feature,
    displayName: result.displayName,
    limit: result.limit,
    remaining: result.remaining,
    resetType: result.resetType,
    timeUntilReset: result.timeUntilReset,
    percentUsed: result.percentUsed,
  };
}

export function buildRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Reset': result.timeUntilReset,
  };
  if (result.isWarning) headers['X-RateLimit-Warning'] = result.warningMessage || '';
  return headers;
}
