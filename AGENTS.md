<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Backend API contracts

Read these before building the corresponding UI — they are the source of truth for the
`inverge-api` shapes and stay in sync with the backend:

- `docs/feed-api.md` — discovery feed (`GET /feed`, `PUT /me/interests`): ranked feed the app
  renders as the primary discovery surface, explainability chips, stateless `excludeIds`
  pagination, personalization capture, and the paid-placement labelling requirement.
<!-- END:nextjs-agent-rules -->
