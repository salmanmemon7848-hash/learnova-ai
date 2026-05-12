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
  sources: PowerfulModeSources;
  durationMs?: number;
}

export function usePowerfulMode() {
  const [isPowerfulMode, setIsPowerfulMode] = useState(false);
  const [isPowerfulLoading, setIsPowerfulLoading] = useState(false);
  const [sources, setSources] = useState<PowerfulModeSources | null>(null);

  const togglePowerfulMode = useCallback(() => {
    setIsPowerfulMode((previous) => !previous);
    setSources(null);
  }, []);

  const askPowerful = useCallback(async (
    messages: PowerfulModeMessage[],
    sessionId: string | null
  ): Promise<PowerfulModeResponse> => {
    setIsPowerfulLoading(true);
    setSources(null);

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
        sources: data.sources,
        durationMs: data.durationMs,
      };

      setSources(result.sources);
      return result;
    } finally {
      setIsPowerfulLoading(false);
    }
  }, []);

  return {
    isPowerfulMode,
    togglePowerfulMode,
    isPowerfulLoading,
    askPowerful,
    sources,
  };
}
