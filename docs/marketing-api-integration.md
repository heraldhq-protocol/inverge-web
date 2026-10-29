# Marketing pages - API integration audit and record

Status: **homepage, idea discovery/detail, campaign discovery/detail, and the
sitemap read the live API**. Fixture-only surfaces remain only where the backend
has no endpoint or no data model (campaign contribution flow, ideathon,
editorial topics, newsletter/contact submission). Written 2026-10-26, extended
2026-10-27 on `feat/marketing-api-integration`.

This document is the single record of what every public marketing surface reads,
where that data comes from, and what could not be wired because the backend does
not expose it. It separates "connected", "static by design" and "blocked".

---

## 1. Repositories, worktrees and baseline

| Repository | Purpose | Branch in this task | Baseline commit |
|---|---|---|---|
| `inverge-web` (this repo) | Next.js 16 App Router public site + product dashboard | `feat/marketing-api-integration` | `5e3bd86` (`main`) |
| `inverge-api` | NestJS + Prisma/Postgres + Redis public API | `feat/marketing-api` | `a4ee069` (51 commits ahead of API `main`) |
| `inverge-escrow` | Anchor milestone-escrow programme | untouched | `dc116a4` |

Both worktrees already existed for this task and were reused rather than
recreated; the uncommitted work in them was treated as this task's own progress.
They are separate checkouts, never the primary directories:

- `C:/Users/user/Documents/Programming/Workspace/Inverge/.worktrees/marketing-web`
- `C:/Users/user/Documents/Programming/Workspace/Inverge/.worktrees/marketing-api`

The primary `inverge-web` and `inverge-api` working trees carry unrelated
uncommitted work and were not touched. Nothing was merged, pushed or deployed.

### Local verification environment

A scratch database (`inverge_perf` on the local Postgres at `127.0.0.1:55432`)
was created for this task, every committed migration was applied, and the
platform/taxonomy seed was run. Temporary smoke fixtures were inserted so the
public routes could be exercised end to end; the seed script does not contain
them. Redis was already running locally.

### Repository-level fix required to build

`inverge-api/pnpm-workspace.yaml` was committed with placeholder text instead of
booleans:

```yaml
allowBuilds:
  '@prisma/engines': set this to true or false
```

That made `pnpm install` fail with `ERR_PNPM_IGNORED_BUILDS` on a clean
checkout. It is corrected in the API branch (`416891d`) with explicit booleans
(Prisma engines, esbuild, msgpackr-extract, prisma and unrs-resolver allowed;
`@scarf/scarf` refused) so dependencies, tests and the OpenAPI emitter can run.

---

## 2. Marketing page data inventory

Legend for **Status**: connected = reads the live API; partial = one surface of
the page is live and another is not; missing = the API has no endpoint; blocked =
the endpoint depends on an unfinished subsystem; static = authored content that
is correct to keep in the repository.

