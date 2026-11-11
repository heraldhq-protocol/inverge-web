# Inverge Admin Workspace — Audit, Current State & Remaining Work

Status: **Working Operational Plane**  
Target Routes: `src/app/admin/*`  
Authoritative Requirements: `docs/Inverge_PRD_SRS_v1.2.md` (§3.9, FR-103, FR-206, FR-304, FR-311, FR-406, FR-505, FR-901–FR-904)

---

## 1. Executive Summary & Audit of Existing Work

A comprehensive scan of `src/app/admin` and related feature modules (`features/campaigns`, `features/verification`, `features/advertising`, `features/programmes`) reveals that **significant frontend scaffolding, preview workflows, and data structures already exist**.

However, the majority of these surfaces currently operate on **fixtures and client-side simulation** (`previewCampaigns`, `previewProgrammes`, `previewAuditEntries`). The primary goal is **not building from scratch**, but transitioning existing preview screens to **live API data, adding missing review actions, and refining responsive design**.

---

## 2. Component-by-Component State Matrix

| Admin Section | Route | Current State | What Is Already Built | What Remains To Be Built / Wired |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Shell & Nav** | `/admin/*` | **Functional Preview** | Layout, responsive drawer (`AdminNavigation`), RBAC access gate (`getProgrammeAdminAccess`), session display | Mobile font scaling consistency; live session identity |
| **Overview** | `/admin` | **API wired; live browser verification pending** | Public summary, reported escrow, and admin analytics with independent failure states, source timestamps, period selection and refresh; legacy preview is isolated to preview auth | Confirm against a running API and real admin session; backend escrow reconciliation remains unresolved |
| **Campaign Review** | `/admin/campaigns`<br>`/admin/campaigns/[id]` | **API wired; live verification deferred** | Validated paginated queue, detail, approval checks, review history and confirmed decisions; preview auth is isolated | Backend review projection omits authored story/disclosures and milestone deadlines; validate against the deployed API; listing freeze endpoint (FR-903) |
| **Verification & KYC** | `/admin/verification`<br>`/admin/verification/[id]` | **Live API Wired** | Queue table, risk categorization (`Low`, `Medium`, `High`), case detail view, `ResolveRiskForm` with decision submission | Verification webhooks integration; strike tracking & strike decay ledger (FR-310) |
| **Users & Roles** | `/admin/users` | **API wired; live verification pending** | Session-gated directory with email/provider search, role filter, paging and a per-account role editor; preview accounts are isolated and a preview change is never described as saved; the mobile admin nav wraps below the sticky header instead of scrolling sideways | Widen `UpdateUserRoleDto` before offering `COMPLIANCE_REVIEWER`; the list endpoint returns no total, so paging is inferred from a full page; confirm against a deployed API and a real admin session |
| **AI Access** | `/admin/ai-access` | **API wired; live verification pending** | Status-filtered request list, optional approval expiry, confirmed pending-only decisions, and explicit unavailable/recovery states | Real admin-session verification; the API caps the oldest-first list at 200 and supplies no cursor or total |
| **Analytics Access** | `/admin/analytics-access` | **API wired; live verification pending** | Cursor-paged request list, status filters, approval/expiry changes and revocation with validated confirmations | Real admin-session verification; the backend omits totals and exposes no revision precondition for concurrent decisions |
| **Moderation Screening** | `/admin/moderation` | **API wired; live verification pending** | Idea/campaign text screening, validated advisory results, separate internal/creator-facing explanations, classifier provenance and explicit new-case retries | Real admin-session verification; no case-list/read API or listing-freeze transition is supplied by this endpoint |
| **Boost Pricing** | `/admin/boost-prices` | **API wired; live verification pending** | Exact-cent Basic/Featured price and duration editing, changed-field updates, validated confirmations and partial-failure recovery | Real admin-session verification; backend updates/audit writes are not transactional and have no revision precondition |
| **Advertising** | `/admin/advertising` | **Interactive UI (Preview)** | Inventory table, placement scheduling (`Basic`, `Featured`), live preview switcher, slot pause/resume | Connect live ad booking endpoints; boost pricing is now a separate API-backed admin view |
| **Programmes & Ideathons** | `/admin/programmes`<br>`/admin/programmes/new`<br>`/admin/programmes/[id]` | **Interactive UI (Preview)** | Programme creation wizard (`ProgrammeWizard`), track configuration, prize pool editor, sponsor logo management | Connect backend database persistence for created programmes; submission evaluation flow |
| **Payments & Treasury** | `/admin/payments` | **Interactive UI (Mock Data)** | Reconciliations ledger, application fee records (FR-311), platform success fee estimates (FR-505), monetization tier breakdown | Connect payment gateway webhooks for non-refundable fee reconciliation; live USDC ledger |
| **Audit Log** | `/admin/audit` | **Interactive UI (Mock Data)** | Filterable audit log UI (`AdminAuditLog`), actor filtering, action category breakdowns, RBAC permission matrix view | Replace `previewAuditEntries` with persistent audit database stream |

