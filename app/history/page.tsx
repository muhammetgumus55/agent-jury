'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
    CheckCircle, AlertCircle, XCircle,
    ArrowLeft, Clock, User, RefreshCw,
    ChevronDown, Brain, Lightbulb, Shield, ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVerdictHistory, VerdictRecord } from '@/lib/contract';
import Footer from '@/components/Footer';

/* ─── Background blobs ───────────────────────────────────────────────── */
function BackgroundBlobs() {
    return (
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
            <div
                className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30"
                style={{ background: 'radial-gradient(circle at center, #7c3aed 0%, transparent 70%)', filter: 'blur(60px)' }}
            />
            <div
                className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle at center, #2563eb 0%, transparent 70%)', filter: 'blur(80px)' }}
            />
        </div>
    );
}

/* ─── Helpers ───────────────────────────────────────────────────────── */
function shortAddress(addr: string): string {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function scoreColor(score: number): string {
    if (score >= 70) return 'text-emerald-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
}

function scoreBorderColor(score: number): string {
    if (score >= 70) return 'border-emerald-500/60';
    if (score >= 50) return 'border-yellow-500/60';
    return 'border-red-500/60';
}

function VerdictIcon({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' }) {
    const cls = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    if (score >= 70) return <CheckCircle className={cn(cls, 'text-emerald-400')} />;
    if (score >= 50) return <AlertCircle className={cn(cls, 'text-yellow-400')} />;
    return <XCircle className={cn(cls, 'text-red-400')} />;
}

/* ─── Agent score row (inside expanded detail) ───────────────────────── */
const AGENT_META = [
    {
        id: 'feasibility',
        label: 'Feasibility',
        Icon: Brain,
        color: 'text-blue-400',
        bar: 'bg-blue-500',
        border: 'border-blue-500/20',
        bg: 'bg-blue-500/5',
        weight: '25%',
        description: 'How achievable is this idea within hackathon constraints?',
    },
    {
        id: 'innovation',
        label: 'Innovation',
        Icon: Lightbulb,
        color: 'text-yellow-400',
        bar: 'bg-yellow-500',
        border: 'border-yellow-500/20',
        bg: 'bg-yellow-500/5',
        weight: '50%',
        description: 'How novel and differentiated is this idea?',
    },
    {
        id: 'risk',
        label: 'Risk',
        Icon: Shield,
        color: 'text-red-400',
        bar: 'bg-red-500',
        border: 'border-red-500/20',
        bg: 'bg-red-500/5',
        weight: '25% (inverted)',
        description: 'Technical / market risk (higher = riskier).',
    },
];

/* ─── Single verdict card ───────────────────────────────────────────── */
function VerdictCard({ v, index }: { v: VerdictRecord; index: number }) {
    const [expanded, setExpanded] = useState(false);

    const scores: Record<string, number> = {
        feasibility: v.feasibility,
        innovation: v.innovation,
        risk: v.risk,
    };

    return (
        <div
            className={cn(
                'rounded-2xl border glass transition-all duration-300',
                'bg-gradient-to-br from-white/[0.04] to-white/[0.01]',
                expanded ? 'border-white/20 shadow-lg shadow-purple-900/20' : 'border-white/10 hover:border-white/18',
                'animate-[fadeSlideUp_0.4s_ease_both]',
            )}
            style={{ animationDelay: `${index * 60}ms` }}
        >
            {/* ── Clickable summary row ── */}
            <button
                onClick={() => setExpanded((prev) => !prev)}
                className="w-full text-left p-5 flex items-center gap-4 group cursor-pointer"
                aria-expanded={expanded}
            >
                {/* Score circle */}
                <div
                    className={cn(
                        'flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full border-2 bg-black/30',
                        scoreBorderColor(v.finalScore),
                    )}
                >
                    <span className={cn('text-xl font-black tabular-nums', scoreColor(v.finalScore))}>
                        {v.finalScore}
                    </span>
                </div>

                {/* Verdict text + id */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <VerdictIcon score={v.finalScore} size="sm" />
                        <span className="font-bold text-white text-sm truncate">{v.shortVerdict}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500">
                            <span className="text-blue-400 font-mono">{v.feasibility}</span>
                            <span className="text-slate-700 mx-1">/</span>
                            <span className="text-yellow-400 font-mono">{v.innovation}</span>
                            <span className="text-slate-700 mx-1">/</span>
                            <span className="text-red-400 font-mono">{v.risk}</span>
                            <span className="text-slate-600 ml-1">F / I / R</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-600 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-full">
                            #{v.id.toString()}
                        </span>
                    </div>
                </div>

                {/* Timestamp */}
                <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{v.formattedTime}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-600">
                        <User className="w-3 h-3" />
                        <span className="font-mono">{shortAddress(v.submitter)}</span>
                    </div>
                </div>

                {/* Expand chevron */}
                <ChevronDown
                    className={cn(
                        'w-4 h-4 text-slate-500 flex-shrink-0 transition-transform duration-300',
                        expanded && 'rotate-180',
                    )}
                />
            </button>

            {/* ── Expanded detail panel ── */}
            {expanded && (
                <div className="px-5 pb-5 border-t border-white/5 animate-[fadeSlideUp_0.25s_ease_both]">
                    <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest mt-4 mb-3">
                        Agent Scores
                    </p>

                    <div className="flex flex-col gap-3 mb-4">
                        {AGENT_META.map((a) => {
                            const score = scores[a.id];
                            return (
                                <div
                                    key={a.id}
                                    className={cn(
                                        'flex items-center gap-3 p-3 rounded-xl border',
                                        a.border, a.bg,
                                    )}
                                >
                                    {/* Icon */}
                                    <a.Icon className={cn('w-4 h-4 flex-shrink-0', a.color)} />

                                    {/* Label + description */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-xs font-bold text-white">{a.label}</span>
                                            <span className="text-[10px] text-slate-600">weight {a.weight}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{a.description}</p>

                                        {/* Progress bar */}
                                        <div className="mt-2 w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                                            <div
                                                className={cn('h-full rounded-full', a.bar)}
                                                style={{ width: `${score}%`, opacity: 0.75 }}
                                            />
                                        </div>
                                    </div>

                                    {/* Score number */}
                                    <span className={cn('text-xl font-black tabular-nums flex-shrink-0', a.color)}>
                                        {score}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Weight formula */}
                    <div className="flex flex-wrap items-center gap-2 mb-4 text-[10px] text-slate-600">
                        <span>Final =</span>
                        <span className="text-yellow-400">I×0.50</span>
                        <span>+</span>
                        <span className="text-blue-400">F×0.25</span>
                        <span>+</span>
                        <span className="text-red-400">(100−R)×0.25</span>
                        <span>=</span>
                        <span className={cn('font-black text-sm', scoreColor(v.finalScore))}>{v.finalScore}</span>
                    </div>

                    {/* Mobile timestamp + submitter */}
                    <div className="flex items-center justify-between sm:hidden mb-4 text-[10px] text-slate-600">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{v.formattedTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span className="font-mono">{shortAddress(v.submitter)}</span>
                        </div>
                    </div>

                    {/* Explorer link */}
                    <a
                        href={`https://testnet.monadexplorer.com/address/${v.submitter}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-purple-500 hover:text-purple-300 transition-colors"
                    >
                        <ExternalLink className="w-3 h-3" />
                        View submitter on Monad Explorer
                    </a>
                </div>
            )}
        </div>
    );
}

/* ─── Loading skeleton ───────────────────────────────────────────────── */
function Skeleton() {
    return (
        <div className="rounded-2xl p-5 border border-white/10 bg-white/[0.03] animate-pulse">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-white/10 rounded" />
                    <div className="h-3 w-24 bg-white/5 rounded" />
                </div>
                <div className="w-4 h-4 rounded bg-white/5" />
            </div>
        </div>
    );
}

/* ─── Sort options ───────────────────────────────────────────────────── */
type SortKey = 'newest' | 'oldest' | 'best' | 'worst';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'newest', label: '🕐 Newest first' },
    { key: 'oldest', label: '🕰 Oldest first' },
    { key: 'best', label: '🏆 Best score' },
    { key: 'worst', label: '📉 Worst score' },
];

function sortVerdicts(list: VerdictRecord[], key: SortKey): VerdictRecord[] {
    const copy = [...list];
    switch (key) {
        case 'newest': return copy.sort((a, b) => Number(b.timestamp - a.timestamp));
        case 'oldest': return copy.sort((a, b) => Number(a.timestamp - b.timestamp));
        case 'best': return copy.sort((a, b) => b.finalScore - a.finalScore);
        case 'worst': return copy.sort((a, b) => a.finalScore - b.finalScore);
    }
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function HistoryPage() {
    const [verdicts, setVerdicts] = useState<VerdictRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortKey, setSortKey] = useState<SortKey>('newest');

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const data = await getVerdictHistory();
            setVerdicts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    const sorted = useMemo(() => sortVerdicts(verdicts, sortKey), [verdicts, sortKey]);

    return (
        <main className="relative min-h-screen px-4 py-16 md:py-20">
            <BackgroundBlobs />

            <div className="relative z-10 max-w-4xl mx-auto">

                {/* Page header */}
                <div className="flex items-start justify-between mb-8 gap-4">
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">
                            Monad Testnet
                        </p>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                            Verdict{' '}
                            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                History
                            </span>
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Last 10 on-chain evaluations — click a card to expand</p>
                    </div>

                    <button
                        onClick={load}
                        disabled={loading}
                        title="Refresh"
                        className="p-2.5 rounded-xl border border-white/10 glass text-slate-400 hover:text-white hover:border-white/20 transition-all duration-200 disabled:opacity-40 btn-press mt-1"
                    >
                        <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                    </button>
                </div>

                {/* Sort toolbar */}
                {!loading && verdicts.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                        <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mr-1">Sort:</span>
                        {SORT_OPTIONS.map((opt) => (
                            <button
                                key={opt.key}
                                onClick={() => setSortKey(opt.key)}
                                className={cn(
                                    'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150 btn-press',
                                    sortKey === opt.key
                                        ? 'bg-purple-600/30 border-purple-500/50 text-purple-300'
                                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:border-white/20',
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className="mb-6 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm flex items-center gap-2">
                        <XCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                        <button onClick={load} className="ml-auto text-xs underline hover:text-red-300">
                            Retry
                        </button>
                    </div>
                )}

                {/* Verdict list */}
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)}
                    </div>
                ) : sorted.length === 0 ? (
                    <div className="text-center py-24 text-slate-600">
                        <p className="text-2xl mb-2">📭</p>
                        <p className="text-sm">No verdicts saved on-chain yet.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {sorted.map((v, i) => (
                            <VerdictCard key={v.id.toString()} v={v} index={i} />
                        ))}
                    </div>
                )}

                {/* Back button */}
                <div className="mt-12 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-slate-400 border border-white/10 glass hover:text-white hover:border-white/20 transition-all duration-200 btn-press"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Jury
                    </Link>
                </div>
            </div>

            <Footer />
        </main>
    );
}