| Page / component | Data required | Current source | Required endpoint | Status | Owner | Tests |
|---|---|---|---|---|---|---|
| `/` - hero, how-it-works, campaign anatomy, two doors, mission, FAQ, CTA | Brand copy, product explanation, trust claims | Components + `features/marketing/content/editorial.ts` | - | static | frontend | `app/page.test.tsx` |
| `/` - activity band (`StatsSection`) | Published ideas, active campaigns, completed campaigns | **live** `GET /platform/summary`; labelled preview only when no API is configured | `GET /platform/summary` (**new**) | connected | backend + frontend | `features/marketing/server/home-view.test.ts`, `campaigns.service.platform.spec.ts` |
| `/` - featured ideas (`IdeaCardsSection`) | 3 public ideas with category, pitch, supporters, weighted interest, paid-placement flag | **live** `GET /ideas` (one page, promoted first); preview fixtures only when no API is configured | `GET /ideas` (existing) | connected | frontend | `home-view.test.ts` |
| `/ideas` - discovery dashboard | Listing, taxonomy filters, search/sort in browser, bounded pagination, topics | **live** `GET /ideas` (300-row window, then client filtering) | `GET /ideas`, `GET /taxonomy` (existing) | connected, client-side search | frontend | `features/ideas/server/live-ideas.test.ts` |
| `/ideas/[id]` - idea detail | Story, gate progress, creator, related ideas, roadmap, ask | **live** `GET /ideas/:id` | `GET /ideas/:id` (existing) | connected | frontend | live mapper tests |
| `/ideas/[id]` - discussion | Comment thread with public author projection | **live** `GET /ideas/:id/comments`; read-only on live ideas until a posting BFF exists | `GET /ideas/:id/comments` (existing) | **connected (read)** | frontend | `live-ideas.test.ts` (mapping, 404, outage) |
| `/topics/[slug]` - editorial topics | Topic title, description and member ideas | `features/ideas/content/topics.ts` fixture | `GET /topics`, `?topic=` filter - **missing** | missing | backend + frontend | fixture tests only |
| `/campaigns` - discovery index | Campaign cards, status, funding progress, pagination, filters | **live** `GET /campaigns` (status + 3 sorts + cursor); preview grid only when no API is configured | `GET /campaigns` (existing) | connected, reduced filters | frontend | `features/campaigns/server/live-campaigns.test.ts` |
| `/campaigns/[slug]` - campaign detail | Story, milestones, rewards, creator, funding progress | **live** `GET /campaigns/:idOrSlug`; preview fixtures only when no API is configured | `GET /campaigns/:idOrSlug` (**extended**) | connected | backend + frontend | `live-campaign-detail.test.ts`, `campaigns.service.detail.spec.ts`, `test/campaigns.e2e-spec.ts` |
| `/campaigns/[slug]/back` - contribution flow | Campaign tiers, wallet funding snapshot | preview campaign + local wallet snapshot | contributions / escrow indexer endpoints - **blocked** | blocked | backend | none |
| `/campaigns/[slug]/recommended` | Ranked related campaigns | **live** taxonomy window ranked in the client; preview fixtures only when no API is configured | `GET /campaigns?taxonomyCategory=` (existing) | connected | frontend | `live-campaign-detail.test.ts` (ranking) |
| `/campaigns/categories/[category]` and `/[subcategory]` | Category and subcategory listings, counts | **live** `GET /campaigns?taxonomyCategory=` | `GET /campaigns`, `GET /taxonomy` (existing) | connected | frontend | `live-campaigns.test.ts` |
| `/ideathon`, `/ideathon/about`, `/ideathon/past`, `/ideathon/rules` | Programmes, standings, entries, judging, archive | `features/programmes/content/preview-programmes.ts` | no public programmes/competitions API | blocked | backend | `features/ideathon/lib/standings` tests |
| `/guides`, `/guides/[slug]`, `/blog`, `/blog/[slug]`, `/help` | Editorial guides, journal, FAQs | `features/marketing/content/editorial.ts` + page components | none needed; could move to a CMS later | static | frontend | none |
| `/about`, `/careers`, `/privacy`, `/terms` | Brand, legal, careers copy | Page components | - | static | frontend | none |
| `/contact` | Contact form | `mailto:` handoff; nothing is submitted to Inverge | a contact endpoint if server-side delivery is wanted | static by design | frontend | none |
| Footer newsletter (`NewsletterField`) | Email capture | disabled control with an honest "unavailable" note | subscription endpoint - **missing** | missing | backend | none |
| `/advertising-preferences` | Consent choices | client-side preferences | - | static by design | frontend | none |
| Header / footer navigation | Links, footer categories | `site-header.tsx` / `site-footer.tsx` | - | static by design | frontend | none |
| `sitemap.ts` | Indexable ideas, campaigns, categories | **live** `GET /ideas` + `GET /campaigns` when configured; fixtures only in preview mode | `GET /ideas`, `GET /campaigns` | **connected** | frontend | `app/sitemap.test.ts` |

Shared components are listed once; the pages that use them are named in the
"Page / component" column. `LiveCampaignCard` is used by `/campaigns`, the
campaign category routes, the live campaign detail's related row and the
recommendations route. `IdeaCover` is used by the homepage cards and the idea
surfaces.

---

## 3. Endpoints reused

