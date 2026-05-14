import { useCallback, useState } from 'react';

export interface PowerfulModeSources {
  openai: string;
  gemini: string;
  groq: string;
}

export interface PowerfulModeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PowerfulModeResponse {
  reply: string;
  sessionId: string | null;
  provider: string;
  durationMs?: number;
}

export function usePowerfulMode() {
  const [isPowerfulMode, setIsPowerfulMode] = useState(false);
  const [isPowerfulLoading, setIsPowerfulLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>('idle');
  const [provider, setProvider] = useState<string | null>(null);

  const togglePowerfulMode = useCallback(() => {
    setIsPowerfulMode((previous) => !previous);
    setProvider(null);
    setCurrentStatus('idle');
  }, []);

  const askPowerful = useCallback(async (
    messages: PowerfulModeMessage[],
    sessionId: string | null
  ): Promise<PowerfulModeResponse> => {
    setIsPowerfulLoading(true);
    setProvider(null);
    setCurrentStatus('searching_web');

    try {
      const response = await fetch('/api/powerful-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, sessionId }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.message || data.error || 'Powerful Mode request failed');
      }

      const result: PowerfulModeResponse = {
        reply: data.reply || data.answer || '',
        sessionId: data.sessionId || null,
        provider: data.provider,
        durationMs: data.durationMs,
      };

      setProvider(result.provider);
      setCurrentStatus('idle');
      return result;
    } catch (error) {
      setCurrentStatus('idle');
      throw error;
    } finally {
      setIsPowerfulLoading(false);
    }
  }, []);

  return {
    isPowerfulMode,
    togglePowerfulMode,
    isPowerfulLoading,
    askPowerful,
    provider,
    currentStatus,
    setCurrentStatus,
  };
}
