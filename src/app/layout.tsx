import type { Metadata } from "next";
import "./globals.css";
import ConditionalSidebar from "@/components/ConditionalSidebar";
import TopBar from "@/components/TopBar";
import ErrorBoundary from "@/components/ErrorBoundary";
import AuthGuard from "@/components/AuthGuard";

export const metadata: Metadata = {
  metadataBase: new URL("https://elitze.org"),
  title: {
    default: "Elitze Sentinel Frontier OOS — Sovereign AI Operating System",
    template: "%s | Elitze Frontier",
  },
  description: "The premier enterprise AI operating system. Command your own multi-model orchestration, autonomous agents, CRM, lead generation, and security with full data sovereignty.",
  keywords: ["Sovereign AI", "AI Operating System", "Enterprise AI", "LLM Orchestration", "AI Agents", "Lead Generation", "Cybersecurity", "Elitze Frontier", "On-Premise AI"],
  authors: [{ name: "Terrell Hall / TrueElitze Digital", url: "https://elitze.org" }],
  creator: "Terrell Hall",
  publisher: "TrueElitze Digital",
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://elitze.org",
    title: "Elitze Sentinel Frontier",
    description: "The sovereign AI operating system for enterprise. Multi-model orchestration, agent workflows, security, and full data ownership.",
    siteName: "Elitze Sentinel Frontier",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="h-screen flex bg-[#08090c] text-[#f5f7fa] overflow-hidden">
          <ConditionalSidebar />
          <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden bg-[#08090c]">
            <TopBar />
            <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
              <ErrorBoundary>
                <AuthGuard>
                  {children}
                </AuthGuard>
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}