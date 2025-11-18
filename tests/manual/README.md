# Manual VDF Integration Tests

These tests are run outside of Jest because VDF operations can take a long time and cause Jest to hang.

## Quick Start

```bash
# Run fast tests (precomputed discriminants)
npm run test:vdf:quick

# Run all tests including slow ones (generated discriminants)
RUN_SLOW_TESTS=1 npm run test:vdf
```

## Test Modes

### Fast Mode (Default)
Uses **precomputed discriminants** for instant testing:
- Pietrzak 256-bit, difficulty 66
- Pietrzak 512-bit, difficulty 100  
- Wesolowski 256-bit, difficulty 66
- Wesolowski 512-bit, difficulty 100

**Time:** ~100ms total

### Slow Mode (RUN_SLOW_TESTS=1)
Includes tests that **generate discriminants from challenges** (like Rust implementation):
- Pietrzak 256-bit with generated discriminant
- Wesolowski 256-bit with generated discriminant

**Time:** ~40 seconds per test (~80s additional)

## Discriminant Generation

### Precomputed (Fast)
```javascript
// Uses a fixed, verified prime discriminant
const proof = await vdf.solve(challenge, difficulty, DISCRIMINANT_256);
```

**Advantages:**
- ✅ Instant (no prime search)
- ✅ Verified to satisfy all requirements
- ✅ Cryptographically secure
- ✅ Perfect for testing

### Generated (Rust-compatible)
```javascript
// Generates discriminant from challenge (like Rust)
const proof = await vdf.solve(challenge, difficulty);
```

**Advantages:**
- ✅ Challenge-dependent (like Rust)
- ✅ Useful for some protocols
- ✅ Demonstrates compatibility

**Disadvantages:**
- ⏱️ Takes 20-40 seconds (prime search)
- 💻 CPU intensive

## Discriminant Properties

All discriminants (precomputed and generated) must satisfy:

1. **Negative**: `D < 0`
2. **Modulo 8**: `D ≡ 1 (mod 8)`
3. **Modulo 4**: `D ≡ 1 (mod 4)`
4. **Prime**: `-D` is a prime number where `-D ≡ 7 (mod 8)`

These properties are automatically verified in the tests.

## Security Note

Both modes are **equally secure**. The discriminant does not need to be secret or unique per challenge for VDF security. Using precomputed discriminants is standard practice in many VDF implementations.

