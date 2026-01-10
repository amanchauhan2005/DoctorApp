import * as langchain from 'langchain';
import * as chains from 'langchain/chains';

console.log('Root exports:', Object.keys(langchain));
try {
    console.log('Chains exports:', Object.keys(chains));
} catch (e) {
    console.log('Error importing chains:', e.message);
}
