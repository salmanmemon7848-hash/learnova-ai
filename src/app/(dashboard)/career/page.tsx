'use client';

import { useState } from 'react';

// ── page-level phases ────────────────────────────────────────────
type PagePhase = 'questions' | 'loading' | 'phase1' | 'phase2loading' | 'phase2';

import { type Phase1Result, type Phase2Result, type CareerPreview } from '@/types/career-guide';

type CareerGuideError = { error?: string; message?: string };

const questions = [
  {
    id: 'stage',
    question: 'Which stage are you at right now?',
    subtitle: 'This helps us give you advice that fits where you actually are.',
    options: [
      'Class 9–10 (choosing stream)',
      'Class 11–12 (planning after boards)',
      'Just finished 12th (deciding college/career)',
      'Already in college (reconsidering path)',
    ],
  },
  {
    id: 'stream',
    question: 'Which stream are you in or most interested in?',
    subtitle: 'We will only recommend careers from your stream.',
    options: [
      'Science — PCM (Physics, Chemistry, Maths)',
      'Science — PCB (Physics, Chemistry, Biology)',
      'Commerce (with or without Maths)',
      'Arts / Humanities',
      'Not decided yet — help me explore',
    ],
  },
  {
    id: 'strength',
    question: 'What do people say you are naturally good at?',
    subtitle: 'Be honest — your actual strengths matter more than what sounds impressive.',
    options: [
      'Logical thinking & problem solving',
      'Creativity & imagination',
      'Communication & convincing people',
      'Caring for & understanding people',
      'Leadership & organizing things',
      'Research & finding patterns in data',
    ],
  },
  {
    id: 'interest',
    question: 'Which of these activities genuinely excites you?',
    subtitle: 'Pick what you actually enjoy, not what you think you should.',
    options: [
      'Building apps, coding, or working with tech',
      'Helping, healing, or supporting people',
      'Creating content, art, writing, or design',
      'Running a business or making money grow',
      'Understanding how the world, society, or mind works',
      'Solving big real-world problems (climate, health, security)',
    ],
  },
  {
    id: 'workStyle',
    question: 'How do you want to spend your average workday?',
    subtitle: 'Career satisfaction depends a lot on daily environment — not just the title.',
    options: [
      'Focused solo work — deep thinking, building, researching',
      'Collaborating in a team — meetings, brainstorming, projects',
      'Interacting with people daily — clients, patients, students',
      'Out in the field — travel, on-site, physical work',
      'Flexible & remote — working from anywhere on my own schedule',
    ],
  },
  {
    id: 'priority',
    question: 'What matters most to you in a career?',
    subtitle: 'There is no wrong answer here — be real with yourself.',
    options: [
      'High salary & financial freedom',
      'Making a genuine difference in society',
      'Creative freedom & self-expression',
      'Job security & stable income',
      'Prestige, status & recognition',
      'Work-life balance & personal time',
    ],
  },
  {
    id: 'personality',
    question: 'How would your close friends describe you?',
    subtitle: 'This helps us match careers to your natural personality — not an ideal version of you.',
    options: [
      'Introvert — I recharge alone; prefer depth over breadth',
      'Extrovert — I get energy from people and thrive socially',
      'Ambivert — depends on the situation',
      'Analytical & detail-oriented',
      'Creative & unconventional thinker',
      'Natural leader who takes charge',
    ],
  },
  {
    id: 'timeline',
    question: 'When do you want to start earning a real income?',
    subtitle: 'This affects whether we recommend faster or longer education paths.',
    options: [
      'As soon as possible — 1 to 2 years (diploma, short courses)',
      'After graduation — 3 to 4 years (standard degree)',
      'After postgrad — 5 to 6 years (masters, CA, MBA)',
      'Long-term investment — 7+ years (medicine, research, UPSC)',
    ],
  },
  {
    id: 'budget',
    question: 'What is your approximate education budget?',
    subtitle: 'This helps us recommend realistic college options and highlight scholarships.',
    options: [
      'Very limited — need scholarships or govt college',
      'Moderate — state or mid-tier private college is fine',
      'Comfortable — top private colleges are okay',
      'Flexible — willing to invest heavily for the right college',
    ],
  },
  {
    id: 'location',
    question: 'Where are you currently based?',
    subtitle: 'Regional opportunities and college options vary significantly across India.',
    options: [
      'Metro city (Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune)',
      'Tier-2 city (Jaipur, Lucknow, Indore, Bhopal, Chandigarh, Nagpur etc.)',
      'Tier-3 city or town',
      'Rural area / village',
      'Currently abroad but planning to return to India',
    ],
  },
];



