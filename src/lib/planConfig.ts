// src/lib/planConfig.ts
// Single source of truth for all plan limits

export type UserRole = 'student' | 'founder' | 'general';
export type StudentPlan = 'free' | 'pro' | 'max';
export type FounderPlan = 'free' | 'builder' | 'founder_pro';
export type GeneralPlan = 'free';

export interface PlanLimits {
  [feature: string]: number | 'locked' | 'included' | 'one-time';
}

// ── STUDENT PLAN LIMITS ───────────────────────────────────────────────────
export const STUDENT_PLANS: Record<StudentPlan, PlanLimits> = {
  free: {
    'general-chat': 5,
    'chat': 10,
    'doubt-solver': 3,
    'exam': 1,
    'edufinder': 'locked',
    'interview': 'locked',
    'career-guide': 'locked',
    'planner': 2,
    'writer': 3,
    'dashboard': 'included',
    'support': 'included',
  },
  pro: {
    'general-chat': 10,
    'chat': 20,
    'doubt-solver': 5,
    'exam': 10,
    'edufinder': 5,
    'interview': 'locked',
    'career-guide': 'locked',
    'planner': 5,
    'writer': 8,
    'dashboard': 'included',
    'support': 'included',
  },
  max: {
    'general-chat': 20,
    'chat': 20,
    'doubt-solver': 10,
    'exam': 20,
    'edufinder': 10,
    'interview': 5,
    'career-guide': 5,
    'planner': 10,
    'writer': 15,
    'dashboard': 'included',
    'support': 'included',
  },
};

// ── FOUNDER PLAN LIMITS ───────────────────────────────────────────────────
export const FOUNDER_PLANS: Record<FounderPlan, PlanLimits> = {
  free: {
    'general-chat': 5,
    'chat': 10,
    'business-ideas': 'one-time',
    'validate': 'locked',
    'competitor-research': 'locked',
    'interview': 'locked',
    'writer': 3,
    'pitch-deck': 'locked',
    'dashboard': 'included',
    'support': 'included',
  },
  builder: {
    'general-chat': 10,
    'chat': 20,
    'business-ideas': 10,
    'validate': 10,
    'competitor-research': 'locked',
    'interview': 'locked',
    'writer': 8,
    'pitch-deck': 5,
    'dashboard': 'included',
    'support': 'included',
  },
  founder_pro: {
    'general-chat': 20,
    'chat': 20,
    'business-ideas': 10,
    'validate': 10,
    'competitor-research': 5,
    'interview': 5,
    'writer': 15,
    'pitch-deck': 10,
    'dashboard': 'included',
    'support': 'included',
  },
};

// ── GENERAL CHAT LIMITS ───────────────────────────────────────────────────
export const GENERAL_LIMITS = {
  'general-chat': 5,
  'powerful-mode': 2,
  'image-upload': 1, // total across all features
};

// ── PRICING ───────────────────────────────────────────────────────────────
export const PLAN_PRICING = {
  student: {
    pro: { amount: 29900, label: '₹299/month', plan: 'pro', role: 'student' },
    max: { amount: 59900, label: '₹599/month', plan: 'max', role: 'student' },
  },
  founder: {
    builder: { amount: 29900, label: '₹299/month', plan: 'builder', role: 'founder' },
    founder_pro: { amount: 59900, label: '₹599/month', plan: 'founder_pro', role: 'founder' },
  },
};

// ── HELPER: Get limit for a feature based on plan ─────────────────────────
export function getFeatureLimit(
  role: UserRole,
  plan: string,
  feature: string
): number | 'locked' | 'included' | 'one-time' {
  if (role === 'student') {
    const p = plan as StudentPlan;
    return STUDENT_PLANS[p]?.[feature] ?? 'locked';
  }
  if (role === 'founder') {
    const p = plan as FounderPlan;
    return FOUNDER_PLANS[p]?.[feature] ?? 'locked';
  }
  // general
  return (GENERAL_LIMITS as any)[feature] ?? 'locked';
}

// ── HELPER: Is feature locked for this plan ───────────────────────────────
export function isFeatureLocked(
  role: UserRole,
  plan: string,
  feature: string
): boolean {
  const limit = getFeatureLimit(role, plan, feature);
  return limit === 'locked';
}

// ── PLAN DISPLAY NAMES ────────────────────────────────────────────────────
export const PLAN_DISPLAY_NAMES: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  max: 'Max',
  builder: 'Builder',
  founder_pro: 'Founder Pro',
};

// ── UPGRADE REQUIREMENTS ──────────────────────────────────────────────────
export const UPGRADE_REQUIRED: Record<string, { student?: string; founder?: string }> = {
  'edufinder': { student: 'pro' },
  'interview': { student: 'max', founder: 'founder_pro' },
  'career-guide': { student: 'max' },
  'validate': { founder: 'builder' },
  'competitor-research': { founder: 'founder_pro' },
};