---

## 3. Targeted Implementation Tasklist

### Admin overview integration (2026-11-03)

`src/features/admin/server/overview.ts` gates reads through the existing server
admin access check and reads three reports concurrently. A live failure, missing
configuration, invalid response or expired session never falls back to fixtures.
Preview authentication still renders the existing explicitly labelled local
overview and makes no report requests.

| Endpoint | Presentation | Contract and limits |
| --- | --- | --- |
| `GET /platform/summary` | Published ideas; active, completed and total public campaigns | Counts only. It supplies neither backer counts nor pledge totals. `asOf` identifies the snapshot; upstream cache is 60 seconds. |
| `GET /platform/escrow` | USD held estimate, reported released and refunded totals; active, completed and failed campaign counts | Runtime schema follows `getPlatformEscrowStats()` in backend revision `01e324ae41bc891a47e9a6ff130b13b13a1226a0`. OpenAPI has no response schema. Decimal strings retain cents and are never converted to floating point. Negative or malformed amounts make the report unavailable. |
| `GET /admin/analytics/overview` | Views, exact or summed daily sessions, and a resource-type table | Server derives inclusive UTC dates for 7/30/90 days and forwards the HttpOnly session token only to this protected endpoint. This report has no time series. Resource-level session counts are always summed daily uniques; the totals honour `uniqueSessionsExact`. |

