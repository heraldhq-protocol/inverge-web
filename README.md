# inverge-web

Frontend for **Inverge** — milestone-escrowed crowdfunding & idea validation on Solana.

Phase 0 (idea validation): browse ideas, publish an idea, and support / pre-pledge / leave
feedback against the live `inverge-api`. Campaigns and the transparency dashboard come later.

## Stack

- **Next.js 16** (App Router, React 19) + **Tailwind v4**
- **Privy** embedded Solana wallets — confined to a single provider wrapper (`components/providers/providers.tsx`) + `lib/auth/use-auth.ts`, so the wallet vendor stays swappable
- **openapi-fetch** typed client generated from `inverge-api`'s OpenAPI spec
- Fonts: Geist / Geist Mono via the `geist` package (bundled, offline-safe)

## Getting started

```bash
pnpm install
cp .env.local.example .env.local      # set NEXT_PUBLIC_API_URL, optional NEXT_PUBLIC_PRIVY_APP_ID

# 1. Run inverge-api first (defaults to :3000)
# 2. Regenerate the typed client whenever the API changes:
pnpm gen:api                          # openapi.json -> src/lib/api/schema.d.ts

pnpm dev                              # http://localhost:3001
```

> The API runs on `:3000`, so the web app runs on **`:3001`** to avoid a clash.

## Auth

Sign-in uses Privy. Set `NEXT_PUBLIC_PRIVY_APP_ID` to enable it; without it the app still
runs and public browsing works, but auth-gated actions (support, pre-pledge, feedback,
publish) are disabled. On login, `SessionSync` exchanges the Privy token for an Inverge
session (`POST /auth/session`) and stores it for the typed client's auth middleware.

## Regenerating the API client

The typed client is generated from the API's OpenAPI document:

```bash
# from inverge-api, export the spec to inverge-web/openapi.json, then:
pnpm gen:api
```

Request paths, params and bodies are fully typed. Response bodies are declared in
`src/lib/api/types.ts` until the API adds `@ApiOkResponse` response schemas.

## Structure

```
src/app/
  (validate)/ideas/         # list, [id] detail, new — live against the API
  (campaign)/campaigns/     # placeholder (Phase 2)
  (admin)/review/           # placeholder (Phase 1)
src/components/
  providers/  auth/  ideas/  ui/   # Privy confinement, login, actions, Amount/TxLink
src/lib/
  api/ (client, types, schema)  auth/ (use-auth)  env.ts
```
