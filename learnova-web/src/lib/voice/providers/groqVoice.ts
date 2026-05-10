/**
 * Groq Voice Fallback Provider
 *
 * Wraps the existing Groq Whisper STT (/api/transcribe) and the existing
 * /api/interview endpoint for AI responses. Used as a silent fallback when
 * Gemini Live is unavailable.
 */

import type { InterviewConfig } from './geminiLive';

export interface GroqVoiceTurnResult {
  transcript: string;
  aiResponse: string;
}

export interface GroqVoiceSession {
  sendAudio: (blob: Blob) => Promise<GroqVoiceTurnResult>;
  speakText: (text: string, onDone?: () => void) => void;
  stopSpeaking: () => void;
  close: () => void;
  isActive: () => boolean;
}

// ── Browser TTS (male-preferred) — mirrors geminiLive ─────────────────────

function pickMaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const maleKeywords = ['male', 'man', 'david', 'james', 'daniel', 'aaron',
    'mark', 'alex', 'george', 'tom', 'ryan', 'ravi', 'vikram'];
  const enVoices = voices.filter(v => v.lang.startsWith('en'));

  for (const kw of maleKeywords) {
    const found = enVoices.find(v => v.name.toLowerCase().includes(kw));
    if (found) return found;
  }
  return enVoices[0] ?? voices[0] ?? null;
}

function speakText(text: string, onDone?: () => void): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) { onDone?.(); return; }
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickMaleVoice();
  if (voice) utterance.voice = voice;
  utterance.lang = 'en-US';
  utterance.rate = 0.88;
  utterance.pitch = 0.85;
  utterance.volume = 1.0;

  const wordCount = text.split(/\s+/).length;
  const safetyMs = Math.max(4000, (wordCount / 130) * 60_000 * (1 / 0.88)) + 3000;
  let done = false;
  const finish = () => { if (done) return; done = true; onDone?.(); };
  utterance.onend = finish;
  utterance.onerror = finish;
  setTimeout(finish, safetyMs);

  window.speechSynthesis.speak(utterance);
}

// ── Session factory ────────────────────────────────────────────────────────

export async function startGroqVoiceSession(
  config: InterviewConfig,
  onTranscript: (text: string, speaker: 'user' | 'ai') => void,
  _onError: (error: string) => void,
  getNextAIQuestion: (history: Array<{ role: string; content: string }>) => Promise<string>,
): Promise<GroqVoiceSession> {
  let active = true;
  const history: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  return {
    isActive: () => active,

    close() {
      active = false;
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    },

    speakText,
    stopSpeaking() {
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    },

    async sendAudio(blob: Blob): Promise<GroqVoiceTurnResult> {
      if (!active) throw new Error('Session already closed');

      // STT via existing Groq Whisper proxy
      const formData = new FormData();
      formData.append('file', blob, 'audio.webm');
      formData.append('language', 'en');
      formData.append('prompt', 'Interview candidate speaking English professionally.');

      let transcript = '';
      try {
        const transcribeRes = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
          signal: AbortSignal.timeout(15_000),
        });
        if (transcribeRes.ok) {
          const data = await transcribeRes.json() as { text?: string };
          transcript = (data.text ?? '').trim();
        }
      } catch (e) {
        console.error('[GroqVoice] Transcribe failed:', e);
      }

      if (transcript) {
        history.push({ role: 'user', content: transcript });
        onTranscript(transcript, 'user');
      }

      // Get AI response via existing /api/interview route
      const aiResponse = await getNextAIQuestion(history);
      if (aiResponse) {
        history.push({ role: 'assistant', content: aiResponse });
        onTranscript(aiResponse, 'ai');
      }

      return { transcript, aiResponse };
    },
  };
}
