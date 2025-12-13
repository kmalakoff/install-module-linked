#!/usr/bin/env node

// Simple diagnostic script to check exit codes - compatible with Node 0.8+
console.log('Diagnostic script started');
console.log('Process version: ' + process.version);
console.log('Process platform: ' + process.platform);
console.log('Process arch: ' + process.arch);

// Add a simple test that should work in older Node versions
try {
  console.log('Testing basic functionality...');

  // Test basic features that work in Node 0.8+
  if (typeof Promise !== 'undefined') {
    console.log('Promise is available');
  } else {
    console.log('Promise is NOT available');
  }

  // Test basic object properties
  var testObj = { a: 1, b: 2 };
  console.log('Basic object works: ' + testObj.a + ', ' + testObj.b);

  // Test basic function
  var add = function(x, y) { return x + y; };
  console.log('Functions work: ' + add(2, 3));

  console.log('All basic tests passed');

} catch (err) {
  console.error('Error in basic tests: ' + (err.message || err));
  process.exit(1);
}

console.log('Diagnostic script completed successfully');
process.exit(0);