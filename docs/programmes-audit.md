# Programmes audit and gap analysis

Date: 2026-10-17
Scope: `inverge-web` (Next.js 16 App Router) and `inverge-api` (NestJS, Prisma).

## 1. Route inventory

### Public (implemented)

| Route | State |
| --- | --- |
| `/ideas` | Functional on preview data: search, URL filters, sort, grid/list, pagination, empty state. |
| `/ideas/[id]` | Functional on preview data: story, goals, metrics, feedback dialog, community invite, discussion, related ideas. |
| `/topics/[slug]` | Functional on preview data. |
| `/ideathon` | Leaderboard on preview data: weighted standings, category filter, sort, countdown, sidebar, next-round banner. |
| `/ideathon/about`, `/rules`, `/past` | Implemented editorial pages; `/past` is an honest empty archive. |

### Authenticated product (implemented)

`/d`, `/d/ideas`, `/d/ideas/new`, `/d/ideas/[id]/feedback`,
`/d/ideas/[id]/insights` (and `supporters`, `interest`, `traffic`, `referrals`),
`/d/pre-pledges`, `/d/notifications`, `/d/profile`, `/d/settings`.

### Admin (absent before this work)

There is **no** admin route in `inverge-web`. There is no programme, judging,
sponsor, rewards, workshop, expert, subscription, invoice, ticket or AI-job UI.

## 2. Component and design-system inventory

Reusable: `Container`, `Card`, `Button`, `Pill`, `StatusBadge`, `Input`,
`Textarea`, `Field`, `Select`, `Switch`, `Tabs`, `Skeleton`, `StatePanel`,
`Avatar`, `Amount`, `MetricCard`, `IconTile`, `Eyebrow`, `LineChart`,
`IdeaCover`. Tokens are Tailwind v4 CSS variables in `src/app/globals.css`
(`@theme inline`), with Outfit headings and Geist body.

Conventions: Server Components by default, small Client boundaries
(`use client`), file names kebab-case, feature folders under `src/features`,
route files thin, Hugeicons as the single icon set, Vitest + Testing Library.

## 3. Data and API inventory

### `inverge-api` Prisma models relevant here

`User` (role `USER | ADMIN`), `CreatorProfile`, `Idea` (`DRAFT`,
`VALIDATING`, `THRESHOLD_MET`, `CONVERTED`, `ARCHIVED`), `IdeaSignal`,
`SurveyQuestion`, `SurveyResponse`, `IdeaMetricSnapshot`, `IdeaBoost`,
`FlatFeeCharge` (`BOOST`, `APPLICATION_FEE`; `PENDING`, `SUCCEEDED`,
`FAILED`), `Campaign`, `Milestone`, `Contribution`, `OnChainEvent`.

### Implemented API surfaces

- `GET/POST /ideas`, `PATCH /ideas/:id`, `POST /ideas/:id/publish`
- `POST/DELETE /ideas/:id/support`, `POST/DELETE /ideas/:id/pre-pledge`
- `PUT/GET /ideas/:id/survey`, `POST/DELETE /ideas/:id/survey/responses`
- `GET /ideas/:id/insights` (creator-only)
- `GET/PATCH /admin/params`, `GET /admin/params/audit`, `GET/PATCH
  /admin/boost-prices`, `GET /admin/users`, `PATCH /admin/users/:id/role`
- `POST /ideas/:id/convert`, campaign and milestone services
- Boosts and flat fees behind ports

### Absent from the API

Programme/challenge models, registrations, submissions, judging rubrics and
scores, leaderboard snapshots, rewards and fulfilment, sponsors and
sponsorships, workshops and bookings, expert profiles and mentorship bookings,
plans/entitlements/subscriptions, sponsor invoices, workshop tickets,
AI analysis jobs, and a general admin audit log for programme changes.

The community-loop plan (`docs/idea-community-loop-plan.md` in `inverge-api`)
proposes `Challenge*` tables and endpoints but is explicitly
**"Draft for product owner review; no code written."** It is not implemented.

### Web data layer

No generated API client, no TanStack Query, and no authenticated session.
Feature data comes from `content/preview-*.ts` modules behind typed shapes.
There is no Privy package installed in `inverge-web`; sign-in screens are UI
only. Therefore no web page can currently make an authorized API call.

## 4. Authentication and authorization

- API: `PrivyAuthGuard` (session JWT), `OptionalPrivyAuthGuard`, `AdminGuard`
  (`role === ADMIN` or env allowlist), `KycVerifiedGuard`.
- Web: no session, no role source, no protected-route enforcement. Product
  pages are reachable but render preview data.
- Consequence: a programme admin UI cannot perform real privileged work yet.
  It must (a) live behind a server-side access boundary, (b) label preview
  persistence, and (c) never claim a server write succeeded.

## 5. Payments, subscriptions, invoices, notifications

- Implemented: campaign contributions and escrow (separate architecture),
  flat-fee boost and application-fee records, provider-port pattern.
- Absent: subscriptions, plans, entitlements, invoices, workshop tickets,
  sponsor payments, prize payouts, webhook handling for those flows.
- Decision recorded by absence: no provider may be invented. All new money
  surfaces are state models plus explicit "not connected" states, and a payment
  can only become `paid`/`confirmed` from a verified provider event.

## 6. Tests and quality gates

