// ============================================================
// captain-cool/backend/src/lib/gemini.ts
// Gemini API client + Gemini Function Calling tool schemas
// ============================================================

import { GoogleGenAI, Tool, Type } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is required in environment variables');
}

export const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ============================================================
// Model constants — Hackathon compliance
// ============================================================
export const MODELS = {
  PRO: 'gemini-2.5-pro',       // Strategist + Devil's Advocate
  FLASH: 'gemini-2.5-flash',   // Stats Analyst + Commentator
} as const;

// ============================================================
// Gemini Function Calling Tool Definitions
// ============================================================

export const WIN_PROBABILITY_TOOL: Tool = {
  functionDeclarations: [
    {
      name: 'calculate_win_probability',
      description:
        'Calculates real-time win probability for the batting team using Duckworth-Lewis-style T20 model with IPL-specific adjustments.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          runs: {
            type: Type.NUMBER,
            description: 'Current runs scored by batting team',
          },
          wickets: {
            type: Type.NUMBER,
            description: 'Wickets fallen (0-10)',
          },
          overs: {
            type: Type.NUMBER,
            description: 'Overs completed, e.g. 14.3 means 14 overs 3 balls',
          },
          target: {
            type: Type.NUMBER,
            description: 'Target score (second innings only)',
          },
          totalOvers: {
            type: Type.NUMBER,
            description: 'Total overs in the match, typically 20',
          },
          venue: {
            type: Type.STRING,
            description: 'Venue name for ground-specific adjustments',
          },
          pitchCondition: {
            type: Type.STRING,
            description:
              'Current pitch condition: batting_friendly, bowling_friendly, spin_friendly, seam_friendly, damp, dry, neutral',
          },
        },
        required: ['runs', 'wickets', 'overs', 'target', 'totalOvers'],
      },
    },
  ],
};

export const MATCHUP_ANALYSIS_TOOL: Tool = {
  functionDeclarations: [
    {
      name: 'analyze_batter_bowler_matchup',
      description:
        'Retrieves historical IPL batter vs bowler matchup statistics including strike rate, dismissal probability, preferred scoring zones, and weaknesses.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          batterName: {
            type: Type.STRING,
            description: 'Full name of the batter',
          },
          bowlerName: {
            type: Type.STRING,
            description: 'Full name of the bowler',
          },
          phase: {
            type: Type.STRING,
            description:
              'Match phase: powerplay, middle, death, super_over',
          },
          venue: {
            type: Type.STRING,
            description: 'Optional venue for location-specific stats',
          },
        },
        required: ['batterName', 'bowlerName'],
      },
    },
  ],
};

export const VENUE_STATS_TOOL: Tool = {
  functionDeclarations: [
    {
      name: 'get_venue_statistics',
      description:
        'Retrieves IPL-specific venue statistics including average scores, pitch behavior, pace vs spin effectiveness, and historical match patterns.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          venue: {
            type: Type.STRING,
            description: 'IPL venue name, e.g. Wankhede Stadium, Chepauk',
          },
          phase: {
            type: Type.STRING,
            description: 'Optional: filter stats by match phase',
          },
        },
        required: ['venue'],
      },
    },
  ],
};

export const PHASE_STATS_TOOL: Tool = {
  functionDeclarations: [
    {
      name: 'get_phase_bowling_stats',
      description:
        'Returns phase-wise bowling effectiveness: economy rates, wicket probability, dot ball %, and recommended bowler types for a given match phase and conditions.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          phase: {
            type: Type.STRING,
            description: 'Match phase: powerplay, middle, death',
          },
          pitchCondition: {
            type: Type.STRING,
            description: 'Current pitch conditions',
          },
          dewFactor: {
            type: Type.STRING,
            description: 'Dew level: none, light, heavy',
          },
          venue: {
            type: Type.STRING,
            description: 'Venue for specific ground conditions',
          },
        },
        required: ['phase'],
      },
    },
  ],
};

export const CRICBUZZ_LIVE_SCORE_TOOL: Tool = {
  functionDeclarations: [
    {
      name: 'get_live_match_score',
      description:
        'Fetches live match scores and status from Cricbuzz API (via RapidAPI) or falls back to simulation if API is unavailable.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          matchId: {
            type: Type.STRING,
            description: 'Optional: Specific match ID to fetch. If not provided, it will list current live matches.',
          },
        },
        required: [],
      },
    },
  ],
};

// All tools combined for Stats Analyst agent
export const ALL_STATS_TOOLS: Tool[] = [
  WIN_PROBABILITY_TOOL,
  MATCHUP_ANALYSIS_TOOL,
  VENUE_STATS_TOOL,
  PHASE_STATS_TOOL,
  CRICBUZZ_LIVE_SCORE_TOOL,
];
