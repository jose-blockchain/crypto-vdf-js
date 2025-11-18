// Manual test for VDF solve/verify (bypasses Jest issues)
// Run with: npm run test:vdf
const { PietrzakVDFParams, WesolowskiVDFParams } = require('../../dist/index.js');

// Use precomputed discriminants from the package
const { DISCRIMINANT_256, DISCRIMINANT_512 } = require('../../dist/index.js');

function verifyDiscriminantProperties(disc, bitSize) {
  console.log(`   [Verifying discriminant properties for ${bitSize}-bit]`);
  
  // Check it's negative
  if (disc >= 0n) {
    console.log('   ✗ Discriminant must be negative');
    return false;
  }
  
  // Check ≡ 1 (mod 8)
  const mod8 = disc % 8n;
  const normalized8 = mod8 < 0n ? mod8 + 8n : mod8;
  if (normalized8 !== 1n) {
    console.log(`   ✗ Discriminant must be ≡ 1 (mod 8), got ${normalized8}`);
    return false;
  }
  
  // Check ≡ 1 (mod 4)
  const mod4 = disc % 4n;
  const normalized4 = mod4 < 0n ? mod4 + 4n : mod4;
  if (normalized4 !== 1n) {
    console.log(`   ✗ Discriminant must be ≡ 1 (mod 4), got ${normalized4}`);
    return false;
  }
  
  console.log(`   ✓ Discriminant is negative: ${disc < 0n}`);
  console.log(`   ✓ Discriminant ≡ 1 (mod 8): true`);
  console.log(`   ✓ Discriminant ≡ 1 (mod 4): true`);
  return true;
}

function displayProofStats(proof, label, solveTime) {
  let nonZeroBytes = 0;
  for (let i = 0; i < proof.length; i++) {
    if (proof[i] !== 0) nonZeroBytes++;
  }
  const percentage = ((nonZeroBytes / proof.length) * 100).toFixed(1);
  
  console.log(`   [${label}]`);
  console.log(`   ├─ Proof generated in ${solveTime}ms`);
  console.log(`   ├─ Length: ${proof.length} bytes`);
  console.log(`   ├─ Non-zero bytes: ${nonZeroBytes}/${proof.length} (${percentage}%)`);
  console.log(`   └─ Hex: ${Buffer.from(proof).toString('hex').substring(0, 50)}...`);
  
  // Explain low percentages
  if (parseFloat(percentage) < 10) {
    console.log(`   ℹ️  Low percentage is NORMAL: ClassGroup values cycle between small and large`);
    console.log(`      At this difficulty, values are small → lots of zero padding in fixed-size encoding`);
  }
}

async function testPietrzak256Precomputed() {
  console.log('\n=== Pietrzak VDF - 256 bits, difficulty 66 (precomputed discriminant) ===');
  const challenge = new Uint8Array([0xaa]);
  const difficulty = 66;
  
  console.log('Challenge:', Buffer.from(challenge).toString('hex'));
  console.log('Difficulty:', difficulty);
  
  if (!verifyDiscriminantProperties(DISCRIMINANT_256, 256)) {
    console.log('✗ Invalid discriminant properties');
    return false;
  }
  
  console.log('Generating proof...');
  const start = Date.now();
  const vdf = new PietrzakVDFParams(256).new();
  const proof = await vdf.solve(challenge, difficulty, DISCRIMINANT_256);
  const solveTime = Date.now() - start;
  
  displayProofStats(proof, 'Solve Stats', solveTime);
  
  console.log('Verifying proof...');
  const verifyStart = Date.now();
  try {
    vdf.verify(challenge, difficulty, proof, DISCRIMINANT_256);
    const verifyTime = Date.now() - verifyStart;
    console.log(`✓ Verification PASSED in ${verifyTime}ms`);
    return true;
  } catch (e) {
    console.log('✗ Verification FAILED:', e.message);
    return false;
  }
}

async function testPietrzak256Generated() {
  console.log('\n=== Pietrzak VDF - 256 bits, difficulty 66 (generated discriminant) ===');
  const challenge = new Uint8Array([0xbb]); // Different challenge
  const difficulty = 66;
  
  console.log('Challenge:', Buffer.from(challenge).toString('hex'));
  console.log('Difficulty:', difficulty);
  console.log('Generating discriminant from challenge (this will take 20-40 seconds)...');
  
  const start = Date.now();
  const vdf = new PietrzakVDFParams(256).new();
  const proof = await vdf.solve(challenge, difficulty); // No discriminant = generate it
  const solveTime = Date.now() - start;
  
  displayProofStats(proof, 'Solve Stats', solveTime);
  
  console.log('Verifying proof...');
  const verifyStart = Date.now();
  try {
    vdf.verify(challenge, difficulty, proof); // No discriminant = generate it
    const verifyTime = Date.now() - verifyStart;
    console.log(`✓ Verification PASSED in ${verifyTime}ms`);
    return true;
  } catch (e) {
    console.log('✗ Verification FAILED:', e.message);
    return false;
  }
}

async function testPietrzak512() {
  console.log('\n=== Pietrzak VDF - 512 bits, difficulty 100 (precomputed discriminant) ===');
  const challenge = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
  const difficulty = 100;
  
  console.log('Challenge:', Buffer.from(challenge).toString('hex'));
  console.log('Difficulty:', difficulty);
  console.log('ℹ️  Note: Low difficulty relative to bit size → expect small values (low %)');
  
  if (!verifyDiscriminantProperties(DISCRIMINANT_512, 512)) {
    console.log('✗ Invalid discriminant properties');
    return false;
  }
  
  console.log('Generating proof...');
  const start = Date.now();
  const vdf = new PietrzakVDFParams(512).new();
  const proof = await vdf.solve(challenge, difficulty, DISCRIMINANT_512);
  const solveTime = Date.now() - start;
  
  displayProofStats(proof, 'Solve Stats', solveTime);
  
  console.log('Verifying proof...');
  const verifyStart = Date.now();
  try {
    vdf.verify(challenge, difficulty, proof, DISCRIMINANT_512);
    const verifyTime = Date.now() - verifyStart;
    console.log(`✓ Verification PASSED in ${verifyTime}ms`);
    return true;
  } catch (e) {
    console.log('✗ Verification FAILED:', e.message);
    return false;
  }
}

