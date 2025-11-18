// Copyright 2025 VDF-JS Contributors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
  PietrzakVDFParams,
  WesolowskiVDFParams,
  InvalidProof
} from '../src/index';

/**
 * Basic example of using VDF in Node.js
 */
async function main() {
  console.log('VDF.js Example - Node.js\n');

  // Challenge (can be any byte string)
  const challenge = new Uint8Array([0xaa]);
  
  // Difficulty (number of iterations)
  const difficulty = 100;
  
  // Bit length of the discriminant
  const bitLength = 2048;

  // === Pietrzak VDF Example ===
  console.log('=== Pietrzak VDF ===');
  const pietrzak = new PietrzakVDFParams(bitLength).new();
  
  console.log(`Solving VDF with challenge: ${Buffer.from(challenge).toString('hex')}`);
  console.log(`Difficulty: ${difficulty} iterations`);
  console.log('This may take a minute...\n');
  
  const startTime = Date.now();
  const pietrzakProof = await pietrzak.solve(challenge, difficulty);
  const solveTime = Date.now() - startTime;
  
  console.log(`Proof generated in ${solveTime}ms`);
  console.log(`Proof size: ${pietrzakProof.length} bytes`);
  console.log(`Proof (hex): ${Buffer.from(pietrzakProof).toString('hex').substring(0, 64)}...`);
  
  // Verify the proof
  console.log('\nVerifying proof...');
  const verifyStartTime = Date.now();
  
  try {
    pietrzak.verify(challenge, difficulty, pietrzakProof);
    const verifyTime = Date.now() - verifyStartTime;
    console.log(`✓ Proof verified successfully in ${verifyTime}ms`);
  } catch (error) {
    if (error instanceof InvalidProof) {
      console.log('✗ Proof verification failed');
    } else {
      throw error;
    }
  }

  // === Wesolowski VDF Example ===
  console.log('\n=== Wesolowski VDF ===');
  const wesolowski = new WesolowskiVDFParams(bitLength).new();
  
  console.log('Solving VDF...');
  const wesolowskiStartTime = Date.now();
  const wesolowskiProof = await wesolowski.solve(challenge, difficulty);
  const wesolowskiSolveTime = Date.now() - wesolowskiStartTime;
  
  console.log(`Proof generated in ${wesolowskiSolveTime}ms`);
  console.log(`Proof size: ${wesolowskiProof.length} bytes`);
  console.log(`Proof (hex): ${Buffer.from(wesolowskiProof).toString('hex').substring(0, 64)}...`);
  
  // Verify the proof
  console.log('\nVerifying proof...');
  const wesolowskiVerifyStartTime = Date.now();
  
  try {
    wesolowski.verify(challenge, difficulty, wesolowskiProof);
    const wesolowskiVerifyTime = Date.now() - wesolowskiVerifyStartTime;
    console.log(`✓ Proof verified successfully in ${wesolowskiVerifyTime}ms`);
  } catch (error) {
    if (error instanceof InvalidProof) {
      console.log('✗ Proof verification failed');
    } else {
      throw error;
    }
  }

  // Compare proof sizes
  console.log('\n=== Comparison ===');
  console.log(`Pietrzak proof size: ${pietrzakProof.length} bytes`);
  console.log(`Wesolowski proof size: ${wesolowskiProof.length} bytes`);
  console.log(`Wesolowski proofs are ${Math.round((1 - wesolowskiProof.length / pietrzakProof.length) * 100)}% smaller`);
}

main().catch(console.error);

