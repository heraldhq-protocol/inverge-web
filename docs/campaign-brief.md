# Campaigns — Build Brief

> Build spec for the campaign surfaces: the catalogue, campaign detail in depth, and the creator
> lifecycle flow from a validated idea to a campaign awaiting curation.
>
> Sibling to [`ideas-campaigns-brief.md`](./ideas-campaigns-brief.md), which shipped the first pass of
> campaign detail (header, tracker, objection window, receipts, refund) in its stages 8–9. That brief
> stays authoritative for the idea surfaces and the app shell; this one supersedes it for everything
> under `/campaigns`.
>
> Read first: [`conventions.md`](./conventions.md) (the rulebook),
> [`campaign-data-contract.md`](./campaign-data-contract.md) (the provisional API and the fixture swap
> point), [`reference-teardown-kickstarter.md`](./reference-teardown-kickstarter.md) (where these
> layouts come from), [`pitch-narrative-playbook.md`](./pitch-narrative-playbook.md) (what goes inside
> a pitch and in what order), [`app-mockup-kit.md`](./app-mockup-kit.md) §3–§6 (art direction).
>
> Branch: `feat/campaign-ui-and-flow`.

---

## 1. Where campaigns stand, and the problem with that

### 1.1 Built today

| Route | State |
|---|---|
| `/campaigns` | A flat 3-up grid of every campaign, plus a verification card. No filters, no sort, no lanes, no hero. |
| `/campaigns/[id]` | Header with a funding card, refund notice, trust strip, three tabs: stages, story, receipts. |

Three fixture campaigns behind `lib/campaigns/campaigns-api.ts`. `MilestoneTracker`, `ObjectionWindow`,
`ReceiptTimeline` and `RefundNotice` are good and are kept largely as they are. `POST /ideas/:id/convert`
is the only live campaign write path in the product and **has no UI at all**.

### 1.2 Eight findings

Recorded because each one drives a decision below, and because they are the kind of thing that gets
quietly re-litigated six weeks later.

**F1 — The catalogue has no job.** It renders every campaign in one undifferentiated grid, sorted by
status in code and by nothing a reader can see or change. Kickstarter's equivalent surface is a
*homepage* built from four module shapes (teardown §2), but copying that shape would be copying the
wrong intent: **Kickstarter's reader is shopping, ours is auditing.** A person who arrives at
`/campaigns` on a platform whose entire claim is "money is released in stages and backers can stop a
stage" is there to check whether that is true. The catalogue has to answer that before it merchandises
anything.

**F2 — FR-801 has nowhere to live.** The SRS requires a public dashboard showing total value escrowed,
released and refunded, plus counts of active, completed and refunded campaigns, derived from chain data
(FR-803). There is no route for it and none is planned. It is the single most persuasive block of text
we can put in front of a sceptic and it currently does not render anywhere.

**F3 — The two highest-value tabs are missing.** The teardown calls the Creator tab "the highest-value
tab to copy" (§5.3) and singles out the dated timeline card as "a genuinely good idea for us" (§5.5).
Neither is built. Both are buildable **today**, from data the contract already carries: the creator
projection, and the milestones plus receipts we already hold. Neither needs a new endpoint.

**F4 — "FAQ" is two different features wearing one name.** Kickstarter's FAQ is creator-authored, needs
a model we do not have, and is correctly filed as API ask 9. But most questions a first-time backer has
about an Inverge campaign are about **the mechanic, not the project**: what is working capital, who
decides whether a stage passed, can the creator change the milestones after launch, what happens to my
money if stage 3 fails. Those answers are platform-authored, identical on every campaign, derived from
the SRS, and shippable this week.

**F5 — The funding panel is not sticky, and idea detail's is.** Idea detail runs a two-column read with a
sticky rail (`lg:sticky lg:top-24`). Campaign detail puts the same information in a card inside the
header grid, which scrolls away. Two pages in the same product, one screen apart, with different
above-the-fold contracts.

