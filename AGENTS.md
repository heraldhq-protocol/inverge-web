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

## Backend API contracts

Read these before building the corresponding UI — they are the source of truth for the
`inverge-api` shapes and stay in sync with the backend:

- `docs/feed-api.md` — discovery feed (`GET /feed`, `PUT /me/interests`): ranked feed the app
  renders as the primary discovery surface, explainability chips, stateless `excludeIds`
  pagination, personalization capture, and the paid-placement labelling requirement.
- `docs/feed-design.md` — the feed/ranking design & rationale behind that contract (three-stage
  architecture, scoring, cold-start/exploration, anti-gaming, paid-placement separation).
<!-- END:nextjs-agent-rules -->
