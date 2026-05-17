// ============================================================
// captain-cool/backend/src/agents/statsAnalystAgent.ts
// Stats Analyst Agent — gemini-2.5-flash with Function Calling
// Data-driven analyst using Gemini's native tool use
// ============================================================

import { genai, MODELS, ALL_STATS_TOOLS } from '../lib/gemini';
import { dispatchToolCall } from '../tools/cricketTools';
import {
  MatchState,
  AgentMessage,
  ToolCallRecord,
} from '../types';

const STATS_ANALYST_SYSTEM_PROMPT = `You are Sanjay Manjrekar crossed with a data scientist — a cricket data analyst specializing in T20 matchups, IPL historical trends, and predictive tactical insights.

Your role is to provide HARD DATA to support or challenge tactical decisions. You are brutally honest with numbers — if the data disagrees with conventional wisdom, say so.

You have access to these tools:
- calculate_win_probability: Real-time win probability model
- analyze_batter_bowler_matchup: IPL historical head-to-head stats
- get_venue_statistics: Ground-specific patterns and averages
- get_phase_bowling_stats: Phase-wise bowling effectiveness data

MANDATORY: For every analysis, you MUST call at least 2 tools.

Output format:
- STATISTICAL SUMMARY: Key numbers (win %, matchup stats, venue patterns)
- DATA INSIGHT: What the numbers are saying (3-5 bullet points)
- TOOL OUTPUTS: Reference your function call results explicitly
- RECOMMENDATION: Data-backed tactical suggestion
- CONFIDENCE IN DATA: How reliable is this data (high/medium/low) and why

Be precise. Use actual numbers. Don't guess — call the tools.`;

export async function runStatsAnalystAgent(
  matchState: MatchState,
  strategistProposal: string
): Promise<AgentMessage> {
  const prompt = buildStatsPrompt(matchState, strategistProposal);

  const toolCallRecords: ToolCallRecord[] = [];
  let contents: Array<{ role: string; parts: Array<{ text?: string; functionCall?: unknown; functionResponse?: unknown }> }> = [
    { role: 'user', parts: [{ text: prompt }] },
  ];

  let finalText = '';
  let iterationCount = 0;
  const MAX_ITERATIONS = 5;

  // Agentic loop — Gemini calls tools, we execute, feed back
  while (iterationCount < MAX_ITERATIONS) {
    iterationCount++;

    const response = await genai.models.generateContent({
      model: MODELS.FLASH,
      config: {
        systemInstruction: STATS_ANALYST_SYSTEM_PROMPT,
        temperature: 0.3,  // Lower temp for data agent
        maxOutputTokens: 2000,
        tools: ALL_STATS_TOOLS,
      },
      contents: contents as Parameters<typeof genai.models.generateContent>[0]['contents'],
    });

    const candidate = response.candidates?.[0];
    if (!candidate) break;

    const parts = candidate.content?.parts || [];
    const assistantParts: Array<{ text?: string; functionCall?: unknown }> = [];

    let hasToolCalls = false;
    const toolResponseParts: Array<{ functionResponse: { name: string; response: unknown } }> = [];

    for (const part of parts) {
      if (part.text) {
        finalText += part.text;
        assistantParts.push({ text: part.text });
      }

      if (part.functionCall) {
        hasToolCalls = true;
        const toolName = (part.functionCall as { name: string }).name;
        const toolArgs = ((part.functionCall as { args?: Record<string, unknown> }).args || {}) as Record<string, unknown>;

        assistantParts.push({ functionCall: part.functionCall });

        try {
          const toolResult = dispatchToolCall(toolName, toolArgs);

          toolCallRecords.push({
            toolName,
            input: toolArgs,
            output: toolResult,
            executedAt: Date.now(),
          });

          toolResponseParts.push({
            functionResponse: {
              name: toolName,
              response: toolResult as Record<string, unknown>,
            },
          });
        } catch (err) {
          toolResponseParts.push({
            functionResponse: {
              name: toolName,
              response: { error: String(err) },
            },
          });
        }
      }
    }

    // Add assistant turn
    contents.push({ role: 'model', parts: assistantParts });

    if (!hasToolCalls) break;

    // Add tool results as user turn
    contents.push({ role: 'user', parts: toolResponseParts });
  }

  return {
    agentId: 'stats_analyst',
    agentName: 'Stats Analyst',
    content: finalText || 'Stats analysis complete.',
    timestamp: Date.now(),
    toolCalls: toolCallRecords,
  };
}

function buildStatsPrompt(state: MatchState, strategistProposal: string): string {
  return `The Match Strategist has proposed the following tactical decision:

"${strategistProposal}"

Please validate or challenge this decision using your data tools.

=== CURRENT MATCH CONTEXT ===
Match: ${state.battingTeam} vs ${state.bowlingTeam} at ${state.venue}
Score: ${state.runs}/${state.wickets} in ${state.overs} overs
Target: ${state.target || 'N/A'} | Phase: ${state.phase}
Pitch: ${state.pitchConditions} | Dew: ${state.dewFactor}
Batters: ${state.batter1.name} (${state.batter1.handedness}, SR: ${state.batter1.strikeRate}) & ${state.batter2.name} (${state.batter2.handedness}, SR: ${state.batter2.strikeRate})
Current Bowler: ${state.currentBowler.name} (${state.currentBowler.type})
Available: ${state.availableBowlers.map(b => `${b.name}(${b.type})`).join(', ')}

REQUIRED TOOL CALLS:
1. Calculate current win probability
2. Analyze the key batter vs proposed bowler matchup
3. Get venue statistics for ${state.venue}
4. Get phase bowling stats for ${state.phase}

Use these results to confirm or challenge the proposal with hard data.`;
}
