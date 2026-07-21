# Contributing to crypto-vdf

Thank you for contributing. This guide covers local setup, testing, and pull request expectations.

## Development setup

```bash
git clone https://github.com/jose-blockchain/crypto-vdf-js.git
cd crypto-vdf-js
npm install
npm run build
npm test
```

Requirements: Node.js 18+.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run build` | Build Node (CJS + ESM) and browser bundle |
| `npm run build:node` | TypeScript compile only |
| `npm run test` | Unit tests + VDF integration script |
| `npm run test:unit` | Fast Jest tests (CI default) |
| `npm run test:vdf` | Full manual VDF suite (build + run) |
| `npm run lint` | ESLint (zero warnings) |
| `npm run docs` | Generate API reference (TypeDoc) |
| `npm run fixtures:generate` | Regenerate golden test vectors |

## Which VDF should I use?

- **Wesolowski** — recommended for production; any positive difficulty; smaller proofs; faster verify.
- **Pietrzak** — even difficulty ≥ 66, maximum **7000** in this JS port. Use Wesolowski above 7000.

Always pass **precomputed discriminants** (`DISCRIMINANT_256`, etc.) in production. Generating discriminants in pure JS is very slow.

For wall-clock delay targets, prefer `estimateDifficulty({ bits, targetSeconds })` and re-calibrate with `iterationsPerSecond` on the target device (see README).

## Pull requests

1. Branch from `main` (e.g. `feature/my-change`).
2. Run `npm run lint && npm run test:unit` before opening the PR.
3. For VDF logic changes, also run `npm run test:vdf` or the relevant manual test under `tests/manual/`.
4. Update `README.md` / `TESTING.md` when behavior or usage changes.
5. Add or update tests for bug fixes and new behavior.
6. Keep commits focused; write clear commit messages (no AI co-author trailers).

## Changelog and releases

- User-facing changes go in `CHANGELOG.md` (Keep a Changelog format).
- Version bumps and release notes are automated via [release-please](https://github.com/googleapis/release-please) when maintainers merge the release PR.
- npm publish runs on GitHub **Release created** (see `.github/workflows/publish.yml`).

## Reporting issues

Use the GitHub issue templates (bug, feature). Include Node/browser version, steps to reproduce, and expected vs actual behavior.

## Security

Do not open public issues for undisclosed vulnerabilities. See `SECURITY.md` when available, or contact the maintainers privately.

## Code style

- TypeScript in `src/`, tests in `tests/`
- Match existing naming and error types (`InvalidProof`, `InvalidIterations`)
- Avoid unrelated refactors in the same PR
