# Reference Teardown — Kickstarter (July 2026)

> Structural analysis of the reference we are borrowing from for the idea feed, idea detail, and
> campaign surfaces. **We are borrowing information architecture, not aesthetics.** Kickstarter has
> sixteen years of iteration on "how do you lay out a page that asks a stranger for money," and that
> layout knowledge is worth taking. Its visual language, badge inflation, and money vocabulary are
> not, and several of its patterns are things Inverge is contractually unable to copy.
>
> Companions: [`conventions.md`](./conventions.md) is the rulebook, [`app-mockup-kit.md`](./app-mockup-kit.md)
> is the art direction for logged-in screens, [`ideas-campaigns-brief.md`](./ideas-campaigns-brief.md)
> is the build spec this teardown feeds, and [`campaign-data-contract.md`](./campaign-data-contract.md)
> is the provisional API the campaign screens are drawn against.

**Capture provenance.** Eight screenshots taken July 2026: the logged-out Kickstarter homepage (full
page), three homepage detail crops, and one live project — Gravel's "The Ultralight Toiletry Bag That
Actually Organizes" at US$406,808 of a US$10,000 goal, 5,238 backers, 17 hours to go — across its
Campaign, Rewards, Creator, FAQ, Updates, Comments, and Community tabs. Everything described below
was read off those images; where a dimension is stated it is an estimate from the capture, not a
number from Kickstarter's stylesheet.

---

## 1. The thesis, stated before the detail

Three things in the reference are worth more than everything else combined:

1. **The card is one artefact, repeated at three densities.** Featured (large, with description and
   tags), grid (compact, clamped title), and carousel (landscape). Same element order every time, so
   a user learns to read it once. Inverge should have exactly one `IdeaCard` with a `size` prop, and
   later exactly one card that switches on `objectType` for campaigns.
2. **The project page is a fixed above-the-fold contract plus tabs.** Media on the left, a funding
   panel on the right, a trust strip underneath, then tabs for depth. Nothing scrolls before the
   reader has seen the number, the deadline, and the primary action.
3. **The trust strip is the single best pattern on the site.** Three plain sentences, immediately
   under the fold, telling a first-time backer what the platform does and does not guarantee. It
   sits on every project page, is never dismissable, and never sells. Inverge's entire positioning
   is a guarantee, so this pattern matters more to us than it does to them.

And three things we explicitly refuse:

1. **Badge inflation.** A single card in the capture carries a "Project We Love" stamp, a green
   verified rosette, an "ENDING SOON" ribbon, a diagonal "MANGA" corner ribbon, and a "Funded in 5
   minutes!" flash. When everything is decorated, the one label that legally must be noticed — paid
   placement — cannot be. See §7.
2. **Percentage theatre.** 975%, 1,709%, 2,462%, 11,335% funded. Overfunding as spectacle is a
   Kickstarter growth mechanic. Inverge's meter answers a different question: has this cleared the
   bar that lets it raise money.
3. **Money vocabulary applied to intent.** "Pledged" on Kickstarter means a card was authorised. On
   an Inverge idea nothing has been authorised, so the same word would be a false statement about a
   financial commitment. §8 is the full translation table and it is not optional.

---

## 2. Homepage: the module inventory

The homepage is thirteen stacked modules in a 1,200px column. What matters is that only **four
module shapes** are in play, reused with different content. Learn the four, and the page is small.

| # | Module | Shape | Inverge verdict |
|---|---|---|---|
| 1 | Global chrome | Wordmark, centred search, "For creators", "Log in"; second row of 15 category links + "Discover" | **Adapt.** Five categories, not fifteen (feed enum). Search is Phase 2, no endpoint exists. |
| 2 | Hero banner | Centred one-liner, then a dark full-width banner: display headline, one pill CTA, photo bleeding right | **Reject for the app.** This is landing-page work and already shipped. The feed opens on content. |
| 3 | Featured + Recommended | Two columns: one large card left, 2×2 compact grid right, paginated | **Steal.** This is the feed's hero module. §3. |
| 4 | Editorial two-up | Two equal columns: image, left-ruled headline + blurb, outlined pill button | **Adapt, later.** Inverge has guides and blog posts in `lib/content/*` already; this is the bridge from feed to editorial. Phase 3 of the build. |
| 5 | Themed featured + grid | Module 3 again, scoped to a season/theme ("Kiss & Tell 2026") | **Steal the mechanic, defer the content.** Our version is a category lane, not a curated season. |
| 6 | Category carousel | Heading + "Discover more" link + ‹ › arrows, landscape cards, last card clipped to signal scroll | **Adapt.** Inverge's lanes are `category` and `region` filtered feed calls. Clipped last card is the right affordance and is free with `overflow-x`. |
| 7 | Editorial two-up on a grey band | Module 4 with a background tone change to break rhythm | **Steal the tone-break trick.** Cheap way to segment a long feed page without a divider. |
| 8 | "Home Stretch" carousel | Module 6, filtered to projects near their deadline | **Steal.** Direct analogue: ideas whose 90-day validation window is nearly closed. High-utility lane. |
| 9 | Success stories | 4-up editorial cards, image + 3-line headline, whole card is the link, no button | **Adapt, Phase 3.** Ours is "funded and delivered" case studies, and every one of them can cite a receipt. |
| 10 | "Near You" carousel | Module 6, geolocated | **Steal.** We already have `region` on ideas and `preferredRegions` on users, and the feed emits a `REGION` chip. |
| 11 | Interviews | 4 portrait cards, 3:4 photo + caption | **Reject.** Editorial-brand surface with no product job. |
| 12 | Creator corner | Eyebrow label, grey band, 2×2 text-only bordered cards with "Read more" | **Adapt.** Maps onto our guides. Text-only cards are the correct low-cost pattern for help content. |
| 13 | Footer | Four link columns, language + currency selects, giant wordmark, socials, app badges, legal row | **Already built** in `components/marketing/footer.tsx`. Note the currency select — see §8.4. |

**The lesson from the inventory:** an 11,700px homepage is four components and a content
configuration. If our feed page needs more than about six components we have over-built it.

---

## 3. The card, dissected

This is the most valuable artefact in the capture, so it gets the most detail. Element order is
identical at all three densities, top to bottom:

```
┌─────────────────────────────────┐
│  cover image, 3:2               │   overlay: at most one ribbon/stamp
│                                 │
├━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━┤   ← 4px progress bar, flush to the image's bottom edge
│ ◯ ✓ Title, up to two lines   🔖 │   avatar 20px · verified glyph · title · bookmark right
│    Creator name                 │   13px, muted
│    🕐 19 days left • 765% funded│   13px, muted, one line, bullet separator
│    Description, two lines       │   featured density only
│    [ Young Adult ] [ Folsom,CA ]│   featured density only — pill tags
└─────────────────────────────────┘
```

Observations worth carrying over:

- **The progress bar is welded to the image, not floating in the text block.** It reads as a
  waterline on the photo. It is the only chart on the card, it has no label, and at ≥100% it is
  simply full. Cheap, legible at 240px wide, and it survives a card with no other data.
- **One metadata line does four jobs**: time remaining, a clock glyph for scanability, a bullet, and
  the completion figure. Two facts in one line at 13px is the density the app kit asks for.
- **Titles clamp at two lines with an ellipsis** and the layout does not reflow. Every card in a row
  is the same height because the image, the meta line, and the title box are all fixed.
- **The featured card earns its size with description plus tags**, not with a bigger title. The
  title only steps from ~16px to ~18px.
- **Pagination is per-module, not per-page.** `‹ 1 [2] 3 ›` bottom-right, inside the module. This is
  the right pattern for the "Recommended" rail; it is the wrong pattern for the main feed, where
  scores shift between requests. Our feed pages via `excludeIds`, so the main grid gets "Show me
  more" and the rails get nothing at all at launch.

