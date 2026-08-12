"use client";

import { useState } from "react";

export default function RefactorPage() {
  const [originalCode, setOriginalCode] = useState("");
  const [refactoredCode, setRefactoredCode] = useState("");
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [instruction, setInstruction] = useState("");

  const handleRefactor = async () => {
    if (!originalCode.trim()) return;
    setIsRefactoring(true);
    
    // Simulate refactoring process for now
    setTimeout(() => {
      setRefactoredCode(`// Refactored version based on: ${instruction || "Standard clean code practices"}
// This is a simulated response. In production, this would connect to the LLM backend.

${originalCode.split('\n').map(line => `// ${line}`).join('\n')}
      
function example() {
  console.log("Refactored code structure");
}`);
      setIsRefactoring(false);
    }, 1500);
  };

  return (
    <div className="h-full bg-[#09090B] overflow-y-auto flex flex-col">
      <header className="border-b border-[#27272A] bg-[#09090B] p-6 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <h1 className="text-lg font-semibold text-white">Code Refactor Studio</h1>
        <div className="flex items-center gap-3">
          <input 
            type="text" 
            placeholder="Refactor instructions (e.g. 'convert to TypeScript', 'optimize loop')..."
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            className="w-80 max-w-full bg-[#111113] border border-[#27272A] rounded-xl px-4 py-2 text-xs text-[#A1A1AA] placeholder-[#A1A1AA] outline-none focus:border-[#D92A2A] transition-colors"
          />
          <button 
            onClick={handleRefactor}
            disabled={isRefactoring || !originalCode.trim()}
            className="px-5 py-2 bg-[#D92A2A] hover:bg-[#D92A2A]/90 disabled:bg-[#D92A2A]/40 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2"
          >
            {isRefactoring ? (
              <>
                <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Refactoring...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Execute
              </>
            )}
          </button>
        </div>
      </header>

      <div className="p-6 flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
        {/* Left Pane - Original */}
        <div className="bg-[#111113] border border-[#27272A] rounded-xl p-5 flex flex-col gap-3 min-h-[400px]">
          <h2 className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest">
            Original Code
          </h2>
          <textarea 
            value={originalCode}
            onChange={(e) => setOriginalCode(e.target.value)}
            placeholder="Paste your code here..."
            className="flex-1 bg-[#09090B] border border-[#27272A] rounded-xl p-4 text-xs text-[#A1A1AA] font-mono resize-none outline-none focus:border-[#D92A2A] transition-colors whitespace-pre placeholder-[#A1A1AA]"
            spellCheck={false}
          />
        </div>

        {/* Right Pane - Refactored */}
        <div className="bg-[#111113] border border-[#27272A] rounded-xl p-5 flex flex-col gap-3 min-h-[400px]">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest">
              Refactored Output
            </h2>
            {refactoredCode && (
              <button 
                onClick={() => navigator.clipboard.writeText(refactoredCode)}
                className="text-xs text-[#A1A1AA] hover:text-white transition-colors flex items-center gap-1.5"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy
              </button>
            )}
          </div>
          <div className="flex-1 bg-[#09090B] border border-[#27272A] rounded-xl p-4 text-xs text-[#A1A1AA] font-mono overflow-auto whitespace-pre">
            {refactoredCode || (
              <div className="flex items-center justify-center h-full text-[#71717A]">
                Refactored code will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
