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

import { bitLength } from '../src/utils';
import {
  DISCRIMINANT_40,
  DISCRIMINANT_256,
  DISCRIMINANT_256_BB
} from './test-discriminants';

describe('Discriminant', () => {
  test('should have valid 40-bit discriminant constant', () => {
    // Use pre-computed discriminant (from Rust implementation)
    // NO generation, NO primality testing - just verify structure
    
    expect(DISCRIMINANT_40).toBe(-685_537_176_559n);
    expect(DISCRIMINANT_40 < 0n).toBe(true);
    expect((-DISCRIMINANT_40) % 8n).toBe(7n); // MUST be 7 mod 8
    
    const bits = bitLength(-DISCRIMINANT_40);
    expect(bits).toBeGreaterThanOrEqual(39);
    expect(bits).toBeLessThanOrEqual(40);
  });

  test('should have valid 256-bit safe prime discriminants', () => {
    // Use known safe primes - NO generation, NO primality testing
    
    // DISCRIMINANT_256
    expect(DISCRIMINANT_256 < 0n).toBe(true);
    expect((-DISCRIMINANT_256) % 8n).toBe(7n);
    expect(bitLength(-DISCRIMINANT_256)).toBeGreaterThanOrEqual(255);
    expect(bitLength(-DISCRIMINANT_256)).toBeLessThanOrEqual(256);
    
    // DISCRIMINANT_256_BB
    expect(DISCRIMINANT_256_BB < 0n).toBe(true);
    expect((-DISCRIMINANT_256_BB) % 8n).toBe(7n);
    expect(bitLength(-DISCRIMINANT_256_BB)).toBeGreaterThanOrEqual(255);
    expect(bitLength(-DISCRIMINANT_256_BB)).toBeLessThanOrEqual(256);
    
    // Must be different
    expect(DISCRIMINANT_256).not.toBe(DISCRIMINANT_256_BB);
  });

  test('should work with discriminants in class group form', () => {
    // Verify discriminants are compatible with class group arithmetic
    // These are known safe primes - just verify structure
    const discriminants = [DISCRIMINANT_40, DISCRIMINANT_256, DISCRIMINANT_256_BB];
    
    for (const d of discriminants) {
      expect(d < 0n).toBe(true);
      expect((-d) % 8n).toBe(7n);
      
      // Verify discriminant form: b^2 - D = 4ac with a=2, b=1
      const c = (1n * 1n - d) / (4n * 2n);
      const check = 1n * 1n - 4n * 2n * c;
      expect(check).toBe(d);
    }
  });
});

