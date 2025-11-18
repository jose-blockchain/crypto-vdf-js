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
  InvalidIterations
} from '../src/index';

// NOTE: Full VDF solve/verify tests are in tests/manual/test-vdf-complete.js
// They are too slow for Jest and can hang the test suite.
// Run them with: npm run test:vdf
// 
// This file contains only fast validation/unit tests.

describe('Pietrzak VDF', () => {
  test('should validate difficulty requirements', () => {
    const vdf = new PietrzakVDFParams(256).new();
    
    // Should accept even numbers >= 66
    expect(() => vdf.checkDifficulty(66)).not.toThrow();
    expect(() => vdf.checkDifficulty(100)).not.toThrow();
    
    // Should reject odd numbers
    expect(() => vdf.checkDifficulty(67)).toThrow(InvalidIterations);
    
    // Should reject numbers < 66
    expect(() => vdf.checkDifficulty(64)).toThrow(InvalidIterations);
  });

  test('should create VDF instances with different bit sizes', () => {
    const vdf256 = new PietrzakVDFParams(256).new();
    const vdf512 = new PietrzakVDFParams(512).new();
    
    expect(vdf256.intSizeBits).toBe(256);
    expect(vdf512.intSizeBits).toBe(512);
  });
});

describe('Wesolowski VDF', () => {
  test('should accept any positive difficulty', () => {
    const vdf = new WesolowskiVDFParams(256).new();
    
    // Should accept any positive number
    expect(() => vdf.checkDifficulty(1)).not.toThrow();
    expect(() => vdf.checkDifficulty(50)).not.toThrow();
    
    // Should reject non-positive
    expect(() => vdf.checkDifficulty(0)).toThrow(InvalidIterations);
  });

  test('should create VDF instances with different bit sizes', () => {
    const vdf256 = new WesolowskiVDFParams(256).new();
    const vdf512 = new WesolowskiVDFParams(512).new();
    
    expect(vdf256.intSizeBits).toBe(256);
    expect(vdf512.intSizeBits).toBe(512);
  });
});

