import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

/* ─── Types ──────────────────────────────────────────────────────── */
interface AgentResult {
    score: number;
    pros: string[];
    cons: string[];
    questions: string[];
}

type Verdict = 'Ship MVP' | 'Iterate First' | 'Reject - Major Issues';

interface EvaluateResponse {
    agents: {
        feasibility: AgentResult;
        innovation: AgentResult;
        risk: AgentResult;
    };
    finalScore: number;
    verdict: Verdict;
}

/* ─── Config ─────────────────────────────────────────────────────── */
const MODEL = 'openai/gpt-4o-mini';
const MAX_RETRIES = 2;

/* ─── Agent prompts ──────────────────────────────────────────────── */
const AGENT_PROMPTS = {
    feasibility: `You are a technical feasibility analyst evaluating project ideas. Your job is to assess whether this project is technically sound and implementable - NOT whether it can be built in 6 hours.

EVALUATION FOCUS:
- Technical architecture: Is the approach technically sound?
- Technology stack: Are the required technologies mature/available?
- Integration complexity: Can different components work together?
- Scalability potential: Can this grow if successful?

SCORING GUIDE:
90-100: Technically straightforward, proven tech stack, clear architecture
70-89: Solid approach, some technical challenges but solvable
50-69: Feasible but requires careful planning, complex integrations
30-49: Significant technical hurdles, unproven tech, architectural concerns
0-29: Technically infeasible, fundamental blockers, impossible integrations

KEY PRINCIPLES:
✅ Evaluate the CONCEPT, not MVP scope
✅ Consider "Can this be built by a competent team?" not "Can this be built in 6 hours?"
✅ Modern integrations (APIs, webhooks, smart contracts) are FEASIBLE
✅ Judge based on technical soundness, not time constraints

EXAMPLES:
- "AI reviews code + triggers smart contract" = 75-85 (proven tech, doable)
- "Quantum computing blockchain" = 20-30 (not feasible yet)
- "GitHub webhook integration" = 85-95 (straightforward)
- "Build new programming language" = 30-40 (too complex)

Return ONLY valid JSON:
{
  "score": <number 0-100>,
  "pros": ["technical strength 1", "proven approach 2", "available tools 3"],
  "cons": ["technical challenge 1", "integration concern 2"],
  "questions": ["architecture question 1", "scalability question 2"]
}`,

    innovation: `You are an innovation judge evaluating project ideas. Your mission: identify truly novel concepts, unique mechanics, and differentiated approaches.

SCORING FRAMEWORK:
🚫 LOW SCORES (10-35) - Overdone/Generic:
- Basic CRUD apps (todo, notes, simple dashboards)
- Standard voting/polling systems without unique mechanics
- Generic NFT marketplaces
- Simple token launchers
- Common DeFi patterns (basic swap, lending without innovation)
- "Put X on blockchain" without novel value proposition

⭐ MEDIUM SCORES (40-60) - Incremental Innovation:
- Familiar concept with meaningful twist
- Combines existing patterns in new way
- Improves existing solutions
- Good execution but not groundbreaking

🌟 HIGH SCORES (65-85) - Strong Innovation:
- Novel problem-solving approach
- Creates new interaction paradigms
- Solves real problems in unexpected ways
- Unique mechanics that haven't been seen together
- Bridges different domains creatively

🚀 EXCEPTIONAL SCORES (86-100) - Paradigm Shift:
- Completely new mental model
- Opens up possibilities that didn't exist before
- "Why didn't anyone think of this before?"
- Game-changing approach

EVALUATION CRITERIA:
1. Mechanical Novelty (40%): What unique interactions does this enable?
2. Problem-Solution Fit (30%): Does it solve a real problem in a new way?
3. Differentiation (20%): How different is this from existing solutions?
4. Surprise Factor (10%): Is there an "aha!" moment?

EXAMPLES OF GOOD INNOVATION:
- "AI auto-reviews code + triggers on-chain bounties" = 70-80 (novel automation + incentive mechanism)
- "Reputation system from on-chain verdicts" = 75-85 (new primitive)
- "Prediction markets for code quality" = 65-75 (creative application)

Return ONLY valid JSON:
{
  "score": <number 0-100>,
  "pros": ["unique mechanic 1", "novel approach 2", "creative solution 3"],
  "cons": ["common pattern 1", "seen before 2"],
  "questions": ["differentiation question 1", "unique value question 2"]
}`,

    risk: `You are a risk and ethics analyst evaluating project ideas. Your job is to identify potential harms, vulnerabilities, and ethical concerns - while being pragmatic about manageable risks.

RISK PHILOSOPHY:
- Innovation requires reasonable risk-taking
- Differentiate "edge cases to handle" from "fundamental flaws"
- Consider: "Can this cause real harm?" not just "what could go wrong?"
- Technical complexity is NOT a risk - it's a feasibility concern

SCORING GUIDE (HIGHER = MORE RISKY):
0-20: Minimal risk, straightforward safety measures sufficient
21-40: Low risk, standard security practices apply
41-60: Moderate risk, requires careful design but manageable
61-75: Elevated risk, needs strong safeguards and monitoring
76-90: High risk, serious ethical or security concerns
91-100: Severe risk, likely to cause harm or enable abuse

ACCEPTABLE/MANAGEABLE RISKS (20-50):
- Technical complexity
- Edge case bugs
- Minor privacy considerations (handled by standard practices)
- User adoption uncertainty
- Integration challenges
- Performance issues

MODERATE CONCERNS (51-70):
- Potential for spam/abuse (but mitigatable)
- Financial risks with proper disclosures
- Centralization trade-offs
- Data handling requiring careful design

SERIOUS RISKS (71-100):
- Direct financial harm without protections
- Privacy violations (PII exposure, surveillance)
- Safety risks (physical, mental health)
- Enables illegal activities
- Unethical manipulation
- Discrimination/bias without mitigation
- Child safety concerns

EXAMPLES:
- "AI reviews code, auto-pays bounties" = 35-45 (spam risk, but limits can help)
- "Reputation system from public evaluations" = 25-35 (privacy OK if scores only)
- "Auto-trading bot with user funds" = 75-85 (financial harm risk)
- "Anonymous bounty system with no limits" = 60-70 (spam/abuse concern)

Return ONLY valid JSON:
{
  "score": <number 0-100>,
  "pros": ["safety measure 1", "ethical design 2", "legal compliance 3"],
  "cons": ["risk concern 1", "vulnerability 2", "mitigation needed 3"],
  "questions": ["how will you prevent X?", "what safeguards for Y?"]
}`,
} as const;

