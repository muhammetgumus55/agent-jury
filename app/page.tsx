'use client';

import { useState } from 'react';
import { Brain, Lightbulb, Shield, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentCard, AgentConfig, AgentCardData } from '@/components/AgentCard';

/* ─── Agent definitions ───────────────────────────────────────────── */
const AGENTS: AgentConfig[] = [
  {
    id: 'feasibility',
    name: 'Feasibility Agent',
    role: 'Technical & scope assessment',
    Icon: Brain,
    color: 'blue',
  },
  {
    id: 'innovation',
    name: 'Innovation Agent',
    role: 'Novelty & differentiation review',
    Icon: Lightbulb,
    color: 'yellow',
  },
  {
    id: 'risk',
    name: 'Risk Agent',
    role: 'Threat & vulnerability analysis',
    Icon: Shield,
    color: 'red',
  },
];

/* ─── Mock evaluation results ─────────────────────────────────────── */
const MOCK_RESULTS: Record<string, AgentCardData> = {
  feasibility: {
    score: 78,
    pros: ['Quick to build', 'Clear MVP scope'],
    cons: ['Limited features'],
  },
  innovation: {
    score: 65,
    pros: ['Novel approach', 'Good differentiation'],
    cons: ['Seen before'],
  },
  risk: {
    score: 25,
    pros: ['Low security risk'],
    cons: ['Spam potential'],
  },
};

/* ─── Background blobs ────────────────────────────────────────────── */
function BackgroundBlobs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle at center, #7c3aed 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle at center, #2563eb 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle at center, #818cf8 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />
    </div>
  );
}

/* ─── Hero ────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <header className="text-center mb-12 pt-4">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full text-xs font-medium tracking-wider uppercase glass border border-purple-500/30 text-purple-300">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
        AI-Powered Evaluation
      </div>
      <h1 className="text-6xl md:text-7xl font-black mb-4 leading-none tracking-tight">
        <span className="gradient-text">Agent</span>{' '}
        <span className="text-white">Jury</span>
      </h1>
      <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto font-light leading-relaxed">
        AI agents evaluate your idea —{' '}
        <span className="text-slate-300 font-medium">
          debating, scoring, and delivering a final verdict.
        </span>
      </p>
    </header>
  );
}

/* ─── Case input ──────────────────────────────────────────────────── */
interface CaseInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

