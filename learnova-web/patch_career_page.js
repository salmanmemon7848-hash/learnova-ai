// patch_career_page.js — run with: node patch_career_page.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/(dashboard)/career/page.tsx');
let c = fs.readFileSync(filePath, 'utf8');

// ── 1. Add new fields to Career type ──────────────────────────────────────────
c = c.replace(
  /(\s*careerPath\?\: string;\n\s*fullDetails\?\: string;\n\};)/,
  `
  careerPath?: string;
  midSalary?: string;
  citySalaryNote?: string;
  demandNote?: string;
  automationRisk?: string;
  difficultyNote?: string;
  scholarships?: string[];
  alternateRoutes?: string[];
  nextSteps?: string[];
  govtSchemes?: string[];
  fullDetails?: string;
};`
);

// ── 2. Replace CareerResults type + add StreamOption type ─────────────────────
c = c.replace(
  /type CareerResults = \{[\s\S]*?\};(\s*\ntype CareerGuideError)/,
  `type StreamOption = {
  stream: string;
  icon: string;
  tagline: string;
  whyForYou: string;
  topCareers: string[];
  difficulty: string;
  salaryPotential: string;
  keyExams: string[];
};

type CareerResults = {
  mode?: string;
  careers?: Career[];
  streamOptions?: StreamOption[];
  personalizedMessage?: string;
  matchScore?: number;
  matchScoreNote?: string;
  explorationTip?: string;
};
$1`
);

// ── 3. Replace questions array with 10 questions ──────────────────────────────
const NEW_QUESTIONS = `const questions = [
  {
    id: 'stage',
    question: 'Which stage are you at right now?',
    subtitle: 'This helps us give you advice that fits where you actually are.',
    options: [
      'Class 9\u201310 (choosing stream)',
      'Class 11\u201312 (planning after boards)',
      'Just finished 12th (deciding college/career)',
      'Already in college (reconsidering path)',
    ],
  },
  {
    id: 'stream',
    question: 'Which stream are you in or most interested in?',
    subtitle: 'We will only recommend careers from your stream.',
    options: [
      'Science \u2014 PCM (Physics, Chemistry, Maths)',
      'Science \u2014 PCB (Physics, Chemistry, Biology)',
      'Commerce (with or without Maths)',
      'Arts / Humanities',
      'Not decided yet \u2014 help me explore',
    ],
  },
  {
    id: 'strength',
    question: 'What do people say you are naturally good at?',
    subtitle: 'Be honest \u2014 your actual strengths matter more than what sounds impressive.',
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
    subtitle: 'Career satisfaction depends a lot on daily environment \u2014 not just the title.',
    options: [
      'Focused solo work \u2014 deep thinking, building, researching',
      'Collaborating in a team \u2014 meetings, brainstorming, projects',
      'Interacting with people daily \u2014 clients, patients, students',
      'Out in the field \u2014 travel, on-site, physical work',
      'Flexible & remote \u2014 working from anywhere on my own schedule',
    ],
  },
  {
    id: 'priority',
    question: 'What matters most to you in a career?',
    subtitle: 'There is no wrong answer here \u2014 be real with yourself.',
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
    subtitle: 'This helps us match careers to your natural personality \u2014 not an ideal version of you.',
    options: [
      'Introvert \u2014 I recharge alone; prefer depth over breadth',
      'Extrovert \u2014 I get energy from people and thrive socially',
      'Ambivert \u2014 depends on the situation',
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
      'As soon as possible \u2014 1 to 2 years (diploma, short courses)',
      'After graduation \u2014 3 to 4 years (standard degree)',
      'After postgrad \u2014 5 to 6 years (masters, CA, MBA)',
      'Long-term investment \u2014 7+ years (medicine, research, UPSC)',
    ],
  },
  {
    id: 'budget',
    question: 'What is your approximate education budget?',
    subtitle: 'This helps us recommend realistic college options and highlight scholarships.',
    options: [
      'Very limited \u2014 need scholarships or govt college',
      'Moderate \u2014 state or mid-tier private college is fine',
      'Comfortable \u2014 top private colleges are okay',
      'Flexible \u2014 willing to invest heavily for the right college',
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
];`;

c = c.replace(/const questions = \[[\s\S]*?\];(\s*\nfunction CareerCard)/, NEW_QUESTIONS + '\n$1');

