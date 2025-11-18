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
  bytesToBigInt,
  bigIntToBytes,
  modPow,
  gcd,
  extendedGcd,
  modInverse,
  isProbablePrime,
  bitLength,
  setBit
} from '../src/utils';

describe('Utils', () => {
  describe('bytesToBigInt and bigIntToBytes', () => {
    test('should convert bytes to BigInt and back', () => {
      const original = 12345678901234567890n;
      const bytes = bigIntToBytes(original, 10);
      const result = bytesToBigInt(bytes);
      expect(result).toBe(original);
    });

    test('should handle zero', () => {
      const bytes = bigIntToBytes(0n, 4);
      expect(bytesToBigInt(bytes)).toBe(0n);
    });

    test('should handle large positive numbers', () => {
      // Use a large positive number (high bit not set)
      const original = (1n << 255n) - 1n; // Max positive for 256-bit two's complement
      // This needs 33 bytes: Math.ceil((255 + 7) / 8) = 33
      const bytes = bigIntToBytes(original, 33);
      expect(bytesToBigInt(bytes)).toBe(original);
    });

    test('should handle negative numbers with two\'s complement', () => {
      const original = -1n;
      const bytes = bigIntToBytes(original, 32);
      expect(bytesToBigInt(bytes)).toBe(original);
      
      // Test another negative
      const neg = -12345678901234567890n;
      const negBytes = bigIntToBytes(neg, 32);
      expect(bytesToBigInt(negBytes)).toBe(neg);
    });

    test('should handle all 1s as -1 (two\'s complement)', () => {
      // All bits set = -1 in two's complement
      const bytes = new Uint8Array(32).fill(0xFF);
      expect(bytesToBigInt(bytes)).toBe(-1n);
    });
  });

  describe('modPow', () => {
    test('should compute modular exponentiation', () => {
      expect(modPow(2n, 10n, 1000n)).toBe(24n);
      expect(modPow(3n, 7n, 11n)).toBe(9n);
      expect(modPow(5n, 3n, 13n)).toBe(8n);
    });

    test('should handle large exponents', () => {
      const result = modPow(2n, 100n, 1000000007n);
      expect(result).toBe(976371285n);
    });
  });

  describe('gcd', () => {
    test('should compute greatest common divisor', () => {
      expect(gcd(48n, 18n)).toBe(6n);
      expect(gcd(100n, 50n)).toBe(50n);
      expect(gcd(17n, 19n)).toBe(1n);
    });

    test('should handle negative numbers', () => {
      expect(gcd(-48n, 18n)).toBe(6n);
      expect(gcd(48n, -18n)).toBe(6n);
    });
  });

  describe('extendedGcd', () => {
    test('should compute extended GCD', () => {
      const [g, x, y] = extendedGcd(48n, 18n);
      expect(g).toBe(6n);
      expect(48n * x + 18n * y).toBe(g);
    });
  });

  describe('modInverse', () => {
    test('should compute modular inverse', () => {
      const inv = modInverse(3n, 11n);
      expect((3n * inv) % 11n).toBe(1n);
    });

    test('should throw for non-coprime numbers', () => {
      expect(() => modInverse(6n, 9n)).toThrow();
    });
  });

  describe('isProbablePrime', () => {
    test('should identify small primes', () => {
      expect(isProbablePrime(2n)).toBe(true);
      expect(isProbablePrime(3n)).toBe(true);
      expect(isProbablePrime(5n)).toBe(true);
      expect(isProbablePrime(7n)).toBe(true);
      expect(isProbablePrime(11n)).toBe(true);
    });

    test('should identify composites', () => {
      expect(isProbablePrime(4n)).toBe(false);
      expect(isProbablePrime(6n)).toBe(false);
      expect(isProbablePrime(8n)).toBe(false);
      expect(isProbablePrime(9n)).toBe(false);
    });

    test('should handle large primes', () => {
      const largePrime = 2n ** 127n - 1n; // Mersenne prime
      expect(isProbablePrime(largePrime)).toBe(true);
    });
  });

  describe('bitLength', () => {
    test('should compute bit length', () => {
      expect(bitLength(0n)).toBe(0);
      expect(bitLength(1n)).toBe(1);
      expect(bitLength(2n)).toBe(2);
      expect(bitLength(3n)).toBe(2);
      expect(bitLength(4n)).toBe(3);
      expect(bitLength(255n)).toBe(8);
      expect(bitLength(256n)).toBe(9);
    });
  });

  describe('setBit', () => {
    test('should set specific bits', () => {
      expect(setBit(0n, 0)).toBe(1n);
      expect(setBit(0n, 1)).toBe(2n);
      expect(setBit(0n, 2)).toBe(4n);
      expect(setBit(1n, 1)).toBe(3n);
    });
  });
});

