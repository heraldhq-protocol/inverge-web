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
| D-011 | 2026-10-16 | Accepted | Prefix dashboard routes with `/d` (`/d`, `/d/ideas`, `/d/pre-pledges`, `/d/notifications`, `/d/profile`, `/d/settings`) and redirect the old paths. |
| D-012 | 2026-10-16 | Accepted | Move the shared USD money model from `features/home` to `src/lib/money` so every feature and `components/ui` can use it. |
| D-013 | 2026-10-16 | Accepted | Add Tiptap 3.32.0 (`core`, `react`, `starter-kit`, `extension-image`, `extension-placeholder`) for the rich pitch editor and store pitches as ProseMirror JSON typed structurally by `src/lib/rich-text`. |
| D-014 | 2026-10-16 | Accepted (creator half superseded by D-017) | Split idea routes: public discovery, detail, and topics stay at `/ideas`, `/ideas/[id]`, and `/topics/[slug]`, while creator surfaces live under the `/d` dashboard at `/d/ideas`; `/discover` permanently redirects to `/ideas`. |
| D-015 | 2026-10-16 | Accepted | Add Outfit as the heading display face (via `next/font`) alongside Geist Sans for body copy and Geist Mono for figures, and unify every surface on one content measure. |
| D-016 | 2026-10-17 | Accepted | Render every `/d` route inside one shared `AppShell` assembled by the `(product)` layout from a single `getDashboardViewer()` seam. |
| D-017 | 2026-10-17 | Accepted | Move every creator surface from `/d/ideas*` to `/d/creator/*` (overview, list, create, per-idea workspace, feedback setup, insights, analytics home, feedback inbox) with redirects from the old paths. |
| D-018 | 2026-10-18 | Accepted | Build the campaign experience as one preview feature (`src/features/campaigns`) whose only data seam knows the data is preview: no wallet, no chain, no fabricated transaction, and every fixture carries `demo: true`. |
| D-019 | 2026-10-18 | Accepted | Campaign media is a creator-supplied link, never an upload in this build: a video is preferred at the top but optional, hosted players are addressed by a parsed id rather than by the creator's string, and no fixture ships a video. |
| D-020 | 2026-10-18 | Accepted; working-capital half superseded by D-045 | The platform success fee is Inverge's and is shown read-only; a creator chooses the first tranche from 15-25% of the raise instead of typing any figure. The band is superseded: D-045 fixes the tranche at 20% of the original target. |
| D-021 | 2026-10-19 | Accepted | The campaign detail page is tabbed, not one scroll: tab state lives in `?tab=`, the panel is chosen on the server, and the desktop rail repeats the most-scanned cards. |
| D-022 | 2026-10-19 | Accepted | The creator's story is a closed, typed block vocabulary rendered as data; the schema has no `html` member and the page never injects creator markup. |
| D-023 | 2026-10-19 | Accepted | Saved campaigns live in this browser behind a `SavedCampaignsStore` boundary and every surface says so; no surface may claim account synchronisation. |
| D-024 | 2026-10-19 | Superseded in part by D-026 and D-027 | A reward tier declares a fulfilment type, so a digital reward can never render a shipping line. The "shipping is display-only" clause is superseded: a creator now declares priced rules, and postage is a separate fulfilment charge (D-027). |
| D-025 | 2026-10-19 | Accepted | The backing flow is one route with step-id state and a conditional delivery step; its quote never invents a figure and it ends at a labelled provider-absent handoff rather than a success screen. |
| D-026 | 2026-10-19 | Accepted | A destination is an ISO 3166-1 alpha-2 code chosen from a searchable combobox, with names taken from the platform's own CLDR data; no surface holds its own country names and no destination is free text. |
| D-027 | 2026-10-19 | Accepted | A creator declares ordered shipping rules over named zones, each with a free, flat, deferred, or unavailable rate; the first matching rule wins. Postage is a separate fulfilment charge in the total due, never part of the escrowed contribution, and no postage is charged in this build. |
| D-028 | 2026-10-19 | Accepted | A reward carries what it includes, the variant groups the creator requires, optional add-ons that may or may not add a parcel, and an optional per-backer quantity limit; a digital add-on can never be marked as affecting shipping. |
| D-029 | 2026-10-19 | Accepted | Both payment routes are always offered — USDC from the backer's own wallet, and card or bank transfer through a licensed provider — and the backer's country never changes the contribution asset. The provider route is blocked and explained until a live quote exists. |
| D-030 | 2026-10-19 | Accepted | Campaign review decisions are a preview record until the API exists. |
| D-031 | 2026-10-19 | Accepted | The wallet feature ships as a provider-agnostic, preview-only surface: identity-bound (never an address), SDK-absent, with no fabricated address, signature, deposit, withdrawal, refund, or export. |
| D-032 | 2026-10-19 | Accepted | Line endings are normalized by Prettier, not by rewriting the tree. |
| D-033 | 2026-10-19 | Accepted | Choose MetaMask Embedded Wallets (Web3Auth) for web authentication and embedded Solana wallets; keep the provider-neutral `EmbeddedWalletPort` and supersede D-008 for the web client. |
| D-034 | 2026-10-20 | Accepted | One `/auth` route, a server-held BFF session, and a single viewer seam. |
| D-035 | 2026-10-20 | Accepted | Onboarding intent is a routing hint; the shared profile is persisted through the API. |
| D-036 | 2026-10-20 | Accepted | A local preview auth mode keeps UI work unblocked without pretending to be an Inverge session. |
| D-037 | 2026-10-20 | Accepted | Every intent sees the starting-point question; account type is asked before the name fields, as a preview-only prototype. |
| D-038 | 2026-10-20 | Accepted | Adopt the supplied 15-parent campaign taxonomy as canonical, keep the legacy broad category as a read-only compatibility field, and leave campaigns without an honest fit unassigned rather than guessing. |
| D-039 | 2026-10-20 | Accepted | Paginate and rank campaigns locally and deterministically until the API owns totals and recommendations; never present a page slice, count, or recommendation tier as live platform data. |
| D-040 | 2026-10-21 | Accepted | Discovery filters are global, honest, and URL-serialised; country/region values use ISO codes, null totals stay unreported, saved/featured/open views are real, and personal recommendations stay unavailable rather than faked. |
| D-041 | 2026-10-22 | Accepted | Idea discovery reuses the campaign category/subcategory taxonomy; the taxonomy fields are optional on a record and a child is URL-valid only under its selected parent. |
| D-044 | 2026-10-25 | Accepted | Product analytics is produced server-side after the response by the signed web producer, keyed by an anonymous HttpOnly session or internal user id; no browser beacon, IP address, or device fingerprint. |
| D-045 | 2026-10-25 | Accepted | The working-capital tranche is fixed at 20% of the original target and does not grow with overfunding; milestone weights total 100% of `eligibleRaised - initialTranche` on their own, and any surplus stays in escrow under the same milestone rules. |

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

### D-011: Prefix dashboard routes with `/d`

- Date: 2026-10-16
- Status: Accepted
- Owner: Web engineering

Context: Product (dashboard) routes lived at the site root alongside the marketing
and auth route groups, so `/ideas`, `/profile`, `/settings`, and their siblings
were indistinguishable from public marketing paths. The team wanted a short,
explicit namespace for authenticated product pages.

Decision: Namespace all dashboard pages under a short `/d` prefix: `/d` (home),
`/d/ideas`, `/d/pre-pledges`, `/d/notifications`, `/d/profile`, `/d/settings`.
The `(product)` route group still wraps them, and the home route keeps its
`loading.tsx`/`error.tsx` scoped inside a `d/(home)` group so those boundaries do
not leak onto sibling routes. Auth and marketing keep their root-level paths.
Permanent (308) redirects in `next.config.ts` map each old path, including nested
segments, to its `/d` equivalent.

Alternatives: A single unambiguous prefix such as `/app` (clearer but longer than
the team's request); splitting content under `/d` and account pages under `/u`
(arbitrary boundary, larger routing surface); middleware rewrites that keep the
old canonical URLs (duplicate paths and a `usePathname` mismatch); leaving URLs at
the root.

Consequences: Product links and route tests reference the `/d` paths, and old
bookmarks or shared links resolve through the redirects. `/u/*` stays free for a
future public creator profile. New dashboard surfaces must be added under
`(product)/d`, and the home `loading`/`error` files must stay in the `(home)`
group.

Revisit when: Public creator profiles need their own namespace, or the product
adopts a different top-level information architecture.

### D-012: Keep the shared money model in `src/lib/money`

- Date: 2026-10-16
- Status: Accepted
- Owner: Web engineering

Context: D-010 established one USD money model that home, pre-pledges, and ideas
share, but the type and its formatters sat in `features/home`. `ARCHITECTURE.md`
forbids a feature from exposing its internals to another feature, keeps
`components/ui` domain-neutral, and points at `src/lib` for cross-cutting pure
helpers. Both the ideas feature and the new `Amount` primitive need the
formatters, so the placement contradicted the dependency rule.

Decision: Move `MoneyAmount` and its three formatters to `src/lib/money.ts`.
Features import money from that module, and `components/ui/amount` reads it
through the `lib` dependency the architecture permits.

Alternatives: Keep the model in `features/home` and give the `Amount` primitive
a local formatter (duplicates money formatting and drifts from D-010's single
model); or keep it in `features/home` and let `Amount` take an already
formatted string, with `features/ideas` importing `features/home` for formatting
(forbidden by the dependency rule).

Consequences: Money is importable from a neutral layer by every feature and by
`components/ui`. This also removes a pre-existing `features/ideas` ->
`features/home` import. Import paths move from
`@/features/home/lib/format-money` to `@/lib/money`; behaviour is unchanged.

Revisit when: Money formatting gains a currency or rate source, or a locale
policy that belongs beside the finance domain rather than in generic `lib`.

### D-013: Add Tiptap 3 for the rich pitch editor

- Date: 2026-10-16
- Status: Accepted
- Owner: Web engineering

Context: The create-idea flow needs a rich pitch (headings, lists, links,
images) whose contents survive an API round-trip and are readable on the idea
page and in discovery. The platform has no rich-text capability, and the last
implementation used Tiptap 2, whose peer range excludes the installed React 19.

Decision: Add Tiptap 3.32.0 — `@tiptap/core`, `@tiptap/react`,
`@tiptap/starter-kit`, `@tiptap/extension-image`, and
`@tiptap/extension-placeholder` — pinned to one version line, as the editor's
packages are released together. Configure the Link extension that `starter-kit`
already bundles through `StarterKit.configure({ link: … })` rather than adding
`@tiptap/extension-link` separately, and harden it with
`rel="noopener noreferrer nofollow"`, `target="_blank"`, and `openOnClick: false`.
Restrict headings to levels 2–3 and reject base64 image sources. Store the
document as ProseMirror JSON typed structurally in `src/lib/rich-text`, so
fixtures and the server-side reader never import an editor package; link
addresses are normalised through that module's `sanitizeUrl`. Initialize with
`immediatelyRender: false` so the editor stays out of the server render and the
first client render.

Alternatives: Tiptap 2 (its React peer range rejects React 19); adding
`@tiptap/extension-link` alongside `starter-kit`'s bundled copy (registers the
extension twice); storing HTML (requires sanitisation before every render and
loses structure when re-opened for editing); a Markdown textarea (no structured
pitch layout and no in-editor affordances).

