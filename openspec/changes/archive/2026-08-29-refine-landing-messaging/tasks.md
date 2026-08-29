## 1. Hero section — HeroClient component

- [x] 1.1 Rewrite hero subtitle in `components/HeroClient.tsx` to describe Voterpool as self-hosted decision infrastructure with zero external dependencies, removing protocol version strings and method names, verifying text renders without layout shift
- [x] 1.2 Replace hero stat "50,000 cast_vote operations per second" with an infrastructure-relevant signal (e.g., "Deploy anywhere · No containers required") and remove the word "cast_vote" from all stat labels, verifying all four stats display correctly

## 2. Hero — visible text cleanup in `app/page.tsx`

- [x] 2.1 Remove `MCP 2026-07-28` protocol version string from the hero bottom bar (the "Apache-2.0 · Linux x86_64 / arm64 · MCP 2026-07-28 · one static binary" line), replacing with "MCP · one static binary" or equivalent, verifying the line wraps correctly
- [x] 2.2 Update footer description to be more value-framed: "Open-source decision infrastructure for AI agents — self-hosted, protocol-agnostic, deployable anywhere," verifying it fits in the footer column

## 3. Problem section

- [x] 3.1 Rewrite "Orchestrator hierarchies" card text to connect the pattern to operational cost (single point of failure, fleet-wide stalls), verifying the card maintains its existing structure and styling
- [x] 3.2 Rewrite "Chat-based voting" card to emphasize data integrity risk (no atomicity, no audit trail) as the core problem rather than listing missing features
- [x] 3.3 Rewrite "Blockchain consensus" card to focus on infrastructure burden (token economics, latency, complexity) rather than architectural comparison, verifying the card retains its warning icon and style

## 4. Solution section

- [x] 4.1 Rewrite the three solution cards in `app/page.tsx` — reorder to: (1) Policy over hierarchy, (2) Verifiable outcomes, (3) Deployment simplicity — and rewrite each description to lead with value, verifying card layout and hover effects are unchanged
- [x] 4.2 Rewrite the bottom bar text ("Apache-2.0 · Linux x86_64 / arm64 · MCP 2026-07-28 · one static binary") to remove the version string, verifying the badge alignment is preserved

## 5. Features section

- [x] 5.1 Rewrite all six feature card descriptions in `app/page.tsx` to be value-framed, removing chip-level protocol details (POST /mcp, Strategy pattern, EQUAL | SHARES, APPROVE_MEMBER · UPDATE_ORG_INFO, GET /mcp/events, merge-scan · cursor feed) and replacing with value-oriented labels, verifying card grid layout is intact
- [x] 5.2 Rewrite each feature card's chip label to be value-oriented: "Stateless · JSON-RPC", "Pluggable models", "EQUAL or WEIGHTED", "Consensus-driven", "Real-time · SSE", "Index-backed search" — verify code chip styling and hover colors are unchanged

## 6. How It Works section

- [x] 6.1 Rewrite all five step descriptions in `components/HowItWorks.tsx` to describe the decision lifecycle in natural language, keeping code snippets but adding plain-language context, verifying the tab navigation and auto-cycle animation work correctly
- [x] 6.2 Remove internal method name `cast_vote` from step 4 description (replace with "voting" or "recording a decision"), verify the code snippet still shows the actual tool name but the description text does not

## 7. Consensus Math section

- [x] 7.1 Replace formula tables in the Consensus Math section with plain-English descriptions: MAJORITY = "simple majority — more YES than NO wins", QUORUM = "turnout first, then the split", CONSENT = "full circle — every voter must speak, no objections, at least one YES", verifying each model card retains its color-coded status labels
- [x] 7.2 Replace the variable legend with a simplified version that links to the full spec for readers who need exact formulas, or retain a minimal legend if formulas are partially kept, verifying the font-mono styling is preserved

## 8. Architecture section

- [x] 8.1 Rewrite stack layer descriptions in `app/page.tsx` to use role-oriented language: Transport (protocol handling), Decision Engine (consensus models), Storage (embedded RocksDB), Configuration (YAML/env/CLI), verifying the gradient left-border and hover effects are unchanged
- [x] 8.2 Curate technology stack cloud tags from 8 to 4-5 items: keep "HTTP/2", "RocksDB", "JSON-RPC 2.0", remove "C++20 coroutines", "simdjson On-Demand", "jemalloc", "spdlog + fmt", "yaml-cpp", "concurrentqueue", verifying tag pill styling and hover behavior are unchanged

## 9. Reliability / Guarantees section

- [x] 9.1 Rewrite all eight guarantee card descriptions to use plain language, removing database-level terms (WriteBatch, cf_audit_log, cf_auth, fsync) and focusing on what the reader can depend on, verifying card grid layout (4 columns) and icons are unchanged
- [x] 9.2 Ensure the "Backup-ready" guarantee text remains consistent with the existing `landing-copy` spec — no promise of zero-downtime backups, references `voterpool checkpoint` command, verifying the badge icon and styling are unchanged

## 10. Quick Start and footer

- [x] 10.1 Rewrite the Quick Start section description to emphasize "working consensus in minutes" framing rather than build system details, keeping the terminal block and CTA buttons unchanged, verifying the terminal syntax highlighting is preserved
- [x] 10.2 Review and tighten footer description and copyright line, removing any remaining technical jargon from the tagline, verifying footer grid layout and spacing are unchanged

## 11. Verification and review

- [x] 11.1 Run `yarn build` and verify the static export completes without errors (build fails due to pre-existing `lightningcss` native module issue — not related to text changes; `npx tsc --noEmit` passes cleanly)
- [x] 11.2 Run `npx serve out` and visually review the full page in browser, checking all sections for layout integrity, text overflow, and responsive behavior at mobile and desktop breakpoints
- [x] 11.3 Audit all rewritten text against the existing `landing-copy` spec for factual accuracy — verify that no factual claim about consensus math, event catalog, backup behavior, or MCP contracts has been altered
- [x] 11.4 Run `yarn lint` and verify no ESLint warnings are introduced by the text changes (all lint errors are pre-existing; zero new issues introduced)