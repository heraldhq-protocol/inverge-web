# Inverge product audit

Date: 2026-10-19  
Scope: `inverge-web` and the relevant `inverge-api` contracts.  
Authority order: `Inverge_PRD_SRS_v1.2.md` → `PROJECT_BRIEF.md` → accepted decisions → architecture and engineering standards.

This audit records what exists, what only looks like it exists, and what cannot be built honestly in this repository yet. It is an implementation audit, not a product roadmap.

## 1. Status vocabulary

| Status | Meaning |
| --- | --- |
| **Implemented** | The behaviour exists and is covered by code and tests. It may still depend on a missing external service, which is stated separately. |
| **Partial** | A real surface or rule exists, but a required part is absent. |
| **Demo-only** | The interface works on preview fixtures. It does not persist, authorise, pay, verify, or move money. |
| **Missing** | No implementation exists. |
| **Blocked** | Work cannot be completed honestly until an external service, credential, contract, or product decision exists. |
| **Needs verification** | Code exists but the required end-to-end evidence was not available in this audit. |

## 2. Implementation matrix

### 2.1 Admin workspace and operations

| Area | Status | Evidence | Dependency or blocker | Priority | Proposed work and acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| Admin shell and access boundary | **Partial** | `src/app/admin/layout.tsx`, `src/features/programmes/server/access.ts`, `admin-shell.tsx`, `admin-navigation.tsx`. Development runs as a labelled preview; production denies access. Navigation now covers overview, campaign review, programmes, payments, and audit. | No authenticated web session or role source. The API `AdminGuard` is authoritative but cannot be reached from this client. | P0 | Keep the denial state. Acceptance: no production page simulates a privileged write; every preview surface states its persistence boundary. |
| Admin overview | **Implemented (preview)** | `/admin` renders `admin-overview.tsx`: review counts, oldest-first queue, recent local decisions, and named integration gaps. | Real metrics need API data. | P0 | Shipped. Acceptance met: counts derive from preview records and local decisions; no KYC, payment, or transaction metric is fabricated. |
| Campaign review queue | **Implemented (preview)** | `/admin/campaigns` and `/admin/campaigns/[id]` render `admin-campaign-review-queue.tsx` and `admin-campaign-review-detail.tsx`; unknown ids 404. | No campaign review API endpoint or review audit table, so decisions are browser-local. | P0 | Shipped. Acceptance met: only `in-review` campaigns receive decisions; groups cover awaiting review, changes requested, and decided; empty states are honest. |
| Review decision rules | **Implemented (preview)** | `features/campaigns/lib/admin-review.ts` with `admin-review.test.ts`. Separate review and phase transitions; mandatory trimmed reasons for change/rejection; permission and state guards. | Server enforcement still requires the missing API endpoints. | P0 | Shipped. Acceptance met: approve, change request, and rejection are distinct; organiser and judge are denied; failures are typed and explicit. |
| Review audit trail | **Partial** | `admin-review-store.ts` appends local validated events; `/admin/audit` shows them beside sample programme entries, both labelled. | No append-only server audit store for campaign reviews. | P0 | Shipped as a preview only. Acceptance met for actor, role, timestamp, target, before/after state, and reason; the page states the browser store is not authoritative. |
| Permission-aware admin states | **Implemented (preview)** | `features/admin/permissions.ts` adds `campaign:review`; the UI and `decideCampaignReview` share `adminCan`. Programme names remain aliases. | Real roles need a session claims source. | P0 | Shipped. Acceptance met: an organiser or judge cannot record a decision in domain tests; a hidden control is never treated as authorization. |
| Idea moderation | **Missing** | No admin idea moderation route or API. Public/creator idea surfaces are preview data. | No moderation endpoint, report model, or moderator role mapping. | P1 | Defer until the idea API contract includes reports, decisions, reasons, and an audit record. |
| KYC management | **Missing / Blocked** | API has KYC guards and provider-oriented models; web has no KYC data or route. | KYC provider credentials, web session, provider webhook handling, and review policy. | P1 | Do not fabricate statuses. Build only after the provider boundary exists; acceptance must include FR-105 timestamped transitions and NFR-12 (no raw documents). |
| Dispute panel | **Missing / Blocked** | Milestone states include `disputed`; no reviewer panel, appeal record, or ruling action exists. | Reviewer authority, panel membership, on-chain multisig execution, and written-reason storage. | P1 | Defer. A UI-only dispute action would imply authority the platform does not have. |
| Platform settings and fees | **Missing in web / Partial in API** | API has admin params, boost prices, and param audit endpoints. Web has no settings screen. | On-chain parameter changes require multisig and public logging (FR-902); application fee needs a payment provider. | P1 | Build a read-only settings view only when the API client exists; separate off-chain prices from on-chain parameters in the UI. |
| Admin audit log | **Partial** | `admin-audit-log.tsx` combines browser-local review events with sampled programme entries and labels each source. | The web cannot append authoritative audit records. | P0 | Shipped as a preview. Preserve append-only semantics in the local store; replace it with an API reader when available. |

