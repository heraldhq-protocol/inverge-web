# Campaign UI — Provisional Data Contract

> Campaign screens are being built before the campaign API exists. This document is the contract
> they are built against, so that when the backend ships, the change is one file
> (`src/lib/campaigns/campaigns-api.ts`) and not a rewrite of every component.
>
> **Status: provisional. Nothing here is implemented in `inverge-api` as of 2026-07-30.** Anything
> marked *live* is real and can be called today.
>
> Companions: [`ideas-campaigns-brief.md`](./ideas-campaigns-brief.md) (build spec),
> [`feed-api.md`](./feed-api.md) (the one contract that is real), PRD/SRS v1.2 §3.3–§3.8.

---

## 1. What exists in the backend today

**Live:** `POST /ideas/:id/convert` — the only campaign write path in the product. Creates a
`DRAFT` campaign once the FR-204 validation gate clears, snapshots the idea, and writes milestones.
Owner-only; 403 if the gate is not met; rejects unless tranche percentages sum to 100 (FR-302).

```jsonc
// POST /ideas/:id/convert — request (ConvertIdeaDto), live
{
  "type": "ALL_OR_NOTHING",          // | "FLEXIBLE_FUNDING" (Phase 3, gated by creator tier)
  "tokenType": "USDC",               // | "CNGN"
  "targetAmount": 5000,
  "deadline": "2026-08-30T17:00:00.000Z",
  "workingCapitalPct": 20,           // optional, 0–25 (FR-503a)
  "milestones": [                    // 2–6 (FR-301), tranchePct must sum to 100 (FR-302)
    { "title": "Working prototype", "deliverable": "…", "tranchePct": 25,
      "evidenceDefinition": { "type": "demo_link", "source": "…" } }
  ]
}
```

**Schema-only and inert** in `prisma/schema.prisma`: `Campaign`, `Milestone`, `MilestoneClaim`,
`MilestoneObjection`, `ReviewerRuling`, `Contribution`, `OnChainEvent`, plus the enums
`CampaignType`, `CampaignStatus{DRAFT,IN_REVIEW,ACTIVE,FUNDED,FAILED,COMPLETED}`,
`ClaimStatus{UNDER_REVIEW,APPROVED,FAILED,DISPUTED}`, `TokenType{USDC,CNGN}`,
`OnChainEventType{FUNDED,TRANCHE_RELEASED,REFUND_CLAIMED,MILESTONE_FAILED}`, `CreatorTier`.

**Does not exist in any form:** campaign read or list endpoints, publish/curation transitions,
contributions, milestone claims, objection submission, receipts feed, campaign updates, campaign FAQ,
campaign media, or any create path for a campaign that does not come from an idea.
There is no campaign-update or campaign-FAQ model at all, so those two Kickstarter tabs have no
backing whatsoever (see [`reference-teardown-kickstarter.md`](./reference-teardown-kickstarter.md)
§5.4, §5.5).

---

## 2. The provisional read contract

Derived from the Prisma models plus the FRs so the shapes will not drift when the endpoints land.
Decimals serialise as **strings**, matching the feed contract. Dates are ISO 8601 strings.

### 2.1 `GET /campaigns` — list

Same query shape as the feed where they overlap, because campaigns eventually join `GET /feed`
(`type=campaigns|all`, already accepted, ideas-only today).

```jsonc
{
  "items": [
    {
      "objectType": "campaign",        // the feed's discriminator — cards switch on this
      "id": "clx…",
      "slug": "campuskonekt",
      "title": "CampusKonekt",
      "summary": "Students in Ibadan wait 40 minutes for lunch between lectures.",
      "category": "software",
      "region": "Ibadan",
      "coverImageUrl": null,           // see §4
      "type": "ALL_OR_NOTHING",
      "status": "ACTIVE",
      "tokenType": "USDC",
      "targetAmount": "5000.00",
      "totalRaised": "3600.00",
      "fundingFloorPct": null,         // FLEXIBLE_FUNDING only (FR-306)
      "backerCount": 214,
      "deadline": "2026-08-30T17:00:00.000Z",
      "creatorId": "clx…",
      "creator": { "id": "clx…", "displayName": "Tobi Adeyemi", "avatarUrl": null,
                   "tier": "TRUSTED", "completedCampaigns": 1 },
      "milestoneSummary": { "total": 4, "released": 2, "underReview": 1, "failed": 0 },
      "promoted": false,
      "reason": { "code": "VELOCITY", "label": "Gaining momentum" }
    }
  ]
}
```

