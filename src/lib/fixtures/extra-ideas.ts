import type { FeedItem, IdeaCategory, Reason, ReasonCode } from '@/lib/feed/types';
import { CREATORS, publicCreator } from './creators';

/**
 * A deeper pool of ideas, so search, topics and paging have something real to work against.
 *
 * The ten hand-written seeds carry the detail pages and the states that matter. These are the rest of the
 * feed: still real-sounding West African projects with believable numbers, but written as a table because
 * their job is volume rather than depth.
 *
 * Every date is relative to now, same rule as the hand-written seeds: a stale "3 days left" in a review is
 * worse than no countdown.
 */

const DAY = 86_400_000;
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * DAY).toISOString();

const CREATOR_KEYS = Object.keys(CREATORS) as (keyof typeof CREATORS)[];

type Row = [
  slug: string,
  title: string,
  problem: string,
  category: IdeaCategory,
  topics: string[],
  region: string,
  ask: number,
  supporters: number,
  weighted: number,
  ageDays: number,
];

const ROWS: Row[] = [
  ['moni-circle', 'Moni Circle', 'Savings groups in Surulere still run on a notebook, and the notebook goes missing.', 'software', ['fintech'], 'Lagos', 14000, 226, 1180, 41],
  ['okada-fix', 'Okada Fix', 'A rider off the road for a day loses a week of income waiting on one part.', 'other', ['transport'], 'Ibadan', 11000, 88, 520, 17],
  ['tayo-tutors', 'Tayo Tutors', 'WAEC tutoring costs more per month than most families spend on transport.', 'software', ['education'], 'Abeokuta', 16000, 341, 1620, 52],
  ['cold-run', 'Cold Run', 'Fish from Epe arrives warm because nobody owns the ice between the boat and the market.', 'agriculture', ['food', 'agriculture'], 'Lagos', 28000, 174, 990, 33],
  ['ile-books', 'Ilé Books', 'Nigerian children read imported books about seasons they have never seen.', 'arts', ['publishing'], 'Ibadan', 9500, 402, 1740, 61],
  ['bata-made', 'Bàtà Made', 'Aba shoemakers export nothing because no two pairs come out the same size.', 'arts', ['fashion', 'design'], 'Aba', 21000, 137, 810, 27],
  ['solar-school', 'Solar School', 'Boarding schools run generators through prep and cut the lights at nine.', 'other', ['energy', 'education'], 'Kaduna', 45000, 289, 2150, 58],
  ['naija-sounds', 'Naija Sounds Archive', 'Highlife masters from the seventies are rotting on reels in three cities.', 'arts', ['music'], 'Enugu', 18000, 512, 2380, 71],
  ['agbo-health', 'Agbo Health', 'Herbal sellers give doses by eye, and nobody records what worked.', 'other', ['health'], 'Osogbo', 13000, 64, 340, 12],
  ['market-scale', 'Market Scale', 'Traders in Kano buy by the heap and lose margin on every heap.', 'other', ['commerce'], 'Kano', 7500, 119, 600, 22],
  ['mama-put-pos', 'Mama Put POS', 'A food seller taking transfers spends the evening matching alerts to plates.', 'software', ['fintech', 'food'], 'Port Harcourt', 12000, 198, 1040, 36],
  ['delta-docs', 'Delta Docs', 'Land documents in Warri exist as photocopies of photocopies.', 'software', ['apps'], 'Warri', 24000, 71, 430, 15],
  ['kubwa-creche', 'Kubwa Crèche Co-op', 'Market women in Kubwa work with babies tied on because childcare costs a day of sales.', 'other', ['community'], 'Abuja', 17000, 246, 1290, 44],
  ['tiv-weave', 'Tiv Weave', 'A-nger cloth weavers sell to middlemen at a third of the Lagos price.', 'arts', ['fashion'], 'Makurdi', 15000, 156, 870, 29],
  ['borehole-watch', 'Borehole Watch', 'Half the community boreholes in the LGA are broken and nobody knows which half.', 'other', ['community'], 'Jos', 19000, 93, 560, 19],
  ['second-cut', 'Second Cut', 'Lagos film students shoot on borrowed cameras and lose the footage to bad drives.', 'film', ['film'], 'Lagos', 22000, 128, 700, 24],
  ['yam-belt', 'Yam Belt', 'Barns in Benue flood every third year and the loss is absorbed by the smallest farms.', 'agriculture', ['agriculture'], 'Makurdi', 32000, 211, 1330, 47],
  ['accra-print', 'Accra Print Room', 'Ghanaian illustrators pay import duty to print work about Accra.', 'arts', ['design'], 'Accra', 13500, 167, 920, 31],
  ['clinic-stock', 'Clinic Stock', 'PHC clinics run out of test strips before anyone files a request.', 'other', ['health'], 'Enugu', 26000, 305, 1580, 55],
  ['bus-stop', 'Bus Stop', 'Nobody in Ibadan can tell you when the next bus leaves, including the driver.', 'software', ['transport', 'apps'], 'Ibadan', 20000, 82, 470, 16],
  ['zaria-repair', 'Zaria Repair Café', 'Broken appliances go to landfill because the last repairer in the area retired.', 'other', ['community'], 'Zaria', 8500, 74, 380, 13],
  ['spice-route', 'Spice Route', 'Ogbono and dawadawa reach the diaspora through four hands and arrive stale.', 'agriculture', ['food'], 'Onitsha', 16500, 189, 1010, 38],
  ['school-run', 'School Run', 'Parents in Lekki pay for three separate drivers to do one route.', 'software', ['transport'], 'Lagos', 23000, 143, 780, 26],
  ['sabo-radio', 'Sabo Radio', 'Community radio in Sabo has an audience and no way to sell an advert.', 'arts', ['music'], 'Kano', 10500, 96, 540, 21],
  ['fabric-bank', 'Fabric Bank', 'Tailors buy fabric in tiny lots at the worst price on the street.', 'arts', ['fashion'], 'Aba', 14500, 118, 640, 23],
  ['aqua-feed', 'Aqua Feed', 'Catfish farmers spend 70% of costs on feed they cannot verify.', 'agriculture', ['agriculture'], 'Ibadan', 30000, 232, 1420, 49],
  ['papers-ng', 'Papers NG', 'Undergraduate research dies on a laptop because no journal will take it.', 'software', ['education'], 'Nsukka', 9000, 261, 1120, 43],
  ['keke-credit', 'Keke Credit', 'A keke driver renting daily pays for the vehicle three times over and owns nothing.', 'software', ['fintech', 'transport'], 'Onitsha', 27000, 178, 960, 34],
  ['ewa-kitchen', 'Ewa Kitchen', 'Campus food is either expensive or an hour away, and never both fixed.', 'agriculture', ['food'], 'Ile-Ife', 11500, 205, 1080, 39],
  ['delta-mangrove', 'Delta Mangrove', 'Replanting happens once, then nobody funds the four years it takes to hold.', 'other', ['community'], 'Yenagoa', 35000, 154, 890, 30],
];

