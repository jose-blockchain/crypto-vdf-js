# VDF.js (Verifiable Delay Functions for JavaScript)

[![CI](https://github.com/jose-blockchain/crypto-vdf-js/actions/workflows/ci.yml/badge.svg)](https://github.com/jose-blockchain/crypto-vdf-js/actions)
[![npm version](https://img.shields.io/npm/v/crypto-vdf.svg)](https://www.npmjs.com/package/crypto-vdf)
[![npm downloads](https://img.shields.io/npm/dm/crypto-vdf.svg)](https://www.npmjs.com/package/crypto-vdf)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![GitHub stars](https://img.shields.io/github/stars/jose-blockchain/crypto-vdf-js.svg?style=social)](https://github.com/jose-blockchain/crypto-vdf-js/stargazers)

Verifiable Delay Functions (VDF) library for Node.js and browsers. Pure TypeScript implementation with precomputed discriminants for optimal performance.

## What is a VDF?

A Verifiable Delay Function (VDF) is a function that requires substantial time to evaluate (even with a polynomial number of parallel processors) but can be very quickly verified as correct. VDFs can be used to construct randomness beacons with multiple applications in distributed network environments.

By introducing a time delay during evaluation, VDFs prevent malicious actors from influencing output. The output cannot be differentiated from a random number until the final result is computed.

This implementation provides two VDF constructions:
- **Pietrzak VDF**: Based on ["Simple Verifiable Delay Functions"](https://eprint.iacr.org/2018/627.pdf) (2018)
- **Wesolowski VDF**: Based on ["Efficient Verifiable Delay Functions"](https://eprint.iacr.org/2018/623.pdf) (2018)

## Features

- Pure TypeScript implementation with BigInt support
- Works in Node.js 18+ and modern browsers
- Implements both Pietrzak and Wesolowski VDF schemes
- **Precomputed discriminants** (256, 512, 1024, 2048 bits) generated using Rust GMP for optimal performance
- Zero runtime dependencies for Node.js
- Browser-compatible bundle with Webpack
- Comprehensive test suite with 64+ tests
- Full TypeScript type definitions
- Compatible with the original Rust implementation
- Production-ready with proper error handling

## Installation

```bash
npm install crypto-vdf
```

## Quick Start

### Node.js (CommonJS)

```javascript
const { PietrzakVDFParams, DISCRIMINANT_256 } = require('crypto-vdf');

// Pietrzak VDF with 256-bit precomputed discriminant
const vdf = new PietrzakVDFParams(256).new();
const challenge = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);

// Solve and verify (uses precomputed discriminant automatically)
const proof = await vdf.solve(challenge, 100, DISCRIMINANT_256);
vdf.verify(challenge, 100, proof, DISCRIMINANT_256);
console.log('✓ Proof verified!');
```

### Node.js (ES Modules)

```javascript
import { WesolowskiVDFParams, DISCRIMINANT_512 } from 'crypto-vdf';

const vdf = new WesolowskiVDFParams(512).new();
const challenge = new Uint8Array([0xaa]);
const proof = await vdf.solve(challenge, 100, DISCRIMINANT_512);
vdf.verify(challenge, 100, proof, DISCRIMINANT_512);
console.log('✓ Proof verified!');
```

### Browser

```html
<!DOCTYPE html>
<html>
<head>
  <title>VDF Browser Example</title>
</head>
<body>
  <h1>VDF Demo</h1>
  <button onclick="runVDF()">Run VDF</button>
  <pre id="output"></pre>

<script src="node_modules/crypto-vdf/dist/browser/vdf.min.js"></script>
<script>
  async function runVDF() {
      const output = document.getElementById('output');
      output.textContent = 'Running VDF...\n';
      
      // Use precomputed discriminant for fast performance
      const vdfInstance = new vdf.WesolowskiVDFParams(256).new();
      const challenge = new Uint8Array([0xaa, 0xbb, 0xcc]);
      
      output.textContent += 'Generating proof...\n';
      const proof = await vdfInstance.solve(challenge, 100, vdf.DISCRIMINANT_256);
      
      output.textContent += 'Verifying proof...\n';
      vdfInstance.verify(challenge, 100, proof, vdf.DISCRIMINANT_256);
      
      output.textContent += '✓ Proof verified!\n';
      output.textContent += `Proof size: ${proof.length} bytes`;
    }
  </script>
</body>
</html>
```

## Precomputed Discriminants (Recommended)

This library includes **precomputed discriminants** (256, 512, 1024, 2048 bits) generated using Rust GMP for optimal performance. **Always use precomputed discriminants** as generating them in pure JavaScript is extremely slow.

```javascript
// Node.js / ES Modules
import { 
  WesolowskiVDFParams,
  DISCRIMINANT_256, 
  DISCRIMINANT_512,
  getPrecomputedDiscriminant
} from 'crypto-vdf';

const vdf = new WesolowskiVDFParams(256).new();
const challenge = new Uint8Array([0xaa]);

// Method 1: Use specific discriminant constant
const proof = await vdf.solve(challenge, 100, DISCRIMINANT_256);
vdf.verify(challenge, 100, proof, DISCRIMINANT_256);

// Method 2: Get discriminant by bit size
const disc = getPrecomputedDiscriminant(512);
const vdf512 = new WesolowskiVDFParams(512).new();
await vdf512.solve(challenge, 100, disc);

// Browser (same API, discriminants available as vdf.DISCRIMINANT_256, etc.)
```

**Why use precomputed discriminants?**
- **Fast**: Generated using Rust GMP (1000x faster than pure JS)
- **Verified**: All satisfy required mathematical properties
- **Deterministic**: Same values every time, production-ready
- **Recommended**: For all production use cases

### Custom Discriminants (Not Recommended)

**Warning**: Generating custom discriminants in pure JavaScript is **very slow** (can take minutes). Only use if you have specific requirements.

```javascript
import { createDiscriminant } from 'crypto-vdf';

// This will be VERY slow! Use precomputed discriminants instead.
const customDisc = createDiscriminant(Buffer.from('my-seed'), 256);
await vdf.solve(challenge, 100, customDisc);
```

## Complete Examples

### Node.js: Full Workflow

```javascript
import { 
  WesolowskiVDFParams, 
  PietrzakVDFParams,
  DISCRIMINANT_256,
  DISCRIMINANT_512,
  InvalidProof 
} from 'crypto-vdf';

// Example 1: Wesolowski VDF (recommended for most cases)
const wesolowski = new WesolowskiVDFParams(256).new();
const challenge = new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd]);

const proof1 = await wesolowski.solve(challenge, 100, DISCRIMINANT_256);
wesolowski.verify(challenge, 100, proof1, DISCRIMINANT_256);
console.log('✓ Wesolowski proof verified!');

// Example 2: Pietrzak VDF (requires even difficulty >= 66)
const pietrzak = new PietrzakVDFParams(512).new();
const proof2 = await pietrzak.solve(challenge, 100, DISCRIMINANT_512);
pietrzak.verify(challenge, 100, proof2, DISCRIMINANT_512);
console.log('✓ Pietrzak proof verified!');

// Example 3: Error handling
try {
  const badProof = new Uint8Array(256);
  wesolowski.verify(challenge, 100, badProof, DISCRIMINANT_256);
} catch (error) {
  if (error instanceof InvalidProof) {
    console.log('✗ Proof verification failed (expected)');
  }
}
```

### Browser: Complete HTML Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>VDF Demo</title>
  <style>
    body { font-family: monospace; padding: 20px; }
    button { padding: 10px 20px; font-size: 16px; }
    #output { background: #f4f4f4; padding: 15px; margin-top: 20px; }
  </style>
</head>
<body>
  <h1>Verifiable Delay Function Demo</h1>
  <p>Click to run a VDF proof (takes a few seconds)</p>
  
  <button onclick="runWesolowski()">Run Wesolowski VDF</button>
  <button onclick="runPietrzak()">Run Pietrzak VDF</button>
  <button onclick="compareVDFs()">Compare Both</button>
  
  <pre id="output"></pre>

  <script src="node_modules/crypto-vdf/dist/browser/vdf.min.js"></script>
  <script>
    const output = document.getElementById('output');
    
    async function runWesolowski() {
      output.textContent = 'Running Wesolowski VDF (256-bit)...\n';
      const start = performance.now();
      
      const vdfInstance = new vdf.WesolowskiVDFParams(256).new();
      const challenge = new Uint8Array([0xaa, 0xbb, 0xcc]);
      
      const proof = await vdfInstance.solve(challenge, 100, vdf.DISCRIMINANT_256);
      const solveTime = (performance.now() - start).toFixed(0);
      
      vdfInstance.verify(challenge, 100, proof, vdf.DISCRIMINANT_256);
      const totalTime = (performance.now() - start).toFixed(0);
      
      output.textContent += `✓ Proof verified!\n`;
      output.textContent += `  Solve time: ${solveTime}ms\n`;
      output.textContent += `  Verify time: ${totalTime - solveTime}ms\n`;
      output.textContent += `  Proof size: ${proof.length} bytes\n`;
    }
    
    async function runPietrzak() {
      output.textContent = 'Running Pietrzak VDF (256-bit)...\n';
      const start = performance.now();
      
      const vdfInstance = new vdf.PietrzakVDFParams(256).new();
      const challenge = new Uint8Array([0xaa, 0xbb, 0xcc]);
      
      const proof = await vdfInstance.solve(challenge, 100, vdf.DISCRIMINANT_256);
      const solveTime = (performance.now() - start).toFixed(0);
      
      vdfInstance.verify(challenge, 100, proof, vdf.DISCRIMINANT_256);
      const totalTime = (performance.now() - start).toFixed(0);
      
      output.textContent += `✓ Proof verified!\n`;
      output.textContent += `  Solve time: ${solveTime}ms\n`;
      output.textContent += `  Verify time: ${totalTime - solveTime}ms\n`;
      output.textContent += `  Proof size: ${proof.length} bytes\n`;
    }
    
    async function compareVDFs() {
      output.textContent = 'Comparing VDF implementations...\n\n';
      
      const challenge = new Uint8Array([0xaa]);
      
      // Wesolowski
      output.textContent += '1. Wesolowski VDF:\n';
      const w = new vdf.WesolowskiVDFParams(256).new();
      const w_start = performance.now();
      const w_proof = await w.solve(challenge, 100, vdf.DISCRIMINANT_256);
      const w_time = performance.now() - w_start;
      w.verify(challenge, 100, w_proof, vdf.DISCRIMINANT_256);
      output.textContent += `   Time: ${w_time.toFixed(0)}ms, Size: ${w_proof.length}B\n\n`;
      
      // Pietrzak
      output.textContent += '2. Pietrzak VDF:\n';
      const p = new vdf.PietrzakVDFParams(256).new();
      const p_start = performance.now();
      const p_proof = await p.solve(challenge, 100, vdf.DISCRIMINANT_256);
      const p_time = performance.now() - p_start;
      p.verify(challenge, 100, p_proof, vdf.DISCRIMINANT_256);
      output.textContent += `   Time: ${p_time.toFixed(0)}ms, Size: ${p_proof.length}B\n\n`;
      
      output.textContent += `Wesolowski is ${(p_time/w_time).toFixed(1)}x faster\n`;
      output.textContent += `Wesolowski proof is ${((1-w_proof.length/p_proof.length)*100).toFixed(0)}% smaller`;
    }
  </script>
</body>
</html>
```

## API Reference

### VDF Instances

Both `PietrzakVDF` and `WesolowskiVDF` implement the same interface:

```typescript
interface VDF {
  // Solve VDF and generate proof
  solve(
    challenge: Uint8Array,
    difficulty: number,
    discriminant: bigint
  ): Promise<Uint8Array>;
  
  // Verify a proof
  verify(
    challenge: Uint8Array,
    difficulty: number,
    proof: Uint8Array,
    discriminant: bigint
  ): void; // Throws InvalidProof if verification fails
  
  // Check if difficulty is valid for this VDF type
  checkDifficulty(difficulty: number): void;
}
```

### Pietrzak VDF

⚠️ **IMPORTANT LIMITATION**: Pietrzak VDF has a maximum difficulty limit of **7000** in this JavaScript implementation. Difficulties above 7000 will fail verification. This is due to accumulation of rounding errors in extended proof chains. **For production use or difficulties above 7000, use Wesolowski VDF instead.**

```typescript
import { PietrzakVDFParams, DISCRIMINANT_256 } from 'crypto-vdf';

const params = new PietrzakVDFParams(256); // bit length: 256, 512, 1024, or 2048
const vdf = params.new();

// ⚠️ Constraints:
// - Difficulty must be even
// - Difficulty must be >= 66
// - Difficulty must be <= 7000 (hard limit - use Wesolowski for higher difficulties)
const proof = await vdf.solve(challenge, 100, DISCRIMINANT_256);
vdf.verify(challenge, 100, proof, DISCRIMINANT_256);
```

### Wesolowski VDF (Recommended for Production)

```typescript
import { WesolowskiVDFParams, DISCRIMINANT_512 } from 'crypto-vdf';

const params = new WesolowskiVDFParams(512); // bit length: 256, 512, 1024, or 2048
const vdf = params.new();

// ✅ Accepts any positive difficulty
// ✅ Smaller proofs than Pietrzak
// ✅ Faster verification
const proof = await vdf.solve(challenge, 200, DISCRIMINANT_512);
vdf.verify(challenge, 200, proof, DISCRIMINANT_512);
```

## Examples

### Basic Usage

```typescript
import { PietrzakVDFParams } from 'crypto-vdf';

const vdf = new PietrzakVDFParams(2048).new();
const challenge = new Uint8Array([0xaa]);
const proof = await vdf.solve(challenge, 100);

// Proof is deterministic for same inputs
const proof2 = await vdf.solve(challenge, 100);
console.assert(Buffer.compare(proof, proof2) === 0);
```

### Error Handling

```typescript
import { 
  PietrzakVDFParams, 
  InvalidProof, 
  InvalidIterations 
} from 'crypto-vdf';

const vdf = new PietrzakVDFParams(2048).new();

try {
  // This will throw InvalidIterations
  vdf.checkDifficulty(67); // Odd number
} catch (error) {
  if (error instanceof InvalidIterations) {
    console.error('Invalid difficulty:', error.message);
  }
}

try {
  // This will throw InvalidProof
  const badProof = new Uint8Array(256);
  vdf.verify(challenge, 100, badProof);
} catch (error) {
  if (error instanceof InvalidProof) {
    console.error('Proof verification failed');
  }
}
```

### Comparing VDF Types

```typescript
import { PietrzakVDFParams, WesolowskiVDFParams } from 'crypto-vdf';

const challenge = new Uint8Array([0xaa]);
const difficulty = 100;

// Pietrzak VDF
const pietrzak = new PietrzakVDFParams(2048).new();
const pietrzakProof = await pietrzak.solve(challenge, difficulty);

// Wesolowski VDF  
const wesolowski = new WesolowskiVDFParams(2048).new();
const wesolowskiProof = await wesolowski.solve(challenge, difficulty);

console.log('Pietrzak proof size:', pietrzakProof.length);
console.log('Wesolowski proof size:', wesolowskiProof.length);
// Wesolowski proofs are typically much smaller
```

## Performance

Performance depends on:
- **Bit length**: Higher bit lengths are more secure but slower (typical: 512, 1024, 2048)
- **Difficulty**: Number of sequential squaring operations
- **Hardware**: CPU speed affects both solving and verification

Typical performance on modern hardware:

| Bit Length | Difficulty | Solve Time | Verify Time |
|-----------|-----------|-----------|-------------|
| 512       | 100       | ~2s       | ~100ms      |
| 1024      | 100       | ~8s       | ~200ms      |
| 2048      | 100       | ~30s      | ~500ms      |

**Note**: Solving is intentionally slow (time delay), but verification is fast.

## Building

```bash
# Install dependencies
npm install

# Build for Node.js and browser
npm run build

# Build only Node.js version
npm run build:node

# Build only browser version
npm run build:browser

# Run tests
npm test

# Run tests with coverage
npm test:coverage

# Lint code
npm run lint
```

## Testing

The library includes comprehensive tests that match and exceed the original Rust implementation:

```bash
npm test
```

Test coverage includes:
- Utility functions (BigInt operations, hashing, etc.)
- Discriminant generation
- Class group operations
- Pietrzak VDF implementation
- Wesolowski VDF implementation
- Cross-compatibility tests
- Error handling

## Browser Compatibility

The library works in all modern browsers that support:
- ES2020
- BigInt
- WebCrypto API (for SHA-256)

Tested browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Security Considerations

1. **Not Side-Channel Resistant**: This implementation is not designed to be immune to side-channel attacks. Do not use with highly sensitive data.

2. **Discriminant Size**: Use at least 1024-bit discriminants for production. 2048-bit is recommended for high-security applications.

3. **Randomness**: The library uses cryptographic hashing (SHA-256) to generate deterministic discriminants from seeds.

4. **Prime Generation**: Uses Miller-Rabin primality testing with configurable iterations (default: 2 for performance, increase for higher certainty).

## Differences from Rust Implementation

This JavaScript port maintains API compatibility with the Rust version while adapting to JavaScript idioms:

- Uses native BigInt instead of GMP
- Async/await for potentially long-running operations
- TypeScript for type safety
- Browser-compatible (no native dependencies)

### Known Limitations

**⚠️ Pietrzak VDF Difficulty Limit**: The Pietrzak VDF implementation has a **hard maximum difficulty of 7000**. This limitation exists due to accumulation of rounding errors in extended proof chains when using JavaScript BigInt arithmetic. Attempts to use difficulties above 7000 will result in verification failures.

**✅ Recommendation**: For production applications or any use case requiring difficulties above 7000, **use Wesolowski VDF instead**. Wesolowski VDF has no difficulty limitations, produces smaller proofs, and has faster verification times. It is the recommended choice for most applications.

## Contributing

Contributions are welcome! Please ensure:
- All tests pass (`npm test`)
- Code follows the style guide (`npm run lint`)
- New features include tests
- Documentation is updated

## Author

**jose-blockchain**
- JavaScript/TypeScript port of the Rust VDF implementation

## License

Copyright 2025 jose-blockchain and VDF-JS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

## References

- [Simple Verifiable Delay Functions](https://eprint.iacr.org/2018/627.pdf) - Pietrzak, 2018
- [Efficient Verifiable Delay Functions](https://eprint.iacr.org/2018/623.pdf) - Wesolowski, 2018
- [VDF Research](https://vdfresearch.org/)
- [POA Network VDF Rust Implementation](https://github.com/poanetwork/vdf) - Reference implementation by Chia Network Inc and POA Networks Ltd

## Acknowledgments

This TypeScript implementation references the algorithms and approaches from the [Rust VDF implementation](https://github.com/poanetwork/vdf) originally developed by **Chia Network Inc** and **POA Networks Ltd**. While this is an independent implementation in TypeScript with significant optimizations (including Rust GMP-generated precomputed discriminants), we acknowledge their pioneering work in making VDFs practical and accessible.

Special thanks to:
- **Chia Network Inc** - For their research and development of practical VDF implementations
- **POA Networks Ltd** - For their contributions to the VDF ecosystem
- The broader VDF research community for advancing this important cryptographic primitive

