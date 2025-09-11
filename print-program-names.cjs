const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client', 'public', 'data', 'requirements-uew.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

data.forEach((entry, idx) => {
  console.log(`${idx + 1}. ${entry.programName}`);
});