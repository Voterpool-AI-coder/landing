## Why

Landing page text reads like API reference documentation — protocol versions, method names (`cast_vote`), library names (`simdjson`, `jemalloc`), and exact consensus formulas obscure the value proposition for CTOs and infrastructure leaders evaluating Voterpool. The page needs marketing-oriented copy that sells outcomes and infrastructure value while preserving factual accuracy from the existing `landing-copy` spec.

## What Changes

- Rewrite all section-level text on `app/page.tsx` and its imported components (`HeroClient`, `HowItWorks`, `Header`, `ContactForm`) to emphasize infrastructure value, decision-making outcomes, and ease of adoption over protocol implementation details
- Remove implementation-level technical name-drops: `simdjson`, `jemalloc`, `spdlog`, `fmt`, `yaml-cpp`, `concurrentqueue`, `C++20 coroutines`, `cast_vote` (replace with "vote"), `WriteBatch`, `MCP 2026-07-28` protocol version string in visible text
- Replace the hero stat "50,000 cast_vote operations per second" with infrastructure-relevant signals
- Simplify the Consensus Math section from full formula tables to plain-English descriptions with one technical anchor each, linking to specs for exact formulas
- Reframe Feature cards: remove chip-level protocol details, replace with value-oriented labels
- Reframe Architecture layer descriptions: replace technology stack cloud tags with role-oriented labels
- Keep all factual claims accurate per existing `landing-copy` spec (formulas, event catalog, backup behavior, MCP contracts) — this change modifies voice, not facts
- Target audience: CTOs, infrastructure leaders, and product owners embedding autonomous decision-making into their products

## Capabilities

### New Capabilities

- `landing-messaging`: Marketing-oriented copy standards for the landing page — tone, audience fit, value framing, and text-level behavior for every visible section

### Modified Capabilities

- `landing-copy`: Extended from pure factual-accuracy contract to also require marketing-tone alignment alongside factual precision. The factual requirements remain unchanged; the marketing requirements are additive.

## Impact

- `app/page.tsx` — primary text content across all sections
- `components/HeroClient.tsx` — hero heading, subtitle, stats labels
- `components/HowItWorks.tsx` — step descriptions and tool titles
- `components/Header.tsx` — nav text if present
- `components/ContactForm.tsx` — form labels and success text
- No API changes, no structural changes, no new dependencies — text-only modifications to existing React components