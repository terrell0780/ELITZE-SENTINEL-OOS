"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState("terrell0780@gmail.com");
  const [loading, setLoading] = useState(false);
  const [activeHeroTab, setActiveHeroTab] = useState<"sentinel" | "studio" | "swarm">("sentinel");

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
    <div className="min-h-screen bg-[#060608] text-[#FAFAFA] font-sans flex flex-col selection:bg-[#0066FF] selection:text-white relative overflow-x-hidden">
      
      {/* ── AMBIENT BACKGROUND LIGHTING ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#0066FF]/15 via-[#8B5CF6]/10 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[800px] left-1/4 w-[600px] h-[400px] bg-[#EF4444]/5 blur-[140px] pointer-events-none z-0" />

      {/* ── TOP GLASS NAVIGATION BAR ── */}
      <header className="sticky top-0 h-16 bg-[#060608]/80 backdrop-blur-xl border-b border-[#1A1A22] px-6 lg:px-12 flex items-center justify-between z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#8B5CF6] flex items-center justify-center font-black text-white text-xs shadow-lg shadow-[#0066FF]/30">
            E
          </div>
          <div>
            <span className="text-xs font-bold text-white tracking-tight uppercase block leading-none">ELITZE SENTINEL</span>
            <span className="text-[9px] font-semibold text-[#0066FF] uppercase tracking-widest">FRONTIER OOS</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#A1A1AA]">
          <a href="#platform" className="hover:text-white transition-colors">Platform</a>
          <a href="#sentinel" className="hover:text-white transition-colors">Sentinel SecOps</a>
          <a href="#studio" className="hover:text-white transition-colors">Frontier Studio</a>
          <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
          <a href="#enterprise" className="hover:text-white transition-colors">Enterprise</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAuth(true)}
            className="text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors px-3 py-1.5"
          >
            Sign In
          </button>
          <button 
            onClick={() => setShowAuth(true)}
            className="px-4 py-1.5 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-lg text-xs transition-all shadow-md shadow-[#0066FF]/25 hover:scale-105 active:scale-95"
          >
            Launch OS
          </button>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section id="platform" className="relative pt-20 pb-16 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#14141A] border border-[#272738] text-xs text-[#A1A1AA] mb-8 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="font-semibold text-white">Frontier OS 2.4</span>
          <span className="text-[#52525B]">|</span>
          <span className="text-[#38BDF8]">Sovereign SecOps & World Engine</span>
        </div>

        {/* Hero Headlines */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-5xl mb-6">
          The Enterprise Shell for <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#0066FF] via-[#38BDF8] to-[#8B5CF6] bg-clip-text text-transparent">
            Sovereign AI & Autonomous Systems
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#94A3B8] max-w-2xl font-normal leading-relaxed mb-10">
          Unifying 9-stage SecOps vulnerability intelligence, multi-agent swarms, and procedural game development into a single high-performance operating environment.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <button
            onClick={() => setShowAuth(true)}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#0066FF] hover:bg-[#0052CC] text-white font-bold text-sm rounded-xl shadow-xl shadow-[#0066FF]/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Open Operating Environment</span>
            <span>→</span>
          </button>
          <button
            onClick={() => router.push("/chat")}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#14141A] border border-[#272738] hover:border-[#38BDF8]/50 text-[#A1A1AA] hover:text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <span>Ask Frontier AI</span>
          </button>
        </div>

        {/* ── HERO LIVE DEMO SHOWCASE ── */}
        <div className="w-full max-w-5xl bg-[#0E0E12] border border-[#272738] rounded-2xl overflow-hidden shadow-2xl relative text-left">
          
          {/* Showcase Header Bar */}
          <div className="h-12 bg-[#09090D] border-b border-[#1A1A22] px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#EF4444]/60" />
              <span className="w-3 h-3 rounded-full bg-[#F97316]/60" />
              <span className="w-3 h-3 rounded-full bg-[#10B981]/60" />
              <span className="ml-3 text-xs font-mono text-[#52525B]">frontier-os://runtime-preview</span>
            </div>

            {/* Interactive Demo Tabs */}
            <div className="flex items-center gap-1 bg-[#14141A] p-1 rounded-lg border border-[#272738]">
              <button
                onClick={() => setActiveHeroTab("sentinel")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  activeHeroTab === "sentinel" ? "bg-[#EF4444] text-white shadow-sm" : "text-[#71717A] hover:text-white"
                }`}
              >
                🛡️ Sentinel SecOps
              </button>
              <button
                onClick={() => setActiveHeroTab("studio")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  activeHeroTab === "studio" ? "bg-[#8B5CF6] text-white shadow-sm" : "text-[#71717A] hover:text-white"
                }`}
              >
                🎮 Frontier Studio
              </button>
              <button
                onClick={() => setActiveHeroTab("swarm")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  activeHeroTab === "swarm" ? "bg-[#0066FF] text-white shadow-sm" : "text-[#71717A] hover:text-white"
                }`}
              >
                🤖 Agent Swarm
              </button>
            </div>
          </div>

          {/* Showcase Active Demo Screen */}
          <div className="p-6 min-h-[340px] flex flex-col justify-between font-mono text-xs">
            
            {/* DEMO 1: SENTINEL SECOPS */}
            {activeHeroTab === "sentinel" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#1A1A22] pb-3 font-sans">
                  <div>
                    <span className="text-xs font-bold text-[#EF4444] uppercase tracking-wider">Sentinel Security Pipeline</span>
                    <p className="text-[11px] text-[#71717A]">9-Stage Ingest to Audit Automated Remediation</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-[10px] font-bold">
                    CISA KEV ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-sans">
                  <div className="p-3 rounded-lg bg-[#14141A] border border-[#272738]">
                    <span className="text-[10px] text-[#71717A] font-bold uppercase">Critical CVEs</span>
                    <p className="text-xl font-extrabold text-white mt-1">14</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#14141A] border border-[#272738]">
                    <span className="text-[10px] text-[#71717A] font-bold uppercase">EPSS Peak Prob</span>
                    <p className="text-xl font-extrabold text-[#10B981] mt-1">94.2%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#14141A] border border-[#272738]">
                    <span className="text-[10px] text-[#71717A] font-bold uppercase">Auto-Patches</span>
                    <p className="text-xl font-extrabold text-[#38BDF8] mt-1">38 Queued</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#14141A] border border-[#272738]">
                    <span className="text-[10px] text-[#71717A] font-bold uppercase">Guardrails</span>
                    <p className="text-xl font-extrabold text-[#F97316] mt-1">VERIFIED</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#08080C] border border-[#1A1A22] text-[#10B981] space-y-1 text-[11px]">
                  <p>[SENTINEL-KERNEL] Ingesting threat telemetry from NVD & CISA feeds...</p>
                  <p>[CORRELATE] CVE-2026-21849 mapped to api-gateway-node-01.elitze.internal</p>
                  <p>[REMEDIATE] Non-breaking kernel patch compiled & applied in 4.2 seconds.</p>
                </div>
              </div>
            )}

            {/* DEMO 2: FRONTIER STUDIO */}
            {activeHeroTab === "studio" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#1A1A22] pb-3 font-sans">
                  <div>
                    <span className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider">Frontier Game Engine</span>
                    <p className="text-[11px] text-[#71717A]">Unreal Engine 5.6 Native · Procedural World & Agent Hierarchy</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6] text-[10px] font-bold">
                    UE 5.6 RUNTIME
                  </span>
                </div>

                <div className="h-40 rounded-xl bg-gradient-to-br from-[#090D16] via-[#101524] to-[#0A0D14] border border-[#272738] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.08]" style={{
                    backgroundImage: "linear-gradient(rgba(139,92,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.4) 1px, transparent 1px)",
                    backgroundSize: "30px 30px",
                  }} />
                  <div className="relative z-10 text-center font-sans">
                    <span className="text-3xl">🌍</span>
                    <p className="text-xs font-bold text-white mt-2 uppercase">Coastal Wasteland Region</p>
                    <p className="text-[10px] text-[#A78BFA] font-mono">3 Settlements · Bunker 09 · Dynamic Weather</p>
                  </div>
                </div>
              </div>
            )}

            {/* DEMO 3: AGENT SWARM */}
            {activeHeroTab === "swarm" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#1A1A22] pb-3 font-sans">
                  <div>
                    <span className="text-xs font-bold text-[#0066FF] uppercase tracking-wider">Multi-Agent Swarm Orchestration</span>
                    <p className="text-[11px] text-[#71717A]">Autonomous execution mesh across research, security & code tools</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#0066FF]/10 border border-[#0066FF]/30 text-[#0066FF] text-[10px] font-bold">
                    SWARM ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 font-sans">
                  <div className="p-3 rounded-lg bg-[#14141A] border border-[#272738] space-y-1">
                    <span className="text-[10px] text-[#71717A] font-bold uppercase">Orchestrator</span>
                    <p className="text-xs font-bold text-white">Sentinel Lead</p>
                    <p className="text-[10px] text-[#10B981]">Allocating tasks...</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#14141A] border border-[#272738] space-y-1">
                    <span className="text-[10px] text-[#71717A] font-bold uppercase">Code Reviewer</span>
                    <p className="text-xs font-bold text-white">Pytest Mesh</p>
                    <p className="text-[10px] text-[#38BDF8]">311/311 Passed</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#14141A] border border-[#272738] space-y-1">
                    <span className="text-[10px] text-[#71717A] font-bold uppercase">World Planner</span>
                    <p className="text-xs font-bold text-white">Ecology Agent</p>
                    <p className="text-[10px] text-[#A78BFA]">Flora Graph Active</p>
                  </div>
                </div>
              </div>
            )}

            {/* Showcase Footer */}
            <div className="pt-3 border-t border-[#1A1A22] flex items-center justify-between text-[#52525B]">
              <span>Click any tab to preview workspace capabilities</span>
              <span className="text-[#38BDF8]">Click Launch OS to enter →</span>
            </div>

          </div>
        </div>

      </section>

      {/* ── ENTERPRISE TRUST LOGOS BAR ── */}
      <section className="py-10 border-y border-[#1A1A22] bg-[#08080C] px-6 text-center z-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest mb-6">
            Engineered for High-Consequence Enterprise & Gaming Infrastructure
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all font-mono text-sm text-[#A1A1AA] font-bold">
            <span>CLOUDFLARE</span>
            <span>CROWDSTRIKE</span>
            <span>UNREAL ENGINE</span>
            <span>NVIDIA AI</span>
            <span>SNOWFLAKE</span>
            <span>DATADOG</span>
          </div>
        </div>
      </section>

      {/* ── BENTO GRID FEATURES SECTION ── */}
      <section id="sentinel" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto z-10 space-y-16">
        
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold text-[#0066FF] uppercase tracking-widest">Enterprise Capability Mesh</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Built for Serious Productization. Not Generic Chatbots.
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8]">
            Frontier connects deep conversation to contextual actions, runtime code execution, vulnerability scoring, and procedural generation.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Sentinel SecOps (Large 2-column) */}
          <div className="md:col-span-2 p-8 rounded-2xl bg-[#0E0E12] border border-[#272738] hover:border-[#EF4444]/50 transition-all group relative overflow-hidden space-y-6">
            <div className="w-10 h-10 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center text-lg">
              🛡️
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#EF4444] uppercase tracking-wider">SENTINEL SECOPS PIPELINE</span>
              <h3 className="text-2xl font-bold text-white group-hover:text-[#EF4444] transition-colors">
                9-Stage Automated Threat Remediation
              </h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Ingest, normalize, correlate, score, exposure, prioritize, remediate, verify, and audit. Real-time CVE, CVSS 4.0, EPSS probability, and CISA Known Exploited Vulnerability matching.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-3 text-xs text-[#EF4444] font-semibold">
              <span onClick={() => router.push("/security")} className="cursor-pointer hover:underline">Inspect SecOps Console →</span>
            </div>
          </div>

          {/* Card 2: Multi-Agent Swarm */}
          <div className="p-8 rounded-2xl bg-[#0E0E12] border border-[#272738] hover:border-[#0066FF]/50 transition-all group space-y-6">
            <div className="w-10 h-10 rounded-xl bg-[#0066FF]/10 border border-[#0066FF]/30 flex items-center justify-center text-lg">
              🤖
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#0066FF] uppercase tracking-wider">SWARM ORCHESTRATION</span>
              <h3 className="text-xl font-bold text-white group-hover:text-[#0066FF] transition-colors">
                Autonomous Agent Fleet
              </h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Dispatch parallel subagents across research, code analysis, security auditing, and lead generation.
              </p>
            </div>
          </div>

          {/* Card 3: Frontier Studio (Large 2-column) */}
          <div id="studio" className="md:col-span-2 p-8 rounded-2xl bg-[#0E0E12] border border-[#272738] hover:border-[#8B5CF6]/50 transition-all group relative overflow-hidden space-y-6">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-lg">
              🎮
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider">FRONTIER GAME ENGINE</span>
              <h3 className="text-2xl font-bold text-white group-hover:text-[#8B5CF6] transition-colors">
                Procedural 3D World & Agent Hierarchy
              </h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Prompt-to-project game generation. World Directors, Content Directors, Gameplay Directors, and QA Directors compile native playable C++ and Unreal Engine builds.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-3 text-xs text-[#8B5CF6] font-semibold">
              <span onClick={() => router.push("/gaming")} className="cursor-pointer hover:underline">Open Game Studio →</span>
            </div>
          </div>

          {/* Card 4: Enterprise Audit */}
          <div id="enterprise" className="p-8 rounded-2xl bg-[#0E0E12] border border-[#272738] hover:border-[#10B981]/50 transition-all group space-y-6">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-lg">
              🔒
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#10B981] uppercase tracking-wider">SOVEREIGN GOVERNANCE</span>
              <h3 className="text-xl font-bold text-white group-hover:text-[#10B981] transition-colors">
                SOC2 & RBAC Telemetry
              </h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Prompt injection defense, PII redaction, output validation, and complete audit trail persistence.
              </p>
            </div>
          </div>

        </div>

      </section>

      {/* ── 9-STAGE PIPELINE SHOWCASE ── */}
      <section id="architecture" className="py-20 border-y border-[#1A1A22] bg-[#08080C] px-6 z-10 text-center">
        <div className="max-w-6xl mx-auto space-y-8">
          <span className="text-xs font-bold text-[#38BDF8] uppercase tracking-widest">Pipeline Architecture</span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">The 9-Stage Execution Workflow</h2>
          
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-5xl mx-auto font-mono text-xs select-none">
            {[
              "INGEST", "NORMALIZE", "CORRELATE", "SCORE", "EXPOSURE", "PRIORITIZE", "REMEDIATE", "VERIFY", "AUDIT"
            ].map((step, idx, arr) => (
              <div key={step} className="flex items-center gap-2">
                <span className="px-3.5 py-2 rounded-lg bg-[#14141A] border border-[#272738] text-white font-bold shadow-sm">
                  <span className="text-[#38BDF8] mr-1">{idx + 1}.</span> {step}
                </span>
                {idx < arr.length - 1 && <span className="text-[#52525B] font-bold">→</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HIGH-CONVERTING CTA BANNER ── */}
      <section className="py-24 px-6 lg:px-12 max-w-5xl mx-auto text-center z-10 relative">
        <div className="p-12 rounded-3xl bg-gradient-to-b from-[#0E0E14] to-[#08080C] border border-[#272738] shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#0066FF]/20 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Experience Enterprise Frontier OS?
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8] max-w-xl mx-auto">
            Launch the operating environment now to manage threat intelligence, launch agent swarms, or build 3D worlds.
          </p>
          
          <div className="pt-4">
            <button
              onClick={() => setShowAuth(true)}
              className="px-10 py-4 bg-[#0066FF] hover:bg-[#0052CC] text-white font-bold text-sm rounded-xl shadow-xl shadow-[#0066FF]/30 transition-all hover:scale-105 active:scale-95"
            >
              Launch Operating System Now
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 bg-[#040406] text-[#71717A] border-t border-[#1A1A22] mt-auto text-xs z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-[#0066FF] flex items-center justify-center font-bold text-white text-[10px]">
              E
            </div>
            <span>&copy; {new Date().getFullYear()} Elitze Sentinel Frontier OS. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-8 text-[#A1A1AA] font-mono">
            <span>ISO 27001</span>
            <span>SOC 2 TYPE II</span>
            <span>GDPR COMPLIANT</span>
            <span>CISA KEV VERIFIED</span>
          </div>
        </div>
      </footer>

      {/* ── AUTHENTICATION MODAL ── */}
      {showAuth && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0E0E12] border border-[#272738] rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
            <button 
              onClick={() => setShowAuth(false)}
              className="absolute top-4 right-4 text-[#71717A] hover:text-white transition-colors"
            >
              ✕
            </button>
            <div className="flex flex-col items-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#0066FF] flex items-center justify-center text-white text-xl font-bold mb-3 shadow-lg shadow-[#0066FF]/30">
                E
              </div>
              <h3 className="text-xl font-bold text-white">Frontier OS Enterprise Access</h3>
              <p className="text-xs text-[#94A3B8] mt-1">Authenticate to enter sovereign environment</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Enterprise Email Address</label>
                <input 
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#14141A] border border-[#272738] rounded-xl text-sm text-white outline-none focus:border-[#0066FF] transition-all font-mono"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#0066FF] hover:bg-[#0052CC] text-white font-bold rounded-xl text-sm shadow-md shadow-[#0066FF]/25 transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Authenticating Sovereign Session..." : "Enter Operating Environment →"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
