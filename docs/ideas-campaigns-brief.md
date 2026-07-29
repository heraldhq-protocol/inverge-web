# Ideas and Campaigns — Build Brief

> Build spec for the logged-in product surfaces: the discovery feed, idea detail, the idea lifecycle
> screens, and campaign detail. Sibling to [`landing-brief.md`](./landing-brief.md), which covers the
> marketing site and whose file allowlist and "no live data" rules do **not** apply here.
>
> Read first: [`conventions.md`](./conventions.md) (the rulebook), [`app-mockup-kit.md`](./app-mockup-kit.md)
> §3–§6 (art direction, shell, content rules), [`reference-teardown-kickstarter.md`](./reference-teardown-kickstarter.md)
> (where these layouts come from), [`pitch-narrative-playbook.md`](./pitch-narrative-playbook.md)
> (what goes inside a pitch, and in what order), [`feed-api.md`](./feed-api.md) (the feed contract),
> [`campaign-data-contract.md`](./campaign-data-contract.md) (the provisional campaign contract).
>
> Branch: `feat/ideas-campaigns-ui`.

---

## 1. Scope

### 1.1 What exists today

The Phase-0 scaffold is four thin pages wired to the API with none of the design system applied:

| Route | File | State |
|---|---|---|
| `/ideas` | `src/app/(validate)/ideas/page.tsx` | `GET /ideas` list, `divide-y` rows, `foreground/*` tokens that are not in the theme, no cards, no meter | 
| `/ideas/[id]` | `src/app/(validate)/ideas/[id]/page.tsx` | detail with three metric boxes and three prose blocks; no survey, no comments, no creator, no gate breakdown |
| `/ideas/new` | `src/app/(validate)/ideas/new/page.tsx` | create form; predates the FR-270 structured pitch fields |
| `/campaigns` | `src/app/(campaign)/campaigns/page.tsx` | placeholder plus the KYC/KYB verify cards |
| `/review` | `src/app/(admin)/review/page.tsx` | placeholder |
| `/verify`, `/kyc/callback` | `(validate)/verify`, `app/kyc/callback` | working, leave alone |

Four facts to internalise before touching any of it:

1. **There is no app shell.** `(validate)`, `(campaign)` and `(admin)` have no `layout.tsx`, so they
   render bare inside the root layout: no nav, no sidebar, no account menu.
   `src/components/nav.tsx` is orphaned — nothing imports it; the marketing site uses
   `components/marketing/nav.tsx`.
2. **The scaffold pages use tokens that do not exist.** `text-foreground/60`, `bg-background`. The
   theme defines `ink`, `ink-muted`, `paper`, `surface`, `border`, `accent-*`, `forest`. Those
   classes have been silently doing nothing.
3. **`/ideas` reads the wrong endpoint.** `GET /ideas` is the simple list; `GET /feed` is the ranked
   discovery surface and supersedes it ([`feed-api.md`](./feed-api.md)).
4. **Money is rendered in the wrong currency.** `<Amount>` defaults to NGN; `askAmount` and
   `weightedPrePledgeTotal` are USD. See §7.4.

### 1.2 Files this feature may create or modify

```
src/app/(app)/layout.tsx                    NEW  the app shell
src/app/(app)/feed/…                        NEW  discovery
src/app/(app)/ideas/…                       MOVED from (validate), rebuilt
src/app/(app)/campaigns/…                   MOVED from (campaign), rebuilt
src/app/(app)/dashboard/…                   NEW  creator home
src/components/app/…                        NEW  shell parts: sidebar, topbar, account menu
src/components/ideas/…                      cards, meter, action panel, survey, thread
src/components/campaigns/…                  NEW  header, milestone tracker, receipts, refund notice
src/components/ui/…                         new primitives only (§4.1)
src/lib/feed/…                              NEW  feed client + hook
src/lib/campaigns/…                         NEW  provisional client + fixtures
src/lib/ideas/…                             NEW  survey + comments clients, gate maths
src/lib/format.ts                           NEW  currency/percent/date helpers
src/app/globals.css                         tokens only if a genuine gap appears
docs/…                                      this brief and its companions
```

