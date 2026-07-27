# Discovery feed — backend API contract (for the web frontend)

The `inverge-api` discovery feed is live on `main`. This is the contract the web app
builds against. It supersedes the old `GET /ideas` browse as the primary discovery surface
(`/ideas` still exists for simple listing). Follow the existing `src/lib/kyc/` pattern:
a hand-rolled fetch client + a hook, or regenerate the typed client with `pnpm gen:api`
(the API exports OpenAPI at `/docs-json`).

## `GET /feed` — the ranked feed

**Auth: optional.** Send the session bearer token → personalised feed. Omit it → anonymous
global-popular feed (this is intentional; there is no login wall on discovery).

**Query params**
| param | type | default | notes |
|---|---|---|---|
| `type` | `ideas` \| `campaigns` \| `all` | `ideas` | Phase 0 serves `ideas` only; campaigns join the same feed in Phase 1+. |
| `take` | int 1–50 | 25 | page size |
| `excludeIds` | comma-separated ids | — | **pagination is stateless**: accumulate the ids you've shown and pass them here for the next page. There is no `skip`/`offset` — scores shift between requests, so offset paging would be wrong. |
| `category` | `software`\|`agriculture`\|`film`\|`arts`\|`other` | — | optional hard filter |

**Response**
```jsonc
{
  "anonymous": true,               // false when a valid token was sent
  "items": [
    {
      "objectType": "idea",        // 'idea' now; 'campaign' from Phase 1+ — design cards to switch on this
      "id": "clx...",
      "slug": "agricredit",
      "title": "AgriCredit",
      "problem": "…",
      "solution": "…",
      "category": "agriculture",
      "region": "Lagos",           // creator-declared origin, may be null
      "askAmount": "25000",        // Decimal → JSON string
      "status": "VALIDATING",      // VALIDATING | THRESHOLD_MET
      "discoverabilityTier": "FEATURED", // DISCOVERABLE | FEATURED
      "supporterCount": 42,
      "weightedPrePledgeTotal": "1830.50", // PUBLIC "Estimated interest" (Decimal string). Label it exactly "Estimated interest", never "raised".
      "feedbackScore": "4.20",     // mean rating, Decimal string
      "feedbackCount": 11,
      "commentCount": 7,
      "qualityScore": "0.9000",    // 0..1, Decimal string, may be null
      "creatorId": "clx...",
      "promoted": false,           // true = paid placement slot (Stage 3)
      "boostTier": null,           // 'BASIC' | 'FEATURED' | null
      "exploration": false,        // true = shown via the exploration lane
      "reason": { "code": "REGION", "label": "From Lagos" } // explainability chip
    }
  ]
}
```

Notes:
- The raw internal `prePledgeTotal` is **never** returned. Show `weightedPrePledgeTotal` as
  "Estimated interest". These are behavioural, unpurchasable metrics.
- Decimal fields serialize as **strings** — parse before formatting.
- Items already arrive in final ranked order. Render top-to-bottom; don't re-sort client-side.

### The `reason` chip (explainability layer — surface it on every card)
| code | example label | meaning |
|---|---|---|
| `EXPLORE` | New, worth a look | shown via the exploration lane (a fair-exposure slot for under-exposed items) |
| `REGION` | From Lagos | matched the user's region interest |
| `CATEGORY` | Matches your interests | matched a category interest |
| `INTENT` | Strong early interest | pre-pledge intent dominant |
| `VELOCITY` | Gaining momentum | fast supporter accrual |
| `FEEDBACK` | Highly rated by backers | strong survey ratings |
| `QUALITY` | Well-crafted pitch | quality score dominant |
| `TRUST` | From a verified creator | KYC/KYB + co-sign |
| `PROMOTED` | Promoted | **paid** slot — must be visually distinct + clearly labelled (regulatory/positioning requirement). Never merge its styling with organic cards. |

## `PUT /me/interests` — onboarding personalization capture

**Auth: required.** Capture at onboarding; explicit prefs take precedence over inferred
behaviour in ranking. Both fields optional; send what you collect.
```jsonc
// request
{ "preferredCategories": ["agriculture"], "preferredRegions": ["Lagos"] }
// response (echoes stored values)
{ "preferredCategories": ["agriculture"], "preferredRegions": ["Lagos"] }
```
`preferredCategories` are validated against the category enum (400 on an unknown value).
`preferredRegions` are free-form strings (≤60 chars each). Until a user sets these, the feed
infers interests from the ideas they've supported/pre-pledged.

## Related: idea creation now accepts `region`

`POST /ideas` (`CreateIdeaDto`) gained an optional `region` string (creator-declared
origin, ≤60 chars). Add it to the idea-create form so region personalization + the
"From <region>" chip work end-to-end.

## Suggested web structure
Mirror `src/lib/kyc/`: a `src/lib/feed/feed-api.ts` fetch client (`getFeed(params, token?)`,
`updateInterests(body, token)`) + a `useFeed` hook that manages `excludeIds` accumulation for
"load more". Build the feed card to switch on `objectType` so campaigns drop in later without a
rewrite.

## What's Phase 1+ (don't build against it yet)
`type=campaigns|all`, campaign cards, and campaign-only signals (delivery track record,
milestone health, a "Close to its goal" funding-proximity chip) land when campaigns go live.
The API accepts `type` today but serves ideas only.
