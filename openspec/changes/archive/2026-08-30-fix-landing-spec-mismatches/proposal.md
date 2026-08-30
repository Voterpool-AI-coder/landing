## Why

The landing page (`app/page.tsx` and components) carries eight factual copy/messaging mismatches against the canonical specs (`.hermes-context/canonical-specs/`) and the project's own `landing-copy` / `landing-messaging` specs. These break the accuracy and marketing-tone contracts and would mislead infrastructure leaders evaluating Voterpool. This change is a **text-only** reconciliation: no design, layout, or style changes.

Source of evidence: explore report `/tmp/opsx-explore2.log` (last ~9 KB, 8-item list), quoted inline below per item.

## What Changes

- **1) Tool counter stays 20** (PR review: owner confirmed 20 is correct). Original finding: `components/HeroClient.tsx:18` shows `label: 'decision lifecycle calls over MCP'` with value `20`. Canonical tool count is exactly 18 (register_agent, whoami, update_agent, get_agent, create/join/leave/transfer/dissolve/list_pending, create_proposal, cast_vote, server/discover, tools/list, get_playbook, get_proposal, get_proposals, wait_proposal_close). Change `20` → `18`.
- **2) Technology cloud ≤5 tags, no forbidden libs.** `app/page.tsx:177-186` `TECH` = 8 tags incl. `C++20 coroutines`, `simdjson On-Demand`, `jemalloc`, `spdlog + fmt`, `yaml-cpp`, `concurrentqueue`. Reduce to ≤5 meaningful architecture tags (e.g. `HTTP/2`, `RocksDB`, `JSON-RPC 2.0`, `MCP`, `C++20`); drop build/optimization libraries.
- **3) CONSENT EXPIRED covers "all abstained".** `app/page.tsx:152` CONSENT EXPIRED: `timeout ∧ C < H`. The canonical spec requires EXPIRED to also fire when all abstained (Y=0, N=0). Change to `timeout ∧ (C < H ∨ Y = 0)` (equivalently `timeout ∧ ¬PASSED ∧ ¬REJECTED`).
- **4) Variable legend in Math section.** `app/page.tsx` Math cards use Y,N,V,Qreq,T,C,H with no definitions. Add a legend block (Y=yes power, N=no power, V=Y+N turnout, Qreq=required quorum, T=frozen total power, C=voters_count, H=frozen ACTIVE-participant count) or a link to specs.
- **5) Plain-English beside formula anchor + openspec link.** `app/page.tsx:130-153,654` show raw formulas (`Y > T/2`, `V ≥ Qreq ∧ Y > N`, `N = 0 ∧ Y > 0 ∧ C ≥ H`, `Y_max = Y + (T − V)`). Replace symbolic formulas with readable descriptions, keep one technical anchor formula and a link to the full spec. **Compromise:** `landing-copy` demands exact formulas; `landing-messaging` demands plain-English. This change reconciles both — keep the anchor symbol + a plain-English statement + openspec link (see design.md).
- **6) Rephrase sharding away from round-robin.** `app/page.tsx:773` claims sharding "happens" now behind a round-robin balancer. Canonical `shard-seams` spec: Stage 1 `mode: standalone` only; cluster mode is fail-fast-forbidden. Sharding is a future seam (IDirectory/IIdentity/IEventBus). Rephrase to "stateless core designed for future horizontal scaling via shard-seams."
- **7) `WriteBatch transactions` → `atomic batch writes`.** `app/page.tsx:169` "WriteBatch transactions" in visible storage-layer text violates `landing-messaging` (DB-level terms forbidden). Change to "atomic batch writes" (or "transactional batch writes").
- **8) Solution 03 "no containers" rejected in PR review** (containers are a valid deployment variant; binary is one deploy option). Original finding: `app/page.tsx:429-431` card 03 header "One binary, zero dependencies" / "no external services". `landing-messaging` requires headline "one binary, no containers, zero external services". Add "no containers" to the header/text.

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `landing-copy`: tighten/extend factual-accuracy requirements — tool count 18, CONSENT EXPIRED "all abstained" case, variable legend presence, and reconcile that Math cards may show a plain-English statement alongside the exact formula anchor (resolving conflict with `landing-messaging`).
- `landing-messaging`: enforce ≤5 non-library tech tags, plain-English Math descriptions with a single technical anchor + spec link, removal of DB-level terms (`WriteBatch`), and Solution 03 "no containers" headline.

## Impact

- Affected files (text only): `app/page.tsx` (items 2,3,4,5,6,7,8), `components/HeroClient.tsx` (item 1). No component/style/design changes.
- No API, dependency, or runtime behavior change — purely rendered copy.
- Acceptance is verifiable by reading the rendered strings against `openspec/specs/landing-copy/spec.md` and `openspec/specs/landing-messaging/spec.md`.

## Review Decisions (PR #1)

- Item 1: hero count stays **20**.
- Item 8: no "no containers" claim; card stays "One binary, zero dependencies".
- Item 6: rephrased shard-seams wording kept, but stage-config details ("Stage 1 standalone — today a single instance...") dropped — landing must not position what is absent.

## Evidence Source

Full justification (files, lines, quotes) — explore report: `/tmp/opsx-explore2.log` (8-item list, ~9 KB tail).
