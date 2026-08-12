const fs = require('fs');
const path = require('path');

const replacements = [
  { search: 'me@elitze.ca', replace: 'terrell0780@gmail.com' },
  { search: 'noreply@elitze.ca', replace: 'terrell0780@gmail.com' },
  { search: 'architect@elitze.ca', replace: 'terrell0780@gmail.com' },
  { search: 'https://elitze.ca', replace: 'https://www.elitze.ca' },
  { search: '"elitze.ca"', replace: '"www.elitze.ca"' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        processDirectory(fullPath);
      }
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const { search, replace } of replacements) {
        if (content.includes(search)) {
          content = content.split(search).join(replace);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'src'));
console.log('Domain and email replacement complete.');
