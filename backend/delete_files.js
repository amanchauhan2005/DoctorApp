import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToDelete = [
  'services/aiService.js',
  'services/chunkingService.js',
  'services/embeddingService.js',
  'services/fallbackAIService.js',
  'services/generatorService.js',
  'services/ragPipelineService.js',
  'services/vectorStoreService.js',
  'controllers/aiController.js',
  'routes/aiRoute.js'
];

filesToDelete.forEach(file => {
  const filePath = path.join(__dirname, file);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted: ${file}`);
    } else {
      console.log(`File not found: ${file}`);
    }
  } catch (error) {
    console.error(`Error deleting ${file}:`, error.message);
  }
});

// Try to remove services directory if empty
try {
    const servicesPath = path.join(__dirname, 'services');
    if (fs.existsSync(servicesPath) && fs.readdirSync(servicesPath).length === 0) {
        fs.rmdirSync(servicesPath);
        console.log('Deleted services directory');
    }
} catch (e) {
    console.error('Error deleting services dir:', e.message);
}
