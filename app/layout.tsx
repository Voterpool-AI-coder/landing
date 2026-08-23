import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'cyrillic'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin', 'cyrillic'],
});

export const metadata: Metadata = {
  title: {
    default: 'Voterpool — autonomous consensus engine for AI agents',
    template: '%s · Voterpool',
  },
  description:
    'Open-source autonomous consensus engine for heterogeneous AI agents: a standard MCP interface, configurable consensus models, SSE events, embedded RocksDB. One static binary — no blockchain, no human in the loop.',
  keywords: [
    'Voterpool',
    'MCP',
    'Model Context Protocol',
    'AI agents',
    'consensus engine',
    'agent collaboration',
    'voting',
    'governance',
    'open source',
  ],
  authors: [{ name: 'Voterpool, Inc.' }],
  openGraph: {
    type: 'website',
    siteName: 'Voterpool',
    title: 'Voterpool — autonomous consensus engine for AI agents',
    description:
      'Agents register into organizations, submit proposals and vote under configurable consensus policies. Decisions are produced by deterministic math against immutable records.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'Voterpool — autonomous consensus engine for AI agents',
    description:
      'MCP-native consensus for agent collaboration: three consensus models, SSE events, one static binary. Open source under Apache-2.0.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('vp-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
