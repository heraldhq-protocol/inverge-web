import type { CampaignDetail, Milestone, Receipt } from '@/lib/campaigns/types';
import { CREATORS, campaignCreator } from './creators';

/**
 * Fixture campaigns. Eight, because three was enough to review the tracker and not enough to review a
 * catalogue: filters, sort, lanes and the escrow band all need a population before they can be judged.
 *
 * Between them they cover every public status (ACTIVE, FUNDED, COMPLETED, FAILED) and all six
 * milestone states, including DISPUTED, which nothing rendered before
 * (campaign-brief.md §10 stage 1).
 *
 * Every date is relative to now, so the objection countdown is never stale in a review or a
 * screenshot, and "closing soon" is genuinely closing soon.
 *
 * **The invariant, if you edit any figure here.** Every campaign must satisfy:
 *
 *     upfront + every stage tranche === totalRaised, exactly
 *
 * where `upfront = workingCapitalPct% of targetAmount` and each tranche is
 * `tranchePct% of (totalRaised - upfront)` (campaign-stats.ts). Stage percentages sum to 100.
 * All eight below were checked against that; a hand-edited receipt amount is the easy way to break it,
 * and the symptom is the detail page and the receipts tab quietly disagreeing about one campaign.
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

/** A released stage: claim approved, window closed, tranche paid. */
function released(args: {
  id: string;
  index: number;
  title: string;
  deliverable: string;
  tranchePct: string;
  evidence: { type: string; source: string };
  proof: string;
  links?: { label: string; url: string }[];
  objectionPct: string;
  releasedDaysAgo: number;
  amount: string;
  sigN: number;
}): Milestone {
  return {
    id: args.id,
    index: args.index,
    title: args.title,
    deliverable: args.deliverable,
    tranchePct: args.tranchePct,
    evidenceDefinition: args.evidence,
    claim: {
      id: `clm_${args.id}`,
      submittedAt: iso(args.releasedDaysAgo - 7),
      objectionWindowEndsAt: iso(args.releasedDaysAgo),
      status: 'APPROVED',
      proof: { note: args.proof, links: args.links },
      objectionWeightPct: args.objectionPct,
      objectionThresholdPct: '30.00',
    },
    receipt: receipt(
      'TRANCHE_RELEASED',
      `Stage ${args.index + 1} released`,
      args.amount,
      args.releasedDaysAgo,
      args.sigN
    ),
  };
}

/** A stage nobody has claimed yet. */
const upcoming = (
  id: string,
  index: number,
  title: string,
  deliverable: string,
  tranchePct: string,
  evidence: { type: string; source: string }
): Milestone => ({
  id,
  index,
  title,
  deliverable,
  tranchePct,
  evidenceDefinition: evidence,
  claim: null,
  receipt: null,
});

