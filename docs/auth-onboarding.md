# Authentication and onboarding

Status: **partially live.** The shared sign-in, creator intent, and the shared
profile step are wired to `inverge-api`. A local preview auth mode can run the
same UI without the API, and includes an account-type/business-name prototype
that the live API cannot store yet. Creator type persistence, progressive
verification, tiers, KYC, and wallet provisioning states are not implemented in
the web client; this document records exactly where the boundary is so nothing
below is presented as working.

## Flow

| Step | Route | Authority |
| --- | --- | --- |
| Entry | any public CTA | `authHref(nextPath?, intent?)` |
| Sign in or create account | `/auth` (also `?next=`, `?intent=creator`) | Web3Auth modal, then the API verifies the identity token (or the local preview mode) |
| Session | `POST /api/auth/session` | BFF; API returns a one-hour session JWT |
| Account setup | `/onboarding/profile` | `PATCH /api/auth/me/profile` through `PATCH /api/auth/profile`; account type is preview-only |
| Starting point | `/onboarding/role` (also `?intent=creator`) | Presentation only; no role is granted |
| Creator Studio | `/d/creator` | Protected by the dashboard layout; modules still use preview data |
| Dashboard | `/d` | Protected: server layout exchanges the HttpOnly session with `/auth/me`; no session redirects to `/auth?next=…` |
| Public profile | `/u/[username]` | Public API projection; no session required |
| Sign out | `/sign-out` | Provider `disconnect()`, then `POST /api/auth/sign-out` |

`/sign-in` and `/sign-up` are permanent redirects to `/auth`.

The account setup step asks who the account is for before showing name fields:

- **Just me** collects the person's public name.
- **A business** collects a business name (public) and a contact name
  (not public).
- Both collect a username, then continue to the starting-point question.

The starting-point question is asked for **both** intents. Creator intent
pre-selects "Build & validate" and keeps Creator Studio as the destination if
the visitor skips, but it never answers the question for them.

The account-type and business-contact fields are a **preview-only prototype**.
`CreatorProfile` has no field for either, so live mode shows the original
display-name + username form rather than collecting data that would be
discarded. The preview BFF stores them in the local preview cookie.

## Onboarding intent

Intent is a **routing hint**, not an authorisation claim. It answers only "did
this visitor come through a creator door?"

- Values: `general` (default) and `creator`, parsed by
  `safeOnboardingIntent()` against a closed set. Anything else is `general`.
- Carried in the URL as `?intent=creator` and in the HttpOnly
  `inverge_onboarding_intent` cookie for the session lifetime.
- Sent to the BFF with the identity token, but **never forwarded to the API**.
  It cannot select a role, tier, or capability.
- Overwritten on every successful sign-in, so an abandoned flow cannot decide
  where a new session lands.
- Cleared when the shared profile is stored and on sign-out.

Post-auth routing (`postAuthPath`):

1. `requiresOnboarding === true` → `/onboarding/profile`, regardless of intent.
2. Otherwise creator intent → `/d/creator`.
3. Otherwise → the validated `?next=` path, default `/d`.

After the account step, `postProfilePath` sends everyone to `/onboarding/role`;
creator intent becomes `?intent=creator` so the question is pre-selected. The
starting-point route sends a chosen "build" to `/d/creator` and "support" to
`/d`; skipping goes to `/d/creator` for creator intent and `/d` otherwise.

Creator CTAs ("Start an idea", "Start building") use
`authHref(undefined, "creator")`. General CTAs stay `/auth`.

## Route protection

There are two independent steps, and only the second one authorises:

1. **Proxy fast path.** `src/proxy.ts` redirects `/d/**` and `/admin/**` to
   `/auth?next=…` when no session cookie is present. It checks cookie presence
   only; it never treats a cookie value as proof of identity. A stale or forged
   cookie passes this step.
2. **Server layout gate.** `src/app/(product)/layout.tsx` calls
   `readSessionUser()`, which forwards the HttpOnly cookie to `GET /auth/me`.
   A missing, expired, revoked, or unverifiable session returns `null` and the
   layout redirects before any dashboard content renders. The admin layout does
   the same and additionally requires the API's `ADMIN` role.

