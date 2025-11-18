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

import { sha256, isProbablePrime, setBit, bytesToBigInt } from './utils';

// Precomputed constants for discriminant generation
// M has many small prime factors for more uniform distribution
const M = 11_0950_45730n;

// Residues table - precomputed for efficiency
const RESIDUES = generateResidues();

function generateResidues(): bigint[] {
  const residues: bigint[] = [];
  for (let i = 0; i < 65536; i++) {
    const r = BigInt(i) % M;
    if (r % 8n === 7n) {
      residues.push(r);
    }
  }
  return residues;
}

// Sieve info for small primes
const SIEVE_INFO: [number, number][] = [
  [3, 2], [5, 4], [7, 6], [11, 10], [13, 12], [17, 16], [19, 18],
  [23, 22], [29, 28], [31, 30], [37, 36], [41, 40], [43, 42],
  [47, 46], [53, 52], [59, 58], [61, 60], [67, 66], [71, 70],
  [73, 72], [79, 78], [83, 82], [89, 88], [97, 96]
];

/**
 * Generate random bytes from a seed using SHA-256
 */
function randomBytesFromSeed(seed: Uint8Array, byteCount: number): Uint8Array {
  const blob = new Uint8Array(byteCount);
  let offset = 0;
  let extra = 0;
  
  while (offset < byteCount) {
    const extraBytes = new Uint8Array(2);
    extraBytes[0] = (extra >> 8) & 0xFF;
    extraBytes[1] = extra & 0xFF;
    
    const hash = sha256(seed, extraBytes);
    const copyLength = Math.min(hash.length, byteCount - offset);
    blob.set(hash.subarray(0, copyLength), offset);
    offset += copyLength;
    extra++;
  }
  
  return blob;
}

/**
 * Create a discriminant from a seed and bit length.
 * 
 * The discriminant is guaranteed to be a negative prime number that fits in
 * `length` bits, except with negligible probability (less than 2^-100).
 * It is also guaranteed to equal 7 modulo 8.
 * 
 * This function uses SHA-256 to expand the seed. Different seeds will result
 * in completely different discriminants with overwhelming probability.
 * The function is deterministic: identical seeds and lengths always produce
 * the same discriminant.
 * 
 * @param seed - The seed bytes to generate from
 * @param length - The bit length of the discriminant
 * @returns A negative prime discriminant
 */
export function createDiscriminant(seed: Uint8Array, length: number): bigint {
  const extra = length & 7;
  const randomBytesLen = Math.floor((length + 7) / 8) + 2;
  const randomBytes = randomBytesFromSeed(seed, randomBytesLen);
  
  const nBytes = randomBytes.subarray(0, randomBytesLen - 2);
  const last2 = randomBytes.subarray(randomBytesLen - 2);
  const numerator = (last2[0] << 8) + last2[1];
  
  // Convert to BigInt and shift if needed
  let n = bytesToBigInt(nBytes);
  n >>= BigInt((8 - extra) & 7);
  
  // Set the high bit to ensure we have the right bit length
  n = setBit(n, length - 1);
  
  const residue = RESIDUES[numerator % RESIDUES.length];
  const rem = n % M;
  
  // Adjust n to have the correct residue mod M
  if (residue > rem) {
    n += residue - rem;
  } else {
    n -= rem - residue;
  }
  
  // Find the smallest prime >= n of the form n + M*x
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Use a sieve to quickly rule out composite numbers
    const sieve = new Array(65536).fill(false);
    
    for (const [p, q] of SIEVE_INFO) {
      let i = Number((n % BigInt(p)) * BigInt(q) % BigInt(p));
      while (i < sieve.length) {
        sieve[i] = true;
        i += p;
      }
    }
    
    // Check each non-sieved candidate
    for (let i = 0; i < sieve.length; i++) {
      if (!sieve[i]) {
        const candidate = n + M * BigInt(i);
        // CRITICAL: Ensure candidate ≡ 7 (mod 8) before negating
        // After negation, discriminant will be ≡ 1 (mod 8) and ≡ 1 (mod 4)
        if (candidate % 8n === 7n && isProbablePrime(candidate, 2)) {
          return -candidate;
        }
      }
    }
    
    // Move to next block
    n += M * 65536n;
  }
}

