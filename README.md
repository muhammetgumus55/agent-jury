# ⚖️ Agent Jury

> **AI-powered idea evaluation platform** — three autonomous agents deliberate, score, and deliver a verdict on your hackathon idea, with results saved permanently on-chain.

Built for the **Monad Blitz Hackathon**.

---

## What is Agent Jury?

Agent Jury sends your idea to a panel of three specialized AI agents that independently evaluate it across different dimensions. After deliberation, a final weighted score is computed and you can optionally save the verdict immutably to the **Monad Testnet** blockchain.

### The Three Agents

| Agent | Role | Weight |
|-------|------|--------|
| 🧠 **Feasibility Agent** | Technical soundness, architecture, and stack viability | 25% |
| 💡 **Innovation Agent** | Novelty, differentiation, and "aha!" factor | 50% |
| 🛡️ **Risk Agent** | Threats, ethics, and vulnerabilities (inverted: lower risk = better score) | 25% |

### Scoring Formula

```
Final Score = (Innovation × 0.50) + (Feasibility × 0.25) + ((100 − Risk) × 0.25)
```

### Verdicts

| Score | Verdict |
|-------|---------|
| ≥ 70  | ✅ **Ship MVP** |
| 50–69 | ⚠️ **Iterate First** |
| < 50  | ❌ **Reject — Major Issues** |

---

## Features

- **Three parallel AI agents** — each agent runs concurrently via [OpenRouter](https://openrouter.ai/) using `gpt-4o-mini`
- **Deliberation chat** — a live animated conversation between agents plays out before the results are revealed
- **On-chain verdicts** — save any evaluation to the Monad Testnet smart contract with one click (requires MetaMask)
- **Verdict history** — browse the last 10 on-chain verdicts, sortable by date or score
- **Retry on rate-limits** — the API layer automatically retries with exponential backoff on `429` errors

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI | OpenAI SDK → OpenRouter (`gpt-4o-mini`) |
| Blockchain | [ethers.js v6](https://docs.ethers.org/) + Monad Testnet |
| Icons | [Lucide React](https://lucide.dev/) |

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/your-username/agent-jury.git
cd agent-jury
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

Get a free API key at [openrouter.ai](https://openrouter.ai/).

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## On-Chain Integration

Agent Jury integrates with a smart contract deployed on **Monad Testnet**.

| Property | Value |
|----------|-------|
| Network | Monad Testnet (Chain ID: `10143`) |
| Contract | `0x9429A166CCE36262A9Dec2BE90C43AE685fB415B` |
| Explorer | [testnet.monadexplorer.com](https://testnet.monadexplorer.com/) |
| RPC | `https://testnet-rpc.monad.xyz/` |

To save a verdict on-chain, you need:
- **MetaMask** browser extension
- **MON** tokens (Monad Testnet native currency) for gas

The app will automatically prompt you to add the Monad Testnet network to MetaMask if it isn't already configured.

---

## Project Structure

```
agent-jury/
├── app/
│   ├── page.tsx              # Main evaluation page
│   ├── layout.tsx            # Root layout
│   ├── history/
│   │   └── page.tsx          # On-chain verdict history
│   └── api/
│       └── evaluate/
│           └── route.ts      # API route — runs the three AI agents
├── components/
│   ├── AgentCard.tsx         # Individual agent result card
│   ├── DeliberationChat.tsx  # Animated agent deliberation UI
│   └── Footer.tsx
├── lib/
│   ├── contract.ts           # ethers.js helpers for on-chain read/write
│   └── utils.ts
├── contracts/                # Solidity smart contract source
└── types/
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server on port 3000 |
| `npm run build` | Build the production bundle |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## License

MIT