**Inverge's card, by contrast** (full spec in [`ideas-campaigns-brief.md`](./ideas-campaigns-brief.md) §3):

| Kickstarter slot | Inverge content | Source |
|---|---|---|
| Cover image | Cover image if we ever have one; **deterministic typographic cover** today | No image field exists on `Idea`. §9.2 |
| Progress bar | Validation meter, % to threshold, capped at 100 | `weightedPrePledgeTotal` + supporters vs the gate |
| Verified glyph | Text pill "Verified creator", never a rosette or tick-in-a-circle | `TRUST` chip / KYC state |
| Title | Title, two-line clamp | `title` |
| Creator name | Creator name | **Not in any response today.** §9.1 |
| "19 days left • 765% funded" | "34 days left in validation • 68% to threshold" | `validatingSince` + gate params |
| Description | `problem`, two-line clamp — the problem, not the pitch | `problem` |
| Tags | Category pill + region pill | `category`, `region` |
| Bookmark | **Nothing.** No save API, and "Support" is already the low-cost action | FR-202 |
| Ribbon/stamp | At most one, from a closed vocabulary of five | §7 |
| — | **Explainability chip, exactly one, always present** | `reason` ([`feed-api.md`](./feed-api.md)) |

---

## 4. The project page above the fold

The most transferable page in the capture. Five bands, in this order, all before any tab content:

**Band 1 — Title.** Project title and a one-line subtitle, both centred, both small (~20px / ~14px).
Centred works because the page below it is symmetrical-ish and the title is short. **We do not copy
the centring**: our idea detail is a two-column read with a sticky right rail (app kit §B), and a
centred title over an asymmetric body reads as a marketing page.

**Band 2 — Media left (~62%), funding panel right (~38%).** The panel, top to bottom:

1. Progress bar, full width, thin, hard against the top of the panel.
2. `US$ 406,808` in accent green, ~28px. **The money is the largest thing on the page.**
3. `pledged of US$ 10,000 goal`, 13px muted.
4. `5,238` / `backers` — figure, then its label underneath.
5. `17` / `hours to go` — same treatment. Units switch from days to hours near the end, which is a
   nice honest urgency signal that needs no red.
6. Primary action, full-width, ~48px: "Back this project".
7. Secondary row: outlined "Remind me" plus five share icons.
8. Fine print: underlined "All or nothing." then one sentence naming the exact deadline with
   timezone.

That order is a decision hierarchy: how much, of what goal, by how many people, in how long, do the
thing, tell a friend, and here is the rule that protects you. **Inverge's idea panel and campaign
panel both follow this order**, with substitutions from §8.

**Band 3 — Attribute row** under the media: editorial badge, category, location. Small, glyph +
label, muted. Ours: category, region, and the discoverability tier if FEATURED.

**Band 4 — Trust strip.** Cream band, three columns, icon + one sentence each:

> "Kickstarter connects creators with backers to fund projects."
> "Rewards aren't guaranteed, but creators must regularly update backers."
> "You're only charged if the project meets its funding goal by the campaign deadline."

Note what this is doing: sentence two is a **disclaimer of the guarantee** and sentence three is a
**statement of the one guarantee that exists**. It is placed at the point of highest intent, not
buried in terms. This is the pattern Inverge should copy most faithfully and can fill with far
stronger content, because our second sentence is not a disclaimer. Draft copy in
[`ideas-campaigns-brief.md`](./ideas-campaigns-brief.md) §5.3.

**Band 5 — Tab bar.** `Campaign · Rewards · Creator · FAQ²² · Updates¹ · Comments⁷⁴ · Community`.
Active tab carries a 2px underline; counts are superscript. Counts are the whole trick: they tell
you which tabs are worth opening before you open one. Every count we can render, we should.

---

## 5. Tab by tab

### 5.1 Campaign — sticky in-page nav, story, support rail

Three columns: a sticky table of contents (~18%), the story (~60%), a support rail (~22%).