Do not touch: `(marketing)/*`, `components/marketing/*`, `(auth)/*`, `components/auth/*`,
`components/kyc/*` (reuse as-is), `lib/kyc/*`, `lib/content/*`, `lib/site.ts`, `lib/og.tsx`.

### 1.3 Out of scope

Search (no endpoint), notifications UI, reward tiers (FR-301 optional, not launch), stretch goals
(never), on-ramp checkout (FR-402, Phase 2), objection *submission* (FR-603/604 needs on-chain
weight), admin curation queue beyond its existing placeholder, public aggregate/community views
(creator-only data today), any wallet or chain surface (permanently).

---

## 2. The app shell

**Decision: left sidebar plus top bar, exactly as [`app-mockup-kit.md`](./app-mockup-kit.md) §5.**
Locked once here, identical on every logged-in screen, and it is the first thing built because
everything else inherits its content width.

- **Sidebar** — 240px, `bg-forest`, leaf mark plus "inverge" at top. Items: Discover, My ideas,
  Campaigns, Receipts, Settings. Active item gets a pale accent fill **and** a solid 3px accent left
  edge (never colour alone, conventions §5.2). Collapses to an off-canvas drawer below `lg`.
- **Top bar** — 64px on `paper`: page title or breadcrumb left; right side holds a search field
  (rendered disabled with the title "Search is coming soon" until an endpoint exists, or omitted
  entirely — do not ship a box that silently does nothing), a notification bell only once there is
  something to put in it, and a 32px avatar with the account menu.
- **Content** — `paper`, max 1200px, 32px gutters, white cards for grouped content. Section rhythm
  compresses to 24–32px, not the marketing site's 96px (app kit §3.2).
- Same shell for backer and creator screens. Nav items differ by role; the chrome does not.
- `(auth)` keeps its own layout and gets no shell (app kit §J [must]).

Route group renames to `(app)` so the shell scopes cleanly and the URL is unchanged. `/ideas`,
`/campaigns`, `/verify` keep their paths.

**Mobile floor.** These screens are read on mid-range Android on metered data. The shell drawer, the
feed grid, the sticky action panel and the milestone tracker each need an explicit small-screen
design, not a `lg:` afterthought. The action panel becomes a bottom-anchored bar; the milestone
tracker becomes a vertical list. Nothing may scroll horizontally at 320px (conventions §8).

---

## 3. Route map

| Route | Render | Data | Auth |
|---|---|---|---|
| `/feed` (and `/` for signed-in) | Server, dynamic | `GET /feed` | optional; token → personalised |
| `/ideas` | redirect → `/feed` | — | — |
| `/ideas/[id]` | Server shell + client islands | `GET /ideas/:id`, `GET /ideas/:id/survey`, `GET /ideas/:id/comments`, `GET /feed?category=` for the similar rail | public |
| `/ideas/[id]/insights` | Server + client charts | `GET /ideas/:id/insights` | creator only, 403 → not-found |
| `/ideas/new` | Client form | `POST /ideas` (structured pitch + `region` + `creatorPrePledgeTarget`) | required |
| `/ideas/[id]/edit` | Client form | `PATCH /ideas/:id` | owner, draft only |
| `/dashboard` | Server + client | `GET /ideas` filtered to owner (see §7.5), `GET /kyc/status`, `GET /kyb/status` | required |
| `/campaigns` | Server | provisional list; fixtures | public |
| `/campaigns/[id]` | Server + client islands | provisional detail; fixtures | public |
| `/onboarding/interests` | Client | `PUT /me/interests` | required |
| `/verify` | unchanged | KYC/KYB | required |

`/feed` state (category, region, sort) lives in the URL as search params so a lane is linkable and
the server can render it. `excludeIds` accumulates client-side only, because it is a session
artefact and belongs nowhere near a shareable URL.

---

## 4. Component inventory

Naming and file rules per conventions §4: `kebab-case.tsx`, named exports, `PascalCase` components,
one per file, `ui/` never imports `lib/api`.

### 4.1 New `ui/` primitives

