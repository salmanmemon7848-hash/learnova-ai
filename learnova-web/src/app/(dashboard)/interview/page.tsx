'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

type Step = 'setup' | 'voice-interview' | 'chat-interview' | 'voice-results' | 'chat-results'
type InterviewMode = 'voice' | 'chat'
type Phase = 'idle' | 'ai-speaking' | 'listening' | 'processing' | 'thinking'

interface Message { role: 'user' | 'assistant'; content: string }
interface ChatAnswer { question: string; answer: string; score: number; feedback: string; improvement: string }
interface VoiceEval { overallScore: number; communication: number; technical: number; confidence: number; presentation: number; strength: string; improvement: string }

export default function InterviewPage() {
  const { user } = useAuth()
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

  // Chat mode state
  const [chatQuestions, setChatQuestions] = useState<string[]>([])
  const [chatCurrentQ, setChatCurrentQ] = useState(0)
  const [chatAnswers, setChatAnswers] = useState<ChatAnswer[]>([])
  const [userAnswer, setUserAnswer] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)

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
      voiceNames: ['hindi', 'hi-in', 'lekha', 'divya', 'kalpana'],
      fallbackLang: 'hi-IN',
      interviewerName: 'Rajesh',
    },
    hinglish: {
      lang: 'hi-IN' as const,
      rate: 0.82,
      pitch: 0.97,
      whisperLanguage: 'hi',
      whisperPrompt: 'This speaker mixes Hindi and English naturally — Hinglish. Job interview context.',
      voiceNames: ['hindi', 'hi-in', 'ravi', 'india'],
      fallbackLang: 'en-IN',
      interviewerName: 'Vikram',
    },
  } as const

  type LangKey = keyof typeof languageProfiles
  const normalizedLanguage: LangKey = (language as LangKey) in languageProfiles ? (language as LangKey) : 'english'
  const activeProfile = languageProfiles[normalizedLanguage]

  // ── Ref-safe history updater (fixes stale closure bug) ───────────────────
  const addToHistory = (role: 'user' | 'assistant', content: string) => {
    const newEntry: Message = { role, content }
    const updated = [...conversationHistoryRef.current, newEntry]
    conversationHistoryRef.current = updated
    setConversationHistory(updated)
    return updated
  }

  // ── TTS with onDone callback ─────────────────────────────────────────────
  const speakText = (text: string, profile: typeof languageProfiles[LangKey], onDone?: () => void) => {
    if (!speechSupported) { onDone?.(); return }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const voices = window.speechSynthesis.getVoices()
    const matchedVoice =
      voices.find(v => v.lang === profile.lang) ||
      voices.find(v => profile.voiceNames.some(name => v.name.toLowerCase().includes(name))) ||
      voices.find(v => v.lang === profile.fallbackLang) ||
      voices.find(v => v.lang.startsWith('en'))
    if (matchedVoice) utterance.voice = matchedVoice
    utterance.lang = profile.lang
    utterance.rate = profile.rate
    utterance.pitch = profile.pitch
    utterance.volume = 1.0
    utterance.onend = () => { setPhase('idle'); onDone?.() }
    utterance.onerror = () => { setPhase('idle'); onDone?.() }
    window.speechSynthesis.speak(utterance)
  }

  // ── Whisper transcription ─────────────────────────────────────────────────
  const sendToWhisper = async (audioBlob: Blob): Promise<string> => {
    const profile = activeProfile
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.webm')
    formData.append('model', 'whisper-large-v3')
    formData.append('language', profile.whisperLanguage)
    formData.append('prompt', profile.whisperPrompt)
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}` },
          body: formData,
        })
        const data = await res.json()
        if (data.text) return data.text
      } catch {}
    }
    return ''
  }

  // ── Get next question from API ────────────────────────────────────────────
  const getNextQuestion = async (fullHistory: Message[]): Promise<string> => {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch('/api/interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'voice_turn',
            interviewType,
            language: normalizedLanguage,
            messages: fullHistory,
          }),
        })
        const data = await res.json()
        if (data.text) return data.text
      } catch {
        if (attempt === 1) {
          const lastQ = fullHistory.filter(m => m.role === 'assistant').slice(-1)[0]?.content || ''
          setPhase('ai-speaking')
          speakText('One moment please. ' + lastQ, activeProfile, () => startRecording())
          return ''
        }
      }
    }
    return ''
  }

  // ── Recording — reliable onstop pattern ──────────────────────────────────
  const startRecording = async () => {
    setVoiceError('')
    setMicDenied(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      audioChunksRef.current = []
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
      recorder.onstop = () => { handleRecordingComplete() }
      recorder.start(100)
      mediaRecorderRef.current = recorder
      isRecordingRef.current = true
      setPhase('listening')
    } catch {
      setMicDenied(true)
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
      setPhase('processing')
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      const spokenText = await sendToWhisper(audioBlob)

      if (!spokenText || spokenText.trim() === '') {
        setPhase('ai-speaking')
        speakText("I didn't catch that. Please try again.", activeProfile, () => {
          setTimeout(() => startRecording(), 1000)
        })
        return
      }

      setLastStudentAnswer(spokenText)
      // Use addToHistory so ref is always in sync before we call the API
      const afterUserHistory = addToHistory('user', spokenText)

      setPhase('thinking')
      const nextQuestion = await getNextQuestion(afterUserHistory)
      if (!nextQuestion) return

      setCurrentQuestion(nextQuestion)
      setQuestionNum(q => q + 1)
      const afterAssistantHistory = addToHistory('assistant', nextQuestion)

      const userTurns = afterAssistantHistory.filter(m => m.role === 'user').length
      if (userTurns > TOTAL_QUESTIONS) {
        setPhase('ai-speaking')
        speakText(nextQuestion, activeProfile, async () => {
          try {
            const evalRes = await fetch('/api/interview', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'voice_evaluate', messages: afterAssistantHistory }),
            })
            const evalData = await evalRes.json()
            setVoiceEval(evalData)
          } catch {}
          setStep('voice-results')
        })
      } else {
        setPhase('ai-speaking')
        speakText(nextQuestion, activeProfile, () => { startRecording() })
      }
    } catch {
      setPhase('idle')
    }
  }

  // ── VOICE: start interview ────────────────────────────────────────────────
  const startVoiceInterview = async () => {
    if (firstQuestionAskedRef.current) return // prevent re-triggering
    firstQuestionAskedRef.current = true
    setLoading(true)
    setError('')
    setMicDenied(false)
    setVoiceError('')
    conversationHistoryRef.current = [] // reset ref for fresh interview
    try {
      const opening = await getNextQuestion([]) // empty history = first question
      const q = opening || 'Tell me about yourself.'
      addToHistory('assistant', q)
      setCurrentQuestion(q)
      setQuestionNum(1)
      setLastStudentAnswer('')
      setStep('voice-interview')
      setPhase('ai-speaking')
      speakText(q, activeProfile, () => { startRecording() })
    } catch { setError('Connection issue. Please try again.') }
    finally { setLoading(false) }
  }

  const interviewTypes = [
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









  // ── CHAT: start / submit / next ───────────────────────────────────────────
  const startChatInterview = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_questions', interviewType, schoolClass, language }),
      })
      const data = await res.json()
      setChatQuestions(data.questions || [])
      setStep('chat-interview')
    } catch { setError('Failed to start interview.') }
    finally { setLoading(false) }
  }

  const startInterview = () => mode === 'voice' ? startVoiceInterview() : startChatInterview()

  const submitChatAnswer = async () => {
    if (!userAnswer.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'evaluate_answer', question: chatQuestions[chatCurrentQ], answer: userAnswer, language }),
      })
      const data = await res.json()
      setChatAnswers(prev => [...prev, { question: chatQuestions[chatCurrentQ], answer: userAnswer, score: data.score || 0, feedback: data.feedback || '', improvement: data.improvement || '' }])
      setShowFeedback(true)
    } catch { setError('Failed to evaluate answer.') }
    finally { setLoading(false) }
  }

  const nextChatQuestion = () => {
    setShowFeedback(false)
    setUserAnswer('')
    if (chatCurrentQ < chatQuestions.length - 1) setChatCurrentQ(chatCurrentQ + 1)
    else setStep('chat-results')
  }

  const resetAll = () => {
    setStep('setup'); setConversationHistory([]); setCurrentQuestion(''); setQuestionNum(0)
    setPhase('idle'); setLastStudentAnswer(''); setVoiceEval(null)
    setMicDenied(false); setVoiceError('')
    setChatQuestions([]); setChatCurrentQ(0)
    setChatAnswers([]); setUserAnswer(''); setShowFeedback(false); setError('')
    isRecordingRef.current = false
    conversationHistoryRef.current = []
    firstQuestionAskedRef.current = false
    streamRef.current?.getTracks().forEach(t => t.stop())
    window.speechSynthesis?.cancel()
  }

  const avgChatScore = chatAnswers.length > 0 ? (chatAnswers.reduce((s, a) => s + a.score, 0) / chatAnswers.length).toFixed(1) : 0

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
    }[phase]

    const orbClass =
      phase === 'ai-speaking' ? 'orb-speaking' :
      phase === 'listening' ? 'orb-listening' :
      (phase === 'processing' || phase === 'thinking') ? 'orb-thinking' :
      'orb-idle'

    const isDisabled = phase === 'processing' || phase === 'thinking' || phase === 'ai-speaking'
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

        {/* Bottom — voice button */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingBottom:'clamp(28px,5vh,48px)', flexShrink:0 }}>
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
  // VOICE RESULTS
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 'voice-results') {
    const ev = voiceEval
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', color: C.text }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Interview Complete! 🎉</h1>
        <p style={{ color: C.muted, marginBottom: 24 }}>Here is your performance evaluation.</p>

        <div style={{ background: 'linear-gradient(135deg,#160D2E,#1E1040)', border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, marginBottom: 20, boxShadow: '0 0 40px #7C3AED18' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 56, fontWeight: 700, background: 'linear-gradient(135deg,#A78BFA,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {ev?.overallScore ?? '--'}<span style={{ fontSize: 24 }}>/10</span>
            </div>
            <div style={{ color: C.muted, fontSize: 14 }}>Overall Score</div>
          </div>

          <ScoreBar label="💬 Communication" value={ev?.communication ?? 0} />
          <ScoreBar label="🧠 Technical Knowledge" value={ev?.technical ?? 0} />
          <ScoreBar label="💪 Confidence" value={ev?.confidence ?? 0} />
          <ScoreBar label="🎯 Presentation" value={ev?.presentation ?? 0} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
            <div style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.3)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600, marginBottom: 6 }}>⭐ STRENGTH</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{ev?.strength || '—'}</div>
            </div>
            <div style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.3)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600, marginBottom: 6 }}>💡 IMPROVE</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{ev?.improvement || '—'}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={resetAll}
            style={{ flex: 1, background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 0', fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 8px 32px #7C3AED40' }}>
            🔄 Try Again
          </button>
          <button onClick={() => { resetAll(); setTimeout(() => setMode('chat'), 50) }}
            style={{ flex: 1, background: 'transparent', border: `1px solid ${C.border}`, color: C.accentL, borderRadius: 12, padding: '14px 0', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            💬 Switch to Chat
          </button>
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
        <span style={{ fontSize: 13, color: C.muted }}>Question {chatCurrentQ + 1} of {chatQuestions.length}</span>
        <button onClick={resetAll} style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>End Interview</button>
      </div>

      <div style={{ background: '#160D2E', border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 16, lineHeight: 1.5 }}>{chatQuestions[chatCurrentQ]}</h3>
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
            <button onClick={nextChatQuestion}
              style={{ width: '100%', background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              {chatCurrentQ < chatQuestions.length - 1 ? 'Next Question →' : 'View Results'}
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
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Interview Complete! 🎉</h1>
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
