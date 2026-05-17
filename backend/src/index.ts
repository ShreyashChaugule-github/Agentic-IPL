// ============================================================
// captain-cool/backend/src/index.ts
// Express server entry point
// ============================================================

import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import apiRoutes from './api/routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ── Root ────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    name: 'Captain Cool — Multi-Agent IPL Strategist',
    version: '1.0.0',
    status: 'running',
    agents: [
      { id: 'strategist',      model: 'gemini-2.5-pro',   role: 'Tactical Captain' },
      { id: 'stats_analyst',   model: 'gemini-2.5-flash', role: 'Data Analyst' },
      { id: 'devils_advocate', model: 'gemini-2.5-pro',   role: 'Challenger' },
      { id: 'commentator',     model: 'gemini-2.5-flash', role: 'Narrator' },
    ],
    endpoints: {
      health:    'GET  /api/health',
      demoMatch: 'GET  /api/demo-match',
      debate:    'POST /api/debate',
      stream:    'GET  /api/debate/:sessionId/stream',
      session:   'GET  /api/debate/:sessionId',
    },
  });
});

// ── 404 ─────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏏 Captain Cool Backend running on http://localhost:${PORT}`);
  console.log(`   Gemini Pro   → gemini-2.5-pro  (Strategist + Devil's Advocate)`);
  console.log(`   Gemini Flash → gemini-2.5-flash (Stats Analyst + Commentator)`);
  console.log(`   ADK Debate   → POST /api/debate\n`);
});

export default app;
