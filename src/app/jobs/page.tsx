"use client";

import { useState, useEffect } from "react";
import { brain } from "@/lib/brain";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [scraping, setScraping] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  useEffect(() => {
    brain.find("jobs").then(r => {
      if (r.data?.length) setJobs(r.data);
    });
  }, []);

  const handleScrape = async () => {
    setScraping(true);
    // In production: calls brain to schedule browser scraping
    const demoJobs = [
      { title: "Senior AI Engineer", company: "TechCorp", salary: "$180k-220k", source: "LinkedIn", match: 94 },
      { title: "Full Stack Developer", company: "StartupXYZ", salary: "$140k-170k", source: "Indeed", match: 88 },
      { title: "ML Ops Engineer", company: "DataFlow Inc", salary: "$160k-200k", source: "LinkedIn", match: 91 },
    ];
    for (const j of demoJobs) { brain.insert("jobs", j); }
    setJobs(prev => [...demoJobs, ...prev]);
    setTimeout(() => setScraping(false), 1500);
  };

  const toggleSave = (title: string) => {
    setSavedJobs(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
  };

  const filtered = query ? jobs.filter((j: any) =>
    j.title?.toLowerCase().includes(query.toLowerCase()) ||
    j.company?.toLowerCase().includes(query.toLowerCase())
  ) : jobs;

  return (
    <div className="flex flex-col h-full bg-[#09090B]">
      <header className="h-16 border-b border-[#27272A] flex items-center px-6 shrink-0 bg-[#09090B]">
        <h1 className="text-lg font-semibold text-white">Job Search</h1>
        <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest ml-3">{filtered.length} jobs</span>
        <div className="flex-1" />
        <button onClick={handleScrape} disabled={scraping}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#111113] border border-[#27272A] hover:border-[#D92A2A]/40 text-xs font-semibold text-[#A1A1AA] rounded-lg transition-colors disabled:opacity-50">
          {scraping ? "Scraping..." : "Scrape Jobs"}
        </button>
      </header>

      <div className="px-6 py-4 border-b border-[#27272A] bg-[#09090B]">
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search jobs by title, company..."
          className="w-full max-w-xl bg-[#111113] border border-[#27272A] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#A1A1AA] outline-none focus:border-[#D92A2A] transition-colors" />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4 max-w-4xl">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-[#A1A1AA]">No jobs found</p>
              <p className="text-xs text-[#A1A1AA] mt-2">Click "Scrape Jobs" to find listings</p>
            </div>
          ) : filtered.map((job: any, i: number) => (
            <div key={i} className="bg-[#111113] border border-[#27272A] rounded-xl p-5 hover:border-[#D92A2A]/40 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white">{job.title}</h3>
                    {(job.match || 0) >= 90 && (
                      <span className="text-[10px] font-semibold text-[#D92A2A] uppercase tracking-widest px-2 py-0.5 rounded bg-[#D92A2A]/10 border border-[#D92A2A]/20">Top Match</span>
                    )}
                  </div>
                  <p className="text-xs text-[#A1A1AA]">{job.company}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs font-medium text-[#A1A1AA]">{job.salary}</span>
                    <span className="text-[10px] text-[#71717A]">|</span>
                    <span className="text-[10px] text-[#A1A1AA]">{job.source}</span>
                    <span className="text-[10px] text-[#D92A2A] font-medium">{job.match}% match</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => toggleSave(job.title)}
                    className={`p-2 rounded-lg transition-colors ${savedJobs.includes(job.title) ? "text-[#D92A2A]" : "text-[#A1A1AA] hover:text-white"}`}>
                    <svg className="w-4 h-4" fill={savedJobs.includes(job.title) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                  <button className="px-4 py-2 bg-[#D92A2A] text-white text-xs font-semibold rounded-lg hover:bg-[#D92A2A]/90 transition-colors">Auto-Apply</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}