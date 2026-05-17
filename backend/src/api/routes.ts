// ============================================================
// captain-cool/backend/src/api/routes.ts
// Express REST API + SSE streaming endpoint
// ============================================================

import { Router, Request, Response } from 'express';
import { orchestrator, OrchestrationEvent } from '../orchestrator/adkOrchestrator';
import { MatchState } from '../types';

const router = Router();

// ============================================================
// POST /api/debate — Start a new debate session
// ============================================================
router.post('/debate', async (req: Request, res: Response) => {
  try {
    const matchState: MatchState = req.body;

    if (!matchState.battingTeam || !matchState.bowlingTeam) {
      return res.status(400).json({
        error: 'battingTeam and bowlingTeam are required',
      });
    }

    // Register listener first to avoid missing the synchronous 'session_start' event
    const sessionIdPromise = new Promise<string>((resolve) => {
      orchestrator.once('event', (event: OrchestrationEvent) => {
        if (event.type === 'session_start') {
          resolve(event.sessionId);
        }
      });
    });

    // Start debate asynchronously
    const debatePromise = orchestrator.runDebate(matchState);

    // Get session ID from the promise
    const sessionId = await sessionIdPromise;

    // Don't await debate completion — let it run, client streams via SSE
    debatePromise.catch(console.error);

    return res.json({ sessionId, status: 'started' });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
});

// ============================================================
// GET /api/debate/:sessionId/stream — SSE live event stream
// ============================================================
router.get('/debate/:sessionId/stream', (req: Request, res: Response) => {
  const { sessionId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const sendEvent = (event: OrchestrationEvent) => {
    if (event.sessionId === sessionId) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);

      if (event.type === 'final_decision' || event.type === 'error') {
        res.end();
      }
    }
  };

  orchestrator.on('event', sendEvent);

  // Check if session already completed
  const existing = orchestrator.getSession(sessionId);
  if (existing?.status === 'completed' && existing.finalDecision) {
    res.write(`data: ${JSON.stringify({
      type: 'final_decision',
      sessionId,
      data: existing.finalDecision,
      timestamp: Date.now(),
    })}\n\n`);
    res.end();
    return;
  }

  // Cleanup on disconnect
  req.on('close', () => {
    orchestrator.removeListener('event', sendEvent);
  });
});

// ============================================================
// GET /api/debate/:sessionId — Get completed session
// ============================================================
router.get('/debate/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const session = orchestrator.getSession(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  return res.json(session);
});

// ============================================================
// POST /api/debate/sync — Synchronous mode (testing)
// ============================================================
router.post('/debate/sync', async (req: Request, res: Response) => {
  try {
    const matchState: MatchState = req.body;
    const session = await orchestrator.runDebate(matchState);
    return res.json(session);
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
});

// ============================================================
// GET /api/health — Health check
// ============================================================
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Captain Cool Backend',
    models: { pro: 'gemini-2.5-pro', flash: 'gemini-2.5-flash' },
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// GET /api/demo-match — Returns a sample match state for demos
// ============================================================
router.get('/demo-match', (_req: Request, res: Response) => {
  const demoMatch: MatchState = {
    team1: 'Mumbai Indians',
    team2: 'Chennai Super Kings',
    venue: 'Wankhede Stadium',
    battingTeam: 'Chennai Super Kings',
    bowlingTeam: 'Mumbai Indians',
    currentInnings: 2,
    runs: 142,
    wickets: 4,
    overs: 16.3,
    totalOvers: 20,
    target: 185,
    requiredRunRate: 12.6,
    currentRunRate: 8.6,
    batter1: {
      name: 'MS Dhoni',
      runs: 22,
      balls: 14,
      strikeRate: 157,
      fours: 1,
      sixes: 2,
      handedness: 'right',
      recentForm: '4,6,1,6,2,W',
    },
    batter2: {
      name: 'Ravindra Jadeja',
      runs: 18,
      balls: 12,
      strikeRate: 150,
      fours: 2,
      sixes: 1,
      handedness: 'left',
      recentForm: '1,2,4,6,1,0',
    },
    currentBowler: {
      name: 'Jasprit Bumrah',
      oversBowled: 3,
      runsConceded: 28,
      wickets: 2,
      economy: 9.3,
      type: 'fast',
      oversRemaining: 1,
    },
    availableBowlers: [
      {
        name: 'Jasprit Bumrah',
        oversBowled: 3,
        runsConceded: 28,
        wickets: 2,
        economy: 9.3,
        type: 'fast',
        oversRemaining: 1,
      },
      {
        name: 'Hardik Pandya',
        oversBowled: 2,
        runsConceded: 24,
        wickets: 0,
        economy: 12.0,
        type: 'medium-fast',
        oversRemaining: 2,
      },
      {
        name: 'Piyush Chawla',
        oversBowled: 3,
        runsConceded: 31,
        wickets: 1,
        economy: 10.3,
        type: 'leg-spin',
        oversRemaining: 1,
      },
    ],
    pitchConditions: 'batting_friendly',
    dewFactor: 'heavy',
    boundarySize: 'short',
    impactPlayerUsed: false,
    impactPlayerAvailable: 'Mitchell Santner',
    powerplayActive: false,
    timeoutUsed: true,
    phase: 'death',
    recentOvers: [
      { over: 14, runs: 11, wickets: 0, bowler: 'Chawla', events: ['1','2','W','1','4','2'] },
      { over: 15, runs: 14, wickets: 0, bowler: 'Pandya', events: ['6','2','1','1','2','2'] },
      { over: 16, runs: 9, wickets: 1, bowler: 'Bumrah', events: ['1','W','2','1','1','4'] },
    ],
  };

  res.json(demoMatch);
});

export default router;
