# Pitch Narrative Playbook

> The second reference set, and a different concern from
> [`reference-teardown-kickstarter.md`](./reference-teardown-kickstarter.md). The teardown is about
> **how the platform lays out a page**. This is about **what a creator puts inside it, and in what
> order** — the narrative funnel the best-performing campaigns follow.
>
> It matters to us in four concrete places: the generated table of contents and story renderer on
> idea detail, the field order and coaching copy on `/ideas/new`, the campaign story sections, and
> the completeness checks in the API's quality scorer (`QualityScorerPort`, FR-271).

**Provenance.** Synthesised from material supplied by the user, July 2026, drawn from Kickstarter's
own Creator Handbook, Stonemaier Games' campaign-page anatomy guides (Jamey Stegmaier), and veteran
campaigner playbooks. Claims below are tagged:

- **[P]** platform documentation or platform-imposed constraint
- **[H]** practitioner heuristic, widely repeated, not measured by us
- **[S]** reported statistic, **not independently verified here** — treat as directional

---

## 1. The cold-start trust problem, and why ours is different

The framing behind the whole funnel: a crowdfunding page asks a stranger to send money for a product
that does not exist, made by someone they have never heard of, with no guarantee it ships. Every
instinct that protects a buyer is telling them to close the tab. **[H]** So the layout's first job is
to answer "why should I trust you" before the reader is halfway down.

Kickstarter has to solve that with *rhetoric*: testimonials, press logos, prototype photos, team
faces, momentum. The page must manufacture the trust, because the platform supplies almost none —
its own trust strip says outright that rewards are not guaranteed.

**Inverge supplies part of that trust structurally.** Money releases in tranches only after backers
have had a window to review what was delivered, and undelivered stages return the money still held.
That is a materially different starting position, and it changes what we should copy:

| The stranger's question | Kickstarter answers with | Inverge answers with |
|---|---|---|
| Will this ship at all? | Prototype photos, manufacturing partners, momentum | The mechanism: staged release, backer review, automatic return |
| Will they take my money and vanish? | Team faces, press, track record | Escrow plus verification of the person receiving funds |
| **Can this specific person actually build it?** | Team bios, prototypes, reviews | **Nothing yet. This is the gap the pitch has to fill.** |
| **Is the problem real?** | Implicitly, through demand | **The validation stage exists precisely to answer this.** |
| **Is the plan concrete enough to review?** | Roadmap, stretch goals | **Milestones with evidence definitions, reviewable by backers** |

So: **do not import the full trust-theatre stack.** Import the parts the mechanism cannot cover, and
they are the last three rows. Everything the escrow already guarantees, the copy should state once,
plainly, and then stop selling.

---

## 2. The reference section order, mapped

The order below is the widely adopted one for games and publishing campaigns **[H]**. The mapping is
what matters: most of it we already collect, and the fit is close enough to be a useful audit of
where our structured pitch is thin.

| # | Reference section | Inverge — idea | Inverge — campaign |
|---|---|---|---|
| 1 | **Hook / elevator pitch**, 1 to 3 sentences plus one strong image | `problem` leads. **No dedicated one-line hook field exists** (§3.1) | `ideaSnapshot` |
| 2 | **What's in the box** — components, quantities, value | `askBreakdown` (what the ask buys) | Milestone deliverables |
| 3 | **Stretch goals**, placed early as unlocked value | **Never.** Out of scope permanently (PRD §6) | **Never** |
| 4 | **Photos and prototypes** — real photos beat renders | No media field at all (§3.2) | Milestone proof bundles, which are stronger: they are dated and reviewed |
| 5 | **Pledge levels / rewards**, tiers under 8 lines, comparison chart when additive | No rewards at validation stage | Reward tiers optional (FR-301), not launch scope |
| 6 | **Add-ons** | — | Not launch scope |
| 7 | **Group pledges, retailers, languages** — pre-empt the FAQ | Discussion thread | FAQ tab (no model yet) |
| 8 | **How it works**, 3 to 7 short animated demos | `solution` | Story section |
| 9 | **Third-party reviews and press** | Survey results, comment thread, `institutionalCosign` | Same, plus delivery record |
| 10 | **The team** — people back people | **Blocked: no name, avatar or bio in the data model** (§3.3) | Same |
| 11 | **Why pledge now / why crowdfunding** — where the money goes | `askBreakdown` partly covers it | Tranche schedule answers it precisely |
| 12 | **Timeline, and a mandatory Risks and Challenges section** | `roadmapSteps` covers the timeline. **No risks field on an idea** (§3.4) | "Risks and challenges", mandated, same name |
| 13 | **Shipping and taxes, deliberately last** because it is the most off-putting **[H]** | **We invert this** (§5.1) | **We invert this** |

