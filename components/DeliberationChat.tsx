'use client';

import { useEffect, useRef, useState } from 'react';
import { Brain, Lightbulb, Shield, Gavel } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Types ─────────────────────────────────────────────────────────── */
export interface DeliberationResults {
    feasibility: { score: number; pros: string[]; cons: string[] };
    innovation: { score: number; pros: string[]; cons: string[] };
    risk: { score: number; pros: string[]; cons: string[] };
}

interface ChatMessage {
    id: number;
    agent: 'feasibility' | 'innovation' | 'risk' | 'judge';
    text: string;
    tag?: string; // optional label like "PASS" | "FLAG" | "WARN"
}

/* ─── Agent meta ─────────────────────────────────────────────────────── */
const AGENT_META = {
    feasibility: {
        label: 'FEASIBILITY',
        Icon: Brain,
        accent: '#3b82f6',
        bubble: 'border-blue-500/20 bg-blue-950/30',
        icon: 'bg-blue-950 text-blue-300 border-blue-500/30',
        tagPass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        tagFail: 'bg-slate-800 text-slate-400 border-slate-700',
        dot: 'bg-blue-500',
    },
    innovation: {
        label: 'INNOVATION',
        Icon: Lightbulb,
        accent: '#eab308',
        bubble: 'border-yellow-500/15 bg-yellow-950/20',
        icon: 'bg-yellow-950 text-yellow-300 border-yellow-500/25',
        tagPass: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
        tagFail: 'bg-slate-800 text-slate-400 border-slate-700',
        dot: 'bg-yellow-400',
    },
    risk: {
        label: 'RISK',
        Icon: Shield,
        accent: '#ef4444',
        bubble: 'border-red-500/15 bg-red-950/20',
        icon: 'bg-red-950 text-red-300 border-red-500/25',
        tagPass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
        tagFail: 'bg-red-500/20 text-red-300 border-red-500/30',
        dot: 'bg-red-500',
    },
    judge: {
        label: 'JUDGE',
        Icon: Gavel,
        accent: '#a855f7',
        bubble: 'border-purple-500/25 bg-purple-950/30',
        icon: 'bg-purple-950 text-purple-300 border-purple-500/30',
        tagPass: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        tagFail: 'bg-slate-800 text-slate-400 border-slate-700',
        dot: 'bg-purple-500',
    },
} as const;

