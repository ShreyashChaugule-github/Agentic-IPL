// ============================================================
// captain-cool/frontend/src/components/match/ScoreBoard.tsx
// Scoreboard component with light theme
// ============================================================

'use client';

import React from 'react';
import { MatchState } from '../../types';

interface ScoreBoardProps {
  matchState: MatchState;
  compact?: boolean;
}

export function ScoreBoard({ matchState, compact = false }: ScoreBoardProps) {
  const {
    battingTeam, runs, wickets, overs, totalOvers,
    target, requiredRunRate, currentRunRate, phase,
    batter1, batter2, currentBowler, venue,
  } = matchState;

  const ballsLeft = Math.max(0, Math.round(((totalOvers - Math.floor(overs)) * 6) - ((overs % 1) * 10)));
  const runsNeeded = target ? target - runs : null;

  const phaseColors: Record<string, string> = {
    powerplay: 'text-green-600',
    middle:    'text-blue-600',
    death:     'text-red-600',
    super_over: 'text-amber-600',
  };

  if (compact) {
    return (
      <div className="flex items-center gap-4 px-4 py-2 bg-white rounded-lg border border-ipl-border shadow-sm">
        <span className="font-mono font-bold text-xl text-ipl-navy">{runs}/{wickets}</span>
        <span className="text-ipl-muted text-sm">{overs}/{totalOvers} overs</span>
        {target && <span className="text-red-600 text-sm font-mono">Need {runsNeeded} off {ballsLeft}b</span>}
        <span className={`text-xs font-bold uppercase ${phaseColors[phase]}`}>{phase}</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-ipl-border rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-ipl-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-600 live-badge" />
          <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Live</span>
        </div>
        <span className="text-xs text-slate-500 truncate max-w-[140px]">{venue}</span>
        <span className={`text-xs font-bold uppercase tracking-wider ${phaseColors[phase]}`}>
          {phase.replace('_', ' ')} Phase
        </span>
      </div>

      {/* Main score */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-ipl-muted text-xs mb-1">{battingTeam}</p>
            <div className="flex items-baseline gap-2">
              <span className="scoreboard-digit text-4xl font-bold text-ipl-navy">
                {runs}/{wickets}
              </span>
              <span className="text-ipl-muted text-base scoreboard-digit">
                ({overs})
              </span>
            </div>
          </div>

          {target && (
            <div className="text-right">
              <p className="text-ipl-muted text-xs mb-1">Target</p>
              <p className="scoreboard-digit text-2xl font-bold text-ipl-text">{target}</p>
              <p className="text-red-600 text-xs font-mono font-bold mt-1">
                Need {runsNeeded} off {ballsLeft}b
              </p>
            </div>
          )}
        </div>

        {/* Run rates */}
        <div className="flex gap-6 mt-3">
          {currentRunRate !== undefined && (
            <div className="flex flex-col">
              <span className="text-xs text-ipl-muted">CRR</span>
              <span className="scoreboard-digit text-sm font-bold text-green-600">{currentRunRate.toFixed(1)}</span>
            </div>
          )}
          {requiredRunRate !== undefined && (
            <div className="flex flex-col">
              <span className="text-xs text-ipl-muted">RRR</span>
              <span className={`scoreboard-digit text-sm font-bold ${requiredRunRate > 12 ? 'text-red-600' : requiredRunRate > 9 ? 'text-amber-600' : 'text-green-600'}`}>
                {requiredRunRate.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Batters */}
      <div className="px-5 py-3 border-t border-ipl-border">
        <div className="space-y-1.5">
          {[batter1, batter2].map((batter, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-ipl-amber' : 'bg-ipl-border'}`} />
                <span className="text-sm text-ipl-text">{batter.name}</span>
                <span className="text-xs text-ipl-muted">({batter.handedness[0].toUpperCase()})</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-sm">
                <span className="text-ipl-text font-bold">{batter.runs}</span>
                <span className="text-ipl-muted">({batter.balls})</span>
                <span className={`text-xs ${batter.strikeRate > 150 ? 'text-green-600' : batter.strikeRate > 120 ? 'text-amber-600' : 'text-ipl-muted'}`}>
                  SR {batter.strikeRate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current bowler */}
      <div className="px-5 py-2.5 border-t border-ipl-border bg-slate-50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-ipl-muted text-xs">Bowling:</span>
            <span className="text-ipl-text">{currentBowler.name}</span>
            <span className="text-ipl-muted text-xs capitalize">({currentBowler.type})</span>
          </div>
          <div className="flex gap-3 font-mono text-xs">
            <span className="text-ipl-muted">{currentBowler.oversBowled}-{currentBowler.runsConceded}-{currentBowler.wickets}</span>
            <span className={currentBowler.economy > 10 ? 'text-red-600' : 'text-ipl-muted'}>
              Econ {currentBowler.economy}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
