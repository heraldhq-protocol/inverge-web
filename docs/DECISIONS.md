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
| D-004 | 2026-09-12 | Accepted | Use centralized semantic UI tokens. The working brand direction supplies a revisable visual baseline rather than immutable component values. |
| D-005 | 2026-09-12 | Accepted | Target WCAG 2.2 AA for the web client, exceeding the SRS's WCAG 2.1 AA minimum. |
| D-006 | 2026-09-12 | Accepted | Pin the scaffold to Node.js 24 LTS and pnpm 12 with exact dependency versions; defer ESLint 10 and TypeScript 7 until the full Next.js lint and test toolchain supports them. |
| D-007 | 2026-09-12 | Accepted | Rebuild the legacy public marketing surface as an isolated marketing feature, preserving brand direction while rewriting unsupported claims and importing no legacy application architecture. |
| D-008 | 2026-09-15 | Accepted | Use Privy for authentication and automatic embedded Solana wallet provisioning. |
| D-009 | 2026-10-13 | Accepted | Implement marketing motion with one GSAP data-attribute engine mounted in the marketing layout, honoring `prefers-reduced-motion`. |
| D-010 | 2026-10-16 | Accepted | Denominate all product money in USD; replace `NairaAmount` with `MoneyAmount` (`currency: "USD"`, integer atomic cents). |

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

Context: The earlier Inverge codebase contained useful brand direction and a
complete public information architecture, but it also included unsupported
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

Consequences: Marketing remains a Server Component-first feature with no fake
live data or dead submission forms. Product CTAs are
limited to real public routes until the application screens exist. The migrated
Lagos hero image still needs owner confirmation of its source and production-use
rights before launch.

Revisit when: Product screens are implemented, approved campaign data exists,
final social accounts or contact channels are confirmed, or counsel approves the
legal documents.

### D-008: Use Privy for authentication and embedded wallets

- Date: 2026-09-15
- Status: Accepted
- Owner: Product and web engineering

Context: FR-101 requires email or social authentication and automatic embedded
Solana wallet provisioning on first login. The implementation brief previously
left the combined authentication and embedded-wallet provider unresolved.

Decision: Use Privy for authentication and embedded Solana wallet provisioning.
Map Privy's user identity and wallet identifiers to the Inverge account through
the backend contract. Keep authorization in the responsible backend or on-chain
program; a successful client login is not authorization for a protected action.
External wallet connection under FR-102 remains a separate capability.

Alternatives: Combine a conventional authentication provider with a separate
wallet provider, or build custom authentication and wallet provisioning.

Consequences: Authentication UI, session handling, and embedded-wallet onboarding
will use Privy's supported integration surface. Provider secrets remain
server-only, client configuration contains only intentionally public values, and
the selected social-login methods and session/re-authentication policy must be
defined during implementation. Privy does not become the authority for KYC,
application roles, or escrow state.

Revisit when: Privy no longer satisfies the required Solana, authentication,
security, regional availability, reliability, or commercial constraints.

### D-009: Central GSAP motion engine in the marketing layout

- Date: 2026-10-13
- Status: Accepted
- Owner: Web engineering

Context: The marketing surface needed on-load and scroll-triggered motion without
converting its Server Component sections into Client Components. The brand system
requires motion to be fast, subtle, optional, compositor-friendly, and
reduced-motion aware. `gsap` and `@gsap/react` were already pinned dependencies
but unused.

Decision: Add one `"use client"` `MotionProvider` to the marketing layout that
reads `data-reveal`, `data-reveal-stagger`, `data-reveal-rule`, `data-hero`, and
`data-parallax` attributes and wires GSAP timelines and ScrollTriggers within a
scoped `useGSAP` context. Sections opt in with attributes only. A pre-paint inline
bootstrap sets a `data-motion` attribute (skipped under `prefers-reduced-motion`)
to hide reveal targets before hydration, and a timeout failsafe plus
`!important` fallback CSS unhide content if the engine never initializes.
Reduced motion is handled with `gsap.matchMedia()`; reveals run `once` and animate
only `transform` and `opacity`.

Alternatives: Converting each section to a Client Component with its own
`useGSAP` hook would duplicate setup and expand the client boundary. Using
`next/script` with `beforeInteractive` for the bootstrap is documented for the
root document, not a nested layout.

Consequences: GSAP's core and ScrollTrigger ship to the marketing client bundle
(already-installed dependencies). The engine must re-initialize on client-side
navigation within the marketing route group (handled via a `pathname` dependency
with `revertOnUpdate`) and refresh ScrollTrigger on layout changes (handled with a
`ResizeObserver`). Motion remains additive: with JavaScript disabled or reduced
motion enabled, all content is visible and static.

Revisit when: Product (non-marketing) surfaces need the same primitives, prompting
promotion of the engine to `components/ui`; or GSAP no longer meets bundle,
performance, or accessibility constraints.

### D-010: Denominate product money in USD

- Date: 2026-10-16
- Status: Accepted
- Owner: Product and web engineering

Context: The web preview model represented money as `NairaAmount` with
`currency: "NGN"` and formatted it with naira symbols, while the PRD/SRS
denominates campaign funding and intended asks in USDC/USD (`FR-301`, `FR-270`),
the backend DTOs treat ask and pre-pledge amounts as USD with NGN normalized to
USD on input, and the marketing surface already displayed USD. The mismatch put
naira figures on product screens that disagreed with the product's unit of
account.

Decision: Denominate all product money in USD. Replace `NairaAmount` with
`MoneyAmount { atomic; currency: "USD"; decimals: 2 }` and format with
`Intl.NumberFormat("en-US", { currency: "USD" })`. Keep integer atomic units
(cents) and BigInt arithmetic — never binary floating point. The naira card and
bank on-ramp remains a payment rail, not the unit of account.

Alternatives: Keep NGN as the display currency (contradicts the PRD and the
backend contract); or support a runtime currency switch (no product requirement,
and the web app has no rate source or currency selection yet).

Consequences: Home, pre-pledges, and idea screens share one USD money model and
fixture amounts are now USD figures. Contributor-facing cNGN or multi-currency
display would need an explicit currency field and a rate source rather than a
rename.

Revisit when: The product supports contributor-facing multi-currency display, or
the PRD changes the unit of account.

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
