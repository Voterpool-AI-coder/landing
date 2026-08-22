'use client';

import { motion } from 'framer-motion';
import CountUp from './CountUp';
import { GitHubIcon } from './Header';
import Terminal from './Terminal';
import WordCycler from './WordCycler';

const STATS = [
  {
    value: 50000,
    suffix: '+',
    label: 'cast_vote operations per second on a single CPU core',
  },
  {
    value: 3,
    suffix: '',
    label: 'consensus models: MAJORITY · QUORUM · CONSENT',
  },
  {
    value: 15,
    suffix: '',
    label: 'MCP tools under a strict JSON-RPC 2.0 contract',
  },
  {
    value: 0,
    suffix: '',
    label: 'external services — state lives in embedded RocksDB',
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function HeroClient() {
  return (
    <section className="relative grid grid-cols-1 items-center gap-12 pb-16 pt-32 lg:grid-cols-[1.38fr_1fr] lg:gap-8 lg:pt-36 xl:gap-12">
      {/* Left column */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease }}
          className="text-4xl font-extrabold leading-[1.12] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.1rem] xl:text-[3.3rem] dark:text-white"
        >
          {/* nowrap-спаны: перенос возможен только между фразами,
              слово agents никогда не остаётся одиноким */}
          <span className="whitespace-nowrap">Consensus for</span>{' '}
          <span className="whitespace-nowrap">AI agents</span>
          <br />
          <WordCycler />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18, ease }}
          className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300"
        >
          <span className="font-semibold text-slate-900 dark:text-white">
            Voterpool
          </span>{' '}
          is an open-source autonomous consensus engine that lets heterogeneous
          AI agents reach verifiable collective decisions through a standard MCP
          interface, without a human in the loop.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease }}
          className="mt-8 flex flex-wrap items-center gap-3.5"
        >
          <a
            href="https://github.com/Voterpool/Voterpool"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 dark:bg-blue-500 dark:shadow-blue-500/20 dark:hover:bg-blue-400"
          >
            <GitHubIcon className="h-[18px] w-[18px]" />
            View on GitHub
          </a>
          <a
            href="#quickstart"
            className="group inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white/80 px-5 py-3 font-medium text-slate-800 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-blue-500 dark:hover:text-blue-400"
          >
            Quick start
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform group-hover:translate-y-0.5"
            >
              <path d="M12 5v14" />
              <path d="m19 12-7 7-7-7" />
            </svg>
          </a>
          <a
            href="https://github.com/Voterpool/Voterpool/tree/main/openspec"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-1.5 py-3 text-sm font-medium text-slate-500 transition hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-400"
          >
            openspec specifications
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17 17 7" />
              <path d="M8 7h9v9" />
            </svg>
          </a>
        </motion.div>

        {/* Stats */}
        <motion.dl
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease }}
          className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-slate-200/80 pt-8 sm:grid-cols-4 dark:border-slate-700/60"
        >
          {STATS.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[1.7rem] dark:text-white">
                <CountUp to={s.value} suffix={s.suffix} />
              </dd>
              <dd className="mt-1.5 text-xs leading-snug text-slate-500 dark:text-slate-400">
                {s.label}
              </dd>
            </div>
          ))}
        </motion.dl>
      </div>

      {/* Right column — terminal */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, x: 44 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.85, delay: 0.2, ease }}
      >
        <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-tr from-blue-200/40 via-sky-100/30 to-transparent blur-2xl dark:from-blue-700/20 dark:via-blue-800/10 dark:to-transparent" />

        <Terminal />

        {/* Floating chips */}
        <motion.div
          animate={{ y: [0, -9, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-2 -top-7 hidden rounded-xl border border-slate-200 bg-white/90 px-3.5 py-2.5 shadow-lg shadow-blue-900/5 backdrop-blur md:block dark:border-slate-700 dark:bg-slate-900/90 dark:shadow-black/30"
        >
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            event: proposal_closed
          </div>
          <div className="mt-1 font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            final_status: PASSED · action_applied
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{
            duration: 6.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.8,
          }}
          className="absolute -bottom-6 -left-4 hidden rounded-xl border border-slate-200 bg-white/90 px-3.5 py-2.5 shadow-lg shadow-blue-900/5 backdrop-blur md:block dark:border-slate-700 dark:bg-slate-900/90 dark:shadow-black/30"
        >
          <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            SSE · GET /mcp/events
          </div>
          <div className="mt-1 font-mono text-[11px] font-semibold text-blue-600 dark:text-blue-400">
            vote_cast → all-orgs subscription
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
