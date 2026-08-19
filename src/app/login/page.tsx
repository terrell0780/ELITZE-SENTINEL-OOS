"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex flex-col font-sans select-none relative overflow-hidden">
      
      {/* Top Header Navigation (Exact Match to Mockup 1 Header) */}
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
            className="text-xs font-semibold text-white bg-[#0066FF] hover:bg-[#0052CC] px-4 py-2 rounded-lg shadow-md shadow-[#0066FF]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Main Login Canvas */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        
        {/* Centered Login Card (Exact Match to Mockup 1) */}
        <div className="w-full max-w-sm bg-[#111827] border border-[#1E293B] rounded-2xl p-8 shadow-2xl relative">
          
          <div className="mb-6 text-left">
            <h1 className="text-xl font-bold text-white tracking-tight">Sign in</h1>
            <p className="text-xs text-[#94A3B8] mt-1 font-normal">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-[#0B0F19] border border-[#334155] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-[#64748B] outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#CBD5E1]">Password</label>
                <a href="#" className="text-xs text-[#38BDF8] hover:underline font-medium">Forgot password?</a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0B0F19] border border-[#334155] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-[#64748B] outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold text-xs shadow-md shadow-[#0066FF]/25 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#1E293B] text-center text-xs text-[#94A3B8]">
            Don't have an account? <Link href="/" className="text-[#38BDF8] hover:underline font-semibold">Sign up</Link>
          </div>

        </div>

      </main>

    </div>
  );
}