const REASONS: Reason[] = [
  { code: 'VELOCITY', label: 'Gaining momentum' },
  { code: 'CATEGORY', label: 'Matches your interests' },
  { code: 'FEEDBACK', label: 'Highly rated by backers' },
  { code: 'QUALITY', label: 'Well-crafted pitch' },
  { code: 'TRUST', label: 'From a verified creator' },
  { code: 'INTENT', label: 'Strong early interest' },
];

function reasonFor(index: number, region: string, ageDays: number): Reason {
  if (ageDays <= 14) return { code: 'EXPLORE' as ReasonCode, label: 'New, worth a look' };
  if (index % 5 === 0) return { code: 'REGION' as ReasonCode, label: `From ${region}` };
  return REASONS[index % REASONS.length];
}

export function extraFeedItems(): FeedItem[] {
  return ROWS.map((row, index) => {
    const [slug, title, problem, category, topics, region, ask, supporters, weighted, ageDays] = row;
    const creator = CREATORS[CREATOR_KEYS[index % CREATOR_KEYS.length]];
    const thresholdMet = weighted >= 2000 && supporters >= 50;

    return {
      objectType: 'idea' as const,
      id: `idea_${slug.replace(/-/g, '_')}`,
      slug,
      title,
      problem,
      solution: `A first version built with the people who have this problem, in ${region}, before anything is asked of anyone else.`,
      category,
      topics,
      region,
      askAmount: String(ask),
      status: thresholdMet ? ('THRESHOLD_MET' as const) : ('VALIDATING' as const),
      discoverabilityTier: index % 4 === 0 ? ('FEATURED' as const) : ('DISCOVERABLE' as const),
      supporterCount: supporters,
      weightedPrePledgeTotal: weighted.toFixed(2),
      feedbackScore: (3.2 + ((index * 7) % 16) / 10).toFixed(2),
      feedbackCount: 6 + (index % 24),
      commentCount: 2 + (index % 18),
      qualityScore: (0.62 + ((index * 3) % 30) / 100).toFixed(4),
      creatorId: creator.id,
      creator: publicCreator(creator),
      promoted: false,
      boostTier: null,
      exploration: ageDays <= 14,
      reason: reasonFor(index, region, ageDays),
      creatorPrePledgeTarget: null,
      validatingSince: iso(-ageDays),
    };
  });
}
