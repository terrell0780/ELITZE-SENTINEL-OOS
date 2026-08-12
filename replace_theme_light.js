const fs = require('fs');
const path = require('path');

const replacements = [
  // Dark Backgrounds -> Light Neutral
  { search: '#0B0505', replace: '#F5F7FA' },
  { search: '#160808', replace: '#FFFFFF' },
  { search: '#2B1212', replace: '#E2E8F0' },
  { search: '#1F0B0B', replace: '#F1F5F9' },
  { search: '#2B0F0F', replace: '#E0F2FE' },
  { search: '#331010', replace: '#BAE6FD' },
  
  // Accents: Red -> Vibrant Sky Blue
  { search: '#E53935', replace: '#1E88E5' },
  { search: '#D92A2A', replace: '#1E88E5' },
  
  // Muted Text
  { search: '#B0A4A4', replace: '#64748B' },
  { search: '#A19A9A', replace: '#64748B' },
  { search: '#71717A', replace: '#64748B' },
  { search: '#52525B', replace: '#94A3B8' }
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
console.log('Global Apple/Figma light theme replacement complete.');
