import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Captain Cool — IPL Multi-Agent Strategist',
  description:
    'Gemini-powered agentic AI system that thinks like an IPL captain. Four specialized agents debate live match situations and deliver tactical decisions with stats, commentary, and a devil\'s challenge.',
  keywords: ['IPL', 'cricket', 'AI', 'Gemini', 'multi-agent', 'tactics', 'Google ADK'],
};

import { AuthProvider } from '../context/AuthContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="pitch-bg min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
