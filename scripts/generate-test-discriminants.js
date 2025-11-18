// Script to generate valid discriminants for testing
// Run with: node scripts/generate-test-discriminants.js

const { createDiscriminant } = require('../dist/discriminant');
const { isProbablePrime, bitLength } = require('../dist/utils');

console.log('Generating test discriminants...\n');

// Generate discriminants for testing
const seed_aa = new Uint8Array([0xaa]);
const seed_bb = new Uint8Array([0xbb]);

console.log('Seed 0xaa, 40 bits:');
const d40 = createDiscriminant(seed_aa, 40);
console.log(`DISCRIMINANT_40 = ${d40}n;`);
console.log(`  Negative: ${d40 < 0n}`);
console.log(`  Mod 8: ${(-d40) % 8n}`);
console.log(`  Prime: ${isProbablePrime(-d40, 10)}`);
console.log(`  Bits: ${bitLength(-d40)}\n`);

console.log('Seed 0xaa, 256 bits:');
const d256_aa = createDiscriminant(seed_aa, 256);
console.log(`DISCRIMINANT_256 = ${d256_aa}n;`);
console.log(`  Negative: ${d256_aa < 0n}`);
console.log(`  Mod 8: ${(-d256_aa) % 8n}`);
console.log(`  Prime: ${isProbablePrime(-d256_aa, 10)}`);
console.log(`  Bits: ${bitLength(-d256_aa)}\n`);

console.log('Seed 0xbb, 256 bits:');
const d256_bb = createDiscriminant(seed_bb, 256);
console.log(`DISCRIMINANT_256_BB = ${d256_bb}n;`);
console.log(`  Negative: ${d256_bb < 0n}`);
console.log(`  Mod 8: ${(-d256_bb) % 8n}`);
console.log(`  Prime: ${isProbablePrime(-d256_bb, 10)}`);
console.log(`  Bits: ${bitLength(-d256_bb)}\n`);

console.log('\nCopy these values to tests/test-discriminants.ts');

