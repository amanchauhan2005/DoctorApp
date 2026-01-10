try {
  const chains = require('langchain/chains');
  console.log('Import successful:', Object.keys(chains).length > 0);
} catch (error) {
  console.error('Import failed:', error.message);
}
