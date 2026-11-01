# Inverge Admin Workspace — Audit, Current State & Remaining Work

Status: **Working Operational Plane**  
Target Routes: `src/app/admin/*`  
Authoritative Requirements: `docs/Inverge_PRD_SRS_v1.2.md` (§3.9, FR-103, FR-206, FR-304, FR-311, FR-406, FR-505, FR-901–FR-904)

---

## 1. Executive Summary & Audit of Existing Work

A comprehensive scan of `src/app/admin` and related feature modules (`features/campaigns`, `features/verification`, `features/advertising`, `features/programmes`) reveals that **significant frontend scaffolding, preview workflows, and data structures already exist**.

However, the majority of these surfaces currently operate on **fixtures and client-side simulation** (`previewCampaigns`, `previewProgrammes`, `previewAuditEntries`). The primary goal is **not building from scratch**, but transitioning existing preview screens to **live API data, adding missing review actions, and refining responsive design**.

---

## 2. Component-by-Component State Matrix

| Admin Section | Route | Current State | What Is Already Built | What Remains To Be Built / Wired |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Shell & Nav** | `/admin/*` | **Functional Preview** | Layout, responsive drawer (`AdminNavigation`), RBAC access gate (`getProgrammeAdminAccess`), session display | Mobile font scaling consistency; live session identity |
| **Overview** | `/admin` | **Functional Preview** | Queue summary cards, recent campaign activity, integration gap checklist | Connect live queue counts from API; remove mock campaign feeds |
| **Campaign Review** | `/admin/campaigns`<br>`/admin/campaigns/[id]` | **Interactive UI (Mock Data)** | Complete review queue, state filtering (`UNDER_REVIEW`, `CHANGES_REQUESTED`, `APPROVED`, `REJECTED`), pitch & milestone plan inspection, decision modal with rationale | Wire live submissions API (replace `previewCampaigns`); on-chain metadata hash generation on approval; listing freeze action (FR-903) |
| **Verification & KYC** | `/admin/verification`<br>`/admin/verification/[id]` | **Live API Wired** | Queue table, risk categorization (`Low`, `Medium`, `High`), case detail view, `ResolveRiskForm` with decision submission | Verification webhooks integration; strike tracking & strike decay ledger (FR-310) |
| **Advertising** | `/admin/advertising` | **Interactive UI (Preview)** | Inventory table, placement scheduling (`Basic`, `Featured`), live preview switcher, slot pause/resume | Connect live ad booking endpoints; dynamic boost price configuration (FR-904) |
| **Programmes & Ideathons** | `/admin/programmes`<br>`/admin/programmes/new`<br>`/admin/programmes/[id]` | **Interactive UI (Preview)** | Programme creation wizard (`ProgrammeWizard`), track configuration, prize pool editor, sponsor logo management | Connect backend database persistence for created programmes; submission evaluation flow |
| **Payments & Treasury** | `/admin/payments` | **Interactive UI (Mock Data)** | Reconciliations ledger, application fee records (FR-311), platform success fee estimates (FR-505), monetization tier breakdown | Connect payment gateway webhooks for non-refundable fee reconciliation; live USDC ledger |
| **Audit Log** | `/admin/audit` | **Interactive UI (Mock Data)** | Filterable audit log UI (`AdminAuditLog`), actor filtering, action category breakdowns, RBAC permission matrix view | Replace `previewAuditEntries` with persistent audit database stream |

---

## 3. Targeted Implementation Tasklist

### Phase 1: Campaign Review Live Integration (FR-304, FR-311)
- [x] UI review queue and status filter tabs (`/admin/campaigns`).
- [x] Detailed campaign pitch, media, use-of-funds, and milestone inspection (`/admin/campaigns/[id]`).
- [x] Reasoned decision modal with structured approval/rejection forms.
- [ ] **Task 1.1**: Connect `/admin/campaigns` to live server-side campaign queue query (`getAdminCampaigns()`) instead of `previewCampaigns`.
- [ ] **Task 1.2**: Implement real approval mutation that hashes the approved milestone plan for on-chain anchoring (FR-303).
- [ ] **Task 1.3**: Add explicit campaign "Freeze" action (FR-903) allowing admins to take down public listings without touching escrow assets.

---

### Phase 2: Verification & Compliance Adjudication (FR-103, FR-310)
- [x] Live case listing and summary table (`/admin/verification`).
- [x] Case inspection (`/admin/verification/[id]`) with risk breakdown and automated check results.
- [x] Risk resolution form (`ResolveRiskForm`) hooked to `/api/admin/verification/cases/...`.
- [ ] **Task 2.1**: Implement creator strike tracker (FR-310) for upheld backer objections (1st strike = 6 mo, 2nd strike = 12 mo, 3rd strike = mandatory review).
- [ ] **Task 2.2**: Ensure sanitization of verification documents so PII is never stored in browser state or unauthenticated caches.

---

### Phase 3: Advertising & Boost Pricing (FR-206, FR-904)
- [x] Inventory table showing slot type, campaign name, dates, status, impressions, and clicks (`/admin/advertising`).
- [x] Pause, resume, and preview controls in `AdminAdvertising`.
- [ ] **Task 3.1**: Connect advertising mutations to backend storage rather than local state.
- [ ] **Task 3.2**: Add the admin form for configuring `Basic` and `Featured` boost prices (FR-904) and emit audit events on price updates.

---

### Phase 4: Programmes & Ideathon Persistence
- [x] Programme creation multi-step wizard (`ProgrammeWizard`).
- [x] Sponsor management, challenge track configuration, and prize pool structure.
- [x] Programme workspace loader with tabs for participants, submissions, and settings.
- [ ] **Task 4.1**: Connect `ProgrammeWizard` to database persistence instead of `localStorage`/`previewProgrammes`.
- [ ] **Task 4.2**: Implement participant submission reviewing and scoring views for ideathons.

---

### Phase 5: Financial Reconciliations & Live Audit Trail (FR-505, FR-901)
- [x] Application fee and prize pool summary ledgers (`/admin/payments`).
- [x] Audit log UI with actor search, role breakdown, and timestamp formatting (`/admin/audit`).
- [ ] **Task 5.1**: Reconcile live payment gateway webhooks for application fees (FR-311, FR-406).
- [ ] **Task 5.2**: Connect platform success fee tracker (5% per released escrow tranche) to live indexing data (FR-505).
- [ ] **Task 5.3**: Stream live immutable audit log events into `/admin/audit` from server-side mutations.
