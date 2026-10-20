# Dashboard page inventory

Status of every page the dashboard needs and every page it currently has.
Snapshot taken on `feat/unified-dashboard` after the unified-shell work and the
creator-namespace move (D-017); update this file when a route is added,
removed, or promoted from stub to real.

Ground rules that shape this list:

- Creator surfaces live under `/d/creator/*` (D-017); public idea surfaces live
  under `/ideas` (D-014). Old `/d/ideas*` paths 308-redirect to their new homes.
- There is no auth session and no API data layer yet. Every page reads
  `content/preview-*.ts` fixtures through a server seam. A page may show a
  metric only when a fixture record actually supports it.
- Tabs are only rendered for routes that exist (`CreatorStudioTabs`,
  `IdeaWorkspaceTabs`), so a section appears when its page ships, never before.

## 1. Available now — inside `/d`

| Route | Page | State |
| --- | --- | --- |
| `/d` | Home | Full. Greeting, featured band, quick actions, momentum grid, activity rail |
| `/d/discover` | In-shell discovery | Full. Reuses the public `IdeasDashboard` with filters, topics, featured band |
| `/d/pre-pledges` | Pre-pledges | Real list with fixture intents. Own loading/error |
| `/d/creator` | Creator Studio overview | Real. Metrics, suggested next steps, recent ideas, feedback/analytics entry cards |
| `/d/creator/ideas` | My ideas | List of owned ideas with metrics. **No filters, search, sort, or archive yet** |
| `/d/creator/ideas/new` | Idea builder | Full four-step flow with draft autosave |
| `/d/creator/ideas/[id]` | Idea workspace | Real. Status, cover, metric cards, summary, latest responses; links only to routes that resolve for the idea |
| `/d/creator/ideas/[id]/feedback` | Feedback form setup | Real. Configures questions for one idea |
| `/d/creator/feedback` | Feedback inbox (all ideas) | Real, read-only. Responses grouped by idea, newest first, anonymous |
| `/d/creator/analytics` | Analytics (all ideas) | Real. Idea picker plus aggregate cards |
| `/d/creator/ideas/[id]/insights` | Analytics (one idea) | Real and the richest screen: chart, activity, feedback breakdown, gated AI insights |
| `/d/creator/ideas/[id]/insights/traffic` | Traffic tab | Honest empty state — no view tracking exists |
| `/d/creator/ideas/[id]/insights/referrals` | Referrals tab | Honest empty state |
| `/d/creator/ideas/[id]/insights/supporters` | Supporters tab | Real, tiered breakdown |
| `/d/creator/ideas/[id]/insights/interest` | Interest tab | Real, feedback breakdown plus AI panel |
| `/d/ideathons` | Ideathons | Real participant workspace for the active programme |
| `/d/notifications` | Notifications | Real list with unread states |
| `/d/profile` | Profile | Real. Identity preview plus the creator's public surface |
| `/d/settings` | Settings | Real form, surfaces programme-admin access when present |
| `/d/saved` | Saved campaigns | Real list of this browser's saves (D-023), resolved against the public campaign set. An id that no longer resolves is shown as unavailable rather than dropped. Not account-synced, and the page says so |

### Campaign surfaces

Added with the campaign experience (D-018) on `feat/campaign-experience`. Both
areas are preview data behind `src/features/campaigns/server/`; no route below
moves money.

| Route | Page | State |
| --- | --- | --- |
| `/d/backing` | Backing history | Real list from the viewer's own contributions, filtered from the URL, with per-contribution state |
| `/d/backing/[contributionId]` | Contribution receipt | Real, preview-labelled. States payment, contribution, and refund separately; transaction references are `null` and read "None recorded" |
| `/d/creator/campaigns` | Creator's campaigns | List of owned campaigns with phase and next action |
| `/d/creator/campaigns/new` | Campaign wizard | Seven steps (basics, media, funding, milestones, rewards, terms, review). A reward declares digital/physical/mixed fulfilment and, when it posts, the creator's own destinations and terms (D-024). Submitting is blocked until KYC and the application fee exist |
| `/d/creator/campaigns/[campaignId]` | Campaign workspace | Real. Phase, story, funding, and milestone summary; edit and milestone entry points |
| `/d/creator/campaigns/[campaignId]/edit` | Campaign wizard (edit) | Same wizard loaded from the campaign's own published terms |
| `/d/creator/campaigns/[campaignId]/milestones` | Milestone worklist | Real. Every milestone with its state and the reason it is closed; claiming never moves money |

Loading/error boundaries exist at `d/`, `d/(home)`, `d/creator`,
`d/creator/ideas/[id]/insights`, `d/notifications`, `d/pre-pledges`,
`d/settings`. `/d/discover`, `/d/creator/ideas`, `/d/ideathons`, `/d/profile`,
`/d/creator/ideas/[id]/feedback`, `/d/backing`, `/d/saved`, and
`/d/creator/campaigns` inherit the `d/` fallbacks only and have no local skeleton
yet.

The public campaign detail page itself is tabbed as of D-021: `?tab=` selects the
panel (`story`, `milestones`, `rewards`, `updates`, `discussion`, `faqs`,
`facts`), the panel is resolved on the server, and the desktop rail repeats the
funding, rewards, facts, escrow, and FAQ cards. The tab bar is keyboard
navigable, and only the selected panel is in the document.

