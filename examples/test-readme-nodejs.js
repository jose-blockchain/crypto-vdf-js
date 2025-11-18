#!/usr/bin/env node
/**
 * Test script to verify README Node.js examples work correctly
 * Run: node examples/test-readme-nodejs.js
 */

console.log('🧪 Testing README Node.js Examples\n');

async function testBasicExample() {
  console.log('📝 Test 1: Basic CommonJS Example (from README Quick Start)');
  const { PietrzakVDFParams, DISCRIMINANT_256 } = require('../dist/index.js');

  const vdf = new PietrzakVDFParams(256).new();
  const challenge = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);

  console.log('  - Solving VDF...');
  const proof = await vdf.solve(challenge, 100, DISCRIMINANT_256);
  
  console.log('  - Verifying proof...');
  vdf.verify(challenge, 100, proof, DISCRIMINANT_256);
  console.log('  ✓ Proof verified!\n');
}

async function testESModuleExample() {
  console.log('📝 Test 2: ES Module Example (from README Quick Start)');
  // Dynamically import ES module
  const { WesolowskiVDFParams, DISCRIMINANT_512 } = await import('../dist/index.mjs');

  const vdf = new WesolowskiVDFParams(512).new();
  const challenge = new Uint8Array([0xaa]);
  
  console.log('  - Solving VDF...');
  const proof = await vdf.solve(challenge, 100, DISCRIMINANT_512);
  
  console.log('  - Verifying proof...');
  vdf.verify(challenge, 100, proof, DISCRIMINANT_512);
  console.log('  ✓ Proof verified!\n');
}

async function testCompleteExample() {
  console.log('📝 Test 3: Complete Example (from README Complete Examples)');
  const { 
    WesolowskiVDFParams, 
    PietrzakVDFParams,
    DISCRIMINANT_256,
    DISCRIMINANT_512,
    InvalidProof 
  } = require('../dist/index.js');

  // Example 1: Wesolowski VDF
  console.log('  - Testing Wesolowski VDF...');
  const wesolowski = new WesolowskiVDFParams(256).new();
  const challenge = new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd]);

  const proof1 = await wesolowski.solve(challenge, 100, DISCRIMINANT_256);
  wesolowski.verify(challenge, 100, proof1, DISCRIMINANT_256);
  console.log('  ✓ Wesolowski proof verified!');

  // Example 2: Pietrzak VDF
  console.log('  - Testing Pietrzak VDF...');
  const pietrzak = new PietrzakVDFParams(512).new();
  const proof2 = await pietrzak.solve(challenge, 100, DISCRIMINANT_512);
  pietrzak.verify(challenge, 100, proof2, DISCRIMINANT_512);
  console.log('  ✓ Pietrzak proof verified!');

  // Example 3: Error handling
  console.log('  - Testing error handling...');
  try {
    const badProof = new Uint8Array(256);
    wesolowski.verify(challenge, 100, badProof, DISCRIMINANT_256);
    console.log('  ✗ ERROR: Should have thrown InvalidProof');
    process.exit(1);
  } catch (error) {
    if (error instanceof InvalidProof) {
      console.log('  ✓ Proof verification failed (expected)');
    } else {
      throw error;
    }
  }
  console.log();
}

async function testPrecomputedDiscriminants() {
  console.log('📝 Test 4: Precomputed Discriminants Example');
  const { 
    WesolowskiVDFParams,
    DISCRIMINANT_256, 
    DISCRIMINANT_512,
    getPrecomputedDiscriminant
  } = require('../dist/index.js');

  const vdf = new WesolowskiVDFParams(256).new();
  const challenge = new Uint8Array([0xaa]);

  // Method 1: Use specific discriminant constant
  console.log('  - Method 1: Using DISCRIMINANT_256 constant...');
  const proof = await vdf.solve(challenge, 100, DISCRIMINANT_256);
  vdf.verify(challenge, 100, proof, DISCRIMINANT_256);
  console.log('  ✓ Method 1 works!');

  // Method 2: Get discriminant by bit size
  console.log('  - Method 2: Using getPrecomputedDiscriminant(512)...');
  const disc = getPrecomputedDiscriminant(512);
  const vdf512 = new WesolowskiVDFParams(512).new();
  const proof2 = await vdf512.solve(challenge, 100, disc);
  vdf512.verify(challenge, 100, proof2, disc);
  console.log('  ✓ Method 2 works!\n');
}

async function runAllTests() {
  try {
    await testBasicExample();
    await testESModuleExample();
    await testCompleteExample();
    await testPrecomputedDiscriminants();
    
    console.log('🎉 All README examples tested successfully!');
    console.log('✓ All examples are working correctly\n');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

runAllTests();

