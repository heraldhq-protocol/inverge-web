# INVERGE

**Milestone-escrowed crowdfunding and idea validation for African builders, on Solana**

Combined reference document — Product Requirements Document (PRD) v1.2 and Software Requirements Specification (SRS) v1.2 | July 2026 | Confidential draft

---

## Table of Contents

**Part I — Product Requirements Document (PRD) v1.2**
1. [Overview](#1-overview)
2. [Problem statement](#2-problem-statement)
3. [Objectives](#3-objectives)
4. [Target users](#4-target-users)
5. [What we are building](#5-what-we-are-building)
6. [What we are explicitly not building (at launch)](#6-what-we-are-explicitly-not-building-at-launch)
7. [Go-to-market strategy](#7-go-to-market-strategy)
8. [Monetisation](#8-monetisation)
9. [Compliance posture](#9-compliance-posture)
10. [Key risks and mitigations](#10-key-risks-and-mitigations)
11. [Roadmap summary](#11-roadmap-summary)

**Part II — Software Requirements Specification (SRS) v1.2**
1. [Introduction](#1-introduction)
2. [Overall description](#2-overall-description)
3. [Functional requirements](#3-functional-requirements)
4. [Non-functional requirements](#4-non-functional-requirements)
5. [External interfaces](#5-external-interfaces)
6. [Acceptance criteria (launch gate)](#6-acceptance-criteria-launch-gate)

---

# Part I — Product Requirements Document (PRD) v1.2

*Version 1.2 | July 2026 | Confidential draft — supersedes v1.1 (§8 Monetisation revised)*

## 1. Overview

Inverge is a crowdfunding and idea validation platform built for project creators in underserved regions, starting with Nigeria and West Africa. Creators publish ideas, gather validation signal from a real audience, and raise funds in stablecoins. Funds are held in an on-chain escrow programme on Solana and released in milestone tranches only when backers approve delivery. If a campaign fails to hit its funding target, or a creator fails to deliver an approved milestone, remaining funds are automatically refundable to backers.

The one-line pitch: *the crowdfunding platform where backers cannot get rugged.*

Inverge is crypto-powered, not crypto-flavoured. Backers fund campaigns through a checkout that abstracts wallets away, with a naira and card on-ramp converting into USDC or cNGN behind the scenes. All settlement, escrow and refund activity is verifiable on-chain and surfaced through a public transparency dashboard.

## 2. Problem statement

- Creators in Africa are locked out of mainstream crowdfunding platforms (Kickstarter, Indiegogo) by geographic and payout restrictions, despite strong demand for early-stage capital.
- Where crowdfunding does exist, the model is campaign-first: funds are disbursed in full at the end of a raise, after which backer leverage collapses and accountability becomes voluntary. In low-trust markets this is fatal.
- Backers, particularly diaspora Africans who want to fund projects back home, have no trustworthy vehicle: fraud fears, weak enforcement and opaque reporting suppress participation.
- Creators also lack a cheap way to validate demand before committing to a raise, so weak ideas raise (and fail) while strong ideas never surface.

## 3. Objectives

- Prove backer demand with a manual pilot of three to five curated campaigns before full contract launch.
- Launch the free idea validation product as a standalone wedge and acquisition channel.
- Ship the milestone escrow programme (fund, tranche release by backer approval, automatic refund) on Solana mainnet.
- Operate a public transparency dashboard from day one covering total escrowed, released and refunded funds.
- Secure at least one institutional co-sign (target: Superteam NG) for the launch cohort.
- Remain compliance-light at launch: rewards and donation based campaigns only, no equity, no platform token.
- Diversify revenue so platform operations do not depend solely on campaign completions, which can take months (see §8).

### Success metrics (first six months post-launch)

| Metric | Target | Notes |
|---|---|---|
| Validated ideas published | 150+ | Free validation product |
| Funded campaigns | 10 to 15 | Curated, all-or-nothing |
| Total value escrowed | USD 50k+ | USDC / cNGN |
| Milestone approval rate | 80%+ | Signal of healthy vetting |
| Refund events executed | At least 1, publicised | Proof the guarantee works |
| Backer repeat rate | 25%+ | Community moat indicator |
| Revenue independent of milestone completion | 75%+ of total | New — see §8.3; resilience target, not a growth target |

## 4. Target users

### Creators
- Early-stage founders, indie hackers and small businesses in Nigeria and West Africa needing USD 1k to 50k in pre-seed or product capital.
- Sourced through local tech hubs, Superteam NG, NACOS chapters, and university ecosystems.

### Backers
- Primary: diaspora Africans (UK, US, Canada, EU) who want to fund projects back home with real accountability.
- Secondary: global Web3-native backers already comfortable with stablecoins.
- Tertiary: local retail backers entering via the naira on-ramp with small tickets.

## 5. What we are building

### 5.1 Idea validation (free, ships first)

- Creators publish an idea page: problem, solution, roadmap, ask.
- Users signal support, leave structured feedback, and pre-pledge (an intent amount, no funds move).
- Validation metrics (supporters, pre-pledge total, feedback score) are public and become the qualification gate for opening a raise.
- Creators may optionally purchase paid placement (Basic or Featured tier, flat fee — see §8.1) to increase idea-page visibility. Boosted status never alters the underlying validation metrics themselves, which remain behavioural and unpurchasable.
- Zero regulatory exposure; builds the audience, waitlist and creator pipeline.

### 5.2 Campaigns and escrow

- Two campaign types: All-or-Nothing (default) and Flexible Funding (tier-gated, see 5.2a). All-or-nothing raises are denominated in USDC (and cNGN where available); if the target is not met by the deadline, the programme refunds all backers automatically.
- On success, funds sit in a campaign escrow PDA. Creators pre-define milestones at campaign creation, each with a tranche percentage, a deliverable, and an immutable evidence definition (e.g. demo link, repo commit, KPI and its measurement source).
- A working-capital tranche (sized to the milestone 1 budget, capped at 20–25% of the raise) releases to the creator immediately on successful funding, before any milestone is claimed — giving creators capital to begin work rather than requiring them to execute milestone 1 from zero. This tranche is disclosed to backers at checkout and, once released, is not eligible for refund even if the campaign later fails a milestone.
- Funds from a released tranche are unrestricted for the creator, but the next tranche only unlocks on approval of the next milestone, keeping incentives aligned through the whole project.

### 5.2a Flexible Funding and creator tiers

- Flexible Funding lets a campaign proceed on reaching a funding floor below 100% of target, rather than failing outright — useful for creators whose ask exceeds what a strict all-or-nothing bar would clear, without diluting the guarantee for backers who prefer the full protection of All-or-Nothing.
- Access is gated by a three-tier creator model: **Starter** (All-or-Nothing only), **Trusted** (70% floor, 1 concurrent campaign), **Established** (50% floor, up to 3 concurrent campaigns).
- Flexible Funding campaigns publish two immutable milestone plans at creation — one sized to the full target, one to the floor — so delivery scope is locked before funds move regardless of which outcome occurs. Raises landing between floor and target resolve via a seven-day objection window, the same silence-is-consent mechanism used for milestone approval.
- An upheld objection registers a strike and demotes the creator one tier; strikes decay after 6 months (1st strike) or 12 months (2nd strike) of continued active platform engagement, and a 3rd strike triggers mandatory admin review rather than a fixed expiry.

### 5.3 Milestone approval (objection-based voting)

- Creator submits a milestone claim with the required proof bundle.
- A seven-day review window opens. The milestone auto-approves unless backers representing a set share of contributed capital actively object.
- Any single wallet's voting weight is capped (10 to 15%) to prevent whale capture and refund-griefing.
- If the objection threshold is met, the milestone fails and remaining escrow (only) becomes refundable pro-rata; released tranches are not clawed back.
- Dispute layer: a failed milestone can be appealed to a small review panel with a 72-hour ruling window. Decentralise this panel over time.

### 5.4 Community layer

- Every campaign gets a discussion space; milestone claims and votes push notifications to backers.
- Public voting history builds backer reputation; consistent, fair voters earn standing. The reputation graph is a long-term moat.

### 5.5 On-ramp and wallet abstraction

- Embedded wallets (e.g. Privy) so backers sign up with email or social login; no seed phrases.
- Naira and card on-ramp via licensed local providers converting to USDC or cNGN at checkout; the backer experience is a normal payment flow.
- Off-ramp support for creators to convert released tranches to naira through the same licensed partners.

### 5.6 Transparency dashboard

- Public, real-time: total escrowed, released, refunded, per-campaign settlement links to the chain.
- Every refund event is published and turned into content; a visible refund is proof the guarantee works.

## 6. What we are explicitly not building (at launch)

- Equity or profit-sharing of any kind. On-chain equity makes Inverge a regulated securities portal under Nigeria's SEC Crowdfunding Rules (2021) and the Investments and Securities Act 2025. Equity is a Phase 3 exploration, gated behind an SEC-registered partner or licence.
- A platform token. Fee revenue is the model; a token adds regulatory surface and no product value.
- Open, unvetted campaign creation. Launch is curated; permissionless listing only after moderation and reputation systems mature.
- Pure token-weighted governance of milestone approval. The objection-plus-panel hybrid ships first.
- Pay-per-view or impression-based pricing for idea visibility. Billing against a metric that also functions as validation signal (views, impressions) creates a fraud surface and risks contaminating the behavioural data the validation module exists to produce. Paid visibility is sold as flat-fee placement tiers instead (§8.1).

## 7. Go-to-market strategy

### Positioning

Lead with the guarantee, not the chain: "back African builders, and your money comes back if they don't deliver." Solana, escrow PDAs and stablecoins are implementation detail in all mainstream messaging.

### Phased rollout

- **Validation wedge** (weeks 1 to 6): launch the free idea validation product, including Basic/Featured placement tiers (§8.1). Seed it through Superteam NG, NACOS Southeast, X (@unnamedcodes distribution), and campus communities. Goal: 150+ ideas, a backer waitlist, and the launch creator pipeline.
- **Manual pilot** (weeks 4 to 10, overlapping): three to five hand-picked campaigns with creators who already have audiences. Funds collected into a multisig, milestones released by hand. Campaign submission carries a flat curation/application fee from this phase onward (§8.1). This is the demand proof and the case-study engine.
- **Escrow launch** (months 3 to 5): ship the Anchor programme and run the first fully on-chain cohort, co-signed by Superteam NG. Publicise every settlement.
- **Diaspora push** (months 4 onwards): targeted content and community partnerships in UK/US/Canada Nigerian communities; the on-ramp checkout is the conversion weapon.

### Channels

- Superteam NG and local hubs for creator sourcing and institutional trust transfer.
- X build-in-public content: every campaign, milestone vote and refund is a story.
- Diaspora community groups, newsletters and events for backer acquisition.
- Case studies of funded (and refunded) campaigns as SEO and social proof.

### Launch trust levers

- Institutional co-sign of the first cohort (Superteam NG target).
- Heavy creator KYC and curation; light-touch backer onboarding for rewards campaigns.
- Transparency dashboard live before the first raise opens.

## 8. Monetisation

Revenue is deliberately spread across the lifecycle rather than concentrated at milestone completion, which can take months per campaign. §8.3 shows why this matters.

### 8.1 Revenue streams

| Stream | Mechanism | Fires at | Phase |
|---|---|---|---|
| Paid validation boosts | Tiered flat placement — Basic and Featured tier pricing; not sold per-view or per-impression | Idea publish | Phase 0 (launch) |
| Curation / application fee | Flat, non-refundable fee charged on campaign submission for admin review | Campaign submission | Phase 1 (manual pilot) |
| Payment (on-ramp) margin | 0.5–1% on fiat→stablecoin conversion, blended with partner fees | Each contribution | Launch |
| Working-capital tranche fee | 5% of the working-capital tranche released at funding close (part of the unified success fee, realised early) | Funding close | Launch |
| Milestone success fee | 5% of each subsequent tranche released on milestone approval | Each milestone | Launch |
| Off-ramp margin | 0.5–1% on stablecoin→naira conversion, blended with partner fees | Creator cash-out | Launch |
| Featured / sponsored placement | Flat fee, sold to vetted campaigns and brand partners | Ongoing | Phase 2 |
| Creator premium tools | Subscription: analytics, promotion, campaign coaching | Ongoing (recurring) | Phase 2 |
| Equity portal revenue | Carry or listing fees via licensed partner | Per equity deal | Phase 3, gated |

### 8.2 Flexible Funding pricing (Phase 3)

Flexible Funding carries more platform risk than All-or-Nothing — sub-target delivery, dual milestone plans, and added objection-window review overhead — which justifies a premium over the 5% All-or-Nothing rate. That premium is charged as a single, consolidated, disclosed success-fee rate; it is not stacked with a separate payment-processing fee on top. A stacked structure (e.g. a 9% success fee plus a 3–5% processing fee) can push the effective take rate above 10–13%, which is above the level at which Indiegogo discontinued its own flexible-funding option in 2025. Recommended rate: 7–8% for Trusted-tier creators, scaling down toward 6–7% for Established-tier creators, so the tier system that Flexible Funding sits behind continues to reward, rather than penalise, a clean delivery record.

### 8.3 Revenue resilience

Of the streams above, paid validation boosts, the curation/application fee, the payment (on-ramp) margin, and the working-capital tranche fee all fire before or independently of milestone completion. Off-ramp margin and featured placement are similarly decoupled from delivery outcomes. Only the milestone success fee is gated on a creator actually completing a milestone.

Under illustrative six-month launch assumptions (see companion Revenue Model workbook), 77–91% of total projected revenue across worst/good/best cases is realised independently of milestone completion. This is a resilience design, not a substitute for runway: at launch scale, absolute revenue is modest relative to fixed costs such as the mandatory pre-mainnet security audit (NFR-01, SRS §4.1), and external funding (grant or pre-seed) should be assumed as the primary funding source through Phase 2, with this revenue mix reducing burn rather than replacing capital.

A one-line explicit rejection, for avoidance of doubt: Inverge does not deploy escrowed backer funds into yield-generating strategies to create an additional revenue stream. Doing so would reintroduce custodial and smart-contract risk into funds the platform has committed to hold inertly, undermining the core "backers cannot get rugged" guarantee. This is excluded permanently, not deferred to a later phase.

## 9. Compliance posture

- Launch scope is rewards and donation based crowdfunding only, which sits largely outside securities regulation; the moment backers expect monetary return, SEC rules apply, hence the hard equity gate.
- Stablecoin flows run through licensed VASP / on-ramp partners; Inverge does not custody fiat.
- Creator KYC is mandatory (they receive funds); backer KYC is threshold-based.
- Engage Nigerian counsel before mainnet launch to confirm the rewards-only posture and monitor ISA 2025 guidance.

## 10. Key risks and mitigations

| Risk | Description | Mitigation |
|---|---|---|
| Backer cold-start | Not enough funders for early campaigns | Manual pilot before build; diaspora focus; validation waitlist |
| Voter apathy | Milestone votes fail to reach turnout | Objection-based auto-approval with quorum veto |
| Whale griefing | Large backer forces refunds strategically | Per-wallet vote cap; refunds limited to remaining escrow |
| Fraudulent campaign | A scam slips through and damages the brand | Curated launch, heavy creator KYC, evidence-bound milestones, dispute panel |
| Regulatory shift | Nigerian crypto policy reverses again | Rewards-only scope, licensed partners, counsel on retainer, multi-market design |
| Contract exploit | Escrow programme vulnerability | Audit before mainnet, staged caps on escrow size, bug bounty |
| Revenue concentration | Over-reliance on milestone completions, which lag campaign funding by months | Front-loaded streams (boosts, curation fee, on-ramp margin, working-capital tranche fee) per §8.3 |

## 11. Roadmap summary

| Phase | Scope | Exit criteria |
|---|---|---|
| 0. Validation | Free idea validation product live, incl. Basic/Featured boost tiers | 150+ ideas, backer waitlist, 5 pilot creators signed |
| 1. Manual pilot | 3 to 5 curated campaigns, multisig escrow, curation fee live | 2+ fully funded, 1 full milestone cycle completed |
| 2. Escrow launch | Anchor programme, objection voting, dashboard, on-ramp, featured placement, premium tools | First on-chain cohort settled; audit passed |
| 3. Scale | Diaspora growth, reputation system, Flexible Funding launch (tier-gated, consolidated fee per §8.2) | USD 50k+ escrowed, 25% backer repeat rate |
| 4. Equity exploration | Licensed-partner model for equity campaigns | Regulatory pathway confirmed with counsel and SEC-registered partner |

---

# Part II — Software Requirements Specification (SRS) v1.2

*Version 1.2 | July 2026 | Companion to Inverge PRD v1.2 — adds FR-206/206a (boost tiers) and FR-311 (application fee)*

## 1. Introduction

### 1.1 Purpose

This document specifies the software requirements for Inverge, a crowdfunding and idea validation platform in which raised funds are held in an on-chain escrow programme on Solana and released in milestone tranches subject to backer approval. It defines functional requirements, non-functional requirements, external interfaces and design constraints for the launch scope (Phases 0 to 2 of the PRD roadmap). It is intended for the development team, auditors, and partner reviewers.

### 1.2 Scope

The system comprises: (a) a web application for creators and backers; (b) a backend service layer handling identity, KYC orchestration, notifications, content, monetisation and off-chain metadata; (c) an Anchor programme on Solana implementing campaign escrow, milestone tranching, objection-based approval and refunds; (d) integrations for embedded wallets, fiat on/off-ramp, and stablecoin settlement; and (e) a public transparency dashboard.

Out of scope for this release: equity or profit-sharing campaigns, any platform token, permissionless (unvetted) campaign listing, fully decentralised dispute governance, Flexible Funding (specified in §3.3.1 for design continuity; implementation is gated to Phase 3), and any yield-generating deployment of escrowed funds (permanently excluded, see PRD §8.3).

### 1.3 Definitions and abbreviations

| Term | Definition |
|---|---|
| Campaign | A fundraising listing with a target amount, deadline and ordered set of milestones |
| Escrow PDA | Programme-derived account holding a campaign's funds on Solana |
| Tranche | The percentage of escrowed funds released on approval of one milestone |
| Objection window | Fixed review period during which backers may object to a milestone claim |
| Proof bundle | Evidence attached to a milestone claim, defined immutably at campaign creation |
| Pre-pledge | A non-binding statement of intent on a validation idea; no funds move |
| VASP | Virtual Asset Service Provider (licensed on/off-ramp partner) |
| cNGN | Regulated naira-pegged stablecoin |
| Flexible Funding | A campaign type in which reaching a funding floor below 100% of target allows the campaign to proceed, gated by creator tier |
| Funding floor | The minimum percentage of target a Flexible Funding campaign must reach to proceed; fixed and disclosed per campaign |
| Working-capital tranche | A first tranche released to the creator immediately on successful funding, before any milestone is claimed or approved |
| Strike | A record of an upheld objection against a creator, causing tier demotion and a time-limited block on progression |
| Boost | A paid, flat-fee placement upgrade applied to an idea page; does not alter underlying validation metrics |
| Application fee | A flat, non-refundable fee charged at campaign submission to fund curation review |

### 1.4 References

- Inverge PRD v1.2 (July 2026)
- Inverge Validation Survey and analysis guide
- Inverge Revenue Model workbook (companion, six-month simulation)
- Nigeria SEC Rules on Crowdfunding (2021); Investments and Securities Act 2025

## 2. Overall description

### 2.1 Product perspective

Inverge is a new, self-contained product composed of a Next.js web client, a NestJS backend with PostgreSQL, and a Solana Anchor programme. Funds never pass through Inverge-controlled bank accounts: fiat conversion is performed by licensed on-ramp partners, and custody of raised funds rests with the on-chain escrow programme. The backend holds no spending authority over escrowed funds.

### 2.2 User classes

| User class | Characteristics |
|---|---|
| Visitor | Unauthenticated; can browse ideas, campaigns and the transparency dashboard |
| Backer | Authenticated via email/social login with an embedded wallet; funds campaigns, votes on milestones |
| Creator | KYC-verified account; publishes ideas, runs campaigns, submits milestone claims, withdraws released tranches, may purchase boosts |
| Reviewer | Platform-appointed dispute panel member; rules on appealed milestones |
| Admin | Inverge operations; curates campaigns, manages KYC status, configures platform parameters and fee rates |

### 2.3 Operating environment

- Web client: responsive, mobile-first (majority of Nigerian traffic is mobile), modern evergreen browsers.
- Blockchain: Solana mainnet-beta; devnet for staging. SPL Token (USDC, cNGN where available).
- Backend: containerised NestJS services, PostgreSQL, Redis for queues/notifications.

### 2.4 Constraints

- Launch campaigns are rewards/donation based only; nothing in the system may promise financial return.
- Creator KYC is mandatory before a campaign can be published; backer KYC is threshold-based.
- All escrow state transitions must be executable and verifiable on-chain without backend availability.
- Refund fan-out must respect Solana compute and account limits (claim-based refunds rather than push payments).
- Paid boosts and placement shall never influence, weight, or be conflated with public validation metrics (supporter count, pre-pledge total, feedback score).

### 2.5 Assumptions and dependencies

- A licensed on-ramp partner provides naira/card to USDC (and off-ramp for creators) via API.
- Embedded wallet provider (e.g. Privy) supplies non-custodial wallets bound to user login.
- Superteam NG (or equivalent) co-signs the launch cohort; curation remains manual at launch.
- A payment processor supports one-off flat-fee charges (boosts, application fee) in addition to the on/off-ramp conversion flow.

## 3. Functional requirements

### 3.1 Identity, onboarding and KYC

| ID | Requirement | Priority |
|---|---|---|
| FR-101 | Users shall register and sign in with email or social login; an embedded Solana wallet shall be provisioned automatically on first login. | Must |
| FR-102 | Users may optionally connect an external Solana wallet and set it as their funding or payout wallet. | Should |
| FR-103 | Creators shall complete identity verification (KYC) through an integrated provider before any campaign can be submitted for review. | Must |
| FR-104 | Backers shall be able to fund campaigns without KYC below a configurable cumulative threshold; exceeding it shall require verification before further funding. | Must |
| FR-105 | The system shall record KYC status transitions with timestamps for audit purposes, without storing raw identity documents on Inverge infrastructure. | Must |

### 3.2 Idea validation module

| ID | Requirement | Priority |
|---|---|---|
| FR-201 | Creators shall publish an idea page containing problem, solution, roadmap and intended ask. | Must |
| FR-202 | Authenticated users shall be able to support an idea, leave structured feedback, and pre-pledge an intent amount; no funds shall move at this stage. | Must |
| FR-203 | Idea pages shall display public validation metrics: supporter count, total pre-pledged intent, and feedback summary. | Must |
| FR-204 | The system shall enforce a configurable validation threshold (e.g. minimum supporters and pre-pledge total) before a creator may convert an idea into a campaign draft. | Should |
| FR-205 | Converting an idea shall carry its supporters over as a notified waitlist for the campaign launch. | Should |
| FR-206 | Creators shall be able to purchase a paid boost for a published idea, at one of two flat-fee tiers (Basic, Featured) configured by admin. Boost purchase shall be a one-off, non-recurring charge processed through the payment integration (FR-402-class flow). | Must |
| FR-206a | Boosted placement shall affect only discovery surfacing (e.g. category ranking, homepage rotation) and shall never modify, weight, or be visually merged with the validation metrics defined in FR-203. Boosted ideas shall be visually labelled as promoted. | Must |

### 3.3 Campaign creation and curation

| ID | Requirement | Priority |
|---|---|---|
| FR-301 | Campaign creation shall require: target amount in USDC, deadline, reward tiers (optional), and an ordered list of 2 to 6 milestones. | Must |
| FR-302 | Each milestone shall define: title, deliverable description, tranche percentage, and an evidence definition (what proof will be submitted and its source). Tranche percentages shall sum to 100. | Must |
| FR-303 | Milestone definitions and evidence definitions shall be immutable once the campaign is published; a content hash of the campaign terms shall be stored on-chain. | Must |
| FR-304 | All campaigns shall pass admin review (curation) before publication; admins may request changes or reject with reasons. | Must |
| FR-305 | Published campaigns shall be all-or-nothing: reaching the target by the deadline activates escrow; failure triggers full refund availability. | Must |
| FR-311 | Submitting a campaign for curation review (FR-304) shall require payment of a flat, non-refundable application fee, configurable by admin. Payment shall be a precondition of entering the review queue; the fee is retained regardless of review outcome (approval, change request, or rejection). | Must |

#### 3.3.1 Flexible Funding and creator tiers

*Phase 3 scope (see PRD §11 roadmap) — specified here for design continuity with the launch escrow model. Priority ratings below are relative to Flexible Funding's own release, not the Phase 0–2 launch gate.*

Inverge supports two campaign types: All-or-Nothing (default, per FR-305, launch scope) and Flexible Funding, in which a campaign that clears a funding floor below 100% of target may proceed rather than fail outright. Flexible Funding is gated by a three-tier creator eligibility model — Starter, Trusted, Established. Per PRD §8.2, Flexible Funding's success-fee premium shall be a single consolidated rate (recommended 7–8% for Trusted, 6–7% for Established), never stacked with a separate processing fee on top of the FR-505 base mechanism.

| ID | Requirement | Priority |
|---|---|---|
| FR-306 | The system shall gate Flexible Funding campaign creation by a three-tier creator eligibility model: Starter (no completed campaign, or active strikes) restricted to All-or-Nothing only; Trusted (1 completed campaign, zero active strikes) accesses a 70% funding floor; Established (2+ completed campaigns, zero active strikes, $10,000+ prior raise, 90+ days tenure, $1,000+ backed across 3+ creators) accesses a 50% funding floor. The funding floor shall be fixed and disclosed at campaign creation. | Must |
| FR-306a | A campaign published under Flexible Funding shall define two immutable milestone plans at creation, both subject to admin review under FR-304: a primary plan sized to the full target, and a floor-scenario plan sized to the funding floor. | Must |
| FR-306b | If a Flexible Funding campaign raises an amount between its floor and its target, a 7-day objection window shall open at funding close, following the same objection-based logic as milestone approval (FR-603/FR-604). | Must |
| FR-306c | The Flexible Funding success-fee rate shall be configured as a single value per creator tier (Trusted, Established), stored and disclosed independently from the on/off-ramp payment margin (FR-402, FR-405); the system shall not apply a separate processing surcharge on top of this rate. | Must |
| FR-307 | The system shall limit concurrent active campaigns per creator by tier: Starter and Trusted limited to 1; Established limited to 3. | Must |
| FR-308 | A creator's contributions toward the Established-tier backing requirement (FR-306) shall only accrue during periods in which the creator has zero active campaigns. | Must |
| FR-309 | An upheld objection against any of a creator's campaigns shall register one strike and demote them by one tier; a creator's strike count shall reset to 0 upon demotion. | Must |
| FR-310 | Strike expiry shall scale with strike count: 1st strike blocks progression 6 months; 2nd strike 12 months; 3rd strike triggers mandatory admin review. Block periods count down only during active platform engagement. | Must |

### 3.4 Funding and payments

| ID | Requirement | Priority |
|---|---|---|
| FR-401 | Backers shall fund campaigns in USDC (and cNGN where supported) from their embedded or connected wallet. | Must |
| FR-402 | The checkout shall offer fiat on-ramp (card, bank transfer, naira rails) via the licensed partner, converting to stablecoin and completing the contribution in a single flow. | Must |
| FR-403 | Each contribution shall be recorded on-chain against the backer's wallet with amount and timestamp, and mirrored off-chain for display. | Must |
| FR-404 | Backers shall receive a receipt and a link to the on-chain transaction for every contribution. | Must |
| FR-405 | Creators shall be able to initiate off-ramp of released tranches to naira through the partner integration. | Should |
| FR-406 | The system shall process one-off flat-fee charges (idea boosts FR-206, campaign application fee FR-311) through the same payment integration used for on-ramp contributions, independently of any campaign escrow flow. | Must |

### 3.5 Escrow programme (on-chain)

| ID | Requirement | Priority |
|---|---|---|
| FR-501 | The Anchor programme shall hold all contributions for a campaign in a campaign-specific escrow PDA holding SPL tokens. | Must |
| FR-502 | If the funding target is not met by the deadline, the programme shall enable claim-based refunds: each backer may withdraw their full contribution; unclaimed funds remain claimable indefinitely. | Must |
| FR-503 | On successful funding, the programme shall lock campaign terms (terms hash, milestones, tranche percentages) and transition the campaign to active state. | Must |
| FR-503a | On successful funding, the programme shall release a working-capital tranche to the creator immediately, sized to the published budget of milestone 1 and capped at 20–25% of total escrow. This tranche shall be disclosed to backers at checkout as funds released before any milestone is verified, and is not eligible for refund under FR-506. The platform success fee (FR-505) applies to this tranche at the moment of its release. | Must |
| FR-504 | Tranche release shall be executable only on milestone approval, transferring the milestone's percentage of the original escrow total to the creator's payout wallet, minus the platform fee. | Must |
| FR-505 | The platform success fee (5% of each released tranche under All-or-Nothing; per FR-306c for Flexible Funding) shall be transferred to the platform treasury atomically with each tranche release. | Must |
| FR-506 | On milestone failure (upheld objection), the programme shall enable pro-rata claim-based refunds of the remaining escrow balance only; previously released tranches are not clawed back. | Must |
| FR-507 | All state transitions shall emit events sufficient for the transparency dashboard to be reconstructed solely from chain data. | Must |
| FR-508 | The programme shall enforce a per-campaign escrow cap configurable by governance, to stage risk during early mainnet operation. | Should |
| FR-509 | The escrow programme shall provide no function capable of deploying escrowed balances into any external yield-bearing protocol or lending market; this is a permanent design exclusion, not a configurable parameter (PRD §8.3). | Must |

### 3.6 Milestone claims and objection voting

| ID | Requirement | Priority |
|---|---|---|
| FR-601 | Creators shall submit a milestone claim by attaching the proof bundle matching the milestone's evidence definition. | Must |
| FR-602 | Submission of a claim shall open a 7-day objection window (configurable per campaign class) and notify all backers. | Must |
| FR-603 | A milestone shall auto-approve at window close unless objections representing at least the objection threshold (default 30% of contributed capital) are registered. | Must |
| FR-604 | Voting weight shall be proportional to contribution, with any single wallet's effective weight capped at a configurable maximum (default 15%). | Must |
| FR-605 | Objections shall require a reason selected from structured categories plus optional free text, visible to the creator and reviewers. | Should |
| FR-606 | If the objection threshold is met, the milestone shall enter failed state; the creator may appeal within 72 hours, moving the milestone to disputed state. | Must |
| FR-607 | A quorum of the reviewer panel shall rule on disputed milestones within 72 hours; the ruling shall be executed on-chain via a multisig-controlled reviewer authority and published with written reasons. | Must |
| FR-608 | Backers who voted shall have their participation recorded to a public per-wallet voting history. | Should |

### 3.7 Community and notifications

| ID | Requirement | Priority |
|---|---|---|
| FR-701 | Every campaign shall include a discussion space visible to backers and the creator; creators may post updates. | Should |
| FR-702 | The system shall notify backers of: campaign funded, milestone claim submitted, objection window closing in 48 hours, milestone outcome, refund availability. | Must |
| FR-703 | Backer profiles shall display contribution count, campaigns backed, and voting participation (reputation view). | Should |

### 3.8 Transparency dashboard

| ID | Requirement | Priority |
|---|---|---|
| FR-801 | A public dashboard shall display, in near real time: total value escrowed, released, and refunded, plus counts of active, completed and refunded campaigns. | Must |
| FR-802 | Every campaign page shall link each escrow event (funding close, tranche release, refund) to its Solana transaction. | Must |
| FR-803 | Dashboard figures shall be derived from on-chain data (indexer), not from backend records. | Must |

### 3.9 Administration

| ID | Requirement | Priority |
|---|---|---|
| FR-901 | Admins shall manage campaign review queues, KYC status, reviewer panel membership, and platform parameters (fee, thresholds, windows, caps). | Must |
| FR-902 | Parameter changes affecting on-chain behaviour shall be executed through a multisig and logged publicly. | Must |
| FR-903 | Admins shall be able to freeze a campaign's off-chain listing without gaining any authority to move escrowed funds. | Must |
| FR-904 | Admins shall be able to configure Basic and Featured boost prices (FR-206) and the campaign application fee (FR-311) independently of on-chain parameters, with changes logged for audit. | Must |

## 4. Non-functional requirements

### 4.1 Security

- NFR-01: The escrow programme shall undergo an independent audit before mainnet deployment; findings of high severity must be resolved before launch.
- NFR-02: No backend service shall hold a key with authority to move escrowed funds; reviewer and admin on-chain authorities shall be multisigs.
- NFR-03: All user sessions shall use short-lived tokens; sensitive actions require re-authentication.
- NFR-04: The platform shall maintain a published bug bounty covering the programme and backend.

### 4.2 Performance and availability

- NFR-05: Interactive pages shall reach usable state within 3 seconds on a mid-range Android device over 3G.
- NFR-06: Contribution flow (excluding on-ramp partner latency) shall complete within 15 seconds at P95.
- NFR-07: Core browsing and the dashboard shall remain available read-only during backend maintenance.

### 4.3 Reliability and integrity

- NFR-08: The indexer shall reconcile on-chain state with the database at least every 5 minutes; discrepancies shall alert operations.
- NFR-09: Refund availability shall never depend on backend uptime; claims are executable directly against the programme.

### 4.4 Usability and accessibility

- NFR-10: No crypto terminology in default backer flows; wallet, gas and chain mechanics shall be abstracted with progressive disclosure.
- NFR-11: The web client shall meet WCAG 2.1 AA for core flows.

### 4.5 Compliance and privacy

- NFR-12: The system shall store no raw KYC documents; only provider references and status.
- NFR-13: Personal data handling shall comply with the Nigeria Data Protection Act 2023; users may request account deletion (subject to on-chain immutability).
- NFR-14: All copy and campaign templates shall be reviewed to avoid language implying investment returns.
- NFR-15: Boost and placement marketing copy shall not imply that paid visibility affects validation-metric authenticity or campaign approval odds.

## 5. External interfaces

| Interface | Purpose | Notes |
|---|---|---|
| Embedded wallet API | Wallet provisioning, signing | e.g. Privy; login-bound, non-custodial |
| On/off-ramp partner API | Fiat to USDC/cNGN and reverse | Licensed VASP; webhook settlement confirmation |
| KYC provider API | Creator and threshold backer verification | Status webhooks; no document storage |
| Solana RPC / indexer | Programme calls, event indexing | Dedicated RPC with failover; Helius-class indexing |
| Email/push service | Notifications | Objection-window alerts are time-critical |
| Payment processor (flat-fee) | Boost purchases, application fees | Separate from on-ramp conversion flow; card/local rails |

## 6. Acceptance criteria (launch gate)

- A campaign can complete the full lifecycle on devnet and mainnet: publish, fund to target, three milestone cycles including one objection and one appeal, final tranche release.
- A failed campaign (target missed) allows every test backer to claim a full refund without backend assistance.
- A failed milestone allows pro-rata refund claims of remaining escrow only.
- Dashboard totals match independently indexed chain data exactly.
- Security audit passed with no unresolved high/critical findings; multisig control verified for all privileged authorities.
- End-to-end naira on-ramp contribution completed by a non-crypto test user without assistance.
- A Basic and a Featured boost can be purchased end-to-end (FR-206) without any change to the underlying idea's validation metrics (FR-206a).
- A campaign submission is blocked from entering the curation queue until the application fee (FR-311) is paid.