async function testWesolowski256() {
  console.log('\n=== Wesolowski VDF - 256 bits, difficulty 66 (precomputed discriminant) ===');
  const challenge = new Uint8Array([0xaa]);
  const difficulty = 66; // Changed from 30 to 66 to match Pietrzak minimum
  
  console.log('Challenge:', Buffer.from(challenge).toString('hex'));
  console.log('Difficulty:', difficulty);
  
  if (!verifyDiscriminantProperties(DISCRIMINANT_256, 256)) {
    console.log('✗ Invalid discriminant properties');
    return false;
  }
  
  console.log('Generating proof...');
  const start = Date.now();
  const vdf = new WesolowskiVDFParams(256).new();
  const proof = await vdf.solve(challenge, difficulty, DISCRIMINANT_256);
  const solveTime = Date.now() - start;
  
  displayProofStats(proof, 'Solve Stats', solveTime);
  
  console.log('Verifying proof...');
  const verifyStart = Date.now();
  try {
    vdf.verify(challenge, difficulty, proof, DISCRIMINANT_256);
    const verifyTime = Date.now() - verifyStart;
    console.log(`✓ Verification PASSED in ${verifyTime}ms`);
    return true;
  } catch (e) {
    console.log('✗ Verification FAILED:', e.message);
    return false;
  }
}

async function testWesolowski256Generated() {
  console.log('\n=== Wesolowski VDF - 256 bits, difficulty 66 (generated discriminant) ===');
  const challenge = new Uint8Array([0xcc]); // Different challenge
  const difficulty = 66;
  
  console.log('Challenge:', Buffer.from(challenge).toString('hex'));
  console.log('Difficulty:', difficulty);
  console.log('Generating discriminant from challenge (this will take 20-40 seconds)...');
  
  const start = Date.now();
  const vdf = new WesolowskiVDFParams(256).new();
  const proof = await vdf.solve(challenge, difficulty); // No discriminant = generate it
  const solveTime = Date.now() - start;
  
  displayProofStats(proof, 'Solve Stats', solveTime);
  
  console.log('Verifying proof...');
  const verifyStart = Date.now();
  try {
    vdf.verify(challenge, difficulty, proof); // No discriminant = generate it
    const verifyTime = Date.now() - verifyStart;
    console.log(`✓ Verification PASSED in ${verifyTime}ms`);
    return true;
  } catch (e) {
    console.log('✗ Verification FAILED:', e.message);
    return false;
  }
}

async function testWesolowski512() {
  console.log('\n=== Wesolowski VDF - 512 bits, difficulty 100 (precomputed discriminant) ===');
  const challenge = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
  const difficulty = 100;
  
  console.log('Challenge:', Buffer.from(challenge).toString('hex'));
  console.log('Difficulty:', difficulty);
  
  if (!verifyDiscriminantProperties(DISCRIMINANT_512, 512)) {
    console.log('✗ Invalid discriminant properties');
    return false;
  }
  
  console.log('Generating proof...');
  const start = Date.now();
  const vdf = new WesolowskiVDFParams(512).new();
  const proof = await vdf.solve(challenge, difficulty, DISCRIMINANT_512);
  const solveTime = Date.now() - start;
  
  displayProofStats(proof, 'Solve Stats', solveTime);
  
  console.log('Verifying proof...');
  const verifyStart = Date.now();
  try {
    vdf.verify(challenge, difficulty, proof, DISCRIMINANT_512);
    const verifyTime = Date.now() - verifyStart;
    console.log(`✓ Verification PASSED in ${verifyTime}ms`);
    return true;
  } catch (e) {
    console.log('✗ Verification FAILED:', e.message);
    return false;
  }
}

async function runAllTests() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║          VDF Complete Integration Tests                      ║');
  console.log('║                                                               ║');
  console.log('║  Testing both precomputed and generated discriminants        ║');
  console.log('║  Demonstrating ClassGroup value cycling (zeros are normal!)  ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  
  const results = [];
  
  // Fast tests with precomputed discriminants
  console.log('\n── Fast Tests (Precomputed Discriminants) ──');
  console.log('Note: Low difficulties (66-100) produce small ClassGroup values → low % utilization');
  console.log('      This is NORMAL behavior for Binary Quadratic Forms!\n');
  results.push(await testPietrzak256Precomputed());
  results.push(await testPietrzak512());
  results.push(await testWesolowski256());
  results.push(await testWesolowski512());
  
  // Slow tests with generated discriminants (optional - skip if RUN_SLOW_TESTS not set)
  if (process.env.RUN_SLOW_TESTS) {
    console.log('\n── Slow Tests (Generated Discriminants - ~40s each) ──');
    results.push(await testPietrzak256Generated());
    results.push(await testWesolowski256Generated());
  } else {
    console.log('\n── Slow Tests (Generated Discriminants) SKIPPED ──');
    console.log('   Run with: RUN_SLOW_TESTS=1 npm run test:vdf');
  }
  
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                        SUMMARY                                ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`Tests passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('✓✓✓ ALL TESTS PASSED ✓✓✓');
    process.exit(0);
  } else {
    console.log('✗✗✗ SOME TESTS FAILED ✗✗✗');
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
