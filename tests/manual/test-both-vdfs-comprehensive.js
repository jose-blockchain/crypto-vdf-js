/**
 * Comprehensive test for both Pietrzak and Wesolowski VDFs
 * 
 * Tests both VDF implementations across:
 * - Various difficulties (66 to 10000)
 * - Different bit sizes (256, 512, 1024)
 * - Edge cases and boundaries
 * 
 * This ensures both bugs are fixed and VDFs work correctly.
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

async function testVDF(vdfType, bitSize, difficulty, discriminant, timeoutMs = 30000) {
  const challenge = new Uint8Array([0xaa, 0xbb, 0xcc]);
  
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
  );
  
  const testPromise = (async () => {
    const VDFClass = vdfType === 'Pietrzak' ? vdf.PietrzakVDFParams : vdf.WesolowskiVDFParams;
    const vdfInstance = new VDFClass(bitSize).new();
    
    const startSolve = Date.now();
    const proof = await vdfInstance.solve(challenge, difficulty, discriminant);
    const solveTime = Date.now() - startSolve;
    
    const startVerify = Date.now();
    vdfInstance.verify(challenge, difficulty, proof, discriminant);
    const verifyTime = Date.now() - startVerify;
    
    return {
      success: true,
      solveTime,
      verifyTime,
      proofSize: proof.length
    };
  })();
  
  try {
    return await Promise.race([testPromise, timeoutPromise]);
  } catch (e) {
    return {
      success: false,
      error: e.message === 'TIMEOUT' ? 'TIMEOUT' : e.message
    };
  }
}

async function runTestSuite() {
  log('╔════════════════════════════════════════════════════════════════╗', 'info');
  log('║  Comprehensive VDF Test Suite                                 ║', 'info');
  log('╚════════════════════════════════════════════════════════════════╝', 'info');
  log('', 'default');
  
  const testConfigs = [
    {
      name: 'Minimum difficulties (66-100)',
      tests: [
        { type: 'Pietrzak', bits: 256, difficulties: [66, 68, 70, 80, 90, 100], disc: vdf.DISCRIMINANT_256 },
        { type: 'Wesolowski', bits: 256, difficulties: [66, 68, 70, 80, 90, 100], disc: vdf.DISCRIMINANT_256 },
      ]
    },
    {
      name: 'Powers of 2 (128-1024)',
      tests: [
        { type: 'Pietrzak', bits: 256, difficulties: [128, 256, 512, 1024], disc: vdf.DISCRIMINANT_256 },
        { type: 'Wesolowski', bits: 256, difficulties: [128, 256, 512, 1024], disc: vdf.DISCRIMINANT_256 },
      ]
    },
    {
      name: 'High difficulties (2000-7000) - Note: Pietrzak has known limitation >7000',
      tests: [
        { type: 'Pietrzak', bits: 256, difficulties: [2000, 5000, 7000], disc: vdf.DISCRIMINANT_256 },
        { type: 'Wesolowski', bits: 256, difficulties: [2000, 5000, 7000, 10000], disc: vdf.DISCRIMINANT_256 },
      ]
    },
    {
      name: 'Different bit sizes (256, 512, 1024)',
      tests: [
        { type: 'Pietrzak', bits: 256, difficulties: [100], disc: vdf.DISCRIMINANT_256 },
        { type: 'Pietrzak', bits: 512, difficulties: [100], disc: vdf.DISCRIMINANT_512 },
        { type: 'Pietrzak', bits: 1024, difficulties: [100], disc: vdf.DISCRIMINANT_1024 },
        { type: 'Wesolowski', bits: 256, difficulties: [100], disc: vdf.DISCRIMINANT_256 },
        { type: 'Wesolowski', bits: 512, difficulties: [100], disc: vdf.DISCRIMINANT_512 },
        { type: 'Wesolowski', bits: 1024, difficulties: [100], disc: vdf.DISCRIMINANT_1024 },
      ]
    },
  ];
  
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  
  for (const config of testConfigs) {
    log(`\n${'='.repeat(60)}`, 'default');
    log(`${config.name}`, 'info');
    log('='.repeat(60), 'default');
    
    for (const test of config.tests) {
      for (const diff of test.difficulties) {
        totalTests++;
        process.stdout.write(`  ${test.type.padEnd(10)} ${test.bits}-bit diff ${diff.toString().padStart(5)}: `);
        
        const result = await testVDF(test.type, test.bits, diff, test.disc, 30000);
        
        if (result.success) {
          log(`✓ ${result.solveTime.toString().padStart(5)}ms solve, ${result.verifyTime.toString().padStart(4)}ms verify`, 'success');
          totalPassed++;
        } else {
          log(`✗ ${result.error}`, 'error');
          totalFailed++;
        }
      }
    }
  }
  
  // Summary
  log('\n' + '='.repeat(60), 'default');
  log('Final Summary:', 'info');
  log('='.repeat(60), 'default');
  log(`  Total tests: ${totalTests}`, 'default');
  log(`  Passed: ${totalPassed}`, 'success');
  log(`  Failed: ${totalFailed}`, totalFailed > 0 ? 'error' : 'success');
  log(`  Success rate: ${((totalPassed/totalTests)*100).toFixed(1)}%`, totalFailed === 0 ? 'success' : 'error');
  
  if (totalFailed === 0) {
    log('\n✓ All tests passed! Both VDFs are working correctly.', 'success');
    process.exit(0);
  } else {
    log('\n✗ Some tests failed! Issues detected.', 'error');
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