| Endpoint | Used by | Notes |
|---|---|---|
| `GET /api/v1/ideas` | homepage cards, `/ideas` | Keyset cursor, `limit` capped at 50 (discovery page size), public predicate `VALIDATING/THRESHOLD_MET` + `DISCOVERABLE/FEATURED`. The homepage reads one page and puts the API's `promoted` flag first. |
| `GET /api/v1/ideas/:id` | `/ideas/[id]` | Resolves id or slug; 404 for `DRAFT`; `LINK_ONLY` readable by direct URL but `noindex`. |
| `GET /api/v1/ideas/:id/comments` | `/ideas/[id]` | Public keyset thread. Author projection contains display name, avatar and `isCreator`; no email, wallet or provider id. Bodies are public. |
| `GET /api/v1/campaigns` | `/campaigns`, campaign category routes, recommendations | Keyset cursor, `status`, taxonomy, region, `sort` (`closing-soon`, `newest`, `most-backed`). `FAILED` is never excluded from the default list. |
| `GET /api/v1/campaigns/:idOrSlug` | `/campaigns/[slug]` | Id or source-idea slug. Returns story source (via `idea`), milestones, reward JSON, media and creator projection. Public statuses only for anonymous readers. |
| `GET /api/v1/taxonomy` | category routes / future topic parity | Canonical 15/154 taxonomy with derived public counts. |
| `GET /api/v1/platform/summary` | homepage activity band | Four counters, no money. See §4. |
| `GET /api/v1/platform/escrow` | not used on marketing pages | FR-801 public projection. Deliberately **not** rendered as a homepage statistic; see §6. |

No new API client, data-fetching library or service layer was introduced. The
web keeps `fetchApiJson` (`src/lib/api/server.ts`) for server reads and translates
errors into section states; nothing in the browser calls the API directly.

---

## 4. New endpoint: `GET /api/v1/platform/summary`

| | |
|---|---|
| Method and route | `GET /api/v1/platform/summary` |
| Purpose | Three public counters for the homepage activity band |
| Consuming pages | `/` (`StatsSection`) |
| Auth | None; public read |
| Query params | None |
| Response | `{ asOf: string, publishedIdeas: number, activeCampaigns: number, completedCampaigns: number, totalCampaigns: number }` |
| Definitions | `publishedIdeas` = ideas a visitor can find through `GET /ideas` (`VALIDATING`/`THRESHOLD_MET` **and** `DISCOVERABLE`/`FEATURED`). `activeCampaigns` = `ACTIVE`. `completedCampaigns` = `COMPLETED`. `totalCampaigns` = `ACTIVE|FUNDED|FAILED|COMPLETED`; drafts, review and rejected rows are excluded. |
| Money / privacy | No escrow balance, funding total, treasury figure, user, wallet or transaction field. Asserted by unit test. |
| Database | Four `count()` calls over indexed predicates; no transactional table is scanned and no sum is computed. |
| Cache | `v1:platform:g{n}:summary`, TTL 60 s ±10 %, single-flight via `CacheService`; Redis down falls through to the counts. `asOf` is inside the cached value, so a client can see the snapshot age. |
| Errors | Standard API error envelope; no route-specific status. |
| Tests | `src/modules/campaigns/campaigns.service.platform.spec.ts` - counts, public predicates, no money fields, cache key/TTL. |
| Documentation | `docs/api/gaps.md` (Platform table), `docs/api/caching.md` (key table), regenerated `docs/api/openapi.json`. |

The route lives on the existing `PlatformController` in the campaigns module; it
reuses `CampaignsService` and `CacheService` rather than adding a module for one
read.

---

## 5. Extended endpoint: `GET /api/v1/campaigns/:idOrSlug`

The campaign row has no slug column. A campaign converted from an idea inherits
that idea's already-unique public slug for its marketing URL. This adds no schema
change and no second read route.

| | |
|---|---|
| Method and route | `GET /api/v1/campaigns/:idOrSlug` |
| Purpose | Public campaign detail page and its metadata |
| Consuming pages | `/campaigns/[slug]`, `/campaigns/[slug]/recommended` |
| Auth | None; optional bearer for `myContribution` |
| Identifier | Campaign `id` first; on a miss, the source idea's `slug`; otherwise 404 |
| Public access | `ACTIVE`, `FUNDED`, `FAILED`, `COMPLETED`. `DRAFT`, `IN_REVIEW` and a change-requested draft resolve only for `creatorId === currentUserId`; everyone else receives the same 404 as an unknown id |
| Response | Existing campaign detail shape: status, amounts, deadline, taxonomy, creator projection, milestones with latest claim, reward JSON, media, and the full source `idea` (story fields) |
| Privacy | No backer identity, wallet address, escrow record or transaction list. `myContribution` remains the only viewer-specific field and is never cached |
| Cache | `v1:campaign:g{n}:{idOrSlug}`, 30 s ±10 % for anonymous reads; authenticated reads bypass the shared cache |
| Database | Unique `Campaign.id` lookup or unique `Idea.slug` through the unique `Campaign.ideaId` relation; the detail include was already in place |
| Tests | `campaigns.service.detail.spec.ts` (resolution, draft denial, owner access, cache separation), `test/campaigns.e2e-spec.ts` (real Postgres: id/slug parity, 404s, owner read) |
| Documentation | `docs/api/gaps.md`, `docs/api/caching.md`, `docs/api/README.md`, `docs/web-ui-api-gaps.md`, regenerated `docs/api/openapi.json` |

