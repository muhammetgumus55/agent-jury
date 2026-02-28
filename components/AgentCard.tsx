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
    /** Tailwind color token, e.g. "blue", "yellow", "red" */
    color: 'blue' | 'yellow' | 'red';
}

interface AgentCardProps {
    config: AgentConfig;
    data: AgentCardData;
    /** Stagger animation index */
    index?: number;
}

/* ─── Color maps ─────────────────────────────────────────────────── */
const COLOR = {
    blue: {
        gradient: 'from-blue-950/80 via-blue-900/40 to-blue-950/80',
        border: 'border-blue-500/25',
        iconBg: 'bg-blue-500/15',
        iconText: 'text-blue-400',
        glow: 'hover:shadow-blue-500/20',
        bar: 'from-blue-500 to-cyan-400',
        barBg: 'bg-blue-950/60',
        badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    },
    yellow: {
        gradient: 'from-yellow-950/80 via-amber-900/40 to-yellow-950/80',
        border: 'border-yellow-500/25',
        iconBg: 'bg-yellow-500/15',
        iconText: 'text-yellow-400',
        glow: 'hover:shadow-yellow-500/20',
        bar: 'from-yellow-500 to-amber-400',
        barBg: 'bg-yellow-950/60',
        badge: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    },
    red: {
        gradient: 'from-red-950/80 via-red-900/40 to-red-950/80',
        border: 'border-red-500/25',
        iconBg: 'bg-red-500/15',
        iconText: 'text-red-400',
        glow: 'hover:shadow-red-500/20',
        bar: 'from-red-500 to-rose-400',
        barBg: 'bg-red-950/60',
        badge: 'bg-red-500/15 text-red-300 border-red-500/30',
    },
} as const;

/* ─── Score ring helper ──────────────────────────────────────────── */
function getScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 45) return 'Fair';
    return 'Risky';
}

/* ─── AgentCard ─────────────────────────────────────────────────── */
export function AgentCard({ config, data, index = 0 }: AgentCardProps) {
    const c = COLOR[config.color];
    const { Icon } = config;
    const visiblePros = data.pros.slice(0, 2);
    const visibleCons = data.cons.slice(0, 2);

    return (
        <article
            className={cn(
                'relative rounded-2xl p-5 flex flex-col gap-4',
                'bg-gradient-to-br',
                c.gradient,
                'border',
                c.border,
                'backdrop-blur-xl',
                'transition-all duration-300',
                'hover:shadow-xl',
                c.glow,
                'hover:-translate-y-1',
                'animate-[fadeSlideUp_0.4s_ease_both]'
            )}
            style={{ animationDelay: `${index * 120}ms` }}
        >
            {/* ── Header ── */}
            <div className="flex items-center gap-3">
                <div
                    className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-xl shrink-0',
                        c.iconBg
                    )}
                >
                    <Icon className={cn('w-5 h-5', c.iconText)} />
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white leading-tight">
                        {config.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{config.role}</p>
                </div>
                {/* Score badge */}
                <span
                    className={cn(
                        'ml-auto shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border',
                        c.badge
                    )}
                >
                    {getScoreLabel(data.score)}
                </span>
            </div>

            {/* ── Score display ── */}
            <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                    <span className="text-4xl font-black text-white tabular-nums">
                        {data.score}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">/ 100</span>
                </div>

                {/* Progress bar */}
                <div className={cn('w-full h-2 rounded-full overflow-hidden', c.barBg)}>
                    <div
                        className={cn(
                            'h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out',
                            c.bar
                        )}
                        style={{ width: `${data.score}%` }}
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
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Pros
                    </p>
                    <ul className="space-y-1.5">
                        {visiblePros.map((pro) => (
                            <li key={pro} className="flex items-start gap-2 text-xs text-slate-300">
                                <span className="mt-px text-emerald-400 shrink-0">✓</span>
                                {pro}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ── Cons ── */}
            {visibleCons.length > 0 && (
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Cons
                    </p>
                    <ul className="space-y-1.5">
                        {visibleCons.map((con) => (
                            <li key={con} className="flex items-start gap-2 text-xs text-slate-300">
                                <span className="mt-px text-red-400 shrink-0">✗</span>
                                {con}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </article>
    );
}
