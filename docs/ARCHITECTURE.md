# Architecture contract

Status: **Accepted web baseline; integration choices remain open**

The goal is a codebase that is easy to navigate, keeps browser and server code
separate, and lets features change without turning generic folders into dumping
grounds. Adjust this structure when real product needs justify it and record
material changes in `docs/DECISIONS.md`.

## System boundary and authorities

This repository owns the Next.js web client. The PRD/SRS describes separate
NestJS/PostgreSQL/Redis services, a Solana Anchor program, an event indexer, and
third-party providers. Keep those boundaries visible in the code:

| Data or operation | Authority |
| --- | --- |
| Escrow balances and state transitions | Solana program state and finalized transactions. |
| Public settlement/transparency totals | Chain-derived indexer projection, reconcilable to Solana. |
| Idea and campaign content, discussions, notification preferences | Backend API. |
| User session and linked wallet identity | Privy plus backend account mapping. |
| KYC decision | KYC provider status mirrored by the backend; never raw documents. |
| Fees, thresholds, windows, caps, supported assets | Versioned authoritative configuration; on-chain values where behavior is enforced on-chain. |

The browser never talks directly to PostgreSQL or Redis. It uses a generated,
typed client for the backend contract. Wallet-signed program interactions may be
initiated in the browser, but transaction construction, simulation, submission,
confirmation, and indexed projection must remain distinct states.

## Intended structure

```text
src/
  app/                       # routes, layouts, metadata, route-level boundaries
    (route-group)/
      _components/           # UI used only by this route subtree
      _lib/                  # behavior used only by this route subtree
  components/
    ui/                      # reusable, domain-neutral primitives
    shared/                  # cross-feature composed UI with proven reuse
  features/
    feature-name/
      components/            # feature UI
      server/                # data access, actions, and server-only orchestration
      schemas/               # validation schemas at trust boundaries
      lib/                   # pure feature behavior
      types.ts               # feature types only when not inferred elsewhere
  lib/
    api/                     # typed backend transport and shared API concerns
      generated/             # generated contract types; never hand-edited
    solana/                  # wallet, transaction, RPC, and explorer adapters
    server/                  # app-wide server-only infrastructure
    env/                     # validated environment access
    utils/                   # small, genuinely cross-cutting pure helpers
  styles/                    # optional split CSS imported by app/globals.css
public/                      # static public assets
tests/
  e2e/                       # critical user journeys
```

Create directories only when they have content. A small feature may use fewer
layers; the structure is a placement guide, not a file-count target.

## Dependency direction

```text
app routes -> features -> components/ui
     |            |             |
     +----------> lib <---------+
```

- `app` composes routes and features; it should not contain reusable business
  logic.
- A feature owns its domain behavior. Other features must not import its private
  internals. Move truly shared domain concepts to an explicit shared module only
  after reuse is real.
- `components/ui` is domain-neutral. It may depend on generic `lib` helpers but
  never on a feature or route.
- `lib` contains cross-cutting infrastructure and pure utilities, not miscellaneous
  code that lacks a clear owner.
- Avoid broad barrel files. Import from the defining module unless an intentional
  public boundary benefits from a small, curated `index.ts`.

Expected product domains include `auth`, `kyc`, `ideas`, `campaigns`, `funding`,
`milestones`, `refunds`, `discussions`, `notifications`, `transparency`, and
`admin`. Create a domain only when its implementation begins; do not generate an
empty architecture in advance.

The implemented public website is owned by `src/features/marketing`. App Router
files under `src/app/(marketing)` remain thin, while the feature owns its shared
navigation, page compositions, and editorial content. This boundary must not
become a shortcut for importing future product UI or provider logic.

## Rendering and data flow

1. A Server Component route or feature reads request data and fetches only what
   its view needs through the typed backend/indexer boundary.
2. Server-only modules validate authorization and call the responsible service.
3. Untrusted input and external responses are validated at the boundary.
4. Server Components pass minimal, serializable view models to small interactive
   Client Components.
5. Mutations re-check authentication and resource authorization, use idempotency
   where retries are possible, perform the write, and explicitly refresh or
   invalidate affected data.
6. Chain writes expose signature/submission separately from confirmation and
   finalization. The indexed view eventually reconciles to finalized chain state.

Fetching data in a Client Component is reserved for browser-owned or continuously
live state. Do not add a client data library merely to fetch data that a Server
Component can provide.

## Placement guide

| Concern | Location |
| --- | --- |
| Page, layout, metadata, loading, error, or not-found UI | `src/app/**` |
| Component used by one route subtree | nearest `app/**/_components` |
| Component used within one feature | `src/features/<name>/components` |
| Reusable unstyled or styled UI primitive | `src/components/ui` |
| Cross-feature composition with demonstrated reuse | `src/components/shared` |
| Feature-specific query, mutation, schema, or rule | `src/features/<name>` |
| Generated API types/client | `src/lib/api/generated` and `src/lib/api` |
| Solana connection, transaction, and explorer adapters | `src/lib/solana` |
| Cross-cutting server adapter | `src/lib/server` |
| Small cross-cutting pure helper | `src/lib/utils` |
| Static public file | `public` |

## Naming and exports

- Use `kebab-case` for ordinary file and directory names.
- Follow Next.js exactly for special files such as `page.tsx`, `layout.tsx`,
  `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`, and `proxy.ts`.
- Use `PascalCase` for React component and type names, `camelCase` for functions
  and variables, and `UPPER_SNAKE_CASE` only for true constants.
- Prefer named exports. Use default exports where Next.js requires or conventionally
  expects them.
- Name handlers for intent (`handleSave`) and callbacks for the event contract
  (`onSave`). Boolean names should read as predicates (`isOpen`, `hasAccess`).
- Keep tests beside the source they exercise when practical; keep browser journeys
  under `tests/e2e`.

## Architecture change rule

Do not introduce a global state store, service/repository layer, event bus,
monorepo, custom design-system package, or alternate styling system in advance.
Add one only for a concrete requirement, compare simpler options, and record the
decision and consequences.

## Domain modeling rules

- Model idea, campaign, milestone, objection, appeal, refund, payment, KYC, and
  transaction statuses as closed discriminated unions. Rendering must be
  exhaustive; unknown server values fail safely rather than falling through to a
  success state.
- Keep API/domain records separate from presentation view models. Format money,
  time, identifiers, and status copy at the edge of the UI rather than mutating
  canonical records.
- Monetary values carry amount, currency, and precision. Use integer atomic units
  or a lossless decimal/string representation across JSON boundaries; never a
  JavaScript `number` for financial arithmetic.
- Store and compare timestamps in UTC. Localize only for display, always include
  an unambiguous timezone when a deadline or objection window has consequences,
  and derive countdowns from a server-authoritative clock.
- Treat retries as normal. Payment creation, webhook handling, campaign submission,
  transaction submission, notification enqueueing, and refund initiation require
  stable identifiers and idempotent behavior.
- Keep audit events append-only. A corrected projection should preserve enough
  provenance to explain what changed and which chain transaction or privileged
  actor caused it.
