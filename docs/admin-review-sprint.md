# Admin review sprint

Date: 2026-10-19  
Status: planned before implementation; verification is appended after the change.

## 1. Selected work

1. Make `/admin` a real overview instead of a redirect to programmes.
2. Add a campaign review queue at `/admin/campaigns` and a review detail at `/admin/campaigns/[id]`.
3. Add the decision rules for approve, request changes, and reject, with mandatory reasons for change/rejection.
4. Append every preview decision to a local audit trail and show it on `/admin/audit`.
5. Add `campaign:review` to the admin permission matrix and enforce it in the domain action and the UI.
6. Document the preview boundary, the missing backend contract, and every deferral.

## 2. Why this first

The audit identified campaign review as the strongest coherent gap: the campaign domain already models review states, but an operator could neither see a submitted campaign nor record a decision. Adding more public or creator UI would leave the lifecycle one-sided.

This work also establishes the admin pattern the remaining queues need: a server-side access gate, explicit preview persistence, permission-aware actions, reasoned decisions, and an append-only record.

## 3. Reused work

- `AdminShell`, admin navigation, and `getProgrammeAdminAccess` (the existing preview gate).
- Campaign domain `CampaignReview`, `CampaignPhase`, and the phase label/tone vocabulary.
- `previewCampaigns` and the campaign `server/` seam.
- `Pill`, `Eyebrow`, `MetricCard`, `Amount`, `Button`, `Textarea`, and the existing focus and spacing conventions.
- The local-store pattern used by the programme workspace, adapted for append-only review events.

## 4. Backend dependencies

| Dependency | State | Effect on this sprint |
| --- | --- | --- |
| Authenticated admin session | Missing in web | The layout continues to deny production access. No real privileged write is attempted. |
| `POST /admin/campaigns/:id/review` or equivalent | Missing | Decisions are local preview records only. |
| Campaign review states in Prisma | Missing | No schema migration is attempted in this sprint. |
| Campaign review audit table | Missing | Local events are explicitly not authoritative. |
| KYC provider status | Missing | The UI names the missing precondition; it does not fabricate verification. |
| Application-fee payment confirmation | Missing | The UI names the missing precondition; it does not fabricate payment. |

## 5. Acceptance criteria

- `/admin` renders an overview with review counts, queue entries, recent preview decisions, and named integration gaps.
- `/admin/campaigns` lists submitted campaigns and their review states; empty states are honest.
- `/admin/campaigns/[id]` shows the pitch, target, creator, milestones, evidence definitions, disclosures, and review history.
- Only a campaign in `in-review` can receive a decision.
- Approve, request changes, and reject produce separate review and phase states.
- Change requests and rejections require a trimmed reason of at least 20 characters.
- A role without `campaign:review` cannot record a decision, even if the control is invoked directly.
- Every successful decision records actor id/name/role, timestamp, campaign, action, before/after review state, and reason.
- `/admin/audit` shows local review events and continues to label the browser store as non-authoritative.
- No KYC status, payment, transaction, escrow total, or publication event is invented.
- Focused tests cover transitions, denial, reasons, and audit fields.
- Formatting, lint, typecheck, tests, and production build are run and reported.

## 6. Explicitly deferred

- Web authentication and a real admin session.
- Campaign review API, Prisma enum changes, and migration.
- Server-side review audit persistence.
- Creator resubmission after a change request.
- KYC review queue.
- Idea moderation.
- Reviewer panel and milestone disputes.
- Platform fee/threshold settings and multisig parameter changes.
- Email or in-app decision notifications.
- Bulk review actions, assignment, reviewer notes, and SLA timers.
- Real publication, funding, escrow, payment, or indexer integration.

## 7. Files

Expected additions and changes:

- `docs/product-audit.md`
- `docs/admin-review-sprint.md`
- `docs/DASHBOARD_PAGES.md`
- `docs/DECISIONS.md`
- `src/features/admin/permissions.ts`
- `src/features/programmes/types.ts`
- `src/features/programmes/lib/programme.ts`
- `src/features/campaigns/lib/admin-review.ts`
- `src/features/campaigns/lib/admin-review.test.ts`
- `src/features/campaigns/components/admin-campaign-review-queue.test.tsx`
- `src/features/campaigns/components/admin-campaign-review-detail.test.tsx`
- `src/features/campaigns/lib/admin-review-store.ts`
- `src/features/campaigns/components/admin-overview.tsx`
- `src/features/campaigns/components/admin-campaign-review-queue.tsx`
- `src/features/campaigns/components/admin-campaign-review-detail.tsx`
- `src/features/campaigns/components/admin-audit-log.tsx`
- `src/features/programmes/components/admin-navigation.tsx`
- `src/features/programmes/components/admin-shell.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/campaigns/page.tsx`
- `src/app/admin/campaigns/[id]/page.tsx`
- `src/app/admin/audit/page.tsx`
- `src/app/admin/layout.tsx`
- `vitest.config.mts`

