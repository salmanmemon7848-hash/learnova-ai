'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const C = {
  bg: '#080412',
  card: '#160D2E',
  border: '#2D1B69',
  accent: '#7C3AED',
  accentL: '#A78BFA',
  text: '#F5F3FF',
  muted: '#C4B5FD',
  hint: '#9CA3AF',
};

const CARD: React.CSSProperties = {
  background: 'linear-gradient(135deg, #160D2E, #1E1040)',
  border: `1px solid ${C.border}`,
  borderRadius: 16,
  padding: '24px 28px',
  marginBottom: 20,
  boxShadow: '0 0 40px #7C3AED18',
};

const typeColor: Record<string, string> = {
  study: '#7C3AED',
  practice: '#0EA5E9',
  revision: '#F59E0B',
  break: '#10B981',
};

const priorityColor: Record<string, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

export default function PlannerResultsPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<any>(null);
  const [meta, setMeta] = useState<any>(null);
  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    const savedPlan = sessionStorage.getItem('generatedPlan');
    const savedMeta = sessionStorage.getItem('planMeta');
    if (!savedPlan) { router.push('/planner'); return; }
    setPlan(JSON.parse(savedPlan));
    if (savedMeta) setMeta(JSON.parse(savedMeta));
  }, []);

  if (!plan) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', color: C.muted }}>
      Loading your plan...
    </div>
  );

  const dailyHours = plan.daily_hours || meta?.studyHours || 6;
  const examLabel = meta?.examType || meta?.targetExam?.toUpperCase().replace('_', ' ') || 'Exam';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', color: C.text, paddingBottom: 48 }}>
      <style>{`
        .planner-phase-dot { width:14px;height:14px;border-radius:50%;background:#7C3AED;flex-shrink:0;margin-top:5px; }
        .planner-phase-line { width:2px;background:#2D1B69;flex:1;min-height:40px;margin:4px 0 4px 6px; }
        .day-tab-btn { padding:8px 14px;border-radius:8px;font-size:13px;font-weight:600;border:1px solid #2D1B69;cursor:pointer;transition:all .2s;background:transparent;color:#C4B5FD; }
        .day-tab-btn.active { background:#7C3AED;border-color:#7C3AED;color:#fff;box-shadow:0 4px 16px #7C3AED40; }
        .day-tab-btn:hover:not(.active) { border-color:#7C3AED80;color:#F5F3FF; }
        .session-row { display:flex;align-items:flex-start;gap:12px;padding:12px;border-radius:10px;background:rgba(255,255,255,.03);border:1px solid #2D1B69;margin-bottom:8px; }
        .hours-bar-bg { height:8px;border-radius:4px;background:#2D1B69;flex:1;overflow:hidden; }
        .hours-bar-fill { height:100%;border-radius:4px;background:linear-gradient(90deg,#7C3AED,#4F46E5);transition:width .8s ease; }
        .milestone-item { display:flex;gap:14px;padding:12px 0;border-bottom:1px solid #2D1B6930; }
        .revision-grid { display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px; }
        @media(max-width:640px){ .revision-grid{grid-template-columns:1fr;} }
        .two-col { display:grid;grid-template-columns:1fr 1fr;gap:16px; }
        @media(max-width:640px){ .two-col{grid-template-columns:1fr;} }
      `}</style>

      {/* Back button */}
      <button
        onClick={() => router.push('/planner')}
        style={{ background: 'transparent', border: 'none', color: C.accentL, fontSize: 14, cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}
      >
        ← Back to Planner
      </button>

      {/* Strategy Overview */}
      <div style={{ ...CARD, background: 'linear-gradient(135deg, #1E0A3C, #160D2E)', borderColor: '#7C3AED40' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
          📅 Your {plan.total_days || '—'}-Day Study Roadmap
        </h1>
        <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, marginBottom: 12 }}>
          {plan.strategy_summary}
        </p>
        <p style={{ fontSize: 14, color: '#A78BFA', fontStyle: 'italic', lineHeight: 1.6 }}>
          💬 {plan.motivational_roadmap}
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(124,58,237,.2)', borderRadius: 20, padding: '4px 14px', fontSize: 13, color: C.accentL }}>
            🎯 {examLabel}
          </span>
          <span style={{ background: 'rgba(16,185,129,.15)', borderRadius: 20, padding: '4px 14px', fontSize: 13, color: '#10B981' }}>
            ⏱ {dailyHours}h/day
          </span>
          <span style={{ background: 'rgba(245,158,11,.15)', borderRadius: 20, padding: '4px 14px', fontSize: 13, color: '#F59E0B' }}>
            📆 {plan.total_days} days
          </span>
        </div>
      </div>

      {/* Phase Plan */}
      {plan.phase_plan?.length > 0 && (
        <div style={CARD}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>🗺️ Study Phases</h3>
          {plan.phase_plan.map((p: any, i: number) => (
            <div key={i} style={{ display: 'flex', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="planner-phase-dot" />
                {i < plan.phase_plan.length - 1 && <div className="planner-phase-line" />}
              </div>
              <div style={{ paddingBottom: i < plan.phase_plan.length - 1 ? 16 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: 15, color: C.text }}>{p.phase}</strong>
                  <span style={{ fontSize: 12, color: C.accentL, background: 'rgba(124,58,237,.15)', padding: '2px 10px', borderRadius: 12 }}>
                    {p.duration}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: C.muted, margin: '4px 0 2px' }}>{p.focus}</p>
                <p style={{ fontSize: 13, color: '#10B981' }}>🎯 Goal: {p.goal}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subject Allocation */}
      {plan.subject_allocation?.length > 0 && (
        <div style={CARD}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📊 Subject Time Allocation</h3>
          {plan.subject_allocation.map((s: any, i: number) => {
            const pct = Math.min(100, (s.hours_per_week / (dailyHours * 7)) * 100);
            return (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <strong style={{ fontSize: 14, color: C.text, flex: 1 }}>{s.subject}</strong>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 12,
                    background: priorityColor[s.priority] + '20',
                    color: priorityColor[s.priority],
                    textTransform: 'uppercase',
                  }}>
                    {s.priority}
                  </span>
                  <span style={{ fontSize: 13, color: C.muted, flexShrink: 0 }}>{s.hours_per_week}h/week</span>
                </div>
                <div className="hours-bar-bg">
                  <div className="hours-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <p style={{ fontSize: 12, color: C.hint, marginTop: 4 }}>{s.reason}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Weekly Schedule — Tabs */}
      {plan.weekly_schedule?.length > 0 && (
        <div style={CARD}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🗓️ Weekly Schedule</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {plan.weekly_schedule.map((day: any, i: number) => (
              <button
                key={i}
                className={`day-tab-btn${activeDay === i ? ' active' : ''}`}
                onClick={() => setActiveDay(i)}
              >
                {day.day?.slice(0, 3) || `Day ${i + 1}`}
              </button>
            ))}
          </div>
          <div>
            {plan.weekly_schedule[activeDay]?.sessions?.map((s: any, i: number) => (
              <div key={i} className="session-row">
                <span style={{ fontSize: 12, color: C.hint, flexShrink: 0, minWidth: 100 }}>{s.time_slot}</span>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 14, color: C.text }}>{s.subject}</strong>
                  <p style={{ fontSize: 12, color: C.muted, margin: '2px 0 0' }}>{s.topic}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 8,
                    background: (typeColor[s.type] || '#7C3AED') + '20',
                    color: typeColor[s.type] || '#7C3AED',
                  }}>
                    {s.type}
                  </span>
                  <span style={{ fontSize: 11, color: C.hint }}>{s.duration_minutes}m</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Routine Template */}
      {plan.daily_routine_template && (
        <div style={CARD}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🌅 Daily Routine Template</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {Object.entries(plan.daily_routine_template).map(([time, desc]) => (
              <div key={time} style={{ background: 'rgba(255,255,255,.03)', border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.accentL, marginBottom: 4, textTransform: 'capitalize' }}>
                  {time === 'morning' ? '🌅' : time === 'afternoon' ? '☀️' : time === 'evening' ? '🌆' : '🌙'} {time}
                </div>
                <p style={{ fontSize: 13, color: C.muted }}>{desc as string}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weak Topic Plan */}
      {plan.weak_topic_plan?.length > 0 && (
        <div style={CARD}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🔧 Weak Topic Fix Plan</h3>
          {plan.weak_topic_plan.map((w: any, i: number) => (
            <div key={i} style={{ background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 10 }}>{w.topic}</h4>
              <p style={{ fontSize: 13, color: '#F87171', marginBottom: 6 }}>⚠️ Issue: {w.current_issue}</p>
              <p style={{ fontSize: 13, color: '#10B981', marginBottom: 6 }}>✅ Fix: {w.fix_strategy}</p>
              <p style={{ fontSize: 13, color: C.accentL }}>⏱️ Time: {w.time_to_allocate}</p>
            </div>
          ))}
        </div>
      )}

      {/* Milestones */}
      {plan.milestones?.length > 0 && (
        <div style={CARD}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🏆 Milestones</h3>
          {plan.milestones.map((m: any, i: number) => (
            <div key={i} className="milestone-item">
              <div style={{ background: 'rgba(124,58,237,.2)', border: '1px solid #7C3AED', borderRadius: 10, padding: '6px 12px', fontSize: 12, fontWeight: 700, color: C.accentL, flexShrink: 0, height: 'fit-content' }}>
                Day {m.day}
              </div>
              <div>
                <strong style={{ fontSize: 14, color: C.text }}>{m.milestone}</strong>
                <p style={{ fontSize: 13, color: '#10B981', marginTop: 4 }}>✓ Check: {m.check}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Revision Strategy */}
      {plan.revision_strategy && (
        <div style={CARD}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🔁 Revision Strategy</h3>
          <div className="revision-grid">
            {[
              { key: 'first_revision', label: '1st Revision', color: '#0EA5E9' },
              { key: 'second_revision', label: '2nd Revision', color: '#F59E0B' },
              { key: 'final_revision', label: '🔥 Final Week', color: '#EF4444' },
            ].map(({ key, label, color }) => (
              <div key={key} style={{ background: color + '10', border: `1px solid ${color}30`, borderRadius: 12, padding: 16 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 8 }}>{label}</h4>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{plan.revision_strategy[key]}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button
          onClick={() => router.push('/planner')}
          style={{ flex: 1, background: 'transparent', border: `1px solid ${C.border}`, color: C.accentL, borderRadius: 12, padding: '14px 0', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
        >
          🔄 Generate New Plan
        </button>
        <button
          onClick={() => window.print()}
          style={{ flex: 1, background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 0', fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 8px 32px #7C3AED40' }}
        >
          🖨️ Save / Print Plan
        </button>
      </div>
    </div>
  );
}
