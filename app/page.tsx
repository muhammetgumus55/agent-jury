'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Brain, Lightbulb, Shield, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentCard, AgentConfig, AgentCardData } from '@/components/AgentCard';
import { saveVerdictToChain, EvalResults } from '@/lib/contract';

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

/* ─── Case input ─────────────────────────────────────────────────── */
const MIN_CHARS = 20;

interface CaseInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

function CaseInput({ value, onChange, onSubmit, disabled }: CaseInputProps) {
  const trimmed = value.trim();
  const charCount = value.length;
  const maxChars = 2000;
  const tooShort = trimmed.length > 0 && trimmed.length < MIN_CHARS;
  const isValid = trimmed.length >= MIN_CHARS;

  return (
    <section className="w-full max-w-3xl mx-auto mb-12">
      <div
        className={cn(
          'glass-strong rounded-2xl p-6 transition-all duration-300',
          isValid && 'animate-glow'
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
            'bg-black/30 border text-slate-200 placeholder-slate-600',
            'transition-all duration-200 focus:border-purple-500/50',
            tooShort ? 'border-orange-500/50' : 'border-white/10',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />

        {/* Validation hint */}
        <div className="flex items-center justify-between mt-2 min-h-[20px]">
          {tooShort ? (
            <p className="text-xs text-orange-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              En az {MIN_CHARS} karakter gerekli ({MIN_CHARS - trimmed.length} karakter daha)
            </p>
          ) : (
            <span />
          )}
          <span className={cn(
            'text-xs tabular-nums transition-colors',
            charCount > maxChars * 0.9 ? 'text-orange-400' : 'text-slate-600'
          )}>
            {charCount.toLocaleString()} / {maxChars.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-end mt-3">
          <button
            id="start-evaluation-btn"
            onClick={onSubmit}
            disabled={!isValid || disabled}
            aria-disabled={!isValid || disabled}
            className={cn(
              'relative inline-flex items-center gap-2 px-6 py-2.5 rounded-xl',
              'text-sm font-semibold tracking-wide transition-all duration-200',
              !isValid || disabled
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
interface FinalVerdictProps {
  score: number;
  caseText: string;
  results: EvalResults;
  shortVerdict: string;
}

function FinalVerdict({ score, caseText, results, shortVerdict }: FinalVerdictProps) {
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
        <SaveOnChainButton
          caseText={caseText}
          results={results}
          finalScore={score}
          shortVerdict={shortVerdict}
        />
      </div>
    </div>
  );
}

/* ─── SaveOnChainButton ─────────────────────────────────────────────── */
type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

interface SaveOnChainButtonProps {
  caseText: string;
  results: EvalResults;
  finalScore: number;
  shortVerdict: string;
}

function SaveOnChainButton({ caseText, results, finalScore, shortVerdict }: SaveOnChainButtonProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSave() {
    setSaveStatus('saving');
    setSaveError(null);
    try {
      const { txHash: hash } = await saveVerdictToChain(caseText, results, finalScore, shortVerdict);
      setTxHash(hash);
      setSaveStatus('success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      // User rejected the tx
      if (msg.includes('rejected') || msg.includes('denied') || msg.includes('user rejected')) {
        setSaveError('İşlem reddedildi.');
      } else if (msg.includes('insufficient') || msg.includes('Insufficient')) {
        setSaveError('Yetersiz MON bakiyesi.');
      } else {
        setSaveError(msg);
      }
      setSaveStatus('error');
    }
  }

  if (saveStatus === 'success' && txHash) {
    return (
      <div className="flex-shrink-0 flex flex-col items-center gap-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
          <CheckCircle className="w-4 h-4" />
          Zincire kaydedildi!
        </div>
        <a
          href={`https://testnet.monadexplorer.com/tx/${txHash}`}
          target="_blank"
          rel="noreferrer"
          className="text-[10px] text-emerald-600 hover:text-emerald-400 underline font-mono truncate max-w-[160px]"
          title={txHash}
        >
          {txHash.slice(0, 10)}…{txHash.slice(-8)}
        </a>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
      <button
        id="save-onchain-btn"
        onClick={handleSave}
        disabled={saveStatus === 'saving'}
        className={cn(
          'inline-flex flex-col items-center gap-1.5 px-6 py-4 rounded-xl',
          'border transition-all duration-200',
          saveStatus === 'saving'
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 cursor-wait'
            : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/60 cursor-pointer'
        )}
      >
        {saveStatus === 'saving' ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )}
        <span className="text-xs font-semibold">
          {saveStatus === 'saving' ? 'Kaydediliyor…' : 'Save Verdict On-Chain'}
        </span>
        <span className="text-[10px] opacity-60">Monad Testnet</span>
      </button>
      {saveStatus === 'error' && saveError && (
        <p className="text-[10px] text-red-400 max-w-[160px] text-center">{saveError}</p>
      )}
    </div>
  );
}

/* ─── Results grid (staggered reveal) ─────────────────────────────────── */
// revealed: 0=none, 1=feasibility, 2=innovation, 3=risk, 4=verdict
function ResultsGrid({
  results,
  finalScore,
  caseText,
}: {
  results: Record<string, AgentCardData>;
  finalScore: number;
  caseText: string;
}) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    // Reset then stagger-reveal each piece
    setRevealed(0);
    const timers = [
      setTimeout(() => setRevealed(1), 500),
      setTimeout(() => setRevealed(2), 1000),
      setTimeout(() => setRevealed(3), 1500),
      setTimeout(() => setRevealed(4), 2000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const agentOrder = ['feasibility', 'innovation', 'risk'] as const;

  return (
    <section className="w-full max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Evaluation</h2>
        <div className="flex-1 h-px bg-white/5" />
        {revealed >= 4 && (
          <span className="text-xs text-emerald-500 font-medium animate-[fadeSlideUp_0.3s_ease_both]">
            ✓ Evaluation complete
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {agentOrder.map((agentId, i) => {
          const agent = AGENTS.find((a) => a.id === agentId)!;
          const data = results[agentId];
          const show = revealed > i;
          return (
            <div
              key={agentId}
              className={cn(
                'transition-all duration-500',
                show ? 'opacity-100' : 'opacity-0 translate-y-4 pointer-events-none'
              )}
            >
              {show && data && <AgentCard config={agent} data={data} index={0} />}
            </div>
          );
        })}
      </div>

      {/* Final verdict — appears at step 4 */}
      <div
        className={cn(
          'transition-all duration-500',
          revealed >= 4 ? 'opacity-100' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        {revealed >= 4 && (
          <FinalVerdict
            score={finalScore}
            caseText={caseText}
            results={results as unknown as EvalResults}
            shortVerdict={
              finalScore >= 70 ? 'Ship MVP' :
                finalScore >= 50 ? 'Iterate First' : 'Reject - Major Issues'
            }
          />
        )}
      </div>

      {/* Reset button */}
      <div
        className={cn(
          'text-center pb-8 transition-all duration-500',
          revealed >= 4 ? 'opacity-100' : 'opacity-0'
        )}
      >
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
type Status = 'idle' | 'loading' | 'done' | 'error';

export default function HomePage() {
  const [caseText, setCaseText] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [results, setResults] = useState<Record<string, AgentCardData> | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit() {
    const trimmed = caseText.trim();
    if (trimmed.length < MIN_CHARS) {
      setErrorMsg(`Please enter at least ${MIN_CHARS} characters.`);
      setStatus('error');
      return;
    }

    // Clear previous results immediately before new evaluation
    setResults(null);
    setErrorMsg(null);
    setStatus('loading');

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseText: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? `API error: ${res.status}`);
      }

      // API returns { agents: { feasibility, innovation, risk }, finalScore, verdict }
      setResults(data.agents);
      setStatus('done');
    } catch (err) {
      console.error('[Agent Jury] Evaluation failed:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu.');
      setStatus('error');
    }
  }

  function handleReset() {
    setStatus('idle');
    setResults(null);
    setErrorMsg(null);
    setCaseText('');
  }

  const finalScore = results ? computeFinalScore(results) : 0;

  return (
    <main className="relative min-h-screen px-4 py-16 md:py-24">
      <BackgroundBlobs />

      {/* View History link — top-right corner */}
      <div className="absolute top-5 right-5 z-20">
        <Link
          href="/history"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 border border-white/10 glass hover:text-white hover:border-white/20 transition-all duration-200"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          View History
        </Link>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <Hero />
        <CaseInput
          value={caseText}
          onChange={setCaseText}
          onSubmit={handleSubmit}
          disabled={status === 'loading' || status === 'done'}
        />

        {/* Error banner */}
        {status === 'error' && errorMsg && (
          <div className="w-full max-w-3xl mx-auto mb-8 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm flex items-start gap-3 animate-[fadeSlideUp_0.3s_ease_both]">
            <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">Değerlendirme başarısız</p>
              <p className="text-red-400/70">{errorMsg}</p>
              <button
                onClick={handleReset}
                className="mt-2 text-xs text-red-400 underline hover:text-red-300"
              >
                Tekrar dene
              </button>
            </div>
          </div>
        )}

        {(status === 'idle' || status === 'error') && <AgentCardsEmptyState />}
        {status === 'loading' && <EvaluationLoading />}
        {status === 'done' && results && (
          <ResultsGrid results={results} finalScore={finalScore} caseText={caseText} />
        )}
      </div>
    </main>
  );
}
