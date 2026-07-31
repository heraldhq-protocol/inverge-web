<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Engineering conventions

- `docs/conventions.md` — **read this before writing any UI code.** Stack of record, the Next 16
  breaking changes that differ from most training data, Server/Client Component rules, project
  structure and naming, Tailwind v4 token discipline, accessibility floors (WCAG 2.2 AA),
  the motion contract, performance budgets, and the definition of done.
- `docs/landing-brief.md` — build spec for the marketing landing page: scope, file allowlist,
  section requirements, responsive targets, and the static→animation handoff contract.
  **Landing page only** — its file allowlist and its "no live data, no animation" rules do not
  apply to app screens.
- `docs/app-mockup-kit.md` — art direction for the logged-in app screens: how product screens
  differ from the landing page (density, type scale, cards vs tables, states), the locked palette
  and app shell, form rules, and a per-screen mockup brief. Read before designing or building any
  screen behind the marketing site.
- `docs/ideas-campaigns-brief.md` — **build spec for the idea feed, idea detail, and campaign
  screens.** Scope and file allowlist, the locked app shell, route map, component inventory, the
  copy deck (strings are final), state matrix, the hard rules specific to these screens, staged
  build order, and definition of done. Read before touching anything under `(app)`.
- `docs/campaign-brief.md` — **build spec for everything under `/campaigns`**: the catalogue, campaign
  detail in depth (the six tabs and where each one's data comes from), and the creator flow from a
  validated idea to a draft campaign. Supersedes `ideas-campaigns-brief.md` for campaign surfaces only.
  Carries the eight findings that drive it, the ranked recommendations, the copy deck, the hard rules,
  and the new API asks. Read before touching `components/campaigns/*`, `lib/campaigns/*` or
  `app/(app)/campaigns/*`.
- `docs/reference-teardown-kickstarter.md` — structural teardown of the Kickstarter reference the
  above is drawn from: homepage module inventory, the card anatomy, the project-page bands, tab by
  tab, the closed badge vocabulary, and the vocabulary translation table (what we may never call
  money). Explains *why* the brief looks the way it does, and what we deliberately refuse.
- `docs/pitch-narrative-playbook.md` — the creator-side companion to that teardown: the narrative
  order a pitch follows, the copy and rhythm rules, where each one is enforced in our code, and the
  four places we deliberately invert the reference (disclosure first, hyperbole as a compliance
  boundary, momentum as a ranked signal rather than theatre, no stretch goals). Read before touching
  the story renderer, `/ideas/new`, or any coaching copy.

## Backend API contracts

Read these before building the corresponding UI — they are the source of truth for the
`inverge-api` shapes and stay in sync with the backend:

- `docs/feed-api.md` — discovery feed (`GET /feed`, `PUT /me/interests`): ranked feed the app
  renders as the primary discovery surface, explainability chips, stateless `excludeIds`
  pagination, personalization capture, and the paid-placement labelling requirement.
- `docs/feed-design.md` — the feed/ranking design & rationale behind that contract (three-stage
  architecture, scoring, cold-start/exploration, anti-gaming, paid-placement separation).
- `docs/campaign-data-contract.md` — **provisional** contract for campaign screens. Campaigns are
  schema-only and inert in `inverge-api`: only `POST /ideas/:id/convert` is live. Lists what exists,
  the read shapes the UI is built against, derived milestone state, the additive asks filed against
  the API, and the single fixture swap point. No component may invent a campaign endpoint.
<!-- END:nextjs-agent-rules -->