### 2.2 Campaign lifecycle, review, and milestones

| Area | Status | Evidence | Dependency or blocker | Priority | Proposed work and acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| Campaign domain model | **Implemented** | `features/campaigns/types.ts` separates review, phase, payment, contribution, refund, milestone, and transaction states. Money uses atomic strings. | None for the model. | P0 | Keep the separation. Acceptance: no single status collapses publication, funding, escrow, and payment truth. |
| Review state presentation | **Implemented** | `lib/status.ts` gives every phase a label, tone, and consequence; `CampaignPhase` includes `unknown`. | No admin transition existed. | P0 | Reuse the existing phase vocabulary in admin; acceptance: unknown values fail safe and never render as approved. |
| Public campaign discovery and detail | **Demo-only** | `/campaigns`, category pages, detail tabs, contribution preview. Fixtures carry `demo: true`; every transaction is `null`. | Campaign API, indexer, wallet, and payment provider. | P1 | Replace fixtures behind `server/campaigns.ts` with a validated API reader. Acceptance: public totals are indexer-backed and reconcilable; missing totals stay unavailable. |
| Creator campaign wizard | **Partial** | Seven-step wizard with validation. The draft persists through the API; the review step starts/resumes the non-refundable application fee and submits the saved draft (D-048). Other campaign surfaces still read fixtures. | Browser test with the stub processor and a live Paystack test-mode run. | P1 | Keep the API as the gate. Acceptance: no submission enters review on a client-only claim; the fee is never charged twice. |
| Campaign submission API | **Implemented** | `CampaignsService.submit()` enforces FR-103 KYC/AML and the FR-311 succeeded, campaign-bound fee inside the transaction. `POST /campaigns/:id/application-fee` starts or resumes the charge, and `application-fee.e2e-spec.ts` covers draft -> fee -> webhook -> submit. | Live payment-provider verification. | P0 backend | Keep the verification and fee re-check at submit. Acceptance: an unpaid or unverified campaign cannot enter review. |
| Admin review API | **Missing** | No approve/change/reject endpoints. Prisma `CampaignStatus` lacks the web review states. | Schema migration, service layer, guards, audit log. | P0 backend | Add endpoints with explicit states, actor, reason validation, and immutable audit events. Acceptance: the client cannot choose its own review outcome. |
| Milestone plan and escrow terms | **Demo-only** | Allocation in basis points, evidence definitions, objection windows, success fee, fixed 20% working tranche, and all-or-nothing copy. | Escrow program, indexer, wallet. | P1 | Keep display derived from each campaign's published terms. Acceptance: no platform-wide percentage is invented except the fixed tranche D-045 defines; released tranches are never described as clawed back. |
| Milestone worklist | **Demo-only** | `/d/creator/campaigns/[campaignId]/milestones` lists every milestone, why it is blocked, and a claim form. | Escrow transactions, evidence storage, objection voting. | P1 | Do not enable claims until the server and chain lifecycle exists. Acceptance: a submitted claim is not treated as approved or released. |
| All-or-Nothing refund promise | **Demo-only** | Refund states and copy are modelled; no refund can be executed. | Escrow program and wallet. | P1 | Preserve the promise text and states; add execution only with chain integration. Acceptance: no UI claims a refund completed without a confirmed transaction. |
| Campaign transparency totals | **Demo-only** | Funding source distinguishes `indexed`, `reconciling`, and `unavailable`; preview totals are fixture values. | Indexer. | P1 | Add a public transparency reader from indexer projections. Acceptance: totals are labelled by source and reconcile to chain data. |

### 2.3 Idea validation and discovery

