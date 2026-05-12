// src/lib/generalChatAI.ts
// Triple fallback AI system for General Chat
// Groq → Gemini → OpenAI — switches instantly on failure

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GeneralChatResult {
  text: string;
  provider: 'groq' | 'gemini' | 'openai' | 'failed';
  searchUsed: boolean;
  searchQuery?: string;
}

// ── SEARCH DECISION ───────────────────────────────────────────────────────
// Keywords and patterns that trigger web search
const SEARCH_TRIGGERS = [
  // Explicit search requests
  /search (for|about|the|on)/i,
  /look up/i,
  /find (out|information|news|data)/i,
  /latest|current|recent|today|now|this week|this month|this year/i,
  /news about|trending|breaking/i,
  // Time-sensitive queries
  /2024|2025|2026/i,
  /price of|cost of|how much (is|does|do|are)/i,
  /who (is|are|was|were) (the )?(current|new|latest|president|pm|ceo|founder)/i,
  /what (is|are) (the )?(current|latest|new)/i,
  /when (is|are|was) (the )?(next|latest|upcoming|recent)/i,
  // Sports, events, stocks
  /score|result|match|election|stock|share price|ipl|cricket|football/i,
  // Weather
  /weather (in|at|today|tomorrow|forecast)/i,
];

const NEVER_SEARCH = [
  /^(hi|hello|hey|hii|namaste|helo|what'?s up|good morning|good night)/i,
  /^(thanks|thank you|shukriya|ok|okay|got it|understood|great|nice)/i,
  /^(who are you|what are you|what can you do|help me|tell me about yourself)/i,
  /^[\d\s\+\-\*\/\(\)=]+$/, // pure math
  /write (a|an|the|me|some)/i, // creative writing — no search needed
  /explain (how|what|why|the)/i, // concept explanation
];

export function shouldSearchWeb(message: string): boolean {
  const msg = message.trim();

  // Never search for these
  if (NEVER_SEARCH.some(p => p.test(msg))) return false;

  // Very short messages — don't search unless trigger keyword found
  if (msg.split(/\s+/).length < 4) {
    return SEARCH_TRIGGERS.some(p => p.test(msg));
  }

  // Check search triggers
  return SEARCH_TRIGGERS.some(p => p.test(msg));
}

export function buildSearchQuery(message: string): string {
  // Clean the message into a good search query
  const cleaned = message
    .replace(/^(can you |please |could you |i want to know |tell me )/i, '')
    .replace(/\?+$/, '')
    .trim();

  // Add current year for time-sensitive queries
  const needsYear = /latest|current|recent|today|now|price|news|score/i.test(message);
  const year = new Date().getFullYear();

  return needsYear ? `${cleaned} ${year}` : cleaned;
}

// ── WEB SEARCH ────────────────────────────────────────────────────────────
async function fetchSearchContext(query: string): Promise<string> {
  const searxngUrl = process.env.SEARXNG_URL || 'https://learnova-searxng.onrender.com/search';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      `${searxngUrl}?q=${encodeURIComponent(query)}&format=json&language=en-IN`,
      { signal: controller.signal, headers: { 'Accept': 'application/json' } }
    );

    clearTimeout(timeout);

    if (!res.ok) return '';

    const data = await res.json();
    const results = (data.results || []).slice(0, 5);

    if (results.length === 0) return '';

    const context = results
      .map((r: any, i: number) => `[${i + 1}] ${r.title}\n${r.content || r.snippet || ''}\nSource: ${r.url}`)
      .join('\n\n');

    console.log(`[Search] Found ${results.length} results for: "${query}"`);
    return `LIVE WEB SEARCH RESULTS for "${query}":\n\n${context}\n\nUse this information to answer accurately. Never cite URLs directly — say "according to recent data" or "current information shows".`;

  } catch (err: any) {
    if (err.name === 'AbortError') console.warn('[Search] SearXNG timed out');
    else console.warn('[Search] SearXNG failed:', err.message);
    return '';
  }
}

