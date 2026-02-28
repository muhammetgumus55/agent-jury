'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Types ──────────────────────────────────────────────────────── */
export interface AgentCardData {
    score: number;
    pros: string[];
    cons: string[];
}

export interface AgentConfig {
    id: string;
    name: string;
    role: string;
    Icon: LucideIcon;
    color: 'blue' | 'yellow' | 'red';
}

interface AgentCardProps {
    config: AgentConfig;
    data: AgentCardData;
    index?: number;
    loading?: boolean;
}

/* ─── Score label ────────────────────────────────────────────────── */
function getScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 45) return 'Fair';
    return 'Poor';
}

/* ─── AgentCard ─────────────────────────────────────────────────── */
export function AgentCard({ config, data, index = 0, loading = false }: AgentCardProps) {
    const { Icon } = config;
    const visiblePros = data.pros.slice(0, 2);
    const visibleCons = data.cons.slice(0, 2);

    return (
        <article
            className={cn(
                'relative rounded-2xl p-5 flex flex-col gap-4',
                'bg-[#111111] border border-gray-800',
                'transition-all duration-300',
                'hover:shadow-xl hover:shadow-white/5 hover:-translate-y-1',
                loading && 'border-pulse',
                'animate-[fadeSlideUp_0.4s_ease_both]',
            )}
            style={{ animationDelay: `${index * 120}ms` }}
        >
            {/* Top accent line */}
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* ── Header ── */}
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 bg-white/5 border border-white/10">
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white leading-tight">{config.name}</h3>
                    <p className="text-xs text-gray-600 mt-0.5">{config.role}</p>
                </div>
                {/* Score badge */}
                <span className="ml-auto shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border border-gray-700 text-gray-400 bg-black/40">
                    {getScoreLabel(data.score)}
                </span>
            </div>

            {/* ── Score display ── */}
            <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1.5 bg-black rounded-xl px-3 py-1.5">
                        <span className="text-5xl font-extrabold text-white tabular-nums leading-none">
                            {data.score}
                        </span>
                        <span className="text-sm text-gray-600 font-medium">/100</span>
                    </div>
                </div>

                {/* Progress bar — monochrome */}
                <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/5">
                    <div
                        className="h-full rounded-full bg-white transition-all duration-700 ease-out"
                        style={{ width: `${data.score}%`, opacity: data.score >= 50 ? 0.85 : 0.35 }}
                        role="progressbar"
                        aria-valuenow={data.score}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    />
                </div>
            </div>

            {/* ── Divider ── */}
            <div className="h-px bg-white/5" />

            {/* ── Pros ── */}
            {visiblePros.length > 0 && (
                <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Pros</p>
                    <ul className="space-y-1.5">
                        {visiblePros.map((pro) => (
                            <li key={pro} className="flex items-start gap-2 text-xs text-gray-400">
                                <span className="mt-px text-white/60 shrink-0">+</span>
                                {pro}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ── Cons ── */}
            {visibleCons.length > 0 && (
                <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Cons</p>
                    <ul className="space-y-1.5">
                        {visibleCons.map((con) => (
                            <li key={con} className="flex items-start gap-2 text-xs text-gray-400">
                                <span className="mt-px text-white/30 shrink-0">−</span>
                                {con}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </article>
    );
}
