# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
