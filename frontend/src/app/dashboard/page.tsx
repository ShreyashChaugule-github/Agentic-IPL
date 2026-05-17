// ============================================================
// captain-cool/frontend/src/app/dashboard/page.tsx
// Dashboard page for authenticated users (Light Theme)
// ============================================================

'use client';

import React, { useState, useEffect } from 'react';
import { MatchInputForm } from '../../components/match/MatchInputForm';
import { ScoreBoard } from '../../components/match/ScoreBoard';
import { AgentCard } from '../../components/agents/AgentCard';
import { AgentOrchestrationPanel } from '../../components/agents/AgentOrchestrationPanel';
import { FinalDecisionCard } from '../../components/agents/FinalDecisionCard';
import { useDebate } from '../../hooks/useDebate';
import { MatchState } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const {
    status, agentMessages, agentActivity, finalDecision,
    error, currentRound, runDebate, loadDemo, reset,
  } = useDebate();

  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [currentMatchState, setCurrentMatchState] = useState<MatchState | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleSubmit = (matchState: MatchState) => {
    setCurrentMatchState(matchState);
    runDebate(matchState);
  };

  const handleLoadDemo = async () => {
    const demo = await loadDemo();
    if (demo) setCurrentMatchState(demo);
  };

  const handleReset = () => {
    reset();
    setCurrentMatchState(null);
  };

  const isRunning = status === 'running' || status === 'starting';

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ipl-dark text-ipl-text">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-ipl-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ipl-muted text-sm">Loading session...</p>
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

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-ipl-border bg-ipl-surface">
              <span className="text-xs">✨</span>
              <span className="text-xs text-ipl-muted font-mono">Gemini 2.5 Pro + Flash</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-ipl-muted hidden md:inline">{user.email}</span>
              <button
                onClick={() => signOut()}
                className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors font-medium"
              >
                Sign Out
              </button>
            </div>

            {status !== 'idle' && (
              <button
                onClick={handleReset}
                className="text-xs text-ipl-text border border-ipl-border bg-white px-3 py-1.5 rounded-lg hover:bg-ipl-surface transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* ── Main content grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-1 space-y-6">
            {status === 'idle' ? (
              <div id="match-input-form" className="bg-white border border-ipl-border rounded-xl shadow-sm p-1">
                <MatchInputForm
                  onSubmit={handleSubmit}
                  onLoadDemo={handleLoadDemo}
                  isLoading={isRunning}
                />
              </div>
            ) : (
              <>
                {currentMatchState && (
                  <ScoreBoard matchState={currentMatchState} />
                )}
                <AgentOrchestrationPanel
                  agentActivity={agentActivity}
                  currentRound={currentRound}
                  isRunning={isRunning}
                />
                {status === 'completed' && (
                  <button
                    onClick={handleReset}
                    className="w-full py-3 rounded-xl border border-ipl-border bg-white text-ipl-text hover:bg-ipl-surface transition-colors text-sm shadow-sm font-medium"
                  >
                    ← New Match
                  </button>
                )}
              </>
            )}
          </div>

          {/* Right column — debate + final decision */}
          <div className="lg:col-span-2 space-y-4">
            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 font-semibold text-sm">⚠️ Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            )}

            {/* Starting state */}
            {status === 'starting' && (
              <div className="text-center py-16 bg-white border border-ipl-border rounded-xl shadow-sm">
                <div className="text-4xl mb-4 animate-bounce">🏏</div>
                <p className="text-ipl-text font-bold text-lg">Initializing Debate Session</p>
                <p className="text-ipl-muted text-sm mt-2">Spinning up 4 Gemini agents...</p>
              </div>
            )}

            {/* Final decision (Shown first when available) */}
            {finalDecision && (
              <div className="pt-2 mb-4">
                <FinalDecisionCard decision={finalDecision} />
              </div>
            )}

            {/* Agent debate messages */}
            {agentMessages.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-bold text-ipl-text">Agent Debate</h2>
                  <span className="text-xs text-ipl-muted">
                    {agentMessages.length} / 6 rounds
                  </span>
                  {isRunning && (
                    <div className="ml-auto flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-ipl-gold animate-pulse" />
                      <span className="text-xs text-ipl-gold font-bold">Live</span>
                    </div>
                  )}
                </div>

                {agentMessages.map((msg, i) => (
                  <AgentCard
                    key={`${msg.agentId}-${i}`}
                    message={msg}
                    roundNumber={i + 1}
                    isLatest={i === agentMessages.length - 1}
                  />
                ))}
              </div>
            )}

            {/* Loading indicator for next agent */}
            {isRunning && agentMessages.length > 0 && (
              <div className="flex items-center gap-3 px-5 py-3 bg-white border border-ipl-border rounded-xl shadow-sm">
                <div className="flex gap-0.5">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-1 h-4 bg-ipl-navy/60 rounded-full animate-wave"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <span className="text-sm text-ipl-muted">Next agent deliberating...</span>
              </div>
            )}

            {/* Idle placeholder */}
            {status === 'idle' && (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-ipl-border bg-white rounded-2xl shadow-sm">
                <span className="text-5xl mb-4">🏟️</span>
                <p className="text-ipl-text text-sm font-medium">
                  Fill in the match state and click<br />
                  <span className="text-ipl-navy font-bold">&quot;Run Captain&apos;s Analysis&quot;</span> to start the debate
                </p>
                <p className="text-ipl-muted text-xs mt-2">or use the Demo Match button</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-ipl-border mt-16 py-8 relative z-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ipl-muted">
            🏆 Built for Google Gemini Agentic AI Hackathon
          </p>
          <div className="flex items-center gap-4 text-xs text-ipl-muted">
            <span>gemini-2.5-pro</span>
            <span>•</span>
            <span>gemini-2.5-flash</span>
            <span>•</span>
            <span>Google ADK</span>
            <span>•</span>
            <span>Firebase</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
