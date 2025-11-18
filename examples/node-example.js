// Node.js Example - Verifiable Delay Function (VDF)
const { PietrzakVDFParams, WesolowskiVDFParams } = require('../dist/index');

async function main() {
  console.log('VDF Example - Node.js\n');

  // Create challenge (random bytes)
  const challenge = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  const difficulty = 100; // iterations

  // Example 1: Pietrzak VDF
  console.log('1. Pietrzak VDF (256-bit)');
  const pietrzak = new PietrzakVDFParams(256).new();
  
  console.log('   Solving...');
  const startP = Date.now();
  const proofP = await pietrzak.solve(challenge, difficulty);
  console.log(`   Solved in ${Date.now() - startP}ms`);
  
  console.log('   Verifying...');
  pietrzak.verify(challenge, difficulty, proofP);
  console.log('   ✓ Proof verified!\n');

  // Example 2: Wesolowski VDF
  console.log('2. Wesolowski VDF (256-bit)');
  const wesolowski = new WesolowskiVDFParams(256).new();
  
  console.log('   Solving...');
  const startW = Date.now();
  const proofW = await wesolowski.solve(challenge, difficulty);
  console.log(`   Solved in ${Date.now() - startW}ms`);
  
  console.log('   Verifying...');
  wesolowski.verify(challenge, difficulty, proofW);
  console.log('   ✓ Proof verified!\n');

  console.log('Example completed successfully!');
}

main().catch(console.error);

