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
import { sanitizeJsonPostBody, sanitizeString } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    let rawBody: unknown = {};
    try {
      rawBody = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = sanitizeJsonPostBody(rawBody, ['query'], 8000);
    if (!parsed.ok) return parsed.response;

    // SECURITY: Sanitize user input to prevent XSS and injection attacks
    // OWASP Reference: A03:2021 Injection
    const query = sanitizeString(parsed.body.query, 2000);

    if (!query || typeof query !== 'string') {
      return Response.json({ error: 'query is required' }, { status: 400 });
    }

    const results = await searchWeb(query);
    return Response.json({ results });
  } catch {
    return Response.json({ results: [] });
  }
}
