# Product analytics in the web app

Status: **Phase 1 producer and live creator reports wired**. The web sends views
for idea discovery and idea detail, and the creator insights pages read the
existing API reports. Preview fixtures remain only for preview auth or an
unconfigured API. The API contract is documented in the API repository
(`docs/api/analytics.md`).

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

The producer sends one signed batch, not one request per event:

```http
POST /api/v1/internal/analytics/events
content-type: application/json
x-inverge-timestamp: 1761480000
x-inverge-signature: <hex HMAC-SHA256 of `${timestamp}.${rawBody}`>

{"events":[{"eventKey":"<uuid>","name":"page_viewed","occurredAt":"2026-10-26T12:00:00.000Z","resourceType":"PAGE","resourceId":"ideas","source":"direct","sessionId":"<opaque visitor id>","countryCode":"NG"}]}
```

A signed-in event carries `userId` instead of `sessionId`; the API rejects an
event with both. `eventKey` is the idempotency key and is reused for the single
retry, so the API's unique constraint absorbs a duplicate. The batch is capped
at 50 events and 64 KB by the API. `source` is the closed set `feed`, `search`,
`internal`, or `direct`; `countryCode` is optional and only set from a trusted
edge header.

Discovery cards append `?source=feed`, search results append `?source=search`,
and links from inside the product append `?source=internal`. A shared or typed
URL has no parameter and records `direct`. The idea page maps only those values;
anything else is treated as `direct`, so the source cannot become free text.

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
  signal, a referrer, or any other URL. The one URL input is the closed `source`
  query parameter on an idea link, reduced to one of four values before it
  leaves the request.
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

## Live creator analytics

The creator index and the per-idea insights tabs reuse the API's existing reads;
the web adds no duplicate analytics endpoint.

| Surface | API read | Notes |
|---|---|---|
| `/d/creator/analytics` | `GET /ideas?mine=true` | Authenticated, bounded to 100 ideas; the public catalogue is never used to assemble the list |
| Insights shell and overview | `GET /ideas/{id}`, `GET /ideas/{id}/insights`, `GET /ideas/{id}/analytics/summary`, `GET /ideas/{id}/analytics/timeseries` | The insights read is also the ownership check |
| Interest and supporters tabs | The same insights read | Feedback aggregates, pre-pledge tiers/currencies, comments, gate progress, and support snapshots |
| Traffic tab | Summary, timeseries, then premium `validation`, `acquisition`, and `geography` | Validation is read for any premium owner; acquisition and geography are fetched only when access is premium and the traffic tab is open |
| Referrals tab | No report | The API stores no referrer or UTM data, so the tab says attribution is unavailable rather than inventing a source |

Report queries use an inclusive UTC day range derived on the server
(`from`, `to`, and `interval=day`). The browser selects a period but never
computes the range from its own clock. The creator index is a bounded,
newest-first window of at most 100 ideas and says when it is truncated; it does
not paginate an unbounded catalogue.

The analytics shell resolves the idea with `GET /ideas/{id}` and the
creator-only `GET /ideas/{id}/insights` in parallel. A `403` or `404` from the
idea or insights read becomes `notFound()`, so a published idea owned by someone
else does not reveal that it exists. A `401` renders the signed-out state. A
timeout, a `5xx`, or an unavailable read renders an explicit unavailable state
with a retry; it never becomes a zero. Zero views is a real result and is
rendered as zero.

The overview and supporter pages show all-time supporters and the current
pre-pledge total, not a range-bound total. The `follows` and `saves` figures are
`null` because the product has no follow or save model yet. Confirmed campaign
backing is not inferred from analytics clicks; `Contribution` remains
indexer-owned.

### Entitlement and fallback

Basic summary and timeseries are read for any authenticated owner; the basic
validation counts already arrive in the summary. The `validation`, `acquisition`,
and `geography` reports are requested only after `GET /api/v1/analytics/access`
confirms `analytics.premium`, so a locked page never fetches a report and hides
it client-side. The web reads validation for its conversion rates, which are
rendered only when the report also says `premium: true`.

Preview fixtures are used only when `INVERGE_AUTH_MODE=preview` or
`INVERGE_API_URL` is unset. An API-configured deployment that is signed out
renders the signed-out state; it never falls back to a fixture that looks live.
The preview idea remains `skill-circle`.

The premium access routes are `GET /api/v1/analytics/access` and
`POST /api/v1/analytics/access-requests`. `/d/creator/analytics` reads the first
and submits the second through a server action. It renders distinct signed-out,
not-configured, unavailable, available, pending, approved, rejected, and expired
states, and it never shows a price, plan, or billing promise. The AI insights
panel's "Ask about Pro access" CTA deep-links to `#premium-analytics` on that
route.

The period control and tab bar use Suspense skeletons. A report that did not
return a figure renders an explicit empty or "not measured" state rather than a
fabricated zero; a real zero remains zero. A failed basic report renders a retry
state, while a failed premium sub-report renders an unavailable panel next to
the panels that did load. Analytics never blocks the idea page, a creator
action, or a product mutation.

When a paid wall is introduced, the API's `analytics.premium` feature key and
`grantPaidAccess()` entry point are the extension points. The web panel already
renders the approved state from the API, so a billing decision does not require
re-architecting collection or entitlement checks.

### Dashboard states

- **loading**: a route-level skeleton with no fabricated numbers;
- **empty**: zero views and zero supporters are valid results;
- **signed out**: an API-configured deployment shows the sign-in state;
- **not configured**: preview auth or no API shows the preview surface;
- **unavailable**: a basic report `404` (reads disabled), `503`, or a timeout
  shows a retry, never a zero. A failed premium sub-report marks only that panel
  unavailable, so the basic totals on the same page still render;
- **not found**: a missing idea, a non-owner, or a draft the caller cannot read;
- **entitlement**: the access read drives the request CTA with distinct pending,
  approved, rejected, and expired copy. A premium report that returns `403`
  after the grant is treated as unavailable, not as approval.

## Privacy boundary

Live creator reports expose aggregates only. They do not show supporter
identities, respondent identities, written feedback text, raw IP addresses, or
visitor-level histories. Country is a server-derived aggregate and the raw IP is
discarded before the event is queued. See `docs/api/analytics-privacy.md` in the
API repository for the collection boundary and `docs/api/analytics.md` for the
report fields.