The escrow payload is `{ asOf, heldUsd, releasedUsd, refundedUsd, counts: {
active, completed, refunded } }`. Source:
[campaigns.service.ts at the inspected revision](https://github.com/heraldhq-protocol/inverge-api/blob/01e324ae41bc891a47e9a6ff130b13b13a1226a0/src/modules/campaigns/campaigns.service.ts).
The backend computes held USD as active campaigns' raised totals minus historical
tranche releases, and uses JavaScript `Number` before returning decimal strings.
This mixes accounting scopes and is **not a reconciled escrow balance** (FR-801–803,
NFR-08). The UI explicitly labels it an estimate; it cannot recover precision
already lost upstream. Released/refunded totals aggregate indexed events, but no
network, finality, indexer freshness or reconciliation result is supplied. The
`counts.refunded` field actually counts `FAILED` campaigns and is labelled
"failed", never interpreted as completed refund claims. Fix the backend
accounting/provenance contract before treating this report as authoritative.

All three responses are runtime validated. Source timestamps are rendered in UTC,
public snapshots older than five minutes are flagged, and an absent analytics
aggregation date is shown as incomplete rather than as proof of no activity.
There are no treasury or escrow mutations in this change.

Validation: all 29 focused parser, server-access, rendered-state and conversion
route tests pass with `pnpm test src/features/admin
"src/app/api/ideas/[id]/convert/route.test.ts" --maxWorkers=1 --pool=threads`.
The first fork-worker run hit the Windows cold-start limit; the serial thread
run passed. `pnpm typecheck`, `pnpm build`, scoped ESLint and scoped Prettier
checks pass. The production build includes `/admin` and the normalized
`/api/ideas/[id]/convert` route.
The repository-wide formatting baseline has 44 existing failures; the full lint
run reports two errors in untouched feedback/media hooks and three warnings.
The dev server starts and an unauthenticated `/admin` request returns 307 to
`/auth?next=%2Fadmin`. This is an HTTP access check, not browser verification.
A real authenticated browser pass still needs an API origin, an admin session
and Playwright tooling; none is available in this checkout/session.

The dev-server check also exposed a pre-existing route collision between
`api/ideas/[id]` and `api/ideas/[ideaId]/convert`. The conversion route and its
tests now live under `[id]/convert`, with the parameter bound to the same internal
`ideaId` variable. Its public URL and conversion behavior are unchanged.

### Campaign review integration (2026-11-03)

`src/features/campaigns/server/admin-campaigns.ts` and
`src/app/api/admin/campaigns/[id]/review/route.ts` connect the campaign review
workflow to the backend API. Request contracts follow `docs/api/openapi.json`.
The specification omits response schemas, so runtime response validation follows
[CampaignReviewService at revision 01e324a](https://github.com/heraldhq-protocol/inverge-api/blob/01e324ae41bc891a47e9a6ff130b13b13a1226a0/src/modules/campaigns/campaign-review.service.ts)
and its controller, DTO, preconditions and review rules.

| Endpoint | Method | Operation & Contract |
| --- | --- | --- |
| `/api/v1/admin/campaigns` | `GET` | Reads `{ items, total, skip, take, reviewStatus }`. UI filters all six supported states, defaults to `IN_REVIEW` and pages in batches of 50. Counts come from the response. |
| `/api/v1/admin/campaigns/{id}` | `GET` | Reads `{ campaign, applicationFee, preconditions, reviewEvents }`. Renders identity/fee checks, linked idea snapshot, supplied media links, structured evidence, reward tiers, and actual decision history. A 404 is distinct from an unavailable or malformed response. |
| `/api/v1/admin/campaigns/{id}/review` | `POST` | Sends `APPROVE`, `REQUEST_CHANGES` or `REJECT`. Reasons are trimmed, limited to 2,000 characters and require at least 20 characters for changes/rejection. Same-origin, live admin access and a real session are enforced. |

The live components use a dedicated admin projection rather than inventing a
complete preview `Campaign`. Missing money and dates remain missing. Targets
retain exact USD cents; the UI does not compute balances or tranche amounts.
The fee's numeric amount is not used because the backend converts its Decimal to
`Number`; the authoritative fee eligibility check and payment status are shown.

`LiveAdminCampaignDetail` updates only from a validated receipt with matching
campaign ID, action, review status, reviewer and event. The BFF response is
`{ mode: "live", decision }`. The client renders those confirmed facts, refreshes
server state, and never writes live decisions to localStorage. Approval changes
the review status only; publication, funding and escrow state are separate.
The backend rechecks identity and fee gates (FR-103/FR-311) on approval and owns
the immutable review event (FR-304).

Validation, authorization and upstream errors remain visible. Approval blockers
are rendered from the failure details. A stale decision (409), network failure,
server error or invalid success response requires a reload before another write;
a timeout is not presented as proof that the backend did not commit.

Preview components are selected only by explicit development preview access.
They keep the existing labelled browser-local workflow and make no review API
calls. The live write route refuses preview identities. Missing configuration,
expired sessions and failed reads never select fixtures.

Backend limits: the admin select does not return the authored campaign title,
summary, story, use of funds, disclosures or milestone deadlines. Queue titles
therefore use the linked idea title or the campaign ID, and the detail clearly
labels the idea snapshot as conversion-time material. The API must extend this
projection for a reviewer to inspect all current campaign content. Terms hashes
are shown when supplied; this review endpoint does not generate an on-chain hash.
Live verification is deferred because the backend is not deployed.

Local validation of the campaign review and role DTO changes: 118 focused tests
across 13 files passed in separate runs, including preview regressions. Initial
preview cold-import and Vitest worker-start issues were resolved by resetting
preview storage without re-importing the icon graph and rerunning the affected
suite. `pnpm typecheck`, `pnpm build`, scoped ESLint, scoped Prettier and
`git diff --check` passed. The build includes both campaign review pages and the
campaign/role mutation routes. The full formatting check reported 43 files
outside this change; full lint still reports the two existing errors in the
feedback and media hooks, plus warnings. Authenticated browser verification
remains deferred: the backend is not live and Playwright MCP is unavailable in
this session. Unit/component results do not substitute for that browser pass.

### Users & roles integration (2026-11-03)

`src/app/admin/users/page.tsx`, `src/features/admin/server/users.ts` and
`src/app/api/admin/users/[id]/role/route.ts` add the account directory the admin
nav previously lacked. Contracts follow `docs/api/openapi.json`; the
specification declares no response schema for either route, so runtime
validation follows the backend admin controller and its `USER_SELECT`
projection at revision `01e324ae`.

| Endpoint | Method | Operation & Contract |
| --- | --- | --- |
| `/api/v1/admin/users` | `GET` | Returns a bare array with no envelope and no total: `id`, `email`, `providerUserId`, `role`, `kycStatus`, `bannedAt`, `createdAt`. Forwards `query`, `role`, `limit` and `offset`; the page size is 25 and is clamped to the documented maximum of 200. |
| `/api/v1/admin/users/{id}/role` | `PATCH` | Body `{ role }` validated by `UpdateUserRoleDto`, which accepts only `USER` and `ADMIN`. Same-origin, live admin access and the HttpOnly session are rechecked. Returns the updated account projection. |

`GET /admin/users` is confirmed to take `offset`, not `skip`, and to return no
`total`. Paging therefore shows Older only while a full page arrives, and never
invents a count. A malformed page, an expired session, a missing API origin and
an upstream failure each render the directory as unavailable with a way back;
none of them borrow sample rows.

`ASSIGNABLE_ROLES` in `src/features/admin/lib/users.ts` is the single switch for
the writable role set. `COMPLIANCE_REVIEWER` exists in the database and is
displayed and filterable, but it is not offered as a choice because
`UpdateUserRoleDto` rejects it. Widening that constant widens the client editor
and the BFF together; the shared `updateUserRoleSchema` (FR-901) is enforced in
both places.

The BFF refuses cross-site requests, non-admin or preview identities, invalid
JSON, roles outside the DTO, and self-demotion before the API is called. The
server write helper additionally requires the confirmed account to be the one
that changed, so a stale or unrelated response is reported rather than rendered
as a new role. A 404 is distinct from an unreachable service.

In the UI, one bordered surface holds the search field, role filters and paged
list; each account row expands into an inline editor rather than stacking a card
inside a card. Changes report through `role="status"` and failures through
`role="alert"`, and focus returns to the row trigger when the editor closes.
Preview accounts (`src/features/admin/content/preview-users.ts`) are fabricated
`@example.com` addresses; a preview role change updates the row and says so,
and is never sent to the API. Preview never implies a saved backend change.

Validation: `pnpm typecheck` passes, the focused role-model, DTO, server and BFF
suites pass 45 tests across six files, and `pnpm test src/features/admin` passes
60 tests across eight files. Scoped ESLint and Prettier checks are clean. A
running dev server served `/admin/users` at 200 for a preview session: the nine
sample accounts render, `?role=ADMIN` returns two, `?q=amara` returns one, an
unmatched search shows the empty state, and an unknown `role` value is ignored.
The write route answered 503 (`API_REQUIRED`) for a preview session, 403
(`ORIGIN_NOT_ALLOWED`) for a cross-origin request and 403 (`FORBIDDEN`) without a
session, so neither preview nor a cross-site caller reaches the API. Playwright
is not available in this environment, so the guide's browser pass — console and
network inspection plus a 390×844 interaction check — is still outstanding; the
HTTP renders and component tests above are not a substitute.

### Users & roles polish (2026-11-05)

The directory now uses balanced two-column role filters on small screens, a
48-pixel search control and 16-pixel mobile input text. Its loading skeleton
matches the responsive controls and heading. Member, current-account and banned
labels have stronger text contrast, and keyboard focus uses the existing
`brand-strong` token.

The inline role editor is a named native form. Save supports keyboard submission;
Escape discards an unsaved draft and returns focus to the row trigger. Pending
requests keep the editor open and its controls disabled until a confirmed
response arrives. Errors remain visible without changing the displayed role.
Long account identifiers, notices and errors wrap within the row. Existing role
contracts and authorization restrictions (FR-901) remain in place.

An empty later page offers "Back to first page" while preserving the current
search and role filter. An unmatched first-page search still offers "Clear
filters". `PRODUCT.md` records design context derived from the approved documents
and explicitly preserves their authority.

Validation: `pnpm test src/features/admin src/app/api/admin/users --maxWorkers=1
--pool=threads` passes all 76 tests across 10 files. The regressions cover native
submission, Escape and focus restoration, pending confirmation, and directory
recovery links. `pnpm typecheck`, `pnpm build`, scoped ESLint and scoped Prettier
checks pass. The production build generates 266 pages and includes `/admin/users`
and its role mutation route. Checks ran with Node 24.18.0 and pnpm 12.3.4; the
declared Node range is `>=24.21.0 <25`, so validation on that baseline remains
outstanding.

Playwright MCP exercised an isolated browser preview of the actual admin shell,
directory, row and loading components with fabricated fixtures and mocked role
responses. Search, filters, pagination, empty and unavailable states, retry,
read-only access, keyboard editing, a delayed successful save and a rejected save
passed. Responsive checks covered widths from 320 to 1440 pixels, including
390x844, long identifiers and the open editor. Reduced-motion loading stayed
static. The final preview reported no console errors or warnings; the only failed
network request was the deliberately mocked 403 response. Mobile, desktop and
error-state screenshots were visually inspected.

The real `/admin/users` route redirects to `/auth?next=%2Fadmin%2Fusers`, where
sign-in is reported as unconfigured. Authenticated live directory and role-change
verification therefore remains outstanding, and Task 6.1 stays pending. Temporary
browser-preview tooling was removed after verification.

Repository-wide checks remain blocked by existing issues outside this change:
`pnpm format:check` reports 39 untouched files, and `pnpm lint` reports two errors
and three warnings. The errors are `react-hooks/set-state-in-effect` in
`src/features/feedback/components/feedback-builder.tsx:519` and `react-hooks/refs`
in `src/features/media/components/use-media-upload.ts:65`.

### AI access request integration (2026-11-05)

`/admin/ai-access` reads `GET /api/v1/admin/ai/access-requests` and submits decisions
through `PATCH /api/admin/ai/access-requests/{id}` to the matching backend route.
Request DTOs follow the [current API specification](https://raw.githubusercontent.com/heraldhq-protocol/inverge-api/refs/heads/main/docs/api/openapi.json).
Its AI responses have no schema, so runtime validation follows
[AiEntitlementService at c3e23b0](https://github.com/heraldhq-protocol/inverge-api/blob/c3e23b085989581125371fab0ef41a63476cd28b/src/modules/ai/ai-entitlement.service.ts).

The backend returns `{ data }`, oldest requests first, with `status` and `limit`
filters and no cursor or total. The UI offers 50/100/200 records, clearly describes
the bounded list, and never invents a next page. Only pending AI requests expose
decision controls; decided and expired approvals remain readable. An approval
can have a future expiry, entered in local time and transmitted as an ISO instant.
Displayed dates use explicit UTC. AI and analytics entitlements remain separate
(D-055); approving access does not change assistant quotas or provider availability.

Every read and write checks a live administrator session (FR-901). Preview,
missing configuration and expired sessions expose unavailable states without
fixtures. The BFF enforces same-origin writes, validates input, keeps the token
server-side and returns a non-cacheable receipt. Success requires the matching
request, decision, admin source, decision timestamp and expiry. The browser also
checks the account ID. A conflict, timeout or invalid confirmation preserves the
last confirmed state and requires a reload before another decision. No grant
data is persisted in browser storage.

Verification: all 35 focused contract, service, BFF and component tests pass,
along with scoped ESLint, scoped Prettier, `pnpm typecheck` and `pnpm build`
(267 generated pages, including the new view and BFF). Playwright MCP exercised the actual components in
an isolated preview: native keyboard submission, Escape/focus/draft reset,
delayed approval, expiry conversion, an intentional 409, status filters, list
limits, read-only decisions, loading/empty/unavailable/retry states and reduced
motion. Open editors and long identifiers fit 320/390/768/1280/1440px; mobile and
desktop screenshots were inspected. The final normal preview has no console
errors or warnings. The only failed API request was the deliberate 409 fixture.

The real route redirects to `/auth?next=%2Fadmin%2Fai-access`; sign-in is not
configured, so authenticated live verification remains outstanding. Checks used
Node 24.18.0 and pnpm 12.3.4; the declared Node baseline and existing repository-wide
lint/format failures recorded above still need separate resolution.

### Analytics access request integration (2026-11-05)

`/admin/analytics-access` reads `GET /api/v1/admin/analytics/access-requests`
and forwards decisions through `PATCH /api/admin/analytics/access-requests/{id}`.
Runtime schemas follow the checked-in OpenAPI response DTOs. Revision behavior
is confirmed against
[AnalyticsAccessService at c3e23b0](https://github.com/heraldhq-protocol/inverge-api/blob/c3e23b085989581125371fab0ef41a63476cd28b/src/modules/analytics/analytics-access.service.ts).

The queue uses the API's opaque cursor, newest-first ordering and 24/50 page
sizes. Changing a filter or page size resets the cursor; an empty later page
offers a return to the first page with the filter preserved. Repeated cursors,
duplicate records, mismatched filters and inconsistent page metadata fail
closed. No total is invented when the API reports `totalKind: "omitted"`.

Analytics grants can be revised after a decision, unlike pending-only AI
requests. An admin can change or remove an expiry, approve a rejected request,
or revoke an approval. The existing local-time expiry field preserves the exact
stored instant, including seconds, until edited. Rejections send no expiry.
The backend retains the grant's `REQUEST`, `ADMIN` or `PAID` source; a decision
does not change billing, creator tier or the separate AI entitlement.

Reads and writes require live server-verified admin access (FR-901), and the BFF
rejects cross-site requests. A successful response must match the request,
decision and expiry before the displayed state changes. Preview sessions never
read or write grants. Ambiguous failures preserve the last confirmed state and
require a reload before another decision. The backend has no revision token or
conditional update for this operation, so concurrent administrators can still
overwrite a decision; browser duplicate-submission protection cannot solve that.

Verification: the 153-test admin/BFF regression suite and the expanded six-case
analytics component suite pass. Scoped ESLint/Prettier, `pnpm typecheck`,
`git diff --check` and `pnpm build` pass (268 generated pages). Playwright MCP
exercised the actual components with fabricated fixtures and mocked responses:
pagination, filter/page-size reset, native submission, Escape/focus restoration,
delayed confirmation, exact expiry preservation/removal, revocation, a deliberate
409, and loading/empty/unavailable/retry states. Open forms fit 320–1440px,
including 390x844. Console and network inspection found only the deliberate 409
failure. The real route on the development server redirects to
`/auth?next=%2Fadmin%2Fanalytics-access`, where sign-in is unconfigured, so live
authenticated verification remains pending. The existing 39 formatting failures,
two source lint errors and Node 24.18.0 baseline limitation remain as recorded
above; temporary preview adapters also produce four lint warnings.

### Moderation screening integration (2026-11-05)

`/admin/moderation` submits `POST /api/admin/moderation/screen` to
`POST /api/v1/admin/moderation/screen`. The request follows `ScreenContentDto`:
`idea` or `campaign`, optional title (200 characters), and non-empty text
(20,000 characters). OpenAPI omits the response shape, so runtime validation
follows [ModerationService at c3e23b0](https://github.com/heraldhq-protocol/inverge-api/blob/c3e23b085989581125371fab0ef41a63476cd28b/src/modules/moderation/moderation.service.ts),
its classifier port, routing vocabulary and Prisma `ModerationCase` projection.

Every run saves an advisory case under the authenticated administrator. The API
uses that administrator for account checks and supplies no listing ID; this tool
cannot assess a creator's identity or sanctions status. Campaign review,
verification and listing publication/removal are separate operations. Only
`AUTO_CLEAR` and `HELD_FOR_REVIEW` are accepted, and a result must match the
submitted kind, current actor and absence of a listing link (FR-901, NFR-14).

The result shows risk scores, category findings, reason codes, the review brief,
classifier and policy version. Internal findings remain separate from the
unaltered creator-facing explanation. No message is sent to a creator. The
`stub` classifier is explicitly identified as a test classifier; an advisory
clear result is not presented as campaign approval. Editing content marks its
previous result as outdated. Text and results stay in component memory and are
not persisted in browser storage.

The BFF requires a live admin and same-origin request, strips unknown response
fields and never exposes the session token. It allows 45 seconds for screening,
with a 50-second browser timeout. The operation has no idempotency key or case
lookup API: a timeout or malformed confirmation may follow a saved case. The
form therefore suppresses automatic retries and requires a deliberate "Start
another screening" action before another case can be created. Session failures
require a reload. Missing configuration and preview access render unavailable
states without a simulated classifier.

Verification: all 192 admin/BFF tests across 22 files pass, including 37 new
screening tests. Scoped ESLint/Prettier, `pnpm typecheck`, `git diff --check` and
`pnpm build` pass (270 generated pages). Playwright MCP
exercised native submission, validation, delayed results, held/clear findings,
reason separation, stale-content notices, deliberate retry after an unconfirmed
attempt, access failures, empty/loading/unavailable states and widths from 320
to 1440px including 390x844. The mobile form was visually inspected. Normal
rendering has no console errors or warnings; failed requests were the deliberate
503 and 403 fixtures. The real route redirects to the unconfigured sign-in page,
so live authenticated screening remains unverified. The repository-wide
format/lint and Node baseline limitations recorded above still apply.

### Boost pricing integration (2026-11-05)

`/admin/boost-prices` reads `GET /api/v1/admin/boost-prices` and sends changes
through `PATCH /api/admin/boost-prices` to the matching API endpoint (FR-206,
FR-904). Request fields follow `BoostPricesDto`; duration limits (1–365 whole
days) and the otherwise unspecified response follow
[AdminController at c3e23b0](https://github.com/heraldhq-protocol/inverge-api/blob/c3e23b085989581125371fab0ef41a63476cd28b/src/modules/admin/admin.controller.ts)
and its DTO. The response is `{ basic: { priceUSD, durationDays }, featured: {
priceUSD, durationDays } }` with numeric USD prices. Empty, malformed, zero,
fractional-cent and unsupported-range prices make the view unavailable rather
than selecting a frontend default.

The browser/BFF uses the shared `MoneyAmount` (`currency: "USD"`, `decimals: 2`,
integer atomic strings). Parsing, comparison and formatting preserve cents;
`formatMoneyWithCents` leaves existing whole-dollar formatting unchanged. Only
the API adapter converts to the numeric DTO, after a checked decimal round trip
and a conservative magnitude bound. D-063 records this wire compatibility rule.

The editor sends only changed fields. For example, a Basic price edit sends
`{ basic: { price: { atomic: "537", currency: "USD", decimals: 2 } } }` to the
BFF, which sends `{ basicPriceUSD: 5.37 }` upstream. Unrelated platform parameters,
currencies and fractional durations are rejected. No application-fee or on-chain
parameter is included. Paid placement remains separate from organic validation
metrics and campaign review (FR-206a, NFR-15).

Reads and writes recheck a live administrator; preview sessions cannot change
configuration. Same-origin validation and a non-cacheable receipt protect the
BFF. A save remains pending until every requested field matches the response.
Validation failures permit correction; a timeout, partial/malformed confirmation
or permission failure requires a full reload before another write. The last
confirmed settings remain visible, and no success or audit timestamp is invented.

The API's `PlatformParamsService.set` records the acting administrator and
appends audit rows, but the four-field update loop and each parameter/audit pair
are not transactional. Some values may be durable when a later write or audit
insert fails. The frontend makes that uncertainty explicit and never retries
automatically. The backend also supplies no revision token, so same-field edits
by concurrent administrators can overwrite each other. Atomic updates with
their audit records and a concurrency precondition remain backend work.

Verification: all 267 admin/BFF/money tests across 27 files pass, along with
scoped ESLint/Prettier, `pnpm typecheck`, `git diff --check` and `pnpm build`
(272 generated pages). Playwright MCP
exercised the actual components with isolated, mocked responses: exact-cent
display and saves, delayed confirmation, changed-field-only payloads, invalid
prices, duration limits, discard, partial receipts, permission/service failures,
reload recovery and loading/empty/unavailable states. Widths from 320 to 1440px,
including 390x844, have no horizontal overflow; mobile and desktop screenshots
were visually inspected. Normal rendering has no console errors or warnings
and no failed requests; the 503 and 403 responses were deliberate fixtures.
The real route redirects to `/auth?next=%2Fadmin%2Fboost-prices`, where sign-in
is not configured, so authenticated live pricing remains unverified. The
repository-wide format/lint and Node baseline limitations above still apply.

### Phase 1: Campaign Review Live Integration (FR-304, FR-311)
- [x] UI review queue and status filter tabs (`/admin/campaigns`).
- [x] Detail screen for the supplied campaign record, approval checks, milestone evidence, media links and review history (`/admin/campaigns/[id]`).
- [x] Inline approval, change-request and rejection form with reason validation.
- [x] **Task 1.1**: Connect `/admin/campaigns` and `/admin/campaigns/[id]` to validated live reads and confirmed BFF decisions, with explicit preview isolation and independent funding/review states.
- [ ] **Task 1.2**: Verify terms-hash anchoring in the separate publication/deployment flow (FR-303); the curation endpoint only records a review decision.
- [ ] **Task 1.3**: Add explicit campaign "Freeze" action (FR-903) allowing admins to take down public listings without touching escrow assets.

---

### Phase 2: Verification & Compliance Adjudication (FR-103, FR-310)
- [x] Live case listing and summary table (`/admin/verification`).
- [x] Case inspection (`/admin/verification/[id]`) with risk breakdown and automated check results.
- [x] Risk resolution form (`ResolveRiskForm`) hooked to `/api/admin/verification/cases/...`.
- [ ] **Task 2.1**: Implement creator strike tracker (FR-310) for upheld backer objections (1st strike = 6 mo, 2nd strike = 12 mo, 3rd strike = mandatory review).
- [ ] **Task 2.2**: Ensure sanitization of verification documents so PII is never stored in browser state or unauthenticated caches.

---

### Phase 3: Advertising & Boost Pricing (FR-206, FR-904)
- [x] Inventory table showing slot type, campaign name, dates, status, impressions, and clicks (`/admin/advertising`).
- [x] Pause, resume, and preview controls in `AdminAdvertising`.
- [ ] **Task 3.1**: Connect advertising mutations to backend storage rather than local state.
- [x] **Task 3.2**: `/admin/boost-prices` configures Basic/Featured prices and durations through the audited API (FR-904). Live verification and transactional backend audit/update guarantees remain outstanding.

---

### Phase 4: Programmes & Ideathon Persistence
- [x] Programme creation multi-step wizard (`ProgrammeWizard`).
- [x] Sponsor management, challenge track configuration, and prize pool structure.
- [x] Programme workspace loader with tabs for participants, submissions, and settings.
- [ ] **Task 4.1**: Connect `ProgrammeWizard` to database persistence instead of `localStorage`/`previewProgrammes`.
- [ ] **Task 4.2**: Implement participant submission reviewing and scoring views for ideathons.

---

### Phase 5: Financial Reconciliations & Live Audit Trail (FR-505, FR-901)
- [x] Application fee and prize pool summary ledgers (`/admin/payments`).
- [x] Audit log UI with actor search, role breakdown, and timestamp formatting (`/admin/audit`).
- [ ] **Task 5.1**: Reconcile live payment gateway webhooks for application fees (FR-311, FR-406).
- [ ] **Task 5.2**: Connect platform success fee tracker (5% per released escrow tranche) to live indexing data (FR-505).
- [ ] **Task 5.3**: Stream live immutable audit log events into `/admin/audit` from server-side mutations.

---

### Phase 6: Unsurfaced Backend Capabilities (`docs/api/openapi.json`)
The backend specification defines these additional admin capabilities. User management now has a frontend; the remaining areas still need views:
- [ ] **Task 6.1**: **User & Role Management**: `/admin/users` and its role-update BFF are present; the broader directory integration still needs verification. `UpdateUserRoleDto.role` accepts only `USER` or `ADMIN`. The frontend now shares this schema across the BFF and server write helper, checks that the confirmed role matches the request, and keeps session roles separate. The generated OpenAPI already declares the correct values. `platform_admin` is a frontend programme permission role, not a request value. `COMPLIANCE_REVIEWER` can occur in session reads but cannot be assigned by this DTO; `compliance_officer` is not a supported update value.
- [x] **Task 6.2**: **AI Assistant Access Requests**: `/admin/ai-access` connects `GET /api/v1/admin/ai/access-requests` and `PATCH /api/v1/admin/ai/access-requests/{id}` with confirmed decisions. Authenticated live verification remains pending.
- [x] **Task 6.3**: **Analytics Access Requests**: `/admin/analytics-access` connects the paginated list and confirmed grant decisions, including expiry changes and revocation. Authenticated live verification remains pending.
- [ ] **Task 6.4**: **Platform Runtime Parameters**: Wire `GET /api/v1/admin/params` and `PATCH /api/v1/admin/params` to inspect and update platform operational parameters.
- [x] **Task 6.5**: **Moderation Screening**: `/admin/moderation` connects advisory screening and case confirmations. Live verification, moderation queues and listing freeze remain separate work.

### Remaining endpoint inventory (2026-11-05)

Comparing `docs/api/openapi.json` with the frontend call sites leaves **10
documented admin operations without frontend integration**, counting each method
and path separately and including the standalone KYC/KYB administrator APIs.
Every path below has the prefix `/api/v1`.

| Area | Remaining operations |
| --- | --- |
| Runtime parameters and their history | `GET /admin/params`; `PATCH /admin/params`; `GET /admin/params/audit` |
| Editorial email tools | `GET /admin/email/templates`; `POST /admin/email/editorial/preview`; `POST /admin/email/editorial/send` |
| Individual AML screening and history | `POST /kyc/admin/aml-screen`; `GET /kyc/admin/aml/{userId}` |
| Business AML screening and history | `POST /kyb/admin/aml-screen`; `GET /kyb/admin/aml/{userId}` |

Overview reporting, campaign review, users/roles, AI and analytics access, moderation screening, boost pricing, and the unified verification
queue/case-resolution endpoints already have frontend integrations. Their live
verification limits are recorded above.

`/admin/params/audit` covers parameter changes only. The moderation operation runs
a screening harness; it supplies neither a review queue nor a listing-freeze
transition. The checked-in specification has no dedicated admin contracts for
the broader advertising inventory, programme persistence and judging, payment
and settlement ledgers, a cross-feature audit feed, campaign listing freezes, or
the creator strike ledger. Those remaining workspace features need backend
contracts supplied or confirmed before frontend integration. Provider webhooks
are backend/provider integrations and do not replace those admin read APIs.
