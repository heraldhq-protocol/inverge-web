# Advertising and sponsorship — implementation plan

Status: implementation note for the preview build. The production serving
contract lives in `inverge-api/docs/api/advertising.md`.

## Scope of this change

Build the web-side advertising capability as a typed, preview-data feature:
placements, creative validation, deterministic selection, labels, consent,
analytics events, admin inventory, and policy documentation. No advertiser is
live, no impression is billable, and no revenue figure is claimed.

## Components

| Concern | Location |
|---|---|
| Domain types and closed unions | `src/features/advertising/types.ts` |
| Placement registry / responsive eligibility | `src/features/advertising/lib/placements.ts` |
| Pure selection, rotation, scheduling, density | `src/features/advertising/lib/selection.ts` |
| Creative and destination validation, status transitions | `src/features/advertising/lib/validation.ts` |
| Analytics event validation and dedupe keys | `src/features/advertising/lib/events.ts` |
| Consent record parsing | `src/features/advertising/lib/consent.ts` |
| Preview inventory | `src/features/advertising/content/preview-advertising.ts` |
| Browser preview store for admin | `src/features/advertising/lib/admin-store.ts` |
| Slot, card, banner, sidebar, consent/AdSense adapters | `src/features/advertising/components/*` |
| Event intake route | `src/app/api/advertising/events/route.ts` |
| Admin workspace | `src/app/admin/advertising/page.tsx` |
| Consent preferences | `src/app/(marketing)/advertising-preferences/page.tsx` |

## Placement policy

- Native first-party placements: labelled `Sponsored`, distinct surface, never
  inside organic ranking logic or validation figures.
- Feed placements only render when there are at least six organic results, so
  the page never reserves an empty slot.
- Rail placements are desktop-only through CSS and the registry; no mobile
  duplicate.
- Below-the-fold editorial placements are server-rendered and lazy in the sense
  that no off-screen provider script loads until consent and configuration.
- A page never shows the same creative twice; the selection helper enforces it.
- Third-party AdSense is an isolated adapter behind a flag, an explicit consent
  choice, and environment IDs. Default: off, renders nothing.

## Data and API

This repository has no advertising endpoint and no persistent activation
tables. The admin workspace is a browser preview store (same boundary as
campaign review, D-030) and says so. `inverge-api` gains the proposed schema and
the API contract document; Nest controllers are intentionally not wired in this
change.

The event route validates, deduplicates per session, rate-limits, rejects bots,
and returns `persisted: false` because no sink exists. It must not be described
as operational analytics.

## Integration points

- Campaign discovery and idea discovery: in-feed native card after organic
  results, passed from the server page as a child slot.
- Campaign and idea detail: desktop rail plus an in-content banner below the
  main tabs/story, away from funding and validation figures.
- Guides and journal: in-content banner and a third-party adapter in the
  editorial rail (only when explicitly configured and consented).
- Privacy notice and footer: advertising section and preferences link.

## Flags and environment

| Name | Effect | Default |
|---|---|---|
| `INVERGE_ADS_ENABLED` | Master switch for first-party inventory | on in development, off otherwise |
| `INVERGE_ADS_THIRD_PARTY_ENABLED` | Enables the AdSense adapter | off |
| `NEXT_PUBLIC_INVERGE_ADSENSE_CLIENT_ID` | Public AdSense client id | unset |
| `NEXT_PUBLIC_INVERGE_ADSENSE_SLOT_ID` | Public editorial slot id | unset |
| `INVERGE_ADS_ANALYTICS_ENABLED` | Accepts event posts | off |

## Verification

Unit tests cover selection, schedule, format, frequency, density, relevance,
flags, consent gating, creative validation, status permissions, event
validation/dedupe, and preference parsing. Component tests cover the
label/organic separation, disabled state, and mobile rail policy. Quality gates:
format, lint, typecheck, tests, build.

## Known gaps

- No advertiser self-service, billing, reconciliation, or revenue reporting.
- No production ad server, pacing, or impression ledger.
- No AdSense publisher approval; the adapter is inert without IDs.
- Static marketing pages select at build time; scheduling changes require
  revalidation until the API view is wired.
- Admin changes are local to one browser and not auditable server-side.
