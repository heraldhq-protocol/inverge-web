# Wallet integration

The wallet is a first-class dashboard feature. MetaMask Embedded Wallets
(formerly Web3Auth) is the chosen provider and its client sign-in is wired. A
connected provider exposes its real Solana address and a real SOL balance on the
overview. In API mode the sign-in exchange also sends that address, the API
verifies it against the identity token's wallet attestation, and links it to the
Inverge user; the wallet page then reads the linked embedded wallet from
`GET /wallets`. **USDC balances, activity and refund records remain preview-only**:
no verified USDC mint, chain index or refund service exists. No contribution or
refund reads from a chain. The displayed USD value is a CoinGecko estimate of the
live SOL balance, not a ledger fiat total or a quote.

Related decisions: D-008 (Privy, superseded for the web client), D-029 (payment
routes), D-031 (preview scope), D-033 (MetaMask Embedded Wallets), D-060 (the
wallet overview is an account surface).

## What is live and what is preview

- **Live:** the provider session, the Solana address returned by the wallet
  client, the SOL balance read from the configured Solana RPC endpoint, the
  SOL/USD estimate from CoinGecko, and (in API mode) the embedded wallet linked
  to the authenticated user.
- **Preview:** activity, refunds, and the contribution funding snapshot. They
  are labelled "Example data" and never presented as chain reads.
- **Unavailable:** USDC (no verified mint or index), a ledger fiat total or
  quote, Inverge-initiated sending/signing, deposits, withdrawals, refund
  claims, and key export. Send, receive, and fiat funding are only available
  through the embedded wallet's own Wallet Services UI.
- Manufacturing an address, balance, signature, deposit, withdrawal, or claim
  would misrepresent custody and money. None is manufactured; a failed balance
  read is shown as unavailable, never as zero.

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
  `wallet-connection-boundary.tsx` through `next/dynamic` with `ssr: false`,
  because the SDK is a frontend library that must not evaluate on the server.
  `wallet-sdk-boundary.tsx` is the only module that imports `@web3auth/modal`;
  the connection card is imported only by the dynamic boundary, not by the page.
- **Solana chain declared in code.** `wallet-sdk-boundary.tsx` passes `chains`
  and `defaultChainId`. The dashboard's pre-configured networks are EVM-only, and
  the SDK builds its Solana wallet only from Solana entries in
  `coreOptions.chains`. Chain ids are the SDK's own (`0x67` devnet, `0x65`
  mainnet-beta). The `SolanaProvider` wraps the app and auto-connects the
  wallet-standard connector.
- **Reactive address read.** `useSolanaWallet().accounts` is populated lazily by
  the wallet-standard `connect` call, but the hook does not subscribe to that
  mutation. The card reads the reactive `useWalletSession()` from
  `@solana/react-hooks` and keeps the provider array as a fallback. If the client
  session is still being created, the card shows a short "Setting up" state; it
  only reports a missing account after eight seconds.
- **Sign-in.** `/auth` is the only route that can create a session. It renders
  `auth-sign-in-card.tsx`, which loads the same client-only boundary and hands it
  `auth-sign-in-panel.tsx`; the panel calls `connect()` from
  `useWeb3AuthConnect`. The provider's modal is whitelabelled with Inverge's name
  and brand colour through `uiConfig`. `/sign-in` and `/sign-up` are 308s to
  `/auth`, so there is one credential surface and one place to change it.
- **Session exchange (BFF).** After the modal resolves, the panel reads the
  ES256 `id_token` with `useAuthTokenInfo().getAuthTokenInfo()` and POSTs
  `{ idToken, intent, walletAddress? }` to `/api/auth/session`. The panel waits up
  to 2.5 seconds for the Solana client to publish an address; if the sign-in
  method has no Solana wallet, the exchange proceeds without one. The API
  verifies a claimed address against the identity token's wallet attestation
  before linking it, so a mismatch rejects the session rather than storing an
  unverified address. The BFF forwards the token and writes the returned one-hour
  session JWT into an HttpOnly, SameSite=Lax cookie (`inverge_session`). The
  token never enters JavaScript, local storage, or a URL. A valid existing
  provider session is exchanged silently, so returning visitors are not asked to
  pick a method again.
