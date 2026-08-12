import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://elitze.ca'),
  title: {
    default: 'Elitze Sentinel Frontier OOS — The Sovereign AI Operating System',
    template: '%s | Elitze Sentinel Frontier OOS',
  },
  description: 'Enterprise AI operations platform with security, workflows, agents, and multi-model orchestration. Sovereign AI infrastructure — deploy in your VPC, own your models, zero vendor lock-in.',
  keywords: [
    'AI operating system',
    'sovereign AI',
    'AI platform',
    'enterprise AI',
    'AI agents',
    'AI governance',
    'AI security',
    'multi-model AI',
    'local AI inference',
    'AI deployment',
    'AI workflow automation',
    'RAG platform',
    'AI marketplace',
    'Elitze Sentinel',
    'Frontier OOS',
  ],
  authors: [{ name: 'TrueElitze Digital' }],
  creator: 'TrueElitze Digital',
  publisher: 'TrueElitze Digital',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://elitze.ca',
    types: {
      'application/rss+xml': '/rss.xml',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://elitze.ca',
    siteName: 'Elitze Sentinel Frontier OOS',
    title: 'Elitze Sentinel Frontier OOS — The Sovereign AI Operating System',
    description: 'Enterprise AI operations platform with security, workflows, agents, and multi-model orchestration. Sovereign AI infrastructure — deploy in your VPC, own your models, zero vendor lock-in.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Elitze Sentinel Frontier OOS — Sovereign AI Operating System',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@elitzesentinel',
    creator: '@trueelitze',
    title: 'Elitze Sentinel Frontier OOS — The Sovereign AI Operating System',
    description: 'Enterprise AI operations platform with security, workflows, agents, and multi-model orchestration. Sovereign AI infrastructure.',
    images: ['/og-image.png'],
  },
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
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'google-site-verification-code',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Elitze Sentinel Frontier OOS',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Cloud, On-Premise, Edge, Air-Gapped',
              description:
                'Sovereign AI operating system for enterprise — multi-model orchestration, agent workflows, RAG, governance, security, and deployment in one platform.',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
              },
              publisher: {
                '@type': 'Organization',
                name: 'TrueElitze Digital',
                url: 'https://elitze.ca',
                logo: { '@type': 'ImageObject', url: 'https://elitze.ca/logo.png' },
              },
              featureList: [
                'Multi-model orchestration (Ollama, vLLM, OpenRouter, Anthropic, OpenAI, Google)',
                'Local inference (Ollama, vLLM) — zero token costs',
                'Agent workflows with quality gates',
                'RAG + Knowledge Graphs',
                'Sentinel governance (RBAC, audit, SPL/KQL)',
                'Air-gap deployment ready',
                '30+ enterprise integrations (GitHub, AWS, Slack, Stripe...)',
                'Marketplace: 50+ agents, templates, workflows',
                'Unreal/Unity game development compiler',
                'Geospatial intelligence (Google Maps MCP)',
              ],
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                reviewCount: '127',
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-[#07090F] text-[#F5F5F5] antialiased">
        {children}
      </body>
    </html>
  );
}
