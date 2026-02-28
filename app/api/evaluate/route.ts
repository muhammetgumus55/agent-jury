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
// OpenRouter passes your request to the underlying provider.
// gpt-4o-mini is cheap, fast, and excellent at structured JSON output.
const MODEL = 'openai/gpt-4o-mini';
const MAX_RETRIES = 2;

/* ─── Agent prompts ──────────────────────────────────────────────── */
const AGENT_PROMPTS = {
    feasibility:
        'You are a feasibility analyst for hackathon projects. Rate 0-100 how achievable this is in 6 hours. ' +
        'Return ONLY valid JSON: {"score": number, "pros": string[], "cons": string[], "questions": string[]}',

    innovation:
        'You are an innovation judge. Rate 0-100 how novel this idea is. ' +
        'Hackathon classics like "voting dApp" score low. ' +
        'Return ONLY valid JSON: {"score": number, "pros": string[], "cons": string[], "questions": string[]}',

    risk:
        'You are a risk analyst. Rate 0-100 the risks (higher = riskier). ' +
        'Return ONLY valid JSON: {"score": number, "pros": string[], "cons": string[], "questions": string[]}',
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
    return Math.round(f * 0.45 + i * 0.35 + (100 - r) * 0.2);
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

    // OpenRouter is fully OpenAI-compatible — just swap the baseURL
    const client = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey,
        defaultHeaders: {
            'HTTP-Referer': 'http://localhost:3001',
            'X-Title': 'Agent Jury',
        },
    });

    try {
        // OpenRouter has much more generous rate limits → run all 3 agents in parallel
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
