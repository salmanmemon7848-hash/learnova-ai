import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Updates (or creates) the user's streak record after any activity.
 */
export async function updateStreak(supabase: SupabaseClient, userId: string) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: streak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!streak) {
      await supabase.from('user_streaks').insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_active_date: today,
        total_sessions: 1,
      });
      return;
    }

    const lastActive: string = streak.last_active_date;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let newStreak = streak.current_streak;
    let newTotalSessions = streak.total_sessions;

    if (lastActive === today) {
      // Already active today — just increment total sessions
      newTotalSessions += 1;
    } else if (lastActive === yesterday) {
      newStreak += 1; // consecutive day
      newTotalSessions += 1;
    } else {
      newStreak = 1; // streak broken
      newTotalSessions += 1;
    }

    await supabase.from('user_streaks').upsert(
      {
        user_id: userId,
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, streak.longest_streak),
        last_active_date: today,
        total_sessions: newTotalSessions,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  } catch (err) {
    // Non-critical — don't fail the main request
    console.warn('[updateStreak] Failed silently:', err);
  }
}

/**
 * Inserts an activity_log entry and updates the streak.
 */
export async function logActivity(
  supabase: SupabaseClient,
  userId: string,
  activity_type: string,
  title: string,
  metadata: Record<string, any> = {}
) {
  try {
    await supabase.from('activity_log').insert({
      user_id: userId,
      activity_type,
      title,
      metadata,
    });
    await updateStreak(supabase, userId);
  } catch (err) {
    console.warn('[logActivity] Failed silently:', err);
  }
}
