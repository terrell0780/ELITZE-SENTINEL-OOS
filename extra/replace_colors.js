const fs = require('fs');
const path = require('path');

const replacements = {
  '#09090B': '#0B0505',
  '#111113': '#160808',
  '#27272A': '#2B1212',
  '#D92A2A': '#E53935',
  '#1A1A1D': '#1F0B0B'
};

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
      
      for (const [search, replace] of Object.entries(replacements)) {
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
console.log('Global color replacement complete.');
