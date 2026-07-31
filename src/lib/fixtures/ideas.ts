import type { FeedItem } from '@/lib/feed/types';
import type { IdeaComment, IdeaDetail, SurveyAggregate, SurveyQuestion } from '@/lib/ideas/types';
import { CREATORS, publicCreator } from './creators';
import { extraFeedItems } from './extra-ideas';

/**
 * Fixture ideas.
 *
 * Built as functions, not frozen constants, because every date is relative to now: a stale
 * "4 days left" in a screenshot or a review is worse than no countdown at all
 * (campaign-data-contract.md §5).
 *
 * Numbers are chosen to exercise the states that matter rather than the happy path
 * (app-mockup-kit §3.4): ideas mid-flight, one over the line, one barely started, one promoted.
 */

const DAY = 86_400_000;
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * DAY).toISOString();

type Seed = Omit<FeedItem, 'objectType' | 'creator'> & { creatorKey: keyof typeof CREATORS };

function seeds(): Seed[] {
  return [
    {
      id: 'idea_campuskonekt',
      slug: 'campuskonekt',
      title: 'CampusKonekt',
      problem:
        'Students in Ibadan wait 40 minutes for lunch between lectures, and most give up and skip the meal.',
      solution:
        'One ordering app shared by the hostels and the vendors already on campus, with pickup windows tied to the lecture timetable.',
      category: 'software',
      region: 'Ibadan',
      askAmount: '25000',
      status: 'VALIDATING',
      discoverabilityTier: 'FEATURED',
      supporterCount: 412,
      weightedPrePledgeTotal: '1830.50',
      feedbackScore: '4.20',
      feedbackCount: 24,
      commentCount: 31,
      qualityScore: '0.8600',
      creatorId: CREATORS.tobi.id,
      creatorKey: 'tobi',
      promoted: false,
      boostTier: null,
      exploration: false,
      reason: { code: 'VELOCITY', label: 'Gaining momentum' },
      creatorPrePledgeTarget: '2000',
      validatingSince: iso(-56),
    },
    {
      id: 'idea_zowasel',
      slug: 'zowasel-eats',
      title: 'Zowasel Eats',
      problem:
        'Smallholder farmers around Kano lose about a third of a harvest before it reaches a buyer.',
      solution:
        'Aggregation points with cold storage, and a standing offer from three processors so a farmer knows the price before harvest.',
      category: 'agriculture',
      region: 'Kano',
      askAmount: '40000',
      status: 'VALIDATING',
      discoverabilityTier: 'DISCOVERABLE',
      supporterCount: 189,
      weightedPrePledgeTotal: '1120.00',
      feedbackScore: '3.90',
      feedbackCount: 12,
      commentCount: 14,
      qualityScore: '0.7200',
      creatorId: CREATORS.amara.id,
      creatorKey: 'amara',
      promoted: false,
      boostTier: null,
      exploration: false,
      reason: { code: 'CATEGORY', label: 'Matches your interests' },
      creatorPrePledgeTarget: null,
      validatingSince: iso(-34),
    },
    {
      id: 'idea_kaduna_solar',
      slug: 'kaduna-solar-co-op',
      title: 'Kaduna Solar Co-op',
      problem: 'Six hours of grid power a day makes a cold chain impossible for market traders.',
      solution:
        'A shared solar array and battery bank owned by the traders, metered per stall, paid off monthly instead of upfront.',
      category: 'other',
      region: 'Kaduna',
      askAmount: '60000',
      status: 'THRESHOLD_MET',
      discoverabilityTier: 'FEATURED',
      supporterCount: 1203,
      weightedPrePledgeTotal: '6410.00',
      feedbackScore: '4.60',
      feedbackCount: 41,
      commentCount: 88,
      qualityScore: '0.9300',
      creatorId: CREATORS.ibrahim.id,
      creatorKey: 'ibrahim',
      promoted: false,
      boostTier: null,
      exploration: false,
      reason: { code: 'INTENT', label: 'Strong early interest' },
      creatorPrePledgeTarget: '5000',
      validatingSince: iso(-78),
    },
    {
      id: 'idea_clinic_queue',
      slug: 'clinic-queue',
      title: 'Clinic Queue',
      problem:
        'Antenatal patients in Enugu queue from five in the morning for a slot that may not exist.',
      solution:
        'Timed appointment slots the clinic controls, booked by SMS, with a same-day list the front desk can actually see.',
      category: 'software',
      region: 'Enugu',
      askAmount: '22000',
      status: 'VALIDATING',
      discoverabilityTier: 'FEATURED',
      supporterCount: 305,
      weightedPrePledgeTotal: '1560.00',
      feedbackScore: '4.50',
      feedbackCount: 27,
      commentCount: 22,
      qualityScore: '0.8800',
      creatorId: CREATORS.fatima.id,
      creatorKey: 'fatima',
      promoted: false,
      boostTier: null,
      exploration: false,
      reason: { code: 'QUALITY', label: 'Well-crafted pitch' },
      creatorPrePledgeTarget: null,
      validatingSince: iso(-62),
    },
    {
      id: 'idea_akose',
      slug: 'akose-audio-drama',
      title: 'Àkọ́sẹ́ Audio Drama',
      problem:
        'Yoruba folktales exist as text, and there is almost nothing a child can listen to on the way to school.',
      solution:
        'A 12-part audio drama recorded with Lagos stage actors, released free on radio and as low-data downloads.',
      category: 'film',
      region: 'Lagos',
      askAmount: '12000',
      status: 'VALIDATING',
      discoverabilityTier: 'FEATURED',
      supporterCount: 231,
      weightedPrePledgeTotal: '980.00',
      feedbackScore: '4.40',
      feedbackCount: 19,
      commentCount: 26,
      qualityScore: '0.8100',
      creatorId: CREATORS.yewande.id,
      creatorKey: 'yewande',
      promoted: false,
      boostTier: null,
      exploration: false,
      reason: { code: 'FEEDBACK', label: 'Highly rated by backers' },
      creatorPrePledgeTarget: null,
      validatingSince: iso(-45),
    },
    {
      id: 'idea_oja_runs',
      slug: 'oja-runs',
      title: 'Oja Runs',
      problem: 'Market traders in Mushin turn away online orders they have no way to deliver.',
      solution:
        'A shared dispatch pool for one market at a time, so ten traders fund one rider between them.',
      category: 'software',
      region: 'Lagos',
      askAmount: '18000',
      status: 'VALIDATING',
      discoverabilityTier: 'DISCOVERABLE',
      supporterCount: 96,
      weightedPrePledgeTotal: '640.00',
      feedbackScore: '3.40',
      feedbackCount: 8,
      commentCount: 9,
      qualityScore: '0.6400',
      creatorId: CREATORS.ngozi.id,
      creatorKey: 'ngozi',
      promoted: false,
      boostTier: null,
      exploration: false,
      reason: { code: 'REGION', label: 'From Lagos' },
      creatorPrePledgeTarget: null,
      validatingSince: iso(-21),
    },
    {
      id: 'idea_kilishi',
      slug: 'kilishi-co',
      title: 'Kilishi Co',
      problem:
        'Kilishi makers in Jos sell out locally by Thursday and cannot reach the diaspora buyers asking for it.',
      solution:
        'Shared vacuum packing and export paperwork for six family producers, sold as one brand.',
      category: 'other',
      region: 'Jos',
      askAmount: '15000',
      status: 'VALIDATING',
      discoverabilityTier: 'DISCOVERABLE',
      supporterCount: 143,
      weightedPrePledgeTotal: '720.00',
      feedbackScore: '4.10',
      feedbackCount: 13,
      commentCount: 11,
      qualityScore: '0.7500',
      creatorId: CREATORS.halima.id,
      creatorKey: 'halima',
      promoted: false,
      boostTier: null,
      exploration: false,
      reason: { code: 'TRUST', label: 'From a verified creator' },
      creatorPrePledgeTarget: null,
      validatingSince: iso(-30),
    },
    {
      id: 'idea_tailors_bank',
      slug: 'tailors-bank',
      title: "Tailors' Bank",
      problem:
        'A tailor in Aba can price a job accurately and still cannot prove an income to a lender.',
      solution:
        'A job book that doubles as a ledger, so six months of real work becomes something a cooperative will lend against.',
      category: 'other',
      region: 'Aba',
      askAmount: '30000',
      status: 'VALIDATING',
      discoverabilityTier: 'DISCOVERABLE',
      supporterCount: 58,
      weightedPrePledgeTotal: '410.00',
      feedbackScore: '3.80',
      feedbackCount: 11,
      commentCount: 7,
      qualityScore: '0.7000',
      creatorId: CREATORS.chinedu.id,
      creatorKey: 'chinedu',
      promoted: false,
      boostTier: null,
      exploration: true,
      reason: { code: 'EXPLORE', label: 'New, worth a look' },
      creatorPrePledgeTarget: null,
      validatingSince: iso(-9),
    },
    {
      id: 'idea_accra_bike',
      slug: 'accra-bike-kitchen',
      title: 'Accra Bike Kitchen',
      problem: 'A broken bike in Accra means a two-hour walk, because the nearest repair stand is gone.',
      solution:
        'Three tool-share stands with a trained fixer on site two days a week, funded by a small annual membership.',
      category: 'other',
      region: 'Accra',
      askAmount: '9000',
      status: 'VALIDATING',
      discoverabilityTier: 'DISCOVERABLE',
      supporterCount: 74,
      weightedPrePledgeTotal: '300.00',
      feedbackScore: '4.00',
      feedbackCount: 6,
      commentCount: 5,
      qualityScore: '0.6800',
      creatorId: CREATORS.kwabena.id,
      creatorKey: 'kwabena',
      promoted: false,
      boostTier: null,
      exploration: false,
      reason: { code: 'REGION', label: 'From Accra' },
      creatorPrePledgeTarget: null,
      validatingSince: iso(-14),
    },
    {
      // The paid slot. Exactly one, so the distinct treatment can be judged against organic cards.
      id: 'idea_studyplug',
      slug: 'studyplug-ng',
      title: 'StudyPlug NG',
      problem:
        'Past exam papers are scattered across WhatsApp groups, and someone is always charging for them.',
      solution: 'One free, searchable archive per university, uploaded and checked by course reps.',
      category: 'software',
      region: 'Abuja',
      askAmount: '20000',
      status: 'VALIDATING',
      discoverabilityTier: 'DISCOVERABLE',
      supporterCount: 61,
      weightedPrePledgeTotal: '480.00',
      feedbackScore: '3.60',
      feedbackCount: 9,
      commentCount: 6,
      qualityScore: '0.7100',
      creatorId: CREATORS.emeka.id,
      creatorKey: 'emeka',
      promoted: true,
      boostTier: 'FEATURED',
      exploration: false,
      reason: { code: 'PROMOTED', label: 'Promoted' },
      creatorPrePledgeTarget: null,
      validatingSince: iso(-11),
    },
  ];
}