| Component | Notes |
|---|---|
| `Card` | Surface, hairline border, optional `tone` for the promoted variant. No shadow by default (app kit §4: elevation is used sparingly, never on every card at once). |
| `Meter` | The validation/funding bar. `value`, `max`, `cap`, `label`, `tone`. `role="progressbar"` with `aria-valuenow/min/max` and a text equivalent; 3:1 contrast on the track (conventions §8). Welded to the bottom edge of a cover when used on a card. |
| `Pill` | One size, three tones (`neutral`, `accent`, `warn`). Every tone carries a shape or text marker as well as colour. |
| `Chip` | Selectable variant for interests: pale fill + solid border + check glyph when selected (app kit §J3). |
| `Avatar` | Image or initials fallback, 20/32/40px. Never a stock placeholder. |
| `Tabs` | Underlined tab bar with optional counts. Real `role="tablist"` semantics or plain links with `aria-current` when tabs are routes. Keyboard arrow navigation. |
| `Accordion` | FAQ and gate breakdown. `<details>/<summary>` unless a design need forces otherwise. |
| `Timeline` | Vertical dated events with a receipt slot per row. |
| `Skeleton` | Matches final dimensions (conventions §7). |
| `EmptyState` | Title, one line, one or two actions. No illustration, no emoji. |
| `Field` | Label above, inline error under, red-tinted wash on the field (app kit §6). Validation on blur, never while typing. |

`Amount`, `Count`, `Button`, `Container`, `Section`, `Eyebrow`, `Stat`, `TxLink` already exist.
`TxLink` needs its `foreground/*` classes corrected to theme tokens.

### 4.2 Feature components

**Discovery** — `components/ideas/`

| Component | Job |
|---|---|
| `IdeaCard` | The one card. `size: 'featured' \| 'grid' \| 'lane'`. Element order fixed per teardown §3. Switches on `objectType` so a campaign card drops in without a rewrite. |
| `IdeaCover` | `coverImageUrl` if present, else the deterministic typographic cover (teardown §9.2). |
| `ValidationMeter` | `Meter` plus the label. Capped at 100%. Shows the binding constraint, never a single blended number. |
| `ReasonChip` | The feed's `reason`. Exactly one per card, fixed position, always rendered. |
| `PromotedCard` | The distinct paid treatment. Wraps `IdeaCard`; label in the card header, never over the cover, never beside the meter. |
| `FeedHero` | Featured card + 2×2 grid (teardown §2 module 3). |
| `FeedGrid` | 3-up responsive grid, `Show me more` via `excludeIds`. |
| `FeedLane` | Horizontal scroller with heading, "Discover more" link, and a clipped last card. |
| `CategoryFilter` | Five categories from the feed enum, plus region. Writes to search params. |

**Idea detail** — `components/ideas/`

| Component | Job |
|---|---|
| `IdeaHeader` | Title, creator, published date, cover, attribute row. Title stays left-aligned. |
| `IdeaStoryToc` | Generated from the structured pitch sections, sticky at `lg`. Generated, not author-supplied, so every idea gets the same readable skeleton ([playbook §2](./pitch-narrative-playbook.md)). |
| `IdeaStory` | The pitch, in the playbook's order: problem, target user, current alternative and its shortfall, solution, ask breakdown, roadmap steps, risks once the field exists. Measure capped at ~68 characters; headings are typeset by us, never creator formatting. |
| `IdeaActionPanel` | Sticky rail in the reference's number order (teardown §4): meter, figures, actions, fine print. Bottom bar on mobile. |
| `GateBreakdown` | The four FR-204 criteria with have/need/met, from the same maths as `insights`. Accordion. |
| `SupportButton` | `POST/DELETE /ideas/:id/support`. Optimistic, idempotent. |
| `PrePledgeForm` | Amount + currency (USD/NGN). Mandated line beneath. Withdraw path via `DELETE`. |
| `SurveyForm` | Renders typed questions: RATING, TEXT, SINGLE_CHOICE, MULTI_CHOICE, BOOLEAN. One response per user, editable. |
| `SurveyResults` | Rating histogram and per-question aggregates. Creator sees all; public sees what the API exposes. |
| `CommentThread` | Flat list nested one level from `parentId`. Highlighted pinned first. Like/unlike. Tombstone row for removed comments. |
| `CreatorPanel` | Name, avatar, bio, tier, track record from `CreatorProfile`. Degrades without identity (teardown §9.1). |
| `SimilarIdeas` | `GET /feed?category=` lane, current idea excluded. |
| `TrustStrip` | Three sentences. Same component on idea and campaign detail. |

