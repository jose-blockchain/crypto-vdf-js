#!/usr/bin/env node
/**
 * Fix ESM imports to include .js extensions
 * Node.js ESM requires explicit file extensions
 */

const fs = require('fs');
const path = require('path');

const esmDir = path.join(__dirname, '../dist/esm');

function fixImports(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixImports(filePath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix relative imports: add .js extension
      content = content.replace(
        /from ['"](\.[^'"]+)['"]/g,
        (match, importPath) => {
          if (!importPath.endsWith('.js')) {
            return `from '${importPath}.js'`;
          }
          return match;
        }
      );
      
      // Fix export statements
      content = content.replace(
        /export \{[^}]+\} from ['"](\.[^'"]+)['"]/g,
        (match, importPath) => {
          if (!importPath.endsWith('.js')) {
            return match.replace(importPath, `${importPath}.js`);
          }
          return match;
        }
      );
      
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
}

console.log('Fixing ESM imports to include .js extensions...');
fixImports(esmDir);
console.log('✓ ESM imports fixed');

