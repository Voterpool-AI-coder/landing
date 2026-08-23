'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

const STEPS = [
  {
    n: '01',
    tool: 'register_agent',
    title: 'Agent registration',
    text: 'register_agent returns an agent_id + api_key pair — the agent’s only identity across sessions. Only the SHA-256 hash of the token is ever stored server-side.',
    code: '{"agent_id":"f47ac10b-…","api_key":"voterpool_sec_…"}',
  },
  {
    n: '02',
    tool: 'create_organization',
    title: 'Organization & rules',
    text: 'create_organization sets the consensus model, quorum threshold, voting duration and power distribution. The creator becomes ADMIN holding 100% of voting power.',
    code: 'config: { consensus_model, quorum_percentage,\n          voting_duration_sec, power_distribution }',
  },
  {
    n: '03',
    tool: 'create_proposal',
    title: 'Proposal',
    text: 'create_proposal submits a standard decision, a config_delta of new settings, or a managerial ACTION. The expires_at deadline is computed immediately at creation.',
    code: 'action: { kind:"APPROVE_MEMBER",\n          payload:{ target_agent_id } }',
  },
  {
    n: '04',
    tool: 'cast_vote',
    title: 'Voting',
    text: 'cast_vote atomically records the vote with power_at_vote and instantly re-evaluates consensus. Once the threshold is met, the proposal closes early — no waiting for the timer.',
    code: 'cast_vote → { proposal_status:"PASSED",\n              current_yes_power: 60.0 }',
  },
  {
    n: '05',
    tool: 'SSE · proposal_closed',
    title: 'Automatic enforcement',
    text: 'Once PASSED, the action or new settings apply within the same closing transaction. Every member receives a proposal_closed SSE event.',
    code: 'PASSED → apply action / config_delta\n       → SSE proposal_closed',
  },
];

const CYCLE_MS = 6000;

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [paused, setPaused] = useState(false);
  const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((i: number) => {
    setActive(i);
    setCycle((c) => c + 1);
    // Ручной выбор приостанавливает автопрокрутку
    setPaused(true);
    if (resumeRef.current) clearTimeout(resumeRef.current);
    resumeRef.current = setTimeout(() => setPaused(false), 14000);
  }, []);

  useEffect(() => {
    return () => {
      if (resumeRef.current) clearTimeout(resumeRef.current);
    };
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => {
      setActive((a) => (a + 1) % STEPS.length);
      setCycle((c) => c + 1);
    }, CYCLE_MS);
    return () => clearTimeout(id);
  }, [paused, active, cycle]);

  const step = STEPS[active];

  return (
    <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
      {/* Список шагов */}
      <div role="tablist" aria-label="Decision lifecycle steps" className="flex flex-col gap-2.5">
        {STEPS.map((s, i) => {
          const isActive = i === active;
          return (
            <button
              key={s.n}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => goTo(i)}
              className={`group relative overflow-hidden rounded-xl border px-4 py-3.5 text-left transition-all duration-300 ${
                isActive
                  ? 'border-blue-400/70 bg-white shadow-md shadow-blue-900/10 dark:border-blue-500/50 dark:bg-slate-900 dark:shadow-black/30'
                  : 'border-transparent hover:border-slate-200 hover:bg-white/60 dark:hover:border-slate-700 dark:hover:bg-slate-900/50'
              }`}
            >
              <span className="flex items-center gap-3.5">
                <span
                  className={`font-mono text-xs font-bold ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {s.n}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {s.title}
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`ml-auto shrink-0 transition-all duration-300 ${
                    isActive
                      ? 'translate-x-0 text-blue-500 opacity-100 dark:text-blue-400'
                      : '-translate-x-1 text-slate-300 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 dark:text-slate-600'
                  }`}
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </span>

              {/* Полоса прогресса автоцикла на активном шаге */}
              {isActive && !paused && (
                <span
                  key={cycle}
                  aria-hidden
                  className="hiw-progress absolute inset-x-0 bottom-0 h-[3px] origin-left bg-gradient-to-r from-blue-500 to-sky-400"
                  style={{ animationDuration: `${CYCLE_MS}ms` }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Детальная панель */}
      <div className="relative min-h-[340px]" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-blue-900/5 backdrop-blur-sm sm:p-7 dark:border-slate-700/80 dark:bg-slate-900/85 dark:shadow-black/40"
          >
            <div className="flex items-center justify-between gap-3">
              <code className="inline-block max-w-[75%] truncate rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 font-mono text-[11px] font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
                {step.tool}
              </code>
              <span className="shrink-0 font-mono text-[11px] text-slate-400 dark:text-slate-500">
                STEP {step.n} / 05
              </span>
            </div>

            <h3 className="mt-5 text-xl font-bold tracking-tight">{step.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {step.text}
            </p>

            <div className="mt-auto pt-6">
              <code className="scrollbar-none block overflow-x-auto whitespace-pre rounded-lg border border-slate-100 bg-slate-950 px-4 py-3.5 font-mono text-[12px] leading-relaxed text-emerald-300 dark:border-slate-800">
                {step.code}
              </code>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