**F6 — The one live write path has no screen.** `POST /ideas/:id/convert` enforces FR-204 (the validation
gate), FR-301 (2–6 milestones), FR-302 (tranche percentages sum to 100) and FR-503a (working capital
0–25%). Every one of those is a form rule. This is the highest-value non-fixture work available in the
campaign domain and it is unbuilt.

**F7 — `DRAFT` and `IN_REVIEW` have no screen either.** `convert` creates a `DRAFT`. A creator who
converts an idea today lands nowhere, and the two statuses that exist before a campaign is public have no
rendering at all.

**F8 — Flexible Funding is fully specified and completely invisible.** FR-306 defines a three-tier
eligibility ladder with funding floors at 70% and 50%, FR-306a a dual milestone plan, FR-306b a
floor-scenario objection window, FR-307 concurrency limits, FR-309/310 strikes and demotion. A Starter
creator has no way to learn that any of it exists, or what completing one campaign would buy them.

---

## 2. The seven reference tabs, translated

Kickstarter's project page is `Campaign · Rewards · Creator · FAQ · Updates · Comments · Community`.
Our translation, with what backs each one. This table is the spine of §5.

| Reference tab | Inverge tab | Backed by | Verdict |
|---|---|---|---|
| Campaign (story + sticky TOC + support rail) | **The plan** | `story` + `risks` on the contract | Build with a generated TOC, same as idea detail. Two sections are platform-mandated, not author choice. |
| Rewards | **Delivery stages** — and it is the default tab | `milestones` + derived state | **This is the tab the product exists for, so it leads.** |
| (Rewards, as the reference means it) | **Rewards**, fourth | `rewards` on the contract | Built. Optional per FR-301. Takes the scarcity line and the per-tier delivery date; refuses add-ons and stretch goals. Sits behind the stages because the stages are what is being bought. |
| Creator | **Creator** | `PublicCreator` + `CreatorProfile` track record | Build. Highest-value trust surface in the reference. Invert two of its choices — see §5.3. |
| FAQ | **How this works** | Nothing. Platform-authored, derived from the SRS | Build as platform copy. Creator-authored FAQ stays API ask 9. |
| Updates | **Timeline** | `milestones` + `receipts` + `launchedAt` | Build the dated spine now. Creator-authored update posts stay API ask 8. |
| Comments | link out to the idea's discussion | `GET /ideas/:id/comments` | Do not build a second thread. A campaign's questions belong on the idea that carries the audience. |
| Community (geography, new vs returning) | **nothing public** | creator-only aggregates | Refuse for now. Needs its own endpoint *and* its own privacy pass (gaps §11). |

Two things the reference does that we deliberately invert:

- **"Marked as fulfilled" is creator self-report.** Ours is not. A completed campaign is a chain of
  approved stages, so the label is `All 4 stages delivered` and it links to the receipts.
- **The Updates gate is a growth device.** "Back this project to read" over a milestone proof would be
  indefensible when the proof is the thing backers vote on. Milestone proof is public, always
  (teardown §5.5).

---

## 3. Recommendations, ranked by value per hour

1. **Give the catalogue a lifecycle spine (F1).** Segment by what a campaign is *doing* — raising,
   delivering, delivered, not delivered — as linkable filters, and lead with a lane of
   **stages under review this week**. That lane has no analogue anywhere in the reference and it is
   the only page on the internet where you can watch staged escrow being audited in public. It is
   the catalogue's reason to exist.
2. **Put FR-801 at the top of the catalogue (F2).** Four figures — held, released, returned, delivered —
   with one line saying they come from receipts, not from our records. Cheap, and it is the argument.
3. **Build the Creator tab (F3).** Track record is the durable, un-fakeable signal the objection model
   needs backers to weigh, and it is the one screen where a creator's *previous* campaign outcomes
   change how the current one reads.
4. **Build the timeline (F3).** A campaign's spine is dated events, every money-moving one of which
   carries a receipt. It answers "what has actually happened here" in one screen and it is free.