Consequences: The editor bundle reaches any route that renders
`RichTextField`, which stays a single Client Component. Pitch documents are JSON,
so readers walk the document instead of using `dangerouslySetInnerHTML`, and the
structural type must continue to match the editor's own JSON shape for the
document to flow both ways without a cast.

Revisit when: Collaboration, version history, or slash commands are needed (they
bring their own packages), or the editor's React peer range stops accepting the
installed React.

### D-014: Split idea routes between public `/ideas` and dashboard `/d/ideas`

- Date: 2026-10-16
- Status: Accepted
- Owner: Web engineering

Context: The ideas rework adds both public surfaces and creator-only surfaces.
D-011 had already prefixed dashboard routes with `/d` and, when `/ideas` was a
dashboard route, redirected `/ideas/:path*` to `/d/ideas/:path*` in
`next.config.ts`. Public discovery also lives at its own address, and a private
idea must stay readable by anyone holding its link, which a dashboard-namespaced
address cannot promise.

Decision: Public idea surfaces stay outside the dashboard — `/ideas` for
discovery, `/ideas/[id]` for the detail page (link-reachable for public and
private ideas alike), and `/topics/[slug]` for the topic directory. Creator
surfaces follow D-011 under `/d`: `/d/ideas` holds the creator's own ideas,
`/d/ideas/new` the create flow, and `/d/ideas/[id]/insights` the insights page.
The `/ideas/:path*` → `/d/ideas/:path*` redirect is removed, because config
redirects are matched before the filesystem and would shadow the public pages;
`/discover` permanently redirects to `/ideas` in its place, and the site header,
footer, hero, about page, and their tests point at the new address.

Alternatives: Every idea surface under `/ideas/*` (the plan's literal paths, but
it puts creator-only pages outside the dashboard namespace D-011 established);
keeping discovery at `/discover` (least churn, but contradicts the single public
discovery surface and the detail paths later phases assume).

Consequences: Two addresses now describe different things — `/ideas` is public
discovery and `/d/ideas` is the creator's own list — so a link to "ideas" is
ambiguous in prose and must be checked in code. The public pages carry the
marketing shell rather than `AppShell`.

Revisit when: Ideas gain an authenticated-only public review state, or the
discovery surface needs the product shell's navigation. The creator-surface
half of this decision was superseded by D-017: creator surfaces moved from
`/d/ideas*` to `/d/creator/*`. The public half (`/ideas`, `/ideas/[id]`,
`/topics/[slug]`) stands unchanged.

### D-015: Add a heading display face and unify the content measure

- Date: 2026-10-16
- Status: Accepted
- Owner: Product and web engineering

Context: The public discovery redesign needs a warmer, more editorial heading
voice than Geist Sans provides, while body copy and numeric data stay legible in
the existing faces. Separately, discovery rendered at a wider measure
(`max-w-[90rem]`) than the marketing shell (`max-w-7xl`), so the sticky header
and footer did not line up with the page body beneath them.

Decision: Load **Outfit** through `next/font`, expose it as `--font-display`,
and use it for headings (`h1`–`h4`). Keep Geist Sans for body copy and Geist
Mono for transaction identifiers, timers, percentages, and financial values.
Move the page measure into one shared, domain-neutral `Container` primitive
(`max-w-7xl` with `px-5 sm:px-8 lg:px-12`), and have marketing, discovery, and
the product shell consume it so header, body, and footer share one width.

Alternatives: Keep Geist Sans for headings (no editorial contrast, but no new
font); use a serif display face (reads as editorial commentary rather than a
product surface); leave discovery at the wider measure (header never aligns with
the body); duplicate the width in each feature (drifts, and both copies must be
changed together).

Consequences: Marketing and product share one heading hierarchy, and headings
are set at the element level in `globals.css` so a new section inherits it. The
marketing `Container` becomes a thin re-export of the shared primitive. Outfit
adds one font request at build time; the glyphs are limited to the Latin subset.
The measure narrows the discovery body from 1440px to 1280px, which stays inside
the intended 1200–1320px range.

Revisit when: The brand adopts a different heading voice, or the product needs a
second measure (for example a full-bleed campaign page).

### D-016: One shared app shell for every dashboard route

- Date: 2026-10-17
- Status: Accepted
- Owner: Web engineering

Context: `/d` screens were each laying out their own header, search, and
navigation, so the dashboard had no single frame and every new route had to
reassemble the same furniture. Authentication (D-008) is not implemented yet,
so the shell still has to render an honest viewer without inventing a session.

Decision: `AppShell` owns the whole dashboard frame - a textured forest sidebar
with grouped navigation, a desktop topbar carrying the only search entry point,
and the mobile header plus bottom navigation. Every `/d` route renders inside
one `(product)` layout that assembles `ShellData` on the server from a single
`getDashboardViewer()` seam, which reads preview identity and capabilities and
is the one place a Privy session will attach later. Search lives in the shell
and posts to `/d/discover`, the in-shell copy of D-014's discovery surface, so
a dashboard viewer can search without leaving the frame; `/ideas` remains the
public address for the same catalogue.

Alternatives: Keep per-page headers (every route keeps drifting, and no single
search entry point can exist); make `/d/discover` a redirect to `/ideas` (drops
the viewer out of the shell, and the mobile bottom navigation loses its
destination); gate `/d` behind middleware now (nothing to gate against, since
no session exists, and the routes must stay reachable).

Consequences: The sidebar surface is a CSS class over the brand's own contour
artwork rather than a flat token, so contrast is carried by an explicit
gradient layer that must stay if the artwork changes. Viewer identity is
preview data, and the shell labels it as such, so no metric or capability shown
in the frame may be read as live account state. The topbar search and the
in-page filters on `/ideas` and `/d/notifications` are distinct controls with
distinct labels: one navigates to discovery, the others filter a local list.

Revisit when: A session exists and `getDashboardViewer()` can return a real
viewer, or when the dashboard grows a destination that needs to replace one of
the five mobile navigation slots.

### D-017: Move every creator surface under `/d/creator`

- Date: 2026-10-17
- Status: Accepted
- Owner: Web engineering

Context: D-014 placed the creator's idea surfaces directly at `/d/ideas*`
while the dashboard rework (D-016) grouped every other destination under a
namespace (`/d/notifications`, `/d/pre-pledges`, `/d/profile`). "Ideas" alone
became the one unnamespaced area of `/d`, and the two surfaces the studio still
lacked — a per-idea workspace and a cross-idea feedback inbox — needed a home
that does not collide with the public `/ideas` address in prose or in code.

Decision: Every creator surface moves under `/d/creator`: the studio overview
at `/d/creator`, the creator's own list at `/d/creator/ideas`, the create flow
at `/d/creator/ideas/new`, one workspace per idea at `/d/creator/ideas/[id]`,
feedback setup at `/d/creator/ideas/[id]/feedback`, per-idea insights at
`/d/creator/ideas/[id]/insights`, the analytics home at `/d/creator/analytics`
(was `/d/ideas/insights`), and the cross-idea feedback inbox at
`/d/creator/feedback`. `next.config.ts` 308-redirects the old paths
(`/d/ideas`, `/d/ideas/new`, `/d/ideas/insights` → `/d/creator/analytics`, and
a `/d/ideas/:path*` catch-all, exact rules before the wildcard) so existing
links and form drafts survive the move. The workspace resolves its `[id]`
against the account's own idea list and 404s anything else, and the inbox is
read-only: responses stay anonymous and reply state is absent until a reply
surface ships with the feedback API.

Alternatives: Keep the flat `/d/ideas*` paths (least churn, but the studio
keeps growing under an unnamespaced address and the new workspace still needs
a route); move only the new surfaces and leave the old ones in place (two
addresses for the same pages, which D-014 already showed is the expensive
option); drop redirects to keep `next.config.ts` clean (breaks every existing
link, including saved form drafts that round-trip through `/d/ideas/new`).

Consequences: A single `/d/creator` prefix now owns every creator surface, so
sidebar, mobile bottom navigation, and in-page links highlight exclusively —
one route family owns each tab. Public idea pages stay at `/ideas/[id]` per
D-014's public half, so the workspace links out to the public page rather than
rendering it. Only routes that resolve for a given idea render as links: a
draft that was never published has no public page or feedback setup, and only
the idea with an analytics dataset gets analytics. The redirect table is
transitional and should be deleted once no reachable link uses the old paths.

Revisit when: Auth lands and the workspace resolves a real account's idea list,
or when creator surfaces outgrow the single-level `/d/creator` grouping (for
example campaigns or audience tools arriving with their own data models).

### D-018: Build the campaign experience against a single preview seam

- Date: 2026-10-18
- Status: Accepted
- Owner: Web engineering

Context: The campaign surfaces (discovery, detail, contribution preview, backer
history, milestone accountability, creator workspace) are required for the
Phase 0 demo, but the wallet, the escrow program, the indexer, and the campaign
API do not exist in this repository yet. A campaign UI is the most dangerous
surface to populate with plausible-looking placeholders, because a fabricated
progress figure or transaction reference reads as a claim that money moved.

Decision: The whole experience lives in one feature module,
`src/features/campaigns`, and the only module that knows the data is preview is
`server/`. Routes are marketing (`/campaigns`, `/campaigns/[slug]`,
`/campaigns/[slug]/back`, `/campaigns/categories/[slug]`) and product
(`/d/backing*`, `/d/creator/campaigns*`). Every fixture carries `demo: true`;
every `TransactionRef` is `null` and every fiat leg is `null`, so a receipt says
"None recorded" rather than showing an explorer link that would not resolve.
Money is `MoneyAmount` in USDC-at-1:1 with no invented conversion, every share
is integer basis points, and escrow terms are per-campaign `EscrowTerms` rather
than platform constants baked into a sentence. Unimplemented steps are blocked
with the reason they are blocked — the fiat on-ramp waits for a live quote, and
a campaign cannot be submitted until identity verification and the application
fee exist — instead of showing a success screen.

Alternatives: Populate the surfaces from a mock API layer (hides the preview
boundary behind a network seam and invites a real fetch later that silently
changes behaviour); build the campaign API first (out of scope for this
repository, which is the web client per D-003); render the surfaces with empty
states only (honest, but the demo cannot show the accountability story the
product is being judged on).

Consequences: Any future campaign work has one seam to replace, and the demo
cannot be mistaken for a live financial system because the fixtures themselves
say so. The cost is that campaign UI cannot be exercised end to end until the
API exists, so the preview data must be kept consistent by hand — the fixture
totals (use-of-funds, milestone tranches, the first-tranche band) are asserted
by test for that reason.

