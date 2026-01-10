try {
  const pkg = require('langchain/package.json');
  console.log('Exports:', JSON.stringify(pkg.exports, null, 2));
} catch (e) {
  console.error('Error reading package.json:', e.message);
}