5. **Build the campaign builder (F6).** Four steps, one pure validation module, a live preview of the
   backer-facing result. **UI only — no request is made at any point.** `POST /ideas/:id/convert` is
   the call it will eventually make, at the end of step three, and it is one line in one file when the
   time comes. The flow ends at a saved draft, because curation (FR-304) and the application fee
   (FR-311) do not exist.
6. **Make the funding panel a sticky rail (F5).** One structural change; makes campaign and idea detail
   read as one product.
7. **Ship "How this works" as platform FAQ (F4).** Eight questions, an accordion, and an escape hatch to
   the idea discussion. No backend.
8. **Render `DRAFT`/`IN_REVIEW` for the owner only (F7).** A status banner plus a checklist of what is
   still needed. Non-owners get `notFound()`, because an unpublished campaign is not public.
9. **Disclose the Flexible Funding ladder in the builder (F8).** The option renders, disabled, naming the
   tier that unlocks it. An eligibility ladder a creator cannot see is not an incentive.

Not recommended, recorded so it is not re-proposed: a public community tab, add-ons, stretch goals, a
second comment thread on campaigns, a campaign-level search, and any surface that renders
`activeStrikes`.

**Reward tiers were reversed into scope during the build** (Aug 2026). They are optional in FR-301 and
the original exclusion was a scoping call, not a prohibition. The boundary that matters is not whether
they exist but what they may touch: **a reward never releases money, never gates a tranche and never
accelerates one.** The builder puts them after the stages and says so in place, and the backer-facing
tab repeats it, because a creator who thinks a reward date is a stage will write dates they cannot
keep and a backer who thinks so will object to the wrong thing.

---

## 4. Route map

| Route | Render | Data | Auth |
|---|---|---|---|
| `/campaigns` | Server, dynamic | provisional list; fixtures | public |
| `/campaigns?status=&category=&region=&sort=` | Server | same, filtered in the client module | public |
| `/campaigns/[id]` | Server + client islands | provisional detail; fixtures | public; `DRAFT`/`IN_REVIEW` owner-only |
| `/campaigns/[id]?tab=` | Server | same | as above |
| `/campaigns/new` | Server shell + client form | fixtures; nothing is written (ask 4 for the real idea list) | required |

All catalogue state lives in search params so a filtered view is linkable and server-rendered. Tabs are
routes, not widgets — same rule as idea detail.

---

## 5. What gets built

### 5.1 Catalogue (`/campaigns`)

Top to bottom. Four module shapes, reused — the teardown's lesson from an 11,700px homepage (§2).

1. **Header** — title, one line of positioning, and the FR-801 figure band: `held in escrow`,
   `released to creators`, `returned to backers`, `campaigns delivered`. One caption underneath naming
   the source. Figures are derived from the same receipts the cards are, so they cannot disagree.
2. **Under review right now** — the differentiator lane. Every campaign with an open objection window,
   each showing the stage, the amount at stake and days left. Empty state is a sentence, not a gap.
3. **Filter bar** — status segment (`All · Raising now · Delivering · Delivered · Not delivered`),
   category, region, sort (`Closing soon · Newest · Most backed · Most delivered`). Writes to search
   params. Reuses the idea feed's filter idiom so the two surfaces do not diverge.
4. **Grid** — `CampaignCard` at the existing card scale, 3-up. Result count states plainly what is in it.
5. **Closing soon** — a lane, only when something is within 7 days of its deadline.
6. **Delivered in full** — a lane of `COMPLETED` campaigns. This is our "success stories" module
   (teardown §2 row 9) and every card in it can cite a receipt.
7. **Creator entry point** — the existing verification card, kept, moved to the foot.

Failed campaigns are never hidden, in any view, including "All". A visible failure is the proof the
guarantee works.

### 5.2 Detail (`/campaigns/[id]`)

**Above the fold**, in the reference's order (teardown §4 band 2): the pitch video left, the funding
panel right as a sticky rail at `lg` and a block above the story below it.

The video never autoplays and loads no bytes until the reader presses play — the poster frame is all
that ships on first paint. These pages are read on mid-range Android over metered data, and a
preloaded video would be the most expensive thing above the fold.

