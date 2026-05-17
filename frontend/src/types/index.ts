// ============================================================
// captain-cool/frontend/src/types/index.ts
// Shared type definitions mirroring the backend types
// ============================================================

export interface MatchState {
  matchId?: string;
  team1: string;
  team2: string;
  venue: string;
  battingTeam: string;
  bowlingTeam: string;
  currentInnings: 1 | 2;
  runs: number;
  wickets: number;
  overs: number;
  totalOvers: number;
  target?: number;
  requiredRunRate?: number;
  currentRunRate?: number;
  batter1: PlayerState;
  batter2: PlayerState;
  currentBowler: BowlerState;
  availableBowlers: BowlerState[];
  pitchConditions: PitchCondition;
  dewFactor: DewLevel;
  weatherCondition?: string;
  boundarySize: 'short' | 'medium' | 'large';
  impactPlayerUsed: boolean;
  impactPlayerAvailable?: string;
  powerplayActive: boolean;
  timeoutUsed: boolean;
  recentOvers: OverSummary[];
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
  recentForm?: string;
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

export type MatchPhase = 'powerplay' | 'middle' | 'death' | 'super_over';

export interface OverSummary {
  over: number;
  runs: number;
  wickets: number;
  bowler: string;
  events: string[];
}

// ── Agent types ────────────────────────────────────────────

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
  confidenceScore: number;
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

// ── Debate / session types ─────────────────────────────────

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
  winProbabilityShift?: number;
}

// ── SSE event types ────────────────────────────────────────

export interface OrchestrationEvent {
  type:
    | 'session_start'
    | 'agent_start'
    | 'agent_complete'
    | 'tool_call'
    | 'debate_round'
    | 'final_decision'
    | 'error';
  sessionId: string;
  data: unknown;
  timestamp: number;
}

export interface AgentStartData {
  agentId: AgentRole;
  message: string;
}