Two observations worth more than the table:

- **Our structured pitch is already an opinionated version of this funnel.** `targetUser`,
  `currentAlternative`, `askBreakdown` and `roadmapSteps` force the sections a good campaign page has
  and a bad one skips. The reference validates the approach: we generate the skeleton instead of
  hoping the creator knows the order. That is why the idea TOC is generated, not author-supplied.
- **The gaps are all in the same place: proof of the person.** Rows 1, 4 and 10 are the three we
  cannot render, and two of them are the same missing feature.

---

## 3. What this exposes as missing

### 3.1 A one-line hook

The reference is firm that the subtitle does real work: short, keyword-led, and it should lead with
what makes the project distinctive, not restate the category **[P]**. It is also the string that
travels — cards, search, social.

We have no such field. `problem` is doing the job on cards, and for a *validation* product that is
arguably the better default: the problem is what a supporter is being asked to recognise, and a
polished tagline is exactly the kind of unfalsifiable copy the quality scorer should not reward. So:
**keep `problem` on the card, and file a low-priority `summary` ask** for the places a hook actually
helps (OpenGraph description, campaign header, share text). Not a blocker.

### 3.2 Media

No `coverImageUrl`, no image gallery, no video field on `Idea`. The reference's position is that real
photos of a real thing are what make a project feel tangible **[H]**, and that the video is close to
non-negotiable **[S]** — see §6. Our fallback is the deterministic typographic cover
([teardown §9.2](./reference-teardown-kickstarter.md)), which is honest and looks deliberate, but it
is a fallback.

### 3.3 The team block

Rows 1, 10 and half the trust argument all need a name and a face, and the data model has neither.
This is the third independent route to the same conclusion, after the card and the comment thread:
**public creator identity is the top API ask** and it is not a nice-to-have, it is the thing the
reference says converts.

### 3.4 Ideas have no risks section

Kickstarter *mandates* "Risks and Challenges" on every project, text-only, and the practitioner
guidance is to be specific about what could go wrong because specificity signals competence **[P]**.
Our campaigns have the equivalent; **our ideas have nothing**.

That is a real product gap, and a cheap one to close: an optional `risks` field on an idea, prompted
as "What is most likely to go wrong, and what would you do about it?", scored for presence and
specificity by the quality scorer as coaching rather than as a gate (FR-271a: coach, never bouncer).
It also feeds the objection-voting model downstream, because a creator who named a risk up front and
then hit it is in a very different position with backers than one who did not.

Filed as an ask. Until then, `/ideas/new` prompts for it inside the roadmap step description, so the
habit forms before the field exists.

---

## 4. Copy and rhythm rules, and where each one is enforced

The reference's content rules are all about scannability. Each maps to somewhere specific in our
build, which is the only reason to write them down:

| Rule | Where it lives for us |
|---|---|
| No paragraph longer than about 3 lines; bullets no longer than 2 **[H]** | `IdeaStory` renderer: constrain the measure to ~68 characters and cap the rendered block; `/ideas/new` shows a soft character counter, not a hard limit |
| An image every 2 to 3 paragraphs to keep rhythm **[H]** | Story renderer once media exists; until then, the generated section headings do the pacing work |
| Bold sub-headers to outline and break up blocks **[H]** | Generated section headings, not creator formatting. Our story is structured fields, so this is free and consistent |
| Landscape images, roughly 3:1; tall images eat the page **[H]** | Cover at 3:2 on cards, story images constrained by `aspect-ratio`; never an unbounded upload |
| Custom typography is faked with PNG headers because the editor forbids fonts **[P]** | **Not applicable and worth stating**: our sections are typeset by the app, so every idea page is consistent, accessible and searchable. A platform constraint of theirs is an advantage of ours |
| Avoid hyperbole; do not tell backers how to feel **[H]** | §5.2 — for us this escalates from taste to compliance |
| Mobile-first: only the top of the page is visible at a glance **[H]** | The action panel becomes a bottom bar; hook, cover and the first metric must fit a 360×640 viewport |
| Three people review the page before launch **[H]** | Our automated analogue is the quality scorer plus the moderation screen on publish, and the live preview panel on `/ideas/new` ("This is what backers will see") |

---

## 5. What we deliberately invert

### 5.1 The off-putting parts go first, not last

The reference puts shipping and taxes at the very bottom on the reasoning that by the time a backer
scrolls there, they are already sold **[H]**. That is sound for a shop. It is wrong for us, and
inverting it is the whole positioning.

Our equivalent of "the off-putting part" is the money mechanics: nothing moves during validation,
funds release in stages, a failed stage returns what is still held, and the platform takes a fee on
each release. **Every one of those is a reason to trust us**, so they go above the fold in the trust
strip, not buried at the end. Concealment strategy is for a page whose mechanism is a liability;
disclosure is for one whose mechanism is the product.

