# VDF-JS Release Notes

## Version 1.0.5 - ESLint Configuration Fix (2025-01-XX)

### Changes
- **ESLint Configuration**: Added `.eslintrc.json` configuration file to fix CI linting failures
  - Enables ESLint to run properly in GitHub Actions
  - Uses TypeScript ESLint parser and recommended rules
  - Matches project's ESLint dependencies

### Why This Release
The CI workflow was failing because ESLint couldn't find a configuration file. This release adds the missing configuration to ensure CI passes successfully.

## Version 1.0.4 - GitHub CI/CD Workflows (2025-01-XX)

### Changes
- **GitHub Actions CI**: Added automated CI workflow for running tests on push/PR
  - Tests on Node.js 18.x, 20.x, 22.x, 24.x
  - Runs linter, build, and unit tests
- **GitHub Actions Publish**: Added automated npm publishing workflow
  - Triggers on GitHub release creation
  - Automatically builds, tests, and publishes to npm

### Why This Release
This release adds automated CI/CD workflows to ensure code quality and streamline the release process. All future releases can be automated through GitHub releases.

## Version 1.0.3 - Documentation Improvements (2025-01-XX)

### Changes
- **Enhanced Documentation**: Made Pietrzak VDF difficulty limitation (≤7000) more explicit in README
- **Clear Recommendations**: Added explicit recommendation to use Wesolowski VDF for production and difficulties above 7000
- **Improved Warnings**: Added prominent warnings in API documentation about Pietrzak limitations

### Why This Release
This release focuses on improving documentation clarity to help users make informed decisions about which VDF to use. The Pietrzak limitation was documented but not prominently featured, which could lead to confusion for users requiring higher difficulties.

### Migration Notes
- No code changes required
- If you're using Pietrzak VDF with difficulties > 7000, migrate to Wesolowski VDF
- Wesolowski VDF is now explicitly recommended for production use

## Version 1.0.2 - Previous Release

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

