// ============================================================
// captain-cool/frontend/src/components/match/MatchInputForm.tsx
// Match input form component with multi-step wizard (Light Theme)
// ============================================================

'use client';

import React, { useState } from 'react';
import { MatchState, BowlerState } from '../../types';

interface MatchInputFormProps {
  onSubmit: (matchState: MatchState) => void;
  onLoadDemo: () => void;
  isLoading?: boolean;
}

const IPL_TEAMS = [
  'Mumbai Indians', 'Chennai Super Kings', 'Royal Challengers Bangalore',
  'Kolkata Knight Riders', 'Delhi Capitals', 'Rajasthan Royals',
  'Sunrisers Hyderabad', 'Punjab Kings', 'Gujarat Titans', 'Lucknow Super Giants',
];

const IPL_VENUES = [
  'Wankhede Stadium', 'Chepauk', 'Eden Gardens', 'Chinnaswamy Stadium',
  'Narendra Modi Stadium', 'Feroz Shah Kotla', 'Sawai Mansingh Stadium',
  'Rajiv Gandhi International Stadium', 'Punjab Cricket Association Stadium',
];

const BOWLER_TYPES = [
  'fast', 'medium-fast', 'medium', 'off-spin', 'leg-spin', 'left-arm-spin', 'left-arm-fast',
] as const;