### 5.2 Hyperbole is a compliance boundary, not a style preference

The reference advises against hyperbole because it reads as untrustworthy **[H]**. For us the line
sits further back and is harder: any language implying a financial return, profit, yield, appreciation
or investment is a **securities** problem, not a tone problem. Launch scope is rewards and donation
based precisely to stay outside that (PRD §6, §9), and the moderation taxonomy has a category for it
(`POL-SEC`, FR-1001) with the classifier already live.

So the coaching copy on `/ideas/new` says less about enthusiasm and more about claims: describe what
you will build and who needs it, and do not promise anyone a return.

### 5.3 Momentum is a signal we rank on, not theatre we stage

The heuristic is that campaigns reaching 20 to 30% in the first 48 hours are overwhelmingly likely to
fund, so the page should be engineered to convert the warm list first and let strangers arrive at a
page that already looks validated **[H]**.

The mechanic is real and our feed already reads it: supporter velocity is a ranking input
([`feed-design.md`](./feed-design.md) §3). Two divergences, both deliberate. First, we
**Bayesian-smooth** it and weight it at 0.20 exactly so a coordinated first-day burst cannot buy the
top of the feed, and the exploration lane guarantees exposure that momentum cannot outbid. Second,
percentage theatre is banned: our meter is capped at 100 and measures a gate, so "already looks
validated" cannot be manufactured by overfunding. What we *should* build from this is creator-side:
surface first-48-hours velocity on the dashboard, because it is the most actionable number a creator
has, and it belongs in their private view rather than as public spectacle.

### 5.4 Percentage and stretch-goal mechanics

Stated once more because the reference leans on both: no stretch goals, ever, at launch scope, and no
unbounded percentage on an idea. See [teardown §8.3](./reference-teardown-kickstarter.md).

---

## 6. Video

The reported figure is a 54% success rate for projects with a video against 39% without, with 1 to 2
minutes as the sweet spot and a decline past roughly 6 minutes; audio quality is said to matter more
than picture quality, and the creator appearing on camera is said to convert **[S]**.

Two caveats before this becomes a roadmap item. The comparison is **confounded**: a creator who
produces a video is systematically more prepared than one who does not, so the gap is not all
attributable to the video. And the figure has circulated for years and may predate the current
platform. Directionally it is still the strongest single argument for a media field, and "creator on
camera, audio over picture" is cheap, correct advice for a Lagos or Accra creator with a phone.

**Position:** file media as one ask (cover image, then optional short video), and when it lands, the
coaching copy asks for a phone-shot, 60 to 90 second, face-to-camera clip rather than anything
produced. On our bandwidth floor, video must be opt-in to load, never autoplay, and never block LCP
(conventions §10).

---

## 7. Where each rule is encoded

So this document is not just prose, every rule above has an owner:

| Owner | Takes |
|---|---|
| `IdeaStory` / `IdeaStoryToc` | Section order (§2), measure and rhythm (§4), generated headings |
| `/ideas/new` form | Field order, coaching copy, character counters, live preview (§4), claims guidance (§5.2) |
| `components/ideas/TrustStrip` | Disclosure-first inversion (§5.1) |
| `lib/ideas/gate.ts` and `ValidationMeter` | Capped meter, no percentage theatre (§5.4) |
| API `QualityScorerPort` (FR-271) | Completeness checks; add risks-present and specificity as **coaching**, never rejection |
| API asks list | Hook `summary`, media, identity, idea-level `risks` (§3) |
| Creator dashboard | First-48-hours velocity, privately (§5.3) |

---

## 8. Sources

- Material supplied by the user, July 2026, synthesising: Kickstarter Creator Handbook
  (`kickstarter.com/help/handbook`), Stonemaier Games campaign-page anatomy and Kickstarter Lessons
  series (`stonemaiergames.com`), and practitioner campaign playbooks. Deep links not recorded; claims
  are tagged **[P]** / **[H]** / **[S]** above rather than cited individually, and the two statistics
  are unverified here.
- Inverge PRD/SRS v1.2: §6 (no stretch goals, no equity), §9 (compliance posture), FR-201, FR-270–278
  (structured pitch and quality), FR-301–302 (milestones and evidence), FR-1001 (moderation taxonomy).
- [`reference-teardown-kickstarter.md`](./reference-teardown-kickstarter.md) — platform-side layout.
- [`ideas-campaigns-brief.md`](./ideas-campaigns-brief.md) — where these rules become components.
- [`feed-design.md`](./feed-design.md) §3, §9 — velocity as a ranked, smoothed signal.