// ── GROQ CALL ─────────────────────────────────────────────────────────────
async function callGroq(messages: AIMessage[], maxTokens: number): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: maxTokens,
        temperature: 0.7,
        messages,
      }),
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Groq ${res.status}: ${err.slice(0, 100)}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    if (!text.trim()) throw new Error('Groq returned empty response');

    console.log('[AI] Groq succeeded');
    return text;

  } catch (err: any) {
    clearTimeout(timeout);
    const reason = err.name === 'AbortError' ? 'Groq timed out' : err.message;
    console.warn(`[AI] Groq failed: ${reason}`);
    throw new Error(reason);
  }
}

// ── GEMINI CALL ───────────────────────────────────────────────────────────
async function callGemini(messages: AIMessage[], maxTokens: number): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error('Gemini API key not configured');

  const model = process.env.GOOGLE_AI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Convert to Gemini format
  const systemMessages = messages.filter(m => m.role === 'system');
  const chatMessages = messages.filter(m => m.role !== 'system');
  const systemText = systemMessages.map(m => m.content).join('\n\n');

  const contents = chatMessages.map((m, i) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{
      text: i === 0 && systemText ? `${systemText}\n\n---\n\n${m.content}` : m.content,
    }],
  }));

  // Ensure starts with user
  if (contents.length > 0 && contents[0].role === 'model') {
    contents.unshift({ role: 'user', parts: [{ text: 'Continue.' }] });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents,
        generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      }),
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini ${res.status}: ${err.slice(0, 100)}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text.trim()) throw new Error('Gemini returned empty response');

    console.log('[AI] Gemini succeeded');
    return text;

  } catch (err: any) {
    clearTimeout(timeout);
    const reason = err.name === 'AbortError' ? 'Gemini timed out' : err.message;
    console.warn(`[AI] Gemini failed: ${reason}`);
    throw new Error(reason);
  }
}

// ── OPENAI CALL ───────────────────────────────────────────────────────────
async function callOpenAI(messages: AIMessage[], maxTokens: number): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'gpt-4o-mini', // cheapest capable model
        max_tokens: maxTokens,
        temperature: 0.7,
        messages,
      }),
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI ${res.status}: ${err.slice(0, 100)}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    if (!text.trim()) throw new Error('OpenAI returned empty response');

    console.log('[AI] OpenAI succeeded');
    return text;

  } catch (err: any) {
    clearTimeout(timeout);
    const reason = err.name === 'AbortError' ? 'OpenAI timed out' : err.message;
    console.warn(`[AI] OpenAI failed: ${reason}`);
    throw new Error(reason);
  }
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────
export async function runGeneralChat(
  messages: AIMessage[],
  userMessage: string,
  maxTokens: number = 1500
): Promise<GeneralChatResult> {

  // Step 1 — Decide if web search is needed
  const needsSearch = shouldSearchWeb(userMessage);
  let searchContext = '';
  let searchQuery = '';

  if (needsSearch) {
    searchQuery = buildSearchQuery(userMessage);
    console.log(`[Search] Triggered for: "${searchQuery}"`);
    searchContext = await fetchSearchContext(searchQuery);
  } else {
    console.log(`[Search] Skipped for: "${userMessage.slice(0, 50)}..."`);
  }

  // Step 2 — Build final messages with search context injected into system prompt
  const finalMessages: AIMessage[] = messages.map((m) => {
    if (m.role === 'system' && searchContext) {
      return {
        ...m,
        content: `${m.content}\n\n${searchContext}`,
      };
    }
    return m;
  });

  // Step 3 — Try Groq → Gemini → OpenAI in sequence
  // Try Groq first
  try {
    const text = await callGroq(finalMessages, maxTokens);
    return { text, provider: 'groq', searchUsed: needsSearch, searchQuery };
  } catch (groqErr) {
    console.warn('[AI] Groq failed — trying Gemini...');
  }

  // Try Gemini
  try {
    const text = await callGemini(finalMessages, maxTokens);
    return { text, provider: 'gemini', searchUsed: needsSearch, searchQuery };
  } catch (geminiErr) {
    console.warn('[AI] Gemini failed — trying OpenAI...');
  }

  // Try OpenAI
  try {
    const text = await callOpenAI(finalMessages, maxTokens);
    return { text, provider: 'openai', searchUsed: needsSearch, searchQuery };
  } catch (openaiErr) {
    console.error('[AI] All 3 providers failed');
  }

  // All failed
  return {
    text: '',
    provider: 'failed',
    searchUsed: needsSearch,
    searchQuery,
  };
}