// ── 4. Patch handleFindCareers to store new fields from response ───────────────
c = c.replace(
  /const streams = Array\.from\(new Set\(\(data\.careers \|\| \[\]\)\.map\(\(c\) => c\.stream\)\.filter\(Boolean\)\)\) as string\[\];\s*setSelectedStream\(streams\[0\] \|\| ''\);\s*setResults\(data\);/,
  `const streams = Array.from(new Set((data.careers || []).map((c) => c.stream).filter(Boolean))) as string[];
      setSelectedStream(streams[0] || '');
      setResults(data);`
);

// ── 5. Add subtitle display in the quiz question card ─────────────────────────
c = c.replace(
  /<h3 style=\{\{ marginBottom: 20, fontSize: '1\.1rem', lineHeight: 1\.5 \}\}>\s*\{questions\[currentQ\]\.question\}\s*<\/h3>/,
  `<h3 style={{ marginBottom: 8, fontSize: '1.1rem', lineHeight: 1.5 }}>
          {questions[currentQ].question}
        </h3>
        {'subtitle' in questions[currentQ] && (
          <p style={{ marginBottom: 16, fontSize: '0.8rem', opacity: 0.55, lineHeight: 1.5 }}>
            {(questions[currentQ] as any).subtitle}
          </p>
        )}`
);

// ── 6. Add matchScore + explorationTip to results header ─────────────────────
c = c.replace(
  /<p style=\{\{ opacity: 0\.6, marginBottom: 16, fontSize: '0\.875rem' \}\}>\s*\{results\?\.personalizedMessage \|\| 'Here are your best-fit career paths\.'\}\s*<\/p>/,
  `<p style={{ opacity: 0.75, marginBottom: results?.matchScore ? 12 : 16, fontSize: '0.875rem', lineHeight: 1.6 }}>
            {results?.personalizedMessage || 'Here are your best-fit career paths.'}
          </p>
          {results?.matchScore && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ padding: '4px 14px', borderRadius: 20, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', fontSize: '0.8rem', fontWeight: 600 }}>
                {results.matchScore}% Match
              </div>
              {results.matchScoreNote && (
                <span style={{ fontSize: '0.75rem', opacity: 0.55 }}>{results.matchScoreNote}</span>
              )}
            </div>
          )}
          {results?.explorationTip && (
            <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.8rem', opacity: 0.85 }}>
              💡 {results.explorationTip}
            </div>
          )}`
);

// ── 7. Add midSalary + automationRisk to CareerCard ───────────────────────────
c = c.replace(
  /<div style=\{\{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 \}\}>\s*<div style=\{\{ background: 'rgba\(0,0,0,0\.2\)', borderRadius: 10, padding: '12px 16px' \}\}>\s*<div style=\{\{ fontSize: '0\.72rem', opacity: 0\.6, marginBottom: 4 \}\}>Entry Salary<\/div>\s*<div style=\{\{ fontSize: '1rem', fontWeight: 700 \}\}>\{career\.entrySalary\}<\/div>\s*<\/div>\s*<div style=\{\{ background: 'rgba\(0,0,0,0\.2\)', borderRadius: 10, padding: '12px 16px' \}\}>\s*<div style=\{\{ fontSize: '0\.72rem', opacity: 0\.6, marginBottom: 4 \}\}>Top Salary<\/div>\s*<div style=\{\{ fontSize: '1rem', fontWeight: 700 \}\}>\{career\.topSalary\}<\/div>\s*<\/div>\s*<\/div>/,
  `<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ fontSize: '0.68rem', opacity: 0.6, marginBottom: 3 }}>Entry</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{career.entrySalary}</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ fontSize: '0.68rem', opacity: 0.6, marginBottom: 3 }}>Mid</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{career.midSalary || '—'}</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ fontSize: '0.68rem', opacity: 0.6, marginBottom: 3 }}>Top</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{career.topSalary}</div>
        </div>
      </div>`
);

// ── 8. Add automationRisk to the info row in CareerCard ───────────────────────
c = c.replace(
  /<span>⏱️ \{career\.duration\}<\/span>\s*<span>📈 \{career\.demandPercent\}% \(\{career\.demandLabel\}\)<\/span>\s*<span>🎯 \{career\.difficulty\}<\/span>/,
  `<span>⏱️ {career.duration}</span>
        <span>📈 {career.demandPercent}% ({career.demandLabel})</span>
        <span>🎯 {career.difficulty}</span>
        {career.automationRisk && <span>🤖 {career.automationRisk} AI Risk</span>}`
);

