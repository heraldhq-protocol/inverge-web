# Campaign experience — audit and plan

Working document for the campaign implementation slice. It records what the
repository already provided, the conflicts found between the request and the
governing documents, how each one was resolved, and what is deliberately not
built. It is kept as the slice's audit record; the durable decisions live in
`DECISIONS.md` (D-018 to D-020), `DASHBOARD_PAGES.md`, and `PROJECT_BRIEF.md`.

## 1. What already exists (audited on `feat/campaign-experience`)

| Layer | State |
| --- | --- |
| Routes | App Router. Public marketing surfaces under `(marketing)` (`/ideas`, `/ideathon`, `/guides`, `/blog`, `/topics/[slug]`). Product surfaces under `(product)/d` (D-011). Creator surfaces under `/d/creator/*` (D-017). |
| Auth / session | None. There is no provider, no middleware, and no server session. `viewer` is a fixture on `ShellData`. |
| Data layer | None. There is no API client, no fetch, no route handler besides the OG image, and no Server Actions. Every page reads `src/features/*/content/preview-*.ts` through a `server/` seam. |
| Money | `src/lib/money.ts` — `MoneyAmount { atomic: string; currency: "USD"; decimals: 2 }`, string/BigInt maths only, plus `parseUsdAmount`, `atomicToWholeInput`, `sumMoneyAmounts`, `formatMoney`, `formatCompactMoney`. |
| Design system | One stylesheet (`src/app/globals.css`, Tailwind v4 `@theme inline`) and `src/components/ui/*`: `Button`, `Card`, `Pill`, `Meter`, `StatePanel`, `Skeleton`, `Tabs`, `Select`, `Field`, `Input`, `Textarea`, `MetricCard`, `MetricStrip`, `Amount`, `Count`, `Avatar`, `Cover`, `SectionHeading`, `Eyebrow`, `IconTile`, `Tooltip`, `Menu`, `StatusBadge`, `RichText`. |
| Icons | `@hugeicons/react` on product surfaces, `lucide-react` on marketing surfaces. |
| Tests | Vitest + jsdom + `@testing-library/react`, colocated `*.test.ts(x)` with descriptive names and `afterEach(cleanup)`. |
| Campaign code | None. `grep -i "campaign\|escrow\|milestone\|contribution\|refund"` returns only incidental prose and `ActivityKind`/`ActivityItem` unions in `features/home/types.ts`. |

`DASHBOARD_PAGES.md` currently lists Campaigns and Milestones as *held* because
the data models did not exist. This slice creates those models, so the hold is
resolved rather than overridden.

## 2. Conflicts between the request and the governing documents

Resolved in favour of the source-of-truth hierarchy (PRD/SRS → brief → brand →
architecture → repo conventions).

| # | Conflict | Resolution |
| --- | --- | --- |
| C1 | Requested routes are `/dashboard/backing`, `/dashboard/creator/campaigns`. D-011 makes `/d` the product namespace. | Use `/d/backing` and `/d/creator/campaigns`. The request says the listed routes are "suggested route destinations, not a requirement to introduce duplicate or conflicting routes". |
| C2 | Requested dashboard route prefix `/dashboard` also collides with the existing 308 redirects in `next.config.ts`. | Same as C1; no new redirects added. |
| C3 | SRS denominates campaigns in USDC/cNGN; D-010 models all product money as USD atomic cents. | Campaign `target`/`raised` use `MoneyAmount` (USD = USDC, 1:1, no conversion invented) and carry an explicit `fundingAsset: "USDC"` label plus `supportedSettlementAssets`. No cNGN amount is ever derived from a rate. |
| C4 | The request asks for "default success fee 5%", "working capital 20–25%", "7-day objection window", "30% threshold", "15% per-wallet cap" while also saying not to hard-code a universal percentage. | Objection and fee terms live in `EscrowTerms` **per campaign** in basis points (integer) and are rendered from that data; a campaign without a published term says so. The working-capital tranche is the exception: D-045 fixes it at 20% of the original target, so the creator no longer chooses within a band. |
| C5 | The request wants a quote/fee/total in the contribution flow; §1 forbids inventing exchange rates and fees. | The flow offers two settlement routes: direct USDC from the wallet (FR-401 — exact amount, no rate) which completes, and the fiat on-ramp (FR-402) which shows the quote structure with a live-quote-unavailable state and disables proceeding, as §9 requires. |
| C6 | "Verified on-chain" badges are requested; no chain indexer is connected and no transaction hash may be fabricated. | `TransactionRef` exists in the model but every fixture leaves it `null`. Anywhere a signature or explorer link would appear, the UI states that the reference is unavailable in the preview. |
| C7 | Self-attested creator campaigns need curation states ("in review", "changes requested") that are not in the SRS state list. | Modelled as a `CampaignReview` discriminated union alongside the funding `CampaignPhase`, matching D-005/§5 curation. |
| C8 | The request lists an "unknown/unsupported" state. | `CampaignPhase` has a closed `unknown` and every normaliser maps anything unrecognised to it; nothing falls through to a success state. |

## 3. Scope of the slice

Feature module `src/features/campaigns/` with `types.ts`, `lib/`, `content/`,
`server/`, `components/` — the established feature layout.

Public (`(marketing)` shell, indexable except unrealisable states):

