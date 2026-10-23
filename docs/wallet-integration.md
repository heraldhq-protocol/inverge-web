# Wallet integration

The wallet is a first-class dashboard feature. MetaMask Embedded Wallets
(formerly Web3Auth) is the chosen provider and its client sign-in is wired, but
the **account data is still preview-only**: there is no authenticated Inverge
session and no server-side wallet read, so no address is linked and no balance,
contribution, or refund comes from a chain.

Related decisions: D-008 (Privy, superseded for the web client), D-029 (payment
routes), D-031 (preview scope), D-033 (MetaMask Embedded Wallets).

## Why the data is preview-only

- No authenticated session — `getDashboardViewer()` returns a labelled preview
  identity, so a provider account cannot be bound to a user.
- No server-side wallet read and no Solana RPC endpoint, so no balance or
  activity is read from the chain.
- No on-ramp provider, escrow index, or refund service.

The provider SDK is installed and a Client ID may be present, so the browser can
hold a real provider address. That address is shown as **device-only** and is
never written into a `WalletView`. `inverge-api` models `WalletAccount` and a
Privy reference adapter behind `EmbeddedWalletPort`, but its
`AuthService.authenticate()` is stubbed and does not call that port. Provisioning
is therefore impossible, and manufacturing an address, signature, deposit,
withdrawal, or claim would misrepresent custody and money. None is manufactured.

## Chosen provider

MetaMask Embedded Wallets is the provider (D-033). Before changing any
integration code, use the installed `web3auth` skill and its MCP tools
(`search_docs`, `get_doc`, `get_example`); do not guess package names or hook
signatures. Both live in the parent `Inverge/` workspace
(`Inverge/.agents/skills/web3auth/` and the `web3auth` server in
`Inverge/opencode.json`, which OpenCode only loads when launched at or above
`Inverge/`), not in this repository.

### What is wired today

- **Gating.** `lib/provider-config.ts` reads
  `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID`/`NEXT_PUBLIC_WEB3AUTH_NETWORK` and returns
  `null` unless a Client ID is present. It is pure and unit-tested without
  loading the SDK.
- **Client-only boundary.** `components/wallet-auth-panel.tsx` loads
  `wallet-sdk-boundary.tsx` through `next/dynamic` with `ssr: false`, because the
  SDK is a frontend library that must not evaluate on the server.
  `wallet-sdk-boundary.tsx` is the only module that imports `@web3auth/modal`.
- **Solana chain declared in code.** `wallet-sdk-boundary.tsx` passes `chains`
  and `defaultChainId`. The dashboard's pre-configured networks are EVM-only, and
  the SDK builds its Solana wallet only from Solana entries in
  `coreOptions.chains`; without one the connection reports itself signed in while
  `useSolanaWallet().accounts` stays `null`. Chain ids are the SDK's own
  (`0x67` devnet, `0x65` mainnet-beta).
- **Sign-in.** `/auth` is the only route that can create a session. It renders
  `auth-sign-in-card.tsx`, which loads the same client-only boundary and hands it
  `auth-sign-in-panel.tsx`; the panel calls `connect()` from
  `useWeb3AuthConnect`. The provider's modal is whitelabelled with Inverge's name
  and brand colour through `uiConfig`. `/sign-in` and `/sign-up` are 308s to
  `/auth`, so there is one credential surface and one place to change it.
- **Session exchange (BFF).** After the modal resolves, the panel reads the
  ES256 `id_token` with `useAuthTokenInfo().getAuthTokenInfo()` and POSTs it to
  `/api/auth/session`. That route forwards `{ accessToken, walletAddress }` to the
  API's `POST /auth/session` and writes the returned one-hour session JWT into an
  HttpOnly, SameSite=Lax cookie (`inverge_session`). The token never enters
  JavaScript, local storage, or a URL. A valid existing provider session is
  exchanged silently, so returning visitors are not asked to pick a method again.
