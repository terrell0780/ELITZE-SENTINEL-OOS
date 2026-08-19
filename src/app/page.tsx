"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#050506] text-[#FAFAFA] font-sans selection:bg-[#D0202F] selection:text-white flex flex-col relative overflow-hidden">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-radial from-[#D0202F]/15 via-transparent to-transparent blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-radial from-[#D0202F]/10 via-transparent to-transparent blur-3xl pointer-events-none z-0" />

      {/* Top Header Nav */}
      <header className="h-20 border-b border-[#1A1A1E] flex items-center justify-between px-8 max-w-7xl w-full mx-auto relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#27272A] shadow-xl">
            <img src="/elitze-logo.png" alt="Elitze Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-wider text-white block leading-none uppercase">ELITZE SENTINEL</span>
            <span className="text-[10px] font-bold text-[#D0202F] tracking-widest uppercase">FRONTIER OOS</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#A1A1AA]">
          <a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a>
          <a href="#architecture" className="hover:text-white transition-colors">16-Plane Architecture</a>
          <a href="#security" className="hover:text-white transition-colors">SecOps</a>
          <a href="#acquisition" className="hover:text-white transition-colors">Acquisition</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-bold text-[#A1A1AA] hover:text-white px-4 py-2 rounded-xl transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/chat"
            className="text-xs font-bold text-white bg-[#D0202F] hover:bg-[#B01825] px-5 py-2.5 rounded-xl shadow-lg shadow-[#D0202F]/20 transition-all hover:scale-105 active:scale-95"
          >
            Launch OS Console
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-6 max-w-5xl mx-auto relative z-10 py-20">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D0202F]/30 bg-[#D0202F]/10 text-[#D0202F] text-xs font-bold uppercase tracking-widest mb-8">
          <span className="w-2 h-2 rounded-full bg-[#D0202F] animate-pulse" />
          Sovereign AI Operating System
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 leading-[1.1]">
          Command Autonomous Intelligence With <span className="bg-gradient-to-r from-white via-[#E4E4E7] to-[#D0202F] bg-clip-text text-transparent">Absolute Sovereignty</span>
        </h1>

        <p className="text-lg md:text-xl text-[#A1A1AA] max-w-3xl font-medium leading-relaxed mb-10">
          The full-stack enterprise operating environment unifying multi-model orchestration, autonomous agent swarms, cybersecurity threat intelligence, game engine compilers, and real-time business execution.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button
            onClick={() => router.push("/chat")}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#D0202F] hover:bg-[#B01825] text-white font-extrabold text-sm shadow-xl shadow-[#D0202F]/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <span>ENTER FRONTIER OS</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>

          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#141417] hover:bg-[#1C1C20] border border-[#27272A] text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>AUTHENTICATE TERMINAL</span>
          </Link>
        </div>

        {/* Highlights Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 w-full text-left">
          <div className="p-5 rounded-2xl bg-[#0D0D0F] border border-[#1F1F23]">
            <p className="text-2xl font-black text-white mb-1">30</p>
            <p className="text-xs text-[#71717A] font-semibold uppercase tracking-wider">Console Hubs</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#0D0D0F] border border-[#1F1F23]">
            <p className="text-2xl font-black text-[#D0202F] mb-1">16-Plane</p>
            <p className="text-xs text-[#71717A] font-semibold uppercase tracking-wider">OS Kernel</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#0D0D0F] border border-[#1F1F23]">
            <p className="text-2xl font-black text-white mb-1">281 / 281</p>
            <p className="text-xs text-[#71717A] font-semibold uppercase tracking-wider">Pytest Verified</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#0D0D0F] border border-[#1F1F23]">
            <p className="text-2xl font-black text-white mb-1">100%</p>
            <p className="text-xs text-[#71717A] font-semibold uppercase tracking-wider">Data Sovereign</p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-[#1A1A1E] text-center text-xs text-[#71717A] relative z-10">
        <p className="font-semibold text-[#A1A1AA] mb-1">Elitze Sentinel Frontier OOS &copy; {new Date().getFullYear()} Terrell Hall / TrueElitze Digital</p>
        <p>Canonical Domain: <a href="https://elitze.org" className="text-[#D0202F] hover:underline">https://elitze.org</a> | Contact: <a href="mailto:terrell0780@gmail.com" className="text-white hover:underline">terrell0780@gmail.com</a></p>
      </footer>

    </div>
  );
}