**Campaign** — `components/campaigns/` (all against the provisional contract)

| Component | Job |
|---|---|
| `CampaignHeader` | Title, creator, raised of target, days left, backers. `Meter` unbounded above 100. |
| `MilestoneTracker` | **The signature element.** Ordered milestones, tranche %, four states legible at once: released, under review with a countdown, upcoming, failed. Horizontal at `lg`, vertical below. |
| `ObjectionWindow` | The focal card: countdown, plain-language consequence, the submitted proof. Read-only at launch. |
| `MilestoneProof` | Proof bundle: images, text, links. Public, never gated. |
| `ReceiptTimeline` | Dated escrow events, one `TxLink` per row (FR-802). |
| `RefundNotice` | The failed state. Matter-of-fact, muted warm red, per-backer line plus receipt. |
| `CampaignRisks` | The two mandated sections: "Risks and challenges", "What happens if a milestone fails". |
| `FundingPanel` | Disabled at launch with a plain reason. No checkout, no wallet. |

### 4.3 `lib/`

`lib/feed/feed-api.ts` + `use-feed.ts` (owns `excludeIds` accumulation), `lib/ideas/ideas-api.ts`,
`survey-api.ts`, `comments-api.ts`, `lib/ideas/gate.ts` (pure gate maths, unit-testable),
`lib/campaigns/campaigns-api.ts` + `fixtures.ts`, `lib/format.ts`. Follow the `lib/kyc/` pattern:
fetch client plus hook, response types hand-declared in `lib/api/types.ts` until the API ships
response schemas.

---

## 5. Copy deck

Every string below is final and renders exactly as written. UK English. Plain language over product
vocabulary (app kit §6). No em dashes in rendered copy.

### 5.1 Idea card and panel

- Meter label: `68% to validation threshold`
- Interest figure: `Estimated interest` then the amount. **Never** "raised", "pledged", "committed".
- Supporters: `412 supporters`
- Window: `34 days left in validation` · near the end: `2 days left in validation`
- Threshold met: `Threshold met` · `Ready to raise`
- Actions: `Support this idea` · `Leave feedback` · `Pre-pledge`
- Under any pre-pledge control: `No money moves yet. This tells the creator you're in.`
- Withdraw: `Withdraw my pre-pledge`
- Promoted: `Promoted` · on hover/title: `A creator paid for this placement. It does not affect the validation numbers.`
- Featured: `Featured`
- Verified: `Verified creator`

### 5.2 Empty, loading, error

- Feed empty with filters: `No agriculture ideas yet. Yours would be the first.` + `Start an idea` / `Clear filters`
- Feed empty, unfiltered: `Nothing here yet. Be the first to publish an idea.`
- Comments empty: `No questions yet. Ask the creator anything about this idea.`
- Survey empty: `The creator has not added questions yet.`
- Error: `We could not load this just now. Try again.` + a retry wired to `unstable_retry()`. Never a code, never a stack trace.
- Not found: `We could not find that idea. It may have been removed.`

### 5.3 Trust strip

Three sentences, on idea detail and campaign detail, non-dismissable:

1. `Publishing an idea is free. Nothing is charged and no money moves while an idea is being validated.`
2. `Money for a funded campaign is released in stages, and only after backers have had time to review what was delivered.`
3. `If a stage is not delivered, the money still held is returned to backers automatically.`

### 5.4 Campaign

- Raised: `$3,600 raised of $5,000 goal`
- Deadline: `18 days left`
- All or nothing: `All or nothing. This campaign is only funded if it reaches its goal by 30 August 2026.`
- Milestone states: `Released` · `Under review` · `Upcoming` · `Not delivered`
- Objection window: `Backers have 4 days to review what was delivered. If enough object, this stage is not released and the money still held is returned.`
- Receipt link: `View receipt` (the only wording, `TxLink`)
- Refund heading: `Stage not delivered. Your money is being returned.`
- Refund line: `Your refund: $45 returned on 4 March.`
- Funding disabled: `Funding opens when this campaign is approved. Follow the idea to hear first.`

