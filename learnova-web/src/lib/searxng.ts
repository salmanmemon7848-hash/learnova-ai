/**
 * SearXNG Search Utility — Learnova AI
 *
 * Dedicated utility for your SearXNG instance.
 * URL is read from SEARXNG_URL environment variable.
 * Falls back to the hardcoded URL if env var is missing.
 *
 * Never throws — returns [] silently on any failure.
 */

const SEARXNG_URL =
  process.env.SEARXNG_URL ||
  'https://learnova-searxng.onrender.com/search';

export interface SearXNGResult {
  title: string;
  url: string;
  content: string;
}

/**
 * Fetch the top 5 results from your SearXNG instance.
 * Returns an empty array silently on any failure — never crashes the caller.
 */
export async function searchWeb(query: string): Promise<SearXNGResult[]> {
  try {
    const url = `${SEARXNG_URL}?q=${encodeURIComponent(query)}&format=json`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Learnova AI',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const results: SearXNGResult[] = (data.results || [])
      .slice(0, 5)
      .map((r: any) => ({
        title: r.title || '',
        url: r.url || '',
        content: r.content || '',
      }))
      .filter((r: SearXNGResult) => r.title && r.content);

    return results;
  } catch {
    // Search failed silently — AI will answer from its own knowledge
    return [];
  }
}

/**
 * Format search results into a clean prompt context block.
 */
export function formatSearchContext(results: SearXNGResult[]): string {
  if (results.length === 0) return '';

  return (
    `Here is relevant information from the web to help you answer:\n\n` +
    results
      .map((r, i) => `[${i + 1}] ${r.title}\n${r.content}\nSource: ${r.url}`)
      .join('\n\n') +
    `\n\nUse this information to give an accurate, up-to-date answer. Always prefer this context over your training data when it is relevant.`
  );
}
