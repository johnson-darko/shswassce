const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, 'client', 'public', 'manifest.json');
const env = process.env.NODE_ENV || 'development';

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

if (env === 'production') {
  manifest.start_url = 'https://shs.studyxo.com/';
  manifest.scope = 'https://shs.studyxo.com/';
} else {
  manifest.start_url = 'http://localhost:5173/shswassce/';
  manifest.scope = 'http://localhost:5173/shswassce/';
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Manifest updated for ${env} environment`);