### 5.5 Publishing an idea, coaching copy

Per [`pitch-narrative-playbook.md`](./pitch-narrative-playbook.md) §4 and §5.2. Field help is
coaching, never scolding, and the claims line is compliance, not tone.

- Preview heading: `This is what backers will see`
- Problem field help: `Who has this problem, and how often? One sentence is enough.`
- Current alternative help: `What do they do today, and where does it fall short?`
- Ask breakdown help: `What does the money buy? A rough split is fine.`
- Roadmap help: `At least two dated steps. What will exist, and by when?`
- Risks help (once the field exists): `What is most likely to go wrong, and what would you do about it?`
- Claims guidance, shown once near the top: `Describe what you will build and who needs it. Do not promise anyone a financial return.`
- Quality coaching result: `Here is what would make this stronger.` Never `Your idea was rejected.`

### 5.6 Verification

One line, on the campaign submission screen only: `Creators receive money, so we verify who you are
first. This is required before you can launch a campaign, never to publish an idea.` Nothing about
verification appears on `/ideas/new` (app kit §C [must]).

---

## 6. State matrix

Every route ships all four. Not polish, the difference between a product and a demo
(conventions §7).

| Route | Loading | Empty | Error | Gated |
|---|---|---|---|---|
| `/feed` | 9 card skeletons at final dimensions | §5.2 | §5.2 + retry | never; discovery has no login wall |
| `/ideas/[id]` | header + panel skeleton, tabs inert | per-tab empties | retry | actions prompt sign-in in place, never a redirect |
| `/ideas/new` | — | — | field-level, on blur | sign-in required, return to the form after |
| `/ideas/[id]/insights` | chart skeletons | `Not enough data yet. Come back once a few people have responded.` | retry | 403 → `notFound()` |
| `/dashboard` | table + stat skeletons | `You have not published an idea yet.` + `Start an idea` | retry | sign-in required |
| `/campaigns/[id]` | header + tracker skeleton | — | retry | — |

---

## 7. Hard rules for this feature

Additions to conventions §1 and §13, specific to these screens. A PR that breaks one does not merge.

1. **`weightedPrePledgeTotal` renders only under the label "Estimated interest".** The raw
   `prePledgeTotal` is never returned by the API and must never be reconstructed.
2. **Paid placement is structurally separate.** `promoted` items get their own component and their
   own visual treatment, never a badge among badges, never adjacent to a validation number
   (FR-206a). At most one image overlay and one status pill per card
   ([teardown §7](./reference-teardown-kickstarter.md)).
3. **The `reason` chip is on every feed card, always.** Ranking that cannot explain itself is not
   shippable.
4. **Currency is explicit at every call site.** `askAmount`, `weightedPrePledgeTotal`, gate
   thresholds and campaign targets are USD. NGN renders only from a value captured in NGN. Fix
   `<Amount>`'s NGN default or pass `currency` everywhere; do not leave it implicit.
5. **`GET /ideas` has no owner filter.** The dashboard needs one; until then filter client-side from
   what the API returns and log the ask
   ([`campaign-data-contract.md`](./campaign-data-contract.md) §4). No fake counts.
6. **Ideas are never gated behind verification.** Verification language appears on the campaign
   submission path only.
7. **No wallet, chain, gas, network, address or signature language.** A reference is a receipt and
   `TxLink` is the only component near an explorer URL.
8. **No component invents a campaign endpoint.** Campaign reads go through
   `lib/campaigns/campaigns-api.ts`, which returns fixtures until the API exists.
9. **`'use client'` on leaves only.** The feed page, idea detail shell and story are Server
   Components; support buttons, forms, thread interactions and the account menu are the islands.
10. **Every amount through `Amount`, every count through `Count`.** No hand-formatted currency in
    JSX.

---

## 8. Build order

One stage per PR, each independently reviewable, each leaving `main` shippable. Checkpoint commit
per meaningful unit within a stage.