Commands: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`,
`pnpm build`, or `pnpm check`.

Baseline before this work: typecheck passed; lint passed with 6 pre-existing
warnings; `format:check` failed on 70 untouched files (pre-existing); Vitest
needed `--pool=threads --maxWorkers=1` because the default forks pool cannot
start workers in this environment. 137 tests ran; 11 failed before the earlier
idea-section work, now reduced to pre-existing suites unrelated to this change.

## 7. Gap analysis

### Already implemented and reusable

- Public discovery, detail, feedback, community invite, analytics, ideathon
  standings, shared UI primitives, brand tokens, money formatting.
- API survey, support, pre-pledge, insights, admin role guard, platform params,
  boost pricing, audit log for params.

### Implemented but incomplete

- Ideathon: static single competition, no lifecycle states, no registration or
  submission, no prizes/sponsors/schedule/judges, no archive data.
- Analytics: basic metrics and AI gate exist; no AI job or usage records.
- Idea creation: preview draft only; no API write.

### UI-only / preview data

- All idea content, feedback forms, community destinations, goals, analytics
  series, ideathon standings, and the new programme admin workspace.

### Missing and requiring implementation

- Programme domain (shared model, lifecycle, modules, schedule, assets).
- Admin programmes dashboard, 8-step wizard, management workspace.
- Registrations, submissions, judging, snapshots, rewards, sponsors.
- Workshop/expert/showcase modules.
- Plans, entitlements, subscriptions, invoices, tickets, prize fulfilment.
- Audit log for programme changes.
- API contracts and Prisma migrations for all the above.

### Blocked by external integration or unresolved product decision

- Payment provider selection and live checkout/webhooks.
- Privy session wiring in the web app (API gap item 25 is still open).
- AI provider, plan pricing, and entitlement source.
- Whether sponsored challenge entries reuse `Idea` or a separate submission.
- Prize payout rail and KYC threshold for winners.

## 8. Implementation decision for this change

1. Build a **shared programme domain** in `features/programmes` with typed
   lifecycle, modules, schedule, assets, rewards, sponsors, judging, and money
   flows, all pure and unit-tested.
2. Build a **server-guarded admin workspace** (`/admin/...`). In development it
   runs as a clearly labelled preview; in production it denies access until a
   real session/role check is wired. Authorization remains an API concern and is
   not simulated as confirmed.
3. Build the **dashboard, 8-step autosaving wizard, and management workspace**
   against that domain, with honest states for every action that needs a server.
4. Improve the **public ideathon** to read the programme: status-aware CTA,
   prize pool, sponsors, schedule, judges/mentors, modules, FAQ, archive.
   Sponsor and brand marks are rendered from `logoUrl` only when it is a local
   asset or an https URL; otherwise an initials tile stands in, so the wall never
   shows a broken image or invent a mark. Admins edit the URL per sponsor in the
   Sponsors tab, with a live wall preview in Branding.
5. Implement **separate money state models** (subscription, promotion, sponsor
   invoice, workshop ticket, prize fulfilment) with no fake success.
6. Keep AI analytics gated by a server-owned entitlement boundary; add usage and
   job states without fabricating output.

## 9. Compatibility and non-goals

- No duplicate routes or second design system.
- No new payment provider, keys, or webhook claims.
- No change to idea validation metrics, FR-204 gate, boost separation, or
  campaign escrow architecture.
- Existing preview surfaces keep working; new programme data is additive.

## 10. Verification record

| Gate | Result |
| --- | --- |
| `pnpm typecheck` | Passes. |
| `pnpm build` | Passes. All `/admin/*` routes prerender; `/admin/programmes/[id]` and `/new` are dynamic. |
| `pnpm test -- --pool=threads --maxWorkers=1` | 193 tests pass across 28 files, including new programme, monetisation, and FX suites. |
| `pnpm lint` | No findings in any file added or modified by this change. Five pre-existing errors remain in `feedback-builder`, `feedback-dialog` (two), `idea-builder`, and `competition-countdown` — all untouched by this work. |
| `pnpm format:check` | Not clean, pre-existing (~70 untouched files). New files are formatted. |

## 11. Known limitations

1. **No server persistence.** Admin writes, drafts, and published programmes live
   in `localStorage` under an explicit "preview" label. A second browser will not
   see them, and clearing storage loses them.
2. **Production denies admin access.** `getProgrammeAdminAccess()` returns a real
   denial in production because no authenticated session exists in this repo.
   This is deliberate: the alternative is a fake gate.
3. **No API contract or migrations.** Programme models exist only as TypeScript.
   `inverge-api` has no programme tables, endpoints, or audit records for them.
4. **Money flows are state machines, not integrations.** Subscriptions, sponsor
   invoices, workshop tickets, promotions, and prize fulfilment cannot reach a
   paid/confirmed state without a verified provider event, and no provider is
   configured. Every such surface says so.
5. **AI analytics has no provider.** Usage counters and entitlement checks are
   real; job execution and generated output do not exist, so nothing is shown as
   generated.
6. **NGN figures are display estimates and geolocation-gated.** `src/lib/fx.ts`
   uses a hard-coded ₦1,600/$1 illustrative rate, rounded to the nearest ₦1,000,
   and is never used for payment arithmetic. `src/lib/geo.ts` decides whether to
   show it at all from the device's timezone (`Africa/Lagos`) or an `NG` locale;
   server output omits the line entirely and it appears only after hydration.
   There is no IP geolocation or saved preference yet, so a Nigerian reader with
   a non-Nigerian device configuration will not see it, and vice versa.
7. **Screenshots were not verified visually.** The reviewing model cannot read
   images; journeys were verified through build output, typecheck, and tests.

## 12. Prioritised next steps

1. Add programme Prisma models and NestJS endpoints behind `AdminGuard`, then
   replace the local store with server actions.
2. Wire Privy in `inverge-web` and swap the dev-preview gate for a real role
   check, including per-role server authorization for judges and organisers.
3. Choose a payment provider, then implement webhook verification, idempotency,
   and reconciliation for the four money flows already modelled.
4. Persist the programme audit log server-side so admin actions are attributable.
5. Decide the AI provider and entitlement source, then execute jobs through a
   queue rather than in the browser.

