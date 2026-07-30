import type { CampaignDetail, Milestone, Receipt } from '@/lib/campaigns/types';
import { CREATORS, publicCreator } from './creators';

/**
 * Fixture campaigns. Three, deliberately: one ACTIVE mid-flight with a live objection window, one
 * COMPLETED, one FAILED with a refund in progress (campaign-data-contract.md §5). Between them all
 * six milestone states render, which is the only way to review the tracker honestly.
 *
 * Every date is relative to now so the objection countdown is never stale.
 */

const DAY = 86_400_000;
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * DAY).toISOString();

// Plausible-shaped signatures. They exist so TxLink can build a receipt URL; no screen renders one
// as text (conventions §1.1).
const sig = (n: number) => `5KJp7z2vQnRb8sT3wYc1mA6dF9hL4x${String(n).padStart(3, '0')}gTxNqk`;

const receipt = (
  kind: Receipt['kind'],
  label: string,
  amount: string | null,
  days: number,
  n: number
): Receipt => ({ kind, label, amount, txSignature: sig(n), blockTime: iso(days) });

function campusKonekt(): CampaignDetail {
  const milestones: Milestone[] = [
    {
      id: 'ms_ck_1',
      index: 0,
      title: 'Working prototype',
      deliverable: 'Ordering works end to end for eight vendors in one hostel.',
      tranchePct: '25.00',
      evidenceDefinition: { type: 'Demo link', source: 'Public staging URL, plus a screen recording' },
      claim: {
        id: 'clm_ck_1',
        submittedAt: iso(-38),
        objectionWindowEndsAt: iso(-31),
        status: 'APPROVED',
        proof: {
          note: 'Staging is open to anyone with the link. Eight vendors are live and the order flow is recorded end to end.',
          links: [{ label: 'Staging build', url: 'https://staging.campuskonekt.example' }],
        },
        objectionWeightPct: '1.80',
        objectionThresholdPct: '30.00',
      },
      receipt: receipt('TRANCHE_RELEASED', 'Stage 1 released', '900.00', -31, 2),
    },
    {
      id: 'ms_ck_2',
      index: 1,
      title: 'First 100 orders delivered',
      deliverable: '100 completed orders with vendor confirmation.',
      tranchePct: '25.00',
      evidenceDefinition: { type: 'Order export', source: 'Signed vendor summary for the period' },
      claim: {
        id: 'clm_ck_2',
        submittedAt: iso(-18),
        objectionWindowEndsAt: iso(-11),
        status: 'APPROVED',
        proof: {
          note: '128 orders completed in three weeks. Two vendors signed the summary; the export is itemised by day.',
        },
        objectionWeightPct: '4.20',
        objectionThresholdPct: '30.00',
      },
      receipt: receipt('TRANCHE_RELEASED', 'Stage 2 released', '900.00', -11, 3),
    },
    {
      id: 'ms_ck_3',
      index: 2,
      // The focal milestone: window still open, so the mechanic is legible mid-flight.
      title: 'Vendor payouts automated',
      deliverable: 'Vendors are paid weekly without anyone touching a spreadsheet.',
      tranchePct: '30.00',
      evidenceDefinition: { type: 'Payout run', source: 'Two consecutive weekly runs with vendor receipts' },
      claim: {
        id: 'clm_ck_3',
        submittedAt: iso(-3),
        objectionWindowEndsAt: iso(4),
        status: 'UNDER_REVIEW',
        proof: {
          note: 'Two payout runs have gone out, on the 14th and the 21st, covering all eleven vendors. The second run needed no manual correction. Vendor receipts are attached in the run export.',
          links: [{ label: 'Payout run export', url: 'https://campuskonekt.example/runs' }],
        },
        objectionWeightPct: '6.40',
        objectionThresholdPct: '30.00',
      },
      receipt: null,
    },
    {
      id: 'ms_ck_4',
      index: 3,
      title: '1,000 monthly active students',
      deliverable: '1,000 students ordering at least once in a calendar month.',
      tranchePct: '20.00',
      evidenceDefinition: { type: 'Usage report', source: 'Monthly active count with the query published' },
      claim: null,
      receipt: null,
    },
  ];

  return {
    objectType: 'campaign',
    id: 'camp_campuskonekt',
    slug: 'campuskonekt',
    title: 'CampusKonekt',
    summary: 'Students in Ibadan wait 40 minutes for lunch between lectures.',
    category: 'software',
    region: 'Ibadan',
    type: 'ALL_OR_NOTHING',
    status: 'ACTIVE',
    targetAmount: '5000',
    totalRaised: '3600',
    backerCount: 214,
    deadline: iso(18),
    creator: publicCreator(CREATORS.tobi),
    milestoneSummary: { total: 4, released: 2, underReview: 1, failed: 0 },
    ideaId: 'idea_campuskonekt',
    story: {
      problem:
        'Students in Ibadan wait 40 minutes for lunch between lectures, and most give up and skip the meal.',
      solution:
        'One ordering app shared by the hostels and the vendors already on campus, with pickup windows tied to the lecture timetable.',
      roadmap: 'One hostel, then lockers, then the rest of campus once vendor payouts are boring.',
    },
    risks:
      'Vendor churn is the real risk: if the three busiest kitchens leave, the app is empty at lunchtime. Six have written commitments and the pickup lockers are the thing they asked for, so leaving costs them the locker slot. The university could also ask for a concession fee, which is why the raise carries a float rather than spending it on marketing.',
    workingCapitalPct: '20.00',
    launchedAt: iso(-52),
    milestones,
    receipts: [
      receipt('FUNDED', 'Funding closed', '3600.00', -45, 1),
      receipt('WORKING_CAPITAL_RELEASED', 'Working capital released', '720.00', -45, 4),
      receipt('TRANCHE_RELEASED', 'Stage 1 released', '900.00', -31, 2),
      receipt('TRANCHE_RELEASED', 'Stage 2 released', '900.00', -11, 3),
    ],
    myContribution: { total: '120.00' },
  };
}