The proxy also forwards the observed pathname in an internal
`x-inverge-pathname` header so the layout can preserve a safe return path. The
value is sanitised by `authHref()` and can never become an open redirect.

The API remains the authority for every private endpoint. The web layouts
decide whether a page may render; they do not replace the bearer-token checks on
`/auth/me`, `/auth/capabilities`, `mine=true` idea reads, or any other guarded
route.

## Preview auth mode

`INVERGE_AUTH_MODE=preview` (ignored when `NODE_ENV=production`) keeps the real
Web3Auth sign-in but does not exchange the provider token with the API. Instead
the BFF decodes the token's payload for a stable subject (never the wallet
address), hashes it, and stores a local preview identity in the HttpOnly
`inverge_preview_session` cookie.

- The token's signature is **not** verified in preview mode because there is no
  API to verify against. The cookie is not a credential: it unlocks the
  already-labelled preview shell and nothing else. It is never sent to the API.
- Profile saves, account type, and business contact persist in that cookie.
  Username availability returns `501 not_available_in_preview`, which the form
  reports as "could not check" rather than pretending the handle is free.
- Preview mode is disabled in production. Removing the variable (or setting it
  to `api`) restores the real BFF exchange.
- The account menu labels the result "Preview account" and says it is local to
  the browser. No wallet, payment, KYC, or verification state is implied.

## Account setup

The account step is the first onboarding write that is real in live mode.

- `ProfileOnboardingForm` collects a display name and a username. Both are
  required by the API's `requiresOnboarding` rule.
- In preview mode it also collects the account type and, for a business, a
  contact name. These are stored in the preview cookie only. The live API path
  accepts the fields at the BFF boundary but forwards only `displayName` and
  `username`, so an unknown-field rejection cannot happen.
- The form posts to `PATCH /api/auth/profile`. That route:
  - rejects a cross-site request (same-origin `Origin`);
  - reads the session from its HttpOnly cookie and forwards it as a bearer
    token — the browser never sees the token;
  - validates and normalises the fields again;
  - requires an account type and a business contact in preview mode;
  - maps a duplicate handle to `409 username_taken`;
  - maps an expired session to `401 session_expired`;
  - returns only `{ nextPath }`.
- `GET /api/auth/username-available?username=` is a session-only convenience
  proxy for the API's public check. The API re-validates on save, so the check
  is a hint, not a reservation. Preview mode returns 501 instead of guessing.
- Both onboarding pages read the session on the server. No session redirects to
  `/auth?next=…`; an incomplete profile on `/onboarding/role` redirects to the
  profile step.
- Photo, bio, and location are not collected here. `CreatorProfile.avatarUrl`
  exists but there is no upload service, and there is no location field. Asking
  for data that is silently discarded would be dishonest.

## What remains blocked, and why

| Area | Blocker |
| --- | --- |
| Google, X, passwordless email availability | Enabled in the Web3Auth dashboard, not in code. The repo cannot verify which connections the Client ID has enabled. |
| Creator type (individual / organisation) | The preview UI collects it, but there is no `creatorType` field on `CreatorProfile` and no API DTO. Persisting the live value needs a reviewed Prisma migration and product approval. |
| Organisation profile fields | No organisation/KYB profile model in the web contract. `KYC_PROVIDER` has a KYB workflow, but no onboarding surface. |
| Trust tiers (`EMAIL` / `SOCIAL` / `VERIFIED`) | The API computes tiers server-side, but nothing writes `User.emailVerified` and there is no social-link write path. Displaying a tier now would be a fabricated state. |
| Email verification | No endpoint that records a verified email or a verification timestamp. Do not show "verified". |
| X connection / revocation | No social-connection model or OAuth linking endpoint. |
| Creator KYC | The API has KYC/KYB endpoints (stub or Didit), but the web has no client, no status projection in onboarding, and `KycStatus` has no distinct `IN_REVIEW`. |
| Backer KYC threshold | No web contribution flow calls the API; the threshold is not surfaced. |
| Wallet provisioning states | FR-101 is not met: the API links a wallet only when the token attests one, and the web has no persisted provisioning state. The wallet page remains preview data. |
| Fine-grained route capabilities | `/d` and `/admin` now require a server-verified session, but individual dashboard modules still read preview data and the API's capability projection is not wired into the shell. |
| Sign-in methods in copy | The modal owns method choice. The page must not claim a specific method is enabled. |