### 2.2 `GET /campaigns/:id` — detail

```jsonc
{
  "…": "every field from the list item, plus:",

  "ideaId": "clx…",                    // link back to the validated idea
  "story": {                            // from ideaSnapshot until campaigns get their own story
    "problem": "…", "solution": "…", "roadmap": "…", "askBreakdown": [ … ]
  },
  "termsHash": "…",                    // FR-303, present once published; NEVER rendered as a hash
  "workingCapitalPct": "20.00",        // FR-503a, disclosed at checkout
  "workingCapitalReleasedAt": "2026-07-04T10:02:00.000Z",
  "launchedAt": "2026-07-01T09:00:00.000Z",

  "milestones": [
    {
      "id": "clx…",
      "index": 0,
      "title": "Working prototype",
      "deliverable": "A working order flow with three campus vendors.",
      "tranchePct": "25.00",
      "evidenceDefinition": { "type": "demo_link", "source": "Public staging URL" },
      "state": "RELEASED",             // derived, see §3
      "claim": {
        "id": "clx…",
        "submittedAt": "2026-07-10T…",
        "objectionWindowEndsAt": "2026-07-17T…",
        "status": "APPROVED",          // UNDER_REVIEW | APPROVED | FAILED | DISPUTED
        "proofBundle": { "note": "…", "images": ["…"], "links": ["…"] },
        "objectionWeightPct": "4.20",  // aggregate only — never per-backer identities
        "objectionThresholdPct": "30.00",
        "ruling": null                 // ReviewerRuling once FR-607 applies
      },
      "receipt": { "kind": "TRANCHE_RELEASED", "amount": "1250.00",
                   "txSignature": "…", "blockTime": "2026-07-17T…" }
    }
  ],

  "receipts": [                         // FR-802: OnChainEvent, indexer-written only (FR-803)
    { "kind": "FUNDED", "amount": "5000.00", "txSignature": "…", "blockTime": "…" },
    { "kind": "TRANCHE_RELEASED", "amount": "1000.00", "txSignature": "…", "blockTime": "…" }
  ],

  "myContribution": {                   // present only when authenticated and a backer
    "total": "45.00",
    "refund": { "status": "RETURNED", "amount": "45.00", "returnedAt": "2026-03-04T…",
                "txSignature": "…" }
  }
}
```

Rules the UI must honour regardless of what the eventual endpoint returns:

- `termsHash` and `txSignature` are **never rendered as strings.** They exist so `TxLink` can build
  a receipt URL and for nothing else (conventions §1).
- Objection data is **aggregate**. Individual objections carry a `userId` and a reason and are not
  backer-facing. FR-608's public voting history is a separate, later surface with its own privacy
  pass.
- `myContribution` is the only per-user field. Absent means "not a backer", not zero.

### 2.3 Writes, deliberately not designed yet

`POST /campaigns/:id/contributions` (FR-401/402), `POST /milestones/:id/claims` (FR-601),
`POST /claims/:id/objections` (FR-603/604), `POST /campaigns/:id/submit` (FR-311 + FR-304). All
depend on either the on-chain programme or the payment rails, and designing their request bodies now
would be guessing. Campaign UI at this stage is **read-only**, with the funding control rendered
disabled and a plain reason (brief §5.4).

---

## 2a. How the money splits

Two bases, and they are not interchangeable. Anything computing a stage amount must use them, or the
same campaign renders different figures on different tabs.

```
upfront  = workingCapitalPct%  of  targetAmount          (FR-503a)
stages   = tranchePct%         of  (totalRaised - upfront)

upfront + every tranche === totalRaised, exactly
```

**The upfront is pegged to the target** because it is the only money that moves before anyone has
verified anything, and the target is the budget reviewers approved. Pegging it to the raise means a
$1,000 target that raises $20,000 pays out $4,000 against nothing — four times the entire plan.