function CareerPreviewCard({
  career,
  onViewDetails,
}: {
  career: CareerPreview;
  onViewDetails: (career: CareerPreview) => void;
}) {
  const cardColors = [
    { bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)' },
    { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
    { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
  ];
  const color = cardColors[(career.colorIndex || 0) % cardColors.length];
  return (
    <div style={{ background: color.bg, border: `1px solid ${color.border}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{career.icon}</div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>{career.title}</h3>
          <p style={{ margin: 0, opacity: 0.6, fontSize: '0.8rem' }}>{career.tagline}</p>
        </div>
      </div>
      {career.whyMatch && <p style={{ fontSize: '0.82rem', opacity: 0.8, lineHeight: 1.5, marginBottom: 14 }}>{career.whyMatch}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ fontSize: '0.68rem', opacity: 0.6, marginBottom: 3 }}>Entry</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{career.entrySalary}</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ fontSize: '0.68rem', opacity: 0.6, marginBottom: 3 }}>Top</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{career.topSalary}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {career.previewExams?.slice(0, 3).map((e: string, i: number) => (
          <span key={i} style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.74rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>{e}</span>
        ))}
        {career.demandLabel && <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.74rem', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>📈 {career.demandLabel}</span>}
      </div>
      <button
        onClick={() => onViewDetails(career)}
        style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'inherit', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
      >
        View Full Details →
      </button>
    </div>
  );
}

// ── Phase 2: Deep Career Detail View ───────────────────────────────────────
function CareerDetailView({ data, onBack }: { data: Phase2Result; onBack: () => void }) {
  const h = data.hero;
  const s = data.salaryMap;
  const d = data.demandData;
  const ed = data.educationPath;
  const sk = data.skillsRequired;
  const rm = data.careerRoadmap;
  const sc = data.scholarships;
  const hc = data.honestChallenges;
  const al = data.alternateIfNotPossible;
  const pc = data.personalizedClosing;
  const chip = (txt: string, i: number, col = 'rgba(255,255,255,0.08)', brd = 'rgba(255,255,255,0.15)') => (
    <span key={i} style={{ padding: '5px 13px', borderRadius: 20, fontSize: '0.78rem', background: col, border: `1px solid ${brd}` }}>{txt}</span>
  );
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '16px 16px 60px' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '0.875rem', opacity: 0.7, marginBottom: 20, padding: 0 }}>← Back to results</button>




      {/* Hero */}
      {h && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>{h.icon}</div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{h.title}</h2>
            <p style={{ margin: '4px 0 0', opacity: 0.6, fontSize: '0.875rem' }}>{h.tagline}</p>
            {h.matchScore && <span style={{ display: 'inline-block', marginTop: 6, padding: '3px 12px', borderRadius: 20, fontSize: '0.75rem', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', fontWeight: 600 }}>{h.matchScore}% Match</span>}
          </div>
        </div>
      )}
      {h?.oneLiner && <p style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 20 }}>{h.oneLiner}</p>}

      {/* Counselor Take */}
      {data.counselorTake && (
        <div className="result-card" style={{ marginBottom: 16, borderLeft: '3px solid #7c3aed' }}>
          <h3 style={{ marginBottom: 10, fontSize: '1rem', color: '#a78bfa' }}>{data.counselorTake.heading}</h3>
          <p style={{ opacity: 0.85, lineHeight: 1.7, fontSize: '0.9rem', whiteSpace: 'pre-line' }}>{data.counselorTake.content}</p>
        </div>
      )}

      {/* Salary Map */}
      {s && (
        <div className="result-card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 14, fontSize: '1rem' }}>💰 Salary Map</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 }}>
            {([['Entry', s.entry], ['Mid', s.mid], ['Senior', s.senior], ['Top', s.top]] as [string, string][]).map(([label, val], i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', opacity: 0.55, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{val}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: 6 }}>🏙️ {s.cityNote}</p>
          <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: 6 }}>⏱️ {s.timeToMidSalary}</p>
          <p style={{ fontSize: '0.82rem', opacity: 0.8, lineHeight: 1.5 }}>{s.salaryInsight}</p>
        </div>
      )}

      {/* Demand Data */}
      {d && (
        <div className="result-card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>📈 Market Demand</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
            <span style={{ padding: '5px 14px', borderRadius: 20, fontSize: '0.8rem', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', fontWeight: 600 }}>{d.growthPercent}% Growth — {d.growthLabel}</span>
            <span style={{ padding: '5px 14px', borderRadius: 20, fontSize: '0.8rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>🤖 {d.automationRisk}</span>
          </div>
          <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: 8 }}>{d.indiaShortfall}</p>
          <p style={{ fontSize: '0.72rem', opacity: 0.5, marginBottom: 10 }}>Source: {d.growthSource}</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>{d.topHiringCities?.map((c: string, i: number) => chip(c, i))}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{d.topHiringCompanies?.map((c: string, i: number) => chip(c, i))}</div>
        </div>
      )}

      {/* Education Path */}
      {ed && (
        <div className="result-card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 14, fontSize: '1rem' }}>🎓 Education Path</h3>
          <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', marginBottom: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>{ed.primaryRoute.degree} — {ed.primaryRoute.duration}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>{ed.primaryRoute.exams?.map((e: string, i: number) => chip(e, i, 'rgba(124,58,237,0.12)', 'rgba(124,58,237,0.3)'))}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>{ed.primaryRoute.topColleges?.map((c: string, i: number) => <div key={i} style={{ fontSize: '0.8rem', opacity: 0.8 }}>• {c}</div>)}</div>
            <p style={{ fontSize: '0.78rem', opacity: 0.6, margin: 0 }}>{ed.primaryRoute.note}</p>
          </div>
          {ed.alternateRoutes?.map((r, i) => (
            <div key={i} style={{ paddingLeft: 12, borderLeft: '2px solid rgba(255,255,255,0.15)', marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>{r.route}</div>
              <div style={{ fontSize: '0.78rem', opacity: 0.7, marginBottom: 2 }}>{r.why}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{r.cost} · {r.timeline}</div>
            </div>
          ))}
          {ed.pgOptions && (<><div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: 10, marginBottom: 6 }}>POSTGRAD OPTIONS</div><div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>{ed.pgOptions.map((p: string, i: number) => <div key={i} style={{ fontSize: '0.8rem', opacity: 0.75 }}>• {p}</div>)}</div></>)}
        </div>
      )}

      {/* Skills */}
      {sk && (
        <div className="result-card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>🛠️ Skills Required</h3>
          <div style={{ fontSize: '0.72rem', opacity: 0.5, marginBottom: 6 }}>TECHNICAL</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>{sk.technical?.map((t: string, i: number) => chip(t, i))}</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.5, marginBottom: 6 }}>SOFT SKILLS</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>{sk.soft?.map((t: string, i: number) => chip(t, i))}</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.5, marginBottom: 6 }}>CERTIFICATIONS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>{sk.certifications?.map((c: string, i: number) => <div key={i} style={{ fontSize: '0.8rem', opacity: 0.75 }}>• {c}</div>)}</div>
        </div>
      )}

      {/* Roadmap */}
      {rm && (
        <div className="result-card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 14, fontSize: '1rem' }}>🗺️ {rm.heading}</h3>
          {rm.steps?.map((step, si) => (
            <div key={si} style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#a78bfa', marginBottom: 6 }}>{step.phase}</div>
              {step.actions?.map((a: string, ai: number) => (
                <div key={ai} style={{ display: 'flex', gap: 8, fontSize: '0.82rem', marginBottom: 4 }}>
                  <span style={{ color: '#7c3aed', fontWeight: 700, minWidth: 18 }}>{ai + 1}.</span>
                  <span style={{ opacity: 0.85 }}>{a}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Scholarships */}
      {sc && (
        <div className="result-card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>🏅 {sc.heading}</h3>
          {sc.list?.map((item: any, i: number) => (
            <div key={i} style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', marginBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 2 }}>{item.name}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.75, marginBottom: 2 }}>{item.amount} · {item.eligibility}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Apply: {item.apply}</div>
            </div>
          ))}
        </div>
      )}

      {/* Govt Schemes */}
      {data.govtSchemes && data.govtSchemes.length > 0 && (
        <div className="result-card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>🏛️ Government Schemes</h3>
          {data.govtSchemes.map((g: any, i: number) => (
            <div key={i} style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 2 }}>{g.scheme}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.75, marginBottom: 2 }}>{g.benefit}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{g.link}</div>
            </div>
          ))}
        </div>
      )}

      {/* Honest Challenges */}
      {hc && (
        <div className="result-card" style={{ marginBottom: 16, borderLeft: '3px solid rgba(239,68,68,0.5)' }}>
          <h3 style={{ marginBottom: 12, fontSize: '1rem', color: '#fca5a5' }}>⚠️ {hc.heading}</h3>
          {hc.points?.map((pt: string, i: number) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: '0.85rem', marginBottom: 8 }}>
              <span style={{ color: '#f87171', fontWeight: 700, minWidth: 18 }}>{i + 1}.</span>
              <span style={{ opacity: 0.85 }}>{pt}</span>
            </div>
          ))}
        </div>
      )}

      {/* Alternate If Not Possible */}
      {al && (
        <div className="result-card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>🔄 {al.heading}</h3>
          {al.careers?.map((c: any, i: number) => (
            <div key={i} style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 4 }}>{c.title}</div>
              <p style={{ fontSize: '0.8rem', opacity: 0.75, margin: '0 0 4px' }}>{c.why}</p>
              <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Entry: {c.entryExam}</div>
            </div>
          ))}
        </div>
      )}

      {/* Personalized Closing */}
      {pc && (
        <div className="result-card" style={{ marginBottom: 16, borderLeft: '3px solid #7c3aed' }}>
          <h3 style={{ marginBottom: 10, fontSize: '1rem', color: '#a78bfa' }}>{pc.heading}</h3>
          <p style={{ opacity: 0.9, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{pc.content}</p>
        </div>
      )}
    </div>
  );
}

export default function CareerGuidePage() {
  const [pagePhase, setPagePhase] = useState<PagePhase>('questions');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [savedAnswers, setSavedAnswers] = useState<Record<string, string>>({});
  const [phase1Result, setPhase1Result] = useState<Phase1Result | null>(null);
  const [phase2Result, setPhase2Result] = useState<Phase2Result | null>(null);
  const [error, setError] = useState('');

  const reset = () => {
    setPagePhase('questions'); setCurrentQ(0); setAnswers({});
    setSavedAnswers({}); setPhase1Result(null); setPhase2Result(null); setError('');
  };

  const handleFindCareers = async (finalAnswers = answers) => {
    setPagePhase('loading'); setError('');
    try {
      const res = await fetch('/api/career-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers, language: 'english', phase: 'stream_phase' }),
      });
      const data = await res.json() as Phase1Result & CareerGuideError;
      if (!res.ok) throw new Error(data.message || data.error || 'Failed');
      setSavedAnswers(finalAnswers);
      setPhase1Result(data);
      setPagePhase('phase1');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to find careers');
      setPagePhase('questions');
    }
  };

  const handleCareerClick = async (career: CareerPreview) => {
    setPagePhase('phase2loading'); setError('');
    try {
      const res = await fetch('/api/career-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: savedAnswers, language: 'english', phase: 'career_detail', careerId: career.id }),
      });
      const data = await res.json() as Phase2Result & CareerGuideError;
      if (!res.ok) throw new Error(data.message || data.error || 'Failed');
      setPhase2Result(data);
      setPagePhase('phase2');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load career details');
      setPagePhase('phase1');
    }
  };

  // ── Phase 2 loading ───────────────────────────────────────────────────────
  if (pagePhase === 'phase2loading') {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 16px', textAlign: 'center' }}>
        <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#7c3aed', borderTopColor: 'transparent' }} />
        <p style={{ opacity: 0.7 }}>Loading deep career analysis...</p>
      </div>
    );
  }

  // ── Phase 2 view ──────────────────────────────────────────────────────────
  if (pagePhase === 'phase2' && phase2Result) {
    return (
      <div className="page-container min-h-screen bg-[#0F0F10] text-white p-6 max-w-4xl mx-auto">
        <CareerDetailView data={phase2Result} onBack={() => setPagePhase('phase1')} />
        {error && <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: '0.875rem' }}>{error}</div>}
      </div>
    );
  }

  // ── Phase 1: stream_selection / stream_exploration ─────────────────────────
  if (pagePhase === 'phase1' && phase1Result &&
    (phase1Result.mode === 'stream_selection' || phase1Result.mode === 'stream_recommendation' || phase1Result.mode === 'stream_exploration')) {
    return (
      <div className="page-container min-h-screen bg-[#0F0F10] text-white p-6 max-w-5xl mx-auto">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>🎯 Career Guide</h1>
        <p style={{ opacity: 0.7, marginBottom: 20, fontSize: '0.9rem', lineHeight: 1.6 }}>{phase1Result.personalizedMessage}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {(phase1Result.streamOptions || []).map((opt, i) => (
            <div key={i} style={{ background: i === 0 ? 'rgba(99,102,241,0.1)' : 'rgba(16,185,129,0.08)', border: `1px solid ${i === 0 ? 'rgba(99,102,241,0.3)' : 'rgba(16,185,129,0.25)'}`, borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>{opt.icon}</div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>{opt.stream}</h2>
              <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: 14 }}>{opt.tagline}</p>
              <p style={{ fontSize: '0.85rem', opacity: 0.85, lineHeight: 1.6, marginBottom: 14 }}>{opt.whyForYou}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {opt.topCareers?.map((c: string, ci: number) => <span key={ci} style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.73rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>{c}</span>)}
              </div>
              <div style={{ fontSize: '0.78rem', opacity: 0.65, marginBottom: 6 }}>💰 {opt.salaryPotential}</div>
              <div style={{ fontSize: '0.78rem', opacity: 0.65 }}>⚡ {opt.difficulty}</div>
            </div>
          ))}
        </div>
        <button onClick={reset} style={{ marginTop: 24, background: 'none', border: 'none', opacity: 0.5, cursor: 'pointer', color: 'inherit', fontSize: '0.85rem' }}>← Start over</button>
        {error && <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: '0.875rem' }}>{error}</div>}
      </div>
    );
  }

  // ── Phase 1: stream_confirmation (streamCard + careerPreviews) ─────────────
  if (pagePhase === 'phase1' && phase1Result) {
    const sc = phase1Result.streamCard;
    return (
      <div className="page-container min-h-screen bg-[#0F0F10] text-white p-6 max-w-5xl mx-auto">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 20 }}>🎯 Career Guide</h1>
        {sc && (
          <div style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: '1.8rem' }}>{sc.icon}</span>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>{sc.stream}</h2>
                <p style={{ margin: 0, opacity: 0.6, fontSize: '0.8rem' }}>{sc.tagline}</p>
              </div>
              {phase1Result.matchScore && (
                <span style={{ padding: '4px 14px', borderRadius: 20, background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', fontSize: '0.8rem', fontWeight: 600 }}>
                  {phase1Result.matchScore}% {phase1Result.matchScoreLabel}
                </span>
              )}
            </div>
            <p style={{ opacity: 0.85, lineHeight: 1.7, marginBottom: 14, fontSize: '0.9rem' }}>{sc.confirmationMessage}</p>
            {sc.flagNote && <p style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: '0.82rem', opacity: 0.85, marginBottom: 12 }}>💡 {sc.flagNote}</p>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {sc.keyExams?.map((e: string, i: number) => <span key={i} style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)' }}>{e}</span>)}
            </div>
          </div>
        )}
        {phase1Result.personalizedMessage && <p style={{ opacity: 0.75, marginBottom: 20, fontSize: '0.875rem', lineHeight: 1.6 }}>{phase1Result.personalizedMessage}</p>}
        <div className="career-cards-grid grid grid-cols-1 md:grid-cols-2 gap-4">
          {(phase1Result.careerPreviews || []).map((career, i) => (
            <CareerPreviewCard key={`${career.id}-${i}`} career={{ ...career, colorIndex: career.colorIndex ?? i }} onViewDetails={handleCareerClick} />
          ))}
        </div>
        <button onClick={reset} style={{ marginTop: 20, background: 'none', border: 'none', opacity: 0.5, cursor: 'pointer', color: 'inherit', fontSize: '0.85rem' }}>← Start over</button>
        {error && <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: '0.875rem' }}>{error}</div>}
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (pagePhase === 'loading') {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>🎯 Career Guide</h1>
        <p style={{ opacity: 0.6, marginBottom: 24, fontSize: '0.875rem' }}>Finding your best-fit career paths...</p>
        <div className="result-card" style={{ padding: 24, textAlign: 'center' }}>
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#7c3aed', borderTopColor: 'transparent' }} />
          <p style={{ opacity: 0.7 }}>Thinkior is building your personalized roadmap.</p>
        </div>
      </div>
    );
  }

  // ── Questions ──────────────────────────────────────────────────────────────
  const selectedAnswer = answers[questions[currentQ].id];
  const isLastQuestion = currentQ === questions.length - 1;

  return (
    <div className="page-container" style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>🎯 Career Guide</h1>
      <p style={{ opacity: 0.6, marginBottom: 24, fontSize: '0.875rem' }}>Answer a few questions and get your personalized career roadmap.</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.8rem', opacity: 0.6 }}>
        <span>Question {currentQ + 1} of {questions.length}</span>
        <span>{Math.round((currentQ / questions.length) * 100)}% complete</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 4, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 4, background: '#7c3aed', width: `${(currentQ / questions.length) * 100}%`, transition: 'width 0.3s ease' }} />
      </div>

      <div className="result-card" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 8, fontSize: '1.1rem', lineHeight: 1.5 }}>{questions[currentQ].question}</h3>
        {'subtitle' in questions[currentQ] && (
          <p style={{ marginBottom: 16, fontSize: '0.8rem', opacity: 0.55, lineHeight: 1.5 }}>{(questions[currentQ] as { subtitle?: string }).subtitle}</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {questions[currentQ].options.map((opt, i) => (
            <button key={i} onClick={() => {
              const newAnswers = { ...answers, [questions[currentQ].id]: opt };
              setAnswers(newAnswers);
              if (currentQ < questions.length - 1) setCurrentQ(currentQ + 1);
            }}
              style={{ padding: '12px 16px', borderRadius: 10, textAlign: 'left', background: selectedAnswer === opt ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.04)', border: selectedAnswer === opt ? '1px solid rgba(124,58,237,0.6)' : '1px solid rgba(255,255,255,0.1)', color: 'inherit', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.6)'; e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = selectedAnswer === opt ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = selectedAnswer === opt ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.04)'; }}
            >{opt}</button>
          ))}
        </div>

        {isLastQuestion && selectedAnswer && (
          <button onClick={() => handleFindCareers(answers)} style={{ marginTop: 16, width: '100%', padding: '12px', borderRadius: 10, background: '#7c3aed', border: '1px solid #7c3aed', color: 'white', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
            Find My Best Careers →
          </button>
        )}
        {currentQ > 0 && (
          <button onClick={() => setCurrentQ(currentQ - 1)} style={{ marginTop: 16, background: 'none', border: 'none', opacity: 0.5, cursor: 'pointer', color: 'inherit', fontSize: '0.85rem' }}>← Back</button>
        )}
      </div>

      {error && <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.875rem' }}>{error}</div>}
    </div>
  );
}