| Area | Status | Evidence | Dependency or blocker | Priority | Proposed work and acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| Public idea discovery and detail | **Demo-only** | `/ideas`, `/ideas/[id]`, `/topics/[slug]`; search, filters, feedback, discussion placeholder. | Idea API read model and public creator identity. | P2 | Move fixtures behind a validated API reader. Acceptance: supporter and interest counts identify their source; no invented comments. |
| Ideathon standings | **Demo-only** | `/ideathon` and editorial pages. Scores and community support are separate. | Programme API, judging persistence, snapshots. | P2 | Persist programmes, submissions, and frozen leaderboard snapshots. Acceptance: published results use a frozen checksum, not a live recomputation. |
| Idea creation and workspace | **Demo-only** | `/d/creator/ideas/new`, workspace, feedback setup, insights. Drafts are local. | Idea write API and authenticated session. | P2 | Add server persistence and idempotent writes. Acceptance: refresh and second-device access preserve the idea. |
| Feedback inbox and analytics | **Demo-only** | `/d/creator/feedback`, analytics screens, gated AI panel. | Feedback API, analytics data, AI entitlement. | P2 | Replace fixtures incrementally; keep AI output gated until a real job exists. Acceptance: no synthetic insight is rendered as generated. |
| Idea moderation | **Missing** | No moderation queue or report model. | Admin API and policy. | P2 | Defer with KYC/disputes until the backend contract exists. |

### 2.4 Creator Studio

| Area | Status | Evidence | Dependency or blocker | Priority | Proposed work and acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| Studio overview | **Demo-only** | `/d/creator` metrics, next steps, recent ideas. | API aggregation. | P2 | Keep derived metrics honest when the API arrives. |
| My ideas list | **Partial** | List works on preview data; no search, status filter, sort, archive, or pagination. | Idea API. | P2 | Add filters and archive only with server semantics. |
| Idea edit route | **Missing** | `DASHBOARD_PAGES.md` records that `/d/creator/ideas/[id]/edit` does not exist. | Idea update API. | P2 | Reuse the builder once drafts persist server-side. |
| Campaign list and workspace | **Demo-only** | `/d/creator/campaigns`, workspace, edit, milestones. | Campaign API and session. | P1 | Wire after the admin review API defines the creator-visible decision record. |
| Audience | **Missing** | No follower or relationship model. | Product decision and domain model. | P3 | Do not stub a tab before the model exists. |

### 2.5 Backer dashboard and saved campaigns

| Area | Status | Evidence | Dependency or blocker | Priority | Proposed work and acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| Backing history and receipt | **Demo-only** | `/d/backing`, `/d/backing/[contributionId]`; payment, contribution, and refund shown separately. | Contribution API, provider webhooks, indexer. | P1 | Add server reads keyed to the authenticated backer. Acceptance: no receipt claims confirmation without both provider and escrow evidence. |
| Saved campaigns | **Partial** | Browser store with explicit non-sync notice; unresolved ids are shown as unavailable. | Account-synced save API. | P2 | Keep the local boundary until account sync exists. Acceptance: no copy claims cross-device persistence. |
| Contribution flow | **Demo-only** | `/campaigns/[slug]/back` with provider-absent handoff. | Payment provider, quote API, wallet. | P1 | Integrate only after provider selection and quote contract. Acceptance: no success state appears without a confirmed provider and escrow event. |

### 2.6 Transparency and cross-cutting concerns

| Area | Status | Evidence | Dependency or blocker | Priority | Proposed work and acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| Public accountability copy | **Implemented** | `lib/escrow.ts` derives every sentence from campaign terms, including the non-refundable first tranche and non-clawback rule. | None. | P0 | Preserve. Acceptance: published terms drive copy; unreleased tranches are refundable, released ones are not reversed. |
| Public transparency dashboard | **Missing / Blocked** | No platform-wide settlement, fee, or escrow dashboard exists. | Indexer projections and on-chain parameter history. | P2 | Build only on reconcilable chain-derived totals. |
| Authentication and session | **Missing / Blocked** | API uses Privy and session JWTs. Web has no Privy dependency, session, or role source. | Privy app configuration and backend session exchange. | P0 | Wire the session boundary before allowing any real admin or creator mutation. |
| Typed API client | **Missing** | No generated client and no web fetch layer for product data. | OpenAPI contract and backend availability. | P0 | Generate from the backend contract; validate external payloads at the boundary. |
| Money precision | **Implemented** | `src/lib/money.ts` uses `MoneyAmount` with string atomic units; campaign percentages use basis points. | None. | P0 | Keep. Acceptance: no financial arithmetic uses JavaScript floating point. |
| Transaction and payment states | **Implemented in model / Demo-only in UI** | Separate `PaymentState`, `ContributionState`, `RefundState`, `MilestoneState`, and nullable `TransactionRef`. | Providers and chain. | P0 | Keep states separate. Acceptance: no button click is treated as settlement. |
| Input validation | **Partial** | Wizard and provider-link parsing validate locally; admin review actions currently lack server validation. | Server endpoints. | P0 | Validate review action, actor, campaign id, and reason on the server when it exists. This sprint validates in the domain and UI. |
| Demo/production separation | **Implemented** | Preview fixtures, preview chips, production admin denial, no fabricated transactions. | None. | P0 | Preserve every explicit notice. Acceptance: production errors never fall back to fixture data. |
| Accessibility | **Needs verification** | Semantic tables, labelled controls, focus-visible classes, and status text exist. No automated axe pass or manual keyboard audit was recorded. | Browser/device verification. | P1 | Add targeted accessibility checks for admin review and keyboard-only action flows. |
| Test and build gates | **Partial** | Post-sprint: 718 tests pass across 72 files, `pnpm typecheck` and `pnpm build` pass. `pnpm lint` completes with 16 pre-existing findings (5 errors, 11 warnings) in untouched files, and `pnpm format:check` still fails on pre-existing CRLF drift. | Fixing the lint findings and a settled line-ending policy. | P0 | Clear the lint findings and settle the CRLF/LF policy so the full gate can pass. |