- **Sign-out.** `/sign-out` disconnects the provider in the browser, then POSTs
  `/api/auth/sign-out` to delete the cookie. Both session endpoints require a
  same-origin `Origin` header, because the exchange is otherwise a login-CSRF
  target.
- **Server session seam.** `server/viewer.ts` `getDashboardViewer()` reads the
  cookie and calls the API's `GET /auth/me` with `Authorization: Bearer`. It is
  the only function the dashboard changed: with a session it reports
  `dataSource: "live"` and the account's own public name; without one, or when
  the API is unreachable, it returns the labelled preview identity. The lookup
  times out after three seconds and is memoised per render.
- **Address display.** `useSolanaWallet().accounts` is validated with the
  existing base58/32-byte check and shortened for display. The address is offered
  to the session exchange for linking; the API verifies it against the signed
  token and rejects a mismatch, so the web app never decides that an address
  belongs to an account.
- **Unconfigured and loading states.** `wallet-auth-unavailable.tsx` explains the
  gap and offers no control; `wallet-auth-loading.tsx` holds the card's final
  height.
- **Honest capability input.** `server/wallet.ts` reports `sdkInstalled` and
  whether a Provider Client ID is present, so the audit no longer claims the
  provider is absent when it is configured. Provisioning, receive, signing, and
  withdrawal stay `unavailable` because no on-chain read, custody, or signing
  exists.

### Not wired yet

- Chain-read balances and activity, signing, on-ramp, withdrawals, refund
  execution, export, and webhook verification.
- The API's permission projection is not exposed to the web client, so
  capabilities are still derived from the session shape rather than from a
  server-authoritative claim. Programme administration keeps its existing
  development preview gate.

### Provider rules

- Networks: **Sapphire Devnet** for local/staging, **Sapphire Mainnet** for
  production. Sapphire is the wallet network; the Solana cluster (devnet or
  mainnet-beta) is configured separately, by `NEXT_PUBLIC_WALLET_NETWORK`. Unknown
  values fall back to Devnet on both axes, so a typo cannot point a local build at
  production or move users to mainnet.
- The Solana chain must be declared in code, with a `defaultChainId` equal to it.
  Declaring `chains` is an override — only the listed chains reach the SDK — which
  is what keeps this app Solana-only.
- Address stability: the same Client ID, Sapphire network, connection
  configuration, and `useSFAKey` value are required for a stable address.
  Changing any of them changes every user's address permanently.
- Group connections are required where multiple login methods must resolve to one
  wallet; the sign-in card tells users to use the same method each time.
- `getPrivateKey` is not called and export stays disabled.

## Routes

| Route | Purpose |
| --- | --- |
| `/auth` | The only sign-in and account-creation surface; opens the provider modal. |
| `/sign-out` | Ends the provider session and clears the Inverge cookie. |
| `/api/auth/session` | Server-only exchange: `id_token` → HttpOnly session cookie. |
| `/api/auth/sign-out` | Clears the session cookie; same-origin POST only. |
| `/d/wallet` | Overview: sign-in, account state, balances, actions, refunds, recent activity, capabilities. |
| `/d/wallet/activity` | Unified contribution and refund history with URL-backed filters and search. |
| `/d/wallet/receive` | Receive/deposit explanation; no address or QR because none is linked. |
| `/d/wallet/send` | Transfer form with real local validation; ends at a labelled handoff. |
| `/d/wallet/refunds` | Refund summary and records; claim control present and disabled with its reason. |
| `/d/wallet/security` | Security posture and control status; export, sessions, and recovery unavailable. |

`/d/wallet/loading.tsx` and `/d/wallet/error.tsx` provide the loading and error
boundaries. Wallet navigation lives in the desktop sidebar and the account menu
(`product-navigation.tsx`, `product-topbar.tsx`) and as a settings section
(`settings-dashboard.tsx`); it is intentionally **not** in the five-slot mobile
bottom bar.

## Architecture