The funding panel, top to bottom:

meter → raised of goal → backers → days left → primary action (disabled, with a plain reason) →
share → fine print naming the exact deadline and the all-or-nothing rule.

Then: owner-only status banner if `DRAFT`/`IN_REVIEW` → refund notice if a stage failed → trust strip →
tabs.

**Tabs**, in this order, with counts wherever we can render one:

| Tab | Contents |
|---|---|
| `stages` *(default)* | `MilestoneTracker`, then the open `ObjectionWindow` if there is one, then per-stage detail with the full proof bundle for every stage that has one — released stages included, not just the open one. |
| `plan` | Generated TOC + story in the playbook's order + the two mandated sections + the working-capital disclosure card. |
| `creator` | Profile, verification, track record, other campaigns with derived outcome labels, and their validated idea. |
| `timeline` | Every dated event on the campaign: launched, funding closed, working capital released, each stage claimed, each window closed, each release, each failure, each refund. Money events carry a receipt; the rest do not, and the difference is visible. |
| `receipts` | `ReceiptTimeline` as built, plus a summary line: released to date, still held, returned. |
| `faq` | Eight platform questions in an accordion, plus the escape hatch to the idea's discussion. |

`stages` stays the default. The reference leads with the story because the story is what it sells; we
lead with the mechanic because the mechanic is what we sell.

### 5.3 Creator tab, specifically

The reference's stat row is `13 created projects / 22 backed projects`, `Jul 29 2026 last login`,
`Oct 2016 account created`. Ours, with the two inversions:

- **Track record, as fact.** `2 campaigns delivered`, `8 of 8 stages released`, `Member since April 2025`,
  and the tier (Starter / Trusted / Established) rendered as a permissions ladder with its meaning
  spelled out, never as flattery. No "Backer Favorite", no rosette.
- **Never render `activeStrikes`.** Track record affects ranking; it must never become a public scarlet
  letter (gaps §1). A demotion shows up as a lower tier, and that is all.
- **Last login is not rendered.** It is a liveness signal on Kickstarter and a privacy leak on a product
  where the creator may be an individual in a small market.
- **Other campaigns** carry a derived outcome label — `All 4 stages delivered`, `3 of 4 stages delivered`,
  `Raising now` — never a self-reported fulfilment badge.

### 5.4 Creator flow (`/campaigns/new`)

Four steps, one screen each, with a live preview of the backer-facing result. Every rule below is a
requirement, not a preference, and each is enforced in `lib/campaigns/campaign-draft.ts` — a pure
module with no I/O, mirroring how `inverge-api` keeps `pledge-weighting.ts` and `insights-compute.ts`
separate from services.

| Step | Contents | Rules enforced |
|---|---|---|
| 1. Which idea | Pick from the creator's ideas that cleared validation. Ideas that have not are listed with what is still missing, not hidden. | FR-204 — the gate. The API rejects with 403 if it is not met, so the UI must not offer it. |
| 2. The raise | Campaign type, token, target amount, deadline, working capital % | FR-305 all-or-nothing; FR-306 tier gate on Flexible Funding; FR-503a working capital 0–25%, disclosed |
| 3. The stages | 2–6 milestones: title, deliverable, tranche %, evidence definition. Running total with the remainder stated. | FR-301 count; FR-302 sum to exactly 100 |
| 4. Rewards | Optional tiers: name, pledge amount, what they get, estimated delivery, cap, items, posting | FR-301 rewards optional. Nothing here touches escrow |
| 5. Review | Read-only summary, immutability warning, verification requirement, application fee disclosure, submit | FR-303 immutable once published; FR-103/104 verification; FR-311 fee |

Step 4 ends at a saved draft, because FR-304 curation and FR-311 the fee do not exist. **Nothing is
written**: these screens are UI only, and the convert call goes in at the end of step 3 when the
contract is wired.

Two rules the builder enforces that are not in the table above:

