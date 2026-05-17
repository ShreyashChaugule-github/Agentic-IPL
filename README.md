# 🏏 Captain Cool - IPL Multi-Agent Match Strategist

A sophisticated multi-agent AI system that acts as an IPL cricket captain during live matches, using Google Gemini for tactical decision-making.

**Built for:** Google Gemini Agentic AI Hackathon  
**Stack:** Gemini API + ADK + Next.js + Cloud Run + Firebase

---

## 🎯 Project Vision

Captain Cool is NOT a chatbot. It's a **collaborative multi-agent decision engine** that:
- Chooses the next tactical move (like a real IPL captain)
- Shows internal debate between 4 AI agents
- Explains reasoning like cricket experts
- Uses live cricket statistics
- Runs entirely on Google Gemini ecosystem

### Example Flow
```
User Input: 
  Over 15, 2 wickets down, 95 runs, hard pitch, Chahal available

Captain Cool Decision:
  ✅ Decision: "Bring Chahal now"
  📊 Stats: "Virat vs Chahal: 15 balls, 0 wickets, SR 120%"
  🤔 Challenge: "Dew might lighten the ball grip"
  💪 Confidence: 78%
```

---

## 🚨 Mandatory Google Stack

```
✅ Gemini API (gemini-2.5-pro + gemini-2.5-flash)
✅ Google ADK (Agent Development Kit)
✅ Gemini Function Calling
✅ Google Cloud Run (deployment)
✅ Firebase Auth + Firestore
✅ Vertex AI (optional)
✅ Gemini Live API (stretch goal)
✅ Gemini URL Context Tool (stretch goal)

❌ NO OpenAI
❌ NO Claude APIs
❌ NO Mistral/Groq/Ollama
```

---

## 🧠 4 Agent Architecture

### 1. **Match Strategist Agent** (`gemini-2.5-pro`)
Primary captain making tactical decisions
- Bowling changes
- Field placements
- Impact player usage
- Strategic timeout timing

### 2. **Stats Analyst Agent** (`gemini-2.5-flash`)
Data-driven decision validator
- Head-to-head matchups
- Venue statistics
- Win probability
- Historical patterns
- Function calls to cricket APIs

### 3. **Devil's Advocate Agent** (`gemini-2.5-pro`)
Challenges assumptions and finds risks
- Points out flaws
- Suggests alternatives
- Identifies hidden traps
- Questions decisions

### 4. **Match Commentator Agent** (`gemini-2.5-flash`)
Explains decisions to users
- TV-style narration
- Simple explanations
- Excitement and context
- Makes it accessible

---

## 🔄 Mandatory Agent Debate Loop

```
1. User Input
2. Strategist proposes move
3. Stats Analyst validates with numbers
4. Devil's Advocate challenges plan
5. Strategist revises or defends
6. Commentator explains to users
✅ ALL debate visible to users
```

---

## 🛠 Tech Stack

### Frontend
- **Next.js 15** with React 19
- **TailwindCSS** + ShadCN UI
- Zustand for state
- Recharts for visualizations

### Backend
- **Node.js 20** + TypeScript
- Express.js API
- Google ADK orchestration
- Gemini SDK (`@google/genai`)

### Infrastructure
- **Google Cloud Run** (deployment)
- **Firebase** (auth + Firestore)
- **Vertex AI** (optional ML monitoring)
- **Cloud Build** (CI/CD)

---

## 📁 Project Structure

```
captain-cool/
├── frontend/                    # Next.js React app
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   │   ├── MatchStrategyForm.tsx
│   │   │   ├── AgentDebateViewer.tsx
│   │   │   └── TacticalDecision.tsx
│   │   ├── hooks/
│   │   └── lib/
│   └── tailwind.config.ts
│
├── backend/                     # Node.js + Gemini
│   ├── src/
│   │   ├── agents/
│   │   │   ├── strategist.agent.ts
│   │   │   ├── statsAnalyst.agent.ts
│   │   │   ├── devilsAdvocate.agent.ts
│   │   │   └── commentator.agent.ts
│   │   ├── orchestration/
│   │   │   ├── adk-orchestrator.ts
│   │   │   ├── debate-loop.ts
│   │   │   └── context-builder.ts
│   │   ├── tools/
│   │   │   ├── cricbuzz-connector.ts
│   │   │   └── weather-api.ts
│   │   └── routes/
│   │       └── match-strategy.route.ts
│   └── package.json
│
├── infrastructure/
│   ├── cloud-run/
│   │   ├── Dockerfile
│   │   └── cloudbuild.yaml
│   └── firebase/
│       ├── firestore.rules
│       └── firestore-indexes.json
│
├── prompts/                     # System prompts for each agent
│   ├── strategist-system-prompt.txt
│   ├── stats-analyst-system-prompt.txt
│   ├── devils-advocate-system-prompt.txt
│   └── commentator-system-prompt.txt
│
└── tests/                       # Unit + integration tests
    ├── agents/
    ├── orchestration/
    └── integration/
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Google Cloud account with Gemini API enabled
- Firebase project
- Git

### 1. Clone & Setup
```bash
git clone <repo-url>
cd captain-cool
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
# Edit .env.local with your keys:
# GEMINI_API_KEY=your_api_key
# FIREBASE_PROJECT_ID=your_project_id
# NEXT_PUBLIC_FIREBASE_CONFIG={...}
```

### 3. Run Locally
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Open http://localhost:3000

### 4. Deploy to Cloud Run
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/captain-cool

gcloud run deploy captain-cool \
  --image gcr.io/PROJECT_ID/captain-cool \
  --platform managed \
  --region us-central1 \
  --memory 2Gi \
  --set-env-vars GEMINI_API_KEY=$GEMINI_API_KEY
```

