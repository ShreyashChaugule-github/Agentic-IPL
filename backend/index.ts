// ============================================================
// captain-cool/backend/src/types/index.ts
// Core domain types for the Captain Cool multi-agent system
// ============================================================

export interface MatchState {
  // Match identification
  matchId?: string;
  team1: string;
  team2: string;
  venue: string;

  // Current innings state
  battingTeam: string;
  bowlingTeam: string;
  currentInnings: 1 | 2;

  // Score state
  runs: number;
  wickets: number;
  overs: number;        // e.g. 14.3 = 14 overs 3 balls
  totalOvers: number;   // typically 20

  // Second innings chase context
  target?: number;
  requiredRunRate?: number;
  currentRunRate?: number;

  // Player state
  batter1: PlayerState;
  batter2: PlayerState;
  currentBowler: BowlerState;
  availableBowlers: BowlerState[];

  // Conditions
  pitchConditions: PitchCondition;
  dewFactor: DewLevel;
  weatherCondition?: string;
  boundarySize: 'short' | 'medium' | 'large';

  // Strategic context
  impactPlayerUsed: boolean;
  impactPlayerAvailable?: string;
  powerplayActive: boolean;
  timeoutUsed: boolean;
  recentOvers: OverSummary[];  // last 3 overs
  phase: MatchPhase;
}

export interface PlayerState {
  name: string;
  runs: number;
  balls: number;
  strikeRate: number;
  fours: number;
  sixes: number;
  handedness: 'right' | 'left';
  recentForm?: string;  // e.g. "4,6,1,W,2"
}

export interface BowlerState {
  name: string;
  oversBowled: number;
  runsConceded: number;
  wickets: number;
  economy: number;
  type: BowlerType;
  oversRemaining: number;
  recentForm?: string;
}

export type BowlerType =
  | 'fast'
  | 'medium-fast'
  | 'medium'
  | 'off-spin'
  | 'leg-spin'
  | 'left-arm-spin'
  | 'left-arm-fast';

export type PitchCondition =
  | 'batting_friendly'
  | 'bowling_friendly'
  | 'spin_friendly'
  | 'seam_friendly'
  | 'damp'
  | 'dry'
  | 'neutral';

export type DewLevel = 'none' | 'light' | 'heavy';

export type MatchPhase =
  | 'powerplay'       // overs 1-6
  | 'middle'          // overs 7-15
  | 'death'           // overs 16-20
  | 'super_over';

export interface OverSummary {
  over: number;
  runs: number;
  wickets: number;
  bowler: string;
  events: string[];  // e.g. ["4", "1", "W", "6", "2", "1"]
}

// ============================================================
// Agent output types
// ============================================================

export interface AgentMessage {
  agentId: AgentRole;
  agentName: string;
  content: string;
  timestamp: number;
  confidence?: number;
  recommendation?: TacticalRecommendation;
  toolCalls?: ToolCallRecord[];
}

export type AgentRole =
  | 'strategist'
  | 'stats_analyst'
  | 'devils_advocate'
  | 'commentator';

export interface TacticalRecommendation {
  primaryAction: string;
  targetPlayer?: string;
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high';
  confidenceScore: number;  // 0-100
  alternativeActions?: string[];
  counterfactual?: string;
  fieldingChanges?: string[];
}

export interface ToolCallRecord {
  toolName: string;
  input: Record<string, unknown>;
  output: unknown;
  executedAt: number;
}

// ============================================================
// Debate / orchestration types
// ============================================================

export interface DebateRound {
  roundNumber: number;
  messages: AgentMessage[];
}

export interface DebateSession {
  sessionId: string;
  matchState: MatchState;
  rounds: DebateRound[];
  finalDecision?: FinalDecision;
  startedAt: number;
  completedAt?: number;
  status: 'running' | 'completed' | 'error';
}

export interface FinalDecision {
  recommendation: TacticalRecommendation;
  commentary: string;
  debateSummary: string;
  agentVotes: Record<AgentRole, string>;
  overallConfidence: number;
  winProbabilityShift?: number;  // % change after decision
}

// ============================================================
// Tool / function calling types
// ============================================================

export interface WinProbabilityInput {
  runs: number;
  wickets: number;
  overs: number;
  target: number;
  totalOvers: number;
  venue?: string;
  pitchCondition?: PitchCondition;
}

export interface WinProbabilityOutput {
  battingTeamWinProbability: number;
  bowlingTeamWinProbability: number;
  requiredRunRate: number;
  projectedScore?: number;
  keyFactors: string[];
}

export interface MatchupAnalysisInput {
  batterName: string;
  bowlerName: string;
  phase?: MatchPhase;
  venue?: string;
}

export interface MatchupAnalysisOutput {
  batterStrikeRate: number;
  dismissalProbability: number;
  preferredShots: string[];
  weaknesses: string[];
  historicalDots: number;
  recommendation: string;
}

export interface VenueStatsInput {
  venue: string;
  phase?: MatchPhase;
}

export interface VenueStatsOutput {
  averageFirstInningsScore: number;
  averageSecondInningsScore: number;
  highestScore: number;
  winningPercentageBattingFirst: number;
  typicalPaceVsSpinSplit: string;
  pitchCharacteristics: string[];
}