## Configuration

Server-only:

- `INVERGE_API_URL` - no default; unset means the BFF reports
  `api_not_configured` (503) instead of guessing a port. Set the API origin; the
  BFF appends the `/api/v1` prefix (an already-versioned base is also accepted).
- `INVERGE_AUTH_MODE` — `preview` keeps the real provider sign-in and stores a
  local preview identity instead of calling the API. Ignored in production.
  Unset (or `api`) uses the live BFF exchange.

Public:

- `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID`
- `NEXT_PUBLIC_WEB3AUTH_NETWORK` (defaults to Sapphire Devnet)
- `NEXT_PUBLIC_WALLET_NETWORK` (defaults to Solana Devnet)
- `NEXT_PUBLIC_SOLANA_RPC_URL` (optional)

The API must run with `WALLET_PROVIDER=web3auth` and the same
`WEB3AUTH_CLIENT_ID`; no client secret is used for JWKS verification.

Local development: the web app and API both default to port 3000. Run the API
on another port and point the web at it, for example:

```powershell
# inverge-api
$env:PORT='3001'
$env:WALLET_PROVIDER='web3auth'
$env:WEB3AUTH_CLIENT_ID='<the same public client id>'
node ./node_modules/@nestjs/cli/bin/nest.js start --watch

# inverge-web/.env.local
INVERGE_API_URL=http://127.0.0.1:3001
```

## Tests

- `src/features/auth/lib/onboarding.test.ts` — intent validation, post-auth and
  starting-point routing.
- `src/features/auth/lib/auth-routes.test.ts` — return-path safety and intent
  links.
- `src/app/api/auth/session/route.test.ts` — intent stays in the BFF; no token in
  the response; preview identity is local and never calls the API.
- `src/app/api/auth/profile/route.test.ts` — auth, same-origin, normalisation,
  account type/business contact in preview, duplicate handle, expired session,
  unreachable API, intent clearing, and preview-only fields dropped from the live
  API request.
- `src/app/api/auth/username-available/route.test.ts` — session requirement,
  failure states, and the preview 501.
- `src/features/auth/components/profile-onboarding-form.test.tsx` — save,
  rejection, invalid input, availability hint, expired session, unconfigured API,
  account-type requirement, and business fields.
- `src/features/auth/components/auth-page.test.tsx` — one entry point, sign-in
  unavailability, starting-point routing, and creator pre-selection.
- `src/features/auth/server/preview-session.test.ts` — stable subject derivation
  without signature verification.
- `src/features/auth/server/session-user.test.ts` — authoritative
  `requiresOnboarding`, role projection, including fail-safe default and the
  preview account rule.
- `src/features/auth/lib/protected-routes.test.ts` — protected prefixes,
  lookalike paths, and safe return-link construction.
- `src/features/marketing/components/site-header.test.tsx` — signed-out actions,
  signed-in account menu, preview labelling, and mobile account actions.
- `src/features/profile/server/public-profile.test.ts` — username resolution,
  public allowlist, unsafe links, and avatar host restrictions.
- `src/features/settings/components/settings-dashboard.test.tsx` — provider-
  managed connections are not presented as editable.

All provider calls are mocked. No test performs a real identity, wallet, or
payment operation.

## Related decisions

- D-033 — MetaMask Embedded Wallets is the web auth/wallet provider.
- D-034 — one `/auth` route and a BFF-held session.
- D-035 — intent is a routing hint; the shared profile is persisted through the
  API.
- D-036 — local preview auth mode keeps UI work unblocked without pretending to
  be a session.
- D-037 — every intent sees the starting-point question; account type is asked
  before the name fields.
