#!/usr/bin/env node
/**
 * Wait 24 hours before publishing to npm
 * This respects npm's unpublish policy
 */

const { execSync } = require('child_process');

const HOURS_TO_WAIT = 24;
const MS_PER_HOUR = 60 * 60 * 1000;
const WAIT_TIME = HOURS_TO_WAIT * MS_PER_HOUR;

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║          NPM Publish with 24-Hour Wait                       ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

console.log(`Waiting ${HOURS_TO_WAIT} hours before publishing...`);
console.log(`Start time: ${new Date().toLocaleString()}`);

const endTime = new Date(Date.now() + WAIT_TIME);
console.log(`Publish time: ${endTime.toLocaleString()}\n`);

console.log('You can cancel this at any time with Ctrl+C\n');

// Show countdown every hour
let hoursRemaining = HOURS_TO_WAIT;
const countdownInterval = setInterval(() => {
  hoursRemaining--;
  if (hoursRemaining > 0) {
    console.log(`[${new Date().toLocaleTimeString()}] ${hoursRemaining} hour(s) remaining...`);
  }
}, MS_PER_HOUR);

setTimeout(() => {
  clearInterval(countdownInterval);
  
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║          24 Hours Elapsed - Publishing to npm                ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  try {
    console.log('Running: npm publish\n');
    execSync('npm publish', { stdio: 'inherit' });
    
    console.log('\n✓ Successfully published to npm!');
    console.log('\nPackage is now available:');
    console.log('  - npm: npm install crypto-vdf');
    console.log('  - unpkg: https://unpkg.com/crypto-vdf@1.0.2/dist/browser/vdf.min.js');
  } catch (error) {
    console.error('\n✗ Publish failed:', error.message);
    process.exit(1);
  }
}, WAIT_TIME);

// Keep the process alive
process.stdin.resume();

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  clearInterval(countdownInterval);
  console.log('\n\nPublish cancelled by user');
  process.exit(0);
});

