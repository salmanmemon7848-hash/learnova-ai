import {
  AIProviderError,
  classifyProviderFailure,
  normalizeThrownError,
} from '../types';

const TIMEOUT_MS = 10_000;

interface SearxngResult {
  title?: string;
  url?: string;
  content?: string;
  snippet?: string;
}

interface SearxngResponse {
  results?: SearxngResult[];
}

function getSearchUrl(prompt: string): string {
  const configured =
    process.env.SEARXNG_BASE_URL?.trim() ||
    process.env.SEARXNG_URL?.trim() ||
    'https://search.sapti.me/search';

  const url = configured.endsWith('/search') ? configured : `${configured.replace(/\/$/, '')}/search`;
  return `${url}?q=${encodeURIComponent(prompt)}&format=json&language=en-IN`;
}

export async function call(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(getSearchUrl(prompt), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw classifyProviderFailure('searxng', response.status, errorText);
    }

    const data = (await response.json()) as SearxngResponse;
    const results = (data.results ?? [])
      .map((result) => ({
        title: result.title?.trim() ?? '',
        url: result.url?.trim() ?? '',
        content: (result.content ?? result.snippet ?? '').trim(),
      }))
      .filter((result) => result.title && result.content)
      .slice(0, 6);

    if (results.length === 0) {
      throw new AIProviderError('searxng', 'empty_response', 'SearXNG returned no useful results');
    }

    const formatted = results
      .map((result, index) => {
        const source = result.url ? `\nSource: ${result.url}` : '';
        return `${index + 1}. ${result.title}\n${result.content}${source}`;
      })
      .join('\n\n');

    return `Here is what current web results show:\n\n${formatted}`;
  } catch (error) {
    throw normalizeThrownError('searxng', error);
  } finally {
    clearTimeout(timeout);
  }
}