- **Sign-out.** `/sign-out` disconnects the provider in the browser, then POSTs
  `/api/auth/sign-out` to delete the cookie. Both session endpoints require a
  same-origin `Origin` header, because the exchange is otherwise a login-CSRF
  target. The wallet overview never renders a disconnect control: disconnecting
  would leave the Inverge session active but the wallet unusable, so the card
  points to `/sign-out` in its failure and mismatch states.
- **Server session seam.** `server/viewer.ts` `getDashboardViewer()` reads the
  cookie and calls the API's `GET /auth/me` with `Authorization: Bearer`. The
  product layout redirects when there is no session, and the viewer returns no
  identity rather than borrowing a preview persona. The lookup times out after
  three seconds and is memoised per render.
- **Linked wallet read.** `server/wallet.ts` `getWalletView()` runs in API mode,
  reads the session cookie, calls `GET /wallets`, and selects an embedded
  `web3auth` wallet whose address passes the base58/32-byte check. It projects
  that address and creation time into `WalletAccount` with `provisioning:
  "ready"`. External payout wallets are ignored; preview mode and an unreachable
  API return the unconfigured preview account with no address. Nothing is
  inferred from the browser session.
- **Address display.** The reactive address is validated with the existing
  base58/32-byte check and shortened for display, with a copy action and a
  full-address disclosure. The card compares it with the API projection: a
  different linked address is a mismatch, not a silent fallback.
- **Balance and fiat estimate.** When the provider has returned a validated
  address, the card calls `useSolanaWallet().rpc.getBalance(address)` against the
  configured cluster and formats lamports as SOL. The read has loading, ready,
  and unavailable states; a failure never renders zero, and a missing RPC client
  is "unavailable", not a permanent loading skeleton. `useSolPrice()` polls
  CoinGecko's public `simple/price` endpoint every 30 seconds and multiplies the
  live SOL balance by that estimate. The USD figure is large and bold, with the
  SOL amount underneath; if the price is unavailable the card falls back to the
  SOL figure and says so, and a failed refresh keeps the last value marked
  "price may be stale". The Assets section shows the same SOL/USD estimate and
  lists USDC as unavailable instead of inventing a balance.
- **Overview layout.** The dark card is split into three desktop columns:
  wallet identity (MetaMask mark, name, network, address), total balance, and
  Receive/Send/Add funds. Below it, Assets and Keep your wallet safe share a row,
  then Recent activity and Quick actions share the next row, then the growth
  banner. On mobile the columns stack. The card uses the reference's deep-green
  gradient with a contour-line backdrop.
- **Icon source.** Token, network and wallet marks come from
  `@web3icons/react` (`TokenSOL`, `TokenUSDC`, `NetworkSolana`,
  `WalletMetamask`); generic controls stay on Hugeicons. The package renders
  local SVG components, so no icon CDN or runtime request is added.
- **Overview actions.** Receive, Send, and Add funds are buttons, not links. They
  call the embedded wallet's Wallet Services hooks `useReceive()`,
  `useWalletUI({ path: "send" })`, and `useCheckout({ tokenList: ["SOL"] })`, so
  the provider modal owns those flows and Inverge has no receive/send/funding
  pages. The old `/d/wallet/receive` and `/d/wallet/send` URLs permanently
  redirect to `/d/wallet`. Add funds is the checkout surface, where bank transfer
  and P2P methods appear when the provider supports them in the user's region.
  Failures surface as a short, honest message instead of a silent no-op.
- **No duplicate provider chrome.** `walletServicesConfig` sets
  `loginMode: "plugin"` and `whiteLabel.showWidgetButton: false`, because the
  Wallet Services iframe otherwise renders its own floating launcher in the
  bottom-left corner. Inverge's controls are the only entry points.
- **Provider state.** `useWeb3Auth()` supplies initialisation, connection, and
  initialisation-error state. `connect()` runs only from the explicit button;
  mounting the page never opens the provider modal. A provider session restored
  from storage is treated as connection, not provisioning.