---

## 6. API gap report

Classification follows the task's vocabulary.

### Available (reused as-is)

- Public idea listing and detail (`GET /ideas`, `GET /ideas/:id`).
- Idea comments with author projection (`GET /ideas/:id/comments`).
- Campaign listing with taxonomy, status, region and three sorts (`GET /campaigns`).
- Campaign detail by id or source-idea slug (`GET /campaigns/:idOrSlug`).
- Canonical taxonomy with live public counts (`GET /taxonomy`).
- Public creator projection by id or username (`GET /auth/creators/:idOrUsername`).

### Extend (compatible additions needed)

| Requirement | Existing surface | Addition | Why it is not done here |
|---|---|---|---|
| Campaign updates, FAQ entities, receipts | `GET /campaigns/:idOrSlug` | Widen the projection once `CampaignUpdate`/FAQ models and the receipts indexer exist | No model; returning empty shells would misrepresent the page |
| Related campaigns by stored editorial rank | `GET /campaigns` | A documented recommendation field or ranking endpoint | The client's current rule is deterministic and stated on the page (shared subcategory, open, nearest deadline) |
| Search on campaign discovery | `GET /campaigns` | `q` parameter with a defined corpus | PRD ties search to a `search_performed` analytics event that is not implemented |
| Topics / editorial collections | `GET /taxonomy` | `GET /topics` + `?topic=` filter | Topics are editorial groupings, not taxonomy terms; the data model does not exist |
| Live discussion posting | `POST /ideas/:id/comments` | None - the write endpoint exists | The public marketing shell has no posting BFF; live pages are read-only for now |

### Missing

