// ============================================================
// captain-cool/backend/src/agents/commentatorAgent.ts
// Match Commentator Agent — gemini-2.5-flash
// Converts tactical debate into engaging commentary
// ============================================================

import { genai, MODELS } from '../lib/gemini';
import {
  MatchState,
  AgentMessage,
  FinalDecision,
  TacticalRecommendation,
} from '../types';

const COMMENTATOR_SYSTEM_PROMPT = `You are Harsha Bhogle, Ravi Shastri, and Ian Smith rolled into one — an IPL commentator who can explain the most complex tactical decision to both cricket nerds and first-time watchers.

Your job is the FINAL WORD in the Captain Cool decision engine. You take the debate between agents and turn it into:
1. A compelling narrative that explains WHY the captain made this call
2. TV-quality analysis that cricket fans love
3. Plain English that your grandmother can understand
4. Excitement and stakes — make the user feel like they're watching LIVE

Your commentary style rules:
- Start with the drama: "Here's what just happened in the dressing room..."
- Use vivid cricketing metaphors
- Reference the debate: "The captain heard the challenger, and here's why he stuck to his guns..."
- Give BOTH sides fair credit before revealing the decision
- Build to the announcement like a reveal
- End with what to WATCH FOR — what will confirm or deny the decision was right

Phrases you use:
- "And that's the captain's call..."
- "The numbers back him up..."  
- "If this doesn't work, the critics will say..."
- "Watch the batter's footwork here..."
- "This is the kind of decision that separates good captains from legends..."

Output format:
COMMENTARY: [Your full commentary narrative — 150-250 words, TV-broadcast style]
DECISION SUMMARY: [One crisp sentence — the final call]
WATCH FOR: [2-3 specific things to monitor in the next over]
FAN VERDICT: [Emoji + one-liner for the casual fan]`;

export async function runCommentatorAgent(
  matchState: MatchState,
  strategistFinalCall: string,
  devilsChallenge: string,
  statsInsights: string,
  finalRecommendation: TacticalRecommendation
): Promise<{ message: AgentMessage; finalDecision: FinalDecision }> {
  const prompt = buildCommentatorPrompt(
    matchState,
    strategistFinalCall,
    devilsChallenge,
    statsInsights,
    finalRecommendation
  );

  const response = await genai.models.generateContent({
    model: MODELS.FLASH,
    config: {
      systemInstruction: COMMENTATOR_SYSTEM_PROMPT,
      temperature: 0.8,  // Creative, expressive output
      maxOutputTokens: 1200,
    },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  const content = response.text ?? '';

  const finalDecision: FinalDecision = {
    recommendation: finalRecommendation,
    commentary: content,
    debateSummary: buildDebateSummary(strategistFinalCall, devilsChallenge),
    agentVotes: {
      strategist: extractActionLine(strategistFinalCall),
      stats_analyst: extractActionLine(statsInsights),
      devils_advocate: extractChallengeLine(devilsChallenge),
      commentator: extractActionLine(content),
    },
    overallConfidence: finalRecommendation.confidenceScore,
    winProbabilityShift: calculateProbabilityShift(finalRecommendation),
  };

  return {
    message: {
      agentId: 'commentator',
      agentName: 'Match Commentator',
      content,
      timestamp: Date.now(),
    },
    finalDecision,
  };
}

function buildCommentatorPrompt(
  state: MatchState,
  strategistCall: string,
  devilsChallenge: string,
  statsInsights: string,
  recommendation: TacticalRecommendation
): string {
  return `You are live on air. Here's the full debate that just happened:

=== MATCH SITUATION ===
${state.battingTeam} vs ${state.bowlingTeam} at ${state.venue}
${state.runs}/${state.wickets} in ${state.overs} overs | ${state.phase.toUpperCase()} phase
${state.target ? `Chasing ${state.target} — RRR: ${state.requiredRunRate?.toFixed(1)}` : 'First innings'}

=== WHAT THE CAPTAIN DECIDED ===
"${strategistCall.slice(0, 400)}"

=== WHAT THE DATA SAID ===
"${statsInsights.slice(0, 300)}"

=== THE CHALLENGE RAISED ===
"${devilsChallenge.slice(0, 300)}"

=== FINAL CALL ===
${recommendation.primaryAction}
Risk Level: ${recommendation.riskLevel} | Confidence: ${recommendation.confidenceScore}/100
${recommendation.counterfactual ? `Counterfactual: ${recommendation.counterfactual}` : ''}

Now commentate on this decision. You're live — millions are watching. Make them feel the drama.`;
}

function buildDebateSummary(strategist: string, challenge: string): string {
  const strategistLine = strategist.split('\n').find(l => l.includes('DECISION') || l.length > 30) || strategist.slice(0, 100);
  const challengeLine = challenge.split('\n').find(l => l.includes('CHALLENGE') || l.length > 30) || challenge.slice(0, 100);
  return `Strategist: ${strategistLine.slice(0, 120)}... | Challenger: ${challengeLine.slice(0, 120)}...`;
}

function extractActionLine(text: string): string {
  const lines = text.split('\n').filter(l => l.trim().length > 20);
  return lines[0]?.slice(0, 100) || 'Analysis provided';
}

function extractChallengeLine(text: string): string {
  const challengeLine = text.split('\n').find(l => 
    l.toLowerCase().includes('challenge') || l.toLowerCase().includes('flaw') || l.toLowerCase().includes('risk')
  );
  return challengeLine?.slice(0, 100) || 'Challenge raised against proposal';
}

function calculateProbabilityShift(rec: TacticalRecommendation): number {
  // Estimate win probability shift from the decision quality
  if (rec.riskLevel === 'low' && rec.confidenceScore > 75) return 3;
  if (rec.riskLevel === 'medium' && rec.confidenceScore > 65) return 5;
  if (rec.riskLevel === 'high' && rec.confidenceScore > 80) return 8;
  if (rec.riskLevel === 'high' && rec.confidenceScore < 60) return -3;
  return 2;
}