Revisit when: The campaign API and escrow indexing land, or when a wallet makes
an on-chain state readable, at which point `server/` is replaced rather than
extended.

### D-019: Campaign media is a link, and a video is preferred but optional

- Date: 2026-10-18
- Status: Accepted
- Owner: Web engineering

Context: Campaign media was requested as a hero that prefers a video but allows
photos, may hold several items as a carousel, and lets a creator attach images
and link videos inside the story. This build has no file storage and vendors no
video asset, so an upload control could only ever fail, and a fixture carrying a
clip would mean either committing invented footage or depending on a third-party
host at render time — both of which the image fixtures already refuse to do.

Decision: `CampaignMedia` is an image or a video. A video's `VideoSource` is an
`upload` path, a `direct` file link, or a YouTube or Vimeo id; an embed URL is
built from the parsed id, never from the creator's string, so no input can reach
an `<iframe>` or a `javascript:` target. Images accept an https URL or a
same-origin path, and a remote URL is served directly because the image
optimiser refuses unconfigured hosts. The hero is a
`CampaignMediaCarousel`: the controls are real buttons rather than a container
key handler, only the active item is mounted, and a hosted video requests
nothing from its host until a backer presses play. The creator's Media wizard
step edits an ordered link list with reorder and a poster marker, its upload
control is disabled with the reason, and the step is optional because an
image-less campaign falls back to its cover. No fixture ships a video.

Alternatives: Support uploads by committing a sample clip (fabricated media, and
a binary blob in a fixture set that is otherwise provenance-documented); embed a
public sample video from someone else's CDN (breaks the rule that a preview does
not depend on a third party at render time); render a labelled "video
unavailable" slot (proves the layout, demonstrates nothing).

Consequences: The video path is real and is exercised by unit tests and by the
wizard, where a creator can paste a genuine link and preview it, but the demo
hero shows photographs until a real clip is dropped in. That is a deliberate
limitation to state plainly rather than a gap to paper over.

Revisit when: File storage exists, or a real campaign supplies footage, at which
point `upload` becomes reachable and the fixtures can carry one clip.

### D-020: The success fee is Inverge's, and the first tranche is a band

- Date: 2026-10-18
- Status: Accepted; working-capital half superseded by D-045
- Owner: Product owner and web engineering

Context: The creator wizard exposed the success fee as an editable percentage
and the first tranche as a free numeric field with a 25% ceiling. Both are
Inverge's parameters rather than a creator's: FR-505 fixes the All-or-Nothing
success fee at 5% of each released tranche, and FR-503a sizes the working-capital
tranche to milestone one's budget within a published band. Letting a creator type
either one invites a draft that does not match what the platform would apply.

Decision: The wizard shows the success fee read-only, named as the platform's
fee, at the rate the campaign was approved at or the current platform rate for a
new draft. The first tranche is a select of one-percent steps between 15% and
25%, still constrained to milestone one's own share, and the platform parameters
live once in `lib/escrow.ts` (`PLATFORM_SUCCESS_FEE_BPS`,
`WORKING_CAPITAL_MIN_BPS`, `WORKING_CAPITAL_MAX_BPS`) which the fixtures import
rather than repeating. The published per-campaign `EscrowTerms` remain the only
source the accountability copy reads, so display still quotes the campaign's own
terms rather than the platform default.

Note the divergence: FR-503a states a cap of 20-25%, and the product owner has
directed a 15-25% band. This entry records that choice rather than silently
widening the SRS; `docs/Inverge_PRD_SRS_v1.2.md` should be updated to match, or
this decision superseded, before the band is treated as settled.