/* ─── Dynamic message generator ──────────────────────────────────────── */
function generateMessages(results: DeliberationResults): ChatMessage[] {
    const { feasibility: f, innovation: i, risk: r } = results;
    const finalScore = Math.round(i.score * 0.50 + f.score * 0.25 + (100 - r.score) * 0.25);

    return [
        // Phase 1 – initial analysis
        {
            id: 0, agent: 'feasibility',
            text: f.score >= 70
                ? 'Technical stack looks proven. Scanning integration points and architecture…'
                : f.score >= 50
                    ? 'Architecture shows promise. Running integration analysis — some complexity detected.'
                    : 'Detecting significant technical hurdles. Assessing feasibility ceiling…',
        },
        {
            id: 1, agent: 'innovation',
            text: i.score >= 65
                ? 'Interesting concept geometry — running differentiation scan against known patterns…'
                : i.score >= 40
                    ? 'Familiar pattern signatures detected. Measuring novelty delta against baseline…'
                    : 'High overlap with existing solutions. Evaluating unique value proposition…',
        },
        {
            id: 2, agent: 'risk',
            text: r.score <= 35
                ? 'Ethics and security scan initiated — early signals nominal, no critical flags…'
                : r.score <= 60
                    ? 'Moderate risk signals detected. Running mitigation pathway analysis…'
                    : 'Elevated risk profile confirmed. Initiating deep security and ethics review…',
        },
        // Phase 2 – verdicts with score tag
        {
            id: 3, agent: 'feasibility',
            tag: f.score >= 70 ? 'PASS' : f.score >= 50 ? 'PARTIAL' : 'FLAG',
            text: f.score >= 70
                ? `Score ${f.score}/100. ${f.pros[0] ?? 'Solid technical foundation'}. Integration path is clear.`
                : f.score >= 50
                    ? `Score ${f.score}/100. Feasible with scoping. Key strength: ${f.pros[0] ?? 'workable approach'}.`
                    : `Score ${f.score}/100. Blockers: ${f.cons[0] ?? 'complex implementation'}. Significant compromises needed.`,
        },
        {
            id: 4, agent: 'innovation',
            tag: i.score >= 65 ? 'NOVEL' : i.score >= 40 ? 'INCREMENTAL' : 'COMMON',
            text: i.score >= 65
                ? `Score ${i.score}/100. ${i.pros[0] ?? 'Novel mechanic identified'} — creates differentiated interaction paradigm.`
                : i.score >= 40
                    ? `Score ${i.score}/100. Incremental improvement. ${i.pros[0] ?? 'Familiar patterns present'}.`
                    : `Score ${i.score}/100. ${i.cons[0] ?? 'Well-trodden territory'} with limited differentiation.`,
        },
        {
            id: 5, agent: 'risk',
            tag: r.score <= 35 ? 'SAFE' : r.score <= 60 ? 'MODERATE' : 'ELEVATED',
            text: r.score <= 35
                ? `Risk index ${r.score}/100. Minimal exposure — standard practices sufficient. No critical concerns.`
                : r.score <= 60
                    ? `Risk index ${r.score}/100. Manageable. Primary concern: ${r.cons[0] ?? 'requires careful design'}.`
                    : `Risk index ${r.score}/100. Significant issues: ${r.cons[0] ?? 'requires strong safeguards'}.`,
        },
        // Phase 3 – synthesis
        {
            id: 6, agent: 'judge',
            tag: finalScore >= 70 ? 'VERDICT: SHIP' : finalScore >= 50 ? 'VERDICT: ITERATE' : 'VERDICT: REJECT',
            text: `Weighted synthesis complete. Innovation ×0.50 + Feasibility ×0.25 + Safety ×0.25 → ${finalScore}/100. ${finalScore >= 70
                    ? 'Agents reach consensus: strong candidate. Proceeding to full report.'
                    : finalScore >= 50
                        ? 'Mixed signals. Viable with iteration. Proceeding to full report.'
                        : 'Critical concerns flagged. Significant rework required. Proceeding to full report.'
                }`,
        },
    ];
}

/* ─── Typing indicator ───────────────────────────────────────────────── */
function TypingDots({ agent }: { agent: keyof typeof AGENT_META }) {
    const meta = AGENT_META[agent];
    return (
        <div className="flex items-center gap-3 py-1">
            <div className={cn('w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0', meta.icon)}>
                <meta.Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1 px-3 py-2">
                <span className={cn('w-1.5 h-1.5 rounded-full animate-bounce', meta.dot)} style={{ animationDelay: '0ms' }} />
                <span className={cn('w-1.5 h-1.5 rounded-full animate-bounce', meta.dot)} style={{ animationDelay: '150ms' }} />
                <span className={cn('w-1.5 h-1.5 rounded-full animate-bounce', meta.dot)} style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    );
}

/* ─── Tag badge ──────────────────────────────────────────────────────── */
function TagBadge({ tag, agent }: { tag: string; agent: keyof typeof AGENT_META }) {
    const meta = AGENT_META[agent];
    const isPositive = ['PASS', 'NOVEL', 'SAFE', 'VERDICT: SHIP'].includes(tag);
    const isWarn = ['PARTIAL', 'INCREMENTAL', 'MODERATE', 'VERDICT: ITERATE'].includes(tag);
    return (
        <span className={cn(
            'inline-block text-[9px] font-bold tracking-[0.15em] px-2 py-0.5 rounded border mb-1.5',
            isPositive ? meta.tagPass : isWarn ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20' : meta.tagFail,
        )}>
            {tag}
        </span>
    );
}

/* ─── Single chat row ────────────────────────────────────────────────── */
function ChatRow({ msg }: { msg: ChatMessage }) {
    const meta = AGENT_META[msg.agent];
    return (
        <div className="flex items-start gap-3 animate-[fadeSlideUp_0.3s_ease_both]">
            {/* Agent icon */}
            <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-1">
                <div className={cn('w-8 h-8 rounded-lg border flex items-center justify-center', meta.icon)}>
                    <meta.Icon className="w-3.5 h-3.5" />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold tracking-[0.16em] text-slate-500">{meta.label}</span>
                    {/* accent line */}
                    <div className="flex-1 h-px opacity-20" style={{ background: meta.accent }} />
                </div>
                {msg.tag && <TagBadge tag={msg.tag} agent={msg.agent} />}
                <div className={cn(
                    'text-sm text-slate-300 leading-relaxed px-3.5 py-2.5 rounded-lg border',
                    meta.bubble,
                )}>
                    {msg.text}
                </div>
            </div>
        </div>
    );
}