| Stage | Contents | Done when |
|---|---|---|
| 0 | This documentation set | Merged, AGENTS.md points at it |
| 1 | App shell: `(app)` group, sidebar, top bar, account menu, route moves, token cleanup, orphaned `components/nav.tsx` removed | Every existing app route renders inside the shell at 320px and 1440px |
| 2 | `ui/` primitives (§4.1) | Each renders in isolation, keyboard-reachable, contrast checked |
| 3 | `IdeaCard` at three densities, `IdeaCover`, `ValidationMeter`, `ReasonChip`, `PromotedCard` | A card grid renders from fixtures at every density with no layout shift |
| 4 | Feed: `lib/feed`, `/feed` page, `FeedHero`, `FeedGrid`, filters, "Show me more", loading/empty/error | Live against a running API, anonymous and signed-in, promoted slot visibly distinct |
| 5 | Idea detail: header, generated TOC, story, action panel, gate breakdown, trust strip, similar rail | Reads a real idea end to end; support and pre-pledge work; panel obeys the number order |
| 6 | Survey + comments tabs, `/ideas/new` rebuilt on the structured pitch | Publish, answer a survey, post and like a comment, all live |
| 7 | Creator dashboard + `/ideas/[id]/insights` | Creator sees their own ideas, gate progress, and support geography |
| 8 | Campaign detail against the provisional contract: header, `MilestoneTracker`, `ObjectionWindow`, `ReceiptTimeline`, risks | All four milestone states legible at once; fixtures only; one swap point |
| 9 | Refund state | Reads matter-of-fact, muted warm red, receipt present |
| 10 | Lanes and editorial modules, if still worth it | — |

Stages 1–2 block everything. Stage 4 blocks 5. Stage 8 does not block anything and can run in
parallel once 2 lands.

---

## 9. Definition of done

Conventions §13 in full, plus:

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm build` clean.
- [ ] Works at 320, 768, 1024, 1440. No horizontal scroll. Sidebar drawer traps focus correctly and
      returns it on close.
- [ ] Every figure carries its currency; no USD value renders with a ₦.
- [ ] Promoted slots are distinct, labelled, non-dismissable, and never adjacent to a validation
      number.
- [ ] Every feed card shows exactly one reason chip.
- [ ] "Estimated interest" is the only label on the weighted figure, site-wide.
- [ ] Meter has a text equivalent and passes 3:1 on its track.
- [ ] Loading, empty, error states present on every route in §6.
- [ ] `prefers-reduced-motion: reduce` gives a still, complete page. The countdown does not animate.
- [ ] No wallet, chain, gas, address or signature language. Receipts only.
- [ ] All copy from §5 verbatim. No placeholder names, no lorem, real Nigerian and West African
      names in fixtures.
- [ ] No new `'use client'` that could have been pushed further down.

---

## 10. Open questions

Recorded rather than guessed. Each one has a default so the build is not blocked.

| # | Question | Default until answered |
|---|---|---|
| 1 | Display identity: add `displayName`/`avatarUrl`/`bio` to the API, or ship without? | Components take an optional `creator` prop and degrade to initials. API ask filed. |
| 2 | Cover images: upload now or typographic covers only? | Deterministic typographic cover; `coverImageUrl?` accepted from day one. |
| 2b | Video, given the reported conversion gap ([playbook §6](./pitch-narrative-playbook.md))? | Not at launch. Filed behind the cover-image ask; opt-in load, never autoplay. |
| 2c | A one-line `summary`/hook field, or keep `problem` on cards? | `problem` stays on cards; `summary` filed as low priority for OG text and campaign headers. |
| 3 | Does the meter show the binding constraint or an average of the four gate criteria? | Binding constraint, with all four broken out in `GateBreakdown`. An average would hide the blocker. |
| 4 | Public community/aggregate views: new endpoint, or creator-only? | Creator dashboard only. |
| 5 | Search in the top bar: build against nothing, or omit? | Omit until an endpoint exists. A dead box is worse than no box. |
| 6 | Is `/` the feed for signed-in users, or does the landing page always win? | Landing page always wins; `/feed` is the product entry. Revisit after the shell lands. |
