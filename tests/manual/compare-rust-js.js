// Compare Rust and JavaScript VDF implementations
// Run with: node tests/manual/compare-rust-js.js

const { WesolowskiVDFParams } = require('../../dist/index.js');
const { execSync } = require('child_process');
const path = require('path');

// Use precomputed discriminants from the package
const { DISCRIMINANT_256, DISCRIMINANT_512 } = require('../../dist/index.js');

function countZeros(hex) {
  const zeros = hex.match(/0+/g) || [];
  const totalZeros = zeros.reduce((sum, match) => sum + match.length, 0);
  const maxZeroRun = zeros.length > 0 ? Math.max(...zeros.map(m => m.length)) : 0;
  return { totalZeros, maxZeroRun, zeroRuns: zeros.length };
}

function analyzeProof(proof, label) {
  // Ensure hex is always a string
  let hex;
  let bytes;
  if (Buffer.isBuffer(proof)) {
    hex = proof.toString('hex');
    bytes = proof;
  } else if (proof instanceof Uint8Array) {
    hex = Buffer.from(proof).toString('hex');
    bytes = Buffer.from(proof);
  } else if (typeof proof === 'string') {
    hex = proof;
    bytes = Buffer.from(proof, 'hex');
  } else {
    // Fallback: try to convert to string
    hex = String(proof);
    bytes = Buffer.from(hex, 'hex');
  }
  const zeros = countZeros(hex);
  const nonZeroBytes = bytes.filter(b => b !== 0).length;
  const utilization = ((nonZeroBytes / bytes.length) * 100).toFixed(1);
  
  console.log(`\n${label}:`);
  console.log(`  Length: ${bytes.length} bytes (${hex.length} hex chars)`);
  console.log(`  Non-zero bytes: ${nonZeroBytes}/${bytes.length} (${utilization}%)`);
  console.log(`  Total zeros: ${zeros.totalZeros} hex chars`);
  console.log(`  Max zero run: ${zeros.maxZeroRun} chars`);
  console.log(`  Zero runs: ${zeros.zeroRuns}`);
  console.log(`  First 64 chars: ${hex.substring(0, 64)}...`);
  console.log(`  Last 64 chars: ...${hex.substring(hex.length - 64)}`);
  
  return { hex, bytes, zeros, utilization };
}

async function compareVDF(challenge, difficulty, bitSize, usePrecomputed = true) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Comparing VDF: challenge=${Buffer.from(challenge).toString('hex')}, difficulty=${difficulty}, bits=${bitSize}`);
  if (usePrecomputed) {
    console.log('  Using precomputed discriminant for JS (fast mode)');
  }
  console.log('='.repeat(70));
  
  // JavaScript version
  console.log('\n[JavaScript Implementation]');
  const jsStart = Date.now();
  const jsVDF = new WesolowskiVDFParams(bitSize).new();
  const discriminant = usePrecomputed 
    ? (bitSize === 256 ? DISCRIMINANT_256 : DISCRIMINANT_512)
    : undefined;
  const jsProof = await jsVDF.solve(challenge, difficulty, discriminant);
  const jsTime = Date.now() - jsStart;
  const jsAnalysis = analyzeProof(jsProof, 'JS Proof');
  
  // Rust version
  console.log('\n[Rust Implementation]');
  const rustVDFPath = path.join(__dirname, '../../../vdf-rs/target/release/vdf-cli');
  const challengeHex = Buffer.from(challenge).toString('hex');
  const rustStart = Date.now();
  const rustProofHex = execSync(`${rustVDFPath} -l ${bitSize} ${challengeHex} ${difficulty}`, {
    encoding: 'utf8',
    cwd: path.join(__dirname, '../../../vdf-rs')
  }).trim();
  const rustTime = Date.now() - rustStart;
  const rustAnalysis = analyzeProof(rustProofHex, 'Rust Proof');
  
  // Comparison
  console.log('\n[Comparison]');
  console.log(`  JS solve time: ${jsTime}ms`);
  console.log(`  Rust solve time: ${rustTime}ms`);
  console.log(`  JS utilization: ${jsAnalysis.utilization}%`);
  console.log(`  Rust utilization: ${rustAnalysis.utilization}%`);
  console.log(`  JS max zero run: ${jsAnalysis.zeros.maxZeroRun}`);
  console.log(`  Rust max zero run: ${rustAnalysis.zeros.maxZeroRun}`);
  console.log(`  Length match: ${jsAnalysis.bytes.length === rustAnalysis.bytes.length ? '✓' : '✗'} (JS: ${jsAnalysis.bytes.length}, Rust: ${rustAnalysis.bytes.length})`);
  
  // Verify both proofs
  console.log('\n[Verification]');
  try {
    jsVDF.verify(challenge, difficulty, jsProof, discriminant);
    console.log('  JS proof verification: ✓ PASSED');
  } catch (e) {
    console.log(`  JS proof verification: ✗ FAILED: ${e.message}`);
  }
  
  try {
    execSync(`${rustVDFPath} -l ${bitSize} ${challengeHex} ${difficulty} ${rustProofHex}`, {
      encoding: 'utf8',
      cwd: path.join(__dirname, '../../../vdf-rs')
    });
    console.log('  Rust proof verification: ✓ PASSED');
  } catch (e) {
    console.log('  Rust proof verification: ✗ FAILED');
  }
  
  // Check if proofs are identical
  // Note: If using precomputed discriminants, proofs will differ because Rust generates from challenge
  if (jsAnalysis.hex === rustAnalysis.hex) {
    console.log('\n  ✓ Proofs are IDENTICAL');
  } else {
    console.log('\n  ✗ Proofs are DIFFERENT');
    if (usePrecomputed) {
      console.log('    (Expected: JS uses precomputed discriminant, Rust generates from challenge)');
    }
    // Find first difference
    const minLen = Math.min(jsAnalysis.hex.length, rustAnalysis.hex.length);
    for (let i = 0; i < minLen; i++) {
      if (jsAnalysis.hex[i] !== rustAnalysis.hex[i]) {
        console.log(`    First difference at position ${i}`);
        console.log(`    JS:   ...${jsAnalysis.hex.substring(Math.max(0, i-20), i+20)}...`);
        console.log(`    Rust: ...${rustAnalysis.hex.substring(Math.max(0, i-20), i+20)}...`);
        break;
      }
    }
  }
}

async function run() {
  const challenges = [
    Buffer.from('aa', 'hex'),
    Buffer.from('deadbeef', 'hex'),
  ];
  
  const difficulties = [100, 200, 500, 1000];
  const bitSizes = [256, 512];
  
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║     Rust vs JavaScript VDF Comparison                        ║');
  console.log('║     Using precomputed discriminants for JS (fast mode)      ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  
  for (const bitSize of bitSizes) {
    for (const challenge of challenges) {
      for (const difficulty of difficulties) {
        try {
          await compareVDF(challenge, difficulty, bitSize, true);
        } catch (e) {
          console.error(`Error testing challenge=${Buffer.from(challenge).toString('hex')}, difficulty=${difficulty}, bits=${bitSize}:`, e.message);
        }
      }
    }
  }
}

run().catch(console.error);

