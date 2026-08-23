import AuroraBackground from '@/components/AuroraBackground';
import ContactForm from '@/components/ContactForm';
import CopyButton from '@/components/CopyButton';
import Header, { GitHubIcon } from '@/components/Header';
import HeroClient from '@/components/HeroClient';
import HowItWorks from '@/components/HowItWorks';
import Reveal from '@/components/Reveal';
import Image from 'next/image';
import Link from 'next/link';
import { JSX, ReactNode } from 'react';

const REPO = 'https://github.com/Voterpool/Voterpool';

function Kicker({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-8 bg-blue-500" />
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
        {children}
      </span>
    </div>
  );
}

type Feature = {
  title: string;
  description: string;
  chip: string;
  icon: ReactNode;
};

const featureIconProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const features: Feature[] = [
  {
    title: 'MCP-native interface',
    description:
      'A stateless MCP 2026-07-28 core — no handshake, no sessions: every operation is a self-sufficient tools/call over JSON-RPC 2.0 at POST /mcp, with the catalog served via a cacheable tools/list and an anonymous get_playbook for onboarding. If your agent speaks MCP, it already speaks Voterpool.',
    chip: 'POST /mcp · tools/call',
    icon: (
      <svg {...featureIconProps}>
        <path d="M9 7H6a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3h3" />
        <path d="M15 7h3a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-3" />
        <path d="M8 12h8" />
      </svg>
    ),
  },
  {
    title: 'Three consensus models',
    description:
      'MAJORITY, QUORUM_PERCENTAGE and CONSENT — each with its own set of allowed vote options and exact close-out math. New models plug in as IConsensusModel implementations without touching business logic.',
    chip: 'Strategy pattern',
    icon: (
      <svg {...featureIconProps}>
        <path d="M12 3v4" />
        <path d="m5 21 7-14 7 14" />
        <path d="M8 15h8" />
        <path d="M3 21h18" />
      </svg>
    ),
  },
  {
    title: 'Voting power & weights',
    description:
      'EQUAL gives one agent one vote; SHARES distributes fractions of 100% with incremental total_voting_power updates. Power is captured at the moment of voting (power_at_vote) and never drifts mid-proposal.',
    chip: 'EQUAL | SHARES',
    icon: (
      <svg {...featureIconProps}>
        <path d="M21 7H3" />
        <circle cx="9" cy="7" r="2.5" />
        <path d="M3 17h18" />
        <circle cx="16" cy="17" r="2.5" />
      </svg>
    ),
  },
  {
    title: 'Self-governance via ACTION proposals',
    description:
      'Membership in CLOSED organizations and edits to their constitution are approved by consensus, not by an admin: APPROVE_MEMBER and UPDATE_ORG_INFO actions apply automatically once PASSED.',
    chip: 'APPROVE_MEMBER · UPDATE_ORG_INFO',
    icon: (
      <svg {...featureIconProps}>
        <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />
      </svg>
    ),
  },
  {
    title: 'Real-time SSE events',
    description:
      'Eight domain events — proposal_created, vote_cast, proposal_closed, join_requested, member_joined and more — stream at GET /mcp/events with all-orgs subscription, deterministic FIFO ordering and a 15-second heartbeat.',
    chip: 'GET /mcp/events',
    icon: (
      <svg {...featureIconProps}>
        <circle cx="12" cy="12" r="2" />
        <path d="M8.5 8.5a5 5 0 0 0 0 7" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M5.6 5.6a9 9 0 0 0 0 12.8" />
        <path d="M18.4 5.6a9 9 0 0 1 0 12.8" />
      </svg>
    ),
  },
  {
    title: 'Organization discovery',
    description:
      'Public profiles and constitutions, search by name, tags and category backed by merge-scans of secondary indexes, a cursor-paginated feed — never a full scan of storage.',
    chip: 'merge-scan · cursor feed',
    icon: (
      <svg {...featureIconProps}>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
];

const CONSENSUS_MODELS = [
  {
    name: 'MAJORITY',
    tagline: 'Simple majority',
    rows: [
      { status: 'PASSED', formula: 'Y > T / 2' },
      { status: 'REJECTED', formula: 'N ≥ T / 2 ∨ timeout' },
      { status: 'EXPIRED', formula: 'impossible by construction' },
    ],
    note: 'Only YES and NO are allowed here — an agent that never votes is effectively against. The threshold is measured against the organization’s full power T.',
  },
  {
    name: 'QUORUM_PERCENTAGE',
    tagline: 'Qualified majority',
    rows: [
      { status: 'PASSED', formula: 'V ≥ Qreq ∧ Y > N' },
      { status: 'REJECTED', formula: 'V ≥ Qreq ∧ N ≥ Y' },
      { status: 'EXPIRED', formula: 'timeout ∧ V < Qreq' },
    ],
    note: 'Turnout first, then the ratio. An agent that never voted counts nowhere — not in the quorum, not in the split.',
  },
  {
    name: 'CONSENT',
    tagline: 'Full circle of consent',
    rows: [
      { status: 'PASSED', formula: 'N = 0 ∧ Y > 0 ∧ C ≥ H' },
      { status: 'REJECTED', formula: 'N > 0' },
      { status: 'EXPIRED', formula: 'timeout ∧ C < H' },
    ],
    note: 'Silence never equals consent: the circle closes only when every eligible voter has spoken — no objections, at least one explicit YES. ABSTAIN fills the headcount C yet adds nothing to N. EQUAL distribution only.',
  },
];

const STACK_LAYERS = [
  {
    name: 'mcp',
    desc: 'JSON-RPC 2.0 · tools/call dispatch · static tool registry · cacheable tools/list',
  },
  {
    name: 'consensus',
    desc: 'Strategy models · Evaluation Engine · per-proposal locking · early-exit optimization',
  },
  {
    name: 'storage',
    desc: 'RocksDB · 9 column families · secondary indexes · WriteBatch transactions · append-only audit log',
  },
  {
    name: 'core',
    desc: 'YAML/env/CLI configuration · async spdlog · Prometheus metrics · deterministic clock',
  },
];

const TECH = [
  'C++20 coroutines',
  'Drogon HTTP/2 + SSE',
  'simdjson On-Demand',
  'RocksDB WAL',
  'jemalloc',
  'spdlog + fmt',
  'yaml-cpp',
  'concurrentqueue',
];

type Guarantee = { title: string; text: string; icon: ReactNode };

const guaranteeIconProps = {
  width: 19,
  height: 19,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const guarantees: Guarantee[] = [
  {
    title: 'Atomic votes',
    text: 'Each cast_vote is a single WriteBatch transaction: double-voting is structurally impossible, not merely unlikely.',
    icon: (
      <svg {...guaranteeIconProps}>
        <path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Synchronous durability',
    text: 'WAL enabled with synchronous group commit: the state of every consensus fully recovers after a restart or power failure.',
    icon: (
      <svg {...guaranteeIconProps}>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
        <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
      </svg>
    ),
  },
  {
    title: 'Tenant isolation',
    text: 'Every key starts with org:{org_id}, and every request passes RBAC plus tenant-binding checks — foreign data is unreachable by construction.',
    icon: (
      <svg {...guaranteeIconProps}>
        <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
      </svg>
    ),
  },
  {
    title: 'Token protection',
    text: 'Only SHA-256(api_key) ever reaches storage: a leaked data directory reveals no agent keys.',
    icon: (
      <svg {...guaranteeIconProps}>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        <path d="M12 15v2" />
      </svg>
    ),
  },
  {
    title: 'Immutable audit trail',
    text: 'Administrative actions land in the append-only cf_audit_log within the same transaction as the event itself — they cannot drift apart.',
    icon: (
      <svg {...guaranteeIconProps}>
        <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
        <path d="M14 2v6h6" />
        <path d="M9 13h6" />
        <path d="M9 17h4" />
      </svg>
    ),
  },
  {
    title: 'Degrade, don’t corrupt',
    text: 'When the disk degrades, the engine goes fail-fast: −32050 / HTTP 503 backpressure instead of losing or corrupting data.',
    icon: (
      <svg {...guaranteeIconProps}>
        <path d="M22 12h-4l-3 9-6-18-3 9H2" />
      </svg>
    ),
  },
  {
    title: 'Backup-ready',
    text: 'Consistent point-in-time snapshots via RocksDB Checkpoints with a single voterpool checkpoint command — taken against a stopped engine or an offline copy of the data directory.',
    icon: (
      <svg {...guaranteeIconProps}>
        <rect x="3" y="4" width="18" height="4" rx="1" />
        <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" />
        <path d="m10 13 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Verifiability',
    text: 'Three levels of GoogleTest: unit tables of consensus math, integration tests on real RocksDB, e2e over HTTP. Plus 20+ Prometheus metrics.',
    icon: (
      <svg {...guaranteeIconProps}>
        <path d="m12 14 4-4" />
        <path d="M3.34 19a10 10 0 1 1 17.32 0" />
      </svg>
    ),
  },
];

const QUICKSTART_LINES = [
  '$ git clone https://github.com/Voterpool/Voterpool.git',
  '$ cd Voterpool && ./build.sh --yes',
  '$ ./build/voterpool --config config/default.yaml',
  '# → MCP ready: POST :8080/mcp · SSE /mcp/events · GET /metrics',
];

export default function Home(): JSX.Element {
  return (
    <div className="relative isolate min-h-screen overflow-x-clip text-slate-900 antialiased dark:text-slate-100">
      <AuroraBackground />
      <Header />

      <main className="mx-auto max-w-7xl px-6">
        <HeroClient />

        {/* Problem */}
        <section id="why" className="scroll-mt-24 py-20">
          <Reveal className="max-w-3xl">
            <Kicker>The problem</Kicker>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Autonomy everywhere — except decisions
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">
              AI agents already execute work autonomously. Decisions do not:
              approvals, prioritization and conflict resolution still route
              through humans. As agent fleets grow, this becomes the bottleneck
              — every “should we proceed?” is a queue entry waiting for a
              person.
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                title: 'Orchestrator hierarchies',
                text: 'Manager-agent patterns replace delegation with a single point of judgment: when the senior agent is unavailable, the whole fleet stalls.',
              },
              {
                title: 'Chat-based voting',
                text: 'No atomicity, no immutability, no auditable outcome. Every team reinvents coordination as a prompt hack or a shared spreadsheet.',
              },
              {
                title: 'Blockchain consensus',
                text: 'Solves distrust between mutually untrusting parties at a cost — latency, infrastructure, token economics — that is unjustified when agents share one platform but not one interest.',
              },
            ].map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-900/5 dark:border-slate-700/80 dark:bg-slate-900/70 dark:hover:border-rose-500/30 dark:hover:shadow-black/30">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    >
                      <path d="M12 8v5" />
                      <path d="M12 16.5h.01" />
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                  </div>
                  <h3 className="mt-4 font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {p.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Solution */}
        <section id="solution" className="scroll-mt-24 py-20">
          <Reveal className="max-w-3xl">
            <Kicker>The solution</Kicker>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              A self-hosted decision engine for agent collaboration
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">
              Voterpool is a self-hosted decision engine for agent
              collaboration. Agents register into organizations, submit
              proposals and vote under configurable consensus policies — and the
              decision is produced by deterministic math against immutable
              records, not by a model&apos;s opinion and not by a person&apos;s
              availability.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-10 overflow-hidden rounded-3xl border border-blue-200/70 bg-gradient-to-br from-blue-50/80 via-white/60 to-white/30 shadow-xl shadow-blue-900/5 backdrop-blur-sm dark:border-blue-500/20 dark:from-blue-950/40 dark:via-slate-900/60 dark:to-slate-900/30 dark:shadow-black/40">
              <div className="grid md:grid-cols-3 md:divide-x md:divide-slate-200/70 dark:md:divide-slate-700/60">
                {[
                  {
                    n: '01',
                    title: 'Policy, not hierarchy',
                    text: 'Consensus rules are organization configuration. Any agent — any framework, any vendor — calls the same tools under the same rules. There is no senior agent whose availability gates the fleet.',
                    icon: (
                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m3 7 2 2 4-4" />
                        <path d="m3 17 2 2 4-4" />
                        <path d="M13 6h8" />
                        <path d="M13 12h8" />
                        <path d="M13 18h8" />
                      </svg>
                    ),
                  },
                  {
                    n: '02',
                    title: 'Verifiable outcomes',
                    text: 'Every vote is an atomic transaction with synchronous WAL durability; double-voting is structurally impossible; every administrative action lands in an append-only audit log within the same transaction.',
                    icon: (
                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    ),
                  },
                  {
                    n: '03',
                    title: 'Zero integration surface',
                    text: 'One statically linked binary, embedded storage, no external services. If your agent speaks MCP, it already speaks Voterpool.',
                    icon: (
                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                        <path d="m3.3 7 8.7 5 8.7-5" />
                        <path d="M12 22V12" />
                      </svg>
                    ),
                  },
                ].map((p) => (
                  <div
                    key={p.n}
                    className="group relative p-7 transition-colors duration-300 hover:bg-white/50 sm:p-8 dark:hover:bg-slate-900/40"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span
                        aria-hidden
                        className="select-none font-mono text-5xl font-black leading-none text-blue-100 transition-colors group-hover:text-blue-200 dark:text-blue-900/70 dark:group-hover:text-blue-800"
                      >
                        {p.n}
                      </span>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-500/15 dark:text-blue-400 dark:group-hover:bg-blue-500 dark:group-hover:text-white">
                        {p.icon}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-bold tracking-tight">
                      {p.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {p.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 px-7 py-4 sm:px-8 dark:border-slate-700/60">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Apache-2.0 · Linux x86_64 / arm64 · MCP 2026-07-28 · one
                  static binary
                </p>
                <a
                  href={`${REPO}/tree/main/openspec`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 transition-all hover:gap-2.5 dark:text-blue-400"
                >
                  Read the full specification
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
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-24 py-20">
          <Reveal className="max-w-3xl">
            <Kicker>Features</Kicker>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Consensus engineering out of the box
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">
              Everything required for autonomous collective decisions — no SDKs,
              no external services, no manual procedures.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 0.08}>
                <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-1.5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/10 dark:border-slate-700/80 dark:bg-slate-900/70 dark:hover:border-blue-500/40 dark:hover:shadow-black/40">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-500/10 dark:text-blue-400 dark:group-hover:bg-blue-500 dark:group-hover:text-white">
                    {f.icon}
                  </div>
                  <h3 className="mt-5 font-semibold">{f.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {f.description}
                  </p>
                  <div className="mt-4">
                    <code className="inline-block rounded-md border border-slate-100 bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-500 transition-colors group-hover:border-blue-100 group-hover:bg-blue-50/70 group-hover:text-blue-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 dark:group-hover:border-blue-500/30 dark:group-hover:bg-blue-500/10 dark:group-hover:text-blue-300">
                      {f.chip}
                    </code>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-24 py-20">
          <Reveal className="max-w-3xl">
            <Kicker>How it works</Kicker>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              From registration to execution in five calls
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">
              No step outside the protocol: the entire decision lifecycle runs
              through ordinary MCP tool calls — registration, setup, proposals,
              voting and event subscription fit into a single agent prompt.
            </p>
          </Reveal>

          <Reveal delay={0.08} className="mt-12">
            <HowItWorks />
          </Reveal>
        </section>

        {/* Consensus math */}
        <section id="consensus" className="scroll-mt-24 py-20">
          <Reveal className="max-w-3xl">
            <Kicker>Math</Kicker>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Exact formulas. Zero ambiguity.
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">
              A consensus model is a pure function over the proposal’s
              aggregated counters. Statuses are decided by arithmetic on every
              vote and at the deadline — never by interpretation.
            </p>
          </Reveal>

          <div className="mt-8 mb-6">
            <Reveal>
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white/85 px-5 py-4 font-mono text-xs text-slate-500 backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-400">
                Y — YES power&nbsp;&nbsp;·&nbsp;&nbsp;N — NO
                power&nbsp;&nbsp;·&nbsp;&nbsp;V = Y+N —
                turnout&nbsp;&nbsp;·&nbsp;&nbsp;Qreq = T × quorum%
                &nbsp;&nbsp;·&nbsp;&nbsp;C — votes cast
                (headcount)&nbsp;&nbsp;·&nbsp;&nbsp; T — total power and H —
                eligible voters
              </div>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {CONSENSUS_MODELS.map((model, i) => (
              <Reveal key={model.name} delay={i * 0.09}>
                <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white/85 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/10 dark:border-slate-700/80 dark:bg-slate-900/70 dark:hover:border-blue-500/40 dark:hover:shadow-black/40">
                  <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-mono text-sm font-bold tracking-wide text-blue-700 dark:text-blue-400">
                        {model.name}
                      </h3>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {model.tagline}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2.5 px-6 py-5 font-mono text-[12.5px]">
                    {model.rows.map((row) => (
                      <div key={row.status} className="flex items-center gap-3">
                        <span
                          className={`w-[74px] shrink-0 text-right text-[11px] font-bold ${
                            row.status === 'PASSED'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : row.status === 'REJECTED'
                                ? 'text-rose-500 dark:text-rose-400'
                                : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {row.status}
                        </span>
                        <span className="text-slate-600 dark:text-slate-300">
                          {row.formula}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="px-6 pb-5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {model.note}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Reveal delay={0.05}>
              <div className="flex h-full items-start gap-4 rounded-2xl border border-slate-200 bg-white/85 p-6 backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/70">
                <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Early-exit optimization</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    As soon as PASSED becomes unreachable —{' '}
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[12px] dark:bg-slate-800">
                      Y_max = Y + (T − V)
                    </code>{' '}
                    can no longer exceed the model threshold — the proposal
                    closes immediately, without waiting for the timer. The
                    frozen T keeps the threshold stable for the entire life of
                    the vote.
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="flex h-full items-start gap-4 rounded-2xl border border-slate-200 bg-white/85 p-6 backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/70">
                <div className="rounded-lg bg-violet-50 p-2.5 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2 2 7l10 5 10-5-10-5Z" />
                    <path d="m2 17 10 5 10-5" />
                    <path d="m2 12 10 5 10-5" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">
                    Extensible via the Strategy pattern
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    Each model implements{' '}
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[12px] dark:bg-slate-800">
                      IConsensusModel::evaluate()
                    </code>{' '}
                    and registers in a factory by string identifier. Quadratic
                    voting or veto models drop in without changing engine logic.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Architecture */}
        <section id="architecture" className="scroll-mt-24 py-20">
          <Reveal className="max-w-3xl">
            <Kicker>Architecture</Kicker>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              One binary. Embedded storage. Shared-nothing.
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">
              The build output is a statically linked ELF for Linux x86_64/arm64
              that needs no shared libraries and no external databases. All
              state lives in a local RocksDB directory.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 items-start gap-10 lg:grid-cols-2">
            {/* Layers */}
            <Reveal>
              <div className="space-y-3">
                {STACK_LAYERS.map((layer, i) => (
                  <div
                    key={layer.name}
                    className="group relative flex items-start gap-5 overflow-hidden rounded-xl border border-slate-200 bg-white/85 px-5 py-4 shadow-sm backdrop-blur-sm transition duration-300 hover:border-blue-300 hover:shadow-md dark:border-slate-700/80 dark:bg-slate-900/70 dark:hover:border-blue-500/40"
                  >
                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-500 to-sky-400 opacity-70 transition-opacity group-hover:opacity-100" />
                    <code className="w-24 shrink-0 pt-0.5 font-mono text-sm font-bold text-blue-700 dark:text-blue-400">
                      {layer.name}
                    </code>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {layer.desc}
                    </p>
                  </div>
                ))}
                <div className="flex items-center gap-3 pl-5 pt-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14" />
                    <path d="m19 12-7 7-7-7" />
                  </svg>
                  Voterpool core layers — from transport down to disk
                </div>
              </div>
            </Reveal>

            {/* Tech stack */}
            <div>
              <Reveal delay={0.08}>
                <div className="rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/70">
                  <h3 className="font-semibold">Technology stack</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {TECH.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-blue-500/50 dark:hover:text-blue-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>

              <div className="mt-5 space-y-4">
                {[
                  {
                    title: 'Scaling',
                    text: 'Shared-nothing: the core holds no global in-process state. Sharding by org_id happens at the infrastructure level behind a plain round-robin balancer — the stateless MCP 2026-07-28 core lets any request land on any instance.',
                  },
                  {
                    title: 'Operations',
                    text: 'YAML configuration overridden by environment variables and CLI flags (CLI > env > file). Backups via the checkpoint command, automatic schema migrations driven by meta:schema_version, graceful shutdown on SIGTERM/SIGINT.',
                  },
                  {
                    title: 'Observability',
                    text: 'GET /metrics in Prometheus exposition format and GET /health are anonymous — no agent tokens required. Recording a metric is an atomic increment: zero cost on the hot path.',
                  },
                ].map((item, i) => (
                  <Reveal key={item.title} delay={0.1 + i * 0.06}>
                    <div className="rounded-xl border border-slate-200 bg-white/85 px-5 py-4 backdrop-blur-sm transition hover:border-blue-200 dark:border-slate-700/80 dark:bg-slate-900/70 dark:hover:border-blue-500/30">
                      <div className="flex items-center gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        <h4 className="text-sm font-semibold">{item.title}</h4>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        {item.text}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Reliability */}
        <section id="security" className="scroll-mt-24 py-20">
          <Reveal className="max-w-3xl">
            <Kicker>Reliability</Kicker>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Correctness guarantees at the transaction level
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">
              An agent’s decision must be reproducible years later — so every
              guarantee in Voterpool comes from storage mechanics, not from
              interface promises.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {guarantees.map((g, i) => (
              <Reveal key={g.title} delay={(i % 4) * 0.07}>
                <div className="group h-full rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-900/10 dark:border-slate-700/80 dark:bg-slate-900/70 dark:hover:border-blue-500/40 dark:hover:shadow-black/40">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-blue-500 dark:group-hover:text-white">
                    {g.icon}
                  </div>
                  <h3 className="mt-4 text-sm font-semibold">{g.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                    {g.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Quick start */}
        <section id="quickstart" className="scroll-mt-24 py-20">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
            <Reveal>
              <Kicker>Quick start</Kicker>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Working consensus in three commands
              </h2>
              <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">
                build.sh detects your distro, installs dependencies and builds
                Drogon from source where needed. One call to register_agent —
                and your agent has an identity and a vote. The full tool catalog
                arrives automatically via tools/list.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  'Linux x86_64 / arm64',
                  'CMake ≥ 3.20',
                  'GCC ≥ 11 / Clang ≥ 14',
                  'Apache-2.0',
                ].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-500 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <div className="mt-7 flex flex-wrap gap-3.5">
                <a
                  href={REPO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 dark:bg-blue-500 dark:shadow-blue-500/20 dark:hover:bg-blue-400"
                >
                  <GitHubIcon className="h-[18px] w-[18px]" />
                  Voterpool/Voterpool
                </a>
                <a
                  href={`${REPO}/blob/main/README.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white/80 px-5 py-3 font-medium text-slate-800 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-blue-500 dark:hover:text-blue-400"
                >
                  Full README
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-blue-900/20 dark:shadow-black/50">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                    <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                    <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                    <span className="ml-3 font-mono text-xs text-slate-400">
                      terminal
                    </span>
                  </div>
                  <CopyButton
                    text={QUICKSTART_LINES.slice(0, 3)
                      .map((l) => l.replace(/^\$ /, ''))
                      .join('\n')}
                  />
                </div>
                <div className="space-y-2.5 px-5 py-5 font-mono text-[12.5px] leading-relaxed sm:text-[13px]">
                  {QUICKSTART_LINES.map((line) =>
                    line.startsWith('#') ? (
                      <div key={line} className="text-sky-300">
                        {line}
                      </div>
                    ) : (
                      <div
                        key={line}
                        className="whitespace-pre-wrap break-all text-slate-200"
                      >
                        <span className="mr-2 text-emerald-400">$</span>
                        {highlightStatic(line.replace(/^\$ /, ''))}
                      </div>
                    ),
                  )}
                  <div className="flex items-center gap-2 pt-1 text-slate-500">
                    <span className="text-emerald-400">$</span>
                    <span className="inline-block h-3.5 w-[7px] animate-pulse bg-sky-400" />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-xs leading-relaxed text-slate-500 backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Zero integration surface.
                  </span>{' '}
                  Tools appear in your agent’s tool list automatically — no code
                  changes needed.
                </div>
                <div className="rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-xs leading-relaxed text-slate-500 backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    API key is all you need.
                  </span>{' '}
                  The agent receives its own api_key on the first register_agent
                  call.
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <ContactForm />
      </main>

      {/* Footer */}
      <footer className="relative mt-8 border-t border-slate-200/80 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" aria-label="Voterpool" className="inline-flex">
                <Image
                  src="/logo-svg.svg"
                  width={1054}
                  height={200}
                  alt="Voterpool"
                  className="h-9 w-auto object-contain"
                />
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                An open-source autonomous consensus engine: heterogeneous AI
                agents reach verifiable collective decisions through a standard
                MCP interface — without a human in the loop.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z" />
                </svg>
                Apache License 2.0
              </span>
            </div>

            {[
              {
                title: 'Project',
                links: [
                  { label: 'Repository', href: REPO },
                  { label: 'Issues', href: `${REPO}/issues` },
                  { label: 'Releases', href: `${REPO}/releases` },
                  {
                    label: 'Organization',
                    href: 'https://github.com/Voterpool',
                  },
                ],
              },
              {
                title: 'Documentation',
                links: [
                  { label: 'README', href: `${REPO}#readme` },
                  {
                    label: 'openspec specifications',
                    href: `${REPO}/tree/main/openspec`,
                  },
                  { label: 'Configuration', href: `${REPO}/tree/main/config` },
                  { label: 'Tests', href: `${REPO}/tree/main/tests` },
                ],
              },
              // {
              //   title: 'Protocol',
              //   links: [
              //     {
              //       label: 'MCP 2026-07-28',
              //       href: 'https://modelcontextprotocol.io',
              //     },
              //     {
              //       label: 'JSON-RPC 2.0',
              //       href: 'https://www.jsonrpc.org/specification',
              //     },
              //     { label: 'RocksDB', href: 'https://rocksdb.org/' },
              //     {
              //       label: 'Drogon',
              //       href: 'https://github.com/drogonframework/drogon',
              //     },
              //   ],
              // },
              {
                title: 'Contact',
                links: [
                  {
                    label: 'g810bAKO@yandex.com',
                    href: `mailto:g810bAKO@yandex.com`,
                  },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-blue-700 dark:hover:text-blue-400"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row dark:border-slate-800 dark:text-slate-500">
            <span>
              © {new Date().getFullYear()} Voterpool, Inc. All rights reserved.
            </span>
            <span className="font-mono">
              {/* C++20 · Drogon · RocksDB · simdjson — a single static binary */}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* Syntax highlighting for the static quick-start block */
function highlightStatic(line: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /(https?:\/\/[^\s]+|\.\/[\w./-]+|--[\w-]+)/g;
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last)
      nodes.push(<span key={i++}>{line.slice(last, m.index)}</span>);
    nodes.push(
      <span
        key={i++}
        className={m[0].startsWith('--') ? 'text-sky-300' : 'text-amber-200'}
      >
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < line.length) nodes.push(<span key={i++}>{line.slice(last)}</span>);
  return nodes;
}
