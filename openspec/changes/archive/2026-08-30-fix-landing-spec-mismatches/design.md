## Context

The landing page content (`app/page.tsx`, `components/HeroClient.tsx`) drifted from the canonical specs and the project's `landing-copy` / `landing-messaging` specs. Eight mismatches were identified (explore report `/tmp/opsx-explore2.log`). This change is text-only — no styling, layout, or component-structure edits. All fix sites are string literals in two files.

## Goals / Non-Goals

**Goals:**
- Make every cited string factually match the canonical specs and the two landing specs.
- Reconcile the one genuine spec conflict (exact formula vs plain-English) into a single coherent rule.
- Keep the change to string edits only, preserving all existing design/style.

**Non-Goals:**
- No new components, no CSS/style changes, no behavioral/runtime changes.
- No changes to the canonical specs or to `docs/*` — only to landing copy.

## Decisions

1. **Item 5 compromise (anchor + plain-English).** `landing-copy` mandates exact formulas as a reproducibility anchor; `landing-messaging` mandates plain-English. Decision: render BOTH — keep the exact formula as a compact technical anchor next to a one-line plain-English statement, and add a link to the openspec spec. This satisfies both specs without dropping either. Alternative considered: show only formulas (violates messaging) or only prose (violates copy reproducibility) — both rejected.

2. **Item 3 CONSENT EXPIRED.** Use `timeout ∧ (C < H ∨ Y = 0)`. This subsumes the "all abstained" (Y=0, N=0) case and the existing `C < H` case; equivalently `timeout ∧ ¬PASSED ∧ ¬REJECTED`. Chosen form keeps the explicit `Y = 0` so the "all abstained" intent is readable.

3. **Item 4 legend.** Add a single legend block above/within the Math section defining Y, N, V, Qreq, T, C, H. No formula change needed beyond anchor.

4. **Item 6 sharding.** Replace the "happens now behind round-robin" claim with a future-scaling statement referencing shard-seams (IDirectory/IIdentity/IEventBus) and Stage 1 `standalone`. No claim of current clustering.

5. **Items 1, 2, 7, 8** are direct substituions against already-correct spec requirements (18 tools, ≤5 non-library tags, no `WriteBatch`, "no containers" headline).

## Risks / Trade-offs

- [Risk] Anchor-formula + prose may lengthen cards slightly. → Mitigation: keep prose to one line; styling unchanged, only text grows.
- [Risk] The "all abstained" EXPIRED widening could be misread as relaxing the quorum. → Mitigation: keep `N = 0 ∧ Y > 0 ∧ C ≥ H` PASSED anchor intact; EXPIRED only adds the timetime Y=0 path.
- [Trade-off] Retaining a formula anchor slightly conflicts with messaging's "replace formulas" spirit, but is the agreed landing-copy/landing-messaging reconciliation.

## Open Questions

None — all eight fixes are string-level and spec-grounded.