The TOC lists the author's own section headings — "What's New", "The Pockets", "Materials and
Specifications", "Colors", "Lifetime Warranty", "Pledges", "Who It's For", "Our Story", "Shipping",
"Risks", "Environmental commitments" — with the current section marked. A long story stops being
long when you can see its shape.

The story column is plain long-form: H2, paragraphs, full-bleed images. Two sections are **platform
mandated, not author choice**: "Risks and challenges" and "Environmental commitments". Kickstarter
forces every creator to write about how the project could fail. It ends with "Questions about this
project? Check out the FAQ" and a "Report this project to Kickstarter" link.

The support rail holds a creator mini-card (name, "13 created · 22 backed") and a no-reward pledge
box: "Make a pledge without a reward", an amount input prefixed `US$`, a "Pledge" button, and the
line "Back it because you believe in it."

**Inverge verdict.** Steal all three columns for campaign detail. Steal the mandated-section idea
outright: our equivalents are **"Risks and challenges"** (same name, same reason) and **"What
happens if a milestone fails"**, and the second one writes itself from the escrow rules. The
structured pitch fields we already collect (`targetUser`, `currentAlternative`, `askBreakdown`,
`roadmapSteps`) mean an Inverge idea's TOC is **generated, not author-supplied**, which is strictly
better: every idea gets the same readable skeleton. For idea detail the rail is the action panel, so
the TOC and the rail cannot both be sticky at once; at `lg` we run TOC + story + rail, at `md` we
drop the TOC.

### 5.2 Rewards — the pattern we mostly do not need

Left rail jump-list of rewards with price and backer count, plus an "All gone" group for sold-out
tiers. Main column of reward cards, each split: left panel with name, price, "Backers 100",
"Limited (56 left of 100)", "Estimated delivery Nov 2026", and a "Pledge US$ 59" button; right panel
with an "Includes" list, per-region shipping lines, and "Optional add-ons" rows carrying a
thumbnail, price and a quantity stepper.

**Inverge verdict.** Reward tiers are optional in FR-301 and are not launch scope. **The second tab
on an Inverge campaign is Milestones, and that is the whole point of the product.** Two details are
worth keeping for later: the scarcity line ("Limited (56 left of 100)") is the honest way to render
a cap, and the left rail jump-list is a better nav for a list of priced options than a long scroll.

### 5.3 Creator — the trust surface

"About the creator": large circular avatar, name, then a badge row (verified glyph + real name,
"Backer Favorite", "Repeat Creator"). A three-column stat row — "13 created projects / 22 backed
projects", "Jul 29 2026 last login", "Oct 2016 account created" — then a bio paragraph, a "Follow"
button, and a links row (website, Instagram, YouTube). Right column: "Collaborators" cards. Below:
"Other projects by this creator" as a 2-up grid where each card carries a dark "Marked as fulfilled"
overlay and "Ended Oct 2025 • 1531% funded", then a "See more" control.

**Inverge verdict.** This is the highest-value tab to copy and the one we are least able to fill.
"Account created", "created projects", "backed projects" and per-project outcome labels are exactly
the durable, un-fakeable signals our objection-voting model needs backers to weigh. We hold some of
it already in `CreatorProfile` (`tier`, `completedCampaigns`, `lifetimeRaised`, `tenureStartedAt`,
`activeStrikes`) but **nothing to render a name, avatar, or bio with** (§9.1).

Two Kickstarter choices to invert:

- **"Marked as fulfilled" is creator self-report.** Ours is not: a completed campaign is a chain of
  approved milestones. Say "All 4 milestones delivered" and link the receipts.
- **"Backer Favorite" / "Repeat Creator" are engagement badges.** Our tier ladder
  (Starter / Trusted / Established, FR-306) is a permissions ladder with strikes attached. Render it
  as fact, not flattery, and never render `activeStrikes` in a way that shadow-bans silently — the
  quality doc is explicit that track record affects ranking, never eligibility to be seen.

### 5.4 FAQ — accordion plus an escape hatch