- Newsletter subscription endpoint (footer capture is disabled with honest copy).
- Contact submission endpoint (the page currently opens the user's mail client).
- Public programmes/competitions endpoints (listings, standings, entries, judging,
  archive). The ideathon surfaces therefore stay on the programmes fixture.
- Editorial topics endpoint (see above).

### Blocked / unavailable dependency

- **Campaign contributions, milestone claims, tranche releases, refunds and the
  public receipts feed.** These depend on the Anchor programme deployment plus an
  event indexer. `Contribution` and `OnChainEvent` are not populated by any
  running service, so a "backed by" count or receipt timeline would be invented.
  The live campaign detail therefore shows `totalRaised` as the API's indexed
  record with an explicit caveat and no backer count.
- **Ideathon results and judging.** Depends on the competition schema described
  in `inverge-api/docs/idea-community-loop-plan.md`, which is not approved or
  implemented.

### Static by design

- Brand, mission, how-it-works, campaign anatomy, trust strip, FAQ, guides,
  journal, legal pages, careers and navigation. Moving these into a CMS would add
  a dependency without changing a single fact a user relies on.
- `mailto:` contact handoff. Nothing is submitted to Inverge, and the page says so.

### Deliberately not shown

- **Escrow totals.** `GET /platform/escrow` exists and is a legitimate FR-801
  public dashboard, but this task's rules forbid presenting escrow or treasury
  balances as marketing statistics. The homepage's former "Total escrowed" tile
  now shows completed campaigns instead.
- **Raw pre-pledge totals.** Cards show `weightedPrePledgeTotal` labelled
  "estimated interest" (FR-207). The raw sum never leaves the API.
- **Private backer, wallet, transaction and moderation data.** No live marketing
  payload carries any of it; no endpoint was widened in a way that could.

---

## 7. Frontend integration and states

### Homepage (`/`)

- Server component, rendered per request (`connection()`), so a closed campaign
  or a new idea appears without a rebuild.
- `getHomeView()` resolves statistics and ideas **independently** with
  `Promise.all`: one failing endpoint cannot blank the other section.
- When `INVERGE_API_URL` is absent, the page renders the labelled fixtures
  (`Preview data`) exactly as before. When the API is configured but fails, the
  section is `unavailable` and the page never falls back to fixtures.
- Statistics: live values are formatted as counts with an "as of … UTC" line; a
  failed request shows "Unavailable" per metric and one explanation, never a zero.
- Ideas: loading skeleton, live cards, empty state with a creator CTA, error state
  with a `router.refresh()` retry. Cards link to `/ideas/[id]` for live records.

### Idea detail (`/ideas/[id]`)

- Live record from `GET /ideas/:id`; related ideas from the same taxonomy parent.
- The discussion is the API's thread. A comment outage marks only the discussion
  unavailable; the idea itself still renders. Live threads are read-only until a
  posting BFF exists, so the composer is withheld rather than pretending to save.
- Preview keeps its labelled local composer and fixture comments.

### Campaign discovery (`/campaigns`)

- Live mode renders the same hero and trust strip, then a reduced feed: status
  filter, three sorts, cursor "load more", empty state. Unsupported preview
  controls (search, goal/raised/percent/country bands, saved/loved views) are not
  rendered, so no control silently does nothing. Category browsing links to the
  live taxonomy routes.
- Preview mode is unchanged for deployments with no API.
- The API's `FAILED` campaigns are visible under the default `All campaigns`
  view, matching the product rule that a visible failure is proof of the refund
  guarantee.

### Campaign detail (`/campaigns/[slug]`)

- Resolves through `getCampaignDetailSurface`: preview fixtures only when no API
  is configured; otherwise the live read, with a 404 for a non-public record.
- Both campaign detail routes are explicitly dynamic (`force-dynamic`), because
  the page and its metadata read a `no-store` API record. Metadata resolves the
  record before the page render, so no campaign title/description is built for a
  missing or draft slug. The body is the global not-found page, served with HTTP
  200 because the segment's `loading.tsx` has already flushed headers; see the
  caveat in §10.
- Live layout keeps the existing design tokens and tab pattern. Tabs are limited
  to sections with data: Story, Milestones (only when a plan exists), Rewards.
  Updates, FAQ entities, receipts and the discussion are absent rather than
  borrowed from fixtures.
- Story copy comes from the campaign's source idea (`problem`, `solution`,
  `targetUser`, `currentAlternative`, `roadmap`, `roadmapSteps`, `risks`).
- Milestones show the published plan and the latest claim state. No per-backer
  objection data and no escrow balance are rendered.
- Rewards read the stored `rewardTiers` JSON defensively. A malformed payload is
  reported as unreadable; a campaign with no tiers is described as
  donation-based.
- Funding uses only `totalRaised`/`targetAmount`. Zero indexed contributions are
  labelled "No contribution has been indexed yet", not "$0 raised". The rail
  states that backing from this marketing page is not available yet.
- Related campaigns come from the same taxonomy window and are ranked by shared
  subcategory, open status, then nearest deadline. A failed related read leaves
  the campaign intact and says so.
- `LiveCampaignCard` now links to `/campaigns/[slug]`; that route exists for every
  live record because the slug falls back to the campaign id.

### Campaign recommendations (`/campaigns/[slug]/recommended`)

- Same source campaign read, full ranked list, explicit rule statement.
- Unavailable and empty are separate states, each with an actionable link.

### Sitemap (`/sitemap.xml`)

- Async and API-backed when configured. It reads bounded windows (`500` records
  each) of public ideas and campaigns, adds their canonical paths, and derives
  populated category routes from the same records.
- Preview deployments keep the fixture sitemap.
- An API failure returns the static and editorial pages only: the sitemap never
  advertises fixture URLs on a live deployment. The dynamic half is held in the
  Next.js data cache for an hour (tag `marketing-sitemap`), so a crawler cannot
  turn every request into two API list reads.

---

## 8. Performance, caching and cost

- The homepage makes two server requests (summary, one idea page), in parallel.
- The summary is cached in Redis for 60 s with generation-keyed keys and
  single-flight, so a traffic spike hits four indexed counts at most once per
  minute per instance.
