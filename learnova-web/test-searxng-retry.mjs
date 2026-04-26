/**
 * Test SearXNG instance with retry logic
 */

const testUrl = 'https://learnova-searxng.onrender.com';

console.log('🧪 Testing SearXNG with Retries\n');
console.log('URL:', testUrl, '\n');

// First, test the homepage
console.log('Test 1: Checking if service is alive...');
try {
  const homepageResponse = await fetch(testUrl, {
    signal: AbortSignal.timeout(20000),
  });
  
  console.log('Homepage Status:', homepageResponse.status);
  
  if (homepageResponse.status === 200) {
    console.log('✅ Service is running!\n');
  } else {
    console.log('⚠️ Service might be starting up...\n');
  }
} catch (error) {
  console.log('❌ Cannot reach service:', error.message);
  console.log('\n💡 This is normal for Render free tier - it sleeps after 15 min of inactivity');
  console.log('💡 Wait 30-60 seconds and try again\n');
}

// Test the search API
console.log('\nTest 2: Testing search API...');
const testQuery = 'latest news';

try {
  const searchUrl = `${testUrl}/search?q=${encodeURIComponent(testQuery)}&format=json`;
  
  const response = await fetch(searchUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    signal: AbortSignal.timeout(20000),
  });

  console.log('Search API Status:', response.status);

  if (response.ok) {
    const data = await response.json();
    console.log('✅ Results:', data.results?.length || 0);
    
    if (data.results && data.results.length > 0) {
      console.log('\n✅ SUCCESS! Your instance works!\n');
      console.log('First result:', data.results[0].title);
    }
  } else {
    const text = await response.text();
    console.log('Response:', text.substring(0, 100));
  }
} catch (error) {
  console.log('❌ Error:', error.message);
}
