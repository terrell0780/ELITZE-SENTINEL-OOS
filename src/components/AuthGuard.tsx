"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Public routes that don't require auth
    const publicRoutes = ["/", "/login", "/welcome"];
    
    if (publicRoutes.includes(pathname)) {
      setAuthorized(true);
      return;
    }

    // Check auth token/flag
    const isAuth = localStorage.getItem("frontier_authenticated") === "true";
    if (!isAuth) {
      setAuthorized(false);
      router.push("/login");
    } else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  if (!authorized) {
    const publicRoutes = ["/", "/login", "/welcome"];
    if (publicRoutes.includes(pathname)) {
      return <>{children}</>;
    }
    return (
      <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#0066FF] border-t-transparent animate-spin mb-3" />
        <p className="text-xs font-semibold text-[#94A3B8]">Authenticating Terminal Session...</p>
      </div>
    );
  }

  return <>{children}</>;
}
