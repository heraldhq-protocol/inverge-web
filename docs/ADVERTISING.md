# Advertising and sponsorship

Status: **web preview implemented; no production serving, billing, or analytics
pipeline**. The admin workspace writes to this browser only, public pages serve
approved preview fixtures, and the measurement route accepts events without
persisting them. Do not describe any of it as live advertising.

This document is the product and engineering contract for paid placements. The
server-side API contract (tables, lifecycle endpoints, cache keys) lives in
`inverge-api/docs/api/advertising.md`; the proposed Prisma models are in
`inverge-api/prisma/schema.prisma` and are **not applied**.

## Principles

1. **A paid placement is always labelled.** Every surface carries `Sponsored`,
   the advertiser's name, and a sentence naming the commercial relationship.
2. **Money never touches ranking or validation.** Advertising is a separate
   bounded context. It cannot write a validation signal, funding total, review
   decision, or campaign metric. Ad events are never joined to campaign
   analytics.
3. **No dark patterns.** No pop-ups, interstitials, auto-playing audio, fake
   urgency, fake impressions, or invented earnings. No ad is disguised as an
   Inverge recommendation.
4. **No empty reservations.** A slot that cannot serve renders nothing. There is
   no blank rectangle and therefore no layout shift.
5. **Fail closed.** A malformed flag, consent record, creative, or event is
   refused rather than coerced into "on".
6. **First-party before third-party.** Native, Inverge-managed placements are
   the default. A third-party vendor is isolated, opt-in, and off until both
   configured and consented.

## Placement registry

`src/features/advertising/lib/placements.ts` is the only place a slot is
declared. A page requests an id; it cannot invent a format, breakpoint, or
density rule at the call site.

| Id | Page kinds | Format | Viewports | Rules |
|---|---|---|---|---|
| `campaign-feed-inline` | campaigns | native card | all | after 6 organic results |
| `campaign-detail-inline` | campaign | banner | all | below tabs, away from funding |
| `campaign-detail-rail` | campaign | sidebar | desktop | hidden below `lg` |
| `idea-feed-inline` | ideas | native card | all | after 6 organic results |
| `idea-detail-inline` | idea | banner | all | after the solution section |
| `idea-detail-rail` | idea | sidebar | desktop | hidden below `lg` |
| `content-inline` | guide, journal | banner | all | between editorial sections |
| `content-sidebar` | guide, journal | sidebar | desktop | hidden below `lg` |
| `editorial-third-party` | guide, journal | third-party | tablet, desktop | flag + IDs + consent |

`maxPerPage` is 1 everywhere. `minimumOrganicResults` is 6 for both feeds. The
feed components re-check the organic count on the client, so a server bug cannot
put a paid card in a three-result grid.

## Selection

`selectAdvertisement` and `selectPageAdvertisements` are pure and
deterministic. Inputs are the creative set, a placement id, `now`, viewport,
consent, flags, page context, seen ids, and excluded ids. There is no random
source and no request inspection, so a server render and its hydration agree.

Rules, in order:

1. Master flag on.
2. Page kind allowed.
3. Viewport allowed.
4. Organic floor met, when declared.
5. Third-party flag on, then consent, when required.
6. Creative not already shown this session (`seenCreativeIds`) or elsewhere on
   the page (`excludeCreativeIds`).
7. Status is `approved`.
8. Placement is booked on the creative.
9. Format is allowed in the placement.
10. Destination is an `https://` URL or a single-slash Inverge path.
11. Category and region are relevant; an empty list means "all".
12. `startsAt <= now < endsAt`.

Ranking is `priority * 1_000_000 + daily rotation bucket`. Priority wins; the
rotation hash only breaks ties and rotates once per UTC day. A null result is
the normal state, not an error.

## Serving boundary

`src/features/advertising/server/view.ts` reads the flags, the preview inventory,
and a timestamp. It reads no cookie and no request header, which keeps marketing
routes statically renderable. Because there is no viewport on the server, rail
placements are selected as desktop and hidden by the wrapper below `lg`; a
mobile-only creative cannot be substituted later without a client boundary,
which is deliberate.

When the API owns inventory, this module becomes the fetch boundary and the
selection module stays as the contract test. Until then, scheduling changes
require a rebuild/revalidation.

## Consent

Consent is stored at `inverge:advertising-consent:v2` and contains two
independent purposes:

| Purpose | Default | Gates |
|---|---|---|
| `measurement` | off | `ad_impression`, `ad_click`, `ad_dismiss`, `ad_destination_opened` |
| `personalisedAds` | off | the third-party AdSense adapter |

A first-party labelled placement is part of the page and does not depend on
either purpose. An unreadable, older (v1), or partial record fails closed: both
purposes are treated as refused.

Preferences live at `/advertising-preferences` and are linked from the privacy
notice and the footer. Saving is explicit; opening the page writes nothing.
"Turn off optional advertising" writes both purposes as false.

Regulatory notes:

- **Nigeria (NDPA 2023):** the lawful basis for optional measurement and
  personalised advertising is consent. The privacy notice names the purposes,
  the data, and how to withdraw. Withdrawal is as easy as granting.
- **EEA/UK (GDPR, PECR):** non-essential storage and personalised advertising
  require prior, specific, informed consent. Nothing is pre-ticked, and refusing
  does not degrade the page. There is no legitimate-interest fallback for the
  AdSense adapter.
- **Switzerland (FADP):** the same opt-in behaviour applies; the notice states
  the purposes and the categories of recipients.

This document is not legal advice. A deployment that enables third-party
advertising must have the notice and any required vendor disclosures reviewed
for the countries it serves.

## Measurement

Events are defined in `src/features/advertising/lib/events.ts`:

