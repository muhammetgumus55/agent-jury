'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/* ─── Decorative background blobs ─────────────────────────────────── */
function BackgroundBlobs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      {/* Purple blob – top-left */}
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30"
        style={{
          background:
            'radial-gradient(circle at center, #7c3aed 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      {/* Blue blob – bottom-right */}
      <div
        className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full opacity-20"
        style={{
          background:
            'radial-gradient(circle at center, #2563eb 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      {/* Accent blob – center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10"
        style={{
          background:
            'radial-gradient(circle at center, #818cf8 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />
    </div>
  );
}

/* ─── Header / Hero ───────────────────────────────────────────────── */
function Hero() {
  return (
    <header className="text-center mb-12 pt-4">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full text-xs font-medium tracking-wider uppercase glass border border-purple-500/30 text-purple-300">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
        AI-Powered Evaluation
      </div>

      {/* Title */}
      <h1 className="text-6xl md:text-7xl font-black mb-4 leading-none tracking-tight">
        <span className="gradient-text">Agent</span>{' '}
        <span className="text-white">Jury</span>
      </h1>

      {/* Subtitle */}
      <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto font-light leading-relaxed">
        AI agents evaluate your idea —{' '}
        <span className="text-slate-300 font-medium">
          debating, scoring, and delivering a final verdict.
        </span>
      </p>
    </header>
  );
}

/* ─── Case Input Panel ────────────────────────────────────────────── */
interface CaseInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}

function CaseInput({ value, onChange, onSubmit }: CaseInputProps) {
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
        {/* Panel header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30">
            <svg
              className="w-4 h-4 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Your Case</h2>
            <p className="text-xs text-slate-500">
              Describe your idea in detail for the best evaluation
            </p>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          id="case-input"
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxChars))}
          placeholder="Enter your project idea, startup concept, or product proposal... The more detail you provide, the more accurate the evaluation."
          rows={8}
          className={cn(
            'w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed',
            'bg-black/30 border border-white/10 text-slate-200 placeholder-slate-600',
            'transition-all duration-200',
            'focus:border-purple-500/50'
          )}
        />

        {/* Footer: char count + submit button */}
        <div className="flex items-center justify-between mt-4">
          <span
            className={cn(
              'text-xs tabular-nums transition-colors',
              charCount > maxChars * 0.9
                ? 'text-orange-400'
                : 'text-slate-600'
            )}
          >
            {charCount.toLocaleString()} / {maxChars.toLocaleString()}
          </span>

          <button
            id="start-evaluation-btn"
            onClick={onSubmit}
            disabled={isEmpty}
            aria-disabled={isEmpty}
            className={cn(
              'relative inline-flex items-center gap-2 px-6 py-2.5 rounded-xl',
              'text-sm font-semibold tracking-wide transition-all duration-200',
              isEmpty
                ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                : [
                  'text-white cursor-pointer',
                  'bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600',
                  'hover:from-purple-500 hover:via-violet-500 hover:to-blue-500',
                  'hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5',
                  'active:translate-y-0',
                  'border border-white/10',
                ]
            )}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Start Evaluation
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Agent Cards Empty State ─────────────────────────────────────── */
function AgentCardsEmptyState() {
  const placeholderAgents = [
    { emoji: '🧑‍⚖️', label: 'The Judge' },
    { emoji: '📊', label: 'Market Analyst' },
    { emoji: '⚙️', label: 'Tech Lead' },
    { emoji: '💰', label: 'VC Partner' },
    { emoji: '🎯', label: 'UX Critic' },
    { emoji: '🔬', label: 'Researcher' },
  ];

  return (
    <section className="w-full max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
          The Jury
        </h2>
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-xs text-slate-600 italic">
          Awaiting your case…
        </span>
      </div>

      {/* Grid of placeholder cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {placeholderAgents.map((agent) => (
          <div
            key={agent.label}
            className="glass rounded-xl p-5 flex items-center gap-4 opacity-40 select-none"
          >
            {/* Avatar */}
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
              {agent.emoji}
            </div>

            {/* Info skeleton */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-300 mb-1">
                {agent.label}
              </div>
              {/* Placeholder bars */}
              <div className="space-y-1.5">
                <div className="h-2 bg-white/10 rounded-full w-3/4" />
                <div className="h-2 bg-white/10 rounded-full w-1/2" />
              </div>
            </div>

            {/* Verdict placeholder */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="text-lg">⏳</span>
            </div>
          </div>
        ))}
      </div>

      {/* Call-to-action hint */}
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

/* ─── Page root ───────────────────────────────────────────────────── */
export default function HomePage() {
  const [caseText, setCaseText] = useState('');

  function handleSubmit() {
    if (!caseText.trim()) return;
    // Evaluation logic will be wired in the next step
    console.log('Evaluation requested:', caseText);
  }

  return (
    <main className="relative min-h-screen px-4 py-16 md:py-24">
      <BackgroundBlobs />

      <div className="relative z-10 flex flex-col items-center">
        <Hero />
        <CaseInput
          value={caseText}
          onChange={setCaseText}
          onSubmit={handleSubmit}
        />
        <AgentCardsEmptyState />
      </div>
    </main>
  );
}
