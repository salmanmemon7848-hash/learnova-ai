'use client'

import { useState, useRef, useEffect, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useRole } from '@/contexts/RoleContext'
import { validateLanguage } from '@/lib/languageConfig'
import { validateInput, buildRateLimitMessage } from '@/lib/rateLimitClient'

type Step = 'setup' | 'voice-interview' | 'chat-interview' | 'voice-results' | 'chat-results'
type InterviewMode = 'voice' | 'chat'
type Phase = 'idle' | 'ai-speaking' | 'listening' | 'processing' | 'thinking' | 'preparing-mic'
type VoiceResultsTab = 'overview' | 'questions' | 'weaknesses' | 'plan'

interface Message { role: 'user' | 'assistant'; content: string }
interface ChatAnswer { question: string; answer: string; score: number; feedback: string; improvement: string }
interface ParsedQuestion { id: number; question: string; category: string; difficulty: string; language?: string; hasLanguageError?: boolean; }
interface DimScore { score: number; verdict: string; evidence: string; detailed_feedback: string; improvement: string }
interface QReview { question_number: number; question_asked: string; candidate_answer_summary: string; answer_quality: string; what_was_good: string; what_was_missing: string; ideal_answer_points: string[]; score: number }
interface WeekPlan { week: string; focus: string; daily_practice: string; goal: string }
interface VoiceEval {
  overall_score?: number; hiring_decision?: string; hiring_reason?: string; executive_summary?: string;
  dimension_scores?: Record<string, DimScore>;
  question_by_question_review?: QReview[];
  critical_weaknesses?: { weakness: string; impact: string; fix: string }[];
  genuine_strengths?: { strength: string; evidence: string }[];
  red_flags?: string[]; green_flags?: string[];
  interview_ready?: string;
  '30_day_improvement_plan'?: WeekPlan[];
  resources_to_study?: { resource: string; why: string; time_needed: string }[];
  senior_judge_message?: string;
  // Legacy fields kept for backward compat
  clarity?: number; confidence?: number; relevance?: number; depth?: number;
  strongest_moment?: string; weakest_moment?: string; specific_improvements?: string[];
  final_verdict?: string; overallScore?: number; communication?: number; technical?: number;
  presentation?: number; strength?: string; improvement?: string;
}

