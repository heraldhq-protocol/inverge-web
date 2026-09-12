# Technical decisions

Use this log for decisions that meaningfully constrain future work: architecture,
infrastructure, data ownership, dependencies with broad impact, experimental
features, or deliberate exceptions to the standards. Do not log routine code
choices.

## Decision index

| ID | Date | Status | Decision |
| --- | --- | --- | --- |
| D-001 | 2026-09-12 | Accepted | Use the App Router, strict TypeScript, Server Components by default, and Tailwind CSS's CSS-first setup. |
| D-002 | 2026-09-12 | Accepted | Treat `Inverge_PRD_SRS_v1.2.md` as product authority and Phases 0–2 as the launch scope; Phase 3 features remain out of implementation until explicitly started. |
| D-003 | 2026-09-12 | Accepted | Keep this repository focused on the Next.js web client and integrate with the NestJS backend, Solana program, indexer, and providers through explicit typed boundaries. |
| D-004 | 2026-09-12 | Accepted | Use centralized semantic UI tokens. The live brand book supplies a revisable visual baseline rather than immutable component values. |
| D-005 | 2026-09-12 | Accepted | Target WCAG 2.2 AA for the web client, exceeding the SRS's WCAG 2.1 AA minimum. |
| D-006 | 2026-09-12 | Accepted | Pin the scaffold to Node.js 24 LTS and pnpm 12 with exact dependency versions; defer ESLint 10 and TypeScript 7 until the full Next.js lint and test toolchain supports them. |
| D-007 | 2026-09-12 | Accepted | Rebuild the legacy public marketing surface as an isolated marketing feature, preserving brand direction while rewriting unsupported claims and importing no legacy application architecture. |

### D-006: Pin a mutually compatible scaffold toolchain

- Date: 2026-09-12
- Status: Accepted
- Owner: Web engineering

Context: The latest Next.js, React, and Tailwind releases are mutually compatible,
but the current Next.js ESLint plugin graph does not accept ESLint 10 and the
TypeScript-aware lint/test graph does not yet accept TypeScript 7 without peer
conflicts.

Decision: Use Node.js 24.21.0 LTS and pnpm 12.3.4, pin dependency versions exactly,
and use Next.js 16.3.5, React 19.3.0, Tailwind CSS 4.3.3, TypeScript 6.0.3, and
ESLint 9.39.5. Keep pnpm's dependency-build deny policy and explicitly allow only
reviewed build scripts.

Alternatives: Installing every latest tag would leave unsupported peer ranges.
Suppressing those warnings or disabling pnpm's build-script policy would hide
useful compatibility and supply-chain checks.

Consequences: Installs are reproducible and peer-clean. TypeScript 7 and ESLint 10
features are unavailable until their dependent tooling publishes support.

Revisit when: `eslint-config-next` and its plugin dependencies accept ESLint 10,
and the TypeScript-ESLint and Vitest alias tooling used here accept TypeScript 7.

### D-007: Rebuild only the public marketing surface

- Date: 2026-09-12
- Status: Accepted
- Owner: Web engineering and product

Context: The earlier Inverge repository contains useful brand direction and a
complete public information architecture, but it also includes unsupported
metrics, testimonials, partnerships, campaign stories, job openings, product
claims, and application/provider architecture that is not authoritative for this
implementation.

Decision: Recreate the public home, about, journal, guides, help, careers,
contact, privacy, and terms routes inside `src/app/(marketing)`, with shared UI
and editorial content owned by `src/features/marketing`. Preserve the emerald,
warm-paper, forest, wordmark, and African visual direction. Rewrite content from
the current PRD/SRS and primary-source market/legal research. Do not migrate old
React components, runtime dependencies, APIs, providers, user data, purported
case studies, or product routes. Keep legal pages visibly non-binding until
reviewed by Nigerian counsel.

Alternatives: Copying the old pages would reproduce inaccurate lifecycle and
refund claims and pull in obsolete implementation patterns. Dropping all prior
brand direction would discard useful, owner-approved continuity.

Consequences: Marketing remains a Server Component-first, dependency-free
feature with no fake live data or dead submission forms. Product CTAs are
limited to real public routes until the application screens exist. The migrated
Lagos hero image still needs owner confirmation of its source and production-use
rights before launch.

Revisit when: Product screens are implemented, approved campaign data exists,
final social accounts or contact channels are confirmed, or counsel approves the
legal documents.

## Decision template

Copy this section for a new decision.

### D-XXX: Short decision title

- Date: YYYY-MM-DD
- Status: Proposed | Accepted | Superseded
- Owner: Name or role

Context: What requirement or constraint forces a choice?

Decision: What are we choosing?

Alternatives: What credible options were considered?

Consequences: What becomes easier, harder, or constrained?

Revisit when: What evidence or event should cause this decision to be reviewed?