function clinicQueue(): CampaignDetail {
  const done = (
    i: number,
    title: string,
    deliverable: string,
    pct: string,
    evidence: string,
    daysAgo: number,
    n: number
  ): Milestone => ({
    id: `ms_cq_${i + 1}`,
    index: i,
    title,
    deliverable,
    tranchePct: pct,
    evidenceDefinition: { type: 'Report', source: evidence },
    claim: {
      id: `clm_cq_${i + 1}`,
      submittedAt: iso(daysAgo - 7),
      objectionWindowEndsAt: iso(daysAgo),
      status: 'APPROVED',
      proof: { note: `${title} delivered and confirmed by the clinic administrator.` },
      objectionWeightPct: '2.10',
      objectionThresholdPct: '30.00',
    },
    receipt: receipt('TRANCHE_RELEASED', `Stage ${i + 1} released`, '3112.50', daysAgo, 20 + i),
  });

  return {
    objectType: 'campaign',
    id: 'camp_clinic_queue',
    slug: 'clinic-queue',
    title: 'Clinic Queue',
    summary: 'Antenatal patients in Enugu queue from five in the morning for a slot that may not exist.',
    category: 'software',
    region: 'Enugu',
    type: 'ALL_OR_NOTHING',
    status: 'COMPLETED',
    targetAmount: '12000',
    totalRaised: '12450',
    backerCount: 388,
    deadline: iso(-160),
    creator: publicCreator(CREATORS.fatima),
    milestoneSummary: { total: 4, released: 4, underReview: 0, failed: 0 },
    ideaId: 'idea_clinic_queue',
    story: {
      problem: 'Antenatal patients queue from five in the morning for a slot that may not exist.',
      solution: 'Timed slots the clinic controls, booked by SMS, with a same-day list the front desk can see.',
      roadmap: 'One clinic, then the two satellite centres.',
    },
    risks:
      'The clinic could stop using it the week I stop visiting. That is why the front desk owns the daily list and the SMS gateway bill is paid a year ahead.',
    workingCapitalPct: '22.00',
    launchedAt: iso(-240),
    milestones: [
      done(0, 'SMS booking live', 'Patients can book a slot by SMS.', '25.00', 'Gateway logs', -150, 0),
      done(1, 'Front desk list in daily use', 'Staff work from the generated list for 20 working days.', '25.00', 'Signed staff log', -110, 1),
      done(2, 'Two satellite centres added', 'Both centres booking through the same list.', '25.00', 'Administrator confirmation', -70, 2),
      done(3, '3,000 appointments booked', '3,000 booked appointments across all sites.', '25.00', 'Published query and export', -30, 3),
    ],
    receipts: [
      receipt('FUNDED', 'Funding closed', '12450.00', -158, 10),
      receipt('WORKING_CAPITAL_RELEASED', 'Working capital released', '2739.00', -158, 11),
      receipt('TRANCHE_RELEASED', 'Stage 1 released', '3112.50', -150, 20),
      receipt('TRANCHE_RELEASED', 'Stage 2 released', '3112.50', -110, 21),
      receipt('TRANCHE_RELEASED', 'Stage 3 released', '3112.50', -70, 22),
      receipt('TRANCHE_RELEASED', 'Stage 4 released', '3112.50', -30, 23),
    ],
  };
}

