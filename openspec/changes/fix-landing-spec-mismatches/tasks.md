## 1. Hero & Tool Counter

- [x] 1.1 In `components/HeroClient.tsx:18`, change the decision-lifecycle stat value from `20` to `18` and verify the rendered hero metric reads `18`.
- [x] 1.2 Confirm the `18` matches the canonical tool list (register_agent, whoami, update_agent, get_agent, create/join/leave/transfer/dissolve/list_pending, create_proposal, cast_vote, server/discover, tools/list, get_playbook, get_proposal, get_proposals, wait_proposal_close) — exactly 18 entries.

## 2. Technology Cloud (≤5 tags, no libraries)

- [x] 2.1 In `app/page.tsx:177-186` (`TECH`), reduce tags to ≤5 meaningful architecture tags (e.g. `HTTP/2`, `RocksDB`, `JSON-RPC 2.0`, `MCP`, `C++20`) and verify removal of `C++20 coroutines`, `simdjson On-Demand`, `jemalloc`, `spdlog + fmt`, `yaml-cpp`, `concurrentqueue`, `fmt`.

## 3. Consensus Math Section

- [x] 3.1 In `app/page.tsx:152`, change CONSENT EXPIRED from `timeout ∧ C < H` to `timeout ∧ (C < H ∨ Y = 0)` and verify the "all abstained" (Y=0, N=0) case now resolves to EXPIRED.
- [x] 3.2 In `app/page.tsx:130-153` (and `:654`), replace raw symbolic formulas with a plain-English statement beside a single technical anchor formula, and add a link to the openspec spec; verify MAJORITY reads "simple majority — more YES than NO wins" next to `Y > T/2`.
- [x] 3.3 Add a variable legend block in the Math section defining Y, N, V, Qreq, T, C, H and verify every symbol used in the cards is defined.

## 4. Sharding Rephrase

- [x] 4.1 In `app/page.tsx:773`, replace the "sharding happens behind a round-robin balancer" claim with a statement that the stateless core is designed for future horizontal scaling via shard-seams (Stage 1 `standalone`); verify no claim that clustering happens now.

## 5. Storage & Solution Copy

- [x] 5.1 In `app/page.tsx:169`, change "WriteBatch transactions" to "atomic batch writes" (or "transactional batch writes") and verify no DB-level term remains in visible text.
- [x] 5.2 In `app/page.tsx:429-431`, add "no containers" to the Solution 03 header/text so it reads "one binary, no containers, zero external services" and verify the headline emphasizes it.

## 6. Verification

- [x] 6.1 Re-read `openspec/specs/landing-copy/spec.md` and `openspec/specs/landing-messaging/spec.md` and confirm each of the eight rendered strings satisfies the corresponding requirement.
- [x] 6.2 Grep the two edited files for the old strings (`20`, `simdjson On-Demand`, `timeout ∧ C < H`, `WriteBatch`, round-robin sharding claim) and confirm none remain.
