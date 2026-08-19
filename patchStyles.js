const fs = require('fs');

function replaceAll(path) {
  let content = fs.readFileSync(path, 'utf8');
  
  // Table styles
  content = content.replace(/text-\[10px\] font-semibold text-\[\#71717A\] uppercase tracking-widest/g, "text-[10px] font-bold text-[#52525B] uppercase tracking-wider");
  content = content.replace(/hover:bg-\[\#09090B\]/g, "hover:bg-[#18181B]");
  content = content.replace(/hover:bg-\[\#111115\]/g, "hover:bg-[#18181B]");
  
  content = content.replace(/text-xs text-\[\#A1A1AA\]/g, "text-[11px] text-[#A1A1AA]");
  
  // card styles
  content = content.replace(/bg-\[\#111115\] rounded-xl border border-\[\#27272A\] p-5/g, "bg-[#111115] border border-[#27272A] rounded-lg p-4");
  content = content.replace(/bg-\[\#111115\] border border-\[\#27272A\] rounded-xl p-5/g, "bg-[#111115] border border-[#27272A] rounded-lg p-4");
  
  // card titles
  content = content.replace(/text-sm font-semibold text-white/g, "text-[12px] font-semibold text-white");
  
  // buttons
  content = content.replace(/bg-\[\#0066FF\] text-white text-xs font-semibold rounded-lg hover:bg-\[\#0066FF\]\/90 transition-colors/g, "bg-[#0066FF] text-white hover:opacity-90 text-[11px] font-semibold px-3 py-1.5 rounded-md transition-colors");
  content = content.replace(/bg-\[\#0066FF\] hover:bg-\[\#0066FF\]\/90 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2/g, "bg-[#0066FF] text-white hover:opacity-90 text-[11px] font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center gap-2");

  fs.writeFileSync(path, content);
}

const files = [
  'src/app/sales/page.tsx',
  'src/app/leadgen/page.tsx',
  'src/app/jobs/page.tsx',
  'src/app/integrations/email/page.tsx',
  'src/app/lindy/page.tsx'
];

files.forEach(replaceAll);
