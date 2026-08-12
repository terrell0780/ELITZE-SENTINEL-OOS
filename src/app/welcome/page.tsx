"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState("terrell0780@gmail.com");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("frontier-user", JSON.stringify({ 
        name: "Terrell",
        email 
      }));
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#111113] text-[#FAFAFA] font-sans flex flex-col selection:bg-[#D92A2A] selection:text-white">
      
      {/* ── SKY BLUE TOP NAVIGATION BAR ── */}
      <header className="h-16 bg-[#D92A2A] px-8 flex items-center justify-between text-white shadow-md z-40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/80 rounded bg-black/90 p-0.5 overflow-hidden flex items-center justify-center shadow-md cursor-pointer" onClick={() => setShowAuth(true)}>
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-sm" />
          </div>
          <span className="text-sm font-bold tracking-tight">Elitze Sentinel Frontier</span>
        </div>

        <nav className="flex items-center gap-8 text-sm font-medium text-white/90">
          <a href="#home" className="hover:text-white transition-colors">Home</a>
          <a href="#features" className="hover:text-white transition-colors">Feature</a>
          <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
          <a href="#pricing" className="hover:text-white transition-colors">Price & Plan</a>
          <a href="#team" className="hover:text-white transition-colors">Our Team</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          <button 
            onClick={() => setShowAuth(true)}
            className="ml-4 px-4 py-1.5 bg-[#111113] text-[#B91C1C] font-semibold rounded-lg hover:bg-slate-100 transition-colors shadow-sm text-xs"
          >
            Launch OS
          </button>
        </nav>
      </header>

      {/* ── HERO SECTION WITH SCENIC MOUNTAIN BACKGROUND ── */}
      <section id="home" className="relative h-[480px] w-full flex flex-col items-center justify-center text-center overflow-hidden bg-slate-900">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-65 mix-blend-overlay"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

        <div className="relative z-10 space-y-3 px-4 max-w-4xl drop-shadow-lg">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight uppercase drop-shadow-md">
            ELITZE SENTINEL
          </h1>
          <h2 className="text-3xl md:text-4xl font-normal text-white/95 tracking-wide drop-shadow">
            Frontier Oos
          </h2>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" className="py-24 px-6 bg-[#111113] text-center">
        <div className="max-w-4xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl font-bold text-[#FAFAFA]">Features</h2>
          <p className="text-sm text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed">
            Enterprise AI video studio, autonomous agent workflows, 3D video creation, and real-time GPU rendering built into one unified creative operating system.
          </p>
        </div>

        {/* 4 Circular Sky Blue SVG Icon Badges (No Emojis) */}
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 justify-items-center">
          {[
            { 
              title: "AI Studio", 
              desc: "Cinematic Movie & Shorts Generation",
              icon: (
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
                </svg>
              )
            },
            { 
              title: "3D Creator", 
              desc: "Drag and Drop 3D Scene Viewport",
              icon: (
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              )
            },
            { 
              title: "Automation", 
              desc: "Autonomous Workflows & Lead Gen",
              icon: (
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              )
            },
            { 
              title: "Analytics", 
              desc: "Real-time Telemetry & GPU Metrics",
              icon: (
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              )
            },
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-center gap-4 group cursor-pointer" onClick={() => setShowAuth(true)}>
              <div className="w-24 h-24 rounded-full bg-[#D92A2A] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-300">
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-[#FAFAFA] group-hover:text-[#D92A2A] transition-colors">{f.title}</h3>
              <p className="text-xs text-[#A1A1AA] max-w-[180px]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 bg-slate-900 text-white/80 border-t border-slate-800 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div>
            &copy; {new Date().getFullYear()} elitze.ca — Elitze Sentinel Frontier Oss
          </div>
          <div className="flex items-center gap-8 text-white/70">
            <span>ISO 27001 Certified</span>
            <span>SOC 2 Type II</span>
            <span>GDPR Compliant</span>
          </div>
        </div>
      </footer>

      {/* ── AUTH MODAL ── */}
      {showAuth && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-slate-200 rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
            <button 
              onClick={() => setShowAuth(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
            <div className="flex flex-col items-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#D92A2A] flex items-center justify-center text-white text-xl font-bold mb-3 shadow-md">
                E
              </div>
              <h3 className="text-xl font-bold text-[#FAFAFA]">Frontier OS Access</h3>
              <p className="text-xs text-[#A1A1AA] mt-1">Enterprise Creative Platform</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#FAFAFA] mb-1.5">User Account Email</label>
                <input 
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#D92A2A]"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#D92A2A] hover:bg-[#B91C1C] text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Authenticating..." : "Open Dashboard"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
