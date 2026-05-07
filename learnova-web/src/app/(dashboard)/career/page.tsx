'use client';

import { useMemo, useState } from 'react';

type Phase = 'questions' | 'loading' | 'results';

type Career = {
  colorIndex?: number;
  icon?: string;
  title: string;
  tagline?: string;
  stream?: string;
  entrySalary?: string;
  topSalary?: string;
  duration?: string;
  demandPercent?: number;
  demandLabel?: string;
  difficulty?: string;
  exams?: string[];
  whyMatch?: string;
  keySkills?: string[];
  topColleges?: string[];
  careerPath?: string;
  fullDetails?: string;
};

type CareerResults = {
  careers: Career[];
  personalizedMessage?: string;
};

const questions = [
  {
    id: 'stream',
    question: 'Which stream are you from or most interested in?',
    options: ['Science (PCM)', 'Science (PCB)', 'Commerce', 'Arts / Humanities', 'Not sure yet'],
  },
  {
    id: 'interest',
    question: 'What activities do you enjoy most?',
    options: [
      'Solving problems / coding',
      'Helping and caring for people',
      'Creating art / writing / content',
      'Business / money / entrepreneurship',
      'Research / experiments / discovery',
      'Teaching / explaining things',
    ],
  },
  {
    id: 'workStyle',
    question: 'How do you prefer to work?',
    options: [
      'Alone - focused, deep work',
      'In a team - collaborative',
      'With people daily - social',
      'Outdoors / field work',
      'Flexible / remote / freelance',
    ],
  },
  {
    id: 'priority',
    question: 'What matters most to you in a career?',
    options: [
      'High salary and financial security',
      'Making a difference / social impact',
      'Creative freedom and expression',
      'Stability and job security',
      'Prestige and recognition',
      'Work-life balance',
    ],
  },
  {
    id: 'timeline',
    question: 'When do you want to start earning?',
    options: [
      'As soon as possible (1-2 years)',
      'After graduation (3-4 years)',
      'After postgraduate study (5-6 years)',
      'Long term investment (7+ years)',
    ],
  },
];

function CareerCard({
  career,
  onViewDetails,
}: {
  career: Career;
  onViewDetails: (career: Career) => void;
}) {
  const cardColors = [
    { bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)', accent: '#6366f1' },
    { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', accent: '#ef4444' },
    { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', accent: '#10b981' },
  ];
  const color = cardColors[(career.colorIndex || 0) % cardColors.length];

  return (
    <div style={{
      background: color.bg,
      border: `1px solid ${color.border}`,
      borderRadius: 16, padding: 24, marginBottom: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem',
          }}>
            {career.icon}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>{career.title}</h3>
            <p style={{ margin: 0, opacity: 0.6, fontSize: '0.8rem' }}>{career.tagline}</p>
          </div>
        </div>
        <button style={{
          padding: '6px 14px', borderRadius: 20, fontSize: '0.78rem',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'inherit', cursor: 'pointer',
        }}>
          + Compare
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '12px 16px' }}>
          <div style={{ fontSize: '0.72rem', opacity: 0.6, marginBottom: 4 }}>Entry Salary</div>
          <div style={{ fontSize: '1rem', fontWeight: 700 }}>{career.entrySalary}</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '12px 16px' }}>
          <div style={{ fontSize: '0.72rem', opacity: 0.6, marginBottom: 4 }}>Top Salary</div>
          <div style={{ fontSize: '1rem', fontWeight: 700 }}>{career.topSalary}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap', fontSize: '0.82rem' }}>
        <span>⏱️ {career.duration}</span>
        <span>📈 {career.demandPercent}% ({career.demandLabel})</span>
        <span>🎯 {career.difficulty}</span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {career.exams?.slice(0, 3).map((exam, i) => (
          <span key={i} style={{
            padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            {exam}
          </span>
        ))}
        {(career.exams?.length || 0) > 3 && (
          <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', opacity: 0.5 }}>
            +{(career.exams?.length || 0) - 3} more
          </span>
        )}
      </div>

      <button
        onClick={() => onViewDetails(career)}
        style={{
          width: '100%', padding: '12px', borderRadius: 10,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'inherit', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
        }}
      >
        View Full Details →
      </button>
    </div>
  );
}

