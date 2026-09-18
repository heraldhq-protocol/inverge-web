# Inverge implementation brief

Status: **Public marketing implemented; product implementation in progress**
Last updated: 2026-09-18

The complete product contract is
[`Inverge_PRD_SRS_v1.2.md`](./Inverge_PRD_SRS_v1.2.md). Do not duplicate its
requirement tables here. This brief tells implementers how to interpret the SRS
for this web repository and highlights invariants that are easy to lose during
UI work.

## Product promise

Inverge lets creators validate ideas and run curated rewards- or donation-based
campaigns. Contributions are held by a Solana escrow program and released in
milestone tranches. Backers can verify the lifecycle publicly and claim eligible
refunds without depending on the Inverge backend.

The mainstream experience is human and familiar: lead with accountability and
the guarantee, not blockchain mechanics.

## Launch scope

The SRS launch gate covers PRD Phases 0–2:

- identity, embedded wallets, and threshold-based KYC;
- idea publishing, support, structured feedback, and non-binding pre-pledges;
- paid Basic and Featured idea placement, visibly labelled and kept separate
  from organic validation metrics;
- curated All-or-Nothing campaigns with application fees;
- stablecoin funding, receipts, and creator off-ramp initiation;
- working-capital and milestone tranche releases;
- objection windows, appeals, reviewer decisions, and claim-based refunds;
- campaign discussion, lifecycle notifications, and backer participation history;
- an administration surface; and
- a public transparency dashboard reconstructed from on-chain events.

Flexible Funding and creator tiers are specified for design continuity but are
Phase 3, not part of the launch implementation. Equity/profit-sharing, a platform
token, permissionless campaign publishing, fully decentralized dispute governance,
and yield on escrowed funds are outside launch scope; yield on escrowed funds is
permanently excluded.

## Users

| Role | Core capabilities |
| --- | --- |
| Visitor | Browse ideas, campaigns, and public transparency data. |
| Backer | Support ideas, contribute, review milestones, object, and claim refunds. |
| Creator | Complete KYC, publish ideas, submit campaigns, claim milestones, and withdraw released funds. |
| Reviewer | Decide appealed milestone disputes within the governed review process. |
| Admin | Curate listings and manage off-chain configuration without custody of escrowed funds. |

Role checks in the UI are usability controls, not authorization. Every privileged
operation must be authorized again by the responsible backend or on-chain program.

## Product invariants

These requirements cross many screens and must remain true end to end:

1. Escrow custody does not belong to the web app or backend. No backend key may
   move escrowed funds (NFR-02).
2. Refund claims remain executable without backend availability (FR-502, FR-506,
   NFR-09).
3. Dashboard settlement figures come from indexed chain data, not editable
   backend totals (FR-801–FR-803).
4. A paid boost changes discovery placement only. It never changes or visually
   merges with support, pre-pledge, or feedback metrics (FR-206a, NFR-15).
5. Creator KYC is required before campaign review, threshold KYC applies to
   backers, and Inverge stores no raw KYC documents (FR-103–FR-105, NFR-12).
6. Published campaign terms and evidence definitions are immutable and anchored
   by a content hash (FR-303, FR-503).
7. A released tranche is not clawed back. Refund calculations apply only to the
   remaining escrow balance (FR-503a, FR-506).
8. Campaign copy cannot promise equity, profit, yield, or investment returns
   (NFR-14).
9. Default backer flows abstract wallets, gas, and network mechanics while still
   offering verifiable receipts and progressive disclosure (NFR-10).
10. All configurable thresholds, windows, fees, caps, and currency support come
    from an authoritative configuration source; do not hard-code examples from
    the PRD into UI logic.

## System context

The full system comprises a Next.js web client, a NestJS/PostgreSQL backend with
Redis-backed asynchronous work, a Solana Anchor escrow program, an event indexer,
and third-party identity, KYC, payment, wallet, notification, and RPC services.
This repository owns the web client unless the owner explicitly expands its
scope.

## Current implementation slice

Authentication, embedded-wallet onboarding, and the authenticated product shell
form the first product slice. Privy is the accepted provider for user
authentication and automatic embedded Solana wallet provisioning. The responsive
home surface currently uses clearly labelled preview data to establish the
navigation, discovery, pre-pledge, loading, empty, unavailable, and retry states;
it must be replaced by typed backend projections during integration. The backend
remains responsible for mapping the provider identity and wallet to an Inverge
account and for authorizing protected operations.

## Non-functional launch gates

- Core flows meet at least WCAG 2.2 AA, which also satisfies the SRS's WCAG 2.1
  AA floor.
- Interactive pages reach a usable state within three seconds on a mid-range
  Android device over 3G (NFR-05).
- Contribution processing attributable to Inverge meets the 15-second P95 target,
  excluding partner latency (NFR-06).
- Public browsing and transparency views remain available read-only during backend
  maintenance (NFR-07).
- The indexer reconciles chain state at least every five minutes and discrepancies
  create an operational alert (NFR-08).

## Open implementation decisions

Resolve these before the affected integration is built and record material choices
in `DECISIONS.md`:

- KYC, fiat on/off-ramp, and flat-fee payment providers;
- typed API contract source and versioning workflow with the NestJS service;
- Solana RPC/indexing provider and failover design;
- notification providers and delivery/retry policy;
- production deployment, observability, analytics, and consent tooling;
- final visual assets and any revisions to the working brand system.