function campusKonekt(): CampaignDetail {
  const milestones: Milestone[] = [
    released({
      id: 'ms_ck_1',
      index: 0,
      title: 'Working prototype',
      deliverable: 'Ordering works end to end for eight vendors in one hostel.',
      tranchePct: '25.00',
      evidence: { type: 'Demo link', source: 'Public staging URL, plus a screen recording' },
      proof:
        'Staging is open to anyone with the link. Eight vendors are live and the order flow is recorded end to end.',
      links: [{ label: 'Staging build', url: 'https://staging.campuskonekt.example' }],
      objectionPct: '1.80',
      releasedDaysAgo: -31,
      amount: '1100.00',
      sigN: 2,
    }),
    released({
      id: 'ms_ck_2',
      index: 1,
      title: 'First 100 orders delivered',
      deliverable: '100 completed orders with vendor confirmation.',
      tranchePct: '25.00',
      evidence: { type: 'Order export', source: 'Signed vendor summary for the period' },
      proof:
        '128 orders completed in three weeks. Two vendors signed the summary; the export is itemised by day.',
      objectionPct: '4.20',
      releasedDaysAgo: -11,
      amount: '1100.00',
      sigN: 3,
    }),
    {
      id: 'ms_ck_3',
      index: 2,
      // The focal milestone: window still open, so the mechanic is legible mid-flight.
      title: 'Vendor payouts automated',
      deliverable: 'Vendors are paid weekly without anyone touching a spreadsheet.',
      tranchePct: '30.00',
      evidenceDefinition: {
        type: 'Payout run',
        source: 'Two consecutive weekly runs with vendor receipts',
      },
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
    upcoming(
      'ms_ck_4',
      3,
      '1,000 monthly active students',
      '1,000 students ordering at least once in a calendar month.',
      '20.00',
      { type: 'Usage report', source: 'Monthly active count with the query published' }
    ),
  ];

  return {
    objectType: 'campaign',
    id: 'camp_campuskonekt',
    topics: ['apps', 'food'],
    videoUrl: 'https://media.campuskonekt.example/pitch.mp4',
    slug: 'campuskonekt',
    title: 'CampusKonekt',
    summary: 'Students in Ibadan wait 40 minutes for lunch between lectures.',
    category: 'software',
    region: 'Ibadan',
    type: 'ALL_OR_NOTHING',
    status: 'ACTIVE',
    targetAmount: '5000',
    totalRaised: '5400',
    backerCount: 214,
    deadline: iso(-18),
    launchedAt: iso(-52),
    creator: campaignCreator(CREATORS.tobi),
    milestoneSummary: { total: 4, released: 2, underReview: 1, failed: 0 },
    ideaId: 'idea_campuskonekt',
    ideaSlug: 'campuskonekt',
    story: {
      problem:
        'Students in Ibadan wait 40 minutes for lunch between lectures, and most give up and skip the meal.',
      solution:
        'One ordering app shared by the hostels and the vendors already on campus, with pickup windows tied to the lecture timetable.',
      targetUser:
        'Students in the four hostels on the Ibadan campus, and the eleven food vendors who already serve them.',
      currentAlternative:
        'They queue, or they send a friend, or they skip the meal. Vendors take orders on WhatsApp and lose half of them in the scroll.',
      askBreakdown: [
        { label: 'Pickup lockers for four hostels', amount: '2200' },
        { label: 'Six months of hosting and SMS', amount: '900' },
        { label: 'Vendor onboarding and training', amount: '1100' },
        { label: 'Float for the first payout cycle', amount: '800' },
      ],
      roadmap: 'One hostel, then lockers, then the rest of campus once vendor payouts are boring.',
    },
    risks:
      'Vendor churn is the real risk: if the three busiest kitchens leave, the app is empty at lunchtime. Six have written commitments and the pickup lockers are the thing they asked for, so leaving costs them the locker slot. The university could also ask for a concession fee, which is why the raise carries a float rather than spending it on marketing.',
    workingCapitalPct: '20.00',
    milestones,
    receipts: [
      receipt('FUNDED', 'Funding closed', '5400.00', -45, 1),
      receipt('WORKING_CAPITAL_RELEASED', 'Working capital released', '1000.00', -45, 4),
      receipt('TRANCHE_RELEASED', 'Stage 1 released', '1100.00', -31, 2),
      receipt('TRANCHE_RELEASED', 'Stage 2 released', '1100.00', -11, 3),
    ],
    myContribution: { total: '120.00' },
  };
}

function clinicQueue(): CampaignDetail {
  const stage = (
    i: number,
    title: string,
    deliverable: string,
    evidence: string,
    proof: string,
    daysAgo: number
  ) =>
    released({
      id: `ms_cq_${i + 1}`,
      index: i,
      title,
      deliverable,
      tranchePct: '25.00',
      evidence: { type: 'Report', source: evidence },
      proof,
      objectionPct: '2.10',
      releasedDaysAgo: daysAgo,
      amount: '2452.50',
      sigN: 20 + i,
    });

  return {
    objectType: 'campaign',
    id: 'camp_clinic_queue',
    videoUrl: 'https://media.clinicqueue.example/pitch.mp4',
    topics: ['health'],
    slug: 'clinic-queue',
    title: 'Clinic Queue',
    summary:
      'Antenatal patients in Enugu queue from five in the morning for a slot that may not exist.',
    category: 'software',
    region: 'Enugu',
    type: 'ALL_OR_NOTHING',
    status: 'COMPLETED',
    targetAmount: '12000',
    totalRaised: '12450',
    backerCount: 388,
    deadline: iso(-160),
    launchedAt: iso(-240),
    creator: campaignCreator(CREATORS.fatima),
    milestoneSummary: { total: 4, released: 4, underReview: 0, failed: 0 },
    ideaId: 'idea_clinic_queue',
    ideaSlug: 'clinic-queue',
    story: {
      problem: 'Antenatal patients queue from five in the morning for a slot that may not exist.',
      solution:
        'Timed slots the clinic controls, booked by SMS, with a same-day list the front desk can see.',
      targetUser:
        'Antenatal patients at one general hospital in Enugu and its two satellite centres, and the four front-desk staff who run the list.',
      currentAlternative:
        'A paper register and a queue that starts before dawn. Patients who arrive at eight are turned away without being told how many are ahead of them.',
      askBreakdown: [
        { label: 'SMS gateway, prepaid for a year', amount: '3400' },
        { label: 'Two front-desk terminals and a printer', amount: '2900' },
        { label: 'Staff training across three sites', amount: '2100' },
        { label: 'Six months of hosting and support', amount: '3600' },
      ],
      roadmap: 'One clinic, then the two satellite centres.',
    },
    risks:
      'The clinic could stop using it the week I stop visiting. That is why the front desk owns the daily list and the SMS gateway bill is paid a year ahead.',
    workingCapitalPct: '22.00',
    milestones: [
      stage(
        0,
        'SMS booking live',
        'Patients can book a slot by SMS.',
        'Gateway logs',
        '1,240 bookings came through the gateway in the first month. The logs are exported by day and the failure rate was under 2%.',
        -150
      ),
      stage(
        1,
        'Front desk list in daily use',
        'Staff work from the generated list for 20 working days.',
        'Signed staff log',
        'Twenty-two consecutive working days. The paper register was retired in week two and the log is signed by the head of the front desk.',
        -110
      ),
      stage(
        2,
        'Two satellite centres added',
        'Both centres booking through the same list.',
        'Administrator confirmation',
        'Both centres went live a fortnight apart. The administrator confirmed the shared list in writing.',
        -70
      ),
      stage(
        3,
        '3,000 appointments booked',
        '3,000 booked appointments across all sites.',
        'Published query and export',
        '3,410 appointments across the three sites. The query that produces the count is published so anyone can run it against the export.',
        -30
      ),
    ],
    receipts: [
      receipt('FUNDED', 'Funding closed', '12450.00', -158, 10),
      receipt('WORKING_CAPITAL_RELEASED', 'Working capital released', '2640.00', -158, 11),
      receipt('TRANCHE_RELEASED', 'Stage 1 released', '2452.50', -150, 20),
      receipt('TRANCHE_RELEASED', 'Stage 2 released', '2452.50', -110, 21),
      receipt('TRANCHE_RELEASED', 'Stage 3 released', '2452.50', -70, 22),
      receipt('TRANCHE_RELEASED', 'Stage 4 released', '2452.50', -30, 23),
    ],
  };
}

function tailorsBank(): CampaignDetail {
  return {
    objectType: 'campaign',
    id: 'camp_tailors_bank',
    videoUrl: 'https://media.tailorsbank.example/pitch.mp4',
    topics: ['fintech', 'savings'],
    slug: 'tailors-bank',
    title: "Tailors' Bank",
    summary:
      'A tailor in Aba can price a job accurately and still cannot prove an income to a lender.',
    category: 'other',
    region: 'Aba',
    type: 'ALL_OR_NOTHING',
    status: 'FAILED',
    targetAmount: '8000',
    totalRaised: '8000',
    backerCount: 173,
    deadline: iso(-96),
    launchedAt: iso(-200),
    creator: campaignCreator(CREATORS.chinedu),
    milestoneSummary: { total: 4, released: 2, underReview: 0, failed: 1 },
    ideaId: 'idea_tailors_bank',
    ideaSlug: 'tailors-bank',
    story: {
      problem: 'A tailor can price a job accurately and still cannot prove an income to a lender.',
      solution:
        'A job book that doubles as a ledger, so six months of work becomes lendable history.',
      targetUser:
        'Tailors in the Ariaria market cluster in Aba, and the two cooperatives that already lend to them on a handshake.',
      currentAlternative:
        'A paper job book, if anything. Lenders ask for six months of bank statements that a cash business does not have.',
      askBreakdown: [
        { label: 'Android build and offline sync', amount: '3200' },
        { label: 'Field onboarding for 50 tailors', amount: '2400' },
        { label: 'Cooperative integration work', amount: '1600' },
        { label: 'A year of hosting', amount: '800' },
      ],
      roadmap: 'Job book, then the cooperative pilot, then lender integration.',
    },
    risks:
      'The cooperative had to agree to lend against the ledger. It did not, and that is the stage this campaign failed on.',
    workingCapitalPct: '20.00',
    milestones: [
      released({
        id: 'ms_tb_1',
        index: 0,
        title: 'Job book in use by 50 tailors',
        deliverable: '50 tailors recording jobs for a full month.',
        tranchePct: '25.00',
        evidence: { type: 'Usage export', source: 'Per-tailor entry counts' },
        proof: '61 tailors recorded at least 20 jobs in the month.',
        objectionPct: '3.00',
        releasedDaysAgo: -143,
        amount: '1600.00',
        sigN: 30,
      }),
      released({
        id: 'ms_tb_2',
        index: 1,
        title: 'Six months of history recorded',
        deliverable: 'Six continuous months of ledger history for 40 tailors.',
        tranchePct: '25.00',
        evidence: { type: 'Usage export', source: 'Monthly continuity report' },
        proof: '44 tailors with unbroken six-month histories.',
        objectionPct: '5.50',
        releasedDaysAgo: -118,
        amount: '1600.00',
        sigN: 31,
      }),
      {
        id: 'ms_tb_3',
        index: 2,
        title: 'Cooperative lends against the ledger',
        deliverable: 'At least one cooperative issues a loan using the ledger as the income record.',
        tranchePct: '30.00',
        evidenceDefinition: {
          type: 'Signed agreement',
          source: 'Cooperative letter plus first loan record',
        },
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
        ...upcoming(
          'ms_tb_4',
          3,
          'Lender integration live',
          'Two lenders reading the ledger directly.',
          '20.00',
          { type: 'Integration proof', source: 'Lender confirmation' }
        ),
        cancelled: true,
      },
    ],
    receipts: [
      receipt('FUNDED', 'Funding closed', '8000.00', -190, 33),
      receipt('WORKING_CAPITAL_RELEASED', 'Working capital released', '1600.00', -190, 34),
      receipt('TRANCHE_RELEASED', 'Stage 1 released', '1600.00', -143, 30),
      receipt('TRANCHE_RELEASED', 'Stage 2 released', '1600.00', -118, 31),
      receipt('MILESTONE_FAILED', 'Stage 3 not delivered', null, -33, 32),
      receipt('REFUND_CLAIMED', 'Refunds returned to backers', '3200.00', -30, 35),
    ],
    myContribution: {
      total: '45.00',
      refund: { status: 'RETURNED', amount: '45.00', returnedAt: iso(-30) },
    },
  };
}

/** Closing soon, and over target. Both states the catalogue needs to render honestly. */
function coldChainKaduna(): CampaignDetail {
  return {
    objectType: 'campaign',
    id: 'camp_cold_chain',
    topics: ['energy', 'agritech'],
    videoUrl: 'https://media.coldchainkaduna.example/pitch.mp4',
    slug: 'cold-chain-kaduna',
    title: 'Cold Chain Kaduna',
    summary:
      'Six hours of grid power a day means a third of what a cold room holds is spoiled before it sells.',
    category: 'agriculture',
    region: 'Kaduna',
    type: 'ALL_OR_NOTHING',
    status: 'ACTIVE',
    targetAmount: '15000',
    totalRaised: '17840',
    backerCount: 502,
    deadline: iso(4),
    launchedAt: iso(-38),
    creator: campaignCreator(CREATORS.ibrahim),
    milestoneSummary: { total: 4, released: 1, underReview: 0, failed: 0 },
    ideaId: 'idea_cold_chain',
    ideaSlug: 'cold-chain-kaduna',
    story: {
      problem:
        'Six hours of grid power a day means a third of what a cold room holds is spoiled before it sells.',
      solution:
        'Solar and battery retrofits for cold rooms that already exist, paid back out of what stops spoiling.',
      targetUser:
        'The six cold room operators I wired in Kaduna between 2021 and 2024, and the roughly 400 smallholders who sell through them.',
      currentAlternative:
        'A diesel generator that costs more than the produce it saves, or accepting the loss and pricing it in.',
      askBreakdown: [
        { label: 'Panels and mounting for two rooms', amount: '6400' },
        { label: 'Battery banks', amount: '5200' },
        { label: 'Inverters and switchgear', amount: '2100' },
        { label: 'Install labour and commissioning', amount: '1300' },
      ],
      roadmap: 'Two rooms retrofitted, measured for a season, then the remaining four.',
    },
    risks:
      'Battery prices move with the exchange rate, and a 30% swing would eat the contingency. The quote is locked for 90 days and the second room is deliberately scheduled after the first has run a full season, so a bad first result stops the spend rather than doubling it.',
    workingCapitalPct: '18.00',
    milestones: [
      released({
        id: 'ms_cc_1',
        index: 0,
        title: 'First room running on solar',
        deliverable: 'One cold room holding temperature overnight without the generator.',
        tranchePct: '30.00',
        evidence: { type: 'Temperature log', source: '30 days of logger data, published raw' },
        proof:
          'Thirty-one days of logger data at fifteen-minute intervals. The room held between 2 and 6 degrees throughout, and the generator ran twice, both times during the install week.',
        links: [{ label: 'Logger export', url: 'https://coldchainkaduna.example/logs' }],
        objectionPct: '2.40',
        releasedDaysAgo: -9,
        amount: '4542.00',
        sigN: 40,
      }),
      upcoming(
        'ms_cc_2',
        1,
        'A full season measured',
        'One harvest season with spoilage measured against the previous year.',
        '25.00',
        { type: 'Spoilage report', source: 'Operator records for both seasons, side by side' }
      ),
      upcoming('ms_cc_3', 2, 'Second room retrofitted', 'The second room running on the same setup.', '25.00', {
        type: 'Temperature log',
        source: '30 days of logger data, published raw',
      }),
      upcoming(
        'ms_cc_4',
        3,
        'Maintenance handed over',
        'Two local technicians servicing both installations unsupervised.',
        '20.00',
        { type: 'Handover record', source: 'Signed service logs from two unsupervised visits' }
      ),
    ],
    receipts: [
      receipt('FUNDED', 'Funding closed', '17840.00', -30, 41),
      receipt('WORKING_CAPITAL_RELEASED', 'Working capital released', '2700.00', -30, 42),
      receipt('TRANCHE_RELEASED', 'Stage 1 released', '4542.00', -9, 40),
    ],
  };
}

/** Funding just closed. Working capital out, nothing claimed yet — the gap the tracker has to survive. */
function folktalesArchive(): CampaignDetail {
  return {
    objectType: 'campaign',
    id: 'camp_folktales',
    topics: ['publishing', 'media'],
    videoUrl: 'https://media.folktales.example/pitch.mp4',
    slug: 'yoruba-folktales-archive',
    title: 'Yoruba Folktales Archive',
    summary: 'Forty hours of recorded folktales that nobody can listen to yet.',
    category: 'arts',
    region: 'Lagos',
    type: 'ALL_OR_NOTHING',
    status: 'FUNDED',
    targetAmount: '6500',
    totalRaised: '6720',
    backerCount: 291,
    deadline: iso(-6),
    launchedAt: iso(-48),
    creator: campaignCreator(CREATORS.yewande),
    milestoneSummary: { total: 3, released: 0, underReview: 0, failed: 0 },
    ideaId: 'idea_folktales',
    ideaSlug: 'yoruba-folktales-archive',
    story: {
      problem:
        'Forty hours of Yoruba folktales sit on tape in a Lagos studio, and none of it is catalogued, transcribed or listenable.',
      solution:
        'Digitise the tapes, transcribe and translate them, and publish the archive free with the recordings attached.',
      targetUser:
        'Teachers and parents who want the stories in Yoruba, and the eleven storytellers who recorded them and have never heard the result.',
      currentAlternative:
        'Nothing. The tapes degrade, and the two storytellers who have died since the recordings were made are not replaceable.',
      askBreakdown: [
        { label: 'Tape digitisation, 40 hours', amount: '2400' },
        { label: 'Transcription and translation', amount: '2600' },
        { label: 'Archive hosting for five years', amount: '900' },
        { label: 'Storyteller payments', amount: '600' },
      ],
      roadmap: 'Digitise, then transcribe, then publish with the recordings attached.',
    },
    risks:
      'Two tapes are visibly damaged and may not survive digitisation. The stage that funds transcription is deliberately sized to the hours that come back readable, not to the forty hours on the shelf, so a bad transfer reduces the scope rather than the payment.',
    workingCapitalPct: '15.00',
    milestones: [
      upcoming('ms_fa_1', 0, 'Tapes digitised', 'All 40 hours transferred and checksummed.', '30.00', {
        type: 'File manifest',
        source: 'Public manifest with durations and checksums',
      }),
      upcoming(
        'ms_fa_2',
        1,
        'Transcribed and translated',
        'Every readable hour transcribed in Yoruba and translated to English.',
        '40.00',
        { type: 'Transcript sample', source: 'Ten full transcripts, published' }
      ),
      upcoming('ms_fa_3', 2, 'Archive published', 'The archive is live and free to search.', '30.00', {
        type: 'Public URL',
        source: 'The live archive, open to anyone',
      }),
    ],
    receipts: [
      receipt('FUNDED', 'Funding closed', '6720.00', -6, 50),
      receipt('WORKING_CAPITAL_RELEASED', 'Working capital released', '975.00', -6, 51),
    ],
  };
}

/** Early and quiet. A campaign with nothing to show yet still has to read as a campaign. */
function kilishiKitchen(): CampaignDetail {
  return {
    objectType: 'campaign',
    id: 'camp_kilishi',
    topics: ['food', 'manufacturing'],
    videoUrl: 'https://media.kilishikitchen.example/pitch.mp4',
    slug: 'kilishi-kitchen',
    title: 'Kilishi Kitchen',
    summary: 'A Jos kilishi maker runs out of stock every Thursday and turns away Abuja orders.',
    category: 'agriculture',
    region: 'Jos',
    type: 'ALL_OR_NOTHING',
    status: 'ACTIVE',
    targetAmount: '4000',
    totalRaised: '860',
    backerCount: 47,
    deadline: iso(26),
    launchedAt: iso(-9),
    creator: campaignCreator(CREATORS.halima),
    milestoneSummary: { total: 3, released: 0, underReview: 0, failed: 0 },
    ideaId: 'idea_kilishi',
    ideaSlug: 'kilishi-kitchen',
    story: {
      problem:
        'Demand from Abuja is three times what the drying racks can produce, so orders are turned away every week.',
      solution:
        'A second drying room and a vacuum sealer, so a week of production ships instead of two days of it.',
      targetUser:
        'The Abuja retailers who already order weekly, and the family kitchen in Jos that has made kilishi for three generations.',
      currentAlternative:
        'Sun racks that take four days and stop entirely in the rains, and orders capped at what fits in a cool box.',
      askBreakdown: [
        { label: 'Second drying room', amount: '1900' },
        { label: 'Vacuum sealer and packaging', amount: '1200' },
        { label: 'Cold transport for the first quarter', amount: '900' },
      ],
      roadmap: 'Build the room, seal and ship, then hold Abuja stock for a full month.',
    },
    risks:
      'Beef prices are the thing that could break this. The stage that funds transport is last for that reason: if input costs move, the shipping commitment has not been made yet.',
    workingCapitalPct: '20.00',
    milestones: [
      upcoming('ms_kk_1', 0, 'Second drying room built', 'The room is built and in use.', '40.00', {
        type: 'Photos and receipts',
        source: 'Build photos plus supplier receipts',
      }),
      upcoming(
        'ms_kk_2',
        1,
        'Vacuum sealing in production',
        'Every order shipped sealed for at least a month.',
        '30.00',
        { type: 'Order records', source: 'A month of shipped orders with packaging noted' }
      ),
      upcoming(
        'ms_kk_3',
        2,
        'Abuja stock held for a month',
        'Stock available in Abuja every week for four consecutive weeks.',
        '30.00',
        { type: 'Retailer confirmation', source: 'Written confirmation from two retailers' }
      ),
    ],
    receipts: [],
  };
}

/**
 * A stage the creator appealed. FR-606: objections passed the threshold, the creator appealed inside
 * 72 hours, and the reviewer panel has not ruled. Nothing else in the fixtures renders DISPUTED, and
 * the tone matters most here: it is neutral, because nobody has been found to be in the wrong yet.
 */
function mushinLedger(): CampaignDetail {
  return {
    objectType: 'campaign',
    id: 'camp_mushin_ledger',
    videoUrl: 'https://media.mushinledger.example/pitch.mp4',
    topics: ['fintech', 'commerce'],
    slug: 'mushin-market-ledger',
    title: 'Mushin Market Ledger',
    summary: 'Traders in Mushin lose a day a week reconciling credit sales from memory.',
    category: 'software',
    region: 'Lagos',
    type: 'ALL_OR_NOTHING',
    status: 'ACTIVE',
    targetAmount: '7000',
    totalRaised: '7000',
    backerCount: 264,
    deadline: iso(-14),
    launchedAt: iso(-120),
    creator: campaignCreator(CREATORS.ngozi),
    milestoneSummary: { total: 4, released: 1, underReview: 0, failed: 0 },
    ideaId: 'idea_mushin_ledger',
    ideaSlug: 'mushin-market-ledger',
    story: {
      problem: 'Traders lose a day a week reconciling credit sales from memory and torn notebooks.',
      solution:
        'A ledger that works offline on the cheapest Android phone and settles at the end of the day.',
      targetUser:
        'Stallholders in Mushin market who sell on credit to regulars, which is most of them.',
      currentAlternative:
        'A notebook, and an argument at the end of the month about what was actually owed.',
      askBreakdown: [
        { label: 'Offline-first Android build', amount: '3000' },
        { label: 'Field testing with 30 stalls', amount: '1800' },
        { label: 'Market association onboarding', amount: '1400' },
        { label: 'A year of hosting', amount: '800' },
      ],
      roadmap: 'Ledger, then settlement, then the association rollout.',
    },
    risks:
      'Traders share phones, and a shared device makes a per-trader ledger hard to trust. The settlement stage is where that gets solved or does not, and it is the stage backers should watch.',
    workingCapitalPct: '20.00',
    milestones: [
      released({
        id: 'ms_ml_1',
        index: 0,
        title: 'Offline ledger in daily use',
        deliverable: '30 stalls recording sales for a month with no connection required.',
        tranchePct: '25.00',
        evidence: { type: 'Sync export', source: 'Per-stall entry counts with sync timestamps' },
        proof:
          '34 stalls recorded daily for five weeks. The sync log shows a median of eleven hours offline between syncs, which is the point.',
        objectionPct: '3.90',
        releasedDaysAgo: -60,
        amount: '1400.00',
        sigN: 60,
      }),
      {
        id: 'ms_ml_2',
        index: 1,
        title: 'End-of-day settlement',
        deliverable: 'Traders settle credit balances from the app without a paper reconciliation.',
        tranchePct: '30.00',
        evidenceDefinition: {
          type: 'Settlement records',
          source: 'Twenty settlements with both parties confirming in the app',
        },
        claim: {
          id: 'clm_ml_2',
          submittedAt: iso(-21),
          objectionWindowEndsAt: iso(-14),
          status: 'DISPUTED',
          proof: {
            note: 'Twenty settlements were submitted. Backers objected that eleven of them were confirmed from the same device, which the evidence definition did not exclude but which does not show two parties agreeing. The appeal argues shared phones are normal in this market and the confirmations are still genuine.',
          },
          objectionWeightPct: '34.60',
          objectionThresholdPct: '30.00',
          ruling: null,
        },
        receipt: null,
      },
      upcoming(
        'ms_ml_3',
        2,
        'Association rollout',
        'The market association recommends it to all its members.',
        '25.00',
        { type: 'Association letter', source: 'Written recommendation from the association' }
      ),
      upcoming('ms_ml_4', 3, '200 stalls active', '200 stalls recording in a calendar month.', '20.00', {
        type: 'Usage report',
        source: 'Monthly active count with the query published',
      }),
    ],
    receipts: [
      receipt('FUNDED', 'Funding closed', '7000.00', -110, 61),
      receipt('WORKING_CAPITAL_RELEASED', 'Working capital released', '1400.00', -110, 62),
      receipt('TRANCHE_RELEASED', 'Stage 1 released', '1400.00', -60, 60),
    ],
  };
}

/** A second completed campaign, so a creator's history has more than one row in it. */
function pastPapers(): CampaignDetail {
  const stage = (i: number, title: string, deliverable: string, proof: string, daysAgo: number) =>
    released({
      id: `ms_pp_${i + 1}`,
      index: i,
      title,
      deliverable,
      tranchePct: i === 2 ? '40.00' : '30.00',
      evidence: { type: 'Public URL', source: 'The live archive, open to anyone' },
      proof,
      objectionPct: '1.40',
      releasedDaysAgo: daysAgo,
      amount: i === 2 ? '1060.00' : '795.00',
      sigN: 70 + i,
    });

  return {
    objectType: 'campaign',
    id: 'camp_past_papers',
    videoUrl: 'https://media.pastpapers.example/pitch.mp4',
    topics: ['education'],
    slug: 'past-papers-abuja',
    title: 'Past Papers Abuja',
    summary: 'Six years of past papers exist on WhatsApp and nowhere a student can search.',
    category: 'other',
    region: 'Abuja',
    type: 'ALL_OR_NOTHING',
    status: 'COMPLETED',
    targetAmount: '3000',
    totalRaised: '3100',
    backerCount: 156,
    deadline: iso(-310),
    launchedAt: iso(-380),
    creator: campaignCreator(CREATORS.ibrahim),
    milestoneSummary: { total: 3, released: 3, underReview: 0, failed: 0 },
    ideaId: 'idea_past_papers',
    ideaSlug: 'past-papers-abuja',
    story: {
      problem: 'Six years of past papers circulate on WhatsApp and nowhere a student can search.',
      solution: 'One searchable archive, free, with the papers indexed by course and year.',
      targetUser: 'Undergraduates at three Abuja universities, and the class reps who hoard the files.',
      currentAlternative:
        'Asking in a group chat and hoping someone still has the file from two years ago.',
      askBreakdown: [
        { label: 'Scanning and OCR for 6 years of papers', amount: '1400' },
        { label: 'Search build', amount: '1000' },
        { label: 'Three years of hosting', amount: '600' },
      ],
      roadmap: 'Scan, index, then open it up.',
    },
    risks:
      'Universities could object to redistribution. Every paper carries its source and a takedown route, and the archive is structured so a single course can be removed without breaking the rest.',
    workingCapitalPct: '15.00',
    milestones: [
      stage(
        0,
        'Papers scanned and indexed',
        'Six years of papers scanned, OCRed and indexed.',
        '2,180 papers across six years, all OCRed. The index is public and the scan quality report is attached.',
        -280
      ),
      stage(
        1,
        'Search live',
        'Students can search by course, year and lecturer.',
        'Search went live in March and handled 9,400 queries in its first month.',
        -230
      ),
      stage(
        2,
        '5,000 students using it',
        '5,000 distinct students in a term.',
        '6,100 distinct students across the term. The counting query is published with the export.',
        -180
      ),
    ],
    receipts: [
      receipt('FUNDED', 'Funding closed', '3100.00', -305, 73),
      receipt('WORKING_CAPITAL_RELEASED', 'Working capital released', '450.00', -305, 74),
      receipt('TRANCHE_RELEASED', 'Stage 1 released', '795.00', -280, 70),
      receipt('TRANCHE_RELEASED', 'Stage 2 released', '795.00', -230, 71),
      receipt('TRANCHE_RELEASED', 'Stage 3 released', '1060.00', -180, 72),
    ],
  };
}

export function fixtureCampaigns(): CampaignDetail[] {
  return [
    campusKonekt(),
    coldChainKaduna(),
    mushinLedger(),
    kilishiKitchen(),
    folktalesArchive(),
    clinicQueue(),
    pastPapers(),
    tailorsBank(),
  ];
}

