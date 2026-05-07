/**
 * Intelligent Web Search System
 * 
 * Implements Claude-style smart search behavior:
 * - Only searches when necessary
 * - Stays fast for normal queries
 * - Uses web data only for real-time or unknown information
 */

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

/**
 * Smart decision system: Should we search the web?
 * 
 * Returns true ONLY if web search is needed for real-time/dynamic information
 * Returns false for general knowledge, math, coding, etc.
 */
export function shouldSearch(query: string): boolean {
  const normalizedQuery = query.toLowerCase().trim();

  // Keywords that indicate need for real-time data
  const realTimeKeywords = [
    'latest', 'news', 'today', 'recent', 'update', 'updated',
    '2025', '2026', 'current', 'current affairs', 'new', 'breaking',
    'price', 'stock', 'weather', 'score', 'results',
    'election', 'trending', 'viral', 'just happened',
    'what happened', 'what is happening', 'now',
    'this week', 'this month', 'this year',
    'affairs', 'headline', 'headlines',
  ];

  // Keywords that indicate we DON'T need search
  // (only for specific patterns, not generic "what is")
  const noSearchKeywords = [
    // Math calculations
    'calculate', 'solve', 'equation', 'math', 'formula',
    'how to calculate', 'find the',
    
    // Coding questions
    'code', 'programming', 'function', 'algorithm',
    'write a', 'create a function', 'how to code',
    'javascript', 'python', 'typescript', 'react',
    
    // General knowledge (specific static topics)
    'what is ai', 'what is machine learning',
    'define', 'explain', 'meaning of',
    'history of', 'who invented', 'when was',
    
    // Creative/analytical tasks
    'write an', 'create an', 'generate',
    'analyze', 'compare', 'discuss',
    'help me with', 'give me tips',
  ];

  // First, check for real-time keywords (higher priority)
  const hasRealTimeKeyword = realTimeKeywords.some(keyword =>
    normalizedQuery.includes(keyword.toLowerCase())
  );

  // If it has real-time keywords, ALWAYS search
  if (hasRealTimeKeyword) {
    return true;
  }

  // Then check if query contains no-search keywords
  const hasNoSearchKeyword = noSearchKeywords.some(keyword =>
    normalizedQuery.includes(keyword.toLowerCase())
  );

  // If it has no-search keywords (and no real-time keywords), skip search
  if (hasNoSearchKeyword) {
    return false;
  }

  // Default: Don't search (stay fast for normal queries)
  return false;
}

/**
 * Search the web using multiple strategies
 * 
 * Returns top 5 results with title, url, and snippet
 * Gracefully handles errors - returns empty array on failure
 */
export async function searchWeb(query: string): Promise<SearchResult[]> {
  // Use your deployed SearXNG instance first, then fallback to public instances
  const primaryInstance = (process.env.SEARXNG_URL || 'https://search.sapti.me/search')
    .replace('/search', ''); // strip /search — this array appends it below
  const searxngInstances = [
    primaryInstance,            // Your deployed instance (from env)
    'https://search.sapti.me',
    'https://searx.tiekoetter.com',
    'https://searx.daetalytica.io',
    'https://search.onon.si',
    'https://etools.ch',
    'https://searx.orgfree.com',
    'https://searx.prvcy.eu',
  ];

  for (const instance of searxngInstances) {
    try {
      const searchUrl = `${instance}/search?q=${encodeURIComponent(query)}&format=json`;
      
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Thinkior AI Chatbot',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const results = (data.results || [])
        .slice(0, 5)
        .map((result: any) => ({
          title: result.title || '',
          url: result.url || '',
          snippet: result.content || '',
        }))
        .filter((result: SearchResult) => result.title && result.snippet);

      if (results.length > 0) {
        return results;
      }
    } catch (error) {
      continue;
    }
  }

  // All instances failed
  console.warn('⚠️ All web search instances failed, using AI knowledge');
  return [];
}

/**
 * Format search results for AI prompt
 * 
 * Creates a clean, readable format for the AI to understand
 */
export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No web search results available.';
  }

  return results
    .map((result, index) => {
      return `${index + 1}. ${result.title}
   URL: ${result.url}
   Snippet: ${result.snippet}`;
    })
    .join('\n\n');
}

/**
 * Get reasoning for why search was/wasn't performed
 * Useful for logging and debugging
 */
export function getSearchReason(query: string): string {
  const willSearch = shouldSearch(query);

  if (willSearch) {
    return 'Query contains real-time/dynamic keywords';
  }

  return 'Query appears to be general knowledge, math, or coding';
}