- **A pitch video is required to publish a campaign.** Publishing an *idea* stays free and
  frictionless and requires nothing; a campaign asks strangers for money, and a creator who will not
  spend two minutes explaining the plan in their own voice is asking for a lot on very little. It is
  the reference's highest-value above-the-fold element and the one thing it does that we had no
  answer to.
- **A campaign may be raised without a validated idea.** The default sequence is still idea →
  validation → campaign and everything is built around it, but some creators arrive with an audience
  already and refusing them refuses a real case. The option states its cost in place: no supporters
  carried over, no validation evidence on the page, and the creator writes the title, summary, topic
  and region themselves. It is never presented as equivalent.

Two things this screen must not do: mention a wallet, a chain or a signature anywhere (conventions §1),
and mention verification anywhere except step 4 (copy deck §5.6 of the sibling brief — verification lives
on the path to receiving money and nowhere else).

---

## 6. Component inventory

New, under `components/campaigns/`:

| Component | Job |
|---|---|
| `CampaignFilters` | Status segment, category, region, sort. Writes search params. |
| `EscrowSummary` | The FR-801 figure band. Four `Stat`s and one caption. |
| `UnderReviewLane` | Open objection windows across all campaigns, with what is at stake. |
| `CampaignLane` | Horizontal scroller, same idiom as `FeedLane`, for closing-soon and delivered. |
| `CampaignFundingPanel` | The sticky rail: meter, figures, disabled action, fine print. Extracted from `CampaignHeader`. |
| `MilestoneDetail` | Per-stage expanded row: deliverable, evidence definition, proof bundle, receipt, objection aggregate. |
| `MilestoneProof` | The proof bundle itself. Public, never gated. Used by `MilestoneDetail` and `ObjectionWindow`. |
| `CampaignTimeline` | The dated spine. Money events carry a receipt; process events do not. |
| `CampaignFaq` | Eight platform questions, accordion, escape hatch. |
| `CampaignCreator` | The creator trust surface. |
| `CampaignStatusBanner` | Owner-only `DRAFT`/`IN_REVIEW` state. |
| `CampaignRisks` | The two mandated sections, extracted from the page. |

New, under `components/campaigns/new/`: `CampaignBuilder` (client shell + step state), `StepIdea`,
`StepRaise`, `StepStages`, `StepReview`, `BuilderPreview`.

New, under `lib/campaigns/`: `campaign-draft.ts` (pure validation and derivation for the builder),
`campaign-stats.ts` (pure aggregation for the escrow summary and the outcome labels), `convert-api.ts`
(the live `POST /ideas/:id/convert` call, the only non-fixture path in the domain).

Reused as-is: `Card`, `Meter`, `Pill`, `Tabs`, `Timeline`, `Stat`, `Amount`, `Count`, `Avatar`,
`Accordion`, `EmptyState`, `Skeleton`, `Field`, `TxLink`, `MilestoneTracker`, `ObjectionWindow`,
`ReceiptTimeline`, `RefundNotice`, `TrustStrip`, `CampaignCard`.

---

## 7. Copy deck

Additions to [`ideas-campaigns-brief.md`](./ideas-campaigns-brief.md) §5, which stays in force. UK
English, plain language, no em dashes in rendered copy. Every string renders exactly as written.

### 7.1 Catalogue

- Title: `Campaigns`
- Positioning: `Ideas that cleared validation and went on to raise. Money is released in stages, and backers review each stage before it pays out.`
- Escrow band labels: `Held in escrow` · `Released to creators` · `Returned to backers` · `Campaigns delivered`
- Escrow band caption: `Every figure here comes from the receipts on each campaign, not from our own records.`
- Under-review lane heading: `Stages under review right now`
- Under-review lane blurb: `Backers are reviewing what was delivered on these stages. Nothing is released until the window closes.`
- Under-review lane empty: `No stage is under review this week. When one is, it appears here while backers review it.`
- Status filters: `All` · `Raising now` · `Delivering` · `Delivered` · `Not delivered`
- Sort: `Closing soon` · `Newest` · `Most backed` · `Most delivered`
- Result count: `4 campaigns` · filtered: `2 campaigns raising now`
- Closing-soon lane: `Closing soon`
- Delivered lane: `Delivered in full`
- Filtered empty: `No campaigns match those filters yet.` + `Clear filters`

