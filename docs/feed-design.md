# Inverge Discovery Feed and Ranking Model

> Design/spec of the discovery feed. This is the "why" behind the ranking; the concrete
> request/response contract the web app builds against is in [`feed-api.md`](./feed-api.md).
> Weights and thresholds below are illustrative starting points to be calibrated on observed
> data, consistent with the conservative-defaults principle. Everything here is implemented in
> `inverge-api` (`src/modules/feed/`); the Phase-2+ items are noted as such.

## 1. What the feed ranks at each phase

The feed object changes as the platform matures, and the model must not assume signals it does not yet have.

| Phase | Primary object ranked | Signals available | Signals absent |
|---|---|---|---|
| 0 (live) | Published ideas | Weighted pre-pledge intent, supporter velocity, feedback quality, quality score, region/category match | Pledge history, delivery track record, co-pledge graph |
| 1 (manual pilot) | Ideas + a handful of live campaigns | Above, plus early funding velocity on pilot campaigns | Dense co-pledge graph, completed-milestone history |
| 2+ (escrow) | Live campaigns + ideas | Above, plus creator delivery track record, milestone health, backer affinity (collaborative filtering) | — |

The delivery-track-record signal, which is your genuine differentiator against Kickstarter and Indiegogo, is thin at launch and only becomes powerful once creators have completed campaigns. Plan for it as a ramping strength, not a launch-day one. The launch feed wins on behavioural signal quality, exploration fairness, and explainability instead.

## 2. Three-stage architecture

This is how production feeds are actually built, and it is the honest structure for Inverge because it gives paid placement a clean, isolated home.

**Stage 1: Candidate generation (retrieval).** Cheap and broad. For each user, pull a few hundred eligible items by hard filters: not already seen recently, passes the moderation gate (AI classifier + near-duplicate detection), meets a minimum quality-score floor, and matches at least a loose personalisation net (region, category interest, or global-popular fallback). Moderation-held, rejected, and duplicate items are *excluded here*, not down-ranked, so they never reach scoring.

**Stage 2: Ranking.** Expensive scoring applied only to the candidate set. Produces the organic score, then the personalised score, then the time-decayed final score (Section 4).

**Stage 3: Policy and re-rank.** Applies diversity constraints, injects the exploration lane (Section 5), deduplicates by creator, and injects paid placement as clearly labelled, visually distinct slots (Section 7). Paid placement enters *only here* and never touches the Stage 2 score.

Keeping these separate is what lets you honour FR-206a and NFR-15 architecturally rather than by convention: two pipelines that only meet at final render.

## 3. Signal catalogue

Grouped by role. Every counted signal consumes the anti-sybil *weighted* value, never a raw count (Section 6).

**Behavioural (the core at launch)**
- Weighted pre-pledge intent: sybil-adjusted sum of pre-pledge amounts. Your strongest behavioural signal, since it is a stated commitment rather than a passive view.
- Weighted supporter velocity: rate of supporter accrual, time-normalised and Bayesian-smoothed (Section 4) so a two-hour-old idea with three supporters does not rocket on noise.
- Feedback quality: weighted by substance, not volume. A short structured-feedback quality model or the classifier's usefulness score prevents comment-spam gaming.

**Quality and safety**
- Quality score: 0 to 1 from the AI moderation/quality classifier. Used as a soft ranking input above the retrieval floor.
- Duplicate penalty: continuous penalty from near-duplicate detection, so near-clones are demoted rather than only exact matches filtered.

**Trust (ramps with maturity)**
- Creator KYC status.
- Institutional co-sign: SuperteamNG cohort membership as a launch trust proxy while delivery history is thin.
- Creator tier and strike status (Starter/Trusted/Established), once tiers are live.
- Completed-campaign count and milestone approval rate (Phase 2+): the differentiator signal.
- Milestone health on live campaigns (Phase 2+): on-track versus overdue.

**Personalisation**
- Region/origin match (creator origin to backer interest, including diaspora-origin targeting).
- Category affinity (from onboarding, then behaviour).
- Currency/payment-rail relevance.

**Freshness**
- Age since publish, feeding time decay.

Note on deadline proximity: for live campaigns, proximity to the funding floor or target is a legitimate *utility* signal (a backer may want to help close a nearly-funded raise), but keep its weight modest and never render it as manufactured countdown urgency. That keeps the feed consistent with the honest-pitch positioning.

## 4. The scoring formula

**Normalisation first.** Signals live on different scales, so standardise each within the candidate pool (z-score or min-max) before combining. This is the step most naive feeds skip, and skipping it lets one high-variance signal silently dominate.

**Bayesian smoothing for rates.** For velocity-type signals, shrink toward a global prior to kill small-sample noise:

```
SmoothedRate = (events + C · m) / (exposure + C)
```

where `m` is the global mean rate (e.g. supporters per impression across all ideas), and `C` is a pseudo-count controlling how much evidence an item needs before its own rate is trusted. Higher `C` means more conservative.

**Organic score** (illustrative weights, calibrate later):

```
Organic =
    0.30 · z(WeightedPrePledgeIntent)
  + 0.20 · z(WeightedSupporterVelocity)
  + 0.15 · z(FeedbackQuality)
  + 0.15 · QualityScore
  + 0.20 · TrustScore
  − DuplicatePenalty
```

At launch, TrustScore is mostly KYC plus co-sign, so its 0.20 is under-fed by design and grows as delivery history accrues. That is intended.

**Personalised score.** Tilt, do not dominate:

```
Personalised = Organic · PersonalisationMultiplier
```

Bound the multiplier (e.g. 0.8 to 1.5) so a strong idea outside a backer's region or category still surfaces. An unbounded multiplier collapses the feed into a filter bubble and starves new creators of cross-audience reach.

**Time decay.** Adapt the gravity pattern:

```
Final = Personalised / (age_hours + 2)^gravity
```

Gravity is a tuning dial. High gravity gives a fresh, churny feed; low gravity favours accumulated-signal stability, which suits a validation window where the point is to let signal build. Start moderate and let the exploration lane, not aggressive decay, handle new-item exposure.

> Implementation note: `Organic` (z-scored) can be negative, and multiplying a negative by a
> multiplier > 1 would invert the tilt. The implementation positive-shifts the organic score to
> a small floor before applying the multiplier, so a personalization match can only ever lift.

## 5. Cold-start strategy (the centrepiece)

Three problems to solve separately: no personalisation data, no item history, and the structural bias against first-time creators.

**No personalisation data.** Capture interests at onboarding (regions, categories, diaspora-origin, ticket size). Until a co-pledge graph exists, run content-based similarity using idea tags, category, and the classifier's embeddings, so recommendations are possible from a user's first session. Blend in item-to-item collaborative filtering (backers who supported this also supported) only once co-pledge density crosses a threshold (e.g. the median item has at least N co-pledge connections). Introducing collaborative filtering too early produces erratic, sparse recommendations.

**No item history.** Rank on rate, not absolute totals, so a two-day-old idea is not buried under a thirty-day-old one. The Bayesian smoothing above handles the noise this introduces.

**Structural bias against new creators (the important one).** Reserve a share of feed slots (start at 20 to 30 percent, taper as the catalogue grows) for under-exposed items, selected with an upper-confidence-bound bonus:

```
ExplorationBonus = β · sqrt( ln(TotalImpressions) / (ItemImpressions + 1) )
```

Items seen less get a larger bonus that shrinks automatically as they accumulate exposure. This is the principled fix for the rich-get-richer loop: every new idea gets a fair exposure window to prove itself on behavioural signal, rather than needing a pre-built audience to become visible at all. It is also directly on-brand, since it operationalises the fairness that the incumbents fail to provide.

Add a category-diversity constraint in the policy layer so the feed cannot collapse into a single vertical, and a per-creator dedup cap so one prolific creator cannot flood the surface.

## 6. Anti-sybil integration

The feed is a prime manipulation target because visibility converts to real money downstream. Defences:

- Every counted signal consumes the weighted-pledge engine's sybil-adjusted value. A pledge or support action from a fresh throwaway counts a fraction of one from an established account with history. This is the primary feed defence, and it is already in your build.
- Velocity smoothing and caps blunt burst manipulation, since a sudden spike from low-trust accounts is both shrunk by weighting and smoothed by the Bayesian prior.
- Feedback quality weighting neutralises comment-spam attempts to inflate the feedback signal.
- Near-duplicate penalty stops copy-paste idea farming from occupying multiple slots.

> Known limitation in the current build: SUPPORT signals are not yet sybil-weighted (only
> pre-pledge is), so supporter velocity is the most gameable organic input. It is mitigated by
> Bayesian smoothing, its low 0.20 weight, and the unbuyable exploration lane; revisit if abused.

## 7. Paid placement separation (hard constraint)

Paid boosts (FR-206/206a) and the validation metrics must never mix. Architecturally:

- Boosts affect *only* Stage 3 injection. They never enter the Organic or Personalised score.
- Boosts never modify supporter count, pre-pledge total, or feedback score, and are never visually merged with them.
- Promoted slots are frequency-capped, visually distinct, and labelled as promoted.
- The organic pipeline is computable and auditable with all paid placement removed, so you can always show a creator or regulator the unpaid ranking.

This satisfies NFR-15 by construction rather than by editorial discipline.

## 8. Explainability layer

Attach a reason chip to each ranked item, derived from its dominant score component. Because your ranking is transparent by design, you can surface honest reasons the incumbents' hidden Magic and gogofactor cannot:

- "Highly rated by backers" (feedback quality dominant)
- "Close to its goal" (funding proximity, live campaigns)
- "From Lagos" or "From your region" (personalisation match)
- "This creator has delivered 2 campaigns" (trust, Phase 2+)
- "New, worth a look" (exploration slot)

This reinforces trust-as-product and doubles as a QA tool: if the chips look wrong, the weighting is wrong. (The concrete chip codes the API returns are enumerated in [`feed-api.md`](./feed-api.md).)

## 9. Anti-gaming summary

The composite defence is layered rather than any single rule: sybil-weighting on all counts, Bayesian smoothing and caps on velocity, quality-weighted feedback, duplicate penalties, exploration exposure that cannot be bought, and a paid lane that is structurally walled off from organic signal. No single manipulated input can move rank far on its own.

## 10. Build phasing

**MVP feed (Phase 0, now) — BUILT:**
- Retrieval with moderation/quality/dedup filters.
- Organic score from weighted intent, supporter velocity, feedback quality, quality score, and a thin trust score (KYC + co-sign).
- Onboarding-based personalisation with content-based similarity.
- Exploration lane and category diversity in the policy layer.
- Explainability chips.
- Paid placement injection walled off.

**Later (Phase 2+):**
- Item-to-item collaborative filtering once co-pledge density supports it.
- Delivery-track-record and milestone-health trust signals.
- Funding-proximity utility signal for live campaigns.
- Per-user model tuning on observed engagement and, ideally, on downstream pledge-to-funding conversion rather than clicks, since conversion is your real objective and clicks are gameable.

A deliberate note on the objective function: optimise the feed toward pre-pledge-to-funding conversion, not impressions or clicks. Conversion is the metric that matters for your core risk (backer demand), and optimising for clicks would quietly reintroduce the engagement-farming incentives you are otherwise designing against.