- `/campaigns` — discovery: search, parent/subcategory filters, sort, URL state, featured campaigns (one band or a carousel of several), load-more pagination, trust explainer, loading/empty/error.
- `/campaigns/categories/[categorySlug]` — parent-category discovery with subcategory navigation.
- `/campaigns/categories/[categorySlug]/[subcategorySlug]` — subcategory-scoped discovery.
- `/campaigns/[slug]` — detail: hero, funding summary, story, use of funds, milestone plan + evidence, escrow/accountability explanation, updates, milestone ledger, lifecycle-specific actions, related campaigns.
- `/campaigns/[slug]/recommended` — deterministic recommendations with the source campaign excluded.
- `/campaigns/[slug]/back` — contribution preview (4 steps, demo only, no payment).

Backer (product shell):

- `/d/backing` — contribution history with payment/contribution/refund states.
- `/d/backing/[contributionId]` — receipt, refund status, support paths.

Creator (product shell):

- `/d/creator/campaigns` — overview: own campaigns across lifecycle states.
- `/d/creator/campaigns/new` — 6-step wizard (basics → media → funding → milestones → terms → review).
- `/d/creator/campaigns/[campaignId]` — workspace.
- `/d/creator/campaigns/[campaignId]/edit` — edit with locked terms once submitted.
- `/d/creator/campaigns/[campaignId]/milestones` — allocation overview and guided milestone submission.

Media (added on request after the first pass; D-019):

- `lib/media.ts` is the trust boundary: an image is an https URL or a
  same-origin path, a video is an `upload` path, a `direct` file link, or a
  YouTube/Vimeo id parsed out of the creator's link. An embed URL is built from
  the parsed id, so no creator string reaches an `<iframe>`.
- `CampaignMediaCarousel` is the hero when a campaign has media: real buttons,
  thumbnails, swipe, arrow keys, only the active item mounted. A single item
  renders as a plain image with no carousel chrome, and a campaign with no media
  falls back to its cover as before.
- `CampaignVideoPlayer` is click-to-play for a hosted video (nothing is
  requested from the host until the reader presses play) and the browser's own
  player for a file. `CampaignStoryMedia` renders creator attachments inside the
  story, and a hosted video there also offers a link out to the host.
- The wizard's Media step edits an ordered link list with reorder, a poster
  marker, and a per-item description; the upload control is present but disabled
  with the reason. The step is optional.

## 4. Explicitly out of scope

KYC, wallet linking, real payment capture, real escrow transactions, provider
webhooks, notifications, admin moderation actions, and the discussion system
(rendered as an honest unavailable state). Each is either Phase 3+ or needs a
backend that does not exist in this repository.

## 5. Deliberate deviations and limits

| # | Item | Why |
| --- | --- | --- |
| V1 | The first tranche was a 15–25% choice. FR-503a now fixes it at 20% of the target. | Resolved by D-045: the tranche is fixed at 20% of the original target, does not grow with overfunding, and the milestone weights total 100% of the remainder on their own. |
| V2 | No fixture carries a video. | The repository vendors no clip and a fixture must not depend on a third-party host at render time. The video path is real and is covered by tests and by the wizard, where a creator can paste a genuine link and preview it. |
| V3 | `/d/backing` and `/d/creator/campaigns` have no local `loading.tsx`/`error.tsx`. | D-016 renders every `/d` route inside one shared shell and `docs/DASHBOARD_PAGES.md` puts the fallbacks at the `d/` group level; the two new collections inherit those rather than duplicating them. The public `/campaigns` routes do ship their own loading, error, and not-found states. |
| V4 | The discussion thread renders an unavailable state. | There is no comment model and no API; seeding comments would invent user content. |
| V5 | The success fee is read-only in the wizard. | It is Inverge's fee (FR-505), not a creator's term. The draft still carries the campaign's own rate so the display path quotes published terms (D-020). |

## 6. Verification

`pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build`,
plus targeted `prettier --check` and `eslint` over every file this branch adds
or changes. Results are recorded in the pull request description and the final
report.

## 7. Server persistence (campaign deployment phase E)

The new-campaign wizard now keeps its draft in the API instead of only in the tab.

- **When saving starts.** The API's create contract needs a real title, story,
  category, target, deadline, use of funds and 2–6 milestones. A draft is created
  on the first change after the funding and milestone steps validate; before that
  the status line says the draft is local to the tab. Nothing is invented to make
  an earlier save possible (a placeholder target or deadline would show up as the
  creator's own figure).
- **Versioning.** Each save sends the `version` it read. The API applies it
  conditionally and a stale save is `409 STALE_DRAFT_VERSION`; the editor stops
  autosaving and asks for a reload instead of overwriting the other tab.
- **Resuming.** The first successful create writes `?draft=<id>` into the URL with
  `history.replaceState` (no remount). The page loads that draft server-side, so a
  reload on another device continues from the API's copy.
- **Boundary.** The BFF routes (`POST /api/campaigns`,
  `PATCH /api/campaigns/[campaignId]`, `GET /api/campaigns/[campaignId]/draft`)
  attach the HttpOnly session token and forward the API's error envelope
  unchanged. The browser never receives the token, and no trusted state
  (status, review, terms hash, deployment, fee) is sent from the client.
- **Readiness is shown, not hidden.** Every save response carries the server's
  readiness verdict; the review step lists its blockers.

Known conflict this exposes: the wizard's old model treated the first tranche as
*containing* working capital (milestones totalled 100% and the tranche was carved
out of milestone one), while the escrow programme now fixes the tranche at 20% of
the target and requires the milestone weights to total 10,000 on their own.
Resolved by D-045: there is no working-capital control, the tranche is a separate
stage, the milestones divide `eligibleRaised − initialTranche`, and the review step
lists the server's remaining readiness blockers. Payloads are not rescaled silently;
a draft whose weights do not total 100% is reported and blocked. The edit route
remains fixture-backed; only the create flow persists.
