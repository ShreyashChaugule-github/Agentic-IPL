// ============================================================
// captain-cool/frontend/src/lib/api.ts
// API client for communicating with the Captain Cool backend
// ============================================================

import { MatchState, DebateSession, OrchestrationEvent } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function startDebate(matchState: MatchState): Promise<{ sessionId: string }> {
  const res = await fetch(`${API_BASE}/api/debate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(matchState),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to start debate');
  }

  return res.json();
}

export async function getSession(sessionId: string): Promise<DebateSession> {
  const res = await fetch(`${API_BASE}/api/debate/${sessionId}`);
  if (!res.ok) throw new Error('Session not found');
  return res.json();
}

export async function getDemoMatch(): Promise<MatchState> {
  const res = await fetch(`${API_BASE}/api/demo-match`);
  if (!res.ok) throw new Error('Failed to load demo match');
  return res.json();
}

export function streamDebateEvents(
  sessionId: string,
  onEvent: (event: OrchestrationEvent) => void,
  onError?: (err: Error) => void
): () => void {
  const url = `${API_BASE}/api/debate/${sessionId}/stream`;
  const eventSource = new EventSource(url);

  eventSource.onmessage = (e) => {
    try {
      const event: OrchestrationEvent = JSON.parse(e.data);
      onEvent(event);

      if (event.type === 'final_decision' || event.type === 'error') {
        eventSource.close();
      }
    } catch (err) {
      console.error('Failed to parse SSE event:', err);
    }
  };

  eventSource.onerror = (e) => {
    console.error('SSE error:', e);
    onError?.(new Error('Stream connection failed'));
    eventSource.close();
  };

  return () => eventSource.close();
}

// ── Agent configuration (used by UI components) ────────────

export const AGENT_CONFIG = {
  strategist: {
    name: 'Match Strategist',
    role: 'Tactical Captain',
    color: 'green',
    icon: '🧢',
    model: 'gemini-2.5-pro',
    description: 'Dhoni-like tactical composure. Makes the final call.',
  },
  stats_analyst: {
    name: 'Stats Analyst',
    role: 'Data Engine',
    color: 'blue',
    icon: '📊',
    model: 'gemini-2.5-flash',
    description: 'Function calling tools. Win probability, matchup data, venue stats.',
  },
  devils_advocate: {
    name: "Devil's Advocate",
    role: 'Challenger',
    color: 'red',
    icon: '⚡',
    model: 'gemini-2.5-pro',
    description: 'Attacks every assumption. Exposes risks before they cost runs.',
  },
  commentator: {
    name: 'Match Commentator',
    role: 'Narrator',
    color: 'amber',
    icon: '🎙️',
    model: 'gemini-2.5-flash',
    description: 'Translates the debate into broadcast-quality cricket commentary.',
  },
} as const;
