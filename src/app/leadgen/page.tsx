"use client";

import { useState } from "react";

// Mock Data
const MOCK_LEADS = [
  { id: 1, name: "Sarah Jenkins", title: "VP of Engineering", company: "TechFlow Inc.", location: "San Francisco, CA", distance: "12km", email: "sarah.j@techflow.io", verified: true, trustScore: 98, social: ["LinkedIn", "Twitter"], intent: "High" },
  { id: 2, name: "Marcus Chen", title: "Chief Technology Officer", company: "DataSync", location: "New York, NY", distance: "4,100km", email: "m.chen@datasync.co", verified: true, trustScore: 95, social: ["LinkedIn", "GitHub"], intent: "Medium" },
  { id: 3, name: "Elena Rodriguez", title: "Director of Product", company: "CloudScale", location: "Austin, TX", distance: "2,400km", email: "elena@cloudscale.net", verified: false, trustScore: 65, social: ["LinkedIn"], intent: "Low" },
  { id: 4, name: "David Kim", title: "Head of Infrastructure", company: "Nexus Systems", location: "London, UK", distance: "8,500km", email: "david.kim@nexus.uk", verified: true, trustScore: 99, social: ["LinkedIn", "StackOverflow"], intent: "High" },
  { id: 5, name: "Aisha Patel", title: "Engineering Manager", company: "Voxel AI", location: "San Jose, CA", distance: "70km", email: "apatel@voxel.ai", verified: true, trustScore: 92, social: ["LinkedIn", "Twitter", "Medium"], intent: "High" },
];

