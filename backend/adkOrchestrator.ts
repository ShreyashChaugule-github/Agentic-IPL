// ============================================================
// captain-cool/backend/src/orchestrator/adkOrchestrator.ts
// Google ADK-style Orchestrator
// Manages the full 5-step agent debate loop with streaming
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

import { runStrategistAgent } from '../agents/strategistAgent';
import { runStatsAnalystAgent } from '../agents/statsAnalystAgent';
import { runDevilsAdvocateAgent } from '../agents/devilsAdvocateAgent';
import { runCommentatorAgent } from '../agents/commentatorAgent';

import {
  MatchState,
  DebateSession,
  AgentMessage,
  FinalDecision,
} from '../types';

// ============================================================
// Orchestration Events (streamed to frontend via SSE/WebSocket)
// ============================================================
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

export class CaptainCoolOrchestrator extends EventEmitter {
  private sessions: Map<string, DebateSession> = new Map();

  // ============================================================
  // Main entry point — run the full debate loop
  // ============================================================
  async runDebate(matchState: MatchState): Promise<DebateSession> {
    const sessionId = uuidv4();

    const session: DebateSession = {
      sessionId,
      matchState,
      rounds: [],
      startedAt: Date.now(),
      status: 'running',
    };

    this.sessions.set(sessionId, session);

    this.emit('event', {
      type: 'session_start',
      sessionId,
      data: { matchState },
      timestamp: Date.now(),
    } as OrchestrationEvent);

    try {
      // --------------------------------------------------------
      // ROUND 1: Strategist makes initial proposal
      // --------------------------------------------------------
      this.emitAgentStart(sessionId, 'strategist', 'Making initial tactical assessment...');
      const strategistInitial = await runStrategistAgent(matchState);
      this.emitAgentComplete(sessionId, strategistInitial);

      session.rounds.push({ roundNumber: 1, messages: [strategistInitial] });

      // --------------------------------------------------------
      // ROUND 2: Stats Analyst validates with data + tool calls
      // --------------------------------------------------------
      this.emitAgentStart(sessionId, 'stats_analyst', 'Running statistical analysis and tool calls...');
      const statsAnalysis = await runStatsAnalystAgent(
        matchState,
        strategistInitial.content
      );
      this.emitAgentComplete(sessionId, statsAnalysis);

      // Emit individual tool calls for UI display
      if (statsAnalysis.toolCalls?.length) {
        statsAnalysis.toolCalls.forEach((tc) => {
          this.emit('event', {
            type: 'tool_call',
            sessionId,
            data: tc,
            timestamp: Date.now(),
          } as OrchestrationEvent);
        });
      }

      session.rounds.push({ roundNumber: 2, messages: [statsAnalysis] });

      // --------------------------------------------------------
      // ROUND 3: Strategist revises with stats context
      // --------------------------------------------------------
      this.emitAgentStart(sessionId, 'strategist', 'Incorporating data insights and refining call...');
      const strategistRevised = await runStrategistAgent(
        matchState,
        [strategistInitial.content, statsAnalysis.content],
        false
      );
      this.emitAgentComplete(sessionId, strategistRevised);

      session.rounds.push({ roundNumber: 3, messages: [strategistRevised] });

      // --------------------------------------------------------
      // ROUND 4: Devil's Advocate attacks the revised plan
      // --------------------------------------------------------
      this.emitAgentStart(sessionId, 'devils_advocate', 'Challenging the tactical proposal...');
      const devilsChallenge = await runDevilsAdvocateAgent(
        matchState,
        strategistRevised.content,
        statsAnalysis.content
      );
      this.emitAgentComplete(sessionId, devilsChallenge);

      session.rounds.push({ roundNumber: 4, messages: [devilsChallenge] });

      // --------------------------------------------------------
      // ROUND 5: Strategist defends or revises under attack
      // --------------------------------------------------------
      this.emitAgentStart(sessionId, 'strategist', 'Responding to challenge — final decision...');
      const strategistFinal = await runStrategistAgent(
        matchState,
        [devilsChallenge.content],
        true  // isRevision = true
      );
      this.emitAgentComplete(sessionId, strategistFinal);

      session.rounds.push({ roundNumber: 5, messages: [strategistFinal] });

      // --------------------------------------------------------
      // ROUND 6: Commentator wraps it all up
      // --------------------------------------------------------
      this.emitAgentStart(sessionId, 'commentator', 'Crafting final commentary...');
      const { message: commentaryMsg, finalDecision } = await runCommentatorAgent(
        matchState,
        strategistFinal.content,
        devilsChallenge.content,
        statsAnalysis.content,
        strategistFinal.recommendation!
      );
      this.emitAgentComplete(sessionId, commentaryMsg);

      session.rounds.push({ roundNumber: 6, messages: [commentaryMsg] });

      // --------------------------------------------------------
      // Session complete
      // --------------------------------------------------------
      session.finalDecision = finalDecision;
      session.completedAt = Date.now();
      session.status = 'completed';

      this.emit('event', {
        type: 'final_decision',
        sessionId,
        data: finalDecision,
        timestamp: Date.now(),
      } as OrchestrationEvent);

      this.sessions.set(sessionId, session);
      return session;

    } catch (error) {
      session.status = 'error';
      this.sessions.set(sessionId, session);

      this.emit('event', {
        type: 'error',
        sessionId,
        data: { message: String(error) },
        timestamp: Date.now(),
      } as OrchestrationEvent);

      throw error;
    }
  }

  getSession(sessionId: string): DebateSession | undefined {
    return this.sessions.get(sessionId);
  }

  getAllSessions(): DebateSession[] {
    return Array.from(this.sessions.values());
  }

  private emitAgentStart(sessionId: string, agentId: string, message: string) {
    this.emit('event', {
      type: 'agent_start',
      sessionId,
      data: { agentId, message },
      timestamp: Date.now(),
    } as OrchestrationEvent);
  }

  private emitAgentComplete(sessionId: string, message: AgentMessage) {
    this.emit('event', {
      type: 'agent_complete',
      sessionId,
      data: message,
      timestamp: Date.now(),
    } as OrchestrationEvent);
  }
}

// Singleton orchestrator instance
export const orchestrator = new CaptainCoolOrchestrator();