**The stages divide the raise** because a campaign that overfunds is being asked to do more than it
budgeted for, and the extra has to be available while the work happens rather than arriving after it is
finished. The surplus is therefore spread across every stage rather than held back for the last one.

Web-side this lives in `src/lib/campaigns/campaign-stats.ts`. If the API derives these figures too, the
two must agree exactly, so put it in one pure module and consider returning the derived amounts rather
than having both sides compute them.

---

## 3. Milestone state is derived, not stored

`Milestone` has no status column; `MilestoneClaim.status` plus timestamps carry it. The UI needs
four states legible at once, so derivation lives in **one pure function**,
`src/lib/campaigns/milestone-state.ts`, unit-tested, mirroring how the API keeps pure logic separate
from services:

| UI state | Derivation | Rendering |
|---|---|---|
| `UPCOMING` | no claim, and an earlier milestone is not yet released | Muted, tranche % visible |
| `UNDER_REVIEW` | latest claim `UNDER_REVIEW` and `objectionWindowEndsAt` in the future | **Focal.** Countdown in days, consequence sentence, proof shown |
| `RELEASED` | latest claim `APPROVED` | Receipt link |
| `NOT_DELIVERED` | latest claim `FAILED`, or `DISPUTED` resolved as `UPHELD_OBJECTION` | The one licensed use of muted warm red (app kit §4) |
| `DISPUTED` | latest claim `DISPUTED`, no ruling | Neutral: "Under review by the panel", 72h window (FR-606/607) |

Countdowns are computed from `objectionWindowEndsAt` on the server at render time and expressed in
**days**, not a ticking clock. A live-ticking timer is animation in the viewport at rest
(conventions §9.4) and reads as pressure on a screen whose job is calm.

---

## 4. Asks against `inverge-api`

Ordered by how much UI each unblocks. Every one is additive.

| # | Ask | Unblocks | FR |
|---|---|---|---|
| 1 | **Public creator identity**: `displayName`, `avatarUrl`, `bio`, `links` on a public creator projection, embedded in feed items, idea detail, and comment authors | Cards, creator panel, comment thread, campaign header. The single most blocking gap | — |
| 2 | **Comment author projection** on `GET /ideas/:id/comments` (`author: { id, displayName, avatarUrl, isCreator }`) | The thread cannot render at all without it | FR-701 |
| 3 | **Media** on `Idea`: `coverImageUrl` first (+ upload path, separable), optional short `videoUrl` second | Image-led cards; typographic covers are the fallback, not the plan. Video rationale and its caveats in [`pitch-narrative-playbook.md`](./pitch-narrative-playbook.md) §6 | — |
| 3b | Optional idea-level `risks` field, prompted and scored as coaching | Kickstarter mandates a risks section on every project; our ideas have none. Feeds the quality coach and, later, backer context in objection voting | FR-271a |
| 3c | Optional one-line `summary` on `Idea` | OpenGraph text, campaign header, share copy. Low priority: `problem` stays the card line | — |
| 4 | Owner filter on `GET /ideas` (`mine=true` or `creatorId=`) plus `DRAFT` visibility to the owner | Creator dashboard | — |
| 5 | Public gate progress on `GET /ideas/:id` (the have/need/met breakdown `insights` already computes) | Public gate breakdown without exposing the creator-only insights payload | FR-203/204 |
| 6 | `GET /campaigns` and `GET /campaigns/:id` per §2 | Every campaign screen; removes the fixtures | FR-301–305 |
| 7 | Public receipts feed per campaign from `OnChainEvent` | Receipt timeline, transparency dashboard | FR-802/803 |
| 8 | Campaign updates model + endpoints | The Updates tab | FR-701 |
| 9 | Campaign FAQ model + endpoints | The FAQ tab | — |
| 10 | Public aggregate support view (geography, first-time vs returning), privacy-reviewed | A public community tab; creator dashboard covers it meanwhile | — |
| 11 | `objectionThresholdPct` and the objection window length exposed as read-only platform params | Rendering the rule instead of hard-coding 30% and 7 days | FR-603 |
| 12 | Platform escrow aggregates from the indexer: total held, released, refunded, plus campaign counts by status | The FR-801 figure band at the top of the catalogue. Summed client-side from the campaign list meanwhile, which does not survive pagination | FR-801/803 |
| 13 | Campaign list filters and sort as query params (`status`, `category`, `region`, `sort`), same idiom as the feed | Server-side catalogue filtering instead of fetching every campaign and filtering in the client module | — |
| 14 | Creator campaign history on the public creator projection: per-campaign `title`, `slug`, `status`, `milestonesReleased`, `milestoneTotal` | The Creator tab's "other campaigns by this creator" block, with **derived** outcome labels rather than the reference's self-reported "Marked as fulfilled" | — |
| 15 | `POST /campaigns/:id/submit` plus `GET /campaigns?mine=true` including `DRAFT` and `IN_REVIEW` | Step 4 of the campaign builder, and a creator's view of their own unpublished draft | FR-304/311 |
| 16 | **Campaign media**: `videoUrl` (**required to publish**), `videoPosterUrl`, `coverImageUrl`, plus upload paths | The above-the-fold player and every card thumbnail. See the note below — the moderation consequence is real | — |
| 17 | A create path for a campaign with **no backing idea**, carrying its own `title`, `summary`, `category` and `region` | The standalone path in the builder. `POST /ideas/:id/convert` is the only create path today and it requires an idea | — |
| 18 | **Reward tiers** on `Campaign`: `title`, `description`, `amount`, `estimatedDelivery`, `limitedQuantity`, `claimed`, `items[]`, `shipping` | The Rewards tab and step 4 of the builder. Optional per FR-301; `ConvertIdeaDto` accepts no rewards field today | FR-301 |

