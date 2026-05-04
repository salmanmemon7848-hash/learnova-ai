// src/lib/authSecurity.ts
// Auth security helpers — brute force protection

import { createAdminClient } from '@/lib/supabase/db';

/**
 * SECURITY: Extra application-level brute-force check before Supabase password login.
 * Uses service role so failed-login rows (no authenticated user) remain queryable.
 * OWASP Reference: A07:2021 Identification and Authentication Failures
 */
export async function checkLoginAttempts(
  email: string,
  ipAddress: string
): Promise<{ allowed: boolean; message?: string }> {
  // Supabase Auth already has built-in brute force protection
  // This adds an extra application-level check

  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
      return { allowed: true };
    }

    const supabase = createAdminClient();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    // Check recent failed attempts from this IP in activity_log
    const { count } = await supabase
      .from('activity_log')
      .select('*', { count: 'exact', head: true })
      .eq('activity_type', 'failed_login')
      .contains('metadata', { ip_address: ipAddress })
      .gte('created_at', fiveMinutesAgo);

    if ((count || 0) >= 5) {
      return {
        allowed: false,
        message: 'Too many login attempts. Please wait 5 minutes before trying again.',
      };
    }

    return { allowed: true };
  } catch {
    return { allowed: true }; // fail open — do not block users if check fails
  }
}

/**
 * SECURITY: Persist failed password-login attempts for brute-force tracking.
 * OWASP Reference: A07:2021 Identification and Authentication Failures
 */
export async function recordFailedLoginAttempt(email: string, ipAddress: string): Promise<void> {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) return;

    const supabase = createAdminClient();
    await supabase.from('activity_log').insert({
      user_id: null,
      activity_type: 'failed_login',
      title: 'Failed login attempt',
      metadata: {
        ip_address: ipAddress,
        email: email.slice(0, 320),
      },
    });
  } catch {
    /* non-fatal */
  }
}
