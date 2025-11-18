# VDF-JS Examples

This directory contains working examples of using crypto-vdf in different environments.

## Node.js Example

Run the Node.js example:

```bash
node examples/node-example.js
```

This demonstrates both Pietrzak and Wesolowski VDFs with timing information.

## Browser Example

Open the browser example:

```bash
# Option 1: Open directly in browser
open examples/browser-example.html

# Option 2: Serve with a local server (recommended)
npx http-server . -p 8080
# Then visit: http://localhost:8080/examples/browser-example.html
```

The browser example provides an interactive demo with buttons to run each VDF scheme.

## What the Examples Demonstrate

Both examples show:
- Creating VDF instances (Pietrzak and Wesolowski)
- Generating proofs with `solve(challenge, difficulty)`
- Verifying proofs with `verify(challenge, difficulty, proof)`
- Measuring performance (solve and verify times)

## Requirements

- Node.js 18+ for Node.js examples
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+) for browser example
- Built distribution files (`npm run build`)

