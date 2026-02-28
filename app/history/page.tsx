'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, AlertCircle, XCircle, ArrowLeft, Clock, User, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVerdictHistory, VerdictRecord } from '@/lib/contract';

/* ─── Background blobs (reused from main page) ───────────────────────── */
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

function VerdictIcon({ score }: { score: number }) {
    if (score >= 70) return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    if (score >= 50) return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    return <XCircle className="w-5 h-5 text-red-400" />;
}

/* ─── Single verdict card ───────────────────────────────────────────── */
function VerdictCard({ v, index }: { v: VerdictRecord; index: number }) {
    return (
        <div
            className={cn(
                'relative rounded-2xl p-6 border border-white/10 glass',
                'bg-gradient-to-br from-white/[0.04] to-white/[0.01]',
                'hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300',
                'animate-[fadeSlideUp_0.4s_ease_both]',
            )}
            style={{ animationDelay: `${index * 60}ms` }}
        >
            {/* Header row */}
            <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                    {/* Score circle */}
                    <div
                        className={cn(
                            'flex items-center justify-center w-14 h-14 rounded-full border-2 bg-black/30 flex-shrink-0',
                            v.finalScore >= 70
                                ? 'border-emerald-500/60'
                                : v.finalScore >= 50
                                    ? 'border-yellow-500/60'
                                    : 'border-red-500/60',
                        )}
                    >
                        <span className={cn('text-xl font-black tabular-nums', scoreColor(v.finalScore))}>
                            {v.finalScore}
                        </span>
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <VerdictIcon score={v.finalScore} />
                            <span className="font-bold text-white text-sm">{v.shortVerdict}</span>
                        </div>
                        <span className="text-[11px] text-slate-500">/ 100 final score</span>
                    </div>
                </div>

                {/* On-chain id badge */}
                <span className="text-[10px] font-mono text-slate-600 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                    #{v.id.toString()}
                </span>
            </div>

            {/* Agent scores grid */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                    { label: 'Feasibility', score: v.feasibility, color: 'text-blue-400', bar: 'bg-blue-500' },
                    { label: 'Innovation', score: v.innovation, color: 'text-yellow-400', bar: 'bg-yellow-500' },
                    { label: 'Risk', score: v.risk, color: 'text-red-400', bar: 'bg-red-500' },
                ].map((a) => (
                    <div
                        key={a.label}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.03] border border-white/5"
                    >
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{a.label}</span>
                        <span className={cn('text-lg font-black tabular-nums', a.color)}>{a.score}</span>
                        {/* Mini progress bar */}
                        <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                            <div
                                className={cn('h-full rounded-full transition-all duration-500', a.bar)}
                                style={{ width: `${a.score}%`, opacity: 0.7 }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer: submitter + timestamp */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <User className="w-3 h-3" />
                    <a
                        href={`https://testnet.monadexplorer.com/address/${v.submitter}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono hover:text-slate-300 transition-colors"
                    >
                        {shortAddress(v.submitter)}
                    </a>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{v.formattedTime}</span>
                </div>
            </div>
        </div>
    );
}

/* ─── Loading skeleton ───────────────────────────────────────────────── */
function Skeleton() {
    return (
        <div className="rounded-2xl p-6 border border-white/10 bg-white/[0.03] animate-pulse">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 rounded-full bg-white/10" />
                <div className="space-y-2">
                    <div className="h-4 w-28 bg-white/10 rounded" />
                    <div className="h-3 w-16 bg-white/5 rounded" />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-5">
                {[0, 1, 2].map((i) => <div key={i} className="h-20 rounded-xl bg-white/5" />)}
            </div>
            <div className="h-3 w-full bg-white/5 rounded" />
        </div>
    );
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function HistoryPage() {
    const [verdicts, setVerdicts] = useState<VerdictRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const data = await getVerdictHistory();
            setVerdicts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    return (
        <main className="relative min-h-screen px-4 py-16 md:py-20">
            <BackgroundBlobs />

            <div className="relative z-10 max-w-5xl mx-auto">
                {/* Page header */}
                <div className="flex items-center justify-between mb-10">
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
                        <p className="text-sm text-slate-500 mt-1">Last 10 on-chain evaluations</p>
                    </div>

                    <button
                        onClick={load}
                        disabled={loading}
                        title="Refresh"
                        className="p-2.5 rounded-xl border border-white/10 glass text-slate-400 hover:text-white hover:border-white/20 transition-all duration-200 disabled:opacity-40"
                    >
                        <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                    </button>
                </div>

                {/* Error state */}
                {error && (
                    <div className="mb-8 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                        ⚠ {error}
                    </div>
                )}

                {/* Verdict grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)}
                    </div>
                ) : verdicts.length === 0 ? (
                    <div className="text-center py-24 text-slate-600">
                        <p className="text-2xl mb-2">📭</p>
                        <p className="text-sm">No verdicts saved on-chain yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {verdicts.map((v, i) => (
                            <VerdictCard key={v.id.toString()} v={v} index={i} />
                        ))}
                    </div>
                )}

                {/* Back button */}
                <div className="mt-12 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-slate-400 border border-white/10 glass hover:text-white hover:border-white/20 transition-all duration-200"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Jury
                    </Link>
                </div>
            </div>
        </main>
    );
}
