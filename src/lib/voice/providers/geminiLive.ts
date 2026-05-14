/**
 * Gemini Live Voice Provider
 *
 * Uses Gemini Flash multimodal for real-time audio understanding (STT) and
 * AI interviewer response generation. Browser SpeechSynthesis handles TTS
 * with a preferentially-selected deep male voice.
 */

export interface InterviewConfig {
  userName: string;
  topicOrRole: string;
  userType: 'student' | 'founder';
}

export interface TranscriptEntry {
  speaker: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface GeminiTurnResult {
  transcript: string;
  aiResponse: string;
}

export interface GeminiLiveSession {
  sendAudio: (blob: Blob) => Promise<GeminiTurnResult>;
  speakText: (text: string, onDone?: () => void) => void;
  stopSpeaking: () => void;
  close: () => void;
  isActive: () => boolean;
}

// ── System prompt builders ─────────────────────────────────────────────────

export function buildSystemPrompt(config: InterviewConfig): string {
  const { userName, topicOrRole, userType } = config;

  if (userType === 'founder') {
    return (
      `You are a strict, professional venture capitalist conducting a mock pitch and founder interview ` +
      `for a startup in the ${topicOrRole} space. Address the founder as ${userName}. ` +
      `Ask sharp, relevant questions about their business model, market, traction, competition, and vision — ` +
      `one question at a time. Wait for answers before proceeding. Ask follow-up questions based on their responses. ` +
      `Do not give encouragement or feedback during the session. Stay professional, direct, and concise. ` +
      `Start by briefly introducing yourself and asking the first question.`
    );
  }

  return (
    `You are a strict, professional interviewer conducting a mock interview for a student applying for ` +
    `a role in ${topicOrRole}. Address the candidate as ${userName}. ` +
    `Ask relevant, role-specific interview questions one at a time. ` +
    `Wait for the candidate to answer before asking the next question. ` +
    `Ask follow-up questions based on their answers. Do not give feedback or encouragement during the interview. ` +
    `Stay professional and concise. Start by introducing yourself briefly and asking the first question.`
  );
}

// ── Male voice selection ───────────────────────────────────────────────────

function pickMaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const maleKeywords = ['male', 'man', 'guy', 'david', 'james', 'daniel', 'aaron',
    'mark', 'alex', 'george', 'tom', 'ryan', 'thomas', 'fred', 'paul', 'richard',
    'ravi', 'mohan', 'vikram', 'charan', 'en-us-wavenet-d', 'en-us-wavenet-b',
    'en-gb-wavenet-b', 'en-gb-wavenet-d', 'google us english'];

  const enVoices = voices.filter(v => v.lang.startsWith('en'));

  // Prefer male-named English voices
  for (const kw of maleKeywords) {
    const found = enVoices.find(v => v.name.toLowerCase().includes(kw));
    if (found) return found;
  }

  // Fall back to first English voice (better than random)
  return enVoices[0] ?? voices[0] ?? null;
}

function speakWithMaleVoice(text: string, onDone?: () => void): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onDone?.();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickMaleVoice();
  if (voice) utterance.voice = voice;
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 0.85; // slightly lower = more masculine
  utterance.volume = 1.0;

  const wordCount = text.split(/\s+/).length;
  const safetyMs = Math.max(4000, (wordCount / 130) * 60_000 * (1 / 0.9)) + 3000;

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    onDone?.();
  };

  utterance.onend = finish;
  utterance.onerror = finish;
  setTimeout(finish, safetyMs);

  window.speechSynthesis.speak(utterance);
}

// ── Opening question (no audio from user yet) ─────────────────────────────

export async function getGeminiOpeningQuestion(config: InterviewConfig): Promise<string> {
  const systemPrompt = buildSystemPrompt(config);

  const res = await fetch('/api/interview/gemini-voice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'opening',
      interviewConfig: config,
      systemPrompt,
      history: [],
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(`Gemini opening failed: ${res.status} ${data.error ?? ''}`);
  }

  const data = await res.json() as { aiResponse?: string };
  return data.aiResponse ?? '';
}

// ── Main session factory ───────────────────────────────────────────────────

export async function startGeminiLiveSession(
  config: InterviewConfig,
  onTranscript: (text: string, speaker: 'user' | 'ai') => void,
  onError: (error: string) => void,
): Promise<GeminiLiveSession> {
  let active = true;
  const systemPrompt = buildSystemPrompt(config);
  const history: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  // Connectivity check — POST a tiny ping to our API route
  const pingRes = await fetch('/api/interview/gemini-voice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'ping', interviewConfig: config, systemPrompt, history: [] }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!pingRes.ok) {
    throw new Error(`Gemini Live unavailable (ping): ${pingRes.status}`);
  }

  return {
    isActive: () => active,

    close() {
      active = false;
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    },

    speakText: speakWithMaleVoice,

    stopSpeaking() {
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    },

    async sendAudio(blob: Blob): Promise<GeminiTurnResult> {
      if (!active) throw new Error('Session already closed');

      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('interviewConfig', JSON.stringify(config));
      formData.append('systemPrompt', systemPrompt);
      formData.append(
        'history',
        JSON.stringify(history.slice(-12)),
      );

      const res = await fetch('/api/interview/gemini-voice', {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(20_000),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(`Gemini audio turn failed: ${res.status} ${data.error ?? ''}`);
      }

      const data = await res.json() as { transcript?: string; aiResponse?: string };
      const transcript = (data.transcript ?? '').trim();
      const aiResponse = (data.aiResponse ?? '').trim();

      if (transcript) {
        history.push({ role: 'user', content: transcript });
        onTranscript(transcript, 'user');
      }
      if (aiResponse) {
        history.push({ role: 'assistant', content: aiResponse });
        onTranscript(aiResponse, 'ai');
      }

      return { transcript, aiResponse };
    },
  };
}