export function MatchInputForm({ onSubmit, onLoadDemo, isLoading }: MatchInputFormProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    team1: 'Mumbai Indians',
    team2: 'Chennai Super Kings',
    venue: 'Wankhede Stadium',
    battingTeam: 'Chennai Super Kings',
    currentInnings: '2',
    runs: '142',
    wickets: '4',
    overs: '16.3',
    totalOvers: '20',
    target: '185',
    batter1Name: 'MS Dhoni',
    batter1Runs: '22',
    batter1Balls: '14',
    batter1SR: '157',
    batter1Hand: 'right',
    batter2Name: 'Ravindra Jadeja',
    batter2Runs: '18',
    batter2Balls: '12',
    batter2SR: '150',
    batter2Hand: 'left',
    bowlerName: 'Jasprit Bumrah',
    bowlerType: 'fast',
    bowlerOvers: '3',
    bowlerRuns: '28',
    bowlerWickets: '2',
    bowlerEconomy: '9.3',
    bowlerOversLeft: '1',
    bowler2Name: 'Hardik Pandya',
    bowler2Type: 'medium-fast',
    bowler2Overs: '2',
    bowler2Runs: '24',
    bowler2Wickets: '0',
    bowler2Economy: '12.0',
    bowler2OversLeft: '2',
    pitchConditions: 'batting_friendly',
    dewFactor: 'heavy',
    boundarySize: 'short',
    phase: 'death',
    impactPlayerAvailable: 'Mitchell Santner',
    timeoutUsed: 'true',
    powerplayActive: 'false',
    impactPlayerUsed: 'false',
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = () => {
    const bowlingTeam = form.battingTeam === form.team1 ? form.team2 : form.team1;

    const bowler1: BowlerState = {
      name: form.bowlerName,
      oversBowled: parseFloat(form.bowlerOvers),
      runsConceded: parseInt(form.bowlerRuns),
      wickets: parseInt(form.bowlerWickets),
      economy: parseFloat(form.bowlerEconomy),
      type: form.bowlerType as BowlerState['type'],
      oversRemaining: parseInt(form.bowlerOversLeft),
    };

    const bowler2: BowlerState = {
      name: form.bowler2Name,
      oversBowled: parseFloat(form.bowler2Overs),
      runsConceded: parseInt(form.bowler2Runs),
      wickets: parseInt(form.bowler2Wickets),
      economy: parseFloat(form.bowler2Economy),
      type: form.bowler2Type as BowlerState['type'],
      oversRemaining: parseInt(form.bowler2OversLeft),
    };

    const oversFloat = parseFloat(form.overs);
    const runsInt = parseInt(form.runs);
    const targetInt = form.target ? parseInt(form.target) : undefined;
    const oversRemaining = (parseInt(form.totalOvers) - Math.floor(oversFloat));
    const rrr = targetInt
      ? parseFloat(((targetInt - runsInt) / (oversRemaining || 1)).toFixed(1))
      : undefined;

    const state: MatchState = {
      team1: form.team1,
      team2: form.team2,
      venue: form.venue,
      battingTeam: form.battingTeam,
      bowlingTeam,
      currentInnings: parseInt(form.currentInnings) as 1 | 2,
      runs: runsInt,
      wickets: parseInt(form.wickets),
      overs: oversFloat,
      totalOvers: parseInt(form.totalOvers),
      target: targetInt,
      requiredRunRate: rrr,
      currentRunRate: parseFloat((runsInt / (oversFloat || 1)).toFixed(1)),
      batter1: {
        name: form.batter1Name,
        runs: parseInt(form.batter1Runs),
        balls: parseInt(form.batter1Balls),
        strikeRate: parseFloat(form.batter1SR),
        fours: 0, sixes: 0,
        handedness: form.batter1Hand as 'right' | 'left',
      },
      batter2: {
        name: form.batter2Name,
        runs: parseInt(form.batter2Runs),
        balls: parseInt(form.batter2Balls),
        strikeRate: parseFloat(form.batter2SR),
        fours: 0, sixes: 0,
        handedness: form.batter2Hand as 'right' | 'left',
      },
      currentBowler: bowler1,
      availableBowlers: [bowler1, bowler2],
      pitchConditions: form.pitchConditions as MatchState['pitchConditions'],
      dewFactor: form.dewFactor as MatchState['dewFactor'],
      boundarySize: form.boundarySize as 'short' | 'medium' | 'large',
      phase: form.phase as MatchState['phase'],
      impactPlayerAvailable: form.impactPlayerAvailable || undefined,
      impactPlayerUsed: form.impactPlayerUsed === 'true',
      powerplayActive: form.powerplayActive === 'true',
      timeoutUsed: form.timeoutUsed === 'true',
      recentOvers: [],
    };
    onSubmit(state);
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs text-ipl-muted mb-1">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="bg-white border border-ipl-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-xl font-bold text-ipl-text">Match State</h2>
          <p className="text-xs text-ipl-muted">Step {step} of 4</p>
        </div>
        {step === 1 && (
          <button
            onClick={onLoadDemo}
            disabled={isLoading}
            className="text-xs text-amber-600 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors disabled:opacity-50 font-medium"
          >
            Load Demo ⚡
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-100 rounded-full mb-6 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-ipl-navy transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* Step 1: Match Context */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Team 1">
              <select className="cricket-select" value={form.team1} onChange={set('team1')}>
                {IPL_TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Team 2">
              <select className="cricket-select" value={form.team2} onChange={set('team2')}>
                {IPL_TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Batting Team">
            <select className="cricket-select" value={form.battingTeam} onChange={set('battingTeam')}>
              <option value={form.team1}>{form.team1}</option>
              <option value={form.team2}>{form.team2}</option>
            </select>
          </Field>
          <Field label="Venue">
            <select className="cricket-select" value={form.venue} onChange={set('venue')}>
              {IPL_VENUES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Innings">
            <select className="cricket-select" value={form.currentInnings} onChange={set('currentInnings')}>
              <option value="1">1st Innings</option>
              <option value="2">2nd Innings (Chase)</option>
            </select>
          </Field>
        </div>
      )}

      {/* Step 2: Live Score */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Runs">
              <input type="number" className="cricket-input" value={form.runs} onChange={set('runs')} />
            </Field>
            <Field label="Wickets (0–10)">
              <input type="number" className="cricket-input" value={form.wickets} onChange={set('wickets')} min="0" max="10" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Overs (e.g. 16.3)">
              <input type="number" step="0.1" className="cricket-input" value={form.overs} onChange={set('overs')} />
            </Field>
            <Field label="Target (2nd innings)">
              <input type="number" className="cricket-input" value={form.target} onChange={set('target')} placeholder="0 if 1st innings" />
            </Field>
          </div>
          <Field label="Phase">
            <select className="cricket-select" value={form.phase} onChange={set('phase')}>
              <option value="powerplay">Powerplay (1–6)</option>
              <option value="middle">Middle (7–15)</option>
              <option value="death">Death (16–20)</option>
              <option value="super_over">Super Over</option>
            </select>
          </Field>
        </div>
      )}

      {/* Step 3: Players */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="border-b border-ipl-border pb-3">
            <p className="text-xs font-bold text-amber-600 mb-2">BATTERS</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Batter 1 Name">
                <input className="cricket-input" value={form.batter1Name} onChange={set('batter1Name')} />
              </Field>
              <Field label="Hand">
                <select className="cricket-select" value={form.batter1Hand} onChange={set('batter1Hand')}>
                  <option value="right">Right</option>
                  <option value="left">Left</option>
                </select>
              </Field>
            </div>
          </div>
          <div className="border-b border-ipl-border pb-3">
            <p className="text-xs font-bold text-amber-600 mb-2">CURRENT BOWLER</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Bowler Name">
                <input className="cricket-input" value={form.bowlerName} onChange={set('bowlerName')} />
              </Field>
              <Field label="Type">
                <select className="cricket-select" value={form.bowlerType} onChange={set('bowlerType')}>
                  {BOWLER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-amber-600 mb-2">NEXT BOWLER (Option)</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Bowler 2 Name">
                <input className="cricket-input" value={form.bowler2Name} onChange={set('bowler2Name')} />
              </Field>
              <Field label="Type">
                <select className="cricket-select" value={form.bowler2Type} onChange={set('bowler2Type')}>
                  {BOWLER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Conditions & Strategy */}
      {step === 4 && (
        <div className="space-y-4">
          <Field label="Pitch Conditions">
            <select className="cricket-select" value={form.pitchConditions} onChange={set('pitchConditions')}>
              {['batting_friendly', 'bowling_friendly', 'spin_friendly', 'seam_friendly', 'damp', 'dry', 'neutral'].map(c => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Dew Factor">
              <select className="cricket-select" value={form.dewFactor} onChange={set('dewFactor')}>
                <option value="none">None</option>
                <option value="light">Light</option>
                <option value="heavy">Heavy</option>
              </select>
            </Field>
            <Field label="Boundary Size">
              <select className="cricket-select" value={form.boundarySize} onChange={set('boundarySize')}>
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Timeout Used?">
              <select className="cricket-select" value={form.timeoutUsed} onChange={set('timeoutUsed')}>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </Field>
            <Field label="Powerplay?">
              <select className="cricket-select" value={form.powerplayActive} onChange={set('powerplayActive')}>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </Field>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-6">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 py-3 border border-ipl-border rounded-xl text-ipl-text hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            Back
          </button>
        )}
        
        {step < 4 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-ipl-navy text-white rounded-xl hover:opacity-90 transition-opacity font-medium text-sm shadow-lg shadow-blue-600/20"
          >
            Next Step
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`
              flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200
              ${isLoading
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-ipl-navy hover:opacity-90 text-white shadow-lg shadow-blue-600/20 active:scale-[0.98]'
              }
            `}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⚙️</span> Deliberating...
              </span>
            ) : (
              '🏏 Run Analysis'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