export default function CareerGuidePage() {
  const [phase, setPhase] = useState<Phase>('questions');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<CareerResults | null>(null);
  const [selectedStream, setSelectedStream] = useState('Science');
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [error, setError] = useState('');

  const handleFindCareers = async (finalAnswers = answers) => {
    setPhase('loading');
    setError('');
    setSelectedCareer(null);

    try {
      const res = await fetch('/api/career-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers, language: 'english' }),
      });
      const data = await res.json() as CareerResults & { error?: string };
      if (!res.ok) throw new Error(data.error || 'Failed to find careers');
      setResults(data);
      setPhase('results');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to find careers');
      setPhase('questions');
    }
  };

  const filteredCareers = useMemo(() => {
    const careers = results?.careers || [];
    return careers.filter((career) => {
      if (!career.stream) return true;
      return String(career.stream).toLowerCase().includes(selectedStream.toLowerCase());
    });
  }, [results, selectedStream]);

  if (selectedCareer) {
    return (
      <div className="page-container min-h-screen bg-[#0F0F10] text-white p-6 max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedCareer(null)}
          style={{ marginBottom: 16, background: 'none', border: 'none', opacity: 0.7, cursor: 'pointer', color: 'inherit', fontSize: '0.9rem' }}
        >
          ← Back to results
        </button>
        <div className="result-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 10,
              background: 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem',
            }}>
              {selectedCareer.icon}
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>{selectedCareer.title}</h1>
              <p style={{ margin: 0, opacity: 0.65, fontSize: '0.9rem' }}>{selectedCareer.tagline}</p>
            </div>
          </div>
          <p style={{ opacity: 0.85, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{selectedCareer.fullDetails}</p>
          {selectedCareer.whyMatch && (
            <div style={{ marginTop: 20, padding: 16, borderRadius: 10, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)' }}>
              <strong>Why this matches you</strong>
              <p style={{ margin: '8px 0 0', opacity: 0.8 }}>{selectedCareer.whyMatch}</p>
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-4" style={{ marginTop: 20 }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', marginBottom: 10 }}>Key Skills</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selectedCareer.keySkills?.map((skill: string, i: number) => (
                  <span key={i} style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', marginBottom: 10 }}>Top Colleges</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selectedCareer.topColleges?.map((college: string, i: number) => (
                  <span key={i} style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    {college}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {selectedCareer.careerPath && (
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: 8 }}>Career Path</h3>
              <p style={{ opacity: 0.8, lineHeight: 1.6 }}>{selectedCareer.careerPath}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>🎯 Career Guide</h1>
        <p style={{ opacity: 0.6, marginBottom: 24, fontSize: '0.875rem' }}>
          Finding your best-fit career paths...
        </p>
        <div className="result-card" style={{ padding: 24, textAlign: 'center' }}>
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#7c3aed', borderTopColor: 'transparent' }} />
          <p style={{ opacity: 0.7 }}>Thinkior is building your personalized roadmap.</p>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    return (
      <div className="page-container min-h-screen bg-[#0F0F10] text-white p-6 max-w-5xl mx-auto">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>🎯 Career Guide</h1>
          <p style={{ opacity: 0.6, marginBottom: 16, fontSize: '0.875rem' }}>
            {results?.personalizedMessage || 'Here are your best-fit career paths.'}
          </p>
          <div
            className="tabs-row"
            style={{
              display: 'flex',
              gap: 10,
              marginBottom: 24,
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              paddingBottom: 4,
            }}
          >
            {(['Science', 'Commerce', 'Arts'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedStream(tab)}
                style={{
                  padding: '10px 24px',
                  borderRadius: 24,
                  border: 'none',
                  whiteSpace: 'nowrap',
                  background: selectedStream === tab ? '#7c3aed' : 'rgba(255,255,255,0.04)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: selectedStream === tab ? 600 : 400,
                  flexShrink: 0,
                }}
              >
                {tab === 'Science' ? '🔬' : tab === 'Commerce' ? '💰' : '🎨'} {tab}
              </button>
            ))}
            <button
              onClick={() => {
                setPhase('questions');
                setCurrentQ(0);
                setAnswers({});
                setResults(null);
              }}
              style={{ background: 'none', border: 'none', opacity: 0.55, cursor: 'pointer', color: 'inherit', fontSize: '0.85rem', padding: '8px 12px' }}
            >
              Start over
            </button>
          </div>
        </div>

        <div className="career-cards-grid grid grid-cols-1 md:grid-cols-2 gap-4">
          {(filteredCareers.length ? filteredCareers : results?.careers || []).map((career, i) => (
            <CareerCard
              key={`${career.title}-${i}`}
              career={{ ...career, colorIndex: career.colorIndex ?? i }}
              onViewDetails={setSelectedCareer}
            />
          ))}
        </div>
      </div>
    );
  }

  const selectedAnswer = answers[questions[currentQ].id];
  const isLastQuestion = currentQ === questions.length - 1;

  return (
    <div className="page-container" style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>
        🎯 Career Guide
      </h1>
      <p style={{ opacity: 0.6, marginBottom: 24, fontSize: '0.875rem' }}>
        Answer a few questions and get your personalized career roadmap.
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.8rem', opacity: 0.6 }}>
        <span>Question {currentQ + 1} of {questions.length}</span>
        <span>{Math.round((currentQ / questions.length) * 100)}% complete</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 4, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 4, background: '#7c3aed',
          width: `${(currentQ / questions.length) * 100}%`,
          transition: 'width 0.3s ease',
        }} />
      </div>

      <div className="result-card" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 20, fontSize: '1.1rem', lineHeight: 1.5 }}>
          {questions[currentQ].question}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {questions[currentQ].options.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                const newAnswers = { ...answers, [questions[currentQ].id]: opt };
                setAnswers(newAnswers);
                if (currentQ < questions.length - 1) {
                  setCurrentQ(currentQ + 1);
                }
              }}
              style={{
                padding: '12px 16px', borderRadius: 10, textAlign: 'left',
                background: selectedAnswer === opt ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.04)',
                border: selectedAnswer === opt ? '1px solid rgba(124,58,237,0.6)' : '1px solid rgba(255,255,255,0.1)',
                color: 'inherit', cursor: 'pointer', fontSize: '0.9rem',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(124,58,237,0.6)';
                e.currentTarget.style.background = 'rgba(124,58,237,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = selectedAnswer === opt ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.1)';
                e.currentTarget.style.background = selectedAnswer === opt ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.04)';
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        {isLastQuestion && selectedAnswer && (
          <button
            onClick={() => handleFindCareers(answers)}
            style={{
              marginTop: 16,
              width: '100%',
              padding: '12px',
              borderRadius: 10,
              background: '#7c3aed',
              border: '1px solid #7c3aed',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            Find My Best Careers →
          </button>
        )}

        {currentQ > 0 && (
          <button
            onClick={() => setCurrentQ(currentQ - 1)}
            style={{
              marginTop: 16, background: 'none', border: 'none',
              opacity: 0.5, cursor: 'pointer', color: 'inherit', fontSize: '0.85rem',
            }}
          >
            ← Back
          </button>
        )}
      </div>

      {error && (
        <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}
    </div>
  );
}
