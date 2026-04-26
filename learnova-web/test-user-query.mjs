/**
 * Test the exact user query
 */

import { shouldSearch, getSearchReason } from './src/lib/webSearch.ts';

const testQueries = [
  'give me cureent affairs of today',
  'give me current affairs of today',
  'current affairs today',
  'what are the current affairs',
  'tell me today news',
  'latest news today',
];

console.log('🧪 Testing User Query Variations\n');
console.log('=' .repeat(70));

testQueries.forEach((query, index) => {
  const result = shouldSearch(query);
  const reason = getSearchReason(query);
  
  console.log(`\n${index + 1}. ${result ? '✅' : '❌'} "${query}"`);
  console.log(`   Will search: ${result ? 'YES' : 'NO'}`);
  console.log(`   Reason: ${reason}`);
});

console.log('\n' + '=' .repeat(70));
