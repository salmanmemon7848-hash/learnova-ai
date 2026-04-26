import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET — fetch recent activities
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;

    // Fetch from all activity sources in parallel
    const [exams, conversations, notes, doubts] = await Promise.all([
      supabase.from('ExamAttempt').select('id, subject, topic, score, totalQuestions, createdAt')
        .eq('userId', userId).order('createdAt', { ascending: false }).limit(5),
      supabase.from('Conversation').select('id, updatedAt')
        .eq('userId', userId).order('updatedAt', { ascending: false }).limit(5),
      supabase.from('StudyNote').select('id, title, subject, createdAt')
        .eq('userId', userId).order('createdAt', { ascending: false }).limit(5),
      supabase.from('DoubtSolver').select('id, subject, createdAt')
        .eq('userId', userId).order('createdAt', { ascending: false }).limit(5),
    ]);

    // Combine and format all activities
    const activities: any[] = [];

    exams.data?.forEach(e => activities.push({
      type: 'exam',
      icon: '📝',
      title: `Took ${e.subject} exam`,
      detail: `${e.topic} — Score: ${e.score}/${e.totalQuestions}`,
      time: e.createdAt,
    }));

    conversations.data?.forEach(c => activities.push({
      type: 'chat',
      icon: '💬',
      title: 'AI Chat Session',
      detail: 'Had a conversation with Learnova AI',
      time: c.updatedAt,
    }));

    notes.data?.forEach(n => activities.push({
      type: 'note',
      icon: '📚',
      title: `Saved note: ${n.title}`,
      detail: n.subject || 'General',
      time: n.createdAt,
    }));

    doubts.data?.forEach(d => activities.push({
      type: 'doubt',
      icon: '🔍',
      title: 'Solved a doubt',
      detail: d.subject || 'General subject',
      time: d.createdAt,
    }));

    // Sort by time, most recent first
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return NextResponse.json({ activities: activities.slice(0, 10) });

  } catch (error: any) {
    console.error('❌ Activity Error:', error?.message);
    return NextResponse.json({ activities: [] });
  }
}

// POST — log a new activity manually
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { type, title, detail } = await req.json();

    await supabase.from('StudyStreak').insert({
      userId: session.user.id,
      date: new Date().toISOString().split('T')[0],
      activity: type,
      xpEarned: 10,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to log activity.' }, { status: 500 });
  }
}

// DELETE — reset all activity
export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;
    await Promise.all([
      supabase.from('StudyStreak').delete().eq('userId', userId),
      supabase.from('ExamAttempt').delete().eq('userId', userId),
      supabase.from('Conversation').delete().eq('userId', userId),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to reset.' }, { status: 500 });
  }
}
