import { GoogleGenerativeAI } from '@google/generative-ai';
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

/* ─── Agent prompt definitions ────────────────────────────────────── */
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

/* ─── Helpers ─────────────────────────────────────────────────────── */

/**
 * Strip markdown code fences (```json ... ``` or ``` ... ```) then parse.
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
        questions: Array.isArray(parsed.questions)
            ? parsed.questions.map(String)
            : [],
    };
}

function computeFinalScore(
    feasibility: number,
    innovation: number,
    risk: number
): number {
    return Math.round(
        feasibility * 0.45 + innovation * 0.35 + (100 - risk) * 0.2
    );
}

function deriveVerdict(score: number): Verdict {
    if (score >= 70) return 'Ship MVP';
    if (score >= 50) return 'Iterate First';
    return 'Reject - Major Issues';
}

/* ─── Single agent call ───────────────────────────────────────────── */
async function runAgent(
    genAI: GoogleGenerativeAI,
    agentKey: keyof typeof AGENT_PROMPTS,
    caseText: string
): Promise<AgentResult> {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: AGENT_PROMPTS[agentKey],
        generationConfig: { temperature: 0.7 },
    });

    const result = await model.generateContent(caseText);
    const content = result.response.text();

    if (!content) {
        throw new Error(`${agentKey} agent returned empty content`);
    }

    return parseAgentJSON(content);
}

/* ─── Route handler ───────────────────────────────────────────────── */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const caseText: string = body?.caseText;

        if (!caseText || typeof caseText !== 'string' || !caseText.trim()) {
            return NextResponse.json(
                { error: 'Missing or empty caseText in request body.' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'GEMINI_API_KEY environment variable is not set.' },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Run all 3 agents in parallel
        const [feasibility, innovation, risk] = await Promise.all([
            runAgent(genAI, 'feasibility', caseText),
            runAgent(genAI, 'innovation', caseText),
            runAgent(genAI, 'risk', caseText),
        ]);

        const finalScore = computeFinalScore(
            feasibility.score,
            innovation.score,
            risk.score
        );

        const result: EvaluateResponse = {
            agents: { feasibility, innovation, risk },
            finalScore,
            verdict: deriveVerdict(finalScore),
        };

        return NextResponse.json(result, { status: 200 });
    } catch (error: unknown) {
        console.error('[/api/evaluate] Error:', error);

        const message =
            error instanceof SyntaxError
                ? 'Failed to parse agent JSON response. The model may have returned malformed output.'
                : error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred.';

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