- **Unconfigured and loading states.** `wallet-connection-states.tsx` holds the
  connection card's loading and unavailable shapes without importing the SDK.
- **Honest capability input.** `server/wallet.ts` reports `sdkInstalled` and
  whether a Provider Client ID is present. Provisioning, receive, signing,
  withdrawal, and refund execution stay `unavailable` because no custody,
  signing, or refund service exists; the linked address does not imply those
  capabilities.

### Not wired yet

- USDC and other token balances, chain-read activity, signing, on-ramp,
  withdrawals, refund execution, export, and webhook verification.
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
| `/d/wallet` | Overview: the connection card (live provider address, SOL balance and CoinGecko USD estimate, Receive/Send/Add funds buttons), the Assets section, supported quick actions, and four recent records. |
| `/d/wallet/activity` | Unified contribution and refund history with URL-backed filters and search. |
| `/d/wallet/receive` | Permanent redirect to `/d/wallet`; receive now opens the Wallet Services UI. |
| `/d/wallet/send` | Permanent redirect to `/d/wallet`; send now opens the Wallet Services UI. |
| `/d/wallet/refunds` | Refund summary and records; no claim control while refund execution is missing. |
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
    auth-sign-in-panel.tsx     modal sign-in + Solana address + token exchange
    sign-out-card.tsx          provider disconnect + cookie clear
    onboarding-*.tsx           profile and role onboarding

src/app/api/auth/{session,sign-out}/route.ts   BFF endpoints
src/app/(auth)/{auth,sign-out,onboarding}/     routes

src/features/wallet/
  types.ts                     domain model (identity-bound account, funding snapshot)
  content/preview-wallet.ts    labelled preview fixtures (no address) + integration flags
  server/wallet.ts             server-only seam: API wallet read + preview fixtures
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
    wallet-auth-panel.tsx      client gate: dynamic boundary or unavailable card
    wallet-connection-boundary.tsx  dynamic provider + connection card
    wallet-sdk-boundary.tsx    the only importer of @web3auth/modal
    wallet-connection-card.tsx three-column card, live address, SOL/USD, assets
    wallet-connection-states.tsx  SDK-free loading and unavailable shapes
    wallet-auth-unavailable.tsx / wallet-auth-loading.tsx
    WalletPageShell, overview, refunds, security, activity list/dashboard, cards
