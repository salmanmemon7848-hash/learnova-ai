import type Groq from 'groq-sdk';

export const GROQ_PRIMARY_MODEL =
  process.env.GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile';
export const GROQ_FALLBACK_MODEL =
  process.env.GROQ_FALLBACK_MODEL?.trim() || 'llama-3.1-8b-instant';

export function getGroqRequestTimeoutMs(): number {
  const n = Number(process.env.GROQ_TIMEOUT_MS);
  if (Number.isFinite(n) && n > 0) return n;
  // Vercel Hobby hard-caps serverless at ~10s — stay under that after search prep.
  return process.env.VERCEL ? 7_000 : 28_000;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let id: ReturnType<typeof setTimeout>;
  return new Promise((resolve, reject) => {
    id = setTimeout(() => {
      reject(Object.assign(new Error('Groq request timed out'), { name: 'AbortError' }));
    }, ms);
    promise.then(
      (v) => {
        clearTimeout(id);
        resolve(v);
      },
      (e) => {
        clearTimeout(id);
        reject(e);
      }
    );
  });
}

function groqErrorIsRetryable(error: unknown): boolean {
  const err = error as {
    status?: number;
    response?: { status?: number };
    name?: string;
    message?: string;
    error?: { message?: string };
  };
  const status = err?.status ?? err?.response?.status;
  if (status === 401 || status === 403) return false;
  if (status === 429 || status === 502 || status === 503) return true;
  if (err?.name === 'AbortError') return true;
  const msg = String(err?.message ?? err?.error?.message ?? error ?? '');
  if (/timed out|timeout/i.test(msg)) return true;
  if (/model|decommission|not found|invalid_model|does not exist|deprecated/i.test(msg))
    return true;
  return false;
}

type ChatBody = {
  messages: Groq.Chat.Completions.ChatCompletionMessageParam[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
};

/**
 * Groq chat completion with wall-clock timeout and optional fallback model.
 * Use from API routes so Vercel/hobby limits and model outages don't surface as generic 500s as often.
 */
export async function groqChatCompletion(
  client: Groq,
  body: ChatBody
): Promise<Groq.Chat.Completions.ChatCompletion> {
  const primary = body.model?.trim() || GROQ_PRIMARY_MODEL;
  const fallback = GROQ_FALLBACK_MODEL;
  const ms = getGroqRequestTimeoutMs();

  const run = (model: string) =>
    withTimeout(
      client.chat.completions.create({
        ...body,
        model,
        stream: false,
      }),
      ms
    );

  try {
    return await run(primary);
  } catch (first) {
    if (fallback !== primary && groqErrorIsRetryable(first)) {
      console.warn('[Groq] Primary model failed; retrying with fallback', {
        primary,
        fallback,
        error: (first as Error)?.message ?? first,
      });
      return await run(fallback);
    }
    throw first;
  }
}
