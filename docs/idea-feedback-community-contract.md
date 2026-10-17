# Idea feedback, community and goals: web contract

Status: **web implementation complete on preview data; API extension proposed.**
Last updated: 2026-10-17.

This document is the swap point for the configurable feedback, community-growth
and flexible-goal work. The web app implements the full experience against typed
preview records in `src/features/feedback` and
`src/features/idea-builder`. Nothing below is claimed to exist in `inverge-api`
today; the existing survey endpoints are listed first so the delta is explicit.

## What already exists (reused, not duplicated)

| Capability | Existing authority | Notes |
| --- | --- | --- |
| Creator-authored questions | `PUT /ideas/:id/survey` (`SetSurveyDto`) | Whole-set replacement, editable while `DRAFT` only. |
| Public questions | `GET /ideas/:id/survey` | Ordered by `index`. |
| Submit one response | `POST /ideas/:id/survey/responses` | One per `(idea, user)`; upsert. |
| Withdraw | `DELETE /ideas/:id/survey/responses` | Deletes the caller's response. |
| Validation | `survey-validation.ts` | Types `RATING`, `TEXT`, `SINGLE_CHOICE`, `MULTI_CHOICE`, `BOOLEAN`. |
| Rating aggregation | `MetricsService.recompute` | `RATING` answers feed `feedbackScore`; response count feeds `feedbackCount`. |
| Creator analytics | `GET /ideas/:id/insights` | Rating histogram, per-question aggregates, top comments, gate progress. |

Image reference: `docs/ui concept/marketing ui` is unrelated. The four idea-section
references are in `docs/ui concept/idea section ui`.

## Proposed additive API changes

All items are additive. No existing field is renamed, and no existing endpoint
changes behaviour.

### 1. Form settings and version

`SurveyQuestion` currently has no parent form record. Add:

```prisma
model IdeaFeedbackForm {
  id          String   @id @default(cuid())
  ideaId      String   @unique
  idea        Idea     @relation(fields: [ideaId], references: [id], onDelete: Cascade)
  enabled     Boolean  @default(true)
  title       String   @db.VarChar(120)
  description String?  @db.VarChar(400)
  version     Int      @default(1)
  publishedAt DateTime?
  updatedAt   DateTime @updatedAt
}
```

- `version` increments only when a published form is changed. A draft edit does
  not increment it.
- `SurveyResponse` gains `formVersion Int`. Existing rows are backfilled to the
  version current at migration time, so historical answers are never reinterpreted
  against a later question set.
- `SurveyQuestion` gains `helpText String?` and, for `RATING`, optional
  `scaleMin Int?`, `scaleMax Int?`, `minLabel String?`, `maxLabel String?`.
  A `SCALE` question type can be added, or `RATING` can carry the labels; the web
  treats `scale` as a rating with explicit bounds and does **not** count it in the
  overall rating unless `type = RATING`.

### 2. Endpoints

| Method | Path | Guard | Change |
| --- | --- | --- | --- |
| `GET` | `/ideas/:id/feedback` | Optional | Returns `{ enabled, title, description, version, questions }`. Empty/disabled is a valid 200. Replaces reading `/survey` for rendering. |
| `PUT` | `/ideas/:id/feedback` | Privy + owner | Upserts form settings and questions in one transaction. Validates on the server. A published change increments `version`. |
| `POST` | `/ideas/:id/feedback/draft` | Privy + owner | Optional: save without publishing. If omitted, the web keeps drafts local (current behaviour). |
| `POST` | `/ideas/:id/feedback/responses` | Privy | Same validation as `/survey/responses`, plus `formVersion` from the current form. Rejects answers to questions not in that version. |
| `PATCH` | `/ideas/:id/goals` | Privy + owner | `{ feedback, community, funding }` booleans. Independent of lifecycle status. |
| `PUT` | `/ideas/:id/community` | Privy + owner | Invitation settings and destinations. |
| `POST` | `/ideas/:id/follow` / `DELETE` | Privy | Idempotent follow of the creator. |

`GET /ideas/:id` widens with `goals`, `community` (enabled destinations only),
`creator.follow`, and `feedbackForm` metadata (never response data).

### 3. Goals

Goals are creator intent, not a lifecycle state. They must not:

- create a campaign, draft or otherwise;
- change `discoverabilityTier`, `status`, quality score, or gate thresholds;
- imply campaign approval, escrow access, or payout eligibility.

`funding: true` only permits the optional ask and non-binding pre-pledge UI.
`creatorPrePledgeTarget` remains the only field that affects FR-204.

### 4. Community destinations

```ts
type CommunityDestination = {
  kind: 'website' | 'whatsapp' | 'telegram' | 'discord' | 'newsletter' | 'profile' | 'other';
  label: string;   // moderated, <= 60 chars
  url: string;     // https only, or a relative /creators/... path
  enabled: boolean;
};
```

Server rules, mirrored by `validateCommunityUrl` in the web app:

- only `https:` absolute URLs, or a same-origin relative path starting `/`;
- reject `javascript:`, `data:`, `http:`, protocol-relative `//`, and hostnames
  without a dot;
- moderate `label` on write, cap length, strip control characters;
- never report a click as a join, and never opt a respondent into marketing.

### 5. Follow

No follow model exists. Proposed minimum:

```prisma
model CreatorFollow {
  id        String   @id @default(cuid())
  followerId String
  creatorId  String
  createdAt  DateTime @default(now())

  @@unique([followerId, creatorId])
  @@index([creatorId])
}
```

Rules: no self-follow, idempotent create, authenticated only, and a public
`followerCount` that excludes banned accounts. The web button currently says
following is not connected rather than faking success.

## Web implementation map

| Area | File |
| --- | --- |
| Types, question metadata, limits | `src/features/feedback/types.ts` |
| Pure validation, URL policy, rating aggregation | `src/features/feedback/lib/feedback.ts` |
| Preview forms, community, goals, submissions | `src/features/feedback/content/preview-feedback.ts` |
| Respondent dialog and thank-you | `src/features/feedback/components/feedback-dialog.tsx` |
| Community invitation and follow state | `src/features/feedback/components/community-invite.tsx` |
| Creator builder | `src/features/feedback/components/feedback-builder.tsx` |
| Multi-step creation flow | `src/features/idea-builder/components/idea-builder.tsx` |
| Draft validation | `src/features/idea-builder/lib/validation.ts` |
| Analytics aggregation | `src/features/analytics/lib/feedback-summary.ts` |
| Merged public record | `src/features/ideas/content/preview-idea-detail.ts` |

## Persistence honesty

This repository has no authenticated session or network layer. Therefore:

- respondent answers persist in `sessionStorage` per form version, so closing the
  dialog or following a sign-in link does not lose them;
- builder drafts persist in `localStorage`;
- both surfaces are labelled `Preview`, and the success state says nothing was
  sent to the creator;
- no endpoint is called and no success is simulated as a server confirmation.

The swap points are the preview modules above and the server functions noted in
this document.

## Tests

- `src/features/feedback/lib/feedback.test.ts` — question and answer validation,
  option rules, scale bounds, URL policy, enabled destinations, rating scope.
- `src/features/ideas/components/idea-actions.test.tsx` — form off, configured
  questions, required validation, success, sign-in gate, funding visibility.
- `src/features/idea-builder/lib/validation.test.ts` — optional roadmap, goals,
  funding conditional, community URL, completeness.
- `src/features/analytics/lib/feedback-summary.test.ts` — version scoping, rating
  scope, choice tallies, text deduplication, disabled form.