export function fixtureFeedItems(): FeedItem[] {
  const hand = seeds().map(({ creatorKey, ...rest }) => ({
    ...rest,
    objectType: 'idea' as const,
    creator: publicCreator(CREATORS[creatorKey]),
  }));
  // The hand-written ten carry the detail pages and the interesting states, so they lead. The rest is
  // volume, which search and paging need in order to be judged at all.
  return [...hand, ...extraFeedItems()];
}

const DETAIL_EXTRAS: Record<
  string,
  Pick<IdeaDetail, 'targetUser' | 'currentAlternative' | 'askBreakdown' | 'roadmapSteps' | 'roadmap' | 'risks'>
> = {
  idea_campuskonekt: {
    targetUser:
      'Undergraduates in the four hostels on the Ibadan campus who have a 50-minute gap between lectures, and the 30-odd vendors already cooking for them.',
    currentAlternative:
      'They queue in person, or send a friend, or call a vendor who writes the order on paper. Nobody can tell you how long the wait will be, so most people either skip the meal or miss the start of the next lecture.',
    askBreakdown: [
      { label: 'Vendor onboarding and two months of stipends for course reps', amount: 6000 },
      { label: 'Pickup lockers at two hostels', amount: 9000 },
      { label: 'Build and hosting to the end of the first semester', amount: 7000 },
      { label: 'Payment processing float', amount: 3000 },
    ],
    roadmapSteps: [
      { date: '2026-09-15', description: 'Ordering live with eight vendors in one hostel.' },
      { date: '2026-11-01', description: 'Pickup lockers installed, 100 orders a day.' },
      { date: '2027-01-20', description: 'All four hostels, vendor payouts running weekly.' },
    ],
    roadmap:
      'One hostel first, then lockers, then the rest of campus once vendor payouts are boring.',
    risks:
      'The real risk is vendor churn: if the three busiest kitchens leave, the app is empty at lunchtime. I have written commitments from six, and the pickup lockers are the thing they asked for, so leaving costs them the locker slot. Second risk is the university asking for a concession fee, which is why the ask carries a float rather than spending it on marketing.',
  },
  idea_kaduna_solar: {
    targetUser:
      'The 140 stall holders in Kawo market who sell anything perishable, and the six cold-room owners whose rooms are idle 18 hours a day.',
    currentAlternative:
      'Everyone runs a petrol generator, which costs more per day than the stall clears on a slow one, or they buy less stock and sell out by noon.',
    askBreakdown: [
      { label: 'Solar array and mounting', amount: 34000 },
      { label: 'Battery bank', amount: 15000 },
      { label: 'Per-stall metering and wiring', amount: 8000 },
      { label: 'Two years of maintenance cover', amount: 3000 },
    ],
    roadmapSteps: [
      { date: '2026-10-01', description: 'Array installed and metering live for 40 stalls.' },
      { date: '2027-02-01', description: 'All 140 stalls connected, first co-op audit published.' },
    ],
    roadmap: 'Install, meter, hand the billing to the co-op committee.',
    risks:
      'Theft of panels is the obvious one and the reason the array goes on the market roof rather than at ground level. The harder risk is collection: if stalls do not pay the monthly meter charge the maintenance fund empties, so the co-op holds three months in reserve before we connect the last 40 stalls.',
  },
};