## 8. Verification record

Date: 2026-10-19. Environment: Windows, Node v22.14.0 (the repository declares
`>=24.21.0`), pnpm 12.3.4. A user-owned `next dev` server was running throughout.

### 8.1 Implemented

| Item | Surface | Evidence |
| --- | --- | --- |
| Admin overview as the index | `/admin` | `admin-overview.tsx`; counts, oldest-first queue, recent local decisions, integration gaps |
| Campaign review queue | `/admin/campaigns` | `admin-campaign-review-queue.tsx`; awaiting review, changes requested, and decided groups |
| Campaign review detail | `/admin/campaigns/[id]` | `admin-campaign-review-detail.tsx`; pitch, use of funds, milestone evidence, disclosures, history, decision form |
| Decision rules | Domain | `admin-review.ts`; pure transition, permission and state guards, reason bounds |
| Review surface tests | Components | `admin-campaign-review-queue.test.tsx` and `admin-campaign-review-detail.test.tsx`; grouping, preview boundary, permission and state gates, required reason, local-only approval |
| Preview persistence | Browser | `admin-review-store.ts`; validated read/write, external-store snapshot, append-only events |
| Audit surface | `/admin/audit` | `admin-audit-log.tsx`; local decisions and sampled programme entries, labelled separately |
| Shared permissions | Domain | `features/admin/permissions.ts`; `campaign:review`; programme names remain aliases |
| Navigation and shell | Admin chrome | Overview and Campaign review entries; shell copy generalised; production denial unchanged |
| Documentation | `docs/` | D-030, dashboard inventory, audit matrix updated |

### 8.2 Commands run

| Command | Result | Notes |
| --- | --- | --- |
| `pnpm typecheck` | **Passed** | `next typegen` and `tsc --noEmit` clean |
| `pnpm build` | **Passed** | 95 static pages generated; `/admin`, `/admin/audit`, `/admin/campaigns`, and `/admin/campaigns/[id]` present |
| `pnpm exec eslint <changed files>` | **Passed** | All changed and new files clean when linted directly |
| `pnpm lint` (whole repo) | **Passed** | 0 problems. The 16 pre-existing findings (5 errors, 11 warnings) were cleared structurally: the ideathon countdown reads a shared clock through `useSyncExternalStore`, the dialog's close-handler ref is written in an effect instead of during render, unused imports and an unused `team` array were removed, and the commented-out password form in `auth-form.tsx` was deleted. The two browser-draft restores keep a one-line `react-hooks/set-state-in-effect` suppression with a WHY comment, because restoring a `localStorage` draft after mount is a hydration boundary, not derived state |
| `pnpm test` (whole suite) | **Passed** | 84 files, 827 tests, no failures, run with `--maxWorkers=2` (see 8.3). Includes `admin-review.test.ts` plus the queue and detail component tests |
| `pnpm exec vitest run src/features/campaigns/lib/admin-review.test.ts` | **Passed** | 10 tests: approve, change request, rejection, reason bounds, state guards, double decision, permission denial, non-mutating override |
| `pnpm exec vitest run src/features/campaigns/components/admin-campaign-review-queue.test.tsx src/features/campaigns/components/admin-campaign-review-detail.test.tsx` | **Passed** | 10 tests: grouping, row links, preview boundary, empty state, permission refusal, state gate, required reason, local-only approval |
| `pnpm format:check` | **Passed** | `endOfLine: "auto"` in `.prettierrc.json` (D-032) makes Prettier preserve each file's existing endings instead of reporting spurious `delete CR` diagnostics; every file uses the configured style |

### 8.3 Test-runner note