/* ─── Main component ─────────────────────────────────────────────────── */
interface DeliberationChatProps {
    results: DeliberationResults | null;
    onComplete: () => void;
    onSkip: () => void;
}

const DELAY_MS = 850;
const TYPING_MS = 550;

export default function DeliberationChat({ results, onComplete, onSkip }: DeliberationChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [typingAgent, setTypingAgent] = useState<keyof typeof AGENT_META | null>('feasibility');
    const [done, setDone] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typingAgent]);

    useEffect(() => {
        if (!results) return;
        const allMessages = generateMessages(results);

        function playNext(index: number) {
            if (index >= allMessages.length) {
                setTypingAgent(null);
                setDone(true);
                timerRef.current = setTimeout(onComplete, 700);
                return;
            }
            const msg = allMessages[index];
            setTypingAgent(msg.agent);
            timerRef.current = setTimeout(() => {
                setTypingAgent(null);
                setMessages((prev) => [...prev, msg]);
                timerRef.current = setTimeout(() => playNext(index + 1), DELAY_MS);
            }, TYPING_MS);
        }
        playNext(0);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [results]);

    return (
        <div className="w-full max-w-2xl mx-auto mt-2 mb-8 animate-[fadeSlideUp_0.4s_ease_both]">
            <div className="rounded-2xl border border-white/10 overflow-hidden"
                style={{ background: 'rgba(10,6,30,0.7)', backdropFilter: 'blur(24px)' }}
            >
                {/* Terminal header bar */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/6"
                    style={{ background: 'rgba(255,255,255,0.025)' }}
                >
                    <div className="flex items-center gap-2.5">
                        {/* Traffic lights */}
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 tracking-widest ml-1">
                            AGENT-JURY / DELIBERATION
                        </span>
                    </div>

                    {/* Agent indicators */}
                    <div className="flex items-center gap-3">
                        {(['feasibility', 'innovation', 'risk', 'judge'] as const).map((a) => (
                            <div key={a} className="flex items-center gap-1">
                                <div className={cn('w-1.5 h-1.5 rounded-full transition-all duration-300',
                                    typingAgent === a ? `${AGENT_META[a].dot} shadow-[0_0_6px_currentColor] animate-pulse` : 'bg-slate-700',
                                )} />
                            </div>
                        ))}
                        {!done && (
                            <button
                                onClick={() => { if (timerRef.current) clearTimeout(timerRef.current); onSkip(); }}
                                className="text-[9px] text-slate-600 hover:text-slate-300 transition-colors font-mono tracking-wider border border-white/8 hover:border-white/20 px-2 py-0.5 rounded ml-2"
                            >
                                SKIP ⏭
                            </button>
                        )}
                    </div>
                </div>

                {/* Messages area */}
                <div className="p-4 flex flex-col gap-4 min-h-[160px] max-h-[400px] overflow-y-auto">
                    {!results && messages.length === 0 && (
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600 py-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                            Initializing agent cluster…
                        </div>
                    )}
                    {messages.map((msg) => <ChatRow key={msg.id} msg={msg} />)}
                    {typingAgent && <TypingDots agent={typingAgent} />}
                    <div ref={bottomRef} />
                </div>

                {/* Status footer */}
                <div className="flex items-center gap-2 px-4 py-2 border-t border-white/5 font-mono"
                    style={{ background: 'rgba(255,255,255,0.015)' }}
                >
                    <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0',
                        done ? 'bg-emerald-500' : 'bg-purple-500 animate-pulse',
                    )} />
                    <span className="text-[9px] text-slate-600 tracking-widest">
                        {!results
                            ? 'RUNNING ANALYSIS…'
                            : done
                                ? 'DELIBERATION COMPLETE — RENDERING REPORT'
                                : `MSG ${messages.length}/7  ·  DELIBERATING`}
                    </span>
                    {!done && (
                        <div className="ml-auto flex gap-0.5">
                            {[0, 1, 2].map((n) => (
                                <div key={n} className="w-4 h-0.5 rounded-full bg-purple-500/40 animate-pulse"
                                    style={{ animationDelay: `${n * 200}ms` }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
