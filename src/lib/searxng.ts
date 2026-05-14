/**
 * SearXNG Search Utility — Thinkior AI (Upgraded)
 *
 * Intelligent search with multi-query support, quality logging,
 * and Render cold-start warmup ping.
 *
 * Never throws — returns [] silently on any failure.
 */

const SEARXNG_URL =
  process.env.SEARXNG_URL || 'https://search.sapti.me/search';

const SEARCH_FETCH_TIMEOUT_MS =
  Number(process.env.SEARXNG_TIMEOUT_MS) || (process.env.VERCEL ? 3500 : 8000);

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score?: number;
  category?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  totalResults: number;
  searchedAt: string;
}

// ── Core search function ───────────────────────────────────────────────────────

/**
 * Fetch results from SearXNG with an 8-second timeout.
 * Returns empty array silently on any failure — never crashes the caller.
 */
export async function searchWeb(
  query: string,
  maxResults: number = 5
): Promise<SearchResult[]> {
  try {
    const url = `${SEARXNG_URL}?q=${encodeURIComponent(query)}&format=json&language=en-IN`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SEARCH_FETCH_TIMEOUT_MS);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`SearXNG returned ${res.status} for query: ${query}`);
      return [];
    }

    const data = await res.json();
    const results = data.results || [];

    return results
      .slice(0, maxResults)
      .map((r: any) => ({
        title: r.title || '',
        url: r.url || '',
        content: r.content || r.snippet || '',
        score: r.score || 0,
        category: r.category || 'general',
      }))
      .filter((r: SearchResult) => r.title && r.content);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn('SearXNG search timed out for query:', query);
    } else {
      console.warn('SearXNG search failed:', error.message);
    }
    return [];
  }
}

// ── Format context for AI injection ───────────────────────────────────────────

/**
 * Format search results into a clean context string for AI prompt injection.
 */
export function formatSearchContext(
  results: SearchResult[],
  query: string
): string {
  if (!results || results.length === 0) return '';

  const formatted = results
    .map(
      (r, i) =>
        `[Source ${i + 1}] ${r.title}\n${r.content}\nURL: ${r.url}`
    )
    .join('\n\n');

  return `LIVE WEB SEARCH RESULTS for "${query}":\n\n${formatted}\n\nUse the above search results to provide accurate, current information. Prioritize this data over your training knowledge when they conflict. Never cite URLs directly in your response — instead say "according to recent data" or "current information shows".`;
}

// ── Multi-query search ─────────────────────────────────────────────────────────

/**
 * Run multiple searches in parallel and combine deduplicated results.
 */
export async function searchWebMultiple(
  queries: string[],
  maxResultsPerQuery: number = 3
): Promise<SearchResult[]> {
  const allResults = await Promise.allSettled(
    queries.map((q) => searchWeb(q, maxResultsPerQuery))
  );

  const combined: SearchResult[] = [];
  const seenUrls = new Set<string>();

  for (const result of allResults) {
    if (result.status === 'fulfilled') {
      for (const r of result.value) {
        if (!seenUrls.has(r.url)) {
          seenUrls.add(r.url);
          combined.push(r);
        }
      }
    }
  }

  return combined;
}

// ── Search quality logging ─────────────────────────────────────────────────────

/**
 * Search with performance logging for debugging and monitoring.
 */
export async function searchWithLogging(
  query: string,
  feature: string,
  maxResults: number = 5
): Promise<{ results: SearchResult[]; tookMs: number; success: boolean }> {
  const start = Date.now();

  try {
    const results = await searchWeb(query, maxResults);
    const tookMs = Date.now() - start;

    console.log(
      `[SearXNG] Feature: ${feature} | Query: "${query.slice(0, 60)}" | Results: ${results.length} | Time: ${tookMs}ms`
    );

    return { results, tookMs, success: true };
  } catch (error) {
    const tookMs = Date.now() - start;
    console.error(
      `[SearXNG] FAILED | Feature: ${feature} | Query: "${query}" | Time: ${tookMs}ms | Error:`,
      error
    );
    return { results: [], tookMs, success: false };
  }
}

// ── Render cold-start warmup ───────────────────────────────────────────────────

/**
 * Ping SearXNG on module load to wake it up from Render free-tier sleep.
 * Runs once per server process lifetime.
 */
let warmedUp = false;
export async function warmupSearXNG(): Promise<void> {
  if (warmedUp) return;
  try {
    const url = `${SEARXNG_URL}?q=ping&format=json`;
    await fetch(url, { signal: AbortSignal.timeout(10000) });
    warmedUp = true;
    console.log('[SearXNG] Warmup ping sent successfully');
  } catch {
    console.warn('[SearXNG] Warmup ping failed — will retry on first search');
  }
}

// Optional: call warmupSearXNG() from a cron or first-search path if needed.
// Avoid firing fetch on every serverless cold start (adds noise and can race with the first user request).
