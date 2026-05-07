/**
 * Test the deployed SearXNG instance
 */

const testUrl = 'https://learnova-searxng.onrender.com';
const testQuery = 'current affairs today India 2025';

console.log('🧪 Testing Your Deployed SearXNG Instance\n');
console.log('URL:', testUrl);
console.log('Query:', testQuery, '\n');

try {
  const searchUrl = `${testUrl}/search?q=${encodeURIComponent(testQuery)}&format=json`;
  
  console.log('⏳ Sending request...');
  
  const response = await fetch(searchUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Thinkior AI Test',
    },
    signal: AbortSignal.timeout(15000), // 15 seconds (cold start)
  });

  console.log('Response Status:', response.status);
  console.log('Response OK:', response.ok, '\n');

  if (response.ok) {
    const data = await response.json();
    console.log('✅ Total Results:', data.results?.length || 0);
    
    if (data.results && data.results.length > 0) {
      console.log('\n📊 First 3 Results:\n');
      data.results.slice(0, 3).forEach((result, index) => {
        console.log(`${index + 1}. ${result.title}`);
        console.log(`   URL: ${result.url}`);
        console.log(`   Snippet: ${result.content?.substring(0, 120)}...\n`);
      });
      
      console.log('✅ SUCCESS! Your SearXNG instance is working perfectly!\n');
    } else {
      console.log('⚠️ No results found');
      console.log('Response:', JSON.stringify(data).substring(0, 300));
    }
  } else {
    console.log('❌ Request failed');
    const text = await response.text();
    console.log('Error:', text.substring(0, 200));
  }
} catch (error) {
  console.log('❌ Error:', error.message);
  console.log('\nThis might be a cold start issue. Try again in 30 seconds.');
}
