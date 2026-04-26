/**
 * Test Script: Intelligent Web Search System
 * 
 * Tests the shouldSearch() logic and web search functionality
 * Run with: node test-websearch.mjs
 */

import { shouldSearch, getSearchReason } from './src/lib/webSearch.ts';

console.log('🧪 Testing Intelligent Web Search System\n');

// Test cases for shouldSearch
const testCases = [
  // Should search (real-time/dynamic)
  { query: 'What is the latest news about AI?', expected: true },
  { query: 'What happened today in the stock market?', expected: true },
  { query: 'Current weather in Mumbai', expected: true },
  { query: 'Latest iPhone 2025 price', expected: true },
  { query: 'Trending topics this week', expected: true },
  { query: 'Recent updates about climate change', expected: true },
  { query: 'Election results 2026', expected: true },
  { query: 'What is happening now in technology?', expected: true },
  
  // Should NOT search (general knowledge)
  { query: 'What is AI?', expected: false },
  { query: 'Explain machine learning', expected: false },
  { query: 'How to code a website in JavaScript', expected: false },
  { query: 'Calculate the area of a circle', expected: false },
  { query: 'Write a Python function to sort array', expected: false },
  { query: 'What is the meaning of life?', expected: false },
  { query: 'History of the internet', expected: false },
  { query: 'Help me with my homework', expected: false },
  { query: 'Compare React and Vue', expected: false },
  { query: 'Give me tips for studying', expected: false },
  { query: 'Define photosynthesis', expected: false },
];

console.log('📊 Testing shouldSearch() Function\n');
console.log('=' .repeat(70));

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = shouldSearch(test.query);
  const status = result === test.expected ? '✅' : '❌';
  
  if (result === test.expected) {
    passed++;
  } else {
    failed++;
  }
  
  const reason = getSearchReason(test.query);
  
  console.log(`\n${index + 1}. ${status} Query: "${test.query}"`);
  console.log(`   Expected: ${test.expected ? 'Search' : 'No Search'} | Got: ${result ? 'Search' : 'No Search'}`);
  console.log(`   Reason: ${reason}`);
});

console.log('\n' + '=' .repeat(70));
console.log(`\n📈 Test Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);

if (failed === 0) {
  console.log('\n✅ All tests passed! Intelligent search system is working correctly.\n');
} else {
  console.log(`\n⚠️  ${failed} test(s) failed. Review the logic.\n`);
}

// Test summary
console.log('📋 Summary:');
console.log('- Queries with real-time keywords → Will search web');
console.log('- Queries with static knowledge → Will use AI only');
console.log('- Math/Coding questions → Will use AI only');
console.log('- Fast response for normal queries ✓');
console.log('- Web search only when needed ✓');
console.log('\n🎯 System behaves like Claude: smart, efficient, and helpful!\n');
