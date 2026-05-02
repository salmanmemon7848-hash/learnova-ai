/**
 * AI with Search — Learnova AI (Upgraded)
 *
 * Intelligent search decision engine. Used by every API route.
 * Decides whether to search, builds smart feature-specific queries,
 * fetches multi-query results, and returns formatted context string.
 *
 * Never throws — returns '' silently on any failure.
 */

import { searchWebMultiple, formatSearchContext } from './searxng';

// ── Keywords that always trigger a web search ──────────────────────────────────

const ALWAYS_SEARCH_KEYWORDS = [
  'latest', 'current', 'today', 'now', 'recent', 'new', 'update',
  'news', '2024', '2025', '2026', 'this year', 'this month',
  'abhi', 'aaj', 'naya', 'nayi', 'abhi tak', 'is saal',
  'price', 'cost', 'fee', 'salary', 'rank', 'ranking', 'cutoff',
  'result', 'date', 'deadline', 'notification', 'admit card',
  'syllabus', 'pattern', 'eligibility', 'vacancy', 'opening',
  'market size', 'funding', 'investment', 'valuation', 'revenue',
  'which college', 'best college', 'top college', 'best institute',
  'kahan se', 'konsa', 'kaisa', 'kya hai', 'batao',
];

// ── Question patterns that always need web search ──────────────────────────────

const SEARCH_REQUIRED_PATTERNS = [
  /who is (the )?(current|new|latest)/i,
  /what is the (current|latest|new|recent)/i,
  /when (is|are|was|were) the (exam|test|result|date|deadline)/i,
  /how much (does|is|are|cost|fee)/i,
  /which (college|university|institute|school|coaching)/i,
  /best (college|university|institute|coaching|school) (for|in|to)/i,
  /top (college|university|institute|school|coaching)/i,
  /\d{4} (exam|result|cutoff|syllabus|pattern|notification)/i,
  /(jee|neet|upsc|cat|clat|cuet|gate|ctet) (2024|2025|2026|cutoff|result|date|notification|syllabus)/i,
  /(startup|business|company|market) (in india|india mein)/i,
  /(salary|package|ctc|lpa) (for|of|in)/i,
  /(admission|apply|application) (process|date|form|fee)/i,
];

// ── Topics that never need web search — answer from knowledge ──────────────────