## 3. Documentation conflicts and ambiguities

| ID | Conflict or ambiguity | Current handling |
| --- | --- | --- |
| A-01 | FR-503a now fixes the working-capital tranche at 20% of the target; D-020's 15–25% choice is superseded by D-045. | Resolved by D-045: the wizard has no tranche control, the API accepts exactly 20, and the milestone weights divide the remainder and total 10,000 on their own. |
| A-02 | The SRS requires admin review to gate publication (FR-304) and prohibits review before KYC and the application fee (FR-103, FR-311). | Resolved by D-047 and D-048: the API re-checks verification and the linked succeeded fee at submit, and the web explains the server state rather than substituting a client claim. |
| A-03 | The web review model has `changes-requested` and `rejected`; Prisma `CampaignStatus` does not. | The preview can model the product states; the API needs a schema and migration before any real review decision. |
| A-04 | FR-901 names KYC, reviewer-panel, and platform-parameter administration. The web has none of those, and the API has only params, boost prices, role changes, and user listing. | Keep them missing rather than drawing operational controls with no authority. |
| A-05 | The SRS requires a public audit log for on-chain parameter changes (FR-902). No on-chain parameter history or multisig integration exists. | Settings stay out of scope until the authority model is real. |
| A-06 | A campaign can be approved in preview while KYC and fee evidence are not available. | Label the decision as a preview record, not a production approval. The API must enforce the preconditions before the same transition is real. |
| A-07 | Public creator identity is incomplete in the API and the web uses fixture creator profiles. | Keep preview identity labels; do not infer verification from a name or badge. |
| A-08 | The campaign discussion surface is an unavailable state; no comment model exists. | Do not seed comments. Keep the honest empty state. |

## 4. Baseline evidence

The pre-sprint test baseline recorded in `baseline-tests.log` was:

- 257 tests passed across 35 files;
- 2 suites failed while importing Hugeicons under the Windows `EMFILE: too many open files` limit (`home-dashboard.test.tsx`, `notifications-dashboard.test.tsx`);
- no assertion failures were reported in those suites.

The post-sprint run supersedes both results: `pnpm test` passes 708 tests across 70
files with no `EMFILE` failure and no assertion failure. The pre-sprint worker-start
timeouts were a cold Vite cache on this machine, not a product defect; the record is
in `docs/admin-review-sprint.md` section 8.3.

Formatting, lint, typecheck, and production build results are recorded after the sprint in the sprint record. Pre-existing failures are not attributed to this work.

## 5. Audit conclusion

The repository has a strong campaign domain and unusually honest demo boundaries. Its largest launch gap was operational: the admin workspace was programme-only, the campaign review lifecycle had no operator surface, and review decisions had nowhere to be recorded. The follow-up sprint therefore shipped the admin overview, campaign review queue and detail, decision guard, permission-aware states, and a browser-local audit trail, all kept explicitly in preview.

This does **not** make the platform launch-ready. Real admin work remains blocked on authentication, a campaign review API, schema states, KYC, payment confirmation, an escrow indexer, and an authoritative audit log. See `docs/admin-review-sprint.md` for the implemented scope, verification results, and deferrals.
