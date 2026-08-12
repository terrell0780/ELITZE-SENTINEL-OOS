import type { Metadata } from "next";
import "./globals.css";
import ConditionalSidebar from "@/components/ConditionalSidebar";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  metadataBase: new URL("https://elitze.ca"),
  title: {
    default: "Elitze Sentinel Frontier Oss — Sovereign AI Operating System",
    template: "%s | Elitze Frontier",
  },
  description: "The premier enterprise AI operating system. Command your own multi-model orchestration, autonomous agents, CRM, lead generation, and security with full data sovereignty.",
  keywords: ["Sovereign AI", "AI Operating System", "Enterprise AI", "LLM Orchestration", "AI Agents", "Lead Generation", "Cybersecurity", "Elitze Frontier", "On-Premise AI"],
  authors: [{ name: "Terrell Hall / TrueElitze Digital", url: "https://elitze.ca" }],
  creator: "Terrell Hall",
  publisher: "TrueElitze Digital",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://elitze.ca",
    title: "Elitze Sentinel Frontier",
    description: "The sovereign AI operating system for enterprise. Multi-model orchestration, agent workflows, security, and full data ownership.",
    siteName: "Elitze Sentinel Frontier",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Elitze Sentinel Frontier Logo",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Elitze Sentinel Frontier",
    description: "The sovereign AI operating system for enterprise. Multi-model orchestration, agent workflows, security, and full data ownership.",
    creator: "@trueelitze",
    images: ["/logo.jpg"],
  },
  alternates: {
    canonical: "https://elitze.ca",
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
        <div className="h-screen flex bg-[#09090B] text-[#FAFAFA]">
          <ConditionalSidebar />
          <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </body>
    </html>
  );
}