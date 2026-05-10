/**
 * Central Voice Session Manager
 *
 * Tries Gemini Live first (real-time audio understanding + AI responses).
 * Falls back silently to Groq voice if Gemini is unavailable for any reason.
 * The user sees no difference between providers.
 */

import {
  startGeminiLiveSession,
  buildSystemPrompt,
  getGeminiOpeningQuestion,
  type InterviewConfig,
  type GeminiLiveSession,
} from './providers/geminiLive';
import { startGroqVoiceSession, type GroqVoiceSession } from './providers/groqVoice';

export type { InterviewConfig };

export interface VoiceTurnResult {
  transcript: string;
  aiResponse: string;
}

export interface VoiceSession {
  sendAudio: (blob: Blob) => Promise<VoiceTurnResult>;
  speakText: (text: string, onDone?: () => void) => void;
  stopSpeaking: () => void;
  close: () => void;
  isActive: () => boolean;
  /** Internal — never show to the user */
  _provider: 'gemini-live' | 'groq-voice';
}

export interface VoiceHandlerInput {
  interviewConfig: InterviewConfig;
  onTranscript: (text: string, speaker: 'user' | 'ai') => void;
  onError: (error: string) => void;
  /** Provides the next AI question using the legacy /api/interview route (used by Groq fallback) */
  getNextAIQuestion: (history: Array<{ role: string; content: string }>) => Promise<string>;
}

// ── Fallback trigger detection ─────────────────────────────────────────────

const FALLBACK_STATUS_CODES = [401, 403, 429, 500, 502, 503];

function shouldFallback(error: unknown): boolean {
  if (!(error instanceof Error)) return true;
  const msg = error.message.toLowerCase();
  for (const code of FALLBACK_STATUS_CODES) {
    if (msg.includes(String(code))) return true;
  }
  return msg.includes('timeout') || msg.includes('network') || msg.includes('unavailable') || true;
}

function logVoiceFallback(provider: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  // Internal log only — never surfaced to user
  console.warn(`[VoiceHandler] ${provider} failed (fallback triggered):`, message);
}

// ── Wrap a Gemini session with per-turn Groq fallback ─────────────────────

function wrapWithTurnFallback(
  geminiSession: GeminiLiveSession,
  input: VoiceHandlerInput,
): VoiceSession {
  const { onTranscript, getNextAIQuestion } = input;

  return {
    _provider: 'gemini-live',
    isActive: () => geminiSession.isActive(),
    close: () => geminiSession.close(),
    speakText: geminiSession.speakText,
    stopSpeaking: geminiSession.stopSpeaking,

    async sendAudio(blob: Blob): Promise<VoiceTurnResult> {
      try {
        return await geminiSession.sendAudio(blob);
      } catch (turnErr) {
        if (shouldFallback(turnErr)) {
          logVoiceFallback('gemini-live-turn', turnErr);
          // Per-turn fallback: use Groq Whisper + existing interview API
          const formData = new FormData();
          formData.append('file', blob, 'audio.webm');
          formData.append('language', 'en');
          formData.append('prompt', 'Interview candidate speaking English.');
          let transcript = '';
          try {
            const res = await fetch('/api/transcribe', { method: 'POST', body: formData, signal: AbortSignal.timeout(15_000) });
            if (res.ok) {
              const data = await res.json() as { text?: string };
              transcript = (data.text ?? '').trim();
            }
          } catch { /* silent */ }
          const history = transcript ? [{ role: 'user', content: transcript }] : [];
          const aiResponse = transcript ? await getNextAIQuestion(history) : '';
          if (transcript) onTranscript(transcript, 'user');
          if (aiResponse) onTranscript(aiResponse, 'ai');
          return { transcript, aiResponse };
        }
        throw turnErr;
      }
    },
  };
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Attempt to start a Gemini Live session; fall back to Groq silently.
 */
export async function startVoiceSession(input: VoiceHandlerInput): Promise<VoiceSession> {
  const { interviewConfig, onTranscript, onError, getNextAIQuestion } = input;

  // ── Try Gemini Live ──────────────────────────────────────────────────────
  try {
    const geminiSession = await Promise.race([
      startGeminiLiveSession(interviewConfig, onTranscript, onError),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini Live connection timeout (8s)')), 8_000),
      ),
    ]);

    console.log('[VoiceHandler] ✅ Gemini Live session ready');
    return wrapWithTurnFallback(geminiSession, input);
  } catch (geminiErr) {
    logVoiceFallback('gemini-live', geminiErr);
  }

  // ── Fall back to Groq voice ──────────────────────────────────────────────
  try {
    const groqSession = await startGroqVoiceSession(
      interviewConfig,
      onTranscript,
      onError,
      getNextAIQuestion,
    );

    console.log('[VoiceHandler] 🔄 Groq Voice fallback session ready');

    return {
      _provider: 'groq-voice',
      isActive: () => groqSession.isActive(),
      close: () => groqSession.close(),
      speakText: groqSession.speakText,
      stopSpeaking: groqSession.stopSpeaking,
      sendAudio: (blob: Blob) => groqSession.sendAudio(blob),
    };
  } catch (groqErr) {
    logVoiceFallback('groq-voice', groqErr);
    onError('Voice is temporarily unavailable. Please try again in a moment.');
    throw groqErr;
  }
}

/**
 * Get the opening question from the AI interviewer.
 * Tries Gemini first, falls back to the existing /api/interview endpoint.
 */
export async function getOpeningQuestion(
  interviewConfig: InterviewConfig,
  legacyGetQuestion: (history: Array<{ role: string; content: string }>) => Promise<string>,
): Promise<string> {
  try {
    const question = await Promise.race([
      getGeminiOpeningQuestion(interviewConfig),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Opening question timeout')), 12_000),
      ),
    ]);
    if (question) return question;
    throw new Error('Empty opening question from Gemini');
  } catch (err) {
    logVoiceFallback('gemini-opening', err);
    // Fall back to legacy /api/interview
    return legacyGetQuestion([]);
  }
}

export { buildSystemPrompt };
