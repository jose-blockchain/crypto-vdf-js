# Testing Guide

## Overview

The crypto-vdf library uses a hybrid testing approach:
- **Jest** for fast unit tests
- **Node.js scripts** for slow integration tests

## Quick Start

```bash
# Run all tests (unit + integration)
npm test

# Run only fast unit tests
npm run test:unit

# Run only VDF integration tests (precomputed discriminants)
npm run test:vdf:quick

# Run all integration tests including slow ones
RUN_SLOW_TESTS=1 npm run test:vdf
```

## Test Structure

### Unit Tests (Jest)

Located in `tests/*.test.ts`:

**utils.test.ts** - BigInt utilities
- bytesToBigInt/bigIntToBytes (two's complement)
- modPow, gcd, extendedGcd
- modInverse, isProbablePrime
- bitLength, setBit

**classgroup.test.ts** - Binary quadratic forms
- Creation and identity elements
- Multiplication and squaring
- Repeated squaring
- **Serialization (comprehensive)**:
  - Small values with leading zeros
  - Large values without truncation
  - Negative b values (two's complement)
  - Identity element
  - Discriminant preservation
  - Different target sizes
  - Round-trip serialization
- Exponentiation
- Discriminant invariant

**discriminant.test.ts** - Discriminant generation
- Valid discriminant constants
- Discriminant properties (≡ 1 mod 8)
- Class group form compatibility

**vdf.test.ts** - VDF API validation
- Difficulty requirements (Pietrzak: even ≥66, Wesolowski: positive)
- Instance creation

**Time:** ~9 seconds total

### Integration Tests (Node.js)

Located in `tests/manual/test-vdf-complete.js`:

#### Fast Tests (Default)
Uses precomputed discriminants:
- Pietrzak 256-bit, difficulty 66
- Pietrzak 512-bit, difficulty 100
- Wesolowski 256-bit, difficulty 66
- Wesolowski 512-bit, difficulty 100

**Time:** ~100ms

#### Slow Tests (RUN_SLOW_TESTS=1)
Generates discriminants from challenges (like Rust):
- Pietrzak 256-bit with generated discriminant
- Wesolowski 256-bit with generated discriminant

**Time:** ~40 seconds per test

## Serialization Testing

### Why Comprehensive Serialization Tests?

ClassGroup serialization is critical because:

1. **VDF proofs are serialized ClassGroup elements**
2. **Values vary dramatically** - can be small (many zeros) or large (full utilization)
3. **Two's complement** must work for negative values
4. **Discriminant must be preserved** through serialization round-trips

### What We Test

```typescript
// Small values (lots of leading zeros)
small.repeatedSquare(100);  // Results in ~31-bit values
serialize(33 bytes) → 97% zeros ✓

// Large values (full utilization)
large.repeatedSquare(200);  // Results in ~119-bit values
serialize(33 bytes) → 23% utilization ✓

// Negative b values (two's complement)
elem.b = -1234567890n
serialize → deserialize → b == -1234567890n ✓

// Different target sizes
serialize(16), serialize(32), serialize(64) ✓

// Discriminant preservation
b² - 4ac == D (before and after) ✓
```

### Understanding "Too Many Zeros"

**This is normal!** ClassGroup elements cycle through the group:

```
After 100 iterations: a=2^30 (31 bits), b=1 (1 bit)
Serialized to 33 bytes: 97% zeros (leading zero padding)

After 200 iterations: a=2^119, b=4
Serialized to 33 bytes: 23% utilization

After 512 iterations: a=2^17, b=1
Serialized to 33 bytes: 97% zeros again
```

**Both are mathematically correct!** The discriminant is preserved and proofs verify.

## Discriminant Testing

### Precomputed Discriminants

From `tests/test-discriminants.ts`:

```typescript
DISCRIMINANT_256 = -57896044...819967n
DISCRIMINANT_512 = -67039039...042047n
```

**Properties verified:**
- ✓ Negative
- ✓ D ≡ 1 (mod 8)
- ✓ D ≡ 1 (mod 4)
- ✓ -D is prime where -D ≡ 7 (mod 8)

### Generated Discriminants

The library can also generate discriminants from challenges (like Rust):

```typescript
// Generates discriminant using SHA-256 + prime search
vdf.solve(challenge, difficulty); // ~30s for 256-bit
```

Both modes are cryptographically secure.

## Running Tests in CI/CD

```yaml
# Example GitHub Actions
- name: Run tests
  run: |
    npm install
    npm run build
    npm run test:unit
    npm run test:vdf:quick
```

For slow tests:
```yaml
- name: Run slow tests
  run: RUN_SLOW_TESTS=1 npm run test:vdf
```

## Test Coverage

Current coverage:
- Utils: 17/17 tests ✓
- ClassGroup: 15/15 tests ✓
- Discriminant: 3/3 tests ✓
- VDF: 4/4 tests ✓
- Integration: 4/4 tests (fast mode) ✓

**Total: 43 tests, all passing**

## Debugging Tests

### Enable verbose output

```bash
# Jest verbose
npm run test:unit -- --verbose

# Integration test details
npm run test:vdf:quick
```

### Test specific files

```bash
# Single test file
npm run test:unit -- tests/classgroup.test.ts

# Specific test
npm run test:unit -- tests/classgroup.test.ts -t "serialize"
```

### Debug serialization

```javascript
const elem = generator.clone();
elem.repeatedSquare(100);

console.log('a:', elem.a, '(', elem.a.toString(2).length, 'bits)');
console.log('b:', elem.b, '(', elem.b.toString(2).length, 'bits)');

const bytes = elem.serialize(33);
console.log('Serialized:', bytes.length, 'bytes');
console.log('Non-zero:', Array.from(bytes).filter(b => b !== 0).length);
```

## Known Behaviors

### 1. Many Zeros in Proofs
**Normal!** ClassGroup values cycle between small and large.

### 2. Slow Discriminant Generation
**Expected!** Prime search takes 20-40 seconds. Use precomputed discriminants.

### 3. Jest Hangs on VDF Tests
**Known Issue!** Use manual Node.js tests instead (`npm run test:vdf`).

## Contributing Tests

When adding new tests:

1. **Unit tests** → Jest (tests/*.test.ts)
2. **Integration tests** → Node.js (tests/manual/*.js)
3. **Serialization tests** → classgroup.test.ts
4. **Always verify discriminant preservation** after operations

Example:
```typescript
test('should preserve discriminant after operation', () => {
  const elem = generator.clone();
  // ... do operations ...
  
  const disc = elem.b * elem.b - 4n * elem.a * elem.c;
  expect(disc).toBe(discriminant);
});
```