export function fixtureIdeaDetail(idOrSlug: string): IdeaDetail | null {
  const item = fixtureFeedItems().find((i) => i.id === idOrSlug || i.slug === idOrSlug);
  if (!item) return null;

  const creatorEntry = Object.values(CREATORS).find((c) => c.id === item.creatorId)!;
  const extras = DETAIL_EXTRAS[item.id] ?? {
    targetUser: null,
    currentAlternative: null,
    askBreakdown: null,
    roadmapSteps: null,
    roadmap: item.solution,
    risks: null,
  };

  return {
    ...item,
    ...extras,
    createdAt: item.validatingSince ?? iso(-30),
    publishedAt: item.validatingSince ?? iso(-30),
    creator: {
      ...publicCreator(creatorEntry),
      bio: creatorEntry.bio,
      tier: creatorEntry.tier,
      completedCampaigns: creatorEntry.completedCampaigns,
      ideasPublished: creatorEntry.ideasPublished,
      memberSince: creatorEntry.memberSince,
    },
  };
}

export function fixtureSurvey(): { questions: SurveyQuestion[]; aggregates: SurveyAggregate[] } {
  const questions: SurveyQuestion[] = [
    {
      id: 'q_rating',
      index: 0,
      type: 'RATING',
      prompt: 'How useful would this be to you?',
      required: true,
      options: null,
    },
    {
      id: 'q_pay',
      index: 1,
      type: 'BOOLEAN',
      prompt: 'Would you pay for this at the price described?',
      required: true,
      options: null,
    },
    {
      id: 'q_blocker',
      index: 2,
      type: 'SINGLE_CHOICE',
      prompt: 'What would stop you using it?',
      required: false,
      options: ['Price', 'It needs data I do not have', 'I do not trust the vendors', 'Nothing'],
    },
    {
      id: 'q_open',
      index: 3,
      type: 'TEXT',
      prompt: 'What is the one thing that would make this obviously worth it?',
      required: false,
      options: null,
    },
  ];

  const aggregates: SurveyAggregate[] = [
    { questionId: 'q_rating', type: 'RATING', responses: 24, average: 4.2, histogram: [0, 1, 3, 9, 11] },
    { questionId: 'q_pay', type: 'BOOLEAN', responses: 24, yes: 19, no: 5 },
    {
      questionId: 'q_blocker',
      type: 'SINGLE_CHOICE',
      responses: 21,
      tally: [
        { option: 'Price', count: 4 },
        { option: 'It needs data I do not have', count: 9 },
        { option: 'I do not trust the vendors', count: 3 },
        { option: 'Nothing', count: 5 },
      ],
    },
    {
      questionId: 'q_open',
      type: 'TEXT',
      responses: 14,
      samples: [
        'If I can see the actual queue length before I order, I would use it every day.',
        'Make it work over SMS. My data finishes by the third week of the month.',
        'Show me which vendor is closest to my hostel, not the whole list.',
      ],
    },
  ];

  return { questions, aggregates };
}

