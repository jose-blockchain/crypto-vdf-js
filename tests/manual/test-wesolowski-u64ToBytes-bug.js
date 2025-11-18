/**
 * Regression test for Wesolowski u64ToBytes bug
 * 
 * Bug: Line 270 in src/utils.ts had:
 *   n = typeof n === 'bigint' ? (n as bigint) >> 8n : Math.floor((n as number) / 256);
 * 
 * This shifted parameter `n` instead of local variable `value`,
 * causing byte encoding to repeat in cycles and hashPrime to loop infinitely.
 * 
 * Fix: Changed to `let value` and `value = value >> 8n;`
 * 
 * This test ensures:
 * 1. u64ToBytes produces correct unique values
 * 2. hashPrime doesn't loop infinitely
 * 3. Wesolowski works across various difficulties
 */

const vdf = require('../../dist/index.js');
const { u64ToBytes } = require('../../dist/utils.js');

function log(message, status = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    default: '\x1b[0m'
  };
  console.log(`${colors[status]}${message}${colors.default}`);
}

function testU64ToBytes() {
  log('\nTest 1: u64ToBytes produces unique values', 'info');
  log('-'.repeat(60), 'default');
  
  const values = new Map();
  let duplicates = 0;
  
  // Test that sequential numbers produce unique byte arrays
  for (let i = 0; i < 10000; i++) {
    const bytes = u64ToBytes(BigInt(i));
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (values.has(hex)) {
      log(`  ✗ Duplicate found: ${i} produces same bytes as ${values.get(hex)}`, 'error');
      duplicates++;
    } else {
      values.set(hex, i);
    }
  }
  
  if (duplicates === 0) {
    log(`  ✓ All 10,000 values are unique`, 'success');
    return true;
  } else {
    log(`  ✗ Found ${duplicates} duplicates`, 'error');
    return false;
  }
}

function testU64ToBytesCorrectness() {
  log('\nTest 2: u64ToBytes correctness', 'info');
  log('-'.repeat(60), 'default');
  
  const testCases = [
    { input: 0n, expected: '0000000000000000' },
    { input: 1n, expected: '0000000000000001' },
    { input: 255n, expected: '00000000000000ff' },
    { input: 256n, expected: '0000000000000100' },
    { input: 0xFFFFFFFFFFFFFFFFn, expected: 'ffffffffffffffff' },
    { input: 0x123456789ABCDEFn, expected: '0123456789abcdef' },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of testCases) {
    const bytes = u64ToBytes(test.input);
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (hex === test.expected) {
      log(`  ✓ u64ToBytes(${test.input}) = ${hex}`, 'success');
      passed++;
    } else {
      log(`  ✗ u64ToBytes(${test.input}) = ${hex}, expected ${test.expected}`, 'error');
      failed++;
    }
  }
  
  log(`  Result: ${passed} passed, ${failed} failed`, failed === 0 ? 'success' : 'error');
  return failed === 0;
}

async function testWesolowskiDifficulty(difficulty, timeoutMs = 10000) {
  const challenge = new Uint8Array([0xaa, 0xbb, 0xcc]);
  
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
  );
  
  const testPromise = (async () => {
    try {
      const w = new vdf.WesolowskiVDFParams(256).new();
      const proof = await w.solve(challenge, difficulty, vdf.DISCRIMINANT_256);
      w.verify(challenge, difficulty, proof, vdf.DISCRIMINANT_256);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  })();
  
  try {
    return await Promise.race([testPromise, timeoutPromise]);
  } catch (e) {
    if (e.message === 'TIMEOUT') {
      return { success: false, error: 'TIMEOUT' };
    }
    throw e;
  }
}

async function testWesolowskiNonHanging() {
  log('\nTest 3: Wesolowski doesn\'t hang (hashPrime infinite loop check)', 'info');
  log('-'.repeat(60), 'default');
  
  // These difficulties were problematic before the fix
  const testDifficulties = [66, 70, 80, 100, 128, 256, 500, 1000];
  
  let passed = 0;
  let failed = 0;
  
  for (const diff of testDifficulties) {
    process.stdout.write(`  Difficulty ${diff.toString().padStart(4)}: `);
    
    const result = await testWesolowskiDifficulty(diff, 10000);
    
    if (result.success) {
      log('✓ PASS', 'success');
      passed++;
    } else {
      log(`✗ FAIL (${result.error})`, 'error');
      failed++;
    }
  }
  
  log(`  Result: ${passed} passed, ${failed} failed`, failed === 0 ? 'success' : 'error');
  return failed === 0;
}

async function main() {
  log('╔════════════════════════════════════════════════════════════════╗', 'info');
  log('║  Regression Test: Wesolowski u64ToBytes Bug                   ║', 'info');
  log('╚════════════════════════════════════════════════════════════════╝', 'info');
  log('', 'default');
  log('Testing to ensure the u64ToBytes bug that caused hashPrime', 'default');
  log('infinite loops and Wesolowski hangs is fixed.', 'default');
  log('', 'default');
  
  const test1Pass = testU64ToBytes();
  const test2Pass = testU64ToBytesCorrectness();
  const test3Pass = await testWesolowskiNonHanging();
  
  // Summary
  log('\n' + '='.repeat(60), 'default');
  log('Test Summary:', 'info');
  log(`  u64ToBytes uniqueness: ${test1Pass ? 'PASS' : 'FAIL'}`, test1Pass ? 'success' : 'error');
  log(`  u64ToBytes correctness: ${test2Pass ? 'PASS' : 'FAIL'}`, test2Pass ? 'success' : 'error');
  log(`  Wesolowski non-hanging: ${test3Pass ? 'PASS' : 'FAIL'}`, test3Pass ? 'success' : 'error');
  
  if (test1Pass && test2Pass && test3Pass) {
    log('\n✓ All tests passed! Wesolowski u64ToBytes bug is fixed.', 'success');
    process.exit(0);
  } else {
    log('\n✗ Some tests failed! Regression detected.', 'error');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

