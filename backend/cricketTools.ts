// ============================================================
// captain-cool/backend/src/tools/cricketTools.ts
// Tool implementations called when Gemini uses function calling
// ============================================================

import {
  WinProbabilityInput,
  WinProbabilityOutput,
  MatchupAnalysisInput,
  MatchupAnalysisOutput,
  VenueStatsInput,
  VenueStatsOutput,
  MatchPhase,
  PitchCondition,
  DewLevel,
} from '../types';

// ============================================================
// Win Probability Calculator (DLS-inspired T20 model)
// ============================================================
export function calculate_win_probability(
  input: WinProbabilityInput
): WinProbabilityOutput {
  const { runs, wickets, overs, target, totalOvers, venue, pitchCondition } =
    input;

  const ballsRemaining = (totalOvers - Math.floor(overs)) * 6 - (Math.round((overs % 1) * 10));
  const runsNeeded = target - runs;
  const wicketsRemaining = 10 - wickets;
  const requiredRunRate = ballsRemaining > 0 ? (runsNeeded / ballsRemaining) * 6 : Infinity;
  const currentRunRate = overs > 0 ? runs / overs : 0;

  // Resource table (simplified DLS)
  const resourceTable: Record<number, number[]> = {
    10: [100, 83.8, 49.5, 26.5, 7.6],
    9:  [95.0, 79.5, 46.8, 24.9, 7.1],
    8:  [89.3, 74.9, 43.8, 23.2, 6.6],
    7:  [83.8, 70.1, 40.7, 21.5, 6.0],
    6:  [77.1, 64.6, 37.4, 19.7, 5.5],
    5:  [68.7, 57.4, 33.1, 17.4, 4.9],
    4:  [57.4, 47.6, 27.5, 14.5, 4.0],
    3:  [43.9, 36.3, 21.0, 11.1, 3.1],
    2:  [29.8, 24.6, 14.3, 7.6,  2.1],
    1:  [14.3, 11.9, 6.9,  3.7,  1.0],
    0:  [0,    0,    0,    0,    0],
  };

  // Simple probability model based on RRR vs current resources
  let battingWinProb = 50;

  if (requiredRunRate <= 6) battingWinProb = 75;
  else if (requiredRunRate <= 8) battingWinProb = 60;
  else if (requiredRunRate <= 10) battingWinProb = 45;
  else if (requiredRunRate <= 12) battingWinProb = 30;
  else if (requiredRunRate <= 15) battingWinProb = 18;
  else battingWinProb = 8;

  // Wickets adjustment
  if (wickets >= 7) battingWinProb -= 20;
  else if (wickets >= 5) battingWinProb -= 10;
  else if (wickets <= 2) battingWinProb += 5;

  // Venue/pitch adjustment
  const venueBonus: Record<string, number> = {
    'Wankhede Stadium': 5,
    'Eden Gardens': 3,
    'Chinnaswamy Stadium': 8,
    'Chepauk': -5,
    'Feroz Shah Kotla': -3,
  };
  if (venue && venueBonus[venue]) battingWinProb += venueBonus[venue];

  if (pitchCondition === 'batting_friendly') battingWinProb += 5;
  if (pitchCondition === 'bowling_friendly') battingWinProb -= 5;
  if (pitchCondition === 'spin_friendly') battingWinProb -= 3;

  battingWinProb = Math.max(3, Math.min(97, battingWinProb));

  const projectedScore =
    Math.round(currentRunRate * totalOvers + (wicketsRemaining * 2));

  const keyFactors: string[] = [];
  if (requiredRunRate > 12) keyFactors.push('Very high required run rate');
  if (wickets >= 6) keyFactors.push('Low wickets in hand');
  if (ballsRemaining <= 30) keyFactors.push('Under 5 overs remaining — death phase');
  if (pitchCondition === 'bowling_friendly') keyFactors.push('Pitch assisting bowlers');
  if (requiredRunRate <= currentRunRate) keyFactors.push('Batting team ahead of rate');

  return {
    battingTeamWinProbability: Math.round(battingWinProb),
    bowlingTeamWinProbability: Math.round(100 - battingWinProb),
    requiredRunRate: Math.round(requiredRunRate * 100) / 100,
    projectedScore,
    keyFactors,
  };
}