const NEVER_SEARCH_TOPICS = [
  /^(what is|explain|define|describe|tell me about) (photosynthesis|newton|gravity|ohm|pythagoras|calculus|algebra|geometry)/i,
  /^(solve|calculate|find|evaluate|simplify|prove)/i,
  /^(hi|hello|hey|hii|namaste|helo|sup|what's up|kya haal|kaise ho)/i,
  /^(thanks|thank you|shukriya|dhanyawad|theek hai|ok|okay|got it|samajh gaya)/i,
  /^\d+[\s\+\-\*\/\^\(\)]+\d+/,
];

// ── Smart search decision ──────────────────────────────────────────────────────

/**
 * Decide whether a user message warrants a web search.
 * Returns true if search is needed, false otherwise.
 */
export function shouldSearch(userMessage: string): boolean {
  if (!userMessage || userMessage.trim().length < 3) return false;

  const msg = userMessage.toLowerCase().trim();

  // Never search for these patterns
  for (const pattern of NEVER_SEARCH_TOPICS) {
    if (pattern.test(msg)) return false;
  }

  // Very short messages — only search if keyword found
  const wordCount = msg.split(/\s+/).length;
  if (wordCount < 4) {
    return ALWAYS_SEARCH_KEYWORDS.some((kw) => msg.includes(kw));
  }

  // Always search if keyword present
  if (ALWAYS_SEARCH_KEYWORDS.some((kw) => msg.includes(kw.toLowerCase()))) {
    return true;
  }

  // Always search if pattern matches
  if (SEARCH_REQUIRED_PATTERNS.some((pattern) => pattern.test(userMessage))) {
    return true;
  }

  // Search for factual questions (2+ factual pattern matches)
  const factualPatterns = [
    /\b(who|what|when|where|which|how much|how many)\b/i,
    /\b(kaun|kya|kab|kahan|kitna|kitne|konsa)\b/i,
    /\b(college|university|exam|job|career|salary|course|admission|scholarship)\b/i,
    /\b(startup|business|market|funding|investor|revenue|profit)\b/i,
    /\b(government|scheme|yojana|portal|apply|register|form)\b/i,
  ];

  const factualScore = factualPatterns.filter((p) => p.test(userMessage)).length;
  return factualScore >= 2;
}

// ── Smart query builder ────────────────────────────────────────────────────────

/**
 * Build the best search query or queries for each feature.
 */
export function buildSmartQuery(
  userMessage: string,
  feature: string,
  context?: Record<string, string>
): string[] {
  const currentYear = new Date().getFullYear();
  const base = userMessage.slice(0, 150);

  const queryMap: Record<string, string[]> = {
    'chat': [
      `${base} India ${currentYear}`,
      `${base} India information`,
    ],
    'doubt-solver': [
      `${base} India explanation example`,
      `${base} NCERT ${context?.subject || ''} ${currentYear}`,
    ],
    'exam': [
      `${context?.subject || ''} ${context?.examType || ''} ${context?.chapter || ''} MCQ questions India ${currentYear}`,
      `${context?.examType || ''} syllabus ${context?.subject || ''} India ${currentYear}`,
    ],
    'planner': [
      `${context?.examType || ''} syllabus study plan India ${currentYear}`,
      `${context?.examType || ''} preparation strategy India ${currentYear}`,
    ],
    'edufinder': [
      `best ${context?.field || ''} colleges India ${context?.budget || ''} ${currentYear} NIRF`,
      `${context?.field || ''} admission India ${currentYear} eligibility fees`,
    ],
    'career-guide': [
      `${base} career India ${currentYear} salary scope`,
      `${base} jobs India ${currentYear} opportunities`,
    ],
    'business-ideas': [
      `${context?.industry || base} startup India market opportunity ${currentYear}`,
      `${context?.industry || base} business India ${currentYear} trends`,
    ],
    'validate': [
      `${base} market India ${currentYear} competitors`,
      `${base} India demand customers ${currentYear}`,
    ],
    'pitch-deck': [
      `${context?.industry || base} startup India funding ${currentYear}`,
      `${context?.industry || base} India investor pitch ${currentYear}`,
    ],
    'interview': [
      `${context?.role || base} interview questions India ${currentYear}`,
      `${context?.role || base} interview preparation tips India`,
    ],
    'writer': [
      `${base} India ${currentYear}`,
    ],
  };

  return queryMap[feature] || [`${base} India ${currentYear}`];
}

// ── Main function — used by every API route ────────────────────────────────────

/**
 * Decide, fetch, and format web search context for any AI feature.
 * Returns empty string if search is not needed or fails — never throws.
 */
export async function getSearchContext(
  userMessage: string,
  feature: string,
  context?: Record<string, string>
): Promise<string> {
  try {
    // Step 1: Decide if search is needed
    const needsSearch = shouldSearch(userMessage);

    if (!needsSearch) {
      console.log(
        `[Search] Skipped for: "${userMessage.slice(0, 50)}..." (not needed)`
      );
      return '';
    }

    console.log(
      `[Search] Triggered for feature: ${feature}, query: "${userMessage.slice(0, 50)}..."`
    );

    // Step 2: Build smart queries
    const queries = buildSmartQuery(userMessage, feature, context);

    // Step 3: Fetch results
    const results = await searchWebMultiple(queries, 3);

    if (!results || results.length === 0) {
      console.log('[Search] No results returned — continuing without search context');
      return '';
    }

    console.log(`[Search] Got ${results.length} results`);

    // Step 4: Format and return
    return formatSearchContext(results, queries[0]);
  } catch (error) {
    console.warn('[Search] getSearchContext failed silently:', error);
    return '';
  }
}

// ── Search usage instruction builder ──────────────────────────────────────────

/**
 * Return the search usage instruction block to append to every system prompt.
 * Tells the AI exactly how to use (or not use) the search context.
 */
export function buildSearchUsageInstruction(searchContext: string): string {
  if (searchContext) {
    return `
SEARCH RESULT USAGE RULES:
- You have been given live web search results above
- Use this data to give accurate, current answers
- For facts, statistics, dates, prices, rankings — prefer the search data over your training
- Never copy paste from search results — synthesize and explain in your own words
- Never mention URLs or say "according to the website" — say "recent data shows" or "currently"
- If search results contradict each other, mention the most credible or recent one
- If search results are not relevant to the question, ignore them and answer from your knowledge
- Always answer the user's actual question — don't just summarize search results
`;
  }

  return `
NOTE: No web search was performed for this query. Answer from your knowledge base.
If your knowledge might be outdated for this topic, mention it briefly and suggest the user verify from official sources.
`;
}

// ── Legacy compatibility shim ──────────────────────────────────────────────────
// Keeps older routes that still call askAIWithSearch working without changes.

export interface AskAIWithSearchOptions {
  userMessage: string;
  systemPrompt: string;
  needsSearch?: boolean;
}

export interface AskAIWithSearchResult {
  finalSystemPrompt: string;
  usedSearch: boolean;
}

/**
 * @deprecated Use getSearchContext() directly in new routes.
 * Kept for backward compatibility with routes not yet migrated.
 */
export async function askAIWithSearch({
  userMessage,
  systemPrompt,
  needsSearch,
}: AskAIWithSearchOptions): Promise<AskAIWithSearchResult> {
  const doSearch = needsSearch !== undefined ? needsSearch : shouldSearch(userMessage);

  if (!doSearch) {
    return { finalSystemPrompt: systemPrompt, usedSearch: false };
  }

  try {
    const { searchWeb, formatSearchContext: fmt } = await import('./searxng');
    const results = await searchWeb(userMessage);

    if (results.length > 0) {
      const ctx = fmt(results, userMessage);
      const usageInstruction = buildSearchUsageInstruction(ctx);
      console.log(`[SearXNG] ✅ ${results.length} results for: "${userMessage.slice(0, 70)}"`);
      return {
        finalSystemPrompt: `${systemPrompt}\n\n${ctx}\n\n${usageInstruction}`,
        usedSearch: true,
      };
    }

    console.log(`[SearXNG] ℹ️  No results — AI using own knowledge`);
    return {
      finalSystemPrompt: `${systemPrompt}\n\n${buildSearchUsageInstruction('')}`,
      usedSearch: false,
    };
  } catch {
    console.warn('[SearXNG] ⚠️  Search failed silently, continuing without web context');
    return { finalSystemPrompt: systemPrompt, usedSearch: false };
  }
}