export function fixtureComments(): IdeaComment[] {
  const c = (
    id: string,
    key: keyof typeof CREATORS,
    body: string,
    opts: Partial<IdeaComment> = {}
  ): IdeaComment => ({
    id,
    parentId: null,
    body,
    likeCount: 0,
    likedByMe: false,
    highlighted: false,
    createdAt: iso(-3),
    author: { ...publicCreator(CREATORS[key]), isCreator: false },
    ...opts,
  });

  return [
    c(
      'cmt_1',
      'fatima',
      'The 40 minutes is right, but the part that will kill you is the vendors changing their prices twice a week. How are you handling that without the app looking broken?',
      { highlighted: true, likeCount: 18, createdAt: iso(-6) }
    ),
    c('cmt_1r', 'tobi', 'Fair. Vendors set prices themselves each morning and the app shows the time it was last updated, so a stale price is visibly stale rather than wrong.', {
      parentId: 'cmt_1',
      likeCount: 7,
      createdAt: iso(-6),
      author: { ...publicCreator(CREATORS.tobi), isCreator: true },
    }),
    c('cmt_2', 'kwabena', 'Pickup lockers are the whole idea. I would drop the delivery part entirely for the first semester.', {
      likeCount: 11,
      createdAt: iso(-5),
    }),
    c('cmt_3', 'ngozi', 'Does this work if I have no data left? Most of my week is spent on a 2G connection by the 20th.', {
      likeCount: 9,
      createdAt: iso(-4),
    }),
    c('cmt_3r', 'tobi', 'Ordering will work over SMS from launch. The images will not, which is a trade I am making deliberately.', {
      parentId: 'cmt_3',
      likeCount: 6,
      createdAt: iso(-4),
      author: { ...publicCreator(CREATORS.tobi), isCreator: true },
    }),
    c('cmt_4', 'emeka', '', { removed: true, createdAt: iso(-2) }),
    c('cmt_5', 'halima', 'I ran something similar for a hostel kitchen in Jos and the hard part was refunds when a vendor closed early. Worth planning for.', {
      likeCount: 4,
      createdAt: iso(-1),
    }),
  ];
}