// ============================================================
// Batter vs Bowler Matchup (IPL historical simulation)
// ============================================================
export function analyze_batter_bowler_matchup(
  input: MatchupAnalysisInput
): MatchupAnalysisOutput {
  const { batterName, bowlerName, phase, venue } = input;

  // Simulate realistic matchup data based on player types
  // In production, this connects to Cricbuzz/Cricsheet APIs
  const seed = (batterName + bowlerName).length;
  const baseStrikeRate = 110 + (seed % 60);
  const dismissalProb = 8 + (seed % 15);

  const weaknesses: string[] = [];
  const preferredShots: string[] = [];

  // Phase-based adjustments
  if (phase === 'death') {
    preferredShots.push('Slog sweep', 'Ramp shot', 'Helicopter shot');
    weaknesses.push('Yorkers on middle stump', 'Slow bouncers');
  } else if (phase === 'powerplay') {
    preferredShots.push('Cover drive', 'Pull shot', 'Flick off pads');
    weaknesses.push('Inswing deliveries', 'Leg cutters');
  } else {
    preferredShots.push('Sweep', 'Reverse sweep', 'Slog over mid-on');
    weaknesses.push('Googly', 'Change of pace');
  }

  // Bowler type detection (simplified)
  const bowlerLower = bowlerName.toLowerCase();
  let recommendation = '';

  if (bowlerLower.includes('chahal') || bowlerLower.includes('spin')) {
    weaknesses.push('Leg spin on dry surface');
    recommendation = `High-risk matchup. Batter has historically struggled against wrist spin in the ${phase || 'middle'} overs.`;
  } else if (bowlerLower.includes('bumrah') || bowlerLower.includes('fast')) {
    weaknesses.push('Toe-crushing yorkers', 'Slowing ball off length');
    recommendation = `Elite pace matchup. Expect low scoring with high dot ball percentage.`;
  } else {
    recommendation = `Moderate matchup. Stats suggest ${baseStrikeRate > 130 ? 'batter has upper hand' : 'bowler has slight edge'}.`;
  }

  return {
    batterStrikeRate: baseStrikeRate,
    dismissalProbability: dismissalProb,
    preferredShots,
    weaknesses,
    historicalDots: Math.round(30 + (seed % 20)),
    recommendation,
  };
}

// ============================================================
// Venue Statistics
// ============================================================
export function get_venue_statistics(
  input: VenueStatsInput
): VenueStatsOutput {
  const venueData: Record<string, VenueStatsOutput> = {
    'Wankhede Stadium': {
      averageFirstInningsScore: 178,
      averageSecondInningsScore: 162,
      highestScore: 235,
      winningPercentageBattingFirst: 52,
      typicalPaceVsSpinSplit: '65% pace, 35% spin',
      pitchCharacteristics: [
        'True bounce', 'Short square boundaries', 'Pace-friendly initially', 'Dew factor significant after over 12'
      ],
    },
    'Chepauk': {
      averageFirstInningsScore: 158,
      averageSecondInningsScore: 142,
      highestScore: 208,
      winningPercentageBattingFirst: 44,
      typicalPaceVsSpinSplit: '40% pace, 60% spin',
      pitchCharacteristics: [
        'Spin-friendly', 'Slow outfield', 'Low bounce', 'Spinners dominant from over 8'
      ],
    },
    'Eden Gardens': {
      averageFirstInningsScore: 172,
      averageSecondInningsScore: 157,
      highestScore: 222,
      winningPercentageBattingFirst: 48,
      typicalPaceVsSpinSplit: '55% pace, 45% spin',
      pitchCharacteristics: [
        'Good batting surface', 'Humid conditions assist swing', 'Evening dew impacts spinners'
      ],
    },
    'Chinnaswamy Stadium': {
      averageFirstInningsScore: 186,
      averageSecondInningsScore: 168,
      highestScore: 263,
      winningPercentageBattingFirst: 55,
      typicalPaceVsSpinSplit: '50% pace, 50% spin',
      pitchCharacteristics: [
        'High altitude — balls carry further', 'Small boundaries', 'Bat-friendly surface', 'High scoring venue'
      ],
    },
  };

  return venueData[input.venue] || {
    averageFirstInningsScore: 165,
    averageSecondInningsScore: 150,
    highestScore: 210,
    winningPercentageBattingFirst: 50,
    typicalPaceVsSpinSplit: '55% pace, 45% spin',
    pitchCharacteristics: [
      'Neutral surface', 'Standard boundaries', 'Mixed conditions'
    ],
  };
}