### Admin surfaces

Added with the campaign review workspace (D-030). The workspace is gated by
`getProgrammeAdminAccess`; production access is denied because no authenticated
admin session exists, and development runs as a labelled preview. Review
decisions are stored in this browser and are explicitly non-authoritative.

| Route | Page | State |
| --- | --- | --- |
| `/admin` | Operating overview | Real. Review counts, oldest-first queue, recent local decisions, and named integration gaps |
| `/admin/campaigns` | Campaign review queue | Real. Awaiting review, changes requested, and decided groups with honest empty states |
| `/admin/campaigns/[id]` | Campaign review detail | Real. Pitch, milestone plan with evidence, disclosures, review history, and a reasoned decision form. Unknown ids 404 |
| `/admin/audit` | Audit history | Partial. Local review decisions and sampled programme entries, both labelled. No authoritative server trail exists |

## 2. Reachable from the dashboard, outside `/d`

| Route | Why it is linked |
| --- | --- |
| `/ideas`, `/ideas/[id]`, `/topics/[slug]` | Public discovery and detail, linked from the featured band and idea cards |
| `/campaigns`, `/campaigns/[slug]`, `/campaigns/[slug]/back`, `/campaigns/categories/[slug]` | Public campaign discovery, detail, contribution preview, and category pages. Linked from the primary navigation, the home featured band, the footer, and a campaign's own detail page |
| `/guides`, `/guides/[slug]` | Sidebar item "Guides & journal" |
| `/ideathon`, `/ideathon/about`, `/ideathon/past`, `/ideathon/rules` | Public ideathon standings |
| `/admin`, `/admin/campaigns`, `/admin/campaigns/[id]`, `/admin/audit`, `/admin/payments`, `/admin/programmes`, `/admin/programmes/new`, `/admin/programmes/[id]` | Admin workspace, linked from the home rail only when the viewer has the capability |
| `/help`, `/blog`, `/about`, `/contact` | Marketing footer and header |

## 3. Creator Studio sections versus what exists

| Section | Repo route | Status |
| --- | --- | --- |
| Overview | `/d/creator` | ✅ Shipped. Metrics, next best step, recent ideas |
| My ideas | `/d/creator/ideas` | ⚠️ Partial. List works; status filters, search, sort, archive, and pagination are missing |
| Create / edit idea | `/d/creator/ideas/new`, `/d/creator/ideas/[id]/edit` | ⚠️ Create ships; **edit route does not exist** |
| Idea workspace | `/d/creator/ideas/[id]` | ✅ Shipped (D-017). One page per owned idea; unowned ids 404 |
| Feedback inbox | `/d/creator/feedback` | ✅ Shipped read-only (D-017). Reply state arrives with the feedback API |
| Analytics | `/d/creator/analytics`, `/d/creator/ideas/[id]/insights` | ✅ Strongest area |
| Audience | — | ❌ Missing. No follower or relationship data model exists |
| Milestones | `/d/creator/campaigns/[campaignId]/milestones` | ✅ Shipped as a surface (D-018). Preview data; claiming never moves money |
| Campaigns | `/d/creator/campaigns`, `/d/creator/campaigns/new`, `/d/creator/campaigns/[campaignId]` | ✅ Shipped as a surface (D-018). List, six-step wizard, workspace. Preview data; submission is blocked until KYC and the application fee exist |

Sections that exist in the repo but are absent from the proposed IA: pre-pledges,
ideathons, discover, notifications, profile, settings. They stay in the main
sidebar, not in the Studio bar.

## 4. Settled and standing constraints

1. **Namespace — settled.** The proposal used `/dashboard/creator/*`; D-011
   fixes the dashboard at `/d`, and D-017 put the studio at `/d/creator/*`.
   Keep `/d`.
2. **Studio route map — settled (D-017).** All creator surfaces moved under
   `/d/creator/*` with redirects from `/d/ideas*`. `isCurrentNavigationHref`
   and both tab bars agree on the new map.
3. **Seven tabs, six real.** A tab appears only when its page ships. Audience is
   the last one without a data model, so it cannot be honestly stubbed; it
   arrives with the model, not before. Campaigns and Milestones were on the same
   hold and now ship as clearly labelled preview surfaces (D-018) rather than as
   live data.
4. **No fabricated numbers.** "People reached" and "Active milestones" are shown
   as `—` in the proposal for the same reason the analytics traffic tab shows an
   empty state: no tracking exists. Keep that discipline.
5. **Mobile bar.** Five destinations only. Studio sections live in the secondary
   tab bar, never in the bottom bar.

## 5. Remaining build order

1. My ideas upgrades — status filters, search, sort, and
   `/d/creator/ideas/[id]/edit` reusing the idea builder.
2. Local `loading.tsx`/`error.tsx` for `/d/discover`, `/d/creator/ideas`,
   `/d/ideathons`, `/d/profile`.
3. Reply state in the feedback inbox, when the feedback API exists.
4. Hold Audience until its relationship model exists, and record that hold in
   `docs/DECISIONS.md` when it is agreed. Campaigns and Milestones now have
   preview surfaces (D-018); the next step for them is the campaign API, not
   more UI.
