'use client';

import { useState, useCallback, useRef } from 'react';
import { startDebate, streamDebateEvents, getDemoMatch } from '../lib/api';
import {
  MatchState,
  AgentMessage,
  OrchestrationEvent,
  FinalDecision,
  AgentRole,
  AgentStartData,
  ToolCallRecord,
} from '../types';

export type DebateStatus = 'idle' | 'starting' | 'running' | 'completed' | 'error';

export interface AgentActivity {
  agentId: AgentRole;
  status: 'idle' | 'thinking' | 'complete';
  currentMessage?: string;
  toolCalls: ToolCallRecord[];
}

export interface UseDebateReturn {
  status: DebateStatus;
  agentMessages: AgentMessage[];
  agentActivity: Record<AgentRole, AgentActivity>;
  finalDecision: FinalDecision | null;
  error: string | null;
  sessionId: string | null;
  currentRound: number;
  runDebate: (matchState: MatchState) => Promise<void>;
  loadDemo: () => Promise<MatchState | null>;
  reset: () => void;
}

const DEFAULT_ACTIVITY: AgentActivity = {
  agentId: 'strategist',
  status: 'idle',
  toolCalls: [],
};

const makeDefaultActivity = (): Record<AgentRole, AgentActivity> => ({
  strategist:      { ...DEFAULT_ACTIVITY, agentId: 'strategist' },
  stats_analyst:   { ...DEFAULT_ACTIVITY, agentId: 'stats_analyst' },
  devils_advocate: { ...DEFAULT_ACTIVITY, agentId: 'devils_advocate' },
  commentator:     { ...DEFAULT_ACTIVITY, agentId: 'commentator' },
});

export function useDebate(): UseDebateReturn {
  const [status, setStatus] = useState<DebateStatus>('idle');
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
  const [agentActivity, setAgentActivity] = useState<Record<AgentRole, AgentActivity>>(makeDefaultActivity());
  const [finalDecision, setFinalDecision] = useState<FinalDecision | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState(0);

  const cleanupRef = useRef<(() => void) | null>(null);

  const reset = useCallback(() => {
    cleanupRef.current?.();
    setStatus('idle');
    setAgentMessages([]);
    setAgentActivity(makeDefaultActivity());
    setFinalDecision(null);
    setError(null);
    setSessionId(null);
    setCurrentRound(0);
  }, []);

  const handleEvent = useCallback((event: OrchestrationEvent) => {
    switch (event.type) {
      case 'session_start':
        setStatus('running');
        break;

      case 'agent_start': {
        const data = event.data as AgentStartData;
        setAgentActivity(prev => ({
          ...prev,
          [data.agentId]: {
            ...prev[data.agentId],
            status: 'thinking',
            currentMessage: data.message,
          },
        }));
        break;
      }

      case 'agent_complete': {
        const msg = event.data as AgentMessage;
        setAgentMessages(prev => [...prev, msg]);
        setAgentActivity(prev => ({
          ...prev,
          [msg.agentId]: {
            ...prev[msg.agentId],
            status: 'complete',
            currentMessage: undefined,
            toolCalls: msg.toolCalls || [],
          },
        }));
        setCurrentRound(prev => prev + 1);
        break;
      }

      case 'tool_call': {
        const tc = event.data as ToolCallRecord;
        setAgentActivity(prev => ({
          ...prev,
          stats_analyst: {
            ...prev.stats_analyst,
            toolCalls: [...prev.stats_analyst.toolCalls, tc],
          },
        }));
        break;
      }

      case 'final_decision':
        setFinalDecision(event.data as FinalDecision);
        setStatus('completed');
        break;

      case 'error':
        setError((event.data as { message: string }).message);
        setStatus('error');
        break;
    }
  }, []);

  const runDebate = useCallback(async (matchState: MatchState) => {
    reset();
    setStatus('starting');

    try {
      const { sessionId: sid } = await startDebate(matchState);
      setSessionId(sid);
      setStatus('running');

      const cleanup = streamDebateEvents(
        sid,
        handleEvent,
        (err) => {
          setError(err.message);
          setStatus('error');
        }
      );

      cleanupRef.current = cleanup;
    } catch (err) {
      setError(String(err));
      setStatus('error');
    }
  }, [reset, handleEvent]);

  const loadDemo = useCallback(async (): Promise<MatchState | null> => {
    try {
      return await getDemoMatch();
    } catch {
      setError('Failed to load demo match');
      return null;
    }
  }, []);

  return {
    status,
    agentMessages,
    agentActivity,
    finalDecision,
    error,
    sessionId,
    currentRound,
    runDebate,
    loadDemo,
    reset,
  };
}
