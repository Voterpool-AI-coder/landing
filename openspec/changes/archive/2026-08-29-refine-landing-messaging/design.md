## Context

The landing page (`app/page.tsx` + components) is a static Next.js export. It is built with React 19, Tailwind CSS 4, and framer-motion for animations. All visible text is embedded directly in JSX as string literals. The page is exported as static HTML to `out/` and served to visitors.

The existing `landing-copy` spec (at `openspec/specs/landing-copy/spec.md`) ensures factual accuracy — consensus formulas, event catalogs, and technical claims must match `docs/00`-`docs/14`. This change operates at the same file level but addresses a different dimension: marketing tone and audience fit.

Target visitors: CTOs, infrastructure decision-makers, and product owners. These audiences need to understand what Voterpool does and why it matters to their infrastructure within 30 seconds. They do not need to read about `simdjson` or `WriteBatch` on the landing page.

## Goals / Non-Goals

**Goals:**
- Shift every visible text section from technical reference voice to infrastructure-value voice
- Preserve 100% of factual claims from the existing `landing-copy` spec — tone change does not alter facts
- Make the page compelling to CTOs and product owners without alienating engineers (who will read further)
- Reduce text-level cognitive load by removing unnecessary implementation details from marketing surface

**Non-Goals:**
- Restructuring page layout, sections, or component hierarchy — text changes only
- Adding new sections, features, or calls-to-action
- Changing the design system (colors, typography, animations)
- Translating content to Russian (docs are in Russian; landing is in English — this change stays in English)
- Modifying the `landing-copy` spec or its factual accuracy requirements

## Decisions

### D1: Modify `app/page.tsx` directly, not extract text to a locale file

The landing page is a single-page static site. Extracting all text strings to a localization file or content dictionary would add a build-time dependency and indirection for a one-file text change. Direct modification of JSX string literals is simpler, more auditable, and has zero runtime impact.

### D2: Replace, don't abbreviate

Marketing copy is not abbreviated technical copy. Each section gets a full rewrite, not a word-count reduction. A 3-line technical description becomes a 3-line value description — not a 1-line abbreviated version.

### D3: Keep the tech stack section but curate it

Engineers and infra-leaders WILL look at the tech stack. Removing it entirely would be a missed signal. Instead, curate from 8 tags to 3-5 meaningful tags that represent architectural choices (HTTP/2, RocksDB, JSON-RPC 2.0) rather than optimization choices (jemalloc, simdjson, spdlog).

### D4: Simplify Consensus Math, don't remove it

The consensus math section is a strong differentiator — "exact formulas, zero ambiguity" appeals to technical evaluators. However, showing raw formulas on a landing page is documentation, not marketing. The approach: plain-English descriptions with one technical anchor each, plus a link to the spec for anyone who wants the math.

### D5: Hero stats — replace benchmark with infra-signal

The stat "50,000 cast_vote ops/sec" is a benchmarker metric that no decision-maker evaluates against. The replacement stats should reflect infrastructure properties: number of consensus models (keep: 3), external dependencies (keep: 0), protocol tools (reframe: 18 decision lifecycle calls), and optionally add a deployment signal.

## Risks / Trade-offs

[Risk] Engineers may perceive the page as "less technical" and assume the product is less capable.
→ [Mitigation] Links to the full spec and GitHub repository remain prominent. The footer retains "Apache-2.0" and protocol references. Engineers who need details can follow links.

[Risk] Rewritten copy accidentally contradicts existing `landing-copy` factual requirements.
→ [Mitigation] The `landing-messaging` spec explicitly inherits all `landing-copy` requirements. Each factual claim preserved in the old copy is verified against the `landing-copy` spec before final text.

[Risk] Text changes break Tailwind classes or layout due to length differences in translated text.
→ [Mitigation]: All rewritten text is scoped to similar character lengths as originals. Layout uses responsive containers (`max-w-3xl`, `grid-cols-1 sm:grid-cols-2`) that adapt to text length. Review in browser after changes.

[Risk] "Marketing voice" is subjective — the team may disagree on what sounds right.
→ [Mitigation]: The spec defines negative constraints (what NOT to include) which are objective and verifiable. Positive constraints are grounded in the target audience's actual evaluation criteria (infrastructure value, deployment simplicity, decision outcomes).

## Migration Plan

1. Edit `app/page.tsx` — replace text strings in all sections (hero, problem, solution, features, how-it-works, consensus math, architecture, guarantees, quick start, footer)
2. Edit `components/HeroClient.tsx` — update hero subtitle and stat labels
3. Edit `components/HowItWorks.tsx` — update step descriptions and titles
4. Review all changes against the `landing-copy` spec for factual accuracy
5. Build with `yarn build` and verify static export succeeds
6. Preview with `npx serve out` and visually confirm layout integrity

## Open Questions

1. Should the hero stat "18 MCP tools under a strict JSON-RPC 2.0 contract" be reworded to "18 decision lifecycle calls" or kept as-is? The term "MCP tools" is meaningful to the target audience (infra leaders who know MCP).
2. Should we add a fourth stat (currently 4 stats: 50000 ops/sec, 3 models, 18 tools, 0 deps)? Options: "Deploy in minutes" (qualitative), "Self-hosted" (already in solution card), "Open-source (Apache-2.0)".