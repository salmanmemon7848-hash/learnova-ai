/**
 * AI with Search — Learnova AI
 *
 * Core helper that enriches any AI system prompt with live SearXNG
 * web search results before the AI model is called.
 *
 * Used by every AI feature route except /api/chat (which has its own
 * search integration via webSearch.ts).
 *
 * Smart skip logic avoids unnecessary search requests for:
 *   - Short messages (< 4 words)
 *   - Greetings / filler messages
 *   - Format / rewrite / summarize tasks where user provides their own text
 */

import { searchWeb, formatSearchContext } from './searxng';

// ------------------------------------------------------------------
// Smart search decision
// ------------------------------------------------------------------

const GREETING_PATTERN =
  /^(hi|hello|hey|thanks|thank you|okay|ok|sure|bye|good morning|good night|good evening|namaste|hii|helo)\b/i;

const FORMAT_PREFIXES = [
  'rewrite this',
  'rewrite the',
  'format this',
  'format the',
  'summarize this',
  'summarize the',
  'paraphrase this',
  'paraphrase the',
  'edit this',
  'edit the',
  'fix my',
  'correct my',
  'improve my',
  'rephrase this',
  'rephrase the',
  'translate this',
  'translate the',
];

function shouldSkipSearch(userMessage: string): boolean {
  const trimmed = userMessage.trim();

  // Too short to be a meaningful factual query
  if (trimmed.split(/\s+/).length < 4) return true;

  // Greetings
  if (GREETING_PATTERN.test(trimmed)) return true;

  // Format / rewrite / summarize — user already provided the content
  const lower = trimmed.toLowerCase();
  if (FORMAT_PREFIXES.some((prefix) => lower.includes(prefix))) return true;

  return false;
}

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export interface AskAIWithSearchOptions {
  /** The user's message, question, or topic used as the search query */
  userMessage: string;
  /** The original system prompt for this AI feature */
  systemPrompt: string;
  /**
   * Override the automatic search decision.
   * - `true`  → always search
   * - `false` → never search
   * - omit   → auto-decide based on the message content
   */
  needsSearch?: boolean;
}

export interface AskAIWithSearchResult {
  /** The enriched system prompt (original + web context appended if available) */
  finalSystemPrompt: string;
  /** Whether a web search was actually performed and returned results */
  usedSearch: boolean;
}

// ------------------------------------------------------------------
// Core function
// ------------------------------------------------------------------

/**
 * Enrich a system prompt with live SearXNG web search results.
 *
 * Usage:
 *   const { finalSystemPrompt } = await askAIWithSearch({ userMessage, systemPrompt });
 *   // Pass finalSystemPrompt to Groq instead of the original systemPrompt
 */
export async function askAIWithSearch({
  userMessage,
  systemPrompt,
  needsSearch,
}: AskAIWithSearchOptions): Promise<AskAIWithSearchResult> {
  // Determine whether to search
  const doSearch =
    needsSearch !== undefined ? needsSearch : !shouldSkipSearch(userMessage);

  if (!doSearch) {
    return { finalSystemPrompt: systemPrompt, usedSearch: false };
  }

  let searchContext = '';
  let usedSearch = false;

  try {
    const results = await searchWeb(userMessage);

    if (results.length > 0) {
      searchContext = formatSearchContext(results);
      usedSearch = true;
      console.log(
        `[SearXNG] ✅ ${results.length} results for: "${userMessage.slice(0, 70)}"`
      );
    } else {
      console.log(
        `[SearXNG] ℹ️  No results — AI using own knowledge for: "${userMessage.slice(0, 70)}"`
      );
    }
  } catch {
    // Search failed silently — AI continues with its own knowledge
    console.warn('[SearXNG] ⚠️  Search failed silently, continuing without web context');
  }

  const finalSystemPrompt = searchContext
    ? `${systemPrompt}\n\n${searchContext}`
    : systemPrompt;

  return { finalSystemPrompt, usedSearch };
}