Nothing in items 1–11 is required for stages 1–7 of the sibling brief's build order except items 1 and 2,
which are required for stages 3 and 6 respectively.

**Note on item 16.** Video is a heavier moderation surface than an image, which is already flagged as
unhandled in item 3: the classifier is text-only. Either constrain to trusted hosts, or hold first
upload behind review, or accept video moderation as its own piece of work — but do not quietly ship an
unmoderated public video field on the surface where money changes hands.

Items 12–17 come from [`campaign-brief.md`](./campaign-brief.md) §11 and are what the campaign surfaces
ask for beyond items 6 and 7. None blocks a screen: 12 and 14 have a fixture-summed fallback that is
correct and does not scale, 13 is performance, and 15 is the one that leaves the creator flow stopping
at a saved draft.

---

## 5. Fixtures

One file, `src/lib/campaigns/fixtures.ts`, typed against the §2 shapes, imported **only** by
`campaigns-api.ts`. No component imports fixtures directly, no shape is inlined, and the swap is:

```ts
// src/lib/campaigns/campaigns-api.ts
const USE_FIXTURES = true; // flip when §4 item 6 lands

export async function getCampaign(id: string): Promise<CampaignDetail> {
  if (USE_FIXTURES) return fixtures.campaigns.find((c) => c.id === id) ?? notFound();
  const { data } = await api.GET('/campaigns/{id}', { params: { path: { id } } });
  return data;
}
```

Fixture content requirements, because fixtures are what the screens get reviewed on:

- **Three campaigns minimum**, covering the states that matter: one `ACTIVE` mid-flight with
  milestone 3 under review, one `COMPLETED` with all milestones released, one `FAILED` at milestone 3
  with a refund in progress.
- Real-sounding Nigerian and West African creator names and project titles. Believable USD amounts.
  No "Lorem ipsum", no "John Doe", no placeholder avatars (conventions §1.5).
- Under-review milestones carry an `objectionWindowEndsAt` **computed relative to now** so the
  countdown is never stale in review or in a screenshot.
- Every released milestone and every refund carries a plausible `txSignature`, so `TxLink` is
  exercised and the receipt path is real.

---

## 6. When the endpoints land

1. Regenerate the typed client: export the API spec to `openapi.json`, run `pnpm gen:api`.
2. Move the §2 response types from `lib/api/types.ts` into whatever the spec now types, keeping the
   names so imports do not churn.
3. Flip `USE_FIXTURES`, delete `fixtures.ts`, keep `milestone-state.ts` and its tests untouched.
4. Diff the real payload against §2 and **update this document** rather than patching shapes into
   components. If the backend chose different names, one file changes.
