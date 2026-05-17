// ============================================================
// captain-cool/backend/src/agents/strategistAgent.ts
// Match Strategist Agent — gemini-2.5-pro
// Dhoni-like calm tactical captain
// ============================================================

import { genai, MODELS } from '../lib/gemini';
import { MatchState, AgentMessage, TacticalRecommendation } from '../types';

const STRATEGIST_SYSTEM_PROMPT = `You are MS Dhoni — an elite IPL captain renowned for tactical composure, reading match situations with uncanny precision, and making bold decisions under pressure. You are calm, methodical, and always two overs ahead in your thinking.

Your responsibilities:
- Decide bowling changes (who bowls, exact over, field placements)
- Manage batting order (promote/drop batters based on matchup)  
- Time strategic timeouts perfectly
- Use the Impact Player at the right moment
- Synthesize all inputs into one clear tactical decision

Your decision-making principles:
1. Numbers matter, but feel matters more at the death
2. Matchups beat reputation — pick the right bowler for the right batter
3. Don't burn your best death bowler too early
4. A wicket is worth 15 runs saved in the death overs
5. Field placement is the invisible sixth bowler

Output format:
- TACTICAL DECISION: One clear action (2 sentences max)
- FIELD PLACEMENTS: Specific positioning (3-5 changes if needed)
- REASONING: Cricket-intelligence explanation (4-6 sentences)
- RISK ASSESSMENT: low / medium / high with brief justification
- CONFIDENCE: Score out of 100
- COUNTERFACTUAL: What happens if you DON'T do this?

IMPORTANT: Be decisive. Real captains don't hedge. Make the call.`;

export async function runStrategistAgent(
  matchState: MatchState,
  contextMessages?: string[],
  isRevision: boolean = false
): Promise<AgentMessage> {
  const prompt = buildStrategistPrompt(matchState, contextMessages, isRevision);

  const response = await genai.models.generateContent({
    model: MODELS.PRO,
    config: {
      systemInstruction: STRATEGIST_SYSTEM_PROMPT,
      temperature: 0.7,
      maxOutputTokens: 1200,
    },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  const content = response.text ?? '';
  const recommendation = parseStrategistOutput(content);

  return {
    agentId: 'strategist',
    agentName: 'Match Strategist (Captain)',
    content,
    timestamp: Date.now(),
    confidence: recommendation?.confidenceScore,
    recommendation,
  };
}

function buildStrategistPrompt(
  state: MatchState,
  context?: string[],
  isRevision?: boolean
): string {
  const rrr = state.requiredRunRate
    ? `Required RR: ${state.requiredRunRate.toFixed(1)}`
    : '';
  const target = state.target ? `Target: ${state.target}` : '';
  const impactPlayer = state.impactPlayerAvailable
    ? `Impact Player Available: ${state.impactPlayerAvailable}`
    : 'Impact Player: Used/None';

  const recentOversText = state.recentOvers
    .map((o) => `Over ${o.over}: ${o.runs}R/${o.wickets}W (${o.bowler}) — [${o.events.join(',')}]`)
    .join('\n');

  const availableBowlersText = state.availableBowlers
    .map(
      (b) =>
        `${b.name} (${b.type}) — ${b.oversBowled} overs, Econ: ${b.economy}, ${b.wickets}W, ${b.oversRemaining} overs left`
    )
    .join('\n');

  const prefix = isRevision
    ? `The Devil's Advocate has challenged your initial proposal:\n${context?.join('\n\n')}\n\nRevise your tactical decision OR defend it with stronger cricket-logic.\n\n---\n`
    : context?.length
    ? `Stats Analyst data:\n${context.join('\n\n')}\n\n---\nUsing the above data, make your tactical call.\n\n`
    : '';

  return `${prefix}
=== LIVE MATCH STATE ===
${state.battingTeam} batting vs ${state.bowlingTeam}
Venue: ${state.venue} | Pitch: ${state.pitchConditions} | Dew: ${state.dewFactor}
Score: ${state.runs}/${state.wickets} after ${state.overs} overs
${target} ${rrr}
Phase: ${state.phase.toUpperCase()}
Powerplay Active: ${state.powerplayActive} | Timeout Used: ${state.timeoutUsed}
${impactPlayer}

=== BATTERS AT CREASE ===
${state.batter1.name} (${state.batter1.handedness}): ${state.batter1.runs}(${state.batter1.balls}) SR: ${state.batter1.strikeRate} | Recent: ${state.batter1.recentForm || 'N/A'}
${state.batter2.name} (${state.batter2.handedness}): ${state.batter2.runs}(${state.batter2.balls}) SR: ${state.batter2.strikeRate} | Recent: ${state.batter2.recentForm || 'N/A'}

=== CURRENT BOWLER ===
${state.currentBowler.name} (${state.currentBowler.type}) — ${state.currentBowler.oversBowled} overs, ${state.currentBowler.runsConceded}R, ${state.currentBowler.wickets}W, Econ: ${state.currentBowler.economy}

=== AVAILABLE BOWLERS ===
${availableBowlersText}

=== RECENT OVERS ===
${recentOversText || 'No recent overs data'}

=== BOUNDARY SIZE ===
${state.boundarySize} boundaries

What is your tactical decision for the NEXT OVER?`;
}

function parseStrategistOutput(content: string): TacticalRecommendation {
  // Extract confidence score
  const confidenceMatch = content.match(/CONFIDENCE[:\s]+(\d+)/i);
  const confidenceScore = confidenceMatch ? parseInt(confidenceMatch[1]) : 70;

  // Extract risk level
  const riskMatch = content.match(/RISK[:\s]+(\w+)/i);
  const riskLevel =
    (riskMatch?.[1]?.toLowerCase() as 'low' | 'medium' | 'high') || 'medium';

  // Extract primary action (first tactical decision line)
  const actionMatch = content.match(/TACTICAL DECISION[:\s]+([^\n]+(?:\n[^\n]+)?)/i);
  const primaryAction = actionMatch?.[1]?.trim() || content.split('\n')[0];

  // Extract counterfactual
  const counterfactualMatch = content.match(/COUNTERFACTUAL[:\s]+([^]+?)(?:\n\n|$)/i);
  const counterfactual = counterfactualMatch?.[1]?.trim();

  return {
    primaryAction,
    reasoning: content,
    riskLevel,
    confidenceScore,
    counterfactual,
  };
}