export default function InterviewPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { role } = useRole()
  const [step, setStep] = useState<Step>('setup')
  const [mode, setMode] = useState<InterviewMode>('voice')
  const [interviewType, setInterviewType] = useState('')
  const [schoolClass, setSchoolClass] = useState('')
  const [language, setLanguage] = useState('english')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ── Voice mode — Gemini-style phase machine ────────────────────────────────
  const [phase, setPhase] = useState<Phase>('idle')
  const [conversationHistory, setConversationHistory] = useState<Message[]>([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [lastStudentAnswer, setLastStudentAnswer] = useState('')
  const [questionNum, setQuestionNum] = useState(0)
  const [voiceEval, setVoiceEval] = useState<VoiceEval | null>(null)
  const [micDenied, setMicDenied] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const [speechSupported, setSpeechSupported] = useState(true)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const isRecordingRef = useRef(false)
  const conversationHistoryRef = useRef<Message[]>([])
  const firstQuestionAskedRef = useRef(false)
  const normalizedLanguageRef = useRef<LangKey>('english')

  // Chat mode state
  interface ChatQuestion { id: number; question: string; category: string; difficulty: string; language?: string; hasLanguageError?: boolean; }
  const [chatQuestions, setChatQuestions] = useState<ChatQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [chatAnswers, setChatAnswers] = useState<ChatAnswer[]>([])
  const [userAnswer, setUserAnswer] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [voiceResultsTab, setVoiceResultsTab] = useState<VoiceResultsTab>('overview')
  const [voiceResultsExpandedQ, setVoiceResultsExpandedQ] = useState<number | null>(null)
  const [rateWarning, setRateWarning] = useState('')

  const TOTAL_QUESTIONS = 8

  // ── Language profiles ─────────────────────────────────────────────────────
  const languageProfiles = {
    english: {
      lang: 'en-IN' as const,
      rate: 0.82,
      pitch: 0.95,
      whisperLanguage: 'en',
      whisperPrompt: 'This is an Indian English speaker in a job interview.',
      voiceNames: ['ravi', 'heera', 'india', 'en-in'],
      fallbackLang: 'en-US',
      interviewerName: 'Arjun',
    },
    hindi: {
      lang: 'hi-IN' as const,
      rate: 0.80,
      pitch: 1.0,
      whisperLanguage: 'hi',
      whisperPrompt: 'यह एक हिंदी बोलने वाला उम्मीदवार है जो नौकरी के इंटरव्यू में है।',
      voiceNames: ['hindi', 'hi-in', 'lekha', 'divya', 'kalpana', 'google हिन्दी'],
      fallbackLang: 'hi-IN',
      interviewerName: 'Rajesh',
    },
    hinglish: {
      lang: 'hi-IN' as const,
      rate: 0.82,
      pitch: 0.97,
      whisperLanguage: 'hi',
      whisperPrompt: 'This speaker mixes Hindi and English naturally in a job interview. Hinglish context.',
      voiceNames: ['hindi', 'hi-in', 'ravi', 'india', 'google हिन्दी'],
      fallbackLang: 'en-IN',
      interviewerName: 'Vikram',
    },
  } as const

  type LangKey = keyof typeof languageProfiles

  // ── normalizeLanguage — robust variant mapping (STEP 2) ───────────────────
  const normalizeLanguage = (rawValue: string): LangKey => {
    if (!rawValue) return 'english';
    const val = rawValue.toLowerCase().trim();
    const hindiVariants = ['hindi', 'hi', 'hi-in', 'हिंदी', 'hindi language', 'in hindi'];
    const hinglishVariants = ['hinglish', 'hi-en', 'hindi+english', 'mixed', 'hinglish language'];
    // Check Hinglish before Hindi because "hinglish" contains "hi".
    if (hinglishVariants.some(v => val === v || val.includes(v))) return 'hinglish';
    if (hindiVariants.some(v => val === v || val.includes(v))) return 'hindi';
    return 'english';
  };

  const normalizedLanguage = normalizeLanguage(language);
  const activeProfile = languageProfiles[normalizedLanguage];
  const toLanguageLabel = (lang: string): 'English' | 'Hindi' | 'Hinglish' => {
    const normalized = normalizeLanguage(lang);
    if (normalized === 'hindi') return 'Hindi';
    if (normalized === 'hinglish') return 'Hinglish';
    return 'English';
  };

  useEffect(() => {
    const normalized = normalizeLanguage(language);
    normalizedLanguageRef.current = normalized;
    console.log('[Language] language changed to:', language);
    console.log('[Language] normalizedLanguageRef updated to:', normalized);
  }, [language]);

  console.log('[Language] Raw selected value:', language);
  console.log('[Language] Normalized to:', normalizedLanguage);

  // ── Ref-safe history updater (fixes stale closure bug) ───────────────────
  const addToHistory = (role: 'user' | 'assistant', content: string) => {
    const newEntry: Message = { role, content }
    const updated = [...conversationHistoryRef.current, newEntry]
    conversationHistoryRef.current = updated
    setConversationHistory(updated)
    return updated
  }

  // ── Fallback questions so interview never freezes (FIX 3) ────────────────
  const getFallbackQuestion = (
    questionIndex: number,
    lang: LangKey = 'english'
  ): string => {
    const fallbacks = {
      english: [
        'Please introduce your background and recent experience.',
        'What are your greatest strengths?',
        'Describe a challenging situation you faced and how you handled it.',
        'Where do you see yourself in 5 years?',
        'Why are you interested in this role?',
        'Tell me about a project you are most proud of.',
        'How do you handle pressure and tight deadlines?',
        'Do you have any questions for me?',
      ],
      hindi: [
        'अपने बारे में और अपनी पृष्ठभूमि के बारे में बताइए।',
        'आपकी सबसे बड़ी ताकत क्या है?',
        'एक ऐसी चुनौतीपूर्ण स्थिति बताइए जिसका आपने सामना किया।',
        'आप अगले 5 साल में खुद को कहाँ देखते हैं?',
        'आप इस भूमिका में रुचि क्यों रखते हैं?',
        'एक ऐसे प्रोजेक्ट के बारे में बताइए जिस पर आपको गर्व है।',
        'आप दबाव और कड़ी समय सीमा को कैसे संभालते हैं?',
        'क्या आपके मेरे लिए कोई सवाल हैं?',
      ],
      hinglish: [
        'Apne baare mein batao aur background kya hai?',
        'Tumhari sabse badi strength kya hai?',
        'Ek challenging situation batao jab tumne kuch difficult handle kiya ho.',
        'Agle 5 saal mein tum khud ko kahan dekhte ho?',
        'Is role mein interested kyun ho?',
        'Koi ek project batao jis par tumhe proud feel hota hai.',
        'Pressure aur tight deadlines kaise handle karte ho?',
        'Koi questions hain tumhare mere liye?',
      ],
    };

    const list = fallbacks[lang] || fallbacks.english;
    return list[Math.min(questionIndex, list.length - 1)];
  }

  // ── TTS with safety timeout — onend not firing fix (FIX 5) ───────────────
  const speakText = (text: string, profile?: typeof languageProfiles[LangKey], onDone?: () => void) => {
    if (!speechSupported) { onDone?.(); return }
    
    // Always fall back to ref if no profile passed
    const activeProfile = profile ||
      languageProfiles[normalizedLanguageRef.current] ||
      languageProfiles.english;
      
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const voices = window.speechSynthesis.getVoices()
    const matchedVoice =
      voices.find(v => v.lang === activeProfile.lang) ||
      voices.find(v => activeProfile.voiceNames.some((name: string) => v.name.toLowerCase().includes(name))) ||
      voices.find(v => v.lang === activeProfile.fallbackLang) ||
      voices.find(v => v.lang.startsWith('en'))
      
    if (matchedVoice) utterance.voice = matchedVoice
    utterance.lang = activeProfile.lang
    utterance.rate = activeProfile.rate
    utterance.pitch = activeProfile.pitch
    utterance.volume = 1.0

    console.log('[Speech] Speaking text in language:', activeProfile.lang, text.slice(0, 80))
    console.log('[Speech] Voice selected:', matchedVoice?.name || 'default')

    // Calculate safety timeout — avg ~150 wpm
    const wordCount = text.split(/\s+/).length
    const expectedDurationMs = Math.max(3000, (wordCount / 150) * 60 * 1000 * (1 / activeProfile.rate))
    const safetyMs = expectedDurationMs + 3000

    let speakingEnded = false
    const onSpeakEnd = () => {
      if (speakingEnded) return
      speakingEnded = true
      console.log('[Speech] onend fired')
      setPhase('idle')
      onDone?.()
    }

    utterance.onstart = () => {
      console.log('[Speech] onstart fired');
    }
    utterance.onend = onSpeakEnd
    utterance.onerror = onSpeakEnd
    // Safety fallback — if onend never fires, trigger manually
    setTimeout(onSpeakEnd, safetyMs)

    window.speechSynthesis.speak(utterance)
  }

  // ── Whisper transcription ─────────────────────────────────────────────────
  const sendToWhisper = async (
    audioBlob: Blob,
    lang: 'english' | 'hindi' | 'hinglish' = 'english'
  ): Promise<string> => {
    const profile = languageProfiles[lang] || languageProfiles.english;

    console.log('[Whisper] Sending to secure proxy — language:', profile.whisperLanguage);

    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('language', profile.whisperLanguage);
    formData.append('prompt', profile.whisperPrompt);

    try {
      // SECURITY: Now calls /api/transcribe (our server)
      // instead of api.groq.com directly (which exposed the key)
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
        // No Authorization header needed here — server handles it
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error('[Whisper] Proxy error:', res.status, data.error);
        return '';
      }

      const data = await res.json();

      if (data.empty) {
        console.warn('[Whisper] Empty transcription — nothing was heard');
        return '';
      }

      console.log('[Whisper] Transcription received:', data.text?.slice(0, 100));
      return data.text || '';
    } catch (error: any) {
      console.error('[Whisper] Fetch failed:', error.message);
      return '';
    }
  };

  // ── Get next question from API — never throws (FIX 3) ────────────────────
  const getNextQuestion = async (fullHistory: Message[]): Promise<string> => {
    // CRITICAL: Always read from ref, never from state variable
    const currentLanguage = normalizedLanguageRef.current;
    console.log('[API] Calling /api/interview — history length:', fullHistory.length)
    console.log('[API] Sending language to interview API:', currentLanguage);
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'voice_turn',
          interviewType,
          language: currentLanguage, // MUST be 'english', 'hindi', or 'hinglish'
          messages: fullHistory,
        }),
      })

      console.log('[API] Response status:', res.status)
      console.log('[API] Response content-type:', res.headers.get('content-type'))

      // Check if response is OK before parsing JSON
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        if (res.status === 429 || errJson?.error === 'rate_limit_exceeded') {
          setVoiceError(buildRateLimitMessage(errJson))
        }
        return getFallbackQuestion(fullHistory.filter(m => m.role === 'assistant').length, currentLanguage)
      }
      const warning = res.headers.get('X-RateLimit-Warning')
      if (warning) setRateWarning(warning)

      // Check content-type before parsing as JSON
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const rawText = await res.text()
        console.error('[API] Non-JSON response:', rawText.slice(0, 200))
        return getFallbackQuestion(fullHistory.filter(m => m.role === 'assistant').length, currentLanguage)
      }

      const data = await res.json()

      const question = data.text || data.question || data.response || data.content || ''
      if (!question || question.trim() === '') {
        console.warn('[API] Empty question in response body')
        return getFallbackQuestion(fullHistory.filter(m => m.role === 'assistant').length, currentLanguage)
      }

      console.log('[API] Response received:', question.slice(0, 100))
      return question

    } catch (error: any) {
      // NEVER let this crash the voice flow
      console.error('[API] getNextQuestion failed:', error.message)
      return getFallbackQuestion(fullHistory.filter(m => m.role === 'assistant').length, currentLanguage)
    }
  }

  const pickRecorderMimeType = (): string | undefined => {
    if (typeof MediaRecorder === 'undefined') return undefined
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ]
    for (const t of candidates) {
      try {
        if (MediaRecorder.isTypeSupported(t)) return t
      } catch {
        /* ignore */
      }
    }
    return undefined
  }

  // ── Recording — reliable onstop pattern ──────────────────────────────────
  const startRecording = async () => {
    setVoiceError('')
    setMicDenied(false)
    if (isRecordingRef.current) {
      console.warn('[Mic] Start ignored — already recording')
      return
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setVoiceError('Microphone is not available in this browser or context.')
      setMicDenied(true)
      setPhase('idle')
      return
    }

    setPhase('preparing-mic')
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null

      const MIC_TIMEOUT_MS = 20000
      const stream = await Promise.race([
        navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Microphone permission timed out. Check browser settings and try again.')), MIC_TIMEOUT_MS)
        ),
      ])

      streamRef.current = stream
      const mimeType = pickRecorderMimeType()
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)

      audioChunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        handleRecordingComplete()
      }
      recorder.start(100)
      mediaRecorderRef.current = recorder
      isRecordingRef.current = true
      setPhase('listening')
    } catch (err: unknown) {
      console.error('[Mic] startRecording failed:', err)
      const msg = err instanceof Error ? err.message : 'Could not access microphone.'
      setVoiceError(msg)
      setMicDenied(true)
      isRecordingRef.current = false
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      mediaRecorderRef.current = null
      setPhase('idle')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive' && isRecordingRef.current) {
      isRecordingRef.current = false
      mediaRecorderRef.current.stop()
      streamRef.current?.getTracks().forEach(t => t.stop())
      setPhase('processing')
    }
  }

  const handleRecordingComplete = async () => {
    try {
      console.log('[Interview] Recording complete — starting transcription')
      setPhase('processing')
      const blobType = mediaRecorderRef.current?.mimeType || 'audio/webm'
      const audioBlob = new Blob(audioChunksRef.current, { type: blobType })
      
      const currentLang = normalizedLanguageRef.current;
      console.log('[Recording] Complete — language:', currentLang);
      
      const spokenText = await sendToWhisper(audioBlob, currentLang)
      console.log('[Interview] Transcription result:', spokenText?.slice(0, 100))

      if (!spokenText || spokenText.trim() === '') {
        setPhase('ai-speaking')
        speakText("I didn't catch that. Please try again.", languageProfiles[currentLang], () => {
          setTimeout(() => startRecording(), 1000)
        })
        return
      }

      setLastStudentAnswer(spokenText)
      // Use addToHistory so ref is always in sync before we call the API
      const afterUserHistory = addToHistory('user', spokenText)

      setPhase('thinking')
      console.log('[Interview] Sending to API — history length:', afterUserHistory.length)

      // SAFETY TIMEOUT — if thinking lasts more than 15 seconds, use fallback (FIX 4)
      let thinkingResolved = false
      const thinkingTimeout = setTimeout(() => {
        if (thinkingResolved) return
        thinkingResolved = true
        console.warn('[Interview] Thinking timeout — using fallback question')
        const fallback = getFallbackQuestion(afterUserHistory.filter(m => m.role === 'assistant').length, currentLang)
        const afterFallbackHistory = addToHistory('assistant', fallback)
        setCurrentQuestion(fallback)
        setQuestionNum(q => q + 1)
        setPhase('ai-speaking')
        speakText(fallback, languageProfiles[currentLang], () => { startRecording() })
      }, 15000)

      const nextQuestion = await getNextQuestion(afterUserHistory)

      // Cancel the timeout — we got a real response in time
      if (thinkingResolved) return // timeout already handled it
      thinkingResolved = true
      clearTimeout(thinkingTimeout)

      if (!nextQuestion) {
        setPhase('idle')
        return
      }

      console.log('[Interview] API response received:', nextQuestion.slice(0, 100))

      setCurrentQuestion(nextQuestion)
      setQuestionNum(q => q + 1)
      const afterAssistantHistory = addToHistory('assistant', nextQuestion)

      const userTurns = afterAssistantHistory.filter(m => m.role === 'user').length
      if (userTurns > TOTAL_QUESTIONS) {
        setPhase('ai-speaking')
        console.log('[Interview] Starting speech synthesis (final evaluation)')
        speakText(nextQuestion, languageProfiles[currentLang], async () => {
          try {
            console.log('[API] Sending voice_evaluate with language:', currentLang);
            const evalRes = await fetch('/api/interview', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'voice_evaluate',
                interviewType,
                language: currentLang, // language MUST be included — was missing before
                messages: afterAssistantHistory,
              }),
            })
            const evalData = await evalRes.json()
            setVoiceEval(evalData)
          } catch {}
          setStep('voice-results')
        })
      } else {
        setPhase('ai-speaking')
        console.log('[Speech] Using language profile:', currentLang);
        speakText(nextQuestion, languageProfiles[currentLang], () => { startRecording() })
      }
    } catch (error: any) {
      console.error('[Interview] handleRecordingComplete error:', error?.message)
      setPhase('idle')
    }
  }

  // ── VOICE: start interview ────────────────────────────────────────────────
  const startVoiceInterview = async () => {
    if (firstQuestionAskedRef.current) return // prevent re-triggering
    firstQuestionAskedRef.current = true
    
    // Set language ref immediately when interview starts
    const lang = normalizeLanguage(language);
    normalizedLanguageRef.current = lang;
    console.log('[Interview Start] Language set to:', lang);
    console.log('[Interview Start] language state raw value:', language);
    
    setLoading(true)
    setError('')
    setMicDenied(false)
    setVoiceError('')
    conversationHistoryRef.current = [] // reset ref for fresh interview
    try {
      const opening = await getNextQuestion([]) // empty history = first question
      const q = opening || 'Please introduce your background and recent work.'
      addToHistory('assistant', q)
      setCurrentQuestion(q)
      setQuestionNum(1)
      setLastStudentAnswer('')
      setStep('voice-interview')
      setPhase('ai-speaking')
      speakText(q, languageProfiles[lang], () => { startRecording() })
    } catch { setError('Connection issue. Please try again.') }
    finally { setLoading(false) }
  }

  // All interview types — filtered by role below
  const allInterviewTypes = [
    { group: 'School & College', options: [
      { value: 'school_general', label: '🏫 School Interview (Class 9–12)' },
      { value: 'school_science', label: '🔬 Science Stream Interview' },
      { value: 'school_commerce', label: '💼 Commerce Stream Interview' },
      { value: 'college_admission', label: '🎓 College Admission Interview' },
      { value: 'iit_interview', label: '⚛️ IIT/NIT Counselling' },
      { value: 'medical_college', label: '🏥 Medical College Interview' },
    ]},
    { group: 'Job Interviews', options: [
      { value: 'software_engineer', label: '💻 Software Engineer' },
      { value: 'marketing', label: '📣 Marketing' },
      { value: 'sales', label: '🤝 Sales' },
      { value: 'operations', label: '⚙️ Operations' },
      { value: 'finance', label: '💰 Finance/Banking' },
      { value: 'hr', label: '👥 HR / People Ops' },
    ]},
    { group: 'Startup & Business', options: [
      { value: 'startup_founder', label: '🚀 Startup Founder Pitch' },
      { value: 'investor_pitch', label: '💡 Investor Q&A Practice' },
    ]},
    { group: 'Government / Competitive', options: [
      { value: 'upsc_interview', label: '🏛️ UPSC Personality Test' },
      { value: 'ssc_interview', label: '📋 SSC / Government Job' },
      { value: 'bank_interview', label: '🏦 Bank PO Interview' },
    ]},
  ]

  // Role-filtered interview types
  const interviewTypes = role === 'founder'
    ? allInterviewTypes.filter(g => g.group === 'Startup & Business')
    : allInterviewTypes.filter(g => g.group !== 'Startup & Business')

  const typeLabel = interviewTypes.flatMap(g => g.options).find(o => o.value === interviewType)?.label || 'Interview'

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSpeechSupported('speechSynthesis' in window)
    }
  }, [])

  // Load voices early — they sometimes load late in browsers
  useEffect(() => {
    const loadVoices = () => window.speechSynthesis.getVoices()
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])

  useEffect(() => {
    if (step === 'voice-results') {
      setVoiceResultsTab('overview')
      setVoiceResultsExpandedQ(null)
    }
  }, [step])









  // ── CHAT: start / submit / next ───────────────────────────────────────────
  const parseInterviewQuestions = (rawResponse: string, expectedLanguage: string): ParsedQuestion[] => {
    try {
      let cleaned = rawResponse
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        cleaned = arrayMatch[0];
      }

      const questions = JSON.parse(cleaned);
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid questions format');
      }

      const validatedQuestions = questions.map((q: any, index: number) => {
        const isCorrectLanguage = validateLanguage(q.question || '', expectedLanguage);
        if (!isCorrectLanguage) {
          console.warn(
            `Language mismatch in question ${index + 1}:`,
            String(q.question || '').substring(0, 50)
          );
        }
        return {
          ...q,
          id: index + 1,
          hasLanguageError: !isCorrectLanguage,
        } as ParsedQuestion;
      });

      const seen = new Set<string>();
      const uniqueQuestions = validatedQuestions.filter((q) => {
        const key = String(q.question || '').toLowerCase().trim().substring(0, 60);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const errorCount = uniqueQuestions.filter((q) => q.hasLanguageError).length;
      if (errorCount > 0) {
        console.error(`Language mismatch count: ${errorCount} / ${uniqueQuestions.length} for ${expectedLanguage}`);
      } else {
        console.log(`All ${uniqueQuestions.length} questions are in ${expectedLanguage}`);
      }

      return uniqueQuestions;
    } catch (error) {
      console.error('Parse error:', error, '\nRaw response:', rawResponse?.substring(0, 200));
      return [];
    }
  };

  const startChatInterview = async () => {
    setLoading(true)
    setError('')
    setCurrentIndex(0)
    setAnswers({})
    setIsComplete(false)
    try {
      const validationError = validateInput(`${interviewType} ${schoolClass}`.trim(), 'interview')
      if (validationError) throw new Error(validationError)
      const langToSend = normalizeLanguage(language);
      console.log('[API] generate_questions — language:', langToSend);
      const res = await fetch('/api/interview/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobRole: interviewType || schoolClass || 'General Role',
          interviewType,
          experienceLevel: schoolClass || 'Mid-level',
          language: langToSend,
          numberOfQuestions: TOTAL_QUESTIONS,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 429 || data?.error === 'rate_limit_exceeded') throw new Error(buildRateLimitMessage(data))
        throw new Error(data?.error || 'Failed to start interview.')
      }

      const expectedLanguage = toLanguageLabel(langToSend);
      const parsed = Array.isArray(data.questions) ? data.questions : [];
      const normalized = parsed.map((q: any, index: number) => ({
        ...q,
        id: index + 1,
        hasLanguageError: !validateLanguage(q.question || '', expectedLanguage),
      }));
      const finalQuestions = normalized.filter((q: ParsedQuestion) => !q.hasLanguageError);
      const safeQuestions = finalQuestions.length > 0 ? finalQuestions : normalized;
      if (safeQuestions.length === 0) {
        throw new Error('No valid interview questions generated');
      }
      setChatQuestions(safeQuestions)
      const warning = res.headers.get('X-RateLimit-Warning')
      if (warning) setRateWarning(warning)
      setStep('chat-interview')
    } catch (e: any) { setError(e?.message || 'Failed to start interview.') }
    finally { setLoading(false) }
  }

  const startInterview = () => mode === 'voice' ? startVoiceInterview() : startChatInterview()

  const currentChatQuestion = chatQuestions?.[currentIndex] ?? null;
  const isLastQuestion = currentIndex === chatQuestions.length - 1;
  const progress = chatQuestions.length > 0
    ? Math.round(((currentIndex + 1) / chatQuestions.length) * 100)
    : 0;

  const submitChatAnswer = async () => {
    if (!userAnswer.trim() || !currentChatQuestion) return
    const inputError = validateInput(userAnswer, 'interview')
    if (inputError) {
      setError(inputError)
      return
    }
    setLoading(true)
    try {
      const langToSend = normalizeLanguage(language);
      console.log('[API] evaluate_answer — language:', langToSend);
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'evaluate_answer', question: currentChatQuestion.question, answer: userAnswer, language: langToSend }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 429 || data?.error === 'rate_limit_exceeded') throw new Error(buildRateLimitMessage(data))
        throw new Error(data?.error || 'Failed to evaluate answer.')
      }
      setChatAnswers(prev => [...prev, { question: currentChatQuestion.question, answer: userAnswer, score: data.score || 0, feedback: data.feedback || '', improvement: data.improvement || '' }])
      const warning = res.headers.get('X-RateLimit-Warning')
      if (warning) setRateWarning(warning)
      setShowFeedback(true)
    } catch (e: any) { setError(e?.message || 'Failed to evaluate answer.') }
    finally { setLoading(false) }
  }

  const handleNextQuestion = () => {
    setShowFeedback(false);
    handleNext(userAnswer);
    setUserAnswer('');
  };

  const handleNext = (userAnswerValue: string) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: userAnswerValue }));
    if (isLastQuestion) {
      setIsComplete(true);
      router.push('/mock-interview/results');
      return;
    }
    setCurrentIndex(prev => prev + 1);
  };

  const handlePreviousQuestion = () => {
    if (currentIndex <= 0) return;
    setCurrentIndex((prev) => prev - 1);
  };

  const resetAll = () => {
    setStep('setup'); setConversationHistory([]); setCurrentQuestion(''); setQuestionNum(0)
    setPhase('idle'); setLastStudentAnswer(''); setVoiceEval(null)
    setMicDenied(false); setVoiceError('')
    setChatQuestions([]); setCurrentIndex(0); setAnswers({}); setIsComplete(false)
    setChatAnswers([]); setUserAnswer(''); setShowFeedback(false); setError('')
    isRecordingRef.current = false
    conversationHistoryRef.current = []
    firstQuestionAskedRef.current = false
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    } catch {
      /* ignore */
    }
    mediaRecorderRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    window.speechSynthesis?.cancel()
  }

  const avgChatScore = chatAnswers.length > 0 ? (chatAnswers.reduce((s, a) => s + a.score, 0) / chatAnswers.length).toFixed(1) : 0
  const progressPercent = progress;

  const ScoreBar = ({ label, value }: { label: string; value: number }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: '#C4B5FD' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#A78BFA' }}>{value}/10</span>
      </div>
      <div style={{ background: '#2D1B69', borderRadius: 6, height: 6 }}>
        <div style={{ background: 'linear-gradient(90deg,#7C3AED,#4F46E5)', height: 6, borderRadius: 6, width: `${value * 10}%`, transition: 'width 1s ease', boxShadow: '0 0 8px #7C3AED80' }} />
      </div>
    </div>
  )

  const C = { bg: '#080412', card: '#160D2E', border: '#2D1B69', accent: '#7C3AED', accentL: '#A78BFA', text: '#F5F3FF', muted: '#C4B5FD', hint: '#9CA3AF' }

  // ═══════════════════════════════════════════════════════════════════════════
  // SETUP SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 'setup') return (
    <div style={{ maxWidth: 640, margin: '0 auto', color: C.text }}>
      <style>{`
        @keyframes pulse-ring { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.08);opacity:1} }
        @keyframes wave { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(2)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .mode-card { padding:16px; border-radius:12px; cursor:pointer; transition:all .2s ease; border:2px solid #2D1B69; }
        .mode-card.active { border-color:#7C3AED; background:rgba(124,58,237,.12); box-shadow:0 0 20px #7C3AED25; }
        .mode-card:hover { border-color:#7C3AED80; }
      `}</style>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 6 }}>Practice interviews until you&apos;re unbeatable</h1>
        <p style={{ fontSize: 15, color: C.muted }}>AI-powered mock interviews — available 24/7, brutally honest feedback</p>
      </div>

      <div style={{ background: 'linear-gradient(135deg,#160D2E,#1E1040)', border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, boxShadow: '0 0 40px #7C3AED18' }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 20 }}>Setup Your Interview</h2>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: C.muted, marginBottom: 6 }}>Interview Type</label>
          <select className="interview-config-card form-select" value={interviewType} onChange={e => setInterviewType(e.target.value)}
            style={{ width: '100%', background: '#0F0A1E', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: C.text, fontSize: 14 }}>
            <option value="">Select type...</option>
            {interviewTypes.map(g => <optgroup key={g.group} label={g.group}>{g.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</optgroup>)}
          </select>
        </div>

        {interviewType.startsWith('school_') && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: C.muted, marginBottom: 6 }}>Your Class</label>
            <select value={schoolClass} onChange={e => setSchoolClass(e.target.value)}
              style={{ width: '100%', background: '#0F0A1E', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: C.text, fontSize: 14 }}>
              <option value="">Select your class...</option>
              {['Class 9','Class 10','Class 11','Class 12'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: C.muted, marginBottom: 6 }}>Language</label>
          <select value={language} onChange={e => setLanguage(e.target.value)}
            style={{ width: '100%', background: '#0F0A1E', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: C.text, fontSize: 14 }}>
            <option value="english">English</option>
            <option value="hindi">हिंदी (Hindi)</option>
            <option value="hinglish">Hinglish</option>
          </select>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: C.muted, marginBottom: 10 }}>Mode</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {([['voice','🎙️','Voice Mode','Answer by speaking'],['chat','💬','Chat Mode','Answer by typing']] as const).map(([m, icon, title, sub]) => (
              <div key={m} className={`mode-card${mode === m ? ' active' : ''}`} onClick={() => setMode(m as InterviewMode)}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: mode === m ? C.accentL : C.text, marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 12, color: C.hint }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {!speechSupported && mode === 'voice' && (
          <div style={{ background: '#451A03', border: '1px solid #92400E', borderRadius: 10, padding: '10px 14px', color: '#FB923C', fontSize: 13, marginBottom: 16 }}>
            ⚠️ Your browser doesn&apos;t support voice playback. Questions will appear as text only.
          </div>
        )}
        {error && <div style={{ background: '#450A0A', border: '1px solid #7F1D1D', borderRadius: 10, padding: '10px 14px', color: '#F87171', fontSize: 13, marginBottom: 16 }}>{error}</div>}
        {rateWarning && <div style={{ background: '#451A03', border: '1px solid #92400E', borderRadius: 10, padding: '10px 14px', color: '#FBBF24', fontSize: 13, marginBottom: 16 }}>{rateWarning}</div>}

        <button onClick={startInterview} disabled={!interviewType || loading}
          style={{ width: '100%', background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 0', fontSize: 16, fontWeight: 600, cursor: !interviewType || loading ? 'not-allowed' : 'pointer', opacity: !interviewType ? 0.5 : 1, boxShadow: '0 8px 32px #7C3AED40' }}>
          {loading ? '⏳ Starting...' : '✨ Start Interview'}
        </button>
      </div>
    </div>
  )

  if (step === 'voice-interview') {
    const phaseLabel = {
      idle: 'Tap the button to start answering',
      'ai-speaking': 'Learnova is speaking...',
      listening: 'Listening… tap to stop',
      processing: 'Understanding your answer...',
      thinking: 'Thinking of next question...',
      'preparing-mic': 'Connecting to microphone…',
    }[phase]

    const orbClass =
      phase === 'ai-speaking' ? 'orb-speaking' :
      phase === 'listening' ? 'orb-listening' :
      (phase === 'processing' || phase === 'thinking' || phase === 'preparing-mic') ? 'orb-thinking' :
      'orb-idle'

    const isDisabled =
      phase === 'processing' ||
      phase === 'thinking' ||
      phase === 'ai-speaking' ||
      phase === 'preparing-mic'
    const isListening = phase === 'listening'

    return (
      <div className="voice-interview-screen" style={{
        position: 'fixed', inset: 0,
        background: C.bg,
        color: C.text,
        fontFamily: 'inherit',
        zIndex: 10,
      }}>
        <style>{`
          /* Orb — responsive */
          .orb { border-radius:50%;position:absolute;top:0;left:0;width:100%;height:100%; }
          .orb-container { width:90px;height:90px;position:relative;margin:0 auto 20px;flex-shrink:0; }
          @media(min-width:640px){ .orb-container{width:110px;height:110px;} }
          @media(min-width:1024px){ .orb-container{width:130px;height:130px;} }
          /* Orb states */
          .orb-idle { background:radial-gradient(circle at 40% 35%,#a78bfa,#6d28d9);box-shadow:0 0 30px rgba(139,92,246,0.4); }
          .orb-speaking { background:radial-gradient(circle at 40% 35%,#c4b5fd,#7c3aed);animation:gemini-pulse 1.2s ease-in-out infinite;box-shadow:0 0 60px rgba(167,139,250,0.7); }
          .orb-listening { background:radial-gradient(circle at 40% 35%,#6ee7b7,#059669);animation:listening-ripple 0.8s ease-in-out infinite;box-shadow:0 0 50px rgba(52,211,153,0.6); }
          .orb-thinking { background:conic-gradient(#6d28d9,#a78bfa,#c4b5fd,#6d28d9);animation:orb-spin 1.5s linear infinite;box-shadow:0 0 40px rgba(139,92,246,0.5); }
          @keyframes gemini-pulse { 0%,100%{transform:scale(1);box-shadow:0 0 40px rgba(167,139,250,0.5)} 50%{transform:scale(1.12);box-shadow:0 0 80px rgba(167,139,250,0.9)} }
          @keyframes listening-ripple { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
          @keyframes orb-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          /* Voice button — responsive */
          .voice-btn { border:none;cursor:pointer;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all 0.3s ease;width:64px;height:64px; }
          @media(min-width:640px){ .voice-btn{width:72px;height:72px;} }
          @media(min-width:1024px){ .voice-btn{width:80px;height:80px;} }
          .voice-btn:hover:not(:disabled) { transform:scale(1.08); }
          /* Layout */
          .voice-interview-screen { display:flex;flex-direction:column;align-items:center;justify-content:space-between;min-height:100vh;min-height:100dvh;padding:0;box-sizing:border-box;overflow:hidden; }
          .interview-top-bar { display:flex;justify-content:space-between;align-items:center;width:100%;flex-wrap:wrap;gap:8px;padding:14px 16px;flex-shrink:0;box-sizing:border-box; }
          @media(min-width:640px){ .interview-top-bar{padding:18px 28px;} }
          /* Phase label */
          .phase-label { font-size:0.8rem;font-weight:500;text-align:center;min-height:22px;margin-bottom:28px; }
          @media(min-width:640px){ .phase-label{font-size:0.9rem;margin-bottom:36px;} }
          /* Question text */
          .question-text { font-size:1rem;font-weight:500;text-align:center;max-width:90vw;margin:0 auto 10px;line-height:1.7;min-height:60px; }
          @media(min-width:640px){ .question-text{font-size:1.15rem;max-width:600px;} }
          @media(min-width:1024px){ .question-text{font-size:1.25rem;max-width:680px;} }
          /* Student answer */
          .student-answer { display:none; }
          @media(min-width:480px){ .student-answer{display:block;font-size:0.8rem;text-align:center;max-width:85vw;margin:0 auto;opacity:0.45;font-style:italic;} }
          @media(min-width:768px){ .student-answer{font-size:0.875rem;max-width:500px;} }
        `}</style>

        {/* Top bar */}
        <div className="interview-top-bar">
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <span style={{ background:'rgba(124,58,237,0.2)', border:'1px solid #7C3AED60', borderRadius:20, padding:'4px 10px', fontSize:11, color:C.accentL, fontWeight:600 }}>
              {typeLabel}
            </span>
            <span style={{ background:'rgba(52,211,153,0.1)', border:'1px solid #05966960', borderRadius:20, padding:'4px 10px', fontSize:11, color:'#34D399', fontWeight:600 }}>
              {language.charAt(0).toUpperCase() + language.slice(1)}
            </span>
          </div>
          <button
            onClick={() => { window.speechSynthesis?.cancel(); resetAll() }}
            style={{ background:'transparent', border:'none', color:C.hint, fontSize:13, cursor:'pointer', padding:'6px 0' }}
          >
            End Interview
          </button>
        </div>

        {/* Mic denied */}
        {micDenied && (
          <div style={{ textAlign:'center', padding:'0 16px', flexShrink:0, width:'100%', boxSizing:'border-box' }}>
            <div style={{ background:'#450A0A', border:'1px solid #7F1D1D', borderRadius:12, padding:'10px 16px', color:'#F87171', fontSize:13 }}>
              Please allow microphone access to use voice mode.
            </div>
          </div>
        )}

        {/* Center — orb + phase label + question */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 16px', width:'100%', boxSizing:'border-box', overflow:'hidden' }}>
          <div className="orb-container">
            <div className={`orb ${orbClass}`} />
          </div>

          <div className="phase-label" style={{ color: phase === 'listening' ? '#34D399' : C.muted }}>
            {phaseLabel}
          </div>

          <p className="question-text" style={{ color:C.text }}>
            {currentQuestion}
          </p>

          {lastStudentAnswer && (
            <p className="student-answer" style={{ color:C.text }}>
              You: {lastStudentAnswer}
            </p>
          )}
        </div>

        {/* Bottom — voice button (keep above flex content for reliable clicks) */}
        <div
          style={{
            display:'flex',
            flexDirection:'column',
            alignItems:'center',
            paddingBottom:'clamp(28px,5vh,48px)',
            flexShrink:0,
            position:'relative',
            zIndex:20,
          }}
        >
          {voiceError && (
            <p style={{ color:'#F87171', fontSize:12, textAlign:'center', maxWidth:320, marginBottom:10, lineHeight:1.4 }}>
              {voiceError}
            </p>
          )}
          <button
            type="button"
            className="voice-btn"
            onClick={isListening ? stopRecording : startRecording}
            disabled={isDisabled}
            style={{
              background: isListening
                ? 'radial-gradient(circle,#ef4444,#b91c1c)'
                : isDisabled ? '#1f1635'
                : 'radial-gradient(circle,#7c3aed,#4c1d95)',
              boxShadow: isListening
                ? '0 0 30px rgba(239,68,68,0.6)'
                : isDisabled ? 'none'
                : '0 0 20px rgba(124,58,237,0.5)',
              fontSize:26,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              transform: isListening ? 'scale(1.1)' : 'scale(1)',
              opacity: isDisabled ? 0.5 : 1,
            }}
          >
            {isListening ? '⏹' : isDisabled ? '⏳' : '🎤'}
          </button>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VOICE RESULTS — Deep 4-tab evaluation
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 'voice-results') {
    const ev = voiceEval
    const score = ev?.overall_score ?? ev?.overallScore ?? 0
    const hiringDecision = ev?.hiring_decision || 'Maybe'
    const hiringColors: Record<string, string> = {
      'Strong Yes': '#10b981', 'Yes': '#34d399', 'Maybe': '#f59e0b', 'No': '#ef4444', 'Strong No': '#b91c1c',
    }
    const hiringColor = hiringColors[hiringDecision] || '#f59e0b'
    const readyColors: Record<string, string> = {
      'Yes — ready now': '#10b981',
      'Almost — 2-4 weeks more practice': '#f59e0b',
      'Not Yet — needs 1-2 months': '#ef4444',
      'Far from ready': '#b91c1c',
    }
    const readyStatus = ev?.interview_ready || 'Almost — 2-4 weeks more practice'
    const readyColor = readyColors[readyStatus] || '#f59e0b'
    const dimScores = ev?.dimension_scores || {}
    const qReviews = ev?.question_by_question_review || []
    const weaknesses = ev?.critical_weaknesses || []
    const strengths = ev?.genuine_strengths || []
    const redFlags = ev?.red_flags || []
    const greenFlags = ev?.green_flags || []
    const plan30 = ev?.['30_day_improvement_plan'] || []
    const resources = ev?.resources_to_study || []

    const RCARD: CSSProperties = {
      background: 'linear-gradient(135deg,#160D2E,#1E1040)',
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: '20px 22px',
      marginBottom: 12,
    }

    return (
      <div style={{ maxWidth: 860, margin: '0 auto', color: C.text, paddingBottom: 48 }}>
        <style>{`
          .iq-tab { padding:8px 18px;border-radius:20px;border:1px solid;cursor:pointer;white-space:nowrap;font-size:0.88rem;transition:all .2s; }
          .iq-tab.active { border-color:#7C3AED;background:rgba(124,58,237,0.2);color:#A78BFA;font-weight:600; }
          .iq-tab:not(.active) { border-color:rgba(255,255,255,0.15);background:transparent;color:inherit; }
          .iq-tab:hover:not(.active) { border-color:#7C3AED80; }
          .dim-bar-bg { height:4px;border-radius:4px;background:rgba(255,255,255,0.1);margin-bottom:10px;overflow:hidden; }
        `}</style>

        {/* HERO */}
        <div style={{ ...RCARD, textAlign: 'center', padding: '32px 24px' }}>
          <div style={{ fontSize: '3.5rem', fontWeight: 700, background: 'linear-gradient(135deg,#A78BFA,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {score}/10
          </div>
          <div style={{ display: 'inline-block', padding: '6px 20px', borderRadius: 24, background: hiringColor + '22', border: `1px solid ${hiringColor}`, color: hiringColor, fontWeight: 600, fontSize: '1rem', margin: '12px 0' }}>
            {hiringDecision}
          </div>
          <p style={{ opacity: 0.7, maxWidth: 600, margin: '8px auto 0', lineHeight: 1.6, fontSize: 14 }}>{ev?.hiring_reason}</p>
        </div>

        {/* EXECUTIVE SUMMARY */}
        {ev?.executive_summary && (
          <div style={RCARD}>
            <h3 style={{ marginBottom: 10, fontSize: 15 }}>📋 Executive Summary</h3>
            <p style={{ lineHeight: 1.7, opacity: 0.9, fontSize: 14 }}>{ev.executive_summary}</p>
          </div>
        )}

        {/* TABS */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 0', marginBottom: 16 }}>
          {(['overview','questions','weaknesses','plan'] as const).map(tab => (
            <button key={tab} className={`iq-tab${voiceResultsTab===tab?' active':''}`} onClick={() => setVoiceResultsTab(tab)}>
              {tab==='overview'?'📊 Overview':tab==='questions'?'🔍 Q&A Review':tab==='weaknesses'?'⚠️ Weaknesses':'📅 30-Day Plan'}
            </button>
          ))}
        </div>

        {/* TAB: OVERVIEW */}
        {voiceResultsTab === 'overview' && (
          <>
            {/* 6 Dimension Cards */}
            {Object.keys(dimScores).length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 12, marginBottom: 16 }}>
                {Object.entries(dimScores).map(([key, dim]) => {
                  const dc = dim.score >= 7 ? '#10b981' : dim.score >= 5 ? '#f59e0b' : '#ef4444'
                  return (
                    <div key={key} style={{ ...RCARD, padding: 16, marginBottom: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <h4 style={{ margin: 0, fontSize: '0.82rem', opacity: 0.7, textTransform: 'capitalize' }}>{key.replace(/_/g,' ')}</h4>
                        <span style={{ fontWeight: 700, color: dc }}>{dim.score}/10</span>
                      </div>
                      <div className="dim-bar-bg"><div style={{ height: '100%', borderRadius: 4, width: `${dim.score*10}%`, background: dc, transition: 'width .6s ease' }} /></div>
                      <div style={{ display: 'inline-block', fontSize: '0.72rem', padding: '2px 8px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', marginBottom: 6 }}>{dim.verdict}</div>
                      <p style={{ fontSize: '0.82rem', opacity: 0.75, margin: '4px 0', lineHeight: 1.5 }}>{dim.detailed_feedback}</p>
                      <div style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 8, padding: '7px 10px', fontSize: '0.78rem', marginTop: 6 }}>💡 {dim.improvement}</div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Red + Green Flags */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div style={RCARD}>
                <h3 style={{ color: '#ef4444', marginBottom: 10, fontSize: 14 }}>🚩 Red Flags</h3>
                {redFlags.length === 0 ? <p style={{ opacity: 0.5, fontSize: 13 }}>None detected</p>
                  : redFlags.map((f,i) => <div key={i} style={{ padding: '7px 10px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 6, fontSize: '0.82rem' }}>❌ {f}</div>)}
              </div>
              <div style={RCARD}>
                <h3 style={{ color: '#10b981', marginBottom: 10, fontSize: 14 }}>✅ Green Flags</h3>
                {greenFlags.length === 0 ? <p style={{ opacity: 0.5, fontSize: 13 }}>None observed</p>
                  : greenFlags.map((f,i) => <div key={i} style={{ padding: '7px 10px', borderRadius: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: 6, fontSize: '0.82rem' }}>✅ {f}</div>)}
              </div>
            </div>

            {/* Readiness */}
            <div style={{ ...RCARD, textAlign: 'center', padding: '20px' }}>
              <h3 style={{ marginBottom: 10, fontSize: 14 }}>🎯 Interview Readiness</h3>
              <div style={{ display: 'inline-block', padding: '10px 24px', borderRadius: 24, background: readyColor + '22', border: `1px solid ${readyColor}`, color: readyColor, fontWeight: 600, fontSize: '0.95rem' }}>{readyStatus}</div>
            </div>

            {/* Senior Judge */}
            {ev?.senior_judge_message && (
              <div style={{ ...RCARD, background: 'rgba(124,58,237,0.08)', borderColor: 'rgba(124,58,237,0.3)' }}>
                <h3 style={{ marginBottom: 10, fontSize: 14 }}>👨‍⚖️ Senior Judge's Message</h3>
                <p style={{ lineHeight: 1.8, fontStyle: 'italic', opacity: 0.9, fontSize: 14 }}>"{ev.senior_judge_message}"</p>
              </div>
            )}
          </>
        )}

        {/* TAB: Q&A REVIEW */}
        {voiceResultsTab === 'questions' && (
          <div>
            {qReviews.length === 0
              ? <div style={{ ...RCARD, textAlign: 'center', opacity: 0.5 }}>No question-by-question data available.</div>
              : qReviews.map((q, i) => {
                const qc = q.answer_quality === 'Excellent' ? '#10b981' : q.answer_quality === 'Good' ? '#34d399' : q.answer_quality === 'Average' ? '#f59e0b' : '#ef4444'
                return (
                  <div key={i} style={RCARD}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setVoiceResultsExpandedQ(voiceResultsExpandedQ===i?null:i)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                        <span style={{ opacity: 0.5, fontSize: '0.82rem', flexShrink: 0 }}>Q{q.question_number}</span>
                        <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 12, background: qc + '20', color: qc, flexShrink: 0 }}>{q.answer_quality}</span>
                        <p style={{ margin: 0, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: voiceResultsExpandedQ===i?'normal':'nowrap' }}>{q.question_asked}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 8 }}>
                        <strong style={{ color: qc }}>{q.score}/10</strong>
                        <span style={{ opacity: 0.5 }}>{voiceResultsExpandedQ===i?'▲':'▼'}</span>
                      </div>
                    </div>
                    {voiceResultsExpandedQ === i && (
                      <div style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                        <div style={{ marginBottom: 10 }}>
                          <strong style={{ fontSize: '0.75rem', opacity: 0.6 }}>YOUR ANSWER</strong>
                          <p style={{ opacity: 0.8, fontSize: '0.88rem', marginTop: 4 }}>{q.candidate_answer_summary}</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: 10 }}>
                            <strong style={{ fontSize: '0.75rem', color: '#10b981' }}>✅ What Was Good</strong>
                            <p style={{ fontSize: '0.82rem', marginTop: 5 }}>{q.what_was_good}</p>
                          </div>
                          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: 10 }}>
                            <strong style={{ fontSize: '0.75rem', color: '#ef4444' }}>❌ What Was Missing</strong>
                            <p style={{ fontSize: '0.82rem', marginTop: 5 }}>{q.what_was_missing}</p>
                          </div>
                        </div>
                        <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 8, padding: 10 }}>
                          <strong style={{ fontSize: '0.75rem', color: '#A78BFA' }}>💡 Ideal Answer Should Include</strong>
                          <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                            {q.ideal_answer_points.map((p, j) => <li key={j} style={{ fontSize: '0.82rem', marginBottom: 3 }}>{p}</li>)}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        )}

        {/* TAB: WEAKNESSES */}
        {voiceResultsTab === 'weaknesses' && (
          <div>
            <h3 style={{ marginBottom: 14, fontSize: 15 }}>⚠️ Critical Weaknesses to Fix</h3>
            {weaknesses.map((w, i) => (
              <div key={i} style={{ ...RCARD, borderLeft: '3px solid #ef4444' }}>
                <h4 style={{ color: '#ef4444', marginBottom: 8, fontSize: 14 }}>#{i+1} {w.weakness}</h4>
                <div style={{ marginBottom: 8 }}>
                  <strong style={{ fontSize: '0.75rem', opacity: 0.6 }}>IMPACT</strong>
                  <p style={{ fontSize: '0.88rem', marginTop: 4 }}>{w.impact}</p>
                </div>
                <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: 10 }}>
                  <strong style={{ fontSize: '0.75rem', color: '#10b981' }}>HOW TO FIX</strong>
                  <p style={{ fontSize: '0.88rem', marginTop: 4 }}>{w.fix}</p>
                </div>
              </div>
            ))}

            <h3 style={{ margin: '20px 0 14px', fontSize: 15 }}>💪 Genuine Strengths</h3>
            {strengths.length === 0
              ? <div style={{ ...RCARD, opacity: 0.5, textAlign: 'center', fontSize: 13 }}>No significant strengths observed yet</div>
              : strengths.map((s, i) => (
                  <div key={i} style={{ ...RCARD, borderLeft: '3px solid #10b981' }}>
                    <h4 style={{ color: '#10b981', marginBottom: 6, fontSize: 14 }}>{s.strength}</h4>
                    <p style={{ fontSize: '0.88rem', opacity: 0.8 }}>Evidence: {s.evidence}</p>
                  </div>
                ))}

            <h3 style={{ margin: '20px 0 14px', fontSize: 15 }}>📚 Resources to Study</h3>
            {resources.map((r, i) => (
              <div key={i} style={{ ...RCARD, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ fontSize: 14 }}>{r.resource}</strong>
                    <p style={{ fontSize: '0.82rem', opacity: 0.7, marginTop: 4 }}>{r.why}</p>
                  </div>
                  <span style={{ fontSize: '0.78rem', opacity: 0.5, whiteSpace: 'nowrap', marginLeft: 12 }}>{r.time_needed}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: 30-DAY PLAN */}
        {voiceResultsTab === 'plan' && (
          <div>
            <h3 style={{ marginBottom: 14, fontSize: 15 }}>📅 Your 30-Day Interview Improvement Plan</h3>
            {plan30.map((week, i) => (
              <div key={i} style={RCARD}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <h4 style={{ margin: 0, color: '#A78BFA', fontSize: 14 }}>{week.week}</h4>
                  <span style={{ fontSize: '0.78rem', opacity: 0.6 }}>🎯 {week.goal}</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong style={{ fontSize: '0.75rem', opacity: 0.6 }}>FOCUS</strong>
                  <p style={{ marginTop: 4, fontSize: '0.88rem' }}>{week.focus}</p>
                </div>
                <div style={{ background: 'rgba(124,58,237,0.1)', borderRadius: 8, padding: '10px 12px' }}>
                  <strong style={{ fontSize: '0.75rem', color: '#A78BFA' }}>DAILY PRACTICE</strong>
                  <p style={{ marginTop: 4, fontSize: '0.88rem' }}>{week.daily_practice}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button onClick={resetAll} style={{ flex: 1, background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 0', fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 8px 32px #7C3AED40' }}>🔄 Try Again</button>
          <button onClick={() => { resetAll(); setTimeout(() => setMode('chat'), 50) }} style={{ flex: 1, background: 'transparent', border: `1px solid ${C.border}`, color: C.accentL, borderRadius: 12, padding: '14px 0', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>💬 Switch to Chat</button>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAT INTERVIEW SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 'chat-interview') return (
    <div style={{ maxWidth: 700, margin: '0 auto', color: C.text }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: C.muted }}>Question {currentIndex + 1} of {chatQuestions.length}</span>
        <button onClick={resetAll} style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>End Interview</button>
      </div>
      <div style={{ background: '#2D1B69', borderRadius: 999, height: 8, marginBottom: 16 }}>
        <div style={{ width: `${progressPercent}%`, height: 8, borderRadius: 999, background: 'linear-gradient(90deg,#7C3AED,#4F46E5)', transition: 'width .2s ease' }} />
      </div>

      <div style={{ background: '#160D2E', border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 16, lineHeight: 1.5 }}>{currentChatQuestion?.question}</h3>
        <textarea value={userAnswer} onChange={e => setUserAnswer(e.target.value)} placeholder="Type your answer here..." rows={6} disabled={showFeedback}
          style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, padding: '12px 14px', fontSize: 14, resize: 'none', outline: 'none' }} />
        {!showFeedback && (
          <button onClick={submitChatAnswer} disabled={loading || !userAnswer.trim()}
            style={{ width: '100%', marginTop: 12, background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 15, fontWeight: 600, cursor: !userAnswer.trim() ? 'not-allowed' : 'pointer', opacity: !userAnswer.trim() ? .5 : 1, boxShadow: '0 4px 20px #7C3AED40' }}>
            {loading ? 'Evaluating...' : 'Submit Answer'}
          </button>
        )}
      </div>

      {showFeedback && chatAnswers.length > 0 && (() => {
        const last = chatAnswers[chatAnswers.length - 1]
        return (
          <div style={{ background: 'rgba(124,58,237,.1)', border: `1px solid ${C.accent}`, borderRadius: 14, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.accent }}>{last.score}/10</div>
              <div style={{ fontSize: 13, color: C.hint }}>Your Score</div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#10B981', marginBottom: 4 }}>What was good:</div>
              <p style={{ fontSize: 13, color: C.muted }}>{last.feedback}</p>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#F59E0B', marginBottom: 4 }}>What to improve:</div>
              <p style={{ fontSize: 13, color: C.muted }}>{last.improvement}</p>
            </div>
            <button onClick={handleNextQuestion}
              style={{ width: '100%', background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              {currentIndex < chatQuestions.length - 1 ? 'Next Question →' : 'View Results'}
            </button>
            <button onClick={handlePreviousQuestion} disabled={currentIndex <= 0}
              style={{ width: '100%', marginTop: 8, background: 'transparent', color: C.accentL, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 0', fontSize: 14, fontWeight: 600, cursor: currentIndex <= 0 ? 'not-allowed' : 'pointer', opacity: currentIndex <= 0 ? 0.5 : 1 }}>
              ← Previous Question
            </button>
          </div>
        )
      })()}
    </div>
  )

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAT RESULTS
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', color: C.text }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
        {isComplete ? 'Interview Complete! 🎉' : 'Interview Results'}
      </h1>
      <div style={{ background: 'linear-gradient(135deg,#160D2E,#1E1040)', border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, textAlign: 'center', marginBottom: 20, boxShadow: '0 0 40px #7C3AED18' }}>
        <div style={{ fontSize: 56, fontWeight: 700, background: 'linear-gradient(135deg,#A78BFA,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{avgChatScore}</div>
        <div style={{ color: C.muted, fontSize: 14 }}>Average Score out of 10</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {chatAnswers.map((a, i) => (
          <div key={i} style={{ background: '#160D2E', border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <h3 style={{ fontWeight: 600, fontSize: 14, flex: 1, marginRight: 12 }}>Q{i + 1}: {a.question}</h3>
              <span style={{ fontSize: 20, fontWeight: 700, color: C.accent, flexShrink: 0 }}>{a.score}/10</span>
            </div>
            <p style={{ fontSize: 12, color: C.hint, marginBottom: 4 }}><strong>Your answer:</strong> {a.answer}</p>
            <p style={{ fontSize: 12, color: '#10B981', marginBottom: 2 }}><strong>Feedback:</strong> {a.feedback}</p>
            <p style={{ fontSize: 12, color: '#F59E0B' }}><strong>Improvement:</strong> {a.improvement}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={resetAll}
          style={{ flex: 1, background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 0', fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 8px 32px #7C3AED40' }}>
          🔄 Try Again
        </button>
        <button onClick={() => { resetAll(); setTimeout(() => setMode('voice'), 50) }}
          style={{ flex: 1, background: 'transparent', border: `1px solid ${C.border}`, color: C.accentL, borderRadius: 12, padding: '14px 0', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          🎙️ Switch to Voice
        </button>
      </div>
    </div>
  )
}
