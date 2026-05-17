// ============================================================
// captain-cool/backend/src/agents/devilsAdvocateAgent.ts
// Devil's Advocate Agent — gemini-2.5-pro
// Challenges every tactical assumption with cricket logic
// ============================================================

import { genai, MODELS } from '../lib/gemini';
import { MatchState, AgentMessage } from '../types';

const DEVILS_ADVOCATE_SYSTEM_PROMPT = `You are Harsha Bhogle's inner critic crossed with a chess grandmaster — a highly contrarian cricket strategist whose ONLY job is to challenge tactical assumptions and expose flaws in proposed plans.

You are NOT trying to be difficult. You are trying to pressure-test decisions so the team doesn't make expensive mistakes. You are the voice that prevents captains from being predictable.

Your challenger framework:
1. FLAW HUNTING: What conditions make this plan fail?
2. MATCHUP TRAP: Is the captain walking into a batter's strength?
3. CONDITION MISMATCH: Does pitch/dew/boundary size make this dangerous?
4. RESOURCE MANAGEMENT: Is this burning a premium asset at the wrong moment?
5. MOMENTUM READ: Is this decision reacting to the last over instead of anticipating the next 3?
6. COUNTER-STRATEGY: What will the batting team do once they see this change?

Your examples of counter-arguments:
- "Leg spinner into dew is just a boundary machine — you'll give away 18 in that over."
- "Hard lengths won't work with 55-meter square boundaries — the pull shot is on for 6."
- "Bumrah has 2 overs left — burning him in over 15 means you have no death weapon."
- "Left-arm over is what he wants — he averages 195 SR against left-arm pace. Bowl around the wicket."
- "That's too predictable. They'll have a switch-hit ready for the off-spinner."

Output format:
- CHALLENGE: Specific flaw in the proposed tactic
- RISK SCENARIO: Describe exactly how this plan blows up (1-3 sentences, be vivid)  
- ALTERNATIVE: Your contrarian counter-proposal
- CRICKET LOGIC: Historical precedent or principle that supports your challenge
- DANGER RATING: 🟢 Safe / 🟡 Risky / 🔴 Dangerous

Be aggressive. Be specific. Use cricket terminology. Make the strategist defend or change.`;

export async function runDevilsAdvocateAgent(
  matchState: MatchState,
  strategistProposal: string,
  statsData: string
): Promise<AgentMessage> {
  const prompt = buildAdvocatePrompt(matchState, strategistProposal, statsData);

  const response = await genai.models.generateContent({
    model: MODELS.PRO,
    config: {
      systemInstruction: DEVILS_ADVOCATE_SYSTEM_PROMPT,
      temperature: 0.85,  // Higher temperature for creative challenges
      maxOutputTokens: 1000,
    },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  const content = response.text ?? '';

  return {
    agentId: 'devils_advocate',
    agentName: "Devil's Advocate",
    content,
    timestamp: Date.now(),
  };
}

function buildAdvocatePrompt(
  state: MatchState,
  strategistProposal: string,
  statsData: string
): string {
  const dangerFlags = buildDangerFlags(state);

  return `You must challenge the following tactical decision:

=== STRATEGIST'S PROPOSAL ===
"${strategistProposal}"

=== STATS ANALYST DATA ===
${statsData}

=== MATCH CONDITIONS TO CONSIDER ===
Venue: ${state.venue} | Pitch: ${state.pitchConditions} | Dew: ${state.dewFactor}
Phase: ${state.phase.toUpperCase()} | Boundary Size: ${state.boundarySize}
Overs: ${state.overs}/${state.totalOvers} | Score: ${state.runs}/${state.wickets}

Batters:
- ${state.batter1.name} (${state.batter1.handedness}-hand) — SR: ${state.batter1.strikeRate}, Recent: ${state.batter1.recentForm || 'unknown'}
- ${state.batter2.name} (${state.batter2.handedness}-hand) — SR: ${state.batter2.strikeRate}, Recent: ${state.batter2.recentForm || 'unknown'}

=== ⚠️ KNOWN DANGER FLAGS ===
${dangerFlags.join('\n')}

Find the BIGGEST flaw in the strategist's plan. Be specific, be aggressive, use real cricket logic. 
What is the nightmare scenario if they follow this plan? What should they do instead?`;
}

function buildDangerFlags(state: MatchState): string[] {
  const flags: string[] = [];

  if (state.dewFactor === 'heavy') {
    flags.push('⚠️ Heavy dew: spin grip severely compromised, every spinner becomes a boundary candidate');
  }
  if (state.dewFactor === 'light') {
    flags.push('⚠️ Light dew: grip affected in 2nd half of innings for spinners');
  }
  if (state.boundarySize === 'short') {
    flags.push('⚠️ Short boundaries: slog shots and pulls are HIGH VALUE — short balls are dangerous');
  }
  if (state.phase === 'death' && state.availableBowlers.some(b => b.type === 'leg-spin' && b.oversRemaining > 0)) {
    flags.push('⚠️ Leg spin in death overs: extremely high-risk on any surface, batters attack');
  }
  if (state.wickets <= 2 && state.phase === 'death') {
    flags.push('⚠️ Batting team has 8+ wickets: aggressive batting is low-risk for them');
  }
  if (state.currentBowler.economy > 10) {
    flags.push(`⚠️ Current bowler (${state.currentBowler.name}) conceding ${state.currentBowler.economy} economy — change is urgent`);
  }
  if (state.pitchConditions === 'batting_friendly') {
    flags.push('⚠️ Batting pitch: any medium pace will get murdered, needs extreme precision from pace');
  }
  if (state.pitchConditions === 'spin_friendly') {
    flags.push('✅ Spin-friendly pitch: conditions favour spinners — use them aggressively');
  }

  return flags.length ? flags : ['No critical danger flags identified — conditions are standard'];
}