```

Rules the feature holds to:

- **Identity first.** `userId` is Inverge's own id; the address is an attribute of
  a provisioned provider account and is never a route parameter or display
  identity.
- **One seam for data.** `server/wallet.ts` exposes async `getWalletView()` and
  sync `getWalletFundingSnapshot()`. The async seam reads `GET /wallets` in API
  mode; the funding snapshot stays preview because no chain index or quote source
  exists.
- **One SDK boundary.** Only `wallet-sdk-boundary.tsx` imports the provider SDK,
  and it is reached through a client-only dynamic import. The connection card is
  imported only by `wallet-connection-boundary.tsx`, so the SDK never enters the
  initial page bundle or the server render.
- **Three primary destinations.** Overview, Activity and Refunds are the tab bar.
  Security remains a contextual route linked from Settings and the overview.
  Send and receive are Wallet Services moments, not routes.
- **One capability truth.** Every surface reads `lib/capabilities.ts`, so a page
  cannot imply a feature exists merely because a route does.
- **No secrets, ever.** No private key, seed phrase, signing share, or one-time
  code is read, stored, logged, put in a URL, or written to browser storage. The
  provider Client Secret is server-only.

## Capability status (as shipped)

The audit is recomputed from the live projection. With no Client ID, no session,
and no linked address, every input is false and the page stays preview or
unavailable. In API mode with a linked embedded wallet, `providerConfigured`,
`sdkInstalled`, `sessionAvailable`, and `addressAvailable` become true, so wallet
provisioning, balances, and activity history can be `available`. Receive, send and
fiat funding are provider Wallet Services surfaces opened from the card; Inverge
still does not sign, quote, withdraw, execute refunds or export keys itself. An
address is never an authorization input.

| Capability | Status when linked | Mechanism missing |
| --- | --- | --- |
| Wallet provisioning | available | — |
| Balances | available for SOL; USDC unavailable | no verified USDC mint or index |
| Receive and deposit | provider Wallet Services UI | Inverge exposes no address or QR itself |
| Activity history | preview | derived from preview contributions |
| Signing and sending | unavailable in Inverge | the provider's Wallet Services UI is the only send path |
| Card and bank funding | provider Wallet Services checkout | availability depends on provider region/method support |
| Send and withdraw | unavailable in Inverge | no Inverge signing flow or fee quote |
| Refund execution | unavailable | no refund service / escrow index |
| Key export | unavailable | no documented export flow |

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

- The checkout's sample balances (1,250.50 USDC, 0.42 SOL). They are never
  rendered on the wallet overview; the overview reads SOL from the provider and
  says USDC is not connected.
- Derived activity and refund records, every item `demo: true` with a null
  transaction and no explorer link, labelled "Example data" once per section.
- The contribution handoff screen.

## Not implemented (reported, never simulated)

- Account binding: the web app can hold a session, but `inverge-api` does not link
  the provider address to a `WalletAccount`, and the web has no server wallet read.
- USDC balances, chain activity, and escrow reconciliation.
- Wallet signing, transfer submission, and on-chain confirmation.
- On-ramp/card funding and any quote, rate, or fee.
- Withdrawals and RPC fee quotes.
- Refund execution.
- Key export.
- Webhook verification and idempotency (no provider webhook contract exists).

## Integration steps

1. ~~Create the dashboard project and allowlist the origins.~~ Done for Sapphire
   Devnet; the public Client ID lives in the gitignored `.env.local`.
2. Configure the login connections and any group connection; record each
   `authConnectionId` and the JWT user identifier field.
3. ~~Install the SDK and add a guarded client provider.~~ Done in this change.
4. ~~Add `useAuthTokenInfo()` and exchange the ES256 `id_token` with the API.~~
   Done. The exchange sends no wallet address; never trust a client-supplied
   address for authorization.
5. Add a MetaMask adapter behind `inverge-api`'s `EmbeddedWalletPort`: verify the
   token against the provider JWKS, map `sub` to `User`, link the Solana address
   to `WalletAccount`, and issue the existing Inverge session. Replace the stub
   in `AuthService.authenticate()`.
6. Replace `server/wallet.ts` with the authenticated API/provider read; set
   `addressAvailable` true only when the server projection has a linked address.
7. ~~Read the connected SOL balance from the provider.~~ Done. Add the verified
   USDC mint and a chain activity index before moving those capabilities out of
   `preview`.
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
  `wallet-connection-card.test.tsx` (no connect on mount, explicit connect,
  address copy, live SOL read, CoinGecko USD display, balance failure never
  becomes zero, Wallet Services actions, mismatch between the SDK address and
  the server link, initialisation error), `wallet-page-shell.test.tsx` (three
  primary destinations, short introduction), `wallet-overview.test.tsx` (no
  sample balance, labelled preview activity, supported quick actions),
  `wallet-refunds.test.tsx` (no claim control, preview label, record states),
  `wallet-security.test.tsx`, `wallet-activity-dashboard.test.tsx`.
- `features/campaigns/components/contribution-preview.test.tsx` covers the
  sample-balance and insufficient-funds settlement behaviour.

Scenarios covered include provisioning state, unsupported asset, insufficient
funds, destination validation and wrong-network rejection, quote expiry, refund
states and duplicate-claim prevention, demo-vs-production labelling, SDK
connection states without an automatic popup, and responsive/empty/error states
at the component level.

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
  server-side. The overview reads that address's SOL balance from the configured
  cluster, but no contribution or refund reads from it, and it is not exposed as
  a deposit address.
- The provider `id_token` proves identity only at exchange; authorization always
  uses the Inverge session and server-side checks. A client-reported address is
  never an authorization input.
- The provider Client Secret is server-only. It is not in this repository, not in
  `.env.local`, and not in any `NEXT_PUBLIC_` variable.
- `getPrivateKey` is not called; key export stays disabled.
- No production blockchain writes are performed by this feature.
