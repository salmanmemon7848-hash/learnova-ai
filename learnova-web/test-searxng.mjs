/**
 * Test SearXNG API with multiple instances
 */

const testQuery = 'current affairs today India 2025';

const instances = [
  'https://search.sapti.me',
  'https://searx.tiekoetter.com',
  'https://searx.daetalytica.io',
  'https://searx.work',
  'https://priv.au',
];

console.log('🧪 Testing Multiple SearXNG Instances\n');
console.log('Query:', testQuery, '\n');

for (const instance of instances) {
  const searchUrl = `${instance}/search?q=${encodeURIComponent(testQuery)}&format=json`;
  
  console.log(`\n🔍 Testing: ${instance}`);
  
  try {
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Learnova AI Chatbot',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.log(`   ❌ Failed: ${response.status}`);
      continue;
    }

    const data = await response.json();
    console.log(`   ✅ Success! Results: ${data.results?.length || 0}`);
    
    if (data.results && data.results.length > 0) {
      console.log(`\n   First result:`);
      console.log(`   Title: ${data.results[0].title}`);
      console.log(`   URL: ${data.results[0].url}`);
      console.log(`   Snippet: ${data.results[0].content?.substring(0, 100)}...`);
      console.log('\n   ✅ This instance works! Using it.');
      break;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}
