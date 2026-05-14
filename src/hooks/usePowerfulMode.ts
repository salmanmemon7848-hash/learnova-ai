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

      if (!response.ok) {
        throw new Error(`Powerful Mode request failed: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalResult: PowerfulModeResponse | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (!part.trim()) continue;
          
          try {
            const data = JSON.parse(part);
            
            if (data.type === 'status') {
              setCurrentStatus(data.status);
            } else if (data.type === 'result') {
              finalResult = {
                reply: data.reply || data.answer || '',
                sessionId: data.sessionId || null,
                provider: data.provider,
                durationMs: data.durationMs,
              };
            } else if (data.type === 'error' || data.error) {
              throw new Error(data.message || data.error || 'Powerful Mode error');
            }
          } catch (e) {
            if (e instanceof Error && e.message !== 'Unexpected end of JSON input') {
              throw e;
            }
          }
        }
      }

      if (!finalResult) {
        throw new Error('No final result received from Powerful Mode');
      }

      setProvider(finalResult.provider);
      setCurrentStatus('idle');
      return finalResult;
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
