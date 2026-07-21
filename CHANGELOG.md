# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0](https://github.com/jose-compu/crypto-vdf-js/compare/crypto-vdf-v1.2.0...crypto-vdf-v1.3.0) (2026-07-21)


### Features

* Add precomputed discriminants and fix serialization ([d8e78fb](https://github.com/jose-compu/crypto-vdf-js/commit/d8e78fba74f7250e6d0674dc2c290ea18b55b27e))
* Add README example verification tests ([0ebf7e2](https://github.com/jose-compu/crypto-vdf-js/commit/0ebf7e22eaff033ee5c5340f0f0d403335e114e1))
* estimateDifficulty for target delay (v1.2.0) ([#16](https://github.com/jose-compu/crypto-vdf-js/issues/16)) ([0f5f2b7](https://github.com/jose-compu/crypto-vdf-js/commit/0f5f2b745b1b1f0c34cc3f06d662045178fbf349))


### Bug Fixes

* Resolve critical VDF bugs and add comprehensive tests ([e1f9eaf](https://github.com/jose-compu/crypto-vdf-js/commit/e1f9eafd8d80de0ab1bb3ad93fc2c5e18dc1bef4))
* Resolve linter errors for npm publish ([80e4351](https://github.com/jose-compu/crypto-vdf-js/commit/80e435127d0ffd28cd0a2ec659706dfe1c3ea177))


### Performance Improvements

* Skip browser build in tests for faster execution ([a38d28c](https://github.com/jose-compu/crypto-vdf-js/commit/a38d28c065c3f657fb936e098457fbd650be8556))

## [Unreleased]

## [1.2.0] - 2026-07-21

### Added

- `estimateDifficulty({ bits, targetSeconds, scheme?, iterationsPerSecond? })` to map a target wall-clock delay to an iteration count (#16)
- `estimateSolveSeconds` and `getCalibratedIterationsPerSecond` helpers, plus `CALIBRATED_ITERATIONS_PER_SECOND` table
- README section on tuning difficulty for hardware

## [1.1.0] - 2026-05-19

### Added

- `CONTRIBUTING.md`, GitHub issue/PR templates, and golden regression fixtures
- TypeDoc API reference (`npm run docs`) and GitHub Pages workflow
- release-please automation for version bumps and changelog updates
- Fast CI: minimal Jest suite, VDF verify smoke test, `package-lock.json` for reproducible installs
- Verbose manual comprehensive VDF test suite with progress heartbeats

### Changed

- README examples and `VDF` types document optional precomputed discriminants
- ClassGroup/golden solve tests moved out of default Jest (use `npm run test:slow` / manual scripts)

## [1.0.6] - 2025-01-XX

### Changed

- CI workflow runs comprehensive VDF tests (`test-both-vdfs-comprehensive.js`) after unit tests

## [1.0.5] - 2025-01-XX

### Fixed

- Added `.eslintrc.json` so ESLint runs correctly in CI

## [1.0.4] - 2025-01-XX

### Added

- GitHub Actions CI (Node 18–24) and npm publish on release

## [1.0.3] - 2025-01-XX

### Changed

- README documents Pietrzak difficulty limit (≤7000) and recommends Wesolowski for production

## [1.0.0] - 2025-01-XX

### Added

- Initial release: Pietrzak and Wesolowski VDF, precomputed discriminants (256–2048 bit), browser bundle, TypeScript types

[Unreleased]: https://github.com/jose-blockchain/crypto-vdf-js/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/jose-blockchain/crypto-vdf-js/compare/v1.0.6...v1.1.0
[1.0.6]: https://github.com/jose-blockchain/crypto-vdf-js/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/jose-blockchain/crypto-vdf-js/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/jose-blockchain/crypto-vdf-js/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/jose-blockchain/crypto-vdf-js/compare/v1.0.0...v1.0.3
[1.0.0]: https://github.com/jose-blockchain/crypto-vdf-js/releases/tag/v1.0.0
