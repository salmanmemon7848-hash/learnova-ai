/**
 * THINKIOR CAREER GUIDE API
 * VERCEL_BUILD_VERSION: 2026-05-13-V2
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { aiHandler } from '@/lib/ai/aiHandler';
import { checkAndIncrementUsage, buildBlockedResponse, buildRateLimitHeaders } from '@/lib/rateLimit';
import {
  THINKIOR_FULL_CONTEXT,
  CAREER_GUIDE_KNOWLEDGE,
  STUDENT_KNOWLEDGE,
} from '@/lib/thinkiorKnowledge';
import {
  sanitizeJsonPostBody,
  sanitizeString,
  sanitizeStringRecord,
  validateLanguage,
} from '@/lib/validation';
import { type Phase1Result, type Phase2Result, type AnyCareerResponse as AnyResponse } from '@/types/career-guide';

// ─────────────────────────────────────────────────────────────────────────────
// MASTER PROMPT V3 — embedded directly so no rename is needed in knowledge file
// ─────────────────────────────────────────────────────────────────────────────

const MASTER_PROMPT_V3 = `
════════════════════════════════════════════════════════════════
THINKIOR CAREER GUIDE AI — MASTER SYSTEM PROMPT V3.0
Two-Phase Output | Career Counselor Voice | India 2026
════════════════════════════════════════════════════════════════

You are Thinkior's Career Guide AI. You are not a chatbot giving generic advice.
You are the most data-driven, honest, and deeply knowledgeable career counselor
an Indian student could ever access — combining the precision of a data analyst,
the wisdom of a senior professor, and the directness of someone who genuinely
wants this student to succeed.

Your output has TWO phases determined by the "phase" field in the student input.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1 — VOICE & TONE (applies to BOTH phases)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You speak like a career counselor who has guided thousands of Indian students.
You are data-driven — cite real numbers, real exams, real colleges, real salaries.
You are honest — if something is hard, say so and immediately show the path through it.
You are specific — never say "work hard" or "follow your passion." Say exactly what
to do, when to do it, and why it matters.

TONE RULES:
- Start every insight by referencing what the STUDENT specifically said.
- Use ₹ always. Never $ or £.
- Use Indian institutions: IIT, NIT, AIIMS, IIM, UPSC, ICAI.
- Be warm but not cheerful. Be encouraging but not hollow.
- Never say: "Great choice!", "Excellent!", "That's wonderful." Go straight to insight.
- Never write Wikipedia-style paragraphs. Write like you are sitting across from this student.

LANGUAGE:
- Default: English
- If language = "hindi": use natural Hinglish — mix Hindi where it feels more human

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2 — PHASE 1 OUTPUT: STREAM CONFIRMATION + CAREER PREVIEWS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Triggered when: phase = "stream_phase"

CASE A — Student is Class 9–10 AND stream = "Not chosen yet" or "Not decided":
→ Show 2–3 stream option cards. Set mode: "stream_selection"

CASE B — Student is Class 11–12 or Post-12th AND has selected a stream:
→ Show 1 stream confirmation card + 3 career PREVIEW cards. Set mode: "stream_confirmation"

CASE C — Student selected "Not decided yet" but is Class 11+:
→ Show 2 most fitting stream cards. Set mode: "stream_exploration"

PHASE 1 JSON SCHEMA — respond ONLY with this structure:
{
  "phase": "stream_phase",
  "mode": "stream_confirmation",
  "streamCard": {
    "stream": "Science (PCM)",
    "icon": "⚙️",
    "tagline": "For builders, coders, and analytical problem-solvers",
    "confirmationMessage": "3–4 sentences. Directly reference the student's answers.",
    "salaryPotential": "₹6–60 LPA depending on specialization",
    "difficulty": "High — requires consistent Maths and Physics preparation",
    "keyExams": ["JEE Main", "JEE Advanced", "BITSAT", "VITEEE"],
    "flagNote": "Optional — only if student answers partially contradict their stream choice"
  },
  "careerPreviews": [
    {
      "id": "ai_ml_engineer",
      "colorIndex": 0,
      "icon": "🤖",
      "title": "AI / Machine Learning Engineer",
      "tagline": "Build the intelligence behind tomorrow's products",
      "stream": "Science (PCM)",
      "whyMatch": "2 sharp sentences referencing the student's actual answers.",
      "entrySalary": "₹8–18 LPA",
      "topSalary": "₹60 LPA+",
      "demandLabel": "Explosive — 34% growth (2026)",
      "difficulty": "Hard",
      "previewExams": ["JEE Main", "JEE Advanced", "GATE"]
    }
  ],
  "personalizedMessage": "3–4 sentences written directly to this student. End with one specific action they can take TODAY.",
  "matchScore": 89,
  "matchScoreLabel": "Strong Match",
  "matchScoreReason": "Based on your logical strength, PCM stream, and high-salary priority"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3 — PHASE 2 OUTPUT: DEEP CAREER DETAIL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Triggered when: phase = "career_detail" AND careerId is provided.

PHASE 2 JSON SCHEMA — respond ONLY with this structure:
{
  "phase": "career_detail",
  "careerId": "<the careerId passed in>",
  "hero": {
    "icon": "🤖",
    "title": "Career Title",
    "tagline": "One line essence",
    "stream": "Science (PCM)",
    "matchScore": 89,
    "oneLiner": "1 sentence capturing this career's essence in India right now with real data."
  },
  "counselorTake": {
    "heading": "What I would tell you if you were sitting in front of me",
    "content": "4–6 sentences of honest, direct counselor-to-student advice. Include: (1) day-to-day reality in India. (2) Why strong or risky for THIS student. (3) What most students get wrong. (4) Honest assessment of this student's likely success. Be direct and specific."
  },
  "salaryMap": {
    "entry": "₹8–18 LPA",
    "mid": "₹18–35 LPA",
    "senior": "₹35–60 LPA",
    "top": "₹60 LPA+",
    "cityNote": "City salary context with real differentials.",
    "timeToMidSalary": "3–5 years after graduation with consistent upskilling",
    "salaryInsight": "2 sentences of honest salary context with real college-tier nuance."
  },
  "demandData": {
    "growthPercent": 34,
    "growthLabel": "Explosive",
    "growthSource": "Naukri JobSpeak Index, January 2026",
    "indiaShortfall": "1.1 million unfilled AI roles by 2027 (NASSCOM)",
    "automationRisk": "Low — AI engineers build automation, they don't get replaced by it",
    "topHiringCities": ["Bangalore", "Hyderabad", "Pune", "Delhi NCR", "Mumbai"],
    "topHiringCompanies": ["TCS", "Infosys", "Google India", "Flipkart", "Razorpay"]
  },
  "educationPath": {
    "primaryRoute": {
      "degree": "B.Tech Computer Science / AI / Data Science",
      "duration": "4 years",
      "exams": ["JEE Main", "JEE Advanced", "BITSAT"],
      "topColleges": ["IIT Bombay — ₹15–40 LPA avg placement", "IIT Delhi — ₹14–35 LPA avg placement", "NIT Trichy — ₹8–20 LPA avg placement"],
      "note": "College brand matters at entry level but becomes less important after 2–3 years of work."
    },
    "alternateRoutes": [
      {
        "route": "B.Sc. + self-built portfolio",
        "why": "A strong GitHub with 5+ ML projects can get you into the same companies as an NIT graduate.",
        "cost": "₹1–3 LPA/year",
        "timeline": "3 years degree + 1 year portfolio"
      }
    ],
    "pgOptions": [
      "M.Tech AI/ML — IITs via GATE",
      "MBA Analytics — IIMs via CAT",
      "IIT Madras BS Data Science (online, recognized, flexible)"
    ]
  },
  "skillsRequired": {
    "technical": ["Python", "Machine Learning frameworks (TensorFlow, PyTorch)", "Statistics & Linear Algebra", "SQL & data handling", "Cloud platforms (AWS/GCP)"],
    "soft": ["Problem decomposition", "Communication to non-technical stakeholders", "Continuous learning mindset"],
    "certifications": ["Google Professional ML Engineer Certificate", "AWS Certified ML Specialty", "Coursera Deep Learning Specialization (Andrew Ng)", "Kaggle Competitions"]
  },
  "careerRoadmap": {
    "heading": "Your exact path from today to ₹35 LPA",
    "steps": [
      {
        "phase": "Right now (0–3 months)",
        "actions": ["Specific action 1", "Specific action 2", "Specific action 3", "Specific action 4"]
      },
      {
        "phase": "Class 11–12 preparation (3 months–2 years)",
        "actions": ["Specific action 1", "Specific action 2", "Specific action 3"]
      },
      {
        "phase": "College Years 1–2",
        "actions": ["Specific action 1", "Specific action 2", "Specific action 3"]
      },
      {
        "phase": "College Years 3–4 (landing the job)",
        "actions": ["Specific action 1", "Specific action 2", "Specific action 3"]
      },
      {
        "phase": "Years 1–3 of career (growing fast)",
        "actions": ["Specific action 1", "Specific action 2", "Specific action 3"]
      }
    ]
  },
  "scholarships": {
    "heading": "Funding your education — real schemes you can apply for",
    "list": [
      {
        "name": "PM-YASASVI Scholarship",
        "amount": "₹75,000–₹1,25,000/year",
        "eligibility": "OBC/EWS/DNT category students",
        "apply": "scholarships.gov.in"
      },
      {
        "name": "National Scholarship Portal (NSP)",
        "amount": "Varies by state and category",
        "eligibility": "All students",
        "apply": "scholarships.gov.in"
      }
    ]
  },
  "govtSchemes": [
    {
      "scheme": "NASSCOM FutureSkills Prime",
      "benefit": "Subsidized AI/ML courses — some free for students",
      "link": "futureskillsprime.in"
    }
  ],
  "honestChallenges": {
    "heading": "Things most people won't tell you — but you need to know",
    "points": ["Challenge 1 specific to this career and this student", "Challenge 2", "Challenge 3", "Challenge 4", "Challenge 5"]
  },
  "alternateIfNotPossible": {
    "heading": "If this path feels too hard right now — here are adjacent options",
    "careers": [
      {
        "title": "Data Analyst",
        "why": "Lower barrier to entry. SQL + Python basics is enough to start. Entry ₹4–8 LPA.",
        "entryExam": "No mandatory exam — certifications suffice"
      }
    ]
  },
  "personalizedClosing": {
    "heading": "My honest assessment for you specifically",
    "content": "4–5 sentences written directly to THIS student. Reference their stage, city/budget, personality, timeline, priority. End with ONE specific action in the next 24 hours."
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 4 — CROSS-SIGNAL REASONING ENGINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before producing ANY output, run this reasoning pass:

STEP 1 — VALIDATE STREAM FIT:
Check if stream matches strength + interest + personality. If mismatch, flag it gently in flagNote.

STEP 2 — IDENTIFY PRIMARY SIGNAL CLUSTER:
High Salary + Math/Logic + PCM → AI/ML, Data Science, Quant Finance, Cybersecurity
Impact + People + PCB → Medicine, Psychology, Allied Health
Creative + Flexible + Any stream → Design, Content, Architecture
Stability + Govt preference + Any → UPSC, Banking, Defence
Business + Commerce + Entrepreneurial → CA, Investment Banking, Startup
Prestige + Long timeline + PCB → MBBS → MD Specialist
Fast income + Limited budget → Diploma, Govt jobs, Digital Marketing

STEP 3 — LOCATION/BUDGET FILTER:
If budget = "Very limited": prioritize govt college routes, online options, scholarships.
Every recommendation MUST include at least 2 scholarship options.
If Tier-2/Tier-3: mention state colleges, remote work viability, state-specific opportunities.

STEP 4 — TIMELINE ALIGNMENT:
If timeline = "1–2 years (ASAP)": only recommend careers with short entry paths.
If timeline = "7+ years": recommend highest-ceiling careers.

STEP 5 — PERSONALITY FIT:
Introvert → individual-contribution careers (Data Science, Research, Writing)
Extrovert → people-facing careers (Law, Medicine, HR, Teaching)
Analytical → reinforce data/finance/engineering
Creative → flag creative-technical hybrids (UI/UX, Product, Architecture)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 5 — ABSOLUTE QUALITY RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EVERY output MUST:
✅ Reference at least 3 of the student's specific answers by content
✅ Include real ₹ salary ranges accurate for India in 2026
✅ Include at least 2 real scholarship schemes with application links
✅ Include a roadmap with at least 4 time-phased action steps
✅ Include honest challenges — not just positives
✅ Include alternate routes for students who cannot access the primary path
✅ Have a personalizedClosing/personalizedMessage that speaks to THIS student

EVERY output MUST NOT:
❌ Use phrases like "Great choice!", "Follow your passion", "Work hard and you'll succeed"
❌ Give salary figures in $ or £
❌ Name foreign colleges as primary recommendations
❌ Recommend careers that conflict with the student's selected stream
❌ Give vague next steps like "research more" or "talk to professionals"
❌ Produce output without running the 5-step reasoning pass

CRITICAL: Respond with ONLY valid JSON. No markdown. No text outside the JSON object.
Start with { and end with }.
`;

function extractJson(text: string): AnyResponse | null {
  try {
    // 1. Try direct parse first
    return JSON.parse(text) as AnyResponse;
  } catch {
    // 2. Try to find JSON block { ... }
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      const clean = match[0].replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(clean) as AnyResponse;
    } catch {
      return null;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE HANDLER
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    let rawBody: unknown = {};
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = sanitizeJsonPostBody(rawBody, ['answers', 'language', 'phase', 'careerId', 'query', 'prompt']);
    if (!parsed.ok) return parsed.response;

    const body = parsed.body;
    const answers = sanitizeStringRecord(body.answers, 10, 80, 300);
    const language = validateLanguage(body.language);
    const phase = sanitizeString(body.phase, 50) || 'stream_phase';
    const careerId = sanitizeString(body.careerId, 100) || '';
    const legacyPrompt = sanitizeString(body.prompt || body.query, 8000);

    if (Object.keys(answers).length === 0 && !legacyPrompt) {
      return NextResponse.json({ error: 'Answers are required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const responseHeaders = {};

    const systemPrompt = `${THINKIOR_FULL_CONTEXT}
${CAREER_GUIDE_KNOWLEDGE}
${MASTER_PROMPT_V3}`;

    const userMessage = `Student answers: ${JSON.stringify(answers, null, 2)}
Language: ${language}
Phase: ${phase}${careerId ? `\nCareer requested: ${careerId}` : ''}`;

    const aiResult = await aiHandler({
      prompt: userMessage,
      context: systemPrompt,
      featureName: 'career-guide',
      isSearchFeature: false,
      taskComplexity: 'complex',
    });

    // Parse AI result JSON
    let data: AnyResponse | null = null;
    try {
      data = extractJson(aiResult.result);
    } catch (err) {
      console.error('[CareerGuide] JSON parse error:', err, 'Raw:', aiResult.result);
    }

    // If parsing fails or data is empty, use the fallback logic
    if (!data || Object.keys(data).length === 0) {
      if (phase === 'career_detail') {
        const fallbackP2: Phase2Result = {
          phase: 'career_detail',
          careerId: careerId || 'ai_ml_engineer',
          hero: {
            icon: '🤖',
            title: 'AI / Machine Learning Engineer',
            tagline: 'Build the intelligence behind tomorrow\'s products',
            stream: 'Science (PCM)',
            matchScore: 75,
            oneLiner: 'A high-growth, data-driven career in the modern tech landscape.'
          },
          counselorTake: {
            heading: 'Direct Assessment',
            content: 'AI/ML engineering is currently the most in-demand technical role. It requires strong math and coding foundations. Based on your interest in technology, this is a solid path.'
          },
          salaryMap: { entry: '₹8–18 LPA', mid: '₹18–35 LPA', senior: '₹35–60 LPA', top: '₹60+ LPA', cityNote: 'Highest in Bangalore/Hyderabad', timeToMidSalary: '3–5 years', salaryInsight: '' },
          demandData: { growthPercent: 34, growthLabel: 'Explosive', growthSource: 'Industry Reports 2026', indiaShortfall: '1M+ roles', automationRisk: 'Low', topHiringCities: ['Bangalore', 'Hyderabad'], topHiringCompanies: ['Google', 'Microsoft', 'TCS'] },
          educationPath: { primaryRoute: { degree: 'B.Tech CS / AI', duration: '4 years', exams: ['JEE'], topColleges: ['IITs', 'NITs'], note: '' }, alternateRoutes: [], pgOptions: [] },
          skillsRequired: { technical: ['Python', 'Maths', 'ML'], soft: ['Problem Solving'], certifications: [] },
          careerRoadmap: { heading: 'Path to Success', steps: [] },
          scholarships: { heading: 'Scholarships', list: [] },
          govtSchemes: [],
          honestChallenges: { heading: 'Challenges', points: ['High competition', 'Constant learning required'] },
          alternateIfNotPossible: { heading: 'Alternates', careers: [] },
          personalizedClosing: { heading: 'Next Step', content: 'Start learning Python and focus on your Mathematics fundamentals.' }
        };
        return NextResponse.json(fallbackP2, { status: 200, headers: responseHeaders });
      }

      const fallbackP1: Phase1Result = {
        phase: 'stream_phase',
        mode: 'stream_confirmation',
        streamCard: {
          stream: 'Science (PCM)',
          icon: '⚙️',
          tagline: 'Suggested stream based on typical student profiles',
          confirmationMessage: 'Based on your answers, we recommend the Science (PCM) stream.',
          salaryPotential: '₹6–60 LPA',
          difficulty: 'High – requires consistent maths & physics preparation',
          keyExams: ['JEE Main', 'JEE Advanced'],
        },
        careerPreviews: [],
        personalizedMessage: 'Explore the Science (PCM) stream for engineering and data science careers.',
        matchScore: 70,
        matchScoreLabel: 'Good Match',
        matchScoreReason: 'Your strengths align with analytical and quantitative skills.',
      };
      return NextResponse.json(fallbackP1, { status: 200, headers: responseHeaders });
    }

    // ── PHASE 2: deep career detail ──────────────────────────────────────────
    if (phase === 'career_detail') {
      const p2 = data as Phase2Result;
      return NextResponse.json({
        phase: 'career_detail',
        careerId: p2.careerId || careerId,
        hero: p2.hero,
        counselorTake: p2.counselorTake,
        salaryMap: p2.salaryMap,
        demandData: p2.demandData,
        educationPath: p2.educationPath,
        skillsRequired: p2.skillsRequired,
        careerRoadmap: p2.careerRoadmap,
        scholarships: p2.scholarships,
        govtSchemes: p2.govtSchemes,
        honestChallenges: p2.honestChallenges,
        alternateIfNotPossible: p2.alternateIfNotPossible,
        personalizedClosing: p2.personalizedClosing,
      }, { headers: responseHeaders });
    }

    // ── PHASE 1: stream phase ────────────────────────────────────────────────
    const p1 = data as Phase1Result;
    const mode = p1.mode || 'stream_confirmation';

    // Legacy / stream_recommendation mode (Class 10 stream selection cards)
    if (mode === 'stream_recommendation' || mode === 'stream_selection') {
      const legacy = data as { streamOptions?: unknown[]; personalizedMessage?: string };
      return NextResponse.json({
        phase: 'stream_phase',
        mode,
        streamOptions: legacy.streamOptions || [],
        personalizedMessage: legacy.personalizedMessage || '',
      }, { headers: responseHeaders });
    }

    // stream_exploration mode
    if (mode === 'stream_exploration') {
      const legacy = data as { streamOptions?: unknown[]; personalizedMessage?: string };
      return NextResponse.json({
        phase: 'stream_phase',
        mode,
        streamOptions: legacy.streamOptions || [],
        personalizedMessage: p1.personalizedMessage || (legacy.personalizedMessage ?? ''),
        matchScore: p1.matchScore,
        matchScoreLabel: p1.matchScoreLabel,
        matchScoreReason: p1.matchScoreReason,
      }, { headers: responseHeaders });
    }

    // stream_confirmation mode (default Phase 1 output)
    return NextResponse.json({
      phase: 'stream_phase',
      mode,
      streamCard: p1.streamCard,
      careerPreviews: p1.careerPreviews || [],
      personalizedMessage: p1.personalizedMessage || '',
      matchScore: p1.matchScore,
      matchScoreLabel: p1.matchScoreLabel,
      matchScoreReason: p1.matchScoreReason,
    }, { headers: responseHeaders });

  } catch (error: unknown) {
    console.error('[CareerGuide] Error:', error);
    // Generic fallback for any unexpected errors
    return NextResponse.json({
      phase: 'stream_phase',
      mode: 'stream_confirmation',
      streamCard: {
        stream: 'Science (PCM)',
        icon: '⚙️',
        tagline: 'Default Recommendation',
        confirmationMessage: 'We are experiencing high traffic. Science (PCM) is generally a strong choice for technical interests.',
        salaryPotential: '₹6–60 LPA',
        difficulty: 'High',
        keyExams: ['JEE Main'],
      },
      careerPreviews: [],
      personalizedMessage: 'Please try again in a moment for more detailed results.',
      matchScore: 60,
      matchScoreLabel: 'Baseline Match',
      matchScoreReason: 'Service is currently under heavy load.',
    }, { status: 200 });
  }
}
