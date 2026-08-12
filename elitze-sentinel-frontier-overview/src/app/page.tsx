"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    window.location.href = "http://localhost:3001";
  }, []);

  return (
    <div className="min-h-screen bg-[#07090F] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-xl border border-[#D92A2A]/30 bg-gradient-to-br from-[#D92A2A]/10 to-transparent flex items-center justify-center">
          <svg className="w-8 h-8 text-[#D92A2A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">ELITZE SENTINEL FRONTIER OOS</h1>
        <p className="text-[#A7B0C2] mb-8">Loading OS...</p>
        <div className="w-48 h-1 bg-[#10131A] rounded-full mx-auto overflow-hidden">
          <div className="h-full w-1/3 bg-[#D92A2A] animate-pulse" />
        </div>
      </div>
    </div>
  );
}