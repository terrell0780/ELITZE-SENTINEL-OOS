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
      router.push("/chat");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#050506] text-[#FAFAFA] flex items-center justify-center p-6 relative overflow-hidden font-sans select-none">
      
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-radial from-[#D0202F]/15 via-transparent to-transparent blur-3xl pointer-events-none z-0" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#0D0D0F] border border-[#1F1F23] rounded-3xl p-8 shadow-2xl relative z-10">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[#27272A] shadow-xl mb-4">
            <img src="/elitze-logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">FRONTIER OS TERMINAL</h1>
          <p className="text-xs text-[#71717A] mt-1 font-medium">Authenticate to access Sovereign Kernel & 30 Hubs</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-2">Operator ID / Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@elitze.org"
              className="w-full bg-[#141417] border border-[#27272A] rounded-xl px-4 py-3 text-xs text-white placeholder-[#52525B] outline-none focus:border-[#D0202F] transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-2">Access Key / Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#141417] border border-[#27272A] rounded-xl px-4 py-3 text-xs text-white placeholder-[#52525B] outline-none focus:border-[#D0202F] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#D0202F] hover:bg-[#B01825] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#D0202F]/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-6 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <span>AUTHENTICATE & ENTER OS</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#1C1C20] flex items-center justify-between text-[11px] text-[#71717A]">
          <Link href="/" className="hover:text-white transition-colors">← Back to Landing</Link>
          <span className="text-[#D0202F] font-bold">16-Plane Kernel Active</span>
        </div>

      </div>

    </div>
  );
}
