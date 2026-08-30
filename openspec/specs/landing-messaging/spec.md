# landing-messaging Specification

## Purpose

Defines marketing-oriented copy standards for the Voterpool landing page — ensuring every visible text section uses value-framed, infrastructure-leader-accessible language while preserving factual accuracy from the existing `landing-copy` spec.

## Requirements

### Requirement: Hero section communicates value, not mechanics

The hero subtitle (rendered in `HeroClient.tsx`) SHALL describe what Voterpool does for the visitor's infrastructure, not how it is implemented. It MUST NOT contain: protocol version strings (e.g. `MCP 2026-07-28`), method names (`cast_vote`, `tools/call`), or library names. It MUST convey: (1) self-hosted deployment, (2) zero external dependencies, (3) standard protocol interface.

#### Scenario: Visitor reads hero subtitle

- **WHEN** a visitor loads the landing page and reads the paragraph beneath "Consensus for AI agents"
- **THEN** the text describes Voterpool as a self-hosted decision infrastructure for AI agents using a standard protocol, with no protocol version strings, no internal method names, and no library references

#### Scenario: Hero avoids performance benchmarks

- **WHEN** the hero stats section renders on page load
- **THEN** the stat "50,000 cast_vote operations per second" is replaced with an infrastructure-relevant signal, and the word "cast_vote" does not appear in any stat label

### Requirement: Problem section frames the pain in infrastructure terms

The "Problem" section (four problem cards) SHALL frame alternatives as infrastructure trade-offs, not architectural patterns. It MUST NOT use abstract terms like "orchestrator hierarchies" without connecting them to a concrete operational cost (latency, single point of failure, coordination overhead).

#### Scenario: Problem cards describe operational costs

- **WHEN** a visitor reads the three existing problem cards and the blockchain critique
- **THEN** each card connects the alternative to a specific operational cost (coordination latency, data integrity risk, or infrastructure burden) rather than describing only the architectural pattern

### Requirement: Solution section emphasizes deployment simplicity

The "Solution" section (three-column card) SHALL lead with deployment and integration value. Card 03 MUST present the single static binary with embedded storage and no external services as deployment simplicity. The claim "no containers" MUST NOT be used: containers remain a valid deployment option (owner decision in PR review); the single binary is one deployment variant, not the absence of containers.

#### Scenario: Solution card 03 leads with deployment

- **WHEN** a visitor reads the three solution cards
- **THEN** card 03 leads with deployment simplicity: one statically linked binary, embedded storage, no external services, MCP-compatible, without claiming containers are absent

### Requirement: Feature cards use value labels instead of protocol chips

Each of the six feature cards in the "Features" section SHALL display a value-oriented chip label instead of a protocol or method name. Chip labels MUST NOT contain: HTTP methods (`POST`), internal method names (`cast_vote`, `tools/call`), design pattern names (`Strategy pattern`), or payload structures (`APPROVE_MEMBER`, `UPDATE_ORG_INFO`).

#### Scenario: Feature chips display value labels

- **WHEN** a visitor views the six feature cards
- **THEN** the chips read something like "Stateless · JSON-RPC" (instead of "POST /mcp"), "Pluggable models" (instead of "Strategy pattern"), "EQUAL or WEIGHTED" (instead of "EQUAL | SHARES"), "Consensus-driven" (instead of "APPROVE_MEMBER · UPDATE_ORG_INFO"), "Real-time · SSE" (instead of "GET /mcp/events"), "Index-backed search" (instead of "merge-scan · cursor feed")

### Requirement: Consensus Math section uses plain English with one technical anchor

The "Math" section SHALL present each consensus model with a plain-English description of what the model means for decision-makers. Full formulas (`Y > T / 2`, `V >= Qreq ^ Y > N`, `N = 0 ^ Y > 0 ^ C >= H`) MUST be replaced by readable statements. Exactly ONE technical anchor formula per model MAY be retained as a precise reference, alongside the plain-English statement. A link to the full spec (openspec) MUST be provided for readers who need exact formulas. The variable legend MUST be retained or simplified with a link to specs.

This requirement is reconciled with `landing-copy`: that spec mandates the exact formula as a reproducible anchor; this spec mandates accessibility. The agreed compromise is both — anchor formula + plain-English + spec link — on the same card.

#### Scenario: Visitor reads MAJORITY model description

- **WHEN** a visitor opens the Consensus Math section
- **THEN** MAJORITY is described as "simple majority — more YES than NO wins," and the technical anchor `Y > T/2` is shown next to it with a link to the formal spec

#### Scenario: Variable legend is preserved or linked

- **WHEN** a visitor consults the variable definitions
- **THEN** all symbols used in any visible formulas are defined, or if formulas are removed, a link to the spec document is provided instead

### Requirement: Architecture section uses role-oriented descriptions

The four stack layers (mcp, consensus, storage, core) SHALL use role-oriented names and descriptions. Technology stack cloud tags MUST NOT include: `C++20 coroutines`, `simdjson On-Demand`, `jemalloc`, `spdlog + fmt`, `yaml-cpp`, `concurrentqueue`, `fmt`. Tags MUST NOT exceed five items.

#### Scenario: Cloud tags show relevant technologies only

- **WHEN** a visitor views the technology stack section
- **THEN** at most five tags are shown, each representing a meaningful architectural choice (e.g., "HTTP/2", "RocksDB", "JSON-RPC 2.0"), and no build-time or optimization libraries appear

### Requirement: How It Works steps describe workflow, not API contracts

Each of the five How It Works steps SHALL describe the decision lifecycle step in natural language. Code snippets SHALL illustrate the concept, not serve as API reference. Internal method names (`cast_vote`, `create_proposal`) MAY appear in code but MUST be accompanied by plain-language explanations.

#### Scenario: How It Works step 4 describes voting

- **WHEN** a visitor views step 4 of the How It Works flow
- **THEN** the description explains that voting records a decision atomically and evaluates the outcome immediately, rather than describing the JSON-RPC call contract

### Requirement: Reliability guarantees use accessible language

Each of the eight reliability guarantee cards SHALL use plain language to describe the guarantee. Database-level terminology (`WriteBatch`, `cf_audit_log`, `cf_auth`) MUST NOT appear in visible text. The guarantee description MUST focus on what the visitor can depend on, not how the storage engine achieves it.

#### Scenario: Visitor reads Atomic votes guarantee

- **WHEN** a visitor reads the "Atomic votes" guarantee card
- **THEN** the text reads "Every decision is recorded in a single operation — double-voting is structurally impossible" rather than mentioning `WriteBatch transactions`

#### Scenario: Visitor reads Backup-ready guarantee

- **WHEN** a visitor reads the "Backup-ready" guarantee card
- **THEN** the text is consistent with the existing `landing-copy` spec: it describes `voterpool checkpoint` for consistent snapshots and does NOT promise zero-downtime backups