H2, then bordered accordion rows. Expanded rows show the answer and a muted "Last updated: Thu, June
25 2026 3:35 AM CET". A cream sidebar card holds "Don't see the answer to your question? Ask the
project creator directly." and an outlined "Ask a question" button.

**Inverge verdict.** Steal it exactly, including the per-answer last-updated stamp, which is a
credibility device we get for free from a timestamp we already store. The escape hatch is the point:
an FAQ without a route to a human is a wall. Our escape hatch is the discussion thread, which
already exists (`POST /ideas/:id/comments`), so the button says "Ask the creator" and deep-links to
the thread composer. **A campaign FAQ is creator-authored content we have no endpoint for** (§9.3).

### 5.5 Updates — gated posts and a timeline

An update card: "Update #1" plus a "Backers only" pill, title, creator avatar with a "Creator" pill,
date, then — for a logged-out reader — a bordered box with an eye glyph, "This post is for backers
only", and "If you're a backer of this project, please log in to read this post". Footer row shows
comment and like counts. Beneath the updates sits a timeline card: "Project launches / JUNE 30, 2026".

**Inverge verdict.** The gating pattern is correct and we will need it, because milestone proof
bundles can contain commercially sensitive material. Copy the shape of the gate: show that a post
exists, show who wrote it and when, hide only the body. **Do not copy the gate as a growth device** —
"log in to read" is fine, "back this project to read" on a *milestone proof* would be indefensible
when the proof is the thing backers vote on. Milestone proof is public; creator commentary can be
gated.

The timeline card is a genuinely good idea for us: a campaign's spine is dated events (published,
funded, working-capital tranche released, milestone 1 claimed, objection window closed, tranche
released), every one of which has a receipt. That is a **vertical timeline of receipts** and it is
the transparency dashboard in miniature (FR-802).

### 5.6 Comments — a real thread, and how it degrades

Flat-with-nesting: 32px avatar, name, optional "Superbacker" pill, timestamp, body; creator replies
carry a green "Creator" pill; replies indent under a left rule with "Load previous replies" and
"Showing 1-3 of 6 replies" controls. Cancelled pledges collapse to a muted "This person's pledge has
been canceled." line rather than vanishing. Bottom: "Showing 25 of 74 comments" and "Load more".

**Inverge verdict.** Our API is already shaped for this: `IdeaComment` carries `parentId`,
`likeCount` and `highlighted`, and `GET /ideas/:id/comments` returns a flat list ordered
highlighted → most-liked → newest, capped at 300, for the client to nest. So: nest one level only,
render `highlighted` as a pinned card at the top, and paginate client-side from the flat list.

Two things to take deliberately:

- **The muted tombstone row.** Not deleting a record, but not letting it speak either, is the
  correct answer for a moderated thread. Ours reads "This comment was removed." with no reason and
  no author, because our moderation model holds for review rather than auto-rejecting.
- **Author identity on every row** — which we cannot render today. `GET /ideas/:id/comments` returns
  `userId` and nothing else (§9.1). This is the single most blocking gap in the whole feature.

### 5.7 Community — aggregate proof

Centred "5,238 people are supporting Gravel". Two ranked lists, "Top Cities" and "Top Countries",
each row a place name plus a right-aligned "129 backers". Then one card split in two: "New Backers
492" and "Returning Backers 4,746" at ~48px with an explanatory caption under each. Then "Similar
projects to check out" with a "See more" button and a 4-up card row.