### 7.2 Detail

Existing §5.4 strings stand. Additions:

- Share row: `Share this campaign`
- Tabs: `Delivery stages` · `The plan` · `Creator` · `Timeline` · `Receipts` · `How this works`
- Receipts summary: `Released so far` · `Still held` · `Returned to backers`
- Stage detail heading: `What was agreed` · `What was delivered`
- Evidence line: `Agreed at the start of the campaign as proof for this stage:`
- Proof missing: `Nothing has been submitted for this stage yet.`
- Timeline heading: `Everything that has happened`
- Timeline caption: `Money movements carry a receipt. Everything else is a dated record of the process.`
- Discussion escape hatch: `Questions about this campaign? Ask on the idea it came from.`
- Owner banner, draft: `This campaign is a draft. Only you can see it.`
- Owner banner, in review: `This campaign is with our reviewers. Only you can see it until it is approved.`

### 7.3 How this works — the eight questions

1. `When does the creator actually get the money?` — `In stages. A share is released when funding closes so work can start, and each stage after that releases only when backers have had a week to review what was delivered.`
2. `What is the money released before any stage is delivered?` — `A working capital share, capped at a quarter of the raise and fixed before anyone backs the campaign. It exists so a creator is not funding the first stage out of pocket. It is disclosed on every campaign and it is not part of what gets returned if a later stage fails.`
3. `Who decides whether a stage was delivered?` — `Backers do. When a creator submits proof, a seven day window opens. If objections worth less than 30% of what was contributed are raised, the stage releases. If more, it does not.`
4. `Can one large backer block a stage on their own?` — `No. Objections are weighted by how much a backer put in, and no single backer counts for more than 15% of the total.`
5. `What happens to my money if a stage is not delivered?` — `The money that has not yet been released is returned to everyone who funded the campaign, in proportion to what they put in. Stages already delivered are not clawed back.`
6. `Can the creator change the stages after launch?` — `No. The stages, what each one delivers, what proof will be submitted and what share of the money each releases are fixed when the campaign is published, and a record of those terms is kept so they can be checked later.`
7. `What if the campaign does not reach its goal?` — `Nothing is charged. Money is only collected if the campaign reaches its goal by its deadline, and every backer can withdraw what they put in if it does not.`
8. `What does Inverge take?` — `A share of each stage when it is released, and nothing before that. If a stage is never released, we are not paid for it either.`

Escape hatch: `Still have a question?` + `Ask the creator on the idea`

### 7.4 Builder

- Title: `Turn this idea into a campaign`
- Steps: `Which idea` · `The raise` · `The stages` · `Review`
- Preview heading: `This is what backers will see`
- Idea step, not ready: `This idea has not cleared validation yet.` + what is missing
- Idea step, empty: `You do not have an idea that has cleared validation yet.` + `Browse your ideas`
- Target help: `What do you need to build every stage below? Backers see this figure against what has been raised.`
- Deadline help: `Campaigns are all or nothing. If the goal is not reached by this date, nothing is charged and every backer keeps their money.`
- Working capital help: `The share released as soon as funding closes, so you are not funding the first stage yourself. Up to 25%. Backers see this figure before they back you.`
- Stage count help: `Between two and six stages. Each one names what will exist, how it will be proved, and what share of the money it releases.`
- Tranche running total: `82% allocated. 18% still to assign.` · complete: `100% allocated.`
- Tranche error: `Stage shares must add up to exactly 100%.`
- Evidence help: `What will you submit to show this stage is done, and where will it come from? Backers agreed to judge this stage on it.`
- Immutability warning: `Once this campaign is published, the stages, their proof and their shares cannot be changed. Backers are agreeing to these terms, not to a plan that can move.`
- Verification line: `Creators receive money, so we verify who you are first. This is required before you can launch a campaign, never to publish an idea.`
- Fee line: `Submitting for review costs a one off fee. It is not refundable, and it is charged whether or not the campaign is approved.`
- Submit disabled: `Review is not open yet. Your draft is saved and nothing is charged.`
- Convert success: `Your campaign is saved as a draft.`

