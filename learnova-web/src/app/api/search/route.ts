/**
 * /api/search — SearXNG proxy route
 *
 * Proxies search requests to your SearXNG instance server-side.
 * This keeps SEARXNG_URL out of the frontend bundle and avoids CORS issues.
 *
 * POST body: { query: string }
 * Response:  { results: SearXNGResult[] }
 */

import { searchWeb } from '@/lib/searxng';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return Response.json({ error: 'query is required' }, { status: 400 });
    }

    const results = await searchWeb(query);
    return Response.json({ results });
  } catch {
    return Response.json({ results: [] });
  }
}