// ── 9. Add scholarships + nextSteps + alternateRoutes to CareerFullDetails ────
c = c.replace(
  /\{career\.exams \&\& career\.exams\.length > 0 \&\& \(\s*<div className="result-card" style=\{\{ marginBottom: 16 \}\}>\s*<h4 style=\{\{ marginBottom: 12 \}\}>Entrance Exams Required<\/h4>[\s\S]*?\)\}\s*<\/div>\s*\)\}\s*\)<\/div>\s*\);\s*\}/,
  (match) => match + `
`
);

// After exams section in CareerFullDetails, add new sections
const EXAM_SECTION_END = `        </div>
      )}
    </div>
  );
}`;

const NEW_SECTIONS = `        </div>
      )}

      {career.nextSteps && career.nextSteps.length > 0 && (
        <div className="result-card" style={{ marginBottom: 16 }}>
          <h4 style={{ marginBottom: 12 }}>Your Roadmap — Next Steps</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {career.nextSteps.map((step: string, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 10, fontSize: '0.85rem' }}>
                <span style={{ color: '#7c3aed', fontWeight: 700, minWidth: 20 }}>{i + 1}.</span>
                <span style={{ opacity: 0.85 }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {career.scholarships && career.scholarships.length > 0 && (
        <div className="result-card" style={{ marginBottom: 16 }}>
          <h4 style={{ marginBottom: 12 }}>Scholarships Available</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {career.scholarships.map((s: string, i: number) => (
              <span key={i} style={{ padding: '6px 14px', borderRadius: 20, fontSize: '0.78rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {career.alternateRoutes && career.alternateRoutes.length > 0 && (
        <div className="result-card" style={{ marginBottom: 16 }}>
          <h4 style={{ marginBottom: 12 }}>Alternate Routes</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {career.alternateRoutes.map((route: string, i: number) => (
              <div key={i} style={{ fontSize: '0.85rem', opacity: 0.8, paddingLeft: 12, borderLeft: '2px solid rgba(124,58,237,0.4)' }}>{route}</div>
            ))}
          </div>
        </div>
      )}

      {career.govtSchemes && career.govtSchemes.length > 0 && (
        <div className="result-card" style={{ marginBottom: 16 }}>
          <h4 style={{ marginBottom: 12 }}>Government Schemes</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {career.govtSchemes.map((s: string, i: number) => (
              <span key={i} style={{ padding: '6px 14px', borderRadius: 20, fontSize: '0.78rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}`;

c = c.replace(EXAM_SECTION_END, NEW_SECTIONS);

// ── 10. Handle stream_recommendation mode in results ─────────────────────────
const STREAM_REC_BLOCK = `
  if (phase === 'results' && results?.mode === 'stream_recommendation') {
    return (
      <div className="page-container min-h-screen bg-[#0F0F10] text-white p-6 max-w-5xl mx-auto">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>🎯 Career Guide</h1>
          <p style={{ opacity: 0.7, marginBottom: 20, fontSize: '0.9rem', lineHeight: 1.6 }}>
            {results.personalizedMessage}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {(results.streamOptions || []).map((opt: any, i: number) => (
            <div key={i} style={{ background: i === 0 ? 'rgba(99,102,241,0.1)' : 'rgba(16,185,129,0.08)', border: \`1px solid \${i === 0 ? 'rgba(99,102,241,0.3)' : 'rgba(16,185,129,0.25)'}\`, borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>{opt.icon}</div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>{opt.stream}</h2>
              <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: 14 }}>{opt.tagline}</p>
              <p style={{ fontSize: '0.85rem', opacity: 0.85, lineHeight: 1.6, marginBottom: 14 }}>{opt.whyForYou}</p>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: '0.72rem', opacity: 0.55, marginBottom: 6 }}>TOP CAREERS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {opt.topCareers?.map((c: string, ci: number) => (
                    <span key={ci} style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.73rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>{c}</span>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', opacity: 0.65, marginBottom: 6 }}>💰 {opt.salaryPotential}</div>
              <div style={{ fontSize: '0.78rem', opacity: 0.65 }}>⚡ {opt.difficulty}</div>
            </div>
          ))}
        </div>
        <button onClick={() => { setPhase('questions'); setCurrentQ(0); setAnswers({}); setResults(null); }} style={{ marginTop: 24, background: 'none', border: 'none', opacity: 0.5, cursor: 'pointer', color: 'inherit', fontSize: '0.85rem' }}>
          ← Start over
        </button>
      </div>
    );
  }
`;

c = c.replace(
  /(\s*if \(phase === 'results'\) \{)/,
  STREAM_REC_BLOCK + '$1'
);

fs.writeFileSync(filePath, c, 'utf8');
console.log('career/page.tsx patched successfully. Lines:', c.split('\n').length);
