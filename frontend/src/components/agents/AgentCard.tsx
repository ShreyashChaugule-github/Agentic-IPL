// ============================================================
// captain-cool/frontend/src/components/agents/AgentCard.tsx
// Agent card component with light theme
// ============================================================

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AgentMessage, AgentRole, ToolCallRecord } from '../../types';
import { AGENT_CONFIG } from '../../lib/api';

interface AgentCardProps {
  message: AgentMessage;
  roundNumber?: number;
  isLatest?: boolean;
}

const agentBorderMap: Record<AgentRole, string> = {
  strategist:      'border-green-200 shadow-green-100/50',
  stats_analyst:   'border-blue-200 shadow-blue-100/50',
  devils_advocate: 'border-red-200 shadow-red-100/50',
  commentator:     'border-amber-200 shadow-amber-100/50',
};

const agentBadgeMap: Record<AgentRole, string> = {
  strategist:      'bg-green-50 text-green-700 border-green-200',
  stats_analyst:   'bg-blue-50 text-blue-700 border-blue-200',
  devils_advocate: 'bg-red-50 text-red-700 border-red-200',
  commentator:     'bg-amber-50 text-amber-700 border-amber-200',
};

const agentDotMap: Record<AgentRole, string> = {
  strategist:      'bg-green-500',
  stats_analyst:   'bg-blue-500',
  devils_advocate: 'bg-red-500',
  commentator:     'bg-amber-500',
};

const ROUND_LABELS: Record<number, string> = {
  1: 'Initial Proposal',
  2: 'Data Analysis',
  3: 'Revised Proposal',
  4: 'Challenge',
  5: 'Final Defense',
  6: 'Commentary',
};

export function AgentCard({ message, roundNumber, isLatest }: AgentCardProps) {
  const [expanded, setExpanded] = useState(isLatest ?? true);
  const [showTools, setShowTools] = useState(false);

  const speak = (text: string) => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const hasSpokenRef = useRef(false);

  useEffect(() => {
    if (message.agentId === 'commentator' && isLatest && !hasSpokenRef.current) {
      speak(message.content);
      hasSpokenRef.current = true;
    }
  }, [message.content, message.agentId, isLatest]);

  const config = AGENT_CONFIG[message.agentId];
  const borderClass = agentBorderMap[message.agentId];
  const badgeClass = agentBadgeMap[message.agentId];
  const dotClass = agentDotMap[message.agentId];
  const toolCalls = message.toolCalls || [];

  return (
    <div className={`
      debate-connector relative bg-white border rounded-xl overflow-hidden
      transition-all duration-300 animate-agent-enter shadow-sm
      ${borderClass} ${isLatest ? 'opacity-100' : 'opacity-90'}
    `}>
      {/* Agent Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg border ${badgeClass}`}>
            {config.icon}
          </div>

          <div className="text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-ipl-text text-sm">{config.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${badgeClass}`}>
                {config.role}
              </span>
              {roundNumber && (
                <span className="text-xs text-ipl-muted">
                  {ROUND_LABELS[roundNumber] || `Round ${roundNumber}`}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-ipl-muted font-mono">{config.model}</span>
              {toolCalls.length > 0 && (
                <span className="text-xs text-blue-600 font-medium">
                  • {toolCalls.length} tool call{toolCalls.length > 1 ? 's' : ''}
                </span>
              )}
              {message.confidence !== undefined && (
                <span className="text-xs text-ipl-muted">
                  • Confidence: <span className="text-ipl-text font-bold">{message.confidence}%</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className={`w-2 h-2 rounded-full ${dotClass}`} />
          <svg
            className={`w-4 h-4 text-ipl-muted transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Content */}
      {expanded && (
        <div className="px-5 pb-5">
          <div className="border-t border-ipl-border pt-4">
            {message.agentId === 'commentator' && (
              <div className="flex justify-end mb-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(message.content);
                  }}
                  className="text-xs text-ipl-navy border border-ipl-border px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1 font-medium"
                >
                  <span>🔊</span> Listen
                </button>
              </div>
            )}
            {/* Recommendation highlight */}
            {message.recommendation && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-100">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <p className="text-green-700 font-semibold text-sm">
                    🎯 {message.recommendation.primaryAction}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <RiskBadge risk={message.recommendation.riskLevel} />
                    <ConfidenceBar score={message.recommendation.confidenceScore} />
                  </div>
                </div>
                {message.recommendation.counterfactual && (
                  <p className="text-ipl-muted text-xs mt-2 italic">
                    If not: {message.recommendation.counterfactual}
                  </p>
                )}
              </div>
            )}

            {/* Main content */}
            <div className={`agent-prose whitespace-pre-wrap text-ipl-text ${message.agentId === 'stats_analyst' ? 'max-h-48 overflow-y-auto pr-2' : ''}`}>
              {message.content}
            </div>

            {/* Tool calls toggle */}
            {toolCalls.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowTools(!showTools)}
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 transition-colors font-medium"
                >
                  <span>🔧</span>
                  <span>{showTools ? 'Hide' : 'Show'} tool calls ({toolCalls.length})</span>
                </button>

                {showTools && (
                  <div className="mt-3 space-y-2">
                    {toolCalls.map((tc, i) => (
                      <ToolCallCard key={i} toolCall={tc} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────

function RiskBadge({ risk }: { risk: 'low' | 'medium' | 'high' }) {
  const styles = {
    low:    'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    high:   'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${styles[risk]} capitalize`}>
      {risk} risk
    </span>
  );
}

function ConfidenceBar({ score }: { score: number }) {
  const color = score >= 75 ? '#16A34A' : score >= 50 ? '#D97706' : '#DC2626';
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-ipl-muted font-mono">{score}%</span>
    </div>
  );
}

function ToolCallCard({ toolCall }: { toolCall: ToolCallRecord }) {
  const [open, setOpen] = useState(false);

  const toolLabels: Record<string, string> = {
    calculate_win_probability:    '📈 Win Probability',
    analyze_batter_bowler_matchup: '⚔️ Matchup Analysis',
    get_venue_statistics:         '🏟️ Venue Stats',
    get_phase_bowling_stats:      '🎯 Phase Bowling',
  };

  return (
    <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs text-blue-600 hover:bg-slate-100 transition-colors font-medium"
      >
        <span>{toolLabels[toolCall.toolName] || toolCall.toolName}</span>
        <span className="text-ipl-muted">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          <div>
            <p className="text-xs text-ipl-muted mb-1">Input:</p>
            <pre className="text-xs text-slate-700 font-mono bg-white p-2 rounded border border-slate-100 overflow-auto max-h-32">
              {JSON.stringify(toolCall.input, null, 2)}
            </pre>
          </div>
          <div>
            <p className="text-xs text-ipl-muted mb-1">Output:</p>
            <pre className="text-xs text-slate-700 font-mono bg-white p-2 rounded border border-slate-100 overflow-auto max-h-40">
              {JSON.stringify(toolCall.output, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