The earlier `Timeout waiting for worker to respond` was a cold-cache problem, not a
broken runner and not a defect in `admin-review.test.ts`. On this machine the
first Vite dependency optimization plus first module evaluation exceeds the 60s
worker-start ceiling, so the first run of any file fails; a warm cache resolves
it. `src/lib/money.test.ts` was reproduced both ways: failing cold, passing warm.

Two consequences were recorded and fixed:

- The default 5s per-test timeout was tight enough that the first test in a file
  could time out while its module graph was still evaluating. `vitest.config.mts`
  now sets `testTimeout: 20_000`; the tests themselves complete in milliseconds,
  so only the ceiling moved. Before that change a full run reported
  `2 failed | 706 passed`, both failures being first-test timeouts in untouched
  files (`src/lib/fx.test.ts`, `src/features/ideas/components/ideas-dashboard.test.tsx`)
  that both pass in isolation.
- With the ceiling raised, `pnpm test` reports `72 files passed, 718 tests passed`
  with no failures, and the review tests run and pass rather than being
  unverified. The suite is slow (two to four minutes depending on cache warmth)
  because the Windows filesystem re-evaluates the module graph per test file,
  and jsdom is created once per file; those are performance characteristics, not
  correctness problems, and were not changed here.

The suite has since grown to 84 files and 827 tests. A default-parallelism run
started 56 of 84 files and then failed 28 files with `Failed to start forks
worker` / `Timeout waiting for worker to respond`; no test assertion failed.
Re-running with `pnpm exec vitest run --maxWorkers=2` ran all 84 files and all
827 tests passed. The limit is host contention (a user-owned `next dev` server
and Turbopack worker were running throughout), so the reliable local command on
a loaded machine is `pnpm exec vitest run --maxWorkers=2`; `vitest.config.mts`
was left at its defaults rather than lowering parallelism for every environment.

### 8.4 Formatting note

The CRLF-versus-LF drift is settled by decision D-032 rather than by rewriting
the tree: `.prettierrc.json` now sets `endOfLine: "auto"`, so Prettier preserves
each file's existing endings and stops reporting `delete CR` diagnostics for the
Windows checkout. `pnpm format:check` now passes for the whole repository. No
file was mass-rewritten, and a future `.gitattributes` (`text=auto eol=lf`) is
recorded in D-032 as the deterministic follow-up.

### 8.5 Known limitations

- Review decisions in the web preview do not leave the browser. The API now owns
  the authoritative lifecycle - `CampaignReviewStatus`, an append-only
  `CampaignReviewEvent`, and `POST /admin/campaigns/:id/review` behind
  `PrivyAuthGuard` + `AdminGuard` - but the web client has no authenticated
  session and is not connected to it. The queue and detail pages say so
  explicitly; the local store remains a disconnected preview, not an audit trail.
- Approval changes the preview phase to `funding` and sets a preview
  `publishedAt`, but the server-backed discovery reader still reads the fixtures.
  The detail page says so.
- KYC and application-fee status are named as missing preconditions and are
  never simulated.
- Production admin access remains denied; the preview actor is fixed to a
  platform admin in development.
- Enabling a role without `campaign:review` in development would require a
  code-level actor change; there is no role switcher, because a role switcher
  without a session would imply an authorization model that does not exist.

### 8.6 Next three tasks

1. Connect the web preview to the API once an authenticated session exists:
   replace `admin-review-store` with a client for `GET /admin/campaigns`,
   `GET /admin/campaigns/:id`, and `POST /admin/campaigns/:id/review`, and let the
   server's review events replace the local record.
2. Surface FR-103 (identity) and FR-311 (application fee) read-only in the review
   detail from the API's `preconditions`, so approval is never described as a
   compliance check.
3. Add `.gitattributes` (`text=auto eol=lf`) so line endings are deterministic
   across checkouts, which is the follow-up recorded in D-032.

All three tasks of the previous list are now addressed:
`POST /admin/campaigns/:id/review` exists with Prisma review states and an
append-only audit event (in `inverge-api`); FR-103 and FR-311 are enforced before
submission enters review and re-checked on approval; and the 16 lint findings and
the CRLF/LF drift are cleared, so `format:check`, `lint`, `typecheck`, `test`,
and `build` all pass.

Task 1 of the earlier list - "run and repair the test runner, then execute
`admin-review.test.ts` and the whole suite" - is complete; see 8.2 and 8.3. The
component tests listed there, for the review queue and the decision form, are
also written and passing.

There is no approval to deploy, migrate, or connect a provider in this sprint.