---

## 📊 API Endpoint

**POST** `/api/v1/match-strategy`

### Request
```json
{
  "match_id": "ipl_2024_001",
  "current_over": 15,
  "wickets": 2,
  "runs_scored": 95,
  "pitch": "hard",
  "current_batter": "Virat Kohli",
  "available_bowlers": ["Bumrah", "Chahal"],
  "required_rr": 8.5,
  "dew": "light",
  "venue": "Dubai International",
  "impact_player_used": false
}
```

### Response
```json
{
  "tactical_decision": "Bring Chahal now",
  "agent_debate": [
    {
      "agent": "Match Strategist",
      "proposal": "Chahal's leg-spin will grip..."
    },
    {
      "agent": "Stats Analyst",
      "validation": "Virat vs Chahal: 67% success rate"
    },
    {
      "agent": "Devil's Advocate",
      "challenge": "Dew risk in evening matches..."
    },
    {
      "agent": "Match Strategist",
      "revision": "Accepted risk, short boundaries favor..."
    }
  ],
  "confidence_score": 78,
  "commentary": "Captain's calling Chahal into the attack...",
  "counterfactual": "If we wait 2 overs: RRR jumps to 12.5"
}
```

---

## 🔌 External Tools & APIs

### Cricket Data
- **Cricbuzz API** - Live match data, player stats
- **ESPN Cricinfo** - Historical records, head-to-head
- **Custom Win Probability Calculator** - T20-specific model

### Environment
- **Weather API** - Dew, wind, humidity impact
- **Firebase Firestore** - Match history, decisions

---

## 🧪 Testing

```bash
# Unit tests for agents
npm run test:agents

# Debate loop tests
npm run test:orchestration

# End-to-end tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

---

## 📈 Performance Metrics

- **Tactical Accuracy:** Match rate with actual IPL captains
- **Confidence Calibration:** How often 90% confident decisions succeed
- **Response Time:** <5 seconds for full debate loop
- **User Satisfaction:** Rating of explanations clarity

---

## 🎓 Key Features

✅ **Real Multi-Agent Debate** (not sequential calls)  
✅ **Visible Reasoning** (all agent inputs shown)  
✅ **Live Cricket Data** (Cricbuzz + ESPN integration)  
✅ **Confidence Scoring** (probability of decision success)  
✅ **Counterfactual Analysis** (what if we do nothing?)  
✅ **TV-Style Commentary** (accessibility for all)  
✅ **Production Ready** (Cloud Run deployable)  
✅ **100% Google Stack** (Gemini + ADK + Cloud)  

---

## 📚 Documentation

- [API Reference](./docs/API.md) - Full endpoint documentation
- [Agent Architecture](./docs/AGENTS.md) - Deep dive into each agent
- [Deployment Guide](./docs/DEPLOYMENT.md) - Cloud Run setup
- [System Architecture](./docs/ARCHITECTURE.md) - ADK orchestration details

---

## 🏆 Hackathon Compliance

✅ Gemini API (gemini-2.5-pro + gemini-2.5-flash)  
✅ Google ADK orchestration  
✅ Multi-agent system (4+ agents)  
✅ Agent debate visible to users  
✅ Function calling for live data  
✅ Cloud Run deployment  
✅ Firebase integration  
✅ No non-Google LLMs  
✅ TypeScript + Next.js  
✅ Full test coverage  

---

## 🤝 Contributing

1. Create a feature branch
2. Make changes
3. Add tests
4. Submit PR

---

## 📄 License

MIT License - Built for Google Gemini Hackathon 2024

---

## 👨‍💻 Support

For questions or issues:
1. Check [docs/](./docs/) folder
2. Review [GitHub Issues](https://github.com/yourusername/captain-cool/issues)
3. Reach out to team

---

**Made with 🏏 and Gemini API**