**Inverge verdict.** Strategically this is our best tab and tactically we cannot ship it publicly.
Geography of support is *exactly* the diaspora-to-home story the PRD is built on ("Where support is
coming from: London 118, Lagos 97, Toronto 54"). But the only endpoint that aggregates this,
`GET /ideas/:id/insights`, is **creator-only and returns 403 to everyone else**, deliberately.

So: build the aggregate views **inside the creator dashboard** first, where the data is already
authorised, and treat a public version as a separate ask for a public aggregate endpoint (§9.4).
"New vs returning" has a direct Inverge analogue that is more useful than Kickstarter's — first-time
supporter versus someone who has backed a campaign before, which is our pre-pledge weighting tier
in disguise. The "Similar projects" rail is a `GET /feed?category=` call and should ship on idea
detail from day one: it is the cheapest retention mechanic on the page.

---

## 6. Chrome, footer, and the two selects

Global chrome is a wordmark, a centred search field, a creator entry point, and a login control, over
a second row of category links terminated by "Discover". Fifteen categories is a taxonomy for a
site with 600,000 projects; we have five in the feed enum and should show exactly five, plus a
region control, because an empty category is worse than a missing one.

The footer is already built for the marketing site and needs no work here. One detail is a real
product question: Kickstarter has **language and currency selects in the footer**, and a project
page renders every figure in the chosen currency (`US$ 406,808`). Inverge has a live two-currency
problem — pre-pledges are accepted in USD and NGN and normalised to USD via `fx.ngnPerUsd` — and it
is currently unhandled in the web app. §8.4.

---

## 7. Badges: the closed vocabulary

Ribbons and stamps observed in the capture, on cards that also carry a progress bar and a metadata
line: "PROJECT WE LOVE" circular stamp, green verified rosette beside the title, "ENDING SOON" green
banner, diagonal "MANGA" corner ribbon, "FUNDED IN ONE MINUTE!" starburst, "Funded in 5 minutes!",
"Marked as fulfilled" overlay, plus "Superbacker", "Backer Favorite" and "Repeat Creator" pills
elsewhere. Several cards carry three at once.

For Inverge this is not a taste problem, it is a compliance problem. FR-206a requires paid placement
to be visually distinct and clearly labelled, and never merged with validation metrics. A "Promoted"
label loses that fight the moment it is one of six decorations on the same card.

**The closed list. A card may carry at most one image overlay and at most one status pill. Nothing
enters this list without a backend field behind it.**

| Label | Rendered as | Backing field | Rule |
|---|---|---|---|
| `Promoted` | Distinct card treatment: tinted surface, dashed-to-solid border change, label in the card's own header row, never over the image, never adjacent to the meter | `promoted: true` | FR-206a. Non-dismissable. Never on the same card as any other overlay. Never counted in a "N ideas" result count without saying so. |
| `Featured` | Small accent pill in the meta row | `discoverabilityTier === 'FEATURED'` | Quality-floor tier (FR-272), **not** an editorial endorsement. Never worded as "we love this". |
| `Threshold met` | Neutral pill with a shape marker | `status === 'THRESHOLD_MET'` | The one state change worth interrupting for. |
| `Ending soon` | Text in the meta line, not a ribbon | validation window < 7 days remaining | Text, because a ribbon over the cover competes with `Promoted`. |
| `Verified creator` | Text pill | KYC/KYB verified | **No rosette, tick-in-a-circle, shield or padlock** (app kit §4 [must]). |

The feed's `reason` chip is not in this table because it is not a badge: it is one chip, on every
card, always, in a fixed position, and it is the honest answer to "why am I seeing this".

---

## 8. Translation table

### 8.1 Vocabulary

| Kickstarter | Inverge — idea | Inverge — campaign |
|---|---|---|
| "backers" | **"supporters"** (no money has moved) | "backers" |
| "pledged" | **"Estimated interest"** — the exact label, never "raised", "pledged", or "committed" | "raised" |
| "US$ 406,808 pledged of US$ 10,000 goal" | "Estimated interest $1,830 · 68% to threshold" | "$3,600 raised of $5,000 goal" |
| "975% funded" | "68% to threshold", capped at 100 | "72% of target" |
| "17 hours to go" | "34 days left in validation" | "18 days left" |
| "Back this project" | "Support this idea" / "Pre-pledge" | "Fund this idea" |
| "All or nothing" | — | "All or nothing", same meaning (FR-305) |
| "Rewards aren't guaranteed" | — | "Money releases in stages, and only when backers approve" |
| "Project We Love" | "Featured" (quality tier) | "Featured" |
| "Remind me" / bookmark | "Support this idea" is the light action; no bookmark | no bookmark |
| "Marked as fulfilled" | — | "All 4 milestones delivered" + receipts |
| "Superbacker" | — | nothing at launch |
| Stretch goals | — | nothing, ever, at launch scope |

### 8.2 The three sentences we may never write

1. Anything that presents `weightedPrePledgeTotal` as money raised, held, or committed. It is
   labelled **"Estimated interest"** and nothing else. The raw `prePledgeTotal` is never returned by
   the API and must never be reconstructed client-side.
2. Anything that presents an idea's pre-pledge as a payment, an authorisation, or a reservation.
   The mandated line under any pre-pledge control is "No money moves yet. This tells the creator
   you're in."
3. Anything naming the chain, a wallet, a gas fee, a network, a signature, or an address. A
   transaction reference is a receipt and `TxLink` is the only component allowed near an explorer
   URL (conventions §1).

### 8.3 Percentages

Kickstarter's percentage is unbounded and celebrated. Ours means two different things and both are
bounded:

- **Idea:** progress toward the FR-204 gate, which is multi-criterion — supporters **and** weighted
  interest **and** the creator's own target **and** sustainment over a window. A single bar cannot
  express that, so the bar shows the binding constraint (the lowest of the criteria) and the panel
  breaks out all of them, exactly as `GET /ideas/:id/insights` already computes for the creator.
  Cap the bar at 100: an idea at 300% of the supporter floor but short on interest is not at 300%.
- **Campaign:** money raised against target. Unbounded above 100 is fine and honest. No stretch
  goals, so over-target is just over-target.

### 8.4 Currency, and a live bug

`Idea.askAmount`, `weightedPrePledgeTotal`, and the gate thresholds are all **USD**. The API
normalises NGN pre-pledges to USD via `fx.ngnPerUsd`; only the individual pre-pledge carries a
`currency`.

`components/ui/amount.tsx` **defaults to `currency="NGN"`**. The current Phase-0 scaffold pages call
`<Amount value={idea.askAmount} />` with no currency prop, so they render USD figures with a ₦
symbol. That is a wrong number on screen, not a formatting nit, and it gets fixed as part of this
feature: every call site passes an explicit currency, and NGN is only ever rendered from a value
that was actually captured in NGN.

---

## 9. What Kickstarter cannot give us

### 9.1 Identity — the blocking gap

There is **no display name, no avatar, and no bio anywhere in the data model**. `User` holds
`privyDid`, `email`, verification state and preferences. `CreatorProfile` holds tier and track
record. `GET /feed` returns `creatorId`. `GET /ideas/:id` returns the raw idea row.
`GET /ideas/:id/comments` returns `userId`.

Every reference surface that works — the card, the creator tab, the comment thread — is built on a
name and a face. Options, in order of preference:

1. **Add display identity to the API** (`displayName`, `avatarUrl`, `bio`, `links` on a public
   creator projection; author projection on comments). Additive, unblocks four surfaces.
2. Ship an initials avatar plus a deterministic pseudonym derived from the id. Cheap, and actively
   harmful on a page whose job is accountability.
3. Ship without identity: no avatars, no names, "Creator" as the only attribution. Honest, ugly, and
   makes the creator tab pointless.

**Option 1, and it is the first ask on the API list.** Until it lands, components take an optional
`creator` prop and degrade to an initials block, so the request is confined to one component.

### 9.2 Cover images

`Idea` has no image field, and image-led cards are the reference's whole visual engine. Two moves,
both needed:

1. A **deterministic typographic cover**: category-derived accent tint, the title set large in the
   display face, a category glyph, generated from `id` so it is stable across renders. The app kit
   explicitly licenses "a plain typographic cover".
2. An additive `coverImageUrl` ask, with upload handling as a separate piece of work. Cards take
   `coverImageUrl?` from day one and fall back to the typographic cover.

### 9.3 Campaigns have no endpoints at all

`Campaign`, `Milestone`, `MilestoneClaim`, `MilestoneObjection`, `ReviewerRuling`, `Contribution`
and `OnChainEvent` all exist in Prisma and are inert. The only live path is
`POST /ideas/:id/convert`, which creates a `DRAFT` campaign after the FR-204 gate. There is no
campaign read, list, publish, contribute, claim, or objection endpoint, and there is no
campaign-FAQ or campaign-update model.

Campaign UI is therefore built against a **written provisional contract with fixtures behind one
swap point** — [`campaign-data-contract.md`](./campaign-data-contract.md). Not against invented
`fetch` calls, and not with shapes inlined into components.

### 9.4 Aggregates are creator-only by design

`GET /ideas/:id/insights` computes everything the Community tab would want and returns 403 to
non-owners. Public aggregate views need their own endpoint and their own privacy pass. Creator
dashboard first.

### 9.5 The surfaces with no reference at all

These are the differentiators, and the reference is silent on every one:

| Surface | Why there is no analogue |
|---|---|
| **Milestone tracker with a live objection window** | Kickstarter's money leaves on funding close. Ours leaves in tranches a backer can stop. Four states visible at once, a calm countdown, plain-language consequence. The app kit calls this the most differentiating screen in the product. |
| **Refund state** | Kickstarter has no refund surface, because it has no refund guarantee. Ours is the product promise, rendered matter-of-fact: what failed, what is coming back, when, receipt. |
| **Validation meter against a multi-criterion gate** | Kickstarter has one number. We have four and a sustainment window. |
| **Explainability chip** | No feed on the reference explains itself. Ours does, on every card, from the ranker. |
| **Paid placement, labelled and separable** | Kickstarter's promoted inventory is not distinguished in the capture. Ours is required to be, by construction. |
| **Verification gate on creating a campaign, never on publishing an idea** | Publishing is free and ungated; receiving money is not. The gate appears on exactly one screen and nowhere else. |
| **Structured survey feedback** | Kickstarter has comments. We have creator-authored typed questions plus a thread, and they render differently. |

---

## 10. What actually gets built from this

Ranked by value-per-hour, and this is the order [`ideas-campaigns-brief.md`](./ideas-campaigns-brief.md) §8 builds in:

1. The app shell (§4 chrome) — currently there is **none**: `(validate)`, `(campaign)` and `(admin)`
   render bare inside the root layout.
2. The card at three densities, with the closed badge vocabulary and the reason chip (§3, §7).
3. The feed page: featured + grid hero module, category and region lanes, "Show me more" (§2).
4. Idea detail: generated TOC, story column, sticky action panel in the reference's number order,
   trust strip, tabbed depth (§4, §5).
5. Comment thread and survey results as tabs (§5.6).
6. Campaign detail against the provisional contract: header, milestone tracker, receipts timeline,
   mandated risk sections (§5.1, §5.5, §9.5).
7. Refund state (§9.5).
8. Editorial modules and lanes, if they still look worth it by then (§2 rows 4, 9, 12).

---

## 11. Sources

- Screenshots as described under **Capture provenance**, July 2026: Kickstarter homepage and the
  Gravel "Summit PLUS" project across all seven tabs.
- Inverge PRD/SRS v1.2 §5.1–5.6, §8.1, FR-201–206a, FR-301–311, FR-401–406, FR-501–509, FR-601–608,
  FR-801–803 (`Inverge/docs/Inverge_PRD_SRS_v1.2.md`).
- [`feed-api.md`](./feed-api.md), [`feed-design.md`](./feed-design.md) — feed contract and rationale.
- [`app-mockup-kit.md`](./app-mockup-kit.md) §3–§6 — app-screen art direction, shell, content rules.
- [`conventions.md`](./conventions.md) §1, §5, §8 — product non-negotiables, tokens, accessibility.
- `inverge-api` `prisma/schema.prisma` and `src/modules/*` as of 2026-07-30 for every claim about
  what the backend does and does not return.