// ============================================================
// Phase Bowling Stats
// ============================================================
export function get_phase_bowling_stats(input: {
  phase: string;
  pitchCondition?: string;
  dewFactor?: string;
  venue?: string;
}) {
  const { phase, pitchCondition, dewFactor } = input;

  interface PhaseEntry {
    recommendedBowlerTypes: string[];
    averageEconomy: number;
    wicketProbabilityPerBall: number;
    dotBallPercentage: number;
    keyTactics: string[];
    warnings: string[];
  }

  const phaseData: Record<string, PhaseEntry> = {
    powerplay: {
      recommendedBowlerTypes: ['fast', 'medium-fast', 'left-arm-fast'],
      averageEconomy: 7.8,
      wicketProbabilityPerBall: 0.048,
      dotBallPercentage: 38,
      keyTactics: [
        'Use swing early with new ball',
        'Attack off stump channel',
        'Avoid leg spin in first 3 overs',
        'Set attacking field — slip cordon',
      ],
      warnings: ['Batters take more risks in powerplay', 'Short balls are expensive'],
    },
    middle: {
      recommendedBowlerTypes: ['off-spin', 'leg-spin', 'left-arm-spin', 'medium'],
      averageEconomy: 7.2,
      wicketProbabilityPerBall: 0.041,
      dotBallPercentage: 42,
      keyTactics: [
        'Introduce spinners from over 7',
        'Use change of pace',
        'Build pressure with dot balls',
        'Target the weaker batter',
      ],
      warnings: dewFactor === 'heavy' ? ['Dew will reduce spin grip — consider using seamers'] : [],
    },
    death: {
      recommendedBowlerTypes: ['fast', 'left-arm-fast'],
      averageEconomy: 10.5,
      wicketProbabilityPerBall: 0.055,
      dotBallPercentage: 28,
      keyTactics: [
        'Yorkers as primary weapon',
        'Slow bouncers as variations',
        'Wide yorkers to right-handers',
        'Pace changes every 2 balls',
      ],
      warnings: ['Avoid full tosses', 'Short mid-wicket boundary — protect it'],
    },
  };

  const result = phaseData[phase] || phaseData['middle'];

  // Pitch adjustments
  if (pitchCondition === 'spin_friendly' && phase === 'middle') {
    result.recommendedBowlerTypes.unshift('leg-spin', 'off-spin');
    result.keyTactics.push('Pitch is assisting turn — attack with both spinners simultaneously');
  }

  return result;
}

// ============================================================
// Tool dispatcher — routes Gemini function calls to handlers
// ============================================================
export function dispatchToolCall(
  toolName: string,
  args: Record<string, unknown>
): unknown {
  switch (toolName) {
    case 'calculate_win_probability':
      return calculate_win_probability(args as WinProbabilityInput);
    case 'analyze_batter_bowler_matchup':
      return analyze_batter_bowler_matchup(args as MatchupAnalysisInput);
    case 'get_venue_statistics':
      return get_venue_statistics(args as VenueStatsInput);
    case 'get_phase_bowling_stats':
      return get_phase_bowling_stats(args as { phase: string; pitchCondition?: string; dewFactor?: string; venue?: string });
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
