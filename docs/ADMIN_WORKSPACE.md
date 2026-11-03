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
| **Advertising** | `/admin/advertising` | **Interactive UI (Preview)** | Inventory table, placement scheduling (`Basic`, `Featured`), live preview switcher, slot pause/resume | Connect live ad booking endpoints; dynamic boost price configuration (FR-904) |
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
- [ ] **Task 3.2**: Add the admin form for configuring `Basic` and `Featured` boost prices (FR-904) and emit audit events on price updates.

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
- [ ] **Task 6.2**: **AI Assistant Access Requests**: Wire `GET /api/v1/admin/ai/access-requests` and `PATCH /api/v1/admin/ai/access-requests/{id}` to adjudicate Creator Studio AI access.
- [ ] **Task 6.3**: **Analytics Access Requests**: Wire `GET /api/v1/admin/analytics/access-requests` and `PATCH /api/v1/admin/analytics/access-requests/{id}` to grant premium platform analytics access.
- [ ] **Task 6.4**: **Platform Runtime Parameters**: Wire `GET /api/v1/admin/params` and `PATCH /api/v1/admin/params` to inspect and update platform operational parameters.
