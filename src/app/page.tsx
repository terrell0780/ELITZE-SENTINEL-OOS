"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] font-sans selection:bg-[#0066FF] selection:text-white flex flex-col relative overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-radial from-[#0066FF]/20 via-transparent to-transparent blur-3xl pointer-events-none z-0" />

      {/* Top Header Navigation */}
      <header className="h-16 border-b border-[#1E293B] bg-[#0B0F19]/80 backdrop-blur-md flex items-center justify-between px-8 max-w-7xl w-full mx-auto relative z-10 shrink-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-8 h-8 rounded-lg bg-[#0066FF] flex items-center justify-center font-extrabold text-white text-sm shadow-md shadow-[#0066FF]/30">
            E
          </div>
          <span className="text-sm font-bold text-white tracking-tight">Elitze Sentinel</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-[#94A3B8]">
          <Link href="/dashboard" className="hover:text-white transition-colors">Features</Link>
          <Link href="/intelligence" className="hover:text-white transition-colors">Docs</Link>
          <Link href="/marketplace" className="hover:text-white transition-colors">Integrations</Link>
          <Link href="/security" className="hover:text-white transition-colors">Security</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-semibold text-[#94A3B8] hover:text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="text-xs font-semibold text-white bg-[#0066FF] hover:bg-[#0052CC] px-4 py-2 rounded-lg shadow-md shadow-[#0066FF]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Main Hero Section (Exact Match to Mockup 4) */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-6 max-w-5xl mx-auto relative z-10 py-16">
        
        {/* Blue Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#0066FF]/40 bg-[#0066FF]/10 text-[#38BDF8] text-xs font-semibold mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#0066FF] animate-pulse" />
          <span>ELITZE SENTINEL FRONTIER OS</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
          The complete platform to <br />
          <span className="text-white">build sovereign AI.</span>
        </h1>

        {/* Subcaption */}
        <p className="text-base sm:text-lg text-[#94A3B8] max-w-2xl font-normal leading-relaxed mb-10">
          Everything you need to deploy autonomous agents, cybersecurity workflows, game engines, and intelligent business applications.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold text-xs shadow-lg shadow-[#0066FF]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get started
          </Link>
          <Link
            href="/intelligence"
            className="px-6 py-3 rounded-lg bg-[#1E293B]/60 hover:bg-[#1E293B] border border-[#334155] text-white font-semibold text-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Documentation
          </Link>
        </div>

        {/* Bottom Stat Bar (Exact Match to Mockup 4) */}
        <div className="grid grid-cols-3 gap-8 md:gap-16 mt-20 pt-12 border-t border-[#1E293B] w-full max-w-3xl">
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-extrabold text-white mb-1">98%</p>
            <p className="text-xs text-[#64748B] font-medium uppercase tracking-wider">Audit Compliance</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-extrabold text-white mb-1">200+</p>
            <p className="text-xs text-[#64748B] font-medium uppercase tracking-wider">Agent Workflows</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-extrabold text-white mb-1">0.01s</p>
            <p className="text-xs text-[#64748B] font-medium uppercase tracking-wider">Kernel Latency</p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[#1E293B] text-center text-xs text-[#64748B] relative z-10 shrink-0">
        <p>Copyright &copy; {new Date().getFullYear()} Elitze Sentinel Frontier OS. All rights reserved.</p>
        <p className="mt-1">
          <a href="https://elitze.org" className="text-[#38BDF8] hover:underline">elitze.org</a> | Contact: <a href="mailto:terrell0780@gmail.com" className="text-white hover:underline">terrell0780@gmail.com</a>
        </p>
      </footer>

    </div>
  );
}
