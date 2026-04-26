/**
 * Test the complete current affairs flow
 */

import { shouldSearch, searchWeb, formatSearchResults } from './src/lib/webSearch.ts';
import Groq from 'groq-sdk';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: join(__dirname, '.env.local') });

const query = 'give me todays current affairs';

console.log('🧪 Testing Complete Current Affairs Flow\n');
console.log('Query:', query, '\n');

// Step 1: Check if search should be triggered
console.log('Step 1: Should search?');
const willSearch = shouldSearch(query);
console.log('Result:', willSearch ? '✅ YES' : '❌ NO', '\n');

if (!willSearch) {
  console.log('❌ Search not triggered - this is the problem!');
  process.exit(1);
}

// Step 2: Perform web search
console.log('Step 2: Performing web search...');
const results = await searchWeb(query);
console.log('Results count:', results.length);

if (results.length === 0) {
  console.log('❌ No search results - this is the problem!');
  process.exit(1);
}

console.log('✅ Search successful\n');
console.log('First 3 results:');
results.slice(0, 3).forEach((r, i) => {
  console.log(`${i + 1}. ${r.title}`);
  console.log(`   ${r.snippet.substring(0, 120)}...\n`);
});

// Step 3: Format results
console.log('Step 3: Formatted results (first 300 chars):');
const formatted = formatSearchResults(results);
console.log(formatted.substring(0, 300), '\n');

// Step 4: Test AI response with Groq
console.log('Step 4: Testing AI response with Groq...\n');

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  console.log('❌ GROQ_API_KEY not set in environment');
  process.exit(1);
}

const groqClient = new Groq({ apiKey });

const systemPrompt = `You are Learnova AI — a smart, friendly study and business companion for Indian students and young entrepreneurs.

## ⚠️ CRITICAL INSTRUCTION - READ CAREFULLY:
You currently have REAL-TIME web search data below. This is LIVE, CURRENT information from the internet.

**YOU MUST USE THIS DATA TO ANSWER THE USER'S QUESTION.**

**DO NOT say:**
- "I don't have access to real-time information"
- "I can't browse the internet"
- "I don't have access to current news"
- "As an AI, I don't have real-time data"
- "I recommend checking news websites"

**YOU MUST:**
- Use the web search results below to provide CURRENT, SPECIFIC answers
- Mention actual news headlines, dates, and details from the search results
- Sound informed and up-to-date
- Cite sources when using web data (mention URLs or source names)
- If the user asks about "today" or "current affairs", use the ACTUAL current information from the web search

## REAL-TIME WEB SEARCH DATA (CURRENT & UP-TO-DATE):
${formatted}

## HOW TO USE THIS DATA:
1. The web data above is CURRENT and REAL-TIME
2. Answer the user's question using SPECIFIC details from this data
3. If asked about current affairs/news, list the ACTUAL headlines from the search results
4. Be confident - you HAVE the information, just use it
5. Provide dates, names, and specific details from the web search
6. If web data conflicts with your training data, PREFER the web data (it's more recent)`;

const messages = [
  { role: 'system', content: systemPrompt },
  { role: 'user', content: query }
];

console.log('Sending request to Groq AI...');
const response = await groqClient.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages,
  max_tokens: 2048,
  temperature: 0.7,
});

const aiResponse = response.choices[0]?.message?.content || '';

console.log('\n🤖 AI Response:\n');
console.log('='.repeat(60));
console.log(aiResponse);
console.log('='.repeat(60));

// Check if response contains the problematic phrases
const problematicPhrases = [
  "I don't have access",
  "I can't browse",
  "I don't have real-time",
  "I recommend checking",
  "As an AI",
];

const hasProblematicPhrase = problematicPhrases.some(phrase => 
  aiResponse.toLowerCase().includes(phrase.toLowerCase())
);

if (hasProblematicPhrase) {
  console.log('\n❌ PROBLEM: AI is still using fallback responses!');
  console.log('The AI is ignoring the web search data.');
} else {
  console.log('\n✅ SUCCESS: AI is using web search data correctly!');
}
