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
| D-020 | 2026-10-18 | Accepted (widens FR-503a, SRS to be reconciled) | The platform success fee is Inverge's and is shown read-only; a creator chooses the first tranche from 15-25% of the raise instead of typing any figure. |
| D-021 | 2026-10-19 | Accepted | The campaign detail page is tabbed, not one scroll: tab state lives in `?tab=`, the panel is chosen on the server, and the desktop rail repeats the most-scanned cards. |
| D-022 | 2026-10-19 | Accepted | The creator's story is a closed, typed block vocabulary rendered as data; the schema has no `html` member and the page never injects creator markup. |
| D-023 | 2026-10-19 | Accepted | Saved campaigns live in this browser behind a `SavedCampaignsStore` boundary and every surface says so; no surface may claim account synchronisation. |
| D-024 | 2026-10-19 | Accepted | A reward tier declares a fulfilment type and, for anything posted, the creator's own destinations and terms. Shipping is display-only: Inverge quotes no postage, collects no address, and no fixture ships reward artwork. |
| D-025 | 2026-10-19 | Accepted | The backing flow is one route with step-id state and a conditional delivery step; its quote never invents a figure and it ends at a labelled provider-absent handoff rather than a success screen. |

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
- Status: Accepted (widens FR-503a; the SRS needs reconciling)
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

Revisit when: The SRS is reconciled, the settings API can supply these
parameters, or a campaign type needs a different fee or band.

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

### D-024: A reward declares its fulfilment and its shipping, and neither is priced

- Date: 2026-10-19
- Status: Accepted
- Owner: Product owner and web engineering

Context: Rewards had no way to say whether they were digital, posted, or both,
and posting a physical reward needs to tell a backer where it can go. Shipping
cost is the trap: Inverge has no carrier integration and no rate source, so any
number shown would be invented, and a shipping figure folded into the
contribution total would misstate what the escrow holds.

Decision: `SupportTier` gains `fulfilment: RewardFulfilment | null`
(`digital` | `physical` | `mixed`) and `shipping: RewardShipping | null`, where
`RewardShipping` is the creator's own list of destinations plus optional free-text
terms. `shipping` is non-null only for a physical or mixed reward, so a digital
reward can never render a shipping line. Shipping is display-only: the campaign
page, the rail, the creator wizard preview, and the backing flow all render it
through one `RewardFulfilmentLine`, which shows the fulfilment pills and the
creator's destinations and terms and never a price. The creator's destinations
are typed one-per-line in the wizard and parsed by `parseShippingRegions`. No
address is collected anywhere in this build, because there is nowhere to send it
and no fulfilment process to receive it.

Alternatives: A single boolean "physical" (cannot express a reward that is both,
which the campaign fixtures already need); collect a shipping address in the
backing flow (a delivery address with no fulfilment process, no consent record,
and no retention policy — a privacy liability that looks like a feature); show a
shipping estimate (a number with no source); bill shipping inside the
contribution (misstates the escrow and the refund).

Consequences: A backer sees where a reward can be posted and that Inverge does
not quote postage, and the contribution total never includes a shipping figure.
Address collection, rate quoting, and a fulfilment handoff are all still missing
and are stated as such. No fixture ships reward artwork: the repository has no
authentic reward photography, and D-019's rule against stock substitution
applies, so the image path is exercised by the wizard and its tests instead. See
D-025 for the flow the delivery step sits inside.

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