export default function LeadGenPage() {
  const [distance, setDistance] = useState(50); // 1 = 5km, 100 = Worldwide
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());

  // Map slider 1-100 to actual labels
  const getDistanceLabel = (val: number) => {
    if (val <= 10) return "5km";
    if (val <= 25) return "25km";
    if (val <= 50) return "100km";
    if (val <= 75) return "Country";
    return "Worldwide";
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === MOCK_LEADS.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(MOCK_LEADS.map(l => l.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const next = new Set(selectedLeads);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedLeads(next);
  };

  return (
    <div className="flex h-full bg-[#09090B]">
      
      {/* Left Sidebar - Filters */}
      <aside className="w-72 border-r border-[#27272A] flex flex-col bg-[#111113] overflow-y-auto shrink-0">
        <div className="p-5 border-b border-[#27272A] shrink-0 sticky top-0 bg-[#111113] z-10">
          <h2 className="text-lg font-semibold text-white">Target Audience</h2>
          <p className="text-xs text-[#A1A1AA] mt-1">270M+ verified contacts</p>
        </div>

        <div className="p-5 flex flex-col gap-6">
          {/* Location & Distance Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest">Location Radius</label>
              <span className="text-xs font-bold text-[#D92A2A]">{getDistanceLabel(distance)}</span>
            </div>
            <input type="text" placeholder="Enter City or Zip..." className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white placeholder-[#71717A] outline-none focus:border-[#D92A2A]/50 transition-colors" />
            <div className="pt-2 px-1">
              <input 
                type="range" 
                min="1" max="100" 
                value={distance} 
                onChange={(e) => setDistance(parseInt(e.target.value))}
                className="w-full h-1 bg-[#27272A] rounded-lg appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D92A2A]"
              />
              <div className="flex justify-between text-[9px] text-[#A1A1AA] mt-2 font-semibold uppercase tracking-widest">
                <span>5km</span>
                <span>Worldwide</span>
              </div>
            </div>
          </div>

          {/* Job Titles */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest">Job Titles</label>
            <div className="flex flex-wrap gap-2">
              {['CTO', 'VP Engineering', 'Director', 'Founder'].map(tag => (
                <span key={tag} className="px-2.5 py-1 bg-[#09090B] border border-[#27272A] rounded-md text-[10px] font-medium text-[#A1A1AA] cursor-pointer hover:border-[#D92A2A] transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest">Industry</label>
            <select className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#A1A1AA] outline-none focus:border-[#D92A2A]/50 appearance-none cursor-pointer">
              <option>Software Development</option>
              <option>Financial Services</option>
              <option>Healthcare Tech</option>
              <option>E-commerce</option>
            </select>
          </div>

          {/* Intent Data */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest">Buyer Intent Signals</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-[#D92A2A]" />
                <span className="text-xs text-[#A1A1AA]">Researching Competitors</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-[#D92A2A]" />
                <span className="text-xs text-[#A1A1AA]">Recent Funding Round</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-[#D92A2A]" />
                <span className="text-xs text-[#A1A1AA]">Hiring IT Roles</span>
              </label>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content - Data Table */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#09090B]">
        {/* Top Action Bar */}
        <header className="h-14 border-b border-[#27272A] flex items-center px-6 shrink-0 justify-between bg-[#111113]">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-[#A1A1AA]">
              {selectedLeads.size} selected
            </span>
            <div className="h-4 w-px bg-[#27272A]"></div>
            <button 
              disabled={selectedLeads.size === 0}
              className="px-3.5 py-1.5 bg-[#D92A2A] hover:bg-[#b82222] disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              Add to Sequence
            </button>
            <button 
              disabled={selectedLeads.size === 0}
              className="px-3.5 py-1.5 bg-[#09090B] hover:bg-[#1A1A1D] disabled:opacity-40 text-white border border-[#27272A] text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Export Info Email
            </button>
          </div>
          <div className="text-[10px] text-[#A1A1AA] flex items-center gap-2 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D92A2A]"></span>
            SYSTEM SECURE • DATA ENCRYPTED
          </div>
        </header>

        {/* Table Container */}
        <div className="flex-1 overflow-auto bg-[#09090B]">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[#111113] sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3.5 border-b border-[#27272A] w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedLeads.size === MOCK_LEADS.length}
                    onChange={toggleSelectAll}
                    className="accent-[#D92A2A] cursor-pointer" 
                  />
                </th>
                <th className="px-4 py-3.5 border-b border-[#27272A] text-[10px] font-semibold text-[#71717A] uppercase tracking-widest">Prospect</th>
                <th className="px-4 py-3.5 border-b border-[#27272A] text-[10px] font-semibold text-[#71717A] uppercase tracking-widest">Contact Info & Trust</th>
                <th className="px-4 py-3.5 border-b border-[#27272A] text-[10px] font-semibold text-[#71717A] uppercase tracking-widest">Social Footprint</th>
                <th className="px-4 py-3.5 border-b border-[#27272A] text-[10px] font-semibold text-[#71717A] uppercase tracking-widest">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]/50">
              {MOCK_LEADS.map(lead => (
                <tr 
                  key={lead.id} 
                  className={`hover:bg-[#111113] transition-colors cursor-pointer ${selectedLeads.has(lead.id) ? 'bg-[#D92A2A]/10' : ''}`}
                  onClick={() => toggleSelect(lead.id)}
                >
                  <td className="px-4 py-4 w-10" onClick={e => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={selectedLeads.has(lead.id)}
                      onChange={() => toggleSelect(lead.id)}
                      className="accent-[#D92A2A] cursor-pointer" 
                    />
                  </td>
                  
                  {/* Prospect Col */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">{lead.name}</span>
                      <span className="text-xs text-[#A1A1AA]">{lead.title}</span>
                      <span className="text-xs text-[#D92A2A] font-medium mt-0.5">{lead.company}</span>
                    </div>
                  </td>

                  {/* Contact & Trust Col */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#A1A1AA] font-mono">{lead.email}</span>
                      </div>
                      {lead.verified ? (
                        <div className="flex items-center gap-1.5 text-[#A1A1AA] bg-[#111113] border border-[#27272A] w-fit px-2 py-0.5 rounded">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                          <span className="text-[10px] font-semibold uppercase tracking-wider">Verified (Score: {lead.trustScore})</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[#A1A1AA] bg-[#111113] border border-[#27272A] w-fit px-2 py-0.5 rounded">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                          <span className="text-[10px] font-semibold uppercase tracking-wider">Catch-all (Score: {lead.trustScore})</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Social Col */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-[#71717A] uppercase tracking-widest font-semibold">Active Posts On:</span>
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {lead.social.map(platform => (
                          <span key={platform} className="px-2 py-0.5 bg-[#09090B] border border-[#27272A] rounded text-[10px] text-[#A1A1AA] font-mono">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>

                  {/* Location Col */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-[#A1A1AA]">{lead.location}</span>
                      <div className="flex items-center gap-1 mt-1 text-[#A1A1AA]">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        <span className="text-[10px] font-mono">{lead.distance} away</span>
                      </div>
                    </div>
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
