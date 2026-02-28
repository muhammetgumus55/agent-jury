/**
 * Shared TypeScript types for Agent Jury
 */

export type Verdict = 'approve' | 'reject' | 'neutral';

export interface Agent {
    id: string;
    name: string;
    role: string;
    avatar: string; // emoji or icon identifier
    specialty: string;
}

export interface AgentEvaluation {
    agentId: string;
    verdict: Verdict;
    score: number; // 0–100
    summary: string;
    reasoning: string[];
    confidence: number; // 0–100
}

export interface EvaluationSession {
    id: string;
    caseText: string;
    status: 'idle' | 'evaluating' | 'complete' | 'error';
    evaluations: AgentEvaluation[];
    finalVerdict?: Verdict;
    createdAt: Date;
}