function CaseInput({ value, onChange, onSubmit, disabled }: CaseInputProps) {
  const isEmpty = value.trim().length === 0;
  const charCount = value.length;
  const maxChars = 2000;

  return (
    <section className="w-full max-w-3xl mx-auto mb-12">
      <div
        className={cn(
          'glass-strong rounded-2xl p-6 transition-all duration-300',
          !isEmpty && 'animate-glow'
        )}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30">
            <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Your Case</h2>
            <p className="text-xs text-slate-500">Describe your idea in detail for the best evaluation</p>
          </div>
        </div>

        <textarea
          id="case-input"
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxChars))}
          placeholder="Enter your project idea, startup concept, or product proposal... The more detail you provide, the more accurate the evaluation."
          rows={8}
          disabled={disabled}
          className={cn(
            'w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed',
            'bg-black/30 border border-white/10 text-slate-200 placeholder-slate-600',
            'transition-all duration-200 focus:border-purple-500/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />

        <div className="flex items-center justify-between mt-4">
          <span className={cn('text-xs tabular-nums transition-colors', charCount > maxChars * 0.9 ? 'text-orange-400' : 'text-slate-600')}>
            {charCount.toLocaleString()} / {maxChars.toLocaleString()}
          </span>
          <button
            id="start-evaluation-btn"
            onClick={onSubmit}
            disabled={isEmpty || disabled}
            aria-disabled={isEmpty || disabled}
            className={cn(
              'relative inline-flex items-center gap-2 px-6 py-2.5 rounded-xl',
              'text-sm font-semibold tracking-wide transition-all duration-200',
              isEmpty || disabled
                ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                : 'text-white cursor-pointer bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 hover:from-purple-500 hover:via-violet-500 hover:to-blue-500 hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 active:translate-y-0 border border-white/10'
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Evaluation
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Loading state ───────────────────────────────────────────────── */
function EvaluationLoading() {
  return (
    <section className="w-full max-w-6xl mx-auto text-center py-16">
      <div className="flex flex-col items-center gap-6">
        {/* Spinner ring */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-white/5" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-blue-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-violet-400 animate-spin [animation-direction:reverse] [animation-duration:0.8s]" />
        </div>

        <div>
          <p className="text-xl font-bold text-white mb-1">Agents Deliberating…</p>
          <p className="text-sm text-slate-500">Your idea is being evaluated by the jury</p>
        </div>

        {/* Agent status pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          {AGENTS.map((agent, i) => (
            <div
              key={agent.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10 text-xs text-slate-400"
              style={{ animationDelay: `${i * 200}ms` }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: `${i * 300}ms` }} />
              <agent.Icon className="w-3 h-3" />
              {agent.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Empty state ─────────────────────────────────────────────────── */
function AgentCardsEmptyState() {
  const placeholderAgents = [
    { emoji: '🧠', label: 'Feasibility Agent' },
    { emoji: '💡', label: 'Innovation Agent' },
    { emoji: '🛡️', label: 'Risk Agent' },
  ];

  return (
    <section className="w-full max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">The Jury</h2>
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-xs text-slate-600 italic">Awaiting your case…</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {placeholderAgents.map((agent) => (
          <div key={agent.label} className="glass rounded-xl p-5 flex items-center gap-4 opacity-35 select-none">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
              {agent.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-300 mb-1">{agent.label}</div>
              <div className="space-y-1.5">
                <div className="h-2 bg-white/10 rounded-full w-3/4" />
                <div className="h-2 bg-white/10 rounded-full w-1/2" />
              </div>
            </div>
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="text-lg">⏳</span>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-10 pb-4">
        <p className="text-slate-600 text-sm">
          Enter your idea above and hit{' '}
          <span className="text-purple-400 font-medium">Start Evaluation</span>{' '}
          to convene the jury.
        </p>
      </div>
    </section>
  );
}

/* ─── Score formula ──────────────────────────────────────────────── */
function computeFinalScore(results: Record<string, AgentCardData>): number {
  const f = results['feasibility']?.score ?? 0;
  const i = results['innovation']?.score ?? 0;
  const r = results['risk']?.score ?? 0;
  return Math.round(f * 0.45 + i * 0.35 + (100 - r) * 0.2);
}

/* ─── Final Verdict ───────────────────────────────────────────────── */
function FinalVerdict({ score }: { score: number }) {
  let Icon: typeof CheckCircle;
  let label: string;
  let iconClass: string;
  let ringClass: string;
  let scoreLabelClass: string;

  if (score >= 70) {
    Icon = CheckCircle;
    label = 'Ship MVP';
    iconClass = 'text-emerald-400';
    ringClass = 'border-emerald-500/30';
    scoreLabelClass = 'text-emerald-400';
  } else if (score >= 50) {
    Icon = AlertCircle;
    label = 'Iterate First';
    iconClass = 'text-yellow-400';
    ringClass = 'border-yellow-500/30';
    scoreLabelClass = 'text-yellow-400';
  } else {
    Icon = XCircle;
    label = 'Reject — Major Issues';
    iconClass = 'text-red-400';
    ringClass = 'border-red-500/30';
    scoreLabelClass = 'text-red-400';
  }

  return (
    <div
      className={cn(
        'w-full max-w-6xl mx-auto mt-4 mb-10 rounded-2xl p-8',
        'bg-gradient-to-br from-purple-950/70 via-blue-950/60 to-purple-950/70',
        'border',
        ringClass,
        'backdrop-blur-xl',
        'animate-[fadeSlideUp_0.5s_ease_both]'
      )}
    >
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Score ring */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <div
            className={cn(
              'flex items-center justify-center w-32 h-32 rounded-full',
              'border-4',
              ringClass,
              'bg-black/30'
            )}
          >
            <div className="text-center">
              <span className="block text-4xl font-black text-white tabular-nums leading-none">
                {score}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ 100</span>
            </div>
          </div>
          <span className={cn('text-xs font-semibold uppercase tracking-wider', scoreLabelClass)}>
            Final Score
          </span>
        </div>

        {/* Verdict text */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <Icon className={cn('w-7 h-7', iconClass)} />
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {label}
            </h2>
          </div>
          <p className="text-sm text-slate-400 max-w-md">
            Based on a weighted evaluation across feasibility (45%), innovation
            (35%), and risk (20%).
          </p>

          {/* Weight breakdown */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { label: 'Feasibility', weight: '45%', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
              { label: 'Innovation', weight: '35%', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
              { label: 'Risk (inv.)', weight: '20%', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
            ].map((w) => (
              <span
                key={w.label}
                className={cn(
                  'inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border',
                  w.color
                )}
              >
                <span className="font-semibold">{w.weight}</span>
                <span className="text-slate-500">{w.label}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Save On-Chain button */}
        <div className="flex-shrink-0">
          <button
            id="save-onchain-btn"
            disabled
            aria-disabled="true"
            title="On-chain saving coming soon"
            className={cn(
              'inline-flex flex-col items-center gap-1.5 px-6 py-4 rounded-xl',
              'border border-emerald-500/20 bg-emerald-500/5',
              'text-emerald-700 cursor-not-allowed select-none',
              'transition-all duration-200'
            )}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="text-xs font-semibold">Save Verdict On-Chain</span>
            <span className="text-[10px] text-emerald-900/60">Coming soon</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Results grid ────────────────────────────────────────────────── */
function ResultsGrid({ results, finalScore }: { results: Record<string, AgentCardData>; finalScore: number }) {
  return (
    <section className="w-full max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Evaluation</h2>
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-xs text-emerald-500 font-medium">✓ Evaluation complete</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {AGENTS.map((agent, i) => {
          const data = results[agent.id];
          return data ? (
            <AgentCard key={agent.id} config={agent} data={data} index={i} />
          ) : null;
        })}
      </div>

      <FinalVerdict score={finalScore} />

      {/* Evaluate again button */}
      <div className="text-center pb-8">
        <button
          id="reset-btn"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm text-slate-400 border border-white/10 glass hover:text-white hover:border-white/20 transition-all duration-200"
        >
          ↩ Evaluate a new idea
        </button>
      </div>
    </section>
  );
}

/* ─── Page root ───────────────────────────────────────────────────── */
type Status = 'idle' | 'loading' | 'done';

export default function HomePage() {
  const [caseText, setCaseText] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [results, setResults] = useState<Record<string, AgentCardData> | null>(null);

  async function handleSubmit() {
    if (!caseText.trim()) return;
    setStatus('loading');
    await new Promise((r) => setTimeout(r, 2500));
    setResults(MOCK_RESULTS);
    setStatus('done');
  }

  const finalScore = results ? computeFinalScore(results) : 0;

  return (
    <main className="relative min-h-screen px-4 py-16 md:py-24">
      <BackgroundBlobs />
      <div className="relative z-10 flex flex-col items-center">
        <Hero />
        <CaseInput
          value={caseText}
          onChange={setCaseText}
          onSubmit={handleSubmit}
          disabled={status === 'loading' || status === 'done'}
        />

        {status === 'idle' && <AgentCardsEmptyState />}
        {status === 'loading' && <EvaluationLoading />}
        {status === 'done' && results && (
          <ResultsGrid results={results} finalScore={finalScore} />
        )}
      </div>
    </main>
  );
}
