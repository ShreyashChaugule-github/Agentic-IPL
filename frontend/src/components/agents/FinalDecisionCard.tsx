// ============================================================
// captain-cool/frontend/src/components/agents/FinalDecisionCard.tsx
// Final decision card component with light theme
// ============================================================

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FinalDecision } from '../../types';

interface FinalDecisionCardProps {
  decision: FinalDecision;
}

export function FinalDecisionCard({ decision }: FinalDecisionCardProps) {
  const { recommendation, commentary, overallConfidence, winProbabilityShift, agentVotes, debateSummary } = decision;
  const [showVotes, setShowVotes] = useState(true);

  const confidenceColor =
    overallConfidence >= 75 ? 'text-green-600' :
    overallConfidence >= 50 ? 'text-amber-600' : 'text-red-600';

  const shiftColor = (winProbabilityShift ?? 0) >= 0 ? 'text-green-600' : 'text-red-600';

  const speak = (text: string) => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const hasSpokenRef = useRef(false);

  useEffect(() => {
    if (!hasSpokenRef.current) {
      const textToSpeak = `Captain's Decision: ${recommendation.primaryAction}. ${commentary}`;
      speak(textToSpeak);
      hasSpokenRef.current = true;
    }
  }, [recommendation.primaryAction, commentary]);

  return (
    <div className="bg-white border-2 border-ipl-gold/30 rounded-2xl overflow-hidden animate-fade-up shadow-lg shadow-ipl-gold/5">
      {/* ── Header ── */}
      <div className="px-6 py-4 bg-ipl-gold/5 border-b border-ipl-gold/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-ipl-gold/10 border border-ipl-gold/30 flex items-center justify-center text-xl">
            🏆
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-amber-600">Captain&apos;s Call</h2>
            <p className="text-xs text-ipl-muted">Final tactical decision from all 4 agents</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-mono font-bold ${confidenceColor}`}>{overallConfidence}%</p>
          <p className="text-xs text-ipl-muted">confidence</p>
        </div>
      </div>

      {/* ── Primary Action ── */}
      <div className="px-6 py-5 border-b border-ipl-border">
        <div className="flex items-start justify-between gap-4">
          <p className="text-ipl-text font-bold text-lg leading-tight flex-1">
            {recommendation.primaryAction}
          </p>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <RiskPill risk={recommendation.riskLevel} />
            {winProbabilityShift !== undefined && (
              <span className={`text-sm font-mono font-bold ${shiftColor}`}>
                {winProbabilityShift >= 0 ? '+' : ''}{winProbabilityShift}% win prob
              </span>
            )}
          </div>
        </div>

        {recommendation.counterfactual && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-100">
            <p className="text-xs text-ipl-muted uppercase tracking-wider mb-1">If not done:</p>
            <p className="text-sm text-red-600 italic">{recommendation.counterfactual}</p>
          </div>
        )}
      </div>

      {/* ── Win Probability Visual ── */}
      <div className="px-6 py-4 border-b border-ipl-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-ipl-muted">Bowling Team Win%</span>
          <span className="text-xs text-ipl-muted">Batting Team Win%</span>
        </div>
        <div className="win-bar">
          <div
            className="win-bar-fill bg-gradient-to-r from-red-500 to-green-500"
            style={{ width: `${100 - (winProbabilityShift ?? 0) * 2}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-mono text-red-600">
            {Math.max(3, 50 - (winProbabilityShift ?? 0))}%
          </span>
          <span className="text-xs font-mono text-green-600">
            {Math.min(97, 50 + (winProbabilityShift ?? 0))}%
          </span>
        </div>
      </div>

      {/* ── Commentary ── */}
      <div className="px-6 py-5 border-b border-ipl-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span>🎙️</span>
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              Match Commentary
            </span>
          </div>
          <button
            onClick={() => speak(commentary)}
            className="text-xs text-ipl-navy border border-ipl-border px-2 py-0.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1 font-medium"
          >
            <span>🔊</span> Listen
          </button>
        </div>
        <div className="agent-prose whitespace-pre-wrap text-ipl-text">
          {commentary}
        </div>
      </div>

      {/* ── Agent Votes ── */}
      <div className="px-6 py-4">
        <button
          onClick={() => setShowVotes(!showVotes)}
          className="flex items-center gap-2 text-xs text-ipl-muted uppercase tracking-wider mb-3 w-full hover:text-ipl-text transition-colors font-medium"
        >
          <span>Agent Positions</span>
          <span className="ml-auto">{showVotes ? '▲' : '▼'}</span>
        </button>

        {showVotes && (
          <>
            <div className="grid grid-cols-1 gap-2 mb-3">
              {Object.entries(agentVotes).map(([agentId, vote]) => {
                const icons: Record<string, string> = {
                  strategist: '🧢', stats_analyst: '📊',
                  devils_advocate: '⚡', commentator: '🎙️',
                };
                const names: Record<string, string> = {
                  strategist: 'Strategist', stats_analyst: 'Stats Analyst',
                  devils_advocate: "Devil's Advocate", commentator: 'Commentator',
                };
                const colors: Record<string, string> = {
                  strategist: 'text-green-600', stats_analyst: 'text-blue-600',
                  devils_advocate: 'text-red-600', commentator: 'text-amber-600',
                };
                return (
                  <div key={agentId} className="flex items-start gap-2 text-xs bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                    <span className="shrink-0">{icons[agentId]}</span>
                    <span className={`font-semibold w-28 shrink-0 ${colors[agentId]}`}>{names[agentId]}</span>
                    <span className="text-ipl-text">{vote.slice(0, 140)}{vote.length > 140 ? '...' : ''}</span>
                  </div>
                );
              })}
            </div>

            {debateSummary && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-xs text-ipl-muted uppercase tracking-wider mb-1">Debate Summary</p>
                <p className="text-xs text-ipl-muted italic">{debateSummary}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function RiskPill({ risk }: { risk: 'low' | 'medium' | 'high' }) {
  const styles = {
    low:    'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    high:   'bg-red-50 text-red-700 border-red-200',
  };
  const icons = { low: '🟢', medium: '🟡', high: '🔴' };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${styles[risk]}`}>
      {icons[risk]} {risk.toUpperCase()} RISK
    </span>
  );
}
