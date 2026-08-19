const fs = require('fs');

function patchFile(path, title, subtitle, letter, headerRightSide, headerMid) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/#D92A2A/gi, '#0066FF');
  content = content.replace(/#111113/gi, '#111115');

  const headerRegex = /<header[\s\S]*?<\/header>/;
  
  let rightSide = "";
  if (headerRightSide) {
      rightSide = '<div className="flex items-center gap-2">\n    ' + headerRightSide + '\n  </div>';
  }
  
  let mid = "";
  if (headerMid) mid = headerMid;

  const newHeader = '<header className="h-12 border-b border-[#27272A] bg-[#09090B] px-5 flex items-center justify-between shrink-0">\n' +
'  <div className="flex items-center gap-3">\n' +
'    <div className="w-6 h-6 rounded-md bg-[#0066FF] flex items-center justify-center text-[10px] font-black text-white shadow-sm shadow-[#0066FF]/20">\n' +
'      ' + letter + '\n' +
'    </div>\n' +
'    <div className="flex items-center gap-2">\n' +
'      <span className="text-[13px] font-bold text-white tracking-tight">' + title + '</span>\n' +
'      <span className="text-[9px] font-semibold text-[#0066FF]/70 uppercase tracking-widest">' + subtitle + '</span>\n' +
'    </div>\n' +
'    ' + mid + '\n' +
'  </div>\n' +
'  ' + rightSide + '\n' +
'</header>';

  content = content.replace(headerRegex, newHeader);
  fs.writeFileSync(path, content);
}

// 1. Sales
patchFile('src/app/sales/page.tsx', 'SALES', 'Pipeline & CRM', 'S', 
  '<div className="flex items-center gap-1 bg-[#141418] rounded-md p-1 border border-[#27272A]">\n      {(["kanban", "list", "contacts"] as const).map(v => (\n        <button key={v}\n          onClick={() => setView(v)}\n          className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${view === v ? "bg-[#0066FF] text-white hover:opacity-90" : "text-[#A1A1AA] hover:text-white bg-[#141418]"}`}\n        >{v.charAt(0).toUpperCase() + v.slice(1)}</button>\n      ))}\n    </div>',
  '<span className="text-[11px] text-[#A1A1AA] font-mono ml-3">${totalPipeline.toLocaleString()} total pipeline</span>'
);

// 2. Leadgen
patchFile('src/app/leadgen/page.tsx', 'LEAD GENERATION', 'Prospecting', 'L', 
  '<span className="text-[11px] font-semibold text-[#A1A1AA] mr-2">\n      {selectedLeads.size} selected\n    </span>\n    <div className="h-4 w-px bg-[#27272A] mr-2"></div>\n    <button \n      disabled={selectedLeads.size === 0}\n      className="bg-[#0066FF] text-white hover:opacity-90 disabled:opacity-40 text-[11px] font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center gap-2"\n    >\n      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>\n      Add to Sequence\n    </button>\n    <button \n      disabled={selectedLeads.size === 0}\n      className="bg-[#141418] border border-[#27272A] text-[#A1A1AA] hover:text-white disabled:opacity-40 text-[11px] font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center gap-2"\n    >\n      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>\n      Export Info\n    </button>',
  ''
);

// 3. Jobs
patchFile('src/app/jobs/page.tsx', 'JOBS', 'Search & Apply', 'J', 
  '<button onClick={handleScrape} disabled={scraping}\n      className="flex items-center gap-1.5 bg-[#141418] border border-[#27272A] text-[#A1A1AA] hover:text-white text-[11px] font-semibold px-3 py-1.5 rounded-md transition-colors disabled:opacity-50">\n      {scraping ? "Scraping..." : "Scrape Jobs"}\n    </button>',
  '<span className="text-[11px] font-semibold text-[#52525B] uppercase tracking-widest ml-3">{filtered.length} jobs</span>'
);

// 4. Email
patchFile('src/app/integrations/email/page.tsx', 'EMAIL', 'Inbox & Outbound', 'E', 
  '<button onClick={() => setShowCompose(true)}\n      className="bg-[#0066FF] text-white hover:opacity-90 text-[11px] font-semibold px-3 py-1.5 rounded-md transition-colors">Compose</button>',
  '<span className="text-[11px] font-semibold text-[#52525B] uppercase tracking-widest ml-3">{emails.length} messages</span>'
);

// 5. Lindy
patchFile('src/app/lindy/page.tsx', 'LINDY', 'Agent Automation', 'L', 
  '<button className="bg-[#0066FF] text-white hover:opacity-90 text-[11px] font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center gap-2">\n      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>\n      Create Agent\n    </button>',
  ''
);
