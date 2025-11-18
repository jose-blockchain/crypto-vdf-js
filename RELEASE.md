# VDF-JS Release Notes

## Version 1.0.0 - Initial Release

### Overview
Complete JavaScript/TypeScript port of the Rust VDF (Verifiable Delay Functions) library for Node.js 18+ and modern browsers.

### Features
- **Pietrzak VDF** - Full implementation with proof generation and verification
- **Wesolowski VDF** - Full implementation with shorter proofs
- **Pure JavaScript** - BigInt-based arithmetic, no native dependencies
- **Browser Support** - Webpack bundle for browser environments
- **TypeScript** - Complete type definitions
- **Fast Tests** - Optimized test suite with pre-computed discriminants (~4 seconds)
- **Apache 2.0 License** - Same as original Rust implementation

### Supported Platforms
- Node.js 18.0.0+
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance
- **256-bit discriminant, 66 iterations**: ~1-2 seconds (solve), <100ms (verify)
- **512-bit discriminant, 100 iterations**: ~4-8 seconds (solve), <200ms (verify)
- **1024-bit discriminant, 100 iterations**: ~15-30 seconds (solve), <500ms (verify)

### API Compatibility
Maintains API compatibility with the Rust implementation while adapting to JavaScript idioms:
- Async/await for long-running operations
- TypeScript types for safety
- Browser-compatible bundle

### Testing
- 33 comprehensive tests covering all VDF operations
- Pre-computed discriminants for fast test execution
- Cross-compatibility tests between implementations

### Package Contents
- `/dist` - Compiled JavaScript and type definitions
- `/dist/browser/vdf.min.js` - Browser bundle (UMD format)
- `/dist/index.js` - CommonJS entry point
- `/dist/index.mjs` - ES Module entry point
- `/examples` - Example code for Node.js and Browser
- `/src` - TypeScript source code
- `/tests` - Comprehensive test suite

### Known Limitations
- Performance is slower than native Rust (expected for JS)
- Not side-channel resistant (same as Rust version)
- Requires ES2020 support (BigInt)

### Next Steps
1. Install: `npm install`
2. Build: `npm run build`
3. Test: `npm test`
4. Publish: `npm publish` (when ready)

### Credits
Pure TypeScript implementation of Verifiable Delay Functions.
Developed by jose-blockchain and VDF-JS contributors.