| Event | Meaning |
|---|---|
| `ad_impression` | at least 50% of the placement visible for one second |
| `ad_click` | the CTA was activated |
| `ad_dismiss` | reserved; the dismissal control currently stores locally |
| `ad_destination_opened` | reserved for a verified outbound landing signal |

An impression requires `IntersectionObserver`; when it is unavailable no
impression is fabricated. The browser sends at most one event per type, session,
creative, and placement, and the server de-duplicates the same key again.

`POST /api/advertising/events` is a validating boundary, not a pipeline. It is
absent unless `INVERGE_ADS_ANALYTICS_ENABLED=true`, and the browser also needs
`NEXT_PUBLIC_INVERGE_ADS_ANALYTICS_ENABLED=true` plus consent. It caps the body
at 2 KB, rejects bot-like or missing user agents, requires an anonymous
`sessionId`, rejects events outside a ten-minute clock window, and rate-limits
30 events per session per minute. Accepted responses say `persisted: false`;
nothing is written or logged. Never report these numbers as analytics.

The event payload contains no IP address, cookie, account id, user agent, or
free text. The user agent is used for one bot check and discarded.

## Third-party adapter (AdSense)

`ThirdPartyAdSlot` is the only provider-specific code. It renders only when:

- `INVERGE_ADS_ENABLED=true`,
- `INVERGE_ADS_THIRD_PARTY_ENABLED=true`,
- a non-empty `NEXT_PUBLIC_INVERGE_ADSENSE_CLIENT_ID` and
  `NEXT_PUBLIC_INVERGE_ADSENSE_SLOT_ID`,
- the reader has explicitly allowed personalised advertising.

It renders the provider's own `<ins>` element and performs the documented
`adsbygoogle.push({})`. It does not scan or mutate other DOM. It uses
`next/script` with `afterInteractive`, so no provider script is fetched before
consent. In development an unconfigured slot explains that no provider is
loaded; in production it renders nothing.

Setup, once a publisher account is actually approved:

1. Put the client and slot ids in the deployment environment (they are public).
2. Set both flags to `true`.
3. Verify the ad is labelled, the consent gate blocks the request before opt-in,
   and the publisher policy allows the placement.
4. Update this document's status line. Until then, no publisher approval or
   revenue is claimed.

## Admin workspace

`/admin/advertising` requires `advertising:manage`; approve and reject also
require `advertising:approve`. Platform admins hold both; organisers hold
manage only; judges hold neither. The check runs in the domain
(`applyAdAction`, `saveAdvertisingCreative`) as well as in the rendered
controls, so hiding a button is not the rule.

The workspace supports inventory summary, status filters, create/edit,
submit, approve, reject (with a reason), pause, resume, and end, plus a device
preview of each format. Every transition appends an audit event.

**Boundary:** no authenticated admin session or advertising endpoint exists in
this build. The store is browser `localStorage` (`inverge:admin:advertising:v1`)
and the UI says the changes are not persisted server-side. Two administrators
see different inventories, and clearing storage resets to the fixtures. The API
remains the authority; see the API document for the intended endpoints.

## Feature flags and rollout

| Variable | Effect | Default |
|---|---|---|
| `INVERGE_ADS_ENABLED` | master inventory switch | on in development, off otherwise |
| `INVERGE_ADS_THIRD_PARTY_ENABLED` | allows the AdSense adapter | off |
| `NEXT_PUBLIC_INVERGE_ADSENSE_CLIENT_ID` | public client id | unset |
| `NEXT_PUBLIC_INVERGE_ADSENSE_SLOT_ID` | public slot id | unset |
| `INVERGE_ADS_ANALYTICS_ENABLED` | accepts event posts | off |
| `NEXT_PUBLIC_INVERGE_ADS_ANALYTICS_ENABLED` | lets the browser send | off |

Recommended rollout: first-party inventory in one placement group, one
advertiser, one region, at a low priority. Watch Core Web Vitals, organic
click-through, and support complaints before widening. Third-party advertising
is a separate decision and should follow, never lead.

## Performance, SEO, and accessibility

- No slot reserves height. Empty means absent.
- Feed cards render only inside an already-populated grid.
- Rail cards sit in existing desktop rails; no mobile duplicate is downloaded.
- Provider scripts load only after consent and only on editorial pages.
- Ads are `aside`/`article` landmarks with labelled headings, keyboard-reachable
  CTAs, visible focus, and a full-text "Dismiss ad" control.
- External links use `rel="noopener noreferrer sponsored"` and announce the new
  tab. Internal links stay in the same tab.
- Ad content is not included in structured data, sitemaps, or canonical
  metadata.

## Verification status

Covered by unit/component tests: placement registry, responsive eligibility,
flag and consent gating, schedule boundaries, relevance, format, frequency,
density, organic floor, destination safety, status permissions, rejection
reason, inventory summary, event parsing/dedupe/bot/rate limits, intake and
route responses, consent persistence and failure modes, admin store permissions
and persistence, labels, disclosures, dismissal, disabled slots, rail hiding,
third-party consent gating, and preference controls.

Not verified, because it does not exist: production ad serving, an impression
ledger, billing or reconciliation, publisher approval, real advertiser data, and
revenue reporting.

## Known gaps

- No advertiser self-service or sales workflow.
- No server-side inventory, pacing, or frequency capping beyond the session.
- No cache, so no cache-invalidation path to test. The API document specifies
  the intended keys and generation bumps.
- No analytics sink; accepted events are dropped by design.
- `ad_dismiss` and `ad_destination_opened` are in the contract but only
  `ad_impression` and `ad_click` are emitted today.
- Admin edits are not multi-user or server-audited.
- Static pages pick a creative at build/revalidation time.