---

## 8. State matrix

| Route | Loading | Empty | Error | Gated |
|---|---|---|---|---|
| `/campaigns` | Escrow band + 6 card skeletons at final dimensions | §7.1, per filter and unfiltered | §5.2 of the sibling brief + retry | never |
| `/campaigns/[id]` | Header, rail and tracker skeleton | per-tab empties | retry | `DRAFT`/`IN_REVIEW` → `notFound()` for non-owners |
| `/campaigns/new` | idea list skeleton | `You do not have an idea that has cleared validation yet.` | field-level on blur, plus one submit-level error | sign-in required, return to the form after |

---

## 9. Hard rules

Additions to conventions §1 and the sibling brief §7. A PR that breaks one does not merge.

1. **Failed campaigns are never hidden**, in any list, filter or sort. Including the default view.
2. **Milestone proof is public.** No gating of a proof bundle behind backing, sign-in, or anything else.
   Creator commentary may be gated later; the thing backers judge may not.
3. **Objection data is aggregate.** `objectionWeightPct` against the threshold, never a per-backer
   identity, count of objectors, or reason attributable to a person.
4. **Percentages are stated, never celebrated.** A card shows its percentage of goal, and over-target
   shows how far past the goal it went, because both are useful. What does not appear is the
   reference's spectacle: no "1,952% funded", no starburst, no "funded in five minutes", no
   overfunding leaderboard.
4a. **The two escrow bases are not interchangeable.** The upfront is a share of the **target**; the
   stages divide the **raise less the upfront**. Upfront plus every tranche equals the raise exactly,
   and any surface computing a stage amount uses `campaign-stats.ts` rather than doing it inline.
   Getting this wrong is not a rounding bug: pegging the upfront to the raise pays a campaign that
   overfunded ten times over more before verification than its entire plan was worth.
5. **Outcome labels are derived, never self-reported.** `All 4 stages delivered` comes from counting
   released stages. There is no field a creator can set to claim it.
6. **`activeStrikes` never renders.** Anywhere. A demotion is visible as a lower tier and nothing more.
7. **No live ticking countdown.** Days, computed on the server at render time (conventions §9.4).
8. **No component invents a campaign endpoint.** Reads go through `campaigns-api.ts`; the one live
   write goes through `convert-api.ts`. Nothing else calls the API in this domain.
9. **The builder never mentions verification outside step 4**, and never mentions a wallet, chain, gas,
   address or signature at all.
10. **Every amount through `Amount`, every count through `Count`, every currency explicit.**

---

## 10. Build order

One stage per commit segment, each independently reviewable.

| Stage | Contents |
|---|---|
| 0 | This brief; new API asks filed in both repos |
| 1 | Fixture expansion to a reviewable catalogue: eight campaigns covering every public status and all six milestone states |
| 2 | `lib/campaigns/campaign-stats.ts`, filters and sort in `campaigns-api.ts` |
| 3 | Catalogue: escrow band, under-review lane, filters, grid, lanes, states |
| 4 | Detail: sticky funding rail, tab set, per-stage detail with proof, risks extraction |
| 5 | Creator tab, timeline tab, how-it-works tab |
| 6 | Owner-only `DRAFT`/`IN_REVIEW` banner |
| 7 | `lib/campaigns/campaign-draft.ts` (pure rules, no client) |
| 8 | `/campaigns/new` builder, four steps, live preview, dev-fill |

---

## 11. New API asks

Filed against [`campaign-data-contract.md`](./campaign-data-contract.md) §4 and
`inverge-api/docs/web-ui-api-gaps.md`. Additive, all of them.