- Idea detail makes one detail read plus one related window plus one comments
  page, in parallel. A comments outage does not retry the whole page.
- Campaign detail makes one detail read plus one taxonomy window; the window also
  feeds the recommendations route, so that route reuses the same bounded read
  rather than crawling the catalogue. The detail page keeps the first three.
- `/ideas` and `/campaigns` continue to use the API's 20 s page cache; feed
  parameters are allowlisted and cursors are opaque, so they cannot generate
  unbounded cache keys.
- The campaign detail cache key now includes the id-or-slug used by the caller.
  The same campaign can occupy at most two keys (id and slug) for 30 s; this is
  bounded and not a correctness issue.
- No new indexes were needed: the summary uses existing indexed predicates, the
  campaign detail reads two unique columns, and the related window uses the
  existing taxonomy/date index.
- No WebSocket, streaming, analytics database or paid infrastructure was added.

---

## 9. SEO

- Homepage and campaign index metadata, canonicals and Open Graph tags are
  unchanged; live sections render server-side.
- Idea detail metadata is derived from the same live record the page renders and
  keeps `noindex` for `LINK_ONLY` ideas.
- Live campaign detail metadata uses the campaign's own title/summary and the
  canonical `/campaigns/{slug}` path. Draft and in-review records never reach the
  page or its metadata because the API 404s them.
- The sitemap now lists live idea and campaign URLs and withholds empty category
  pages. It no longer advertises fixture slugs on API-backed deployments.

---

## 10. Verification

Commands and results for this change are recorded in the final task report. The
short version:

- `inverge-api`: typecheck, the platform-summary and campaign-detail unit specs
  (12 tests), the real-Postgres `test/campaigns.e2e-spec.ts` (5 tests: id/slug
  parity, anonymous and cross-user 404s, owner reads), the Nest production
  build, and the committed OpenAPI document (`emit-openapi.ts --check` reported
  it up to date).
- Local HTTP reads against the migrated scratch database: `GET /platform/summary`,
  `GET /campaigns`, `GET /campaigns/{idea-slug}`, `GET /campaigns/{draft-id}`
  (404), `GET /ideas` and `GET /ideas/{id}/comments` all returned the expected
  shape and status.
- `inverge-web`: typecheck, ESLint over every changed file, Prettier, the new
  live campaign detail/discussion/sitemap tests, and the existing
  homepage/campaign/idea suites (10 files, 92 tests).
- The production build succeeded with the default Turbopack compiler. This
  Windows worktree's `node_modules` is a junction to the primary checkout, which
  Turbopack rejects unless its root is widened; a temporary local
  `turbopack.root` override was used for the build and reverted. The committed
  config is unchanged, so CI with a normal install needs no override.
- Live `next start` smoke against the same scratch database:
  - `/` 200 and contains the live campaign;
  - `/campaigns` 200 and contains the live campaign;
  - `/campaigns/smoke-market-ledger` 200 with the live story and reward tier;
  - `/campaigns/smoke-market-ledger/recommended` 200 with the related campaign;
  - `/ideas/smoke-market-ledger` 200 with the live discussion;
  - `/sitemap.xml` 200 with the live slug and **without** fixture slugs.
- **Known Next caveat:** an unknown or non-public slug renders the not-found
  body with HTTP 200 rather than 404. The `campaigns` and `ideas` segments have
  `loading.tsx` boundaries, so the response headers are flushed before the page
  can call `notFound()`; calling it from `generateMetadata` did not change that.
  The body is the global not-found page, carries `<meta name="robots"
  content="noindex">`, and never contains the draft title or payload. The API
  itself still returns 404 for anonymous and cross-user reads, so this is a
  status-code/SEO limitation, not a data exposure.

---

## 11. Recommended next steps

1. Add a campaign `CampaignUpdate`/FAQ model and widen `GET /campaigns/:idOrSlug`
   so the missing detail tabs can be real.
2. Add `GET /topics` + `?topic=` and wire `/topics/[slug]`.
3. Wire live comment posting through the existing BFF/session layer (the write
   endpoint already exists).
4. Decide the programme/competitions API surface before any ideathon page claims
   live standings.
5. Add a newsletter endpoint only when there is a list to write to.
6. Split the sitemap with `generateSitemaps` before raising the 500-record cap.
