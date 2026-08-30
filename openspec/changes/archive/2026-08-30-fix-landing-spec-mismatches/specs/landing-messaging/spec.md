## MODIFIED Requirements

### Requirement: Consensus Math section uses plain English with one technical anchor

The "Math" section SHALL present each consensus model with a plain-English description of what the model means for decision-makers. Full formulas (`Y > T / 2`, `V >= Qreq ^ Y > N`, `N = 0 ^ Y > 0 ^ C >= H`) MUST be replaced by readable statements. Exactly ONE technical anchor formula per model MAY be retained as a precise reference, alongside the plain-English statement. A link to the full spec (openspec) MUST be provided for readers who need exact formulas. The variable legend MUST be retained or simplified with a link to specs.

This requirement is reconciled with `landing-copy`: that spec mandates the exact formula as a reproducible anchor; this spec mandates accessibility. The agreed compromise is both — anchor formula + plain-English + spec link — on the same card.

#### Scenario: Visitor reads MAJORITY model description

- **WHEN** a visitor opens the Consensus Math section
- **THEN** MAJORITY is described as "simple majority — more YES than NO wins," and the technical anchor `Y > T/2` is shown next to it with a link to the formal spec

#### Scenario: Variable legend is preserved or linked

- **WHEN** a visitor consults the variable definitions
- **THEN** all symbols used in any visible formulas are defined, or if formulas are removed, a link to the spec document is provided instead

### Requirement: Solution section emphasizes deployment simplicity

The "Solution" section (three-column card) SHALL lead with deployment and integration value. Card 03 MUST present the single static binary with embedded storage and no external services as deployment simplicity. The claim "no containers" MUST NOT be used: containers remain a valid deployment option (owner decision in PR review); the single binary is one deployment variant, not the absence of containers.

#### Scenario: Solution card 03 leads with deployment

- **WHEN** a visitor reads the three solution cards
- **THEN** card 03 leads with deployment simplicity: one statically linked binary, embedded storage, no external services, MCP-compatible, without claiming containers are absent

### Requirement: Architecture section uses role-oriented descriptions

The four stack layers (mcp, consensus, storage, core) SHALL use role-oriented names and descriptions. Technology stack cloud tags MUST NOT include: `C++20 coroutines`, `simdjson On-Demand`, `jemalloc`, `spdlog + fmt`, `yaml-cpp`, `concurrentqueue`, `fmt`. Tags MUST NOT exceed five items.

#### Scenario: Cloud tags show relevant technologies only

- **WHEN** a visitor views the technology stack section
- **THEN** at most five tags are shown, each representing a meaningful architectural choice (e.g., "HTTP/2", "RocksDB", "JSON-RPC 2.0"), and no build-time or optimization libraries appear

### Requirement: Reliability guarantees use accessible language

Each of the eight reliability guarantee cards SHALL use plain language to describe the guarantee. Database-level terminology (`WriteBatch`, `cf_audit_log`, `cf_auth`) MUST NOT appear in visible text. The guarantee description MUST focus on what the visitor can depend on, not how the storage engine achieves it.

#### Scenario: Visitor reads Atomic votes guarantee

- **WHEN** a visitor reads the "Atomic votes" guarantee card
- **THEN** the text reads "Every decision is recorded in a single operation — double-voting is structurally impossible" rather than mentioning `WriteBatch transactions`

#### Scenario: Visitor reads Backup-ready guarantee

- **WHEN** a visitor reads the "Backup-ready" guarantee card
- **THEN** the text is consistent with the existing `landing-copy` spec: it describes `voterpool checkpoint` for consistent snapshots and does NOT promise zero-downtime backups