Alternatives: Keep both fields editable (a creator could publish terms the
platform would not honour); hard-code 5% in the display path (contradicts the
rule that a page quotes the campaign's published terms); offer a free numeric
input bounded by validation (accepts 15.4%, and puts the floor in a message
rather than in the control).

Consequences: A creator cannot publish a rate the platform would not apply, and
the one-percent steps make the allowed band obvious before submission. The band
is now a platform setting with two sources of truth until the SRS is updated,
which is why the divergence is recorded here.

Superseded: D-045 fixes the initial tranche at 20% of the original target and
removes the creator's band. The success-fee rule stands.

Revisit when: The settings API can supply these parameters, or a campaign type
needs a different fee.

### D-021: The campaign detail page is tabbed, with a rail beside it

- Date: 2026-10-19
- Status: Accepted
- Owner: Web engineering and product

Context: The detail page had grown into one continuous document with an in-page
anchor bar. A backer who wanted the reward terms scrolled past the whole
milestone contract, and a page that long flattens the important information into
the unimportant. The bar also scrolled rather than switched, so `?section=` links
were the only way to deep-link and the panels were all mounted at once.

Decision: The detail page is one full-height two-column grid —
`lg:grid-cols-[minmax(0,1fr)_20rem]`, `xl:…_23rem` — with the panel body in the
main column and a supporting rail on the right. Tab state is a query string
(`?tab=`), validated against a known tab list in `lib/campaign-tabs.ts` and
resolved on the server in `page.tsx`, so a shared link opens on the right tab
with no client-only flash. `CampaignTabs` renders a real `<a href="?tab=…">` per
tab and intercepts a plain left click to swap the panel in place with
`history.replaceState` (no extra history entry, no navigation). Arrow keys move
the selection, `aria-selected` names the active tab, and the panel is
`aria-labelledby` its tab. Only the selected panel is rendered, so the other
tabs' content is absent rather than `hidden`. The rail (desktop only) repeats
funding, rewards, facts, escrow, and FAQs as `RailCard`s; it is hidden entirely
on mobile, where the same content is reached through the tabs and the mobile
funding bar.

Alternatives: Keep the single scrolling document with a sticky anchor bar (the
problem being solved); make each tab its own route (four fetches and four 404
checks for one record, and a tab is not a resource); keep every panel mounted and
toggle visibility (a hidden panel is still in document order and still found by
"find in page", which is exactly the noise the tab was meant to remove).

Consequences: Only the selected panel is rendered into the document, so the other
tabs' content is not in the DOM, not in the accessibility tree, and not
reachable by "find in page" — which is what the tab was for. It is, however,
still present in the response as unrendered element data in the React payload
(verified against the running server: the text of the unselected panels appears
in the serialized payload and not in the HTML). A crawler that reads the raw
response therefore still sees every tab's text, so the panels are not private;
if that becomes a problem, the click should become a real navigation instead of
an in-place swap. The rail duplicates the rewards and facts markup; the copy is
shared through `RewardFulfilmentLine` and `CampaignFacts` rather than copied, so
the two placements cannot drift.

Revisit when: A tab needs its own URL that is shareable independently of the
campaign (for example a permalink to one update), or a panel's content becomes
expensive enough that server-rendering all of them is wasteful.

### D-022: The creator's story is typed blocks, not markup

- Date: 2026-10-19
- Status: Accepted
- Owner: Web engineering

Context: A campaign story needs headings, prose, lists, quotes, notes, and
images in an order the creator controls. The obvious shortcut — store HTML and
render it — puts arbitrary markup and script from a creator into a page about
money, and requires sanitisation on every render.

Decision: `StoryBlock` is a closed union: `heading`, `paragraph`, `list`,
`quote`, `note`, `image`, `video`, and `gallery`. It has no `html` member and no
free-form attribute bag. `CampaignStoryBlocks` switches on `kind` and renders
each block as a component the page owns; text is always rendered as text. The
image and video members reuse the `CampaignImage`/`CampaignVideo` shapes from
D-019, so a story image follows the same link-not-upload rule as the hero.

Alternatives: Store HTML and sanitise it (two dependencies and a sanitiser to
keep current, and a bypass is a page-wide defect); store Markdown (a parser plus
a rendering policy, and no structural type for the editor or the test to assert
against); store ProseMirror JSON like the idea pitch (D-013) and reuse the rich
editor (heavier for a narrative, and it brings the editor bundle to the creator
wizard).

Consequences: A new block kind is a schema change plus a component, which is the
intended cost. Creator content cannot break the page layout, and the render path
is unit-tested against hostile text.

Revisit when: Creators need embeds or interactive blocks, which would need an
allowlist rather than the current closed union.

### D-023: Saved campaigns are device-local, behind a store boundary

- Date: 2026-10-19
- Status: Accepted
- Owner: Web engineering and product

Context: "Save for later" needs somewhere to save. This repository has no
session, no account, and no campaign API (D-018), so there is nowhere to attach a
per-account list. The failure mode to avoid is a button that appears to persist a
campaign and then loses it, or copy that implies the save follows the reader to
another device.

Decision: Saved campaigns are kept in this browser under
`inverge.saved-campaigns`, behind a `SavedCampaignsStore` interface
(`read`, `write`) that is the only thing components talk to. The stored value is
a versioned envelope; `parseSavedCampaigns` drops a value written by a different
schema version, drops records it cannot trust, and dedupes by `campaignId`
instead of throwing, because losing a convenience must not break the page. A
storage that *exists but refuses access* is reported as a failure rather than
read as empty: `read()` rejects, and the dashboard distinguishes "nothing saved
yet" from "this browser refused the store". `SAVED_CAMPAIGNS_SCOPE` is the single
sentence describing the limitation and it is what every surface renders; no
surface claims account synchronisation.

Alternatives: Persist in a cookie (sent to the server on every request, and no
server resource to receive it); add a real backend store now (out of scope for
this repository and would be a fabricated service); render the control disabled
with "coming soon" (drops a usable feature to avoid writing one sentence of
honest copy).

Consequences: A save does not follow the reader to another device or another
browser, and the copy says so. When the campaigns API exposes a saved-campaigns
resource, one implementation of the interface is replaced and no component
changes. The `read`-failure branch is currently reachable only through a storage
access error, not a remote failure; the interface shape is what the future store
will satisfy.

Revisit when: Sign-in exists and a saved-campaigns resource is available, at
which point the local store becomes a cache or is dropped.

### D-024: A reward declares its fulfilment, so a digital reward never shows shipping

- Date: 2026-10-19
- Status: Superseded in part by D-026 and D-027
- Owner: Product owner and web engineering

Context: Rewards had no way to say whether they were digital, posted, or both,
and posting a physical reward needs to tell a backer where it can go. Shipping
cost is the trap: Inverge has no carrier integration and no rate source, so any
number Inverge itself calculated would be invented, and a shipping figure folded
into the contribution total would misstate what the escrow holds.

Decision: `SupportTier` gains `fulfilment: RewardFulfilment | null`
(`digital` | `physical` | `mixed`) and `shipping: RewardShipping | null`, and
`shipping` is non-null only for a reward that actually posts — itself, or because
one of its add-ons does. Every surface renders the fulfilment pills through one
`RewardFulfilmentLine`, so a digital reward can never show a shipping line. No
address is collected anywhere in this build, because there is nowhere to send it
and no fulfilment process to receive it.

Superseded in part: this decision first said shipping was display-only and
Inverge quoted no postage at all. D-026 replaced free-text destinations with
country codes, D-027 replaced the bare destination list with ordered rules and
creator-declared rates, and D-028 made a reward's extra items able to add a
parcel. The surviving rules are the ones above: the fulfilment type decides
whether shipping exists, one component renders it, and no address is collected.
The record below is kept as it was written, with the price and
`parseShippingRegions` clauses now owned by D-026 and D-027.

Original text: `RewardShipping` was the creator's own list of destinations plus
optional free-text terms, destinations were typed one-per-line and parsed by
`parseShippingRegions`, and the fulfilment line showed destinations and terms and
never a price.

Alternatives: A single boolean "physical" (cannot express a reward that is both,
which the campaign fixtures already need); collect a shipping address in the
backing flow (a delivery address with no fulfilment process, no consent record,
and no retention policy — a privacy liability that looks like a feature); show a
shipping estimate (a number with no source); bill shipping inside the
contribution (misstates the escrow and the refund).

Consequences: A backer sees where a reward can be posted and who set the rate,
and the escrowed contribution never includes a shipping figure. Address
collection and a fulfilment handoff are still missing and are stated as such. The
reward artwork path is exercised by the wizard and its tests: the repository has
no authentic reward photography, and D-019's rule against stock substitution
applies, so the one reward image in the fixtures is a vendored placeholder that
the fixture comments name as such.

Revisit when: A carrier or fulfilment provider is chosen, at which point shipping
becomes a quoted amount and address collection becomes a consented, retained
record rather than a form field.

### D-025: The backing flow is step-id based, and it ends where the provider begins

- Date: 2026-10-19
- Status: Accepted
- Owner: Web engineering

Context: The contribution flow had to handle a step that only sometimes exists
(delivery, only for a posted reward), an amount that can come from a reward or
from the backer, and a final "pay" action with no payment provider in this
repository. A flow that shows a success screen after a button press would be the
single most misleading thing on the site.

Decision: The flow is one route with its step held as a `ContributionStepId`
string rather than an index, so the conditional `options` (delivery) step can
appear and disappear without the current step silently shifting. Selecting a
reward sets the amount from the reward's own `minimum` and adds an optional
"Additional support" extra; with no reward the backer types a free amount, and
switching selection keeps what was typed so nothing is lost. `quoteLines` is the
one place the money story is assembled. It states that shipping is not quoted by
Inverge (never a figure), keeps shipping out of the total, and on the fiat
on-ramp branch marks the exchange rate, provider fee, total charged, and
estimated settlement as "Not available" rather than inventing a rate. The final
action is "Continue to payment", and pressing it does not fake a payment: the
flow swaps to a neutral, non-success panel headed "Payment is not connected in
this build" that shows the quote, describes the three steps a provider would
perform, and lists the handoff states the flow is built to display
(`handoffStates`).

Alternatives: An index-based step and a fixed step count (the conditional step
breaks it); make delivery a field inside the reward step (shipping terms and
destinations are a separate decision from choosing the reward, and the step
disappears cleanly for digital rewards when it is its own step); show a success
screen with a demo notice (a success screen for a payment that did not happen is
read as a receipt, notice or not); omit the handoff screen entirely and stop at
review (leaves the flow visibly unfinished and hides what the real integration
must do).

Consequences: The flow is honest about where it stops and what the real
integration will show. Step state is per-page-view and is not persisted across a
refresh or a sign-in, because the infrastructure to keep a draft does not exist.
The quote, the fee line, and the shipping statement are pinned by unit and
component tests, including the rule that no figure is attached to shipping.

Revisit when: A payment provider and a quote service are integrated, at which
point the handoff panel is replaced by the provider's own step and the
`handoffStates` names map onto real states.

### D-026: A destination is a country code, chosen from a searchable combobox

- Date: 2026-10-19
- Status: Accepted
- Owner: Web engineering

Context: The first shipping model took destinations as free text ("Nigeria",
"Ghana"). Free text cannot be matched against a rule, cannot be validated, cannot
be switched to a new market, and invites a typo to silently become a destination
that matches nothing. It also quietly made the product Nigeria-centred: a list of
hand-typed names is a list of the countries someone happened to think of.

Decision: A destination is a `CountryCode` — an ISO 3166-1 alpha-2 string — and
the only picker is `CountrySelect`, a combobox whose text input *is* the control
(ARIA's pattern for a long list) with `role="listbox"` options, a live
`aria-activedescendant`, and Arrow/Home/End/Enter/Escape/Tab handling. The codes
are written out in `src/lib/countries.ts` because the alternative — asking the
platform whether every two-letter combination is a region — also returns
withdrawn codes (`AN`), CLDR aggregates (`EU`, `QO`), and private-use codes
(`ZZ`). The *names* come from `Intl.DisplayNames` at runtime, so no surface holds
a country name of its own and a name is never a stale transliteration. A test
fails if a written code is not a region CLDR knows, which is what makes a
hand-written list safe. Search folds diacritics, so "cote" finds Côte d'Ivoire,
and ranks a code match first, so "gb" finds the United Kingdom.

Alternatives: Keep free text and normalise it later (the normalisation table
would be the country list, arrived at later and worse); extend the shared
`Select` (it is a short pick-list that opens a menu; 249 countries need a typing
filter, and the two controls have different reasons to change); take the list
from a dependency (a new dependency for data the platform already ships, and one
more thing to keep current).

Consequences: Destinations are comparable, so a creator's rule, a wizard zone,
and a backer's choice all speak the same language, and an unsupported destination
can be shown and blocked rather than mis-priced. The picker is a second
combobox-like control beside `Select`; the duplication is deliberate and each is
pinned by its own tests. `CountryCode` is `string` rather than a union, so a
value can still be unvalidated at a boundary — `normaliseCountryCode` is that
boundary, and a URL or a stored draft must pass through it.

Revisit when: A destination needs sub-national precision (a state, a region, a
postcode area), at which point the model needs a second level rather than a
longer list.

### D-027: A creator writes ordered shipping rules; postage is a separate charge

- Date: 2026-10-19
- Status: Accepted
- Owner: Product owner and web engineering

Context: "Where can this go?" and "what does it cost?" are two questions, and
the first version answered neither: a plain list of destinations said nothing
about price, and a worldwide list could not express "everywhere except Brazil".
The creator is also the only party who knows their own postage — they have the
supplier quote and the courier account — while Inverge has no carrier integration
and no rate source, so a figure Inverge calculated would be invented.

Decision: `RewardShipping` holds the origin country, optional named `zones`
(a name plus member countries), an ordered `rules` list, optional terms, and an
optional customs note. Each rule is a `coverage` (`worldwide` | `zone` | `country`
| `origin`) plus a `rate`: `free`, `flat` with an amount and a `unit` or `order`
basis, `deferred` with a note, or `unavailable` with a note. The **first matching
rule wins**, which is the only arrangement in which "everywhere" plus an
exclusion can mean what a creator intends, so a rule placed below a
`worldwide` rule is reported as an error rather than accepted. The wizard
validates coverage, names the gap when no rule reaches the rest of the world
without listing what is missing, and refuses to publish a reward whose policy is
not usable.

Postage is a **fulfilment charge**, not part of the contribution: the escrowed
and refundable amount stays reward + add-ons + additional support, and the total
due adds postage on top. In this build no postage is charged at all, because
there is no provider to charge it through; the flow shows what the creator
declares and says where the money would go. A rate that has not been quoted
renders as pending with the creator's own reason, never as a number, and a rate
that could not be calculated is never silently downgraded to "deferred".

Alternatives: One flat worldwide price (cannot express an exclusion or a
different real cost per region); weight-based rates (no weight is captured on a
reward or an add-on, so the basis would have to be invented); provider-calculated
rates (no provider); lanes with a per-country table maintained by Inverge (Inverge
cannot know a creator's courier prices, and a central table would be wrong for
every creator who negotiated something else).

Consequences: A backer sees the creator's own rules, in the creator's own order,
with the destination they chose resolved against them; a refused destination is
shown as refused and blocks the step; a destination the policy never covered is
shown as a gap in the policy. Two rate models are **not** implemented and are
known gaps: weight-based pricing and provider-calculated (live carrier) pricing.
Customs and duty are described but never calculated, collected, or remitted.

Revisit when: A carrier integration exists, at which point a rule can gain a
quoted rate model beside the declared ones rather than replacing them.

### D-028: A reward declares what it includes, its options, and its limit

- Date: 2026-10-19
- Status: Accepted
- Owner: Product owner and web engineering

Context: A reward price and a paragraph of prose left the backer to guess what
they were actually getting, and left the creator no way to express a real
constraint: a colour that must be chosen before a kit can be boxed, an optional
printed guide that travels in its own parcel, a reward the creator can only make
four of.

Decision: `SupportTier` gains four required members. `includes: string[]` is what
the backer receives, listed one per line in the wizard and rendered as a list on
the reward card and in the reward step. `variants: RewardVariantGroup[]` is what
the creator must ask before fulfilment; every group is required (there is no
optional variant, because a fulfilment choice cannot be left to the packer).
`addOns: RewardAddOn[]` are extra items with their own price and their own
`affectsShipping`, and a digital add-on must not claim to affect shipping — an
add-on that affects shipping makes the reward post even when the reward itself is
digital. `quantityLimit: number | null` is how many of this reward one backer may
take; `null` means a single unit, and the quantity control appears only when the
limit is above one. The fields are required, not optional, so every construction
site has to decide.

Alternatives: Free-text contents (unlistable and unvalidated); make variants
optional (the creator would have no way to say "this must be answered");
per-add-on quantity (real, but it multiplies the inventory question and no
inventory count exists to spend it against); fold add-ons into the reward price
(loses the choice, which is the point); an `includes` string rendered as
markup (D-022's rule).

Consequences: A reward card and the reward step both say what is in the reward,
what still needs choosing, what can be added, and what the limit is — with the
same component, so a card and the flow cannot drift. Inventory is *not* tracked:
a quantity limit is a per-backer cap, not a remaining-stock count, and no surface
claims otherwise. Add-ons and variants are preserved through the creator draft
but are **not** authored in the wizard yet; only origin, zones, rules, terms,
customs, includes, and the quantity limit are editable.

Revisit when: Inventory has a real count, at which point a limit becomes an
availability and the card must say when something has run out.

### D-029: Both payment routes are always offered, and the country changes nothing

- Date: 2026-10-19
- Status: Accepted
- Owner: Product owner and web engineering

Context: An international backer paying by card would otherwise be told that
their country is not supported, or worse, be quietly moved onto a naira rail
because of where they are. And a card backer cannot review their true cost,
because the amount that settles depends on a conversion the platform cannot
compute without a licensed provider's quote.

Decision: `routeAvailability` always returns two routes. Paying in USDC from the
backer's own wallet needs no conversion and no rate, so it is available and its
total is exactly the figure above. Paying by card or bank transfer is labelled
"Card or bank transfer" — never by the asset it settles into — and is blocked
with a stated reason until a licensed on-ramp provider and a live quote are
connected; where a campaign also settles in cNGN, that only changes the route's
description. Neither route requires the campaign to support a particular
settlement asset for the *backer*: a campaign's
`supportedSettlementAssets` changes which asset the provider settles into, not
whether the backer may pay by card. On the blocked route the quote's fiat lines
(charge currency, exchange rate, provider fee, amount that settles) read "Not
available" and are marked unknown rather than carrying an invented rate, and the
backer's destination never changes the contribution asset.

Alternatives: Offer only the wallet route (hides a route the product intends to
have, and reads as "no cards"); hide the card route until a provider exists
(keeps the page tidy but tells an international backer nothing about how they
will pay); choose a route from the backer's country (a geography heuristic
deciding how someone's money moves); show an indicative rate (a fabricated
number attached to someone's money).

Consequences: The flow is usable end-to-end on the wallet route and honest on
the other. No provider is connected, so no card payment can be made in this
build: the route is visible, explained, and disabled, and the final step is the
labelled handoff panel rather than a success screen. Nothing here is a
confirmation: a redirect or a client callback would not be one either.

Revisit when: A licensed on-ramp provider is contracted and can quote a live
rate, at which point the blocked route becomes available and its quote lines
carry the provider's own figures.

### D-030: Campaign review decisions are a preview record until the API exists

- Date: 2026-10-19
- Status: Accepted
- Owner: Product owner and web engineering

Context: The campaign domain already models `CampaignReview` and
`CampaignPhase` separately, but there was no surface where an operator could
see a submitted campaign or record a decision, and no review endpoint, Prisma
review state, or authenticated web session to write through. Rendering a
decision control without a place for the decision to go would either imply a
production change that never happened or invent an audit trail.

Decision: `/admin` becomes the workspace overview, `/admin/campaigns` the
review queue, and `/admin/campaigns/[id]` the review detail. A decision moves the
review state and the phase together through one pure rule
(`decideCampaignReview`): approve to `approved`/`funding`, request changes to
`changes-requested`/`changes-requested`, reject to `rejected`/`rejected`. Only a
campaign in `in-review` can be decided, change requests and rejections require a
trimmed reason of at least twenty characters, and `campaign:review` is enforced
in the domain action and the UI. Because no API exists, the decision and its
audit event are written to a browser-local store and every surface labels them
as preview-only and non-authoritative; production admin access remains denied
rather than simulated. KYC (FR-103) and the application fee (FR-311) are named
as missing preconditions and never fabricated.

Alternatives: Build the review control against an optimistic client state and
present it as authoritative (invents a production change); add a Prisma review
enum and migration now (changes the schema before the API contract is agreed);
leave `/admin` as a redirect and defer review entirely (keeps the lifecycle
one-sided and the queue non-existent); block the queue until the API lands (no
reviewable surface at all, and no testable decision rules).

Consequences: Review decisions are real, permission-checked, reasoned, and
recorded, and the domain rules are unit-tested independently of the UI. Nothing
here publishes a campaign, moves money, or confirms identity: approving changes
the local preview state, and the server-backed discovery reader is untouched.
The local store is explicitly disposable and is not an audit trail. The API must
repeat the permission and state checks, enforce FR-103 and FR-311, append the
authoritative audit entry, and own the review states.

Revisit when: An authenticated admin session and a campaign review endpoint
exist, at which point `admin-review-store` is replaced by an API client and the
Prisma review states are added in the same change.

Revisited 2026-10-19: The API now owns the review lifecycle. `inverge-api` adds
`CampaignReviewStatus`/`CampaignReviewAction`, an append-only
`CampaignReviewEvent`, review fields on `Campaign`, and
`POST /admin/campaigns/:id/review` behind `PrivyAuthGuard` + `AdminGuard`, with
FR-103/FR-311 enforced before a campaign can be submitted for review and a
non-refundable, single-use application fee charge (`applicationFeeChargeId`
`@unique`). The web preview is unchanged and still writes to the browser-local
store; it is now explicitly a disconnected preview of an endpoint that exists,
not a stand-in for a missing one. Replacing `admin-review-store` with an API
client sits with the authenticated-session work.

### D-031: The wallet is provider-agnostic and preview-only until an SDK and session exist

- Date: 2026-10-19
- Status: Accepted
- Owner: Web engineering and product

Context: The wallet and payment experience had to be built, but this repository
has no embedded-wallet SDK in `inverge-web/package.json`, no authenticated
session (`getDashboardViewer()` returns a labelled preview identity), and no
provider credentials. The backend `inverge-api` already models `WalletAccount`
and a Privy reference adapter behind `EmbeddedWalletPort`, and D-008 names Privy,
while the product direction for this work names MetaMask Embedded Wallets
(formerly Web3Auth). Building either integration now would need a dependency,
credentials, a real session, and a decision that this repository cannot make on
its own. A screen that manufactures an address, a QR code, a signature, or a
"confirmed" payment would misrepresent custody and money.

Decision: The web client gets a provider-agnostic wallet feature
(`src/features/wallet`) whose provider identity is a value, not an import: the
preview account names MetaMask Embedded Wallets with `configured: false` and no
address, and no provider SDK is added. Inverge's internal user id is the stable
identity and the address is only ever an attribute of a provisioned account; no
route parameter, fixture, or label uses an address as an identity. Every wallet
surface reads one capability audit (`lib/capabilities.ts`) built from integration
facts, so provisioning, balance, activity, receive, signing, on-ramp, withdrawal,
refunds, and export are each marked `available`, `preview`, or `unavailable` with
the missing mechanism named. Balances are labelled samples, activity is derived
from preview contribution records, and every item carries `demo: true` and a null
transaction. Transfer validation (base58 destination bytes, wrong-network EVM
detection, integer token amounts, sample-balance sufficiency) runs locally and
always ends at a labelled "not submitted" handoff. The contribution checkout
receives a serialisable `WalletFundingSnapshot` and blocks settlement for
insufficient, unavailable, or unsupported-asset funding, while signing-unavailable
continues to the existing labelled handoff. Live provisioning, on-ramp,
withdrawals, refunds, key export, and webhook verification are reported as not
implemented rather than simulated, and the provider conflict is escalated rather
than resolved silently.

Alternatives: Install a MetaMask Embedded Wallets SDK and wire it against a
stubbed session (would fabricate provisioning without a real account binding and
pre-empt the provider decision); keep building on the API's Privy adapter
(contradicts the product direction and still needs credentials and a session);
render a finished-looking wallet over static data (invents addresses and money);
omit the wallet entirely until the provider is chosen (leaves the checkout and
escrow/refund story untestable).

Consequences: The wallet routes, validation, state model, and honest unavailable
states are real and unit-tested, and the provider can be chosen without rewriting
the feature because only `server/wallet.ts` and `lib/capabilities.ts` inputs are
provider-specific. Nothing here provisions an account, moves money, claims a
refund, exports a key, or verifies a webhook. The preview balances and refund
records are disposable and must be replaced by the API's wallet read and a live
on-ramp quote before any contribution can settle from a wallet. The backend auth
stub (`AuthService.authenticate()`) must call the provider port before
provisioning can be real.

Revisit when: The provider is chosen, its SDK is added with reviewed credentials,
an authenticated Inverge session exists, and `inverge-api` exposes a wallet read
and funding quote, at which point `server/wallet.ts` is replaced and each
capability flips from `unavailable` only when its mechanism is present.

Follow-up: D-033 chooses MetaMask Embedded Wallets. The preview boundaries and
the single provider seam above still apply.

### D-032: Line endings are normalized by Prettier, not by rewriting the tree

- Date: 2026-10-19
- Status: Accepted
- Owner: Web engineering

Context: `format:check` failed with hundreds of "delete CR" diagnostics because
files checked out with CRLF endings on Windows disagreed with Prettier's default
`endOfLine: "lf"`. The formatting gate was unusable on the working platform and
masked real formatting drift.

Decision: `.prettierrc.json` sets `endOfLine: "auto"`, so Prettier preserves
each file's existing line endings (LF stays LF, CRLF stays CRLF) instead of
forcing one ending. Committed files keep their endings; the check stops
reporting spurious `delete CR` diagnostics while still catching real formatting
problems.

Alternatives: Rewrite roughly 335 files to LF and add `.gitattributes`
enforcement (a large diff touching files unrelated to any feature, with merge
conflicts); set `endOfLine: "crlf"` (forces CRLF into files authored on other
platforms and changes committed bytes); drop the format check (loses the gate).

Consequences: Formatting passes on both Windows and Unix checkouts without a
mass rewrite, at the cost of a file's ending being whatever it had on disk. A
future `.gitattributes` (`text=auto eol=lf`) would make endings deterministic and
is the preferred long-term follow-up.

Revisit when: A `.gitattributes` normalizes endings or the team standardizes on
one ending.

### D-033: MetaMask Embedded Wallets is the web provider; identity stays Inverge's

- Date: 2026-10-19
- Status: Accepted
- Owner: Product owner, web engineering, and backend engineering

Context: D-008 chose Privy for authentication and embedded Solana wallets, while
the wallet feature direction and the installed MetaMask Embedded Wallets skill
name MetaMask Embedded Wallets (formerly Web3Auth). The product owner has now
chosen MetaMask. The web app has no provider SDK, no Client ID, and no
authenticated session; `inverge-api` already exposes a provider-neutral
`EmbeddedWalletPort` with a Privy reference adapter and a stub adapter, but
`AuthService.authenticate()` is still a stub that never calls the port. Adding an
SDK without a real dashboard project, allowlisted origin, and server-side token
verification would produce a wallet that looks live but cannot provision or sign.

Decision: MetaMask Embedded Wallets is the provider for web authentication and
embedded Solana wallets. Use `@web3auth/modal` v11 with the React hooks from
`@web3auth/modal/react` and the Solana hooks from `@web3auth/modal/react/solana`
(peer packages `@solana/kit`, `@solana-program/system`, `@solana/react-hooks`).
In the Next.js App Router the provider tree lives in a `"use client"` component,
never a Server Component. Sapphire Devnet is used for local and staging origins;
Sapphire Mainnet is used in production. Sapphire is the wallet network, not the
Solana cluster; both are configured and recorded explicitly.

Identity remains Inverge's: the provider user identifier (`sub` in the `id_token`)
maps to the existing `User`, the Solana address is an attribute of a provisioned
`WalletAccount`, and no route, fixture, or authorization decision uses the
address as a primary key. The backend verifies the ES256 `id_token` against the
provider JWKS and issues the existing Inverge session token; a client-supplied
address is never trusted for authorization. The provider-neutral
`EmbeddedWalletPort` stays, and a MetaMask adapter replaces or joins the Privy
adapter behind it. `AuthService.authenticate()` must call the port before any
provisioning is real.

Address stability is a production invariant: the same wallet requires the same
Client ID, the same Sapphire network, the same connection configuration, and the
same `useSFAKey` value. Changing any of them changes every user's address, so
none may change in production without an explicit migration. Group connections
are required where multiple login methods must resolve to one wallet. Inverge
does not call `getPrivateKey`; signing uses the SDK hooks and key export stays
disabled unless the dashboard and a reviewed export flow both exist.

Alternatives: Keep Privy (D-008) and ignore the product choice; add MetaMask only
as an external wallet connector without embedded provisioning; use a conventional
auth provider plus a separate wallet provider; build custom auth and key
management.

Consequences: D-008 is superseded for web authentication and embedded wallets.
The API needs a MetaMask adapter, guard/module naming cleanup, a real
`AuthService.authenticate()` exchange, and a decision about the provider-specific
`User.privyDid` column (rename or add a neutral provider-user-id field) in a
separately reviewed migration. The web app needs the SDK, a guarded provider
shell, a login surface, an `id_token` exchange, and an authenticated session
before provisioning can be called live. Until those land, the preview boundaries
in D-031 still hold: no fabricated address, signature, deposit, withdrawal,
refund, or export.

Revisit when: MetaMask Embedded Wallets no longer satisfies the required Solana
support, security, regional availability, reliability, or commercial terms; or
the product intentionally accepts the address churn of changing Client ID,
Sapphire network, or connection configuration.

Delivery (same day): the SDK (`@web3auth/modal` 11.4.3 and its Solana peers) is
installed, and the client sign-in boundary is gated on
`NEXT_PUBLIC_WEB3AUTH_CLIENT_ID`. The overview shows the provider address as
device-only; no session, account link, chain read, or signing exists yet, so
`server/wallet.ts` still returns labelled preview data. Two transitive build
scripts (`protobufjs`, `tiny-secp256k1`) are denied in `pnpm-workspace.yaml`
because the browser bundle uses the pure-JS secp256k1 entry and neither native
build is required. See `docs/wallet-integration.md`.

### D-034: One `/auth` route, a server-held session, and a single viewer seam

- Date: 2026-10-20
- Status: Accepted
- Owner: Product owner, web engineering, and backend engineering

Context: D-033 chose MetaMask Embedded Wallets for the web client, but the app
still had a placeholder email form, a verification screen for a flow that never
sent mail, two credential routes (`/sign-in`, `/sign-up`), and no session. The
dashboard's identity was a fixture (`getDashboardViewer()` returned a preview
person), so the wallet could not be bound to an account and every "signed in"
state was decorative.

Decision:

- **One route.** `/auth` is the only authentication surface. `next.config.ts`
  permanently redirects `/sign-in`, `/sign-up`, and `/verify-email` to it and
  Next carries the query string, so `?next=` survives. The placeholder
  credential form and the verification screen are deleted; `/onboarding/profile`
  and `/onboarding/role` remain.
- **One credential UI.** The provider's own modal, whitelabelled through
  `uiConfig` (`appName: "Inverge"`, brand colour, light mode). No logo is
  supplied: the modal renders on the provider's origin, where a relative asset
  cannot load, and there is no hosted brand asset yet.
- **Server-held session.** `POST /api/auth/session` forwards the provider
  `id_token` to the API's `POST /auth/session` and writes the returned one-hour
  session JWT into an HttpOnly, `SameSite=Lax`, `Path=/` cookie
  (`inverge_session`), `Secure` in production. The token is never returned to
  the browser, so no script can read it. A BFF is used instead of exposing the
  API's bearer token so that XSS cannot lift a credential out of storage.
- **Same-origin only.** Both session endpoints require an `Origin` header equal
  to the app's own origin. Without it, the exchange is a login-CSRF target: a
  third party could sign a visitor into the attacker's account.
- **One server seam.** `getDashboardViewer()` reads the cookie, calls
  `GET /auth/me` with `Authorization: Bearer`, and is the only function the
  dashboard changed. It reports `dataSource: "live"` only when that lookup
  succeeds; otherwise it returns the existing labelled preview identity, so a
  missing API or expired session never renders as a blank or fake account. The
  lookup is memoised per render and bounded by a three-second timeout.
- **Sign-out ends both halves.** `/sign-out` disconnects the provider (the only
  way to clear its browser session) and then clears the cookie. A failed
  provider disconnect does not leave the cookie behind.
- **Config has no default.** `INVERGE_API_URL` is server-only and unset by
  default. A guessed port could point the app at the wrong service or at
  itself; instead the auth page reports that the account service is not
  configured.

Alternatives: keep the placeholder form until the provider was fully wired
(rejected: it offers a credential path that cannot work); put the session JWT in
`localStorage` or a readable cookie (rejected: XSS would export a bearer token);
let the browser call the API directly (rejected: the API would need CORS and the
token would be exposed); return the session token from the BFF response
(rejected: no benefit over the cookie and one more way to leak it).

Consequences: Sign-in is real, provider-specific code stays inside
`wallet-sdk-boundary.tsx` and `auth-sign-in-panel.tsx`, and the dashboard's
identity is the account's. Authorization is **not** solved: the API's permission
projection is not exposed, so no dashboard route is gated on a server-verified
capability and programme administration keeps its development preview gate. The
session lasts one hour and silent re-exchange is the next step; until then an
expired cookie falls back to preview rather than prompting. Live provisioning,
balances, signing, funding, refunds, and export remain unimplemented and are
still labelled as such.

Revisit when: the API exposes a permission projection the web can consume; the
session lifetime or refresh policy changes; or an incident shows the cookie
transport is insufficient (for example, a same-site XSS that can drive the BFF).

## D-035: Onboarding intent is a routing hint; the shared profile is persisted

- Date: 2026-10-20
- Status: Accepted
- Owner: Engineering

Context: A visitor can arrive through a general door or a "Start an idea" door,
and the two need different post-auth destinations. The shared profile step was
presentational: it navigated without saving anything, so `requiresOnboarding`
from the API stayed true forever. The web also had no way to check a username
before submitting.

Decision:

- Model intent as the closed set `general | creator` in
  `src/features/auth/lib/onboarding.ts`. Validate every URL value; unknown
  values become `general`.
- Carry intent in `?intent=creator` and in the HttpOnly
  `inverge_onboarding_intent` cookie. The BFF writes it on every successful
  sign-in, the API never receives it, and it is cleared after the shared profile
  is stored and on sign-out. It is explicitly **not** an authorisation claim.
- Resolve the post-auth destination with `postAuthPath`: an incomplete profile
  always wins, then creator intent, then the validated `?next=`.
- Persist the shared profile with `PATCH /api/auth/profile`, a same-origin BFF
  route that reads the HttpOnly session and forwards it as a bearer token. The
  API's `PATCH /auth/me/profile` remains the only writer.
- Proxy `GET /auth/check-username` through a session-only
  `GET /api/auth/username-available`; the API re-validates on save, so this is a
  hint, not a reservation.
- Gate both onboarding pages on `readSessionUser()`. No session redirects to
  `/auth?next=…`; an unfinished profile cannot be skipped by opening
  `/onboarding/role` directly.

Alternatives: `localStorage` (rejected: readable by scripts, survives sign-out,
and invites treating it as trust); a `User.onboardingIntent` column (deferred:
the durable fact the product needs is creator type, which has no field yet, and
adding schema requires product approval); a client-supplied `role` (rejected:
client state must never grant a role).

Consequences: creator intent survives the provider redirect and refreshes, and
profile onboarding is real. No schema changed. Creator type/organisation
onboarding, progressive verification, tier display, KYC, wallet provisioning
states, and `/d` route authorisation remain unimplemented and are listed in
`docs/auth-onboarding.md`. With `INVERGE_API_URL` unset, onboarding is
unreachable by design rather than silently failing open.

Revisit when: `CreatorProfile` gains a creator type, the API exposes
verification/tier/KYC projections, or the API supplies a permission projection
that dashboard routes can enforce.

## D-036: A local preview auth mode keeps UI work unblocked

- Date: 2026-10-20
- Status: Accepted
- Owner: Engineering

Context: The live BFF exchange was blocked on a provider JWT/JWKS mismatch, which
made the authenticated UI impossible to exercise while the signing issue was
resolved. The UI still needed honest signed-in, onboarding, and preview states.

Decision:

- `INVERGE_AUTH_MODE=preview` keeps the real Web3Auth sign-in but skips the API
  exchange. The BFF decodes the provider token payload for a stable subject
  (`sub`, then `authConnection|userId`, then email; never the wallet address),
  hashes it with SHA-256, and stores the result in the HttpOnly
  `inverge_preview_session` cookie.
- The token signature is not verified in preview mode. The cookie is not a
  credential: it unlocks only the already-labelled preview shell, is never sent
  to the API, and grants no role, tier, wallet, KYC, or payment capability.
- Profile saves persist to the same cookie. Username availability returns 501
  and the form says the check was unavailable rather than claiming the handle is
  free.
- Preview mode is ignored when `NODE_ENV=production`. The account menu labels
  the identity "Preview account" and says it is local to the browser.
- Preview cookies written before the account-type step are still readable and
  count as incomplete, so they return to account setup.

Alternatives: keeping the app unusable until the provider verification was fixed
(rejected: it blocked unrelated UI work); storing the raw provider subject or
email (rejected: needless PII in a cookie); pretending the preview identity was
an Inverge session (rejected: a fabricated authentication state).

Consequences: UI and onboarding can be reviewed end to end without the API. The
preview cookie is deliberately unauthenticated and must never be treated as an
authorisation source. Switching back to live mode is a one-line environment
change.

Revisit when: the live exchange is reliable end to end, or the preview mode
starts to diverge so far from live behavior that it stops being a useful
prototype.

## D-037: Every intent sees the starting-point question; account type precedes names

- Date: 2026-10-20
- Status: Accepted
- Owner: Engineering / Product

Context: Creator intent previously skipped `/onboarding/role` and went straight
to Creator Studio, while a general sign-up answered the same question. That made
the shared onboarding inconsistent and hid the choice from the visitors most
likely to want it. The first step also asked for a public name before asking
whether the account belonged to a person or a business.

Decision:

- The account step asks "Who is this account for?" first: `individual` or
  `business`. Individual accounts collect a public person's name; business
  accounts collect a public business name and a non-public contact name. Both
  collect a username.
- `postProfilePath` sends every completed account step to
  `/onboarding/role`. Creator intent becomes `?intent=creator`, which
  pre-selects "Build & validate" but still shows both doors.
- A chosen "build" goes to `/d/creator`; "support" goes to `/d`. Skipping goes
  to `/d/creator` for creator intent and `/d` otherwise.
- The account type and business contact are a **preview-only prototype**.
  `CreatorProfile` has no field for either. The BFF accepts them at its boundary
  and stores them in the preview cookie, but drops them before calling the live
  API. Live mode therefore keeps the original display-name + username form until
  the schema and API contract are approved.

Alternatives: a separate `/onboarding/account-type` route (rejected: it adds a
step to the two-step progress without adding a meaningful decision); letting
creator intent continue to skip the question (rejected: intent is a hint, not an
answer); persisting the account type by adding a Prisma column now (deferred:
requires product approval and a reviewed migration).

Consequences: both doors share one onboarding path and the starting-point choice
is never silently answered. The preview UI can be tested with business accounts,
but live business accounts cannot be persisted yet. `docs/auth-onboarding.md`
lists that gap.

Revisit when: `CreatorProfile` gains an approved account/creator type and
business fields, or product decides the starting-point question should be
skippable by intent.

### D-038: The supplied campaign taxonomy is canonical and additive

- Date: 2026-10-20
- Status: Accepted
- Owner: Product owner and web engineering

Context: Campaign discovery had one broad, preview-only `DiscoveryCategory`
field, while the product now needs the supplied 15-parent, Kickstarter-style
taxonomy for navigation, filtering, and creator submission. Renaming or
remapping the existing field would silently relabel fixtures, URLs, tests, and
any future stored campaign. The API's Prisma `Campaign` has no taxonomy field
and no campaign discovery endpoint, so there is no authoritative backend value
to migrate to.

Decision: `src/features/campaigns/lib/taxonomy.ts` is the single taxonomy
source: 15 parent categories, 154 subcategories, explicit stable slugs, and the
supplied labels verbatim — including `STL`, `TTRPG`, `Ready-to-wear`,
`Farmer's Markets`, `Theater`, and `Movie Theaters`. Labels are never
normalised at runtime, and slugs are written explicitly so renaming a label
does not silently move a URL. Module-load assertions reject a duplicate parent
slug, duplicate subcategory id, or duplicate label within a parent.

`Campaign` gains nullable `taxonomy: { category, subcategory } | null`, where
`subcategory` may be null when the parent is the honest level of fit. The
existing broad `category` remains as a read-only compatibility field for
surfaces that have not moved; it is not a second taxonomy and no new discovery
surface reads it as one. Preview campaigns are assigned only where the fit is
honest: health and education fixtures are not forced into an unrelated parent,
so HealthReach Mobile Clinics, Harmattan Health Kiosks, and Skill Circle carry
`taxonomy: null`.

Routes are `/campaigns/categories/[categorySlug]` and
`/campaigns/categories/[categorySlug]/[subcategorySlug]`, with static params
and metadata generated from the same module. No backend migration, external
API field, or stored-data rewrite is implied by this change.

Alternatives: Map the legacy broad values onto the closest new parent (invents
a taxonomy decision and mislabels every fixture); derive slugs from labels at
render time (a label edit silently changes a shared URL); duplicate the
taxonomy in filters, creator validation, and route code (three sources drift);
give every campaign a parent whether or not one fits (dishonest classification,
especially for health and education).

Consequences: Unassigned campaigns remain reachable through `All` discovery but
do not appear under a category or subcategory, so the category counts do not
sum to the total. That gap is visible and deliberate until the product supplies
honest health and education categories; it must not be closed by forcing a
campaign into Technology, Art, or another adjacent parent. A new category or
subcategory requires an explicit slug and an assertion-checked entry, not a
guess. The API will need nullable taxonomy fields, validation against the
canonical list, and a reviewed migration before the seam can read real data.

Revisit when: The API exposes campaign taxonomy, the product defines
health/education destinations, or the supplied taxonomy is revised.

### D-039: Pagination and recommendations are deterministic local projections

- Date: 2026-10-20
- Status: Accepted
- Owner: Web engineering and product

Context: Discovery needed load-more pagination, filter counts, and a
"Recommended campaigns" page, but this repository has no campaign API, no
server-side cursor or total, and no recommendation service. There are only 11
preview campaigns (8 public, 7 discovery candidates after the featured set), so
a real page request would be fiction. A recommendation score, live count, or
"because you backed…" explanation would be invented data.

Decision: Discovery pagination is a deterministic slice of the locally filtered
result set with `CAMPAIGN_PAGE_SIZE = 6`. Load more appends by campaign id,
deduplicates, keeps the previous results if a later slice cannot be read, and
resets to the first page whenever any filter, search, or sort changes. Progress
copy reports only the loaded count against the filtered local total; no
platform-wide total or live activity claim is rendered. Filter counts and the
`All` count are derived from the discovery candidates, so a featured campaign
shown above the grid cannot inflate a category chip. The `funding` status
filter is exactly `phase === "funding"`; a paused campaign stays visible under
`All` but is never labelled "Funding open".

The featured set is every stored, currently-funding campaign with
`featured: true`, in stored order. One campaign keeps the full-width band;
several become a carousel. Every featured campaign is excluded from the
discovery candidates and counts, so it is not duplicated in the grid.

Recommendations use `rankCampaignRecommendations`, a deterministic ordering
rather than a score. Candidates exclude the source campaign and deduplicate by
id, then fall through these tiers: same subcategory, same parent category,
featured, any other eligible public campaign. Within a tier, the campaign ending
soonest comes first, then the slug as a stable tie-breaker. When the source has
no taxonomy, the subcategory tier is skipped and the legacy broad category acts
as the parent-level fallback, so an unassigned health or education campaign can
still relate to its peers without pretending it has a supplied category. A
result is never described as personalised, predicted, or AI-powered; no external
model or recommendation service is called. The campaign detail page's related
section and the dedicated `/campaigns/[slug]/recommended` page use the same
ranking.

Alternatives: Request page offsets and totals from an endpoint that does not
exist (fabricates a backend contract and a live count); render every result and
call it pagination (defeats the interaction); assign each recommendation a
numeric score or reason (invents evidence); hand-order a fixed related list
(does not survive a new campaign or a changed taxonomy); add an external AI
recommendation dependency (new runtime dependency, privacy surface, and
unverifiable rationale).

Consequences: The UI is honest and deterministic today, and its pagination,
count, and ranking rules are unit-tested. The cost is that pagination is a
client-side view over a complete local list and recommendations are
rule-ordered, not personalised. When the API owns discovery it must supply
taxonomy filters, stable cursor pagination, filtered totals, and either the same
documented fallback order or a recommendation service that also explains its
basis. Until then, no surface may call this a live feed or a personalised
recommendation.

Revisit when: A campaign discovery or recommendation endpoint exists, the
preview set grows beyond what a local slice can represent, or product adopts a
measured recommendation strategy.

### D-040: Discovery filters are global, honest, and URL-serialised

- Date: 2026-10-21
- Status: Accepted
- Owner: Web engineering and product

Context: Backers needed more than a category and status: project status,
location, goal, amount raised, percent raised, and cross-cutting views such as
featured, saved, and open campaigns. The preview locations were written as
display strings such as "Ogun State, Nigeria", so a location filter built from
those strings would be a Nigeria-only list in practice. The repository also has
no viewer identity or recommendation service, so a "Recommended for you" filter
would be fabricated.

Decision: Discovery filters are `category`, `country`, `region`, `phase`,
`goal`, `raised`, `percent`, `show`, `sort`, and `view`, serialised to the query
string. Money bands are half-open and compared in integer atomic units. A null
raised total is its own "Not reported" value, never zero. Country filtering uses
the ISO 3166-1 alpha-2 codes and CLDR names in `@/lib/countries`. The country is
read from the final comma-separated segment of the stored location, matched by
code or name; the region is the exact stored location, grouped under its
country. A location with no recognised country is grouped as "Other locations"
rather than guessed into a country. Country and region options are derived from
the current pool, so a campaign in Ghana, Kenya, or Germany needs no code change
and no hand-maintained country list. `show=loved` is the stored `featured` flag,
`show=saved` intersects the browser-local saved list, and `show=open` is the
funding phase. "Recommended for you" is rendered disabled with an explanation;
it is not a filter value and is never faked. Changing any filter resets
load-more to the first page. Counts are derived from the same pool the view can
show, including the show-only pool, so a filter never promises a count the grid
cannot satisfy.

Alternatives: Hardcode Nigerian states (does not survive a second country);
store a free-text country (unvalidated, no stable query value, and inconsistent
case); add a continent table (misclassifies countries and creates a dataset the
product does not need); infer a country from a city name (guesses); add a
personal-recommendation endpoint or a local score (invents data); treat a null
raised total as zero (lies about funding progress).

Consequences: The location filter is country-aware and global from the first
non-Nigerian campaign, and its values are stable ISO codes. The cost is that a
legacy free-text location without a recognised final country segment is only
available under "Other locations". When the API owns discovery it must supply
the country code and region as structured fields rather than relying on parsing
a display string.

Revisit when: The campaign API returns structured country and region fields, a
viewer identity and recommendation service exist, or the product adds a
location type that is not a country/region pair.

### D-039: Advertising is a labelled, separate bounded context

- Date: 2026-10-22
- Status: Accepted
- Owner: Product, web engineering, backend engineering

Context: the product needs a controlled way to sell placements without
corrupting the thing it sells: organic discovery and validation. A native ad
that looks like a campaign, an impression that joins campaign analytics, or a
third-party script that loads before consent would each break a promise already
made in the privacy notice.

Decision: advertising gets its own domain module, placement registry, inventory
rules, consent record, event contract, and admin permission. Selection is pure
and deterministic and runs server-side without cookies. Every placement is
labelled `Sponsored`, carries the advertiser name, and is excluded from
ranking, validation, funding figures, and campaign analytics. Feed placements
require at least six organic results. First-party inventory is on in development
and off by default in production; the third-party AdSense adapter needs a
separate flag, public IDs, and an explicit personalised-advertising choice.
Optional measurement is a second, independent consent purpose and is off by
default. The admin workspace is explicitly a browser preview until the API owns
inventory; the proposed schema and serving contract are documented but not
wired.

Alternatives: a single `isSponsored` flag on campaigns (rejected: puts paid
state into the domain that must stay neutral); client-side ad selection
(rejected: hydration drift, layout shift, and cookie reads on static pages);
loading AdSense site-wide behind a banner (rejected: consent and performance
risk); a full ad server in this change (rejected: no advertiser, no billing, no
operational need yet).

Consequences: a new placement is a reviewed registry edit plus a call site, not
an ad-hoc component. There are two independent consent purposes to explain and
test. Native ads cannot be targeted by cookie, only by page category and region.
Third-party advertising stays inert until a real publisher account exists. The
preview admin store is single-browser and cannot be presented as server-audited.

Revisit when: the API owns inventory and events, a real advertiser signs, or a
publisher account is approved. At that point the status line in
`docs/ADVERTISING.md` and the API contract must change in the same release.

### D-041: Idea discovery reuses the campaign category taxonomy

- Date: 2026-10-22
- Status: Accepted
- Owner: Product and web engineering

Context: Campaign discovery already narrows results with a parent category and
a conditional child subcategory. Idea discovery offered only a broad
`discoveryCategory` plus a free-text `category` label, so the two discovery
surfaces behaved differently and ideas could not be filtered with the same
categories. The campaign taxonomy is the product's reviewed vocabulary; a
second idea-only list would drift from it and produce two meanings for the same
words. Some ideas also arrive from the API or an older record without any
child value, and assigning one by guess would misstate what the record
contains.

Decision: idea discovery uses the campaign taxonomy directly.
`src/features/ideas/lib/taxonomy.ts` aliases
`src/features/campaigns/lib/taxonomy.ts` rather than copying it, so both
surfaces read the same categories, children, labels, and slugs. The idea
sidebar lists every campaign category and, after a parent is chosen, its
children. `DiscoveryIdea.taxonomyCategory` and `taxonomySubcategory` carry the
discovery assignment and are optional because the API projection may not have
them yet. The broader `IdeaSummary.discoveryCategory` remains the routing bucket
used by the idea builder and ideathon; it is not the filter value.

Selecting a parent clears the child. `?subcategory=` is accepted and
serialised only when it belongs to the selected `?category=`; a crafted,
stale, or legacy pair falls back to "All subcategories" rather than filtering
by a child of another parent. Category and child counts come from the same
public pool the grid can show. An idea without a child is counted under its
parent and under "All subcategories", but is never attributed to a child it
does not have, and a mismatched pair is skipped rather than counted under the
wrong parent. Cards show "Parent / Child" with the descriptive `category` label
as the fallback, and the detail page's category link uses the same pair.

Alternatives: Copy the campaign taxonomy into an idea-only list (drifts, and a
label or slug edit moves only one surface); keep the earlier idea-specific
children (not the categories the product asked for); reuse the six broad
`discoveryCategory` buckets (too coarse and not the campaign taxonomy); make the
child required (breaks older and API records, or forces a false assignment);
infer a child from the free-text category or description (guesses).

Consequences: there is exactly one taxonomy to maintain, and an idea cannot
offer a category that campaign discovery does not. The cost is that every
preview idea needs an explicit campaign pair and the API must eventually supply
both slugs; until it does, the card falls back to the existing descriptive label
and the sidebar counts only declared children. Adding a category or child for
ideas is a campaign-taxonomy edit, not an idea-local one. Paid placements remain
outside this taxonomy and outside filtering, counts, ordering, and validation.

Revisit when: The API owns the taxonomy, ideas routinely need a category that
campaign discovery should not carry, or a child needs to move between parents.
A move requires migrating stored slugs and keeping old filter URLs working.

### D-042: Live idea and campaign discovery are read-only projections

- Date: 2026-10-24
- Status: Accepted
- Owner: Web engineering

Context: `GET /api/v1/ideas` and `GET /api/v1/campaigns` are live, but their
projections are narrower than the preview fixtures. The API has no campaign
slug, story, media, reward tiers, or published escrow terms, and its idea list
supports taxonomy filters, `mine`, `limit`, and `cursor` only. Rendering a live
record through the preview `Campaign` model would require inventing the missing
fields; falling back to fixtures when the API fails would make an outage look
like a catalogue. The preview discovery grid also offers search, country, money,
and sort controls that the live endpoints cannot honour.

Decision: public idea discovery and detail read the API when
`INVERGE_API_URL` is configured, and both routes call `await connection()` so a
build never needs a running API. Fixtures are returned only when no API is
configured at all. A configured API that fails surfaces an error rather than
silently switching data sources.

Live reads are bounded windows: idea discovery follows cursor pages up to 300
rows, and a campaign category loads the newest 300 campaigns in that parent.
When the cap is reached, the page says the window is partial instead of
presenting it as a total. Category and subcategory counts are computed from the
same window the grid renders, so a heading and its cards cannot disagree.

The live idea region mapping adds `"other"` for API regions outside Nigeria,
Ghana, and Senegal; it never invents a country. The live campaign card renders
only the API fields that exist and links to the source idea (`/ideas/{ideaId}`),
never to `/campaigns/{slug}`, which has no live slug to resolve. Campaign
categories keep the taxonomy header and trust strip, replace the preview
discovery controls with the reduced card grid, and state that search and
advanced filters are unavailable. A live category with no public campaigns
shows an explicit empty state.

Alternatives: map the API into the full preview `Campaign` model (fabricates
missing content); keep fixtures when the API fails (hides outages); add a live
campaign detail route that renders the same reduced card (no new information,
and still no slug); keep the preview filter controls (they would silently do
nothing); paginate a category without a cap (unbounded server work per request).

Consequences: the two discovery surfaces are honest about what the API owns and
can ship before the campaign workspace endpoints exist. The cost is a reduced
campaign card, no live campaign detail page, no live search or advanced filters,
and a windowed rather than exhaustive catalogue. Live campaign cards are not
saved, shared, or backed from the card, because those actions need the campaign
workspace and wallet flows that remain deferred.

Revisit when: the API exposes campaign slugs and the full campaign workspace, a
search/sort contract lands, or the window cap becomes a real discovery
constraint. At that point the reduced card and the preview/live split should be
retired together, not one surface at a time.

### D-043: Country and region entry uses one ISO country list and a global region dataset

- Date: 2026-10-24
- Status: Accepted
- Owner: Web engineering

Context: Profile and campaign location was a free-text field. Creators in the
launch markets write "Lagos, Nigeria", but the same field has to accept "Delta,
Nigeria", "Greater Accra, Ghana", and eventually "Bavaria, Germany" without a
hand-maintained country-by-country table. `countries-list` was considered, but
it carries country metadata only; it has no states or provinces. A city database
would be larger and still not the shape an address form needs.

Decision: `src/lib/countries.ts` remains the single source of ISO 3166-1 alpha-2
codes and CLDR display names. `src/lib/locations.ts` sources first-level regions
from `country-region-data` v4.1.0 (MIT, ~130 KB ESM, ISO-3166-2), keyed by the
same country code. The stored value stays one display string
("Ikeja, Lagos, Nigeria"); `parseLocation` and `formatLocation` split and compose
it, and `LocationPicker` owns the three inputs while the creator is typing.

The ECOWAS member states are the first validation target
(`WEST_AFRICA_COUNTRY_CODES`), but every country in the shared list remains
selectable. A country with no regions in the dataset falls back to a free-text
region input; the city is always free text. Region display overrides correct a
small number of awkward or unaccented ISO labels, and aliases keep old stored
values resolvable.

Alternatives: keep a curated NG/GH/SN map (correct for the launch trio, but
every new country becomes a data-entry project); use `countries-list` (no
subdivisions); use a city-level database (larger, more maintenance, and more
precision than the product stores); store country, region, and city as three
separate API fields (a schema change the API does not have yet).

Consequences: The forms cover West Africa now and upscale without a new
dependency or a second country-name table. The cost is ~130 KB of region data in
the settings and campaign-wizard chunks, and ISO-3166-2 can lag local
reorganisations (for example, Côte d'Ivoire's dataset still lists older
regions). The picker is honest about that: it never invents a region, and it
keeps a legacy value editable when it cannot resolve one.

Revisit when: The API stores structured country, region, and city fields, the
region dataset is materially stale for a launch market, or the bundle budget
makes a lazy-loaded region chunk necessary.

### D-044: Product analytics is a server-side, post-response producer

- Date: 2026-10-25
- Status: Accepted
- Owner: Web engineering

Context: The API exposes a signed service-to-service ingest route and
privacy-reviewed view events, but the web app never called it. A browser client
would introduce a public ingest boundary, a client-visible identity, and a
consent decision the Phase 1 privacy boundary does not have.

Decision: `src/features/analytics/server/ingest.ts` observes the render on the
Next.js server and signs one batch with `ANALYTICS_INGEST_SECRET`. It runs inside
`after()` so no network call delays the response, and it never throws. Anonymous
readers receive one short-lived, HttpOnly `inverge_analytics_session` cookie from
`src/proxy.ts`; signed-in readers use the internal account id instead. Only
the API's closed event vocabulary is sent, and the web never synthesizes a
confirmed outcome such as support, feedback, or backing.

Alternatives: a browser beacon (rejected: public ingest, client identity, and a
consent surface Phase 1 does not have); calling the API during render (rejected:
analytics would block the page and could fail a product action); a third-party
analytics script (rejected: cross-site identifiers and no data ownership).

Consequences: Views are collected without a client bundle, IP address, user
agent, or device fingerprint. The producer starts with idea discovery and idea
detail because those routes are already per-request; static marketing surfaces
need an explicit dynamic decision before they can be measured. The secret must
match the API's `ANALYTICS_INGEST_SECRET`, and `INVERGE_ANALYTICS_ENABLED` must
be `true`; otherwise the producer is inert. `/d/creator/analytics` also reads the
account's `analytics.premium` entitlement and submits a request through a server
action, while the idea workspace remains preview data until the live creator
dashboard lands.

Revisit when: Phase 2 privacy approval adds consent, referrer, device, region, or
returning-visitor measurement; a static surface needs view analytics; or the
API changes the wire vocabulary.

### D-045: Fix the working tranche at 20% of target and divide the remainder by milestone weights

- Date: 2026-10-25
- Status: Accepted (supersedes the working-capital half of D-020)
- Owner: Product, escrow programme, API and web

Context: The earlier band treated the tranche as a creator-selected 20-25% slice of
the same escrow base as the milestones (`workingCapitalBps + Σ trancheBps = 10_000`).
That pays an overfunded campaign more before verification than its original plan was
worth: at 150% funding, a 25% tranche releases 37.5% of the target instead of 25%.
The product owner has fixed the rule for this iteration: the initial tranche is 20%
of the **original target**, the milestone weights divide what is left, and the
surplus stays in escrow.

Decision: `initialTranche = targetAmount x 2_000 / 10_000`. Milestone weights sum
to exactly 10,000 independently and each milestone receives
`(eligibleRaised - initialTranche) x weight / 10_000`; the last milestone absorbs
the integer remainder. `eligibleRaised` is the gross `total_raised`; the 5% fee is
deducted from each gross release, so the creator receives 95% of it. A release that
would exceed eligible funds fails with an explicit validation error rather than
clamping. Surplus is not a separate release stage: it is part of the milestone pool
and remains subject to the same milestone, objection and refund rules. The wizard
no longer offers a working-capital choice; the API draft DTO accepts exactly `20`;
readiness requires the fixed tranche and a milestone total of 10,000. The creator
workspace and public escrow section show the initial tranche, remaining pool,
released, still-held and surplus separately. Fixtures keep their authored 10,000
milestone weights instead of being rescaled.

Alternatives: Keep the proportional tranche (overpays overfunded campaigns and was
the reason for the change); cap all payouts at the target and refund the surplus
(a different product promise, not requested); keep the 20-25% creator choice
(rejected by the product owner for this iteration); rescale milestone weights on
the client (hides a money decision and changes published terms).

Consequences: The programme, API readiness, draft validation, wizard, fixtures and
copy now agree on one rule. A draft saved with a 25% tranche under the old band is
blocked until re-created under the fixed rule; there is no live data to migrate
because the contract is not deployed. Milestone display is a projection until the
indexer exists; only confirmed on-chain releases may be described as released. The
release endpoints, confirmation/reconciliation and indexer are still not built, so
this decision does not by itself make live escrow releases work.

Revisit when: Overfunding refund policy changes, Flexible Funding becomes
deployable, or the programme needs a different initial-tranche rule.

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
