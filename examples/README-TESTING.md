# Testing README Examples

This directory contains test scripts to verify all README examples work correctly.

## Node.js Examples Test

Tests all Node.js examples from the README:

```bash
node examples/test-readme-nodejs.js
```

This verifies:
- ✅ Basic CommonJS example
- ✅ ES Module example  
- ✅ Complete workflow example
- ✅ Precomputed discriminants example
- ✅ Error handling

## Browser Examples Test

### Local Testing (Before npm publish)

Open `examples/test-readme-browser.html` in your browser to test all browser examples locally:

```bash
open examples/test-readme-browser.html
```

This uses the local build from `dist/browser/vdf.min.js`.

### After npm Publication

After publishing to npm, update `test-readme-browser.html` to use the unpkg CDN:

1. Change the script tag from:
   ```html
   <script src="../dist/browser/vdf.min.js"></script>
   ```

2. To:
   ```html
   <script src="https://unpkg.com/crypto-vdf@1.0.2/dist/browser/vdf.min.js"></script>
   ```

3. Open the file in a browser (you can also serve it or deploy it)

### Tests Included

The browser test verifies:
- ✅ Basic browser example (from README Quick Start)
- ✅ Wesolowski VDF example
- ✅ Pietrzak VDF example
- ✅ VDF comparison example
- ✅ All examples with timing and proof size metrics

## Automated Testing

Both test scripts can be run as part of CI/CD:

```json
{
  "scripts": {
    "test:readme": "node examples/test-readme-nodejs.js"
  }
}
```

## Live Demo

After npm publication, you can test directly from unpkg:

```html
<!DOCTYPE html>
<html>
<head><title>crypto-vdf Live Test</title></head>
<body>
  <h1>Testing crypto-vdf from unpkg CDN</h1>
  <pre id="output"></pre>
  
  <script src="https://unpkg.com/crypto-vdf@1.0.2/dist/browser/vdf.min.js"></script>
  <script>
    async function test() {
      const output = document.getElementById('output');
      output.textContent = 'Running VDF from unpkg CDN...\n';
      
      const vdfInstance = new vdf.WesolowskiVDFParams(256).new();
      const challenge = new Uint8Array([0xaa]);
      const proof = await vdfInstance.solve(challenge, 100, vdf.DISCRIMINANT_256);
      vdfInstance.verify(challenge, 100, proof, vdf.DISCRIMINANT_256);
      
      output.textContent += '✓ VDF verified successfully!\n';
      output.textContent += `Proof size: ${proof.length} bytes`;
    }
    test();
  </script>
</body>
</html>
```

Save this as an HTML file and open it - it will work from any web server or even locally!

