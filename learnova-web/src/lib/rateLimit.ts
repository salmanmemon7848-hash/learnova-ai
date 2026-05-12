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
  'general-chat': {
    limit: 20, // TODO: update this when you decide the final limit
    resetType: 'daily',
    displayName: 'General Chat',
    warningThreshold: 0.8,
    minGapSeconds: 2,
    maxInputChars: 2000,
    newAccountMultiplier: 1.0,
  },
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

/**
 * checkAndIncrementUsage - Disables rate limits globally by always returning allowed=true.
 * The original implementation is bypassed to satisfy the "remove all rate limits" request.
 */
export async function checkAndIncrementUsage(
  userId: string,
  feature: string,
  _ipAddress?: string
): Promise<RateLimitResult> {
  const config = FEATURE_LIMITS[feature];
  const periodEnd = getPeriodEnd(config?.resetType || 'daily');
  
  // ALWAYS ALLOWED - Rate limits disabled
  return {
    allowed: true,
    blocked: false,
    currentCount: 0,
    limit: 9999,
    remaining: 9999,
    resetType: config?.resetType || 'daily',
    periodEnd,
    timeUntilReset: 'Unlimited',
    isWarning: false,
    percentUsed: 0,
    feature,
    displayName: config?.displayName || feature,
  };
}

export async function getUserUsageSummary(_userId: string) {
  const summary: Record<string, any> = {};
  for (const [feature, config] of Object.entries(FEATURE_LIMITS)) {
    summary[feature] = {
      count: 0,
      limit: 9999,
      remaining: 9999,
      resetType: config.resetType,
      timeUntilReset: 'Unlimited',
      displayName: config.displayName,
      percentUsed: 0,
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