```
src/features/auth/
  lib/auth-routes.ts           canonical /auth, /sign-out, safe `?next=` handling
  server/
    session.ts                 HttpOnly cookie read/write/clear
    session-user.ts            API /auth/me projection (memoised, 3s timeout)
    origin.ts                  same-origin check for the session endpoints
  components/
    auth-page.tsx / auth-shell.tsx
    auth-sign-in-card.tsx      client gate: boundary or unavailable card
    auth-sign-in-panel.tsx     modal sign-in + token exchange + retry states
    sign-out-card.tsx          provider disconnect + cookie clear
    onboarding-*.tsx           profile and role onboarding

src/app/api/auth/{session,sign-out}/route.ts   BFF endpoints
src/app/(auth)/{auth,sign-out,onboarding}/     routes

src/features/wallet/
  types.ts                     domain model (identity-bound account, funding snapshot)
  content/preview-wallet.ts    labelled preview fixtures (no address) + integration flags
  server/wallet.ts             server-only data seam — replace this for live data
  lib/
    networks.ts                Solana network + asset registry
    token-amount.ts            BigInt token maths, formatting, shortfall
    address.ts                 base58 / 32-byte validation, destination issues
    capabilities.ts            integration facts -> capability list
    provider-config.ts         Client ID / Sapphire network gating (pure)
    quote.ts                   on-ramp quote evaluation (incl. expiry)
    activity.ts                unified history derived from contributions
    refunds.ts                 refund records + claim availability
    funding.ts                 "can this contribution be paid from the wallet?"
    status.ts                  labels and tones for provisioning/capabilities
  components/
    wallet-auth-panel.tsx      client gate: boundary or unavailable card
    wallet-sdk-boundary.tsx    the only importer of @web3auth/modal
    connected-wallet-auth.tsx  modal sign-in, address display, sign-out
    wallet-auth-unavailable.tsx / wallet-auth-loading.tsx
    WalletPageShell, overview, receive, send, refunds, security, activity
    list/dashboard, cards
```

Rules the feature holds to:

- **Identity first.** `userId` is Inverge's own id; the address is an attribute of
  a provisioned provider account and is never a route parameter or display
  identity.
- **One seam for data.** `server/wallet.ts` exposes `getWalletView()` and
  `getWalletFundingSnapshot()`; the live implementation replaces only that file.
- **One SDK boundary.** Only `wallet-sdk-boundary.tsx` imports the provider SDK,
  and it is reached through a client-only dynamic import.
- **One capability truth.** Every surface reads `lib/capabilities.ts`, so a page
  cannot imply a feature exists merely because a route does.
- **No secrets, ever.** No private key, seed phrase, signing share, or one-time
  code is read, stored, logged, put in a URL, or written to browser storage. The
  provider Client Secret is server-only.

## Capability status (as shipped)

With no Client ID, the preview audit (`providerConfigured`, `sdkInstalled`,
`sessionAvailable`, `addressAvailable`, `onRampConfigured`,
`refundServiceConfigured`, `exportSupported` all false) produces:

| Capability | Status | Mechanism missing |
| --- | --- | --- |
| Wallet provisioning | unavailable | provider, SDK, session |
| Balances | preview | labelled samples; no chain read |
| Receive and deposit | unavailable | no public address |
| Activity history | preview | derived from preview contributions |
| Signing and sending | unavailable | no SDK / signing flow |
| Card and bank funding | unavailable | no licensed on-ramp provider |
| Send and withdraw | unavailable | signing + RPC fee quote |
| Refund execution | unavailable | no refund service / escrow index |
| Key export | unavailable | no documented export flow |

With a Client ID present, `sdkInstalled` and `providerConfigured` become true, so
provisioning's reason becomes "No authenticated Inverge session exists…". Its
status stays `unavailable`: a signed-in provider address alone is not an Inverge
account, and an address is never an authorization input.

A capability becomes `available` only when its mechanism is present; nothing is
promoted by adding a page.

## Contribution funding

`/campaigns/[slug]/back` reads `getWalletFundingSnapshot()` on the server and
passes a serialisable `WalletFundingSnapshot` (asset, atomic balance, network,
provisioning state, `signingAvailable`, `sample`) to the checkout. There is **no
address** in the snapshot. `lib/funding.ts` returns one of:

- `wallet-unavailable` — no wallet state, unprovisioned (non-sample), or no balance;
- `unsupported-asset` — the wallet is not set to USDC;
- `insufficient` — the balance is short, with the shortfall stated in tokens;
- `signing-unavailable` — the balance covers it, but signing is not connected;
- `ready` — covered and signable (never reachable while signing is unavailable).

Settlement is blocked for the first three; `signing-unavailable` continues to the
existing labelled "payment is not connected" handoff. Nothing is submitted.

## Clearly demo-only

- Sample balances (1,250.50 USDC, 0.42 SOL), labelled on the card and in the
  checkout.
- Derived activity and refund records, every item `demo: true` with a null
  transaction and no explorer link.
- The disabled refund claim control.
- The contribution handoff screen.

## Not implemented (reported, never simulated)

- Account binding: no `id_token` exchange, no session, no `WalletAccount` link.
- Chain-read balances and activity.
- Wallet signing, transfer submission, and on-chain confirmation.
- On-ramp/card funding and any quote, rate, or fee.
- Withdrawals and RPC fee quotes.
- Refund execution and escrow reconciliation.
- Key export.
- Webhook verification and idempotency (no provider webhook contract exists).

## Integration steps

1. ~~Create the dashboard project and allowlist the origins.~~ Done for Sapphire
   Devnet; the public Client ID lives in the gitignored `.env.local`.
2. Configure the login connections and any group connection; record each
   `authConnectionId` and the JWT user identifier field.
3. ~~Install the SDK and add a guarded client provider.~~ Done in this change.
4. Add `useAuthTokenInfo()` and exchange the ES256 `id_token` with the API. Never
   trust a client-supplied address for authorization.
5. Add a MetaMask adapter behind `inverge-api`'s `EmbeddedWalletPort`: verify the
   token against the provider JWKS, map `sub` to `User`, link the Solana address
   to `WalletAccount`, and issue the existing Inverge session. Replace the stub
   in `AuthService.authenticate()`.
6. Replace `server/wallet.ts` with the authenticated API/provider read; set
   `sessionAvailable` and `addressAvailable` true only when each is real.
7. Add chain-read balances and move balance/activity out of `preview`.
8. Enable on-ramp, refunds, withdrawals, and export only after their own provider,
   escrow, and security reviews.

## Dependencies

- `@web3auth/modal` 11.4.3 with `@solana/kit`, `@solana-program/system`,
  `@solana/react-hooks`, and the peers the SDK requires (`@solana/client`,
  `@solana/connector`, `viem`).
- `pnpm-workspace.yaml` sets `allowBuilds` to `false` for two transitive packages,
  `protobufjs` (`postinstall` only) and `tiny-secp256k1` (a native addon the
  browser build does not use; bundlers resolve its pure-JS entry). Neither build
  script is required at runtime, and approving native compilation would add a
  toolchain requirement for no benefit.
- `@solana/kit` peers on TypeScript `^5` while this repository uses TypeScript 6.
  It is an unmet-peer warning only; `pnpm typecheck` passes.

## Environment variables

Three public values are read today, from the gitignored `.env.local`.
`.env.example` lists every name with no values:

```
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID      NEXT_PUBLIC_WEB3AUTH_NETWORK
NEXT_PUBLIC_WALLET_NETWORK          NEXT_PUBLIC_SOLANA_RPC_URL  (optional)
METAMASK_EMBEDDED_WALLET_CLIENT_SECRET
INVERGE_API_URL
WALLET_ONRAMP_PROVIDER   WALLET_ONRAMP_API_KEY   WALLET_REFUND_SERVICE_URL
```

`INVERGE_API_URL` is **server-only** and has no default. It must point at the
Inverge API origin (which cannot share a port with the web app); the BFF appends
the API's `/api/v1` prefix. When it is unset, the
auth page reports that the account service is not configured and the dashboard
stays on preview data. `INVERGE_API_URL` and the API's `WALLET_PROVIDER=web3auth`
plus a matching `WEB3AUTH_CLIENT_ID` are the three values that turn live sign-in
on.

