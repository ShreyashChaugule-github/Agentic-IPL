// ============================================================
// captain-cool/backend/src/index.ts
// Express server entry point
// ============================================================

import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import routes from './api/routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================
// Middleware
// ============================================================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// ============================================================
// Routes
// ============================================================
app.use('/api', routes);

// ============================================================
// Start server
// ============================================================
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║           🏏 Captain Cool Backend               ║
║      Multi-Agent IPL Match Strategist           ║
╠══════════════════════════════════════════════════╣
║  Server: http://localhost:${PORT}                   ║
║  Models: gemini-2.5-pro + gemini-2.5-flash      ║
║  Agents: Strategist, Stats, Advocate, Narrator  ║
╚══════════════════════════════════════════════════╝
  `);
});

export default app;
