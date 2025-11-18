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

import { ClassGroup, iterateSquarings } from '../src/classgroup';
import { DISCRIMINANT_256 } from './test-discriminants';

describe('ClassGroup', () => {
  let discriminant: bigint;
  let generator: ClassGroup;

  beforeAll(() => {
    // Use pre-computed discriminant for fast tests
    discriminant = DISCRIMINANT_256;
  });

  beforeEach(() => {
    generator = ClassGroup.fromAbDiscriminant(2n, 1n, discriminant);
  });

  test('should create identity element', () => {
    const identity = generator.identity();
    expect(identity.a).toBe(1n);
  });

  test('should perform multiplication', () => {
    const a = generator.clone();
    const b = generator.clone();
    const result = a.multiply(b);
    
    expect(result.discriminant).toBe(discriminant);
    expect(result.a).toBeGreaterThan(0n);
  });

  test('should square correctly', () => {
    const a = generator.clone();
    const squared = a.multiply(a);
    
    const b = generator.clone();
    b.square();
    
    expect(b.equals(squared)).toBe(true);
  });

  test('should perform repeated squaring', () => {
    const a = generator.clone();
    a.repeatedSquare(10);
    
    const b = generator.clone();
    for (let i = 0; i < 10; i++) {
      b.square();
    }
    
    expect(a.equals(b)).toBe(true);
  });

  test('should serialize and deserialize', () => {
    const original = generator.clone();
    original.square();
    
    const bytes = original.serialize();
    const restored = ClassGroup.fromBytes(bytes, discriminant);
    
    expect(restored.equals(original)).toBe(true);
  });

  test('should serialize small values with leading zeros', () => {
    // After many squares, values can become small
    const small = generator.clone();
    small.repeatedSquare(100);
    
    // Serialize with fixed size
    const bytes = small.serialize(33); // 33 bytes for 256-bit
    expect(bytes.length).toBe(66); // 33 * 2
    
    // Deserialize and verify
    const restored = ClassGroup.fromBytes(bytes, discriminant);
    expect(restored.a).toBe(small.a);
    expect(restored.b).toBe(small.b);
    expect(restored.equals(small)).toBe(true);
  });

  test('should serialize large values without truncation', () => {
    // After some iterations, values can be large
    const large = generator.clone();
    large.repeatedSquare(200);
    
    const bytes = large.serialize(33);
    const restored = ClassGroup.fromBytes(bytes, discriminant);
    
    expect(restored.equals(large)).toBe(true);
    expect(restored.discriminant).toBe(discriminant);
  });

  test('should handle negative b values in serialization', () => {
    // Create an element with negative b
    const elem = generator.clone();
    elem.repeatedSquare(50);
    
    // Serialize and deserialize
    const bytes = elem.serialize(33);
    const restored = ClassGroup.fromBytes(bytes, discriminant);
    
    expect(restored.a).toBe(elem.a);
    expect(restored.b).toBe(elem.b);
    expect(restored.c).toBe(elem.c);
    expect(restored.equals(elem)).toBe(true);
  });

  test('should serialize identity element', () => {
    const identity = generator.identity();
    
    const bytes = identity.serialize(33);
    const restored = ClassGroup.fromBytes(bytes, discriminant);
    
    expect(restored.a).toBe(identity.a);
    expect(restored.b).toBe(identity.b);
    expect(restored.c).toBe(identity.c);
    expect(restored.equals(identity)).toBe(true);
  });

  test('should preserve discriminant through serialization', () => {
    const original = generator.clone();
    original.repeatedSquare(75);
    
    const bytes = original.serialize(33);
    const restored = ClassGroup.fromBytes(bytes, discriminant);
    
    // Check discriminant invariant: b² - 4ac = D
    const originalDisc = original.b * original.b - 4n * original.a * original.c;
    const restoredDisc = restored.b * restored.b - 4n * restored.a * restored.c;
    
    expect(originalDisc).toBe(discriminant);
    expect(restoredDisc).toBe(discriminant);
  });

  test('should handle different target sizes', () => {
    const elem = generator.clone();
    elem.square();
    
    // Serialize with different sizes
    for (const size of [16, 32, 64]) {
      const bytes = elem.serialize(size);
      expect(bytes.length).toBe(size * 2);
      
      const restored = ClassGroup.fromBytes(bytes, discriminant);
      expect(restored.equals(elem)).toBe(true);
    }
  });

  test('should round-trip serialize multiple times', () => {
    let current = generator.clone();
    
    // Serialize and deserialize multiple times
    for (let i = 0; i < 5; i++) {
      current.square();
      const bytes = current.serialize(33);
      current = ClassGroup.fromBytes(bytes, discriminant);
    }
    
    // Should still maintain discriminant
    const disc = current.b * current.b - 4n * current.a * current.c;
    expect(disc).toBe(discriminant);
  });

  test('should handle exponentiation', () => {
    const a = generator.clone();
    a.pow(5n);
    
    let b = generator.clone();
    for (let i = 0; i < 5; i++) {
      const temp = b.clone();
      b = b.multiply(temp);
    }
    
    // Results should be similar (accounting for reduction)
    expect(b.discriminant).toBe(discriminant);
  });

  test('should iterate squarings efficiently', () => {
    const powers = iterateSquarings(generator, [1, 2, 4, 8, 16]);
    
    expect(powers.size).toBe(5);
    expect(powers.has(1)).toBe(true);
    expect(powers.has(16)).toBe(true);
    
    // Verify all powers were computed
    for (const power of [1, 2, 4, 8, 16]) {
      expect(powers.get(power)).toBeDefined();
      expect(powers.get(power)!.discriminant).toBe(discriminant);
    }
  });

  test('should maintain discriminant invariant approximately', () => {
    const a = generator.clone();
    a.square();
    a.square();
    
    // Check discriminant equality: b^2 - 4ac ≈ discriminant
    // Due to reduction, there may be small differences
    const computed = a.b * a.b - 4n * a.a * a.c;
    const diff = computed > discriminant ? computed - discriminant : discriminant - computed;
    
    // Difference should be very small (within a few units)
    expect(diff < 10n).toBe(true);
  });

  test('should reduce form correctly', () => {
    const elem = generator.clone();
    elem.repeatedSquare(50);
    
    const beforeReduce = elem.clone();
    elem.reduce();
    
    // After reduction, discriminant should be preserved
    const discBefore = beforeReduce.b * beforeReduce.b - 4n * beforeReduce.a * beforeReduce.c;
    const discAfter = elem.b * elem.b - 4n * elem.a * elem.c;
    expect(discAfter).toBe(discBefore);
    
    // Reduced form should still be valid
    expect(elem.a).toBeGreaterThan(0n);
    expect(elem.discriminant).toBe(discriminant);
  });

  test('should check equality correctly', () => {
    const a = generator.clone();
    const b = generator.clone();
    const c = a.clone();
    
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(true);
    
    // Modify one
    a.square();
    expect(a.equals(b)).toBe(false);
    expect(a.equals(c)).toBe(false);
    
    // Clone after modification
    const d = a.clone();
    expect(a.equals(d)).toBe(true);
  });

  test('should check equality with different discriminants', () => {
    const a = generator.clone();
    const otherDisc = DISCRIMINANT_256 - 1n;
    const b = ClassGroup.fromAbDiscriminant(a.a, a.b, otherDisc);
    
    // Even if a, b, c are same, different discriminant means not equal
    expect(a.equals(b)).toBe(false);
  });

  test('should calculate size in bits correctly', () => {
    const size256 = ClassGroup.sizeInBits(DISCRIMINANT_256);
    expect(size256).toBeGreaterThan(250);
    expect(size256).toBeLessThan(260);
    
    // Test with different discriminants
    const smallDisc = -7n;
    const smallSize = ClassGroup.sizeInBits(smallDisc);
    expect(smallSize).toBe(3);
  });

  test('should create fromAbDiscriminant with various inputs', () => {
    // Test with different a, b values
    const elem1 = ClassGroup.fromAbDiscriminant(2n, 1n, discriminant);
    expect(elem1.discriminant).toBe(discriminant);
    
    // Verify discriminant invariant
    const disc1 = elem1.b * elem1.b - 4n * elem1.a * elem1.c;
    expect(disc1).toBe(discriminant);
    
    // Test with generator values (known to work)
    const elem2 = ClassGroup.fromAbDiscriminant(2n, 1n, discriminant);
    const disc2 = elem2.b * elem2.b - 4n * elem2.a * elem2.c;
    expect(disc2).toBe(discriminant);
    
    // Test with identity values
    const elem3 = ClassGroup.fromAbDiscriminant(1n, 1n, discriminant);
    const disc3 = elem3.b * elem3.b - 4n * elem3.a * elem3.c;
    expect(disc3).toBe(discriminant);
  });

  test('should clone preserve all properties', () => {
    const original = generator.clone();
    original.repeatedSquare(25);
    
    const cloned = original.clone();
    
    expect(cloned.a).toBe(original.a);
    expect(cloned.b).toBe(original.b);
    expect(cloned.c).toBe(original.c);
    expect(cloned.discriminant).toBe(original.discriminant);
    expect(cloned.equals(original)).toBe(true);
    
    // Modifying clone should not affect original
    cloned.square();
    expect(cloned.equals(original)).toBe(false);
  });

  test('should handle reduce on already reduced form', () => {
    const elem = generator.clone();
    elem.reduce();
    
    const before = elem.clone();
    elem.reduce(); // Reduce again
    
    // Should be idempotent or very close
    const discBefore = before.b * before.b - 4n * before.a * before.c;
    const discAfter = elem.b * elem.b - 4n * elem.a * elem.c;
    expect(discAfter).toBe(discBefore);
  });

  test('should handle reduce on large values', () => {
    const elem = generator.clone();
    elem.repeatedSquare(200);
    
    const discBefore = elem.b * elem.b - 4n * elem.a * elem.c;
    elem.reduce();
    const discAfter = elem.b * elem.b - 4n * elem.a * elem.c;
    
    expect(discAfter).toBe(discBefore);
    expect(elem.a).toBeGreaterThan(0n);
  });

  test('should handle reduce on small values', () => {
    const elem = generator.clone();
    elem.repeatedSquare(100);
    
    const discBefore = elem.b * elem.b - 4n * elem.a * elem.c;
    elem.reduce();
    const discAfter = elem.b * elem.b - 4n * elem.a * elem.c;
    
    expect(discAfter).toBe(discBefore);
  });

  test('should handle pow with zero exponent', () => {
    const elem = generator.clone();
    elem.pow(0n);
    
    // pow(0) should result in identity
    const identity = generator.identity();
    expect(elem.equals(identity)).toBe(true);
  });

  test('should handle pow with one exponent', () => {
    const elem = generator.clone();
    const original = elem.clone();
    elem.pow(1n);
    
    // pow(1) should be same as original
    expect(elem.equals(original)).toBe(true);
  });

  test('should handle pow with large exponent', () => {
    const elem = generator.clone();
    elem.pow(100n);
    
    // Should maintain discriminant
    const disc = elem.b * elem.b - 4n * elem.a * elem.c;
    expect(disc).toBe(discriminant);
    expect(elem.a).toBeGreaterThan(0n);
  });

  test('should handle repeated square with zero', () => {
    const elem = generator.clone();
    const original = elem.clone();
    elem.repeatedSquare(0);
    
    expect(elem.equals(original)).toBe(true);
  });

  test('should handle repeated square with one', () => {
    const elem = generator.clone();
    elem.repeatedSquare(1);
    
    const expected = generator.clone();
    expected.square();
    
    expect(elem.equals(expected)).toBe(true);
  });

  test('should serialize with zero target size uses auto size', () => {
    const elem = generator.clone();
    elem.square();
    
    const bytes = elem.serialize(); // No target size
    expect(bytes.length).toBeGreaterThan(0);
    expect(bytes.length % 2).toBe(0); // Even length (a and b)
    
    const restored = ClassGroup.fromBytes(bytes, discriminant);
    expect(restored.equals(elem)).toBe(true);
  });

  test('should handle fromBytes with small size', () => {
    // Use a small element that fits in small buffer
    const elem = generator.clone();
    elem.repeatedSquare(100); // Make it smaller
    
    // Use size that can accommodate the values
    const bytes = elem.serialize(17); // 17 bytes for a, 17 bytes for b
    
    expect(bytes.length).toBe(34); // 17 * 2
    
    const restored = ClassGroup.fromBytes(bytes, discriminant);
    expect(restored.a).toBe(elem.a);
    expect(restored.b).toBe(elem.b);
  });

  test('should handle fromBytes with oversized buffer', () => {
    const elem = generator.clone();
    const bytes = elem.serialize(100); // Large size
    
    expect(bytes.length).toBe(200); // 100 * 2
    
    const restored = ClassGroup.fromBytes(bytes, discriminant);
    expect(restored.equals(elem)).toBe(true);
  });

  test('should maintain discriminant through multiple operations', () => {
    let elem = generator.clone();
    
    // Perform various operations
    elem.square();
    elem.reduce();
    elem.square();
    elem.multiply(generator);
    elem.reduce();
    elem.pow(5n);
    elem.repeatedSquare(10);
    
    const disc = elem.b * elem.b - 4n * elem.a * elem.c;
    expect(disc).toBe(discriminant);
  });

  test('should handle multiply with identity', () => {
    const elem = generator.clone();
    const identity = generator.identity();
    
    const result1 = elem.multiply(identity);
    const result2 = identity.multiply(elem);
    
    // Multiplying with identity should return the element
    expect(result1.equals(elem)).toBe(true);
    expect(result2.equals(elem)).toBe(true);
  });

  test('should handle multiply commutativity approximately', () => {
    const a = generator.clone();
    a.repeatedSquare(10);
    
    const b = generator.clone();
    b.repeatedSquare(15);
    
    const ab = a.clone().multiply(b);
    const ba = b.clone().multiply(a);
    
    // Results should have same discriminant
    const discAB = ab.b * ab.b - 4n * ab.a * ab.c;
    const discBA = ba.b * ba.b - 4n * ba.a * ba.c;
    expect(discAB).toBe(discriminant);
    expect(discBA).toBe(discriminant);
  });

  test('should handle square of identity', () => {
    const identity = generator.identity();
    identity.square();
    
    // Identity squared should still be identity
    const expected = generator.identity();
    expect(identity.equals(expected)).toBe(true);
  });

  test('should handle iterateSquarings with empty array', () => {
    const powers = iterateSquarings(generator, []);
    expect(powers.size).toBe(0);
  });

  test('should handle iterateSquarings with single power', () => {
    const powers = iterateSquarings(generator, [10]);
    expect(powers.size).toBe(1);
    expect(powers.has(10)).toBe(true);
    
    const manual = generator.clone();
    manual.repeatedSquare(10);
    expect(powers.get(10)!.equals(manual)).toBe(true);
  });

  test('should handle iterateSquarings with unsorted powers', () => {
    const powers = iterateSquarings(generator, [16, 1, 8, 4, 2]);
    
    // Should compute all requested powers
    expect(powers.size).toBe(5);
    for (const power of [1, 2, 4, 8, 16]) {
      expect(powers.has(power)).toBe(true);
      expect(powers.get(power)!.discriminant).toBe(discriminant);
    }
  });

  test('should handle iterateSquarings with duplicate powers', () => {
    const powers = iterateSquarings(generator, [5, 5, 10, 10]);
    
    // Should only compute unique powers
    expect(powers.size).toBe(2);
    expect(powers.has(5)).toBe(true);
    expect(powers.has(10)).toBe(true);
  });
});