`NEXT_PUBLIC_WALLET_NETWORK` selects the Solana cluster (`solana-devnet`
default, `solana-mainnet-beta`). `NEXT_PUBLIC_SOLANA_RPC_URL` overrides the
public RPC endpoint; the websocket target is derived from it, so it must be a
full `https://` URL.

Every `NEXT_PUBLIC_` value is inlined into the browser bundle and is public by
design. `METAMASK_EMBEDDED_WALLET_CLIENT_SECRET` is **server-only** and must never
use a `NEXT_PUBLIC_` name. Never commit a credential; rotate one that has been
shared anywhere outside the server.

## Tests

`pnpm test` (Vitest, jsdom). Wallet coverage:

- `features/auth/lib/auth-routes.test.ts` (open-redirect rejection, self-loop
  rejection, `?next=` encoding).
- `features/auth/server/origin.test.ts` (cross-origin, missing and opaque
  origins, scheme/port comparison).
- `features/auth/server/session-user.test.ts` (payload projection, id fallback
  rejection, incomplete-onboarding handle suppression).
- `app/api/auth/session/route.test.ts` (origin guard, unconfigured API, rejected
  identity, unreachable API, missing token — and the session token never appears
  in the response body), `app/api/auth/sign-out/route.test.ts`.
- `features/auth/components/auth-page.test.tsx` (entry point, unavailable state,
  onboarding forms).
- `lib/capabilities.test.ts`, `lib/activity.test.ts`, `lib/refunds.test.ts`,
  `lib/quote.test.ts`, `lib/funding.test.ts`, `lib/token-amount.test.ts`,
  `lib/address.test.ts`, `lib/provider-config.test.ts`.
- `content/preview-wallet.test.ts` (integration flags: provider configured but
  provisioning unavailable, balances still samples, funding snapshot flag).
- `components/wallet-auth-panel.test.tsx` (unconfigured card, configured boundary
  mounts the loading state rather than the SDK in tests),
  `wallet-send.test.tsx` (destination bytes, wrong network, amount precision,
  insufficient sample balance, maximum, handoff), `wallet-overview.test.tsx`,
  `wallet-refunds.test.tsx`, `wallet-security.test.tsx`,
  `wallet-activity-dashboard.test.tsx`.
- `features/campaigns/components/contribution-preview.test.tsx` covers the
  sample-balance and insufficient-funds settlement behaviour.

Scenarios covered include provisioning state, unsupported asset, insufficient
funds, destination validation and wrong-network rejection, quote expiry, refund
states and duplicate-claim prevention, demo-vs-production labelling, and
responsive/empty/error states at the component level.

On this machine the parallel Vitest pool can hit `EMFILE` while a large icon
package is imported once per file. `pnpm exec vitest run --no-file-parallelism`
is a reliable local fallback; the committed configuration is unchanged.

## Security limitations and blockers

- Authorization is still preview-level. A session is real, but the API's
  permission projection is not exposed, so no route in the dashboard is gated on
  a server-verified capability yet.
- The session cookie is the only credential the web server accepts; the API's
  bearer JWT is never sent to the browser.
- The backend auth stub must be replaced before any provisioning is real.
- Address stability is a production invariant: Client ID, Sapphire network,
  connection configuration, and `useSFAKey` must not change without an explicit
  migration.
- A provider address shown in the browser is device-only until it is linked
  server-side, so no balance, contribution, or refund reads from it.
- The provider `id_token` proves identity only at exchange; authorization always
  uses the Inverge session and server-side checks. A client-reported address is
  never an authorization input.
- The provider Client Secret is server-only. It is not in this repository, not in
  `.env.local`, and not in any `NEXT_PUBLIC_` variable.
- `getPrivateKey` is not called; key export stays disabled.
- No production blockchain writes are performed by this feature.
