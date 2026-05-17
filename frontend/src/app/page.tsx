// ============================================================
// captain-cool/frontend/src/app/page.tsx
// Pure landing page for the project (Light Theme)
// ============================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import AuthModal from '../components/auth/AuthModal';

export default function LandingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleActionClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      router.push('/dashboard');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ipl-dark text-ipl-text">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-ipl-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ipl-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen noise-overlay bg-ipl-dark">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-ipl-border bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏏</span>
            <div>
              <h1 className="font-display text-lg font-bold text-ipl-text leading-none">Captain Cool</h1>
              <p className="text-xs text-ipl-muted">Multi-Agent IPL Strategist</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-ipl-border bg-ipl-surface">
              <span className="text-xs">✨</span>
              <span className="text-xs text-ipl-muted font-mono">Gemini 2.5 Pro + Flash</span>
            </div>
            
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-xs text-white bg-blue-600 border border-blue-500 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-bold"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        <div className="space-y-24">
          
          {/* Section 1: Hero */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-ipl-gold/20 bg-ipl-gold/10 mb-6">
              <span className="w-2 h-2 rounded-full bg-ipl-amber animate-pulse" />
              <span className="text-xs text-ipl-amber font-mono font-bold">Powered by Google Gemini 2.5 + ADK</span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl font-black text-ipl-text mb-6 leading-tight">
              Master the Game with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-ipl-navy">
                Multi-Agent AI
              </span>
            </h1>
            <p className="text-ipl-muted text-xl max-w-3xl mx-auto mb-10">
              Captain Cool simulates a high-stakes dressing room debate. Four specialized AI agents analyze live match situations and deliver data-backed tactical decisions.
            </p>
            
            <div className="flex justify-center gap-4">
              <button 
                onClick={handleActionClick}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-ipl-navy text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/20 text-lg"
              >
                Get Started
              </button>
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="px-8 py-4 bg-white border border-ipl-border text-ipl-text font-bold rounded-xl hover:bg-ipl-surface transition-colors text-lg shadow-sm"
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Section 2: Meet the Agents */}
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-ipl-text mb-2">Meet Your Brain Trust</h2>
              <p className="text-ipl-muted">Four specialized agents, one ultimate decision.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '🧢', name: 'The Strategist', role: 'Captain', desc: 'Calm, methodical, and always two overs ahead. Makes the final tactical call.', color: 'border-green-100 bg-green-50/50 text-green-800' },
                { icon: '📊', name: 'Stats Analyst', role: 'Data Guru', desc: 'Brutally honest with numbers. Uses tools to validate or challenge decisions.', color: 'border-blue-100 bg-blue-50/50 text-blue-800' },
                { icon: '⚡', name: "Devil's Advocate", role: 'Challenger', desc: 'Exposes flaws and hidden risks. Prevents predictable and safe captaincy.', color: 'border-red-100 bg-red-50/50 text-red-800' },
                { icon: '🎙️', name: 'Commentator', role: 'Narrator', desc: 'Converts complex tactical debates into engaging, TV-quality narrative.', color: 'border-amber-100 bg-amber-50/50 text-amber-800' },
              ].map((agent) => (
                <div key={agent.name} className={`p-6 rounded-2xl border ${agent.color} hover:transform hover:-translate-y-1 transition-all duration-300 shadow-sm`}>
                  <span className="text-4xl block mb-4">{agent.icon}</span>
                  <h3 className="text-lg font-bold mb-1">{agent.name}</h3>
                  <p className="text-xs font-mono mb-3 opacity-75">{agent.role}</p>
                  <p className="text-sm opacity-90">{agent.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: The Debate Loop */}
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-ipl-text mb-2">The ADK Debate Loop</h2>
              <p className="text-ipl-muted">How our multi-agent system reaches a consensus.</p>
            </div>
            
            <div className="relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-ipl-border -translate-y-1/2 hidden md:block"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                {[
                  { step: '1', title: 'Propose', desc: 'Strategist makes initial call' },
                  { step: '2', title: 'Validate', desc: 'Stats Analyst runs data checks' },
                  { step: '3', title: 'Challenge', desc: 'Devil Advocate attacks plan' },
                  { step: '4', title: 'Execute', desc: 'Commentator explains final call' },
                ].map((item) => (
                  <div key={item.step} className="bg-white border border-ipl-border p-5 rounded-xl text-center shadow-sm">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-ipl-navy rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">
                      {item.step}
                    </div>
                    <h3 className="text-base font-bold text-ipl-text mb-1">{item.title}</h3>
                    <p className="text-xs text-ipl-muted">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Technology Stack */}
          <div className="max-w-5xl mx-auto bg-white border border-ipl-border rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-ipl-text mb-2">Built with State-of-the-Art Tech</h2>
              <p className="text-ipl-muted text-sm">Leveraging the best tools for the Google Gemini Agentic AI Hackathon.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl mb-2">🧠</div>
                <h3 className="font-bold text-ipl-text mb-1">Gemini 2.5</h3>
                <p className="text-xs text-ipl-muted">Pro for complex reasoning, Flash for speed and commentary.</p>
              </div>
              <div>
                <div className="text-3xl mb-2">🤖</div>
                <h3 className="font-bold text-white mb-1">Google ADK</h3>
                <p className="text-xs text-ipl-muted">Orchestrates multi-agent communication and streaming.</p>
              </div>
              <div>
                <div className="text-3xl mb-2">🔥</div>
                <h3 className="font-bold text-ipl-text mb-1">Firebase</h3>
                <p className="text-xs text-ipl-muted">Secure authentication and real-time session storage.</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-ipl-border mt-24 py-8 relative z-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ipl-muted">
            🏆 Built for Google Gemini Agentic AI Hackathon
          </p>
          <div className="flex items-center gap-4 text-xs text-ipl-muted">
            <span>Next.js 15</span>
            <span>•</span>
            <span>TailwindCSS</span>
            <span>•</span>
            <span>TypeScript</span>
          </div>
        </div>
      </footer>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}
