# Product analytics in the web app

Status: **Phase 1 producer wired for idea discovery and idea detail**. The
creator dashboard still renders preview data; the API contract and live reports
are documented in the API repository (`docs/api/analytics.md`).

## What the web sends

The Next.js server, not the browser, signs and forwards one batch to
`POST /api/v1/internal/analytics/events` after the response has been sent. The
producer lives in `src/features/analytics/server/ingest.ts`.

| Surface | Event | Notes |
|---|---|---|
| `/ideas` | `page_viewed` | `pageKey: "ideas"` |
| `/ideas/{id}` | `page_viewed` | `pageKey: "idea-detail"` |
| `/ideas/{id}` | `idea_viewed` | `ideaId`; `source` is `feed`, `search`, `internal`, or `direct` |
| `/d` | `page_viewed` | `pageKey: "creator-dashboard"` |

Confirmed outcomes are never sent by the web. `idea_supported`,
`prepledge_created`, `feedback_submitted`, and campaign backing are written by
the API after the business row commits. A click, an optimistic state, or a
rendered page is not a completed action.

## Configuration

| Variable | Required | Meaning |
|---|---|---|
| `INVERGE_API_URL` | yes | API origin; the client appends `/api/v1` |
| `INVERGE_ANALYTICS_ENABLED` | yes | Must be `true`; unset is off |
| `INVERGE_ANALYTICS_INGEST_SECRET` | yes | At least 32 characters; must match the API's `ANALYTICS_INGEST_SECRET` |

The secret is server-only. It is never exposed through a `NEXT_PUBLIC_` name,
a route handler, or a client component. If any value is missing, the producer is
inert and pages render normally.

## Identity and privacy

- A signed-in reader is identified by the internal account id resolved from the
  HttpOnly session.
- An anonymous reader gets one random, HttpOnly `inverge_analytics_session`
  cookie from the proxy. It lasts 30 minutes, is not a fingerprint, and is never
  joined to an account later.
- The server reads only a coarse country header (`x-vercel-ip-country` on
  Vercel, `cf-ipcountry` on Cloudflare Pages) when the deployment is on that
  edge. A self-hosted origin ignores the header rather than trusting a value a
  client could supply. It never reads `x-forwarded-for`, a user agent, a device
  signal, a referrer, or a URL.
- No raw IP, token, email, wallet address, free text, or query string is sent.
- The producer has no browser client, no public ingest route, and no consent
  banner. Phase 2 measurement needs the API privacy amendment and NDPA review
  before it can reuse this path.

## Failure behaviour

`after()` keeps the network call out of the response. A timeout, a network
failure, a `503`, or a rejected batch is dropped after one retry; it never
throws, retries a product action, or blocks rendering. The log records only the
batch size and HTTP status, never a payload or identity. The same event key is
reused for the single retry, so the API's unique constraint absorbs a duplicate.

## Dashboard states

The current analytics dashboard is still a preview surface. When it reads live
reports it must handle:

- **loading**: skeleton with no fabricated numbers;
- **empty**: zero views is a valid result;
- **unavailable**: `404` (reads disabled), `503`, or a timeout shows a retry,
  never a zero;
- **entitlement**: `403 ANALYTICS_ENTITLEMENT_REQUIRED` shows the request CTA
  with distinct pending, approved, rejected, and expired copy.

The premium access routes are `GET /api/v1/analytics/access` and
`POST /api/v1/analytics/access-requests`. `/d/creator/analytics` reads the first
and submits the second through a server action. It renders distinct signed-out,
not-configured, unavailable, available, pending, approved, rejected, and expired
states, and it never shows a price, plan, or billing promise. The AI insights
panel's "Ask about Pro access" CTA deep-links to `#premium-analytics` on that
route. The idea workspace inside the route is still preview data; the request
panel is the live seam.

When a paid wall is introduced, the API's `analytics.premium` feature key and
`grantPaidAccess()` entry point are the extension points. The web panel already
renders the approved state from the API, so a billing decision does not require
re-architecting collection or entitlement checks.