/* ─── Helpers ────────────────────────────────────────────────────── */
function sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(err: unknown): boolean {
    if (!(err instanceof Error)) return false;
    return (
        err.message.includes('429') ||
        err.message.toLowerCase().includes('quota') ||
        err.message.toLowerCase().includes('rate limit') ||
        err.message.toLowerCase().includes('too many requests')
    );
}

/**
 * Strip markdown code fences (```json...```) then parse.
 */
function parseAgentJSON(raw: string): AgentResult {
    const stripped = raw
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();

    const parsed = JSON.parse(stripped);

    return {
        score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
        pros: Array.isArray(parsed.pros) ? parsed.pros.map(String) : [],
        cons: Array.isArray(parsed.cons) ? parsed.cons.map(String) : [],
        questions: Array.isArray(parsed.questions) ? parsed.questions.map(String) : [],
    };
}

function computeFinalScore(f: number, i: number, r: number): number {
    // innovation 50% + feasibility 25% + (100-risk) 25%
    return Math.round(i * 0.50 + f * 0.25 + (100 - r) * 0.25);
}

function deriveVerdict(score: number): Verdict {
    if (score >= 70) return 'Ship MVP';
    if (score >= 50) return 'Iterate First';
    return 'Reject - Major Issues';
}

/* ─── Single agent call with retry ──────────────────────────────── */
async function runAgent(
    client: OpenAI,
    agentKey: keyof typeof AGENT_PROMPTS,
    caseText: string,
    attempt = 1
): Promise<AgentResult> {
    try {
        const response = await client.chat.completions.create({
            model: MODEL,
            temperature: 0.7,
            messages: [
                { role: 'system', content: AGENT_PROMPTS[agentKey] },
                { role: 'user', content: caseText },
            ],
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error(`${agentKey} agent returned empty content`);

        return parseAgentJSON(content);

    } catch (err: unknown) {
        // Retry on rate-limit with exponential backoff
        if (isRateLimitError(err) && attempt <= MAX_RETRIES) {
            const delaySec = 10 * attempt; // 10s, 20s
            console.warn(
                `[Agent Jury] ${agentKey}: rate-limit on attempt ${attempt}/${MAX_RETRIES}. Retrying in ${delaySec}s…`
            );
            await sleep(delaySec * 1000);
            return runAgent(client, agentKey, caseText, attempt + 1);
        }

        if (err instanceof SyntaxError) {
            throw new Error(`${agentKey} agent returned malformed JSON.`);
        }

        throw err;
    }
}

/* ─── Route handler ──────────────────────────────────────────────── */
export async function POST(request: NextRequest) {
    // Validate input
    let caseText: string;
    try {
        const body = await request.json();
        caseText = body?.caseText;
        if (!caseText || typeof caseText !== 'string' || !caseText.trim()) {
            return NextResponse.json({ error: 'caseText eksik veya boş.' }, { status: 400 });
        }
    } catch {
        return NextResponse.json({ error: 'Geçersiz JSON gövdesi.' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: 'OPENROUTER_API_KEY environment variable tanımlanmamış.' },
            { status: 500 }
        );
    }

    const client = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey,
        defaultHeaders: {
            'HTTP-Referer': 'http://localhost:3001',
            'X-Title': 'Agent Jury',
        },
    });

    try {
        console.log('[Agent Jury] Running 3 agents in parallel via OpenRouter…');

        const [feasibility, innovation, risk] = await Promise.all([
            runAgent(client, 'feasibility', caseText),
            runAgent(client, 'innovation', caseText),
            runAgent(client, 'risk', caseText),
        ]);

        const finalScore = computeFinalScore(feasibility.score, innovation.score, risk.score);

        console.log(`[Agent Jury] Done. Scores: F=${feasibility.score} I=${innovation.score} R=${risk.score} → Final=${finalScore} (${deriveVerdict(finalScore)})`);

        const result: EvaluateResponse = {
            agents: { feasibility, innovation, risk },
            finalScore,
            verdict: deriveVerdict(finalScore),
        };

        return NextResponse.json(result, { status: 200 });

    } catch (err: unknown) {
        console.error('[/api/evaluate] Error:', err);

        let userMessage: string;
        let httpStatus = 500;

        if (isRateLimitError(err)) {
            userMessage = 'OpenRouter rate limiti aşıldı. Lütfen bir süre bekleyip tekrar deneyin.';
            httpStatus = 429;
        } else if (err instanceof SyntaxError) {
            userMessage = 'Model geçersiz JSON döndürdü. Lütfen tekrar deneyin.';
        } else if (err instanceof Error) {
            userMessage = err.message;
        } else {
            userMessage = 'Beklenmeyen bir hata oluştu.';
        }

        return NextResponse.json({ error: userMessage }, { status: httpStatus });
    }
}