function tailorsBank(): CampaignDetail {
  return {
    objectType: 'campaign',
    id: 'camp_tailors_bank',
    slug: 'tailors-bank',
    title: "Tailors' Bank",
    summary: 'A tailor in Aba can price a job accurately and still cannot prove an income to a lender.',
    category: 'other',
    region: 'Aba',
    type: 'ALL_OR_NOTHING',
    status: 'FAILED',
    targetAmount: '8000',
    totalRaised: '8000',
    backerCount: 173,
    deadline: iso(-96),
    creator: publicCreator(CREATORS.chinedu),
    milestoneSummary: { total: 4, released: 2, underReview: 0, failed: 1 },
    ideaId: 'idea_tailors_bank',
    story: {
      problem: 'A tailor can price a job accurately and still cannot prove an income to a lender.',
      solution: 'A job book that doubles as a ledger, so six months of work becomes lendable history.',
      roadmap: 'Job book, then the cooperative pilot, then lender integration.',
    },
    risks:
      'The cooperative had to agree to lend against the ledger. It did not, and that is the stage this campaign failed on.',
    workingCapitalPct: '20.00',
    launchedAt: iso(-200),
    milestones: [
      {
        id: 'ms_tb_1',
        index: 0,
        title: 'Job book in use by 50 tailors',
        deliverable: '50 tailors recording jobs for a full month.',
        tranchePct: '25.00',
        evidenceDefinition: { type: 'Usage export', source: 'Per-tailor entry counts' },
        claim: {
          id: 'clm_tb_1',
          submittedAt: iso(-150),
          objectionWindowEndsAt: iso(-143),
          status: 'APPROVED',
          proof: { note: '61 tailors recorded at least 20 jobs in the month.' },
          objectionWeightPct: '3.00',
          objectionThresholdPct: '30.00',
        },
        receipt: receipt('TRANCHE_RELEASED', 'Stage 1 released', '2000.00', -143, 30),
      },
      {
        id: 'ms_tb_2',
        index: 1,
        title: 'Six months of history recorded',
        deliverable: 'Six continuous months of ledger history for 40 tailors.',
        tranchePct: '25.00',
        evidenceDefinition: { type: 'Usage export', source: 'Monthly continuity report' },
        claim: {
          id: 'clm_tb_2',
          submittedAt: iso(-125),
          objectionWindowEndsAt: iso(-118),
          status: 'APPROVED',
          proof: { note: '44 tailors with unbroken six-month histories.' },
          objectionWeightPct: '5.50',
          objectionThresholdPct: '30.00',
        },
        receipt: receipt('TRANCHE_RELEASED', 'Stage 2 released', '2000.00', -118, 31),
      },
      {
        id: 'ms_tb_3',
        index: 2,
        title: 'Cooperative lends against the ledger',
        deliverable: 'At least one cooperative issues a loan using the ledger as the income record.',
        tranchePct: '30.00',
        evidenceDefinition: { type: 'Signed agreement', source: 'Cooperative letter plus first loan record' },
        claim: {
          id: 'clm_tb_3',
          submittedAt: iso(-40),
          objectionWindowEndsAt: iso(-33),
          status: 'FAILED',
          proof: {
            note: 'A letter of intent was submitted rather than a signed agreement, and no loan had been issued at the time of the claim.',
          },
          objectionWeightPct: '41.20',
          objectionThresholdPct: '30.00',
        },
        receipt: receipt('MILESTONE_FAILED', 'Stage 3 not delivered', null, -33, 32),
      },
      {
        id: 'ms_tb_4',
        index: 3,
        title: 'Lender integration live',
        deliverable: 'Two lenders reading the ledger directly.',
        tranchePct: '20.00',
        evidenceDefinition: { type: 'Integration proof', source: 'Lender confirmation' },
        claim: null,
        receipt: null,
        cancelled: true,
      },
    ],
    receipts: [
      receipt('FUNDED', 'Funding closed', '8000.00', -190, 33),
      receipt('WORKING_CAPITAL_RELEASED', 'Working capital released', '1600.00', -190, 34),
      receipt('TRANCHE_RELEASED', 'Stage 1 released', '2000.00', -143, 30),
      receipt('TRANCHE_RELEASED', 'Stage 2 released', '2000.00', -118, 31),
      receipt('MILESTONE_FAILED', 'Stage 3 not delivered', null, -33, 32),
      receipt('REFUND_CLAIMED', 'Refunds returned to backers', '2400.00', -30, 35),
    ],
    myContribution: {
      total: '45.00',
      refund: { status: 'RETURNED', amount: '45.00', returnedAt: iso(-30) },
    },
  };
}

export function fixtureCampaigns(): CampaignDetail[] {
  return [campusKonekt(), clinicQueue(), tailorsBank()];
}
