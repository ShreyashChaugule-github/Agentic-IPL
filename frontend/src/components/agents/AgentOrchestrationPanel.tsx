// ============================================================
// captain-cool/frontend/src/components/agents/AgentOrchestrationPanel.tsx
// Agent orchestration panel component with light theme
// ============================================================

'use client';

import React from 'react';
import { AgentRole } from '../../types';
import { AgentActivity } from '../../hooks/useDebate';
import { AGENT_CONFIG } from '../../lib/api';

interface AgentOrchestrationPanelProps {
  agentActivity: Record<AgentRole, AgentActivity>;
  currentRound: number;
  isRunning: boolean;
}

const AGENTS: AgentRole[] = ['strategist', 'stats_analyst', 'devils_advocate', 'commentator'];

const DEBATE_STEPS = [
  { round: 1, agent: 'strategist',      label: 'Initial Proposal',      icon: '💡' },
  { round: 2, agent: 'stats_analyst',   label: 'Data Validation',        icon: '📊' },
  { round: 3, agent: 'strategist',      label: 'Revised Call',           icon: '🔄' },
  { round: 4, agent: 'devils_advocate', label: 'Challenge',              icon: '⚡' },
  { round: 5, agent: 'strategist',      label: 'Defense / Revision',     icon: '🛡️' },
  { round: 6, agent: 'commentator',     label: 'Final Commentary',       icon: '🎙️' },
] as const;

export function AgentOrchestrationPanel({
  agentActivity,
  currentRound,
  isRunning,
}: AgentOrchestrationPanelProps) {
  return (
    <div className="bg-white border border-ipl-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-amber-500">⚙️</span>
        <h3 className="font-display text-sm font-bold text-ipl-text uppercase tracking-wider">
          ADK Debate Pipeline
        </h3>
        {isRunning && (
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-600 font-bold">Running</span>
          </div>
        )}
      </div>

      {/* Debate steps */}
      <div className="space-y-1.5 mb-6">
        {DEBATE_STEPS.map((step, i) => {
          const config = AGENT_CONFIG[step.agent as AgentRole];
          const isActive = currentRound === i;
          const isDone = currentRound > i;

          return (
            <div
              key={i}
              className={`flex items-center gap-3 p-2.5 rounded-lg transition-all duration-300 ${
                isActive  ? 'bg-slate-50 border border-slate-200' :
                isDone    ? 'opacity-60' :
                'opacity-30'
              }`}
            >
              {/* Step circle */}
              <div className={`
                w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                ${isDone    ? 'bg-green-100 text-green-700' :
                  isActive  ? 'bg-amber-500 text-white animate-pulse' :
                  'bg-slate-100 text-slate-500'}
              `}>
                {isDone ? '✓' : step.round}
              </div>

              {/* Step info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{step.icon}</span>
                  <span className="text-xs font-semibold text-ipl-text truncate">{step.label}</span>
                </div>
                <span className="text-xs text-ipl-muted">{config.name}</span>
              </div>

              {/* Status */}
              {isActive && isRunning && (
                <div className="flex gap-0.5 shrink-0">
                  {[0, 1, 2].map(j => (
                    <div
                      key={j}
                      className="w-1 h-4 bg-amber-500 rounded-full animate-wave"
                      style={{ animationDelay: `${j * 0.2}s` }}
                    />
                  ))}
                </div>
              )}
              {isDone && (
                <span className="text-green-600 text-xs shrink-0">✓</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Agent roster */}
      <div className="border-t border-ipl-border pt-4">
        <p className="text-xs text-ipl-muted uppercase tracking-wider mb-3">Agents</p>
        <div className="grid grid-cols-2 gap-2">
          {AGENTS.map(agentId => {
            const config = AGENT_CONFIG[agentId];
            const activity = agentActivity[agentId];

            return (
              <div
                key={agentId}
                className={`p-2.5 rounded-lg border transition-all ${
                  activity.status === 'thinking' ? 'bg-amber-50 border-amber-200' :
                  activity.status === 'complete' ? 'bg-green-50 border-green-200' :
                  'bg-transparent border-slate-100 opacity-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{config.icon}</span>
                  <span className="text-xs font-semibold text-ipl-text truncate">{config.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ipl-muted font-mono">
                    {config.model.split('-').slice(-2).join('-')}
                  </span>
                  <StatusDot status={activity.status} />
                </div>
                {activity.status === 'thinking' && activity.currentMessage && (
                  <p className="text-xs text-ipl-muted mt-1 italic truncate">
                    {activity.currentMessage}
                  </p>
                )}
                {activity.toolCalls.length > 0 && (
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    🔧 {activity.toolCalls.length} tool{activity.toolCalls.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: 'idle' | 'thinking' | 'complete' }) {
  if (status === 'thinking') return <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />;
  if (status === 'complete') return <div className="w-2 h-2 rounded-full bg-green-500" />;
  return <div className="w-2 h-2 rounded-full bg-slate-300" />;
}