| # | Ask | Unblocks | FR |
|---|---|---|---|
| 12 | Platform escrow aggregates: total held, released, refunded, and campaign counts by status, from the indexer | The FR-801 band on the catalogue. Today it is summed client-side from fixtures, which will not scale past one page of campaigns | FR-801/803 |
| 13 | Campaign list filters and sort as query params (`status`, `category`, `region`, `sort`), matching the feed's idiom | Catalogue filtering server-side rather than over-fetching | — |
| 14 | Creator's campaign history on the public creator projection: per-campaign title, slug, status, stages released of total | The Creator tab's "other campaigns" block | — |
| 15 | `objectionWindowDays` and `objectionThresholdPct` as read-only platform params (duplicate of gaps item 10, restated because the builder and the FAQ both hard-code them) | Rendering the rule instead of the constant | FR-603 |
| 16 | Campaign status transitions for the owner: `POST /campaigns/:id/submit`, plus `GET /campaigns?mine=true` including `DRAFT` | Step 4 of the builder, and the creator's view of their own draft | FR-304/311 |
| 17 | **Campaign media**: `videoUrl` (required on publish), `videoPosterUrl` and `coverImageUrl`, plus upload paths | The above-the-fold player and every card thumbnail. Cards fall back to the deterministic cover meanwhile, which looks deliberate but is not what the reference's visual engine runs on | — |
| 18 | Campaigns without a backing idea: a create path that does not go through `POST /ideas/:id/convert`, carrying their own title, summary, category and region | The standalone path in the builder. Everything else about such a campaign is identical | — |

Items 12 and 14 are the ones that change what renders. 13 is performance. 15 is correctness of copy.
16 completes the flow.

---

## 12. Definition of done

Conventions §13 in full, plus:

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm build` clean.
- [ ] Works at 320, 768, 1024, 1440. No horizontal scroll at any width, including the lanes.
- [ ] Every figure carries its currency. No USD value renders with a ₦.
- [ ] Failed campaigns appear in the default catalogue view.
- [ ] Every milestone with a claim shows its proof, in every state, ungated.
- [ ] No per-backer objection data renders anywhere.
- [ ] Outcome labels are derived in `campaign-stats.ts` and nowhere else.
- [ ] The builder's tranche total is enforced at exactly 100 before convert is callable.
- [ ] Loading, empty and error states present on every route in §8.
- [ ] `prefers-reduced-motion: reduce` gives a still, complete page. No countdown animates.
- [ ] No wallet, chain, gas, address or signature language. Receipts only.
- [ ] All copy from §7 verbatim. Real Nigerian and West African names in fixtures.

---

## 13. Open questions

Each has a default so the build is not blocked.

| # | Question | Default |
|---|---|---|
| 1 | Should campaigns join `GET /feed` (`type=all`) so one surface carries both, or stay a separate catalogue? | Separate catalogue. The contract already reserves the discriminator, so `IdeaCard` switching on `objectType` remains the path when the feed opens up. |
| 2 | Is the escrow band honest while it sums fixtures? | It renders, captioned as coming from receipts, and ask 12 replaces the maths. If ask 12 slips past launch, the band ships with real per-campaign receipts summed server-side, which is correct, just not scalable. |
| 3 | Does the builder let a creator save and resume a draft mid-flow? | No. Convert is one call at the end of step 3; steps 1–3 are client state. Resume needs ask 16. |
| 4 | Flexible Funding in the builder: hidden, or shown disabled? | Shown disabled with the tier requirement named (F8). An eligibility ladder nobody can see is not an incentive. |
| 5 | Does a campaign get its own discussion thread? | No. It links to the idea's thread. Splitting the conversation across two objects splits the audience that validated the idea. |
| 6 | ~~What base do the stage shares use?~~ | **Decided.** Upfront off the target, stages off the raise less the upfront. Two alternatives were considered and rejected: surplus held back for the final stage starves the work of the money raised to do it, and deducting the upfront from stage one goes negative whenever the upfront exceeds that stage's share. |
| 7 | Should the final stage be structurally different, since it confirms delivery? | It is the last money paid and is labelled as the delivery stage, but it carries no special share. Holding surplus back for it was rejected under question 6. |
