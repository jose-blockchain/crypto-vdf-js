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

import { createHash } from 'crypto';

/**
 * Convert bytes to BigInt using two's complement for negative numbers
 * Matches Rust GMP import_obj behavior
 */
export function bytesToBigInt(bytes: Uint8Array): bigint {
  if (bytes.length === 0) return 0n;
  
  // Check if negative (high bit set in big-endian)
  const isNegative = (bytes[0] & 0x80) !== 0;
  
  if (isNegative) {
    // Two's complement: invert all bits and add 1
    let result = 0n;
    for (let i = 0; i < bytes.length; i++) {
      result = (result << 8n) | BigInt(bytes[i] ^ 0xFF);
    }
    return -(result + 1n);
  } else {
    // Positive number: standard big-endian
    let result = 0n;
    for (let i = 0; i < bytes.length; i++) {
      result = (result << 8n) | BigInt(bytes[i]);
    }
    return result;
  }
}

/**
 * Convert a BigInt to a Uint8Array with a specified byte length
 */
/**
 * Convert BigInt to bytes using two's complement for negative numbers
 * Matches Rust GMP export_obj behavior - right-aligns values in buffer
 */
export function bigIntToBytes(value: bigint, byteLength: number): Uint8Array {
  const bytes = new Uint8Array(byteLength);
  
  if (value === 0n) {
    // Zero: all bytes are already zero
    return bytes;
  }
  
  if (value < 0n) {
    // Two's complement for negative numbers
    // Step 1: Compute bitwise NOT (absolute value minus 1)
    const notValue = -value - 1n;
    const size = bitLength(notValue);
    const newByteSize = Math.ceil((size + 7) / 8);
    const offset = byteLength - newByteSize;
    
    if (offset < 0) {
      throw new Error(`Buffer too small: need ${newByteSize} bytes, got ${byteLength}`);
    }
    
    // Fill leading bytes with 0xFF
    for (let i = 0; i < offset; i++) {
      bytes[i] = 0xFF;
    }
    
    // Write the bitwise NOT value
    let n = notValue;
    for (let i = byteLength - 1; i >= offset; i--) {
      bytes[i] = Number(n & 0xFFn);
      n >>= 8n;
    }
    
    // Flip all bits to complete two's complement
    for (let i = offset; i < byteLength; i++) {
      bytes[i] ^= 0xFF;
    }
  } else {
    // Positive numbers: calculate actual byte length needed
    const size = bitLength(value);
    const byteLen = Math.ceil((size + 7) / 8);
    const offset = byteLength - byteLen;
    
    if (offset < 0) {
      throw new Error(`Buffer too small: need ${byteLen} bytes, got ${byteLength}`);
    }
    
    // Zero out leading bytes
    for (let i = 0; i < offset; i++) {
      bytes[i] = 0;
    }
    
    // Write the value right-aligned (big-endian)
    let n = value;
    for (let i = byteLength - 1; i >= offset; i--) {
      bytes[i] = Number(n & 0xFFn);
      n >>= 8n;
    }
  }
  
  return bytes;
}

/**
 * Compute modular exponentiation: (base^exponent) mod modulus
 */
export function modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
  if (modulus === 1n) return 0n;
  
  let result = 1n;
  base = base % modulus;
  
  while (exponent > 0n) {
    if (exponent % 2n === 1n) {
      result = (result * base) % modulus;
    }
    exponent = exponent >> 1n;
    base = (base * base) % modulus;
  }
  
  return result;
}

/**
 * Compute the greatest common divisor of two bigints
 */
export function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  
  while (b !== 0n) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  
  return a;
}

/**
 * Extended Euclidean algorithm
 * Returns [gcd, x, y] such that ax + by = gcd(a, b)
 */
export function extendedGcd(a: bigint, b: bigint): [bigint, bigint, bigint] {
  if (b === 0n) {
    return [a, 1n, 0n];
  }
  
  const [gcd, x1, y1] = extendedGcd(b, a % b);
  const x = y1;
  const y = x1 - (a / b) * y1;
  
  return [gcd, x, y];
}

/**
 * Compute modular inverse: a^(-1) mod m
 */
export function modInverse(a: bigint, m: bigint): bigint {
  const [g, x] = extendedGcd(a, m);
  
  if (g !== 1n) {
    throw new Error('Modular inverse does not exist');
  }
  
  return ((x % m) + m) % m;
}

/**
 * Miller-Rabin primality test
 * Uses deterministic witnesses (first primes) instead of random for better performance
 */
export function isProbablePrime(n: bigint, iterations: number = 5): boolean {
  if (n < 2n) return false;
  if (n === 2n || n === 3n) return true;
  if (n % 2n === 0n) return false;
  
  // Small prime checks for efficiency
  const smallPrimes = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
  for (const p of smallPrimes) {
    if (n === p) return true;
    if (n % p === 0n) return false;
  }
  
  // Write n-1 as 2^r * d
  let d = n - 1n;
  let r = 0n;
  while (d % 2n === 0n) {
    d /= 2n;
    r++;
  }
  
  // Use first k primes as witnesses (deterministic, faster than random)
  const witnesses = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
  const numWitnesses = Math.min(iterations, witnesses.length);
  
  // Witness loop
  for (let i = 0; i < numWitnesses; i++) {
    const a = witnesses[i];
    if (a >= n) continue;
    
    let x = modPow(a, d, n);
    
    if (x === 1n || x === n - 1n) {
      continue;
    }
    
    let continueWitnessLoop = false;
    for (let j = 0n; j < r - 1n; j++) {
      x = modPow(x, 2n, n);
      if (x === n - 1n) {
        continueWitnessLoop = true;
        break;
      }
    }
    
    if (!continueWitnessLoop) {
      return false;
    }
  }
  
  return true;
}

/**
 * SHA-256 hash function
 */
export function sha256(...inputs: Uint8Array[]): Uint8Array {
  const hash = createHash('sha256');
  for (const input of inputs) {
    hash.update(input);
  }
  return new Uint8Array(hash.digest());
}

/**
 * Get the bit length of a BigInt
 */
export function bitLength(n: bigint): number {
  if (n === 0n) return 0;
  n = n < 0n ? -n : n;
  return n.toString(2).length;
}

/**
 * Set a specific bit in a BigInt
 */
export function setBit(n: bigint, bit: number): bigint {
  return n | (1n << BigInt(bit));
}

/**
 * Convert number to 8-byte big-endian representation
 */
export function u64ToBytes(n: number | bigint): Uint8Array {
  const value = typeof n === 'number' ? BigInt(n) : n;
  const bytes = new Uint8Array(8);
  
  for (let i = 7; i >= 0; i--) {
    bytes[i] = Number(value & 0xFFn);
    n = typeof n === 'bigint' ? (n as bigint) >> 8n : Math.floor((n as number) / 256);
  }
  
  return bytes;
}

/**
 * Concatenate multiple Uint8Arrays
 */
export function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  
  return result;
}

