/**
 * Regression test for Pietrzak numBits bug
 * 
 * Bug: Line 141 in src/pietrzak.ts had:
 *   const numBits = 62 - Math.clz32(denominator);
 * 
 * This mixed 32-bit (Math.clz32) and 64-bit (62) semantics,
 * causing incorrect values for multi-round proofs.
 * 
 * Fix: const numBits = roundIndex;
 * 
 * This test ensures Pietrzak works across various difficulties,
 * especially those requiring multiple proof rounds (> 128).
 */

const vdf = require('../../dist/index.js');

function log(message, status = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    default: '\x1b[0m'
  };
  console.log(`${colors[status]}${message}${colors.default}`);
}

async function testPietrzakDifficulty(difficulty) {
  const challenge = new Uint8Array([0xaa, 0xbb, 0xcc]);
  
  try {
    const p = new vdf.PietrzakVDFParams(256).new();
    const proof = await p.solve(challenge, difficulty, vdf.DISCRIMINANT_256);
    p.verify(challenge, difficulty, proof, vdf.DISCRIMINANT_256);
    
    // Calculate number of proof elements
    const length = Math.ceil((256 + 16) / 16);
    const elementLength = 2 * length;
    const numProofElements = (proof.length - elementLength) / elementLength;
    
    return { success: true, proofElements: numProofElements };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function main() {
  log('╔════════════════════════════════════════════════════════════════╗', 'info');
  log('║  Regression Test: Pietrzak numBits Bug                        ║', 'info');
  log('╚════════════════════════════════════════════════════════════════╝', 'info');
  log('', 'default');
  log('Testing Pietrzak VDF across various difficulties to ensure', 'default');
  log('the numBits calculation bug is fixed.', 'default');
  log('', 'default');
  
  // Test cases that were failing before the fix
  const criticalTests = [
    { diff: 130, expectedElements: 1, description: 'First multi-round proof' },
    { diff: 256, expectedElements: 1, description: 'Power of 2 boundary' },
    { diff: 258, expectedElements: 2, description: 'Two proof elements' },
    { diff: 500, expectedElements: 2, description: 'Higher difficulty' },
    { diff: 1000, expectedElements: 3, description: 'Very high difficulty' },
  ];
  
  log('Testing critical difficulties:', 'info');
  log('-'.repeat(60), 'default');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of criticalTests) {
    process.stdout.write(`  Difficulty ${test.diff.toString().padStart(4)} (${test.description}): `);
    
    const result = await testPietrzakDifficulty(test.diff);
    
    if (result.success) {
      const elemMatch = result.proofElements === test.expectedElements;
      if (elemMatch) {
        log(`✓ PASS (${result.proofElements} proof elements)`, 'success');
        passed++;
      } else {
        log(`✗ FAIL (expected ${test.expectedElements} elements, got ${result.proofElements})`, 'error');
        failed++;
      }
    } else {
      log(`✗ FAIL (${result.error})`, 'error');
      failed++;
    }
  }
  
  // Test a range to ensure consistency
  log('\nTesting difficulty range 66-300 (even numbers):', 'info');
  log('-'.repeat(60), 'default');
  
  let rangeTests = 0;
  let rangePassed = 0;
  
  for (let diff = 66; diff <= 300; diff += 2) {
    // Show progress every 10 tests
    if (rangeTests % 10 === 0) {
      process.stdout.write(`  Testing ${diff}...`);
    }
    
    const result = await testPietrzakDifficulty(diff);
    rangeTests++;
    
    if (result.success) {
      rangePassed++;
      if (rangeTests % 10 === 0) {
        log(` ✓ (${rangePassed}/${rangeTests} passed so far)`, 'success');
      }
    } else {
      if (rangeTests % 10 !== 0) {
        process.stdout.write(`  Testing ${diff}...`);
      }
      log(` ✗ FAILED: ${result.error}`, 'error');
      failed++;
    }
  }
  
  log(`\n  Tested ${rangeTests} difficulties: ${rangePassed} passed`, rangePassed === rangeTests ? 'success' : 'error');
  
  // Summary
  log('\n' + '='.repeat(60), 'default');
  log('Test Summary:', 'info');
  log(`  Total tests: ${passed + failed + (rangeTests - rangePassed)}`, 'default');
  log(`  Passed: ${passed + rangePassed}`, 'success');
  log(`  Failed: ${failed}`, failed > 0 ? 'error' : 'success');
  
  if (failed === 0) {
    log('\n✓ All tests passed! Pietrzak numBits bug is fixed.', 'success');
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

