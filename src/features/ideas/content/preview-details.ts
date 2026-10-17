import type {
  AskBreakdownItem,
  IdeaDetailRecord,
  IdeaGateThresholds,
  RoadmapStep,
} from "@/features/ideas/types";
import type { MoneyAmount } from "@/lib/money";

/**
 * Illustrative pitch detail for the public idea pages.
 *
 * Preview content only. It reads like a real listing so the surfaces can be
 * reviewed at a realistic density, but none of it is live platform data. Every
 * surface that shows it must keep a "Preview data" label.
 *
 * The structured fields mirror `CreateIdeaDto` in `inverge-api`
 * (`problem`, `solution`, `targetUser`, `currentAlternative`, `askBreakdown`,
 * `roadmapSteps`, `askAmount`), so swapping fixtures for the API payload is a
 * rename-free change at the detail-page boundary.
 */

/** Whole-dollar USD amounts as integer atomic cents — never floating point. */
const usd = (dollars: number): MoneyAmount => ({
  atomic: String(dollars * 100),
  currency: "USD",
  decimals: 2,
});

const steps = (...items: readonly RoadmapStep[]): readonly RoadmapStep[] =>
  items;

const breakdown = (
  ...items: readonly AskBreakdownItem[]
): readonly AskBreakdownItem[] => items;

/**
 * FR-204's validation threshold, as one platform rule.
 *
 * An idea must reach both before it can become a campaign draft, so every
 * preview record carries the same gate and `evaluateGate` reports progress
 * against the idea's own supporters and pre-pledge intent. The pre-pledge
 * figure is in the same (illustrative) scale as the summaries in
 * `features/home/content/preview-data.ts`.
 */
export const previewGateThresholds: IdeaGateThresholds = {
  minPrePledged: { atomic: "250000000", currency: "USD", decimals: 2 },
  minSupporters: 250,
};

export const previewIdeaDetails: Record<string, IdeaDetailRecord> = {
  "campus-konekt": {
    cover: null,
    gate: previewGateThresholds,
    publishedAt: "2026-07-18T09:00:00.000Z",
    problem:
      "Campus businesses win almost all their work by word of mouth. Students — especially those new to campus — never learn what is available a few metres away, so they default to whatever they already know.",
    targetUser:
      "Students and the campus vendors who serve them (print shops, food stalls, tailors).",
    currentAlternative:
      "Word of mouth and pinned notices on noticeboards, which reach only the people a vendor already knows and leave new students out.",
    solution:
      "CampusKonekt is a verified directory and ordering layer for campus businesses. Vendors list what they sell and when they are open; students browse, order, and pay in one place. Every vendor is checked against a student ID and campus address before listing, which keeps the directory free of dead entries.",
    roadmapSteps: steps(
      {
        date: "2026-09-30",
        description: "Onboard 200 verified vendors across three campuses.",
      },
      {
        date: "2026-11-30",
        description:
          "Launch student ordering with pickup windows and in-app payment.",
      },
      {
        date: "2027-01-31",
        description:
          "Give vendors demand analytics so they can stock with confidence.",
      },
    ),
    askBreakdown: breakdown(
      { label: "Vendor onboarding and verification", amount: usd(9_000) },
      { label: "Ordering and payments build", amount: usd(15_000) },
      { label: "Vendor analytics", amount: usd(6_000) },
    ),
    askAmount: usd(30_000),
    feedbackScore: 4.3,
    creatorVerified: true,
    creatorBio:
      "Tobi has run the directory by hand across two campuses for a year and previously built a student events platform used by 6,000 students.",
    responseRate: 0.92,
    changes: [
      {
        date: "2026-09-10",
        description:
          "Added in-app payment after supporters asked for one checkout instead of bank transfers.",
      },
    ],
    demoUrl: "https://example.com/campuskonekt-demo",
    verifiedSupporters: 287,
    supportersByRegion: [
      { label: "Local", count: 268 },
      { label: "Diaspora", count: 144 },
    ],
  },
  "sungrid-community-power": {
    cover: null,
    gate: previewGateThresholds,
    publishedAt: "2026-08-02T09:00:00.000Z",
    problem:
      "Small businesses in communities with an unreliable grid lose hours every week to outages. Generators are loud, costly to run, and rarely shared, so each trader pays for capacity they use only part of the time.",
    targetUser:
      "Market traders and small workshops in communities with unreliable grid power.",
    currentAlternative:
      "Private generators, which are expensive to fuel and sized for a single business rather than a cluster.",
    solution:
      "SunGrid installs shared solar capacity at a site and meters it out to the businesses around it on a pay-as-you-use basis. One installation serves a cluster of shops, which spreads the cost far below a private system and keeps a spare unit on hand for maintenance.",
    roadmapSteps: steps(
      {
        date: "2026-10-31",
        description: "Install one shared system at a pilot market cluster.",
      },
      {
        date: "2026-12-31",
        description:
          "Meter usage per business and bill weekly through mobile money.",
      },
      {
        date: "2027-02-28",
        description: "Publish running costs so members can see what they save.",
      },
    ),
    askBreakdown: breakdown(
      { label: "Pilot system and installation", amount: usd(24_000) },
      { label: "Metering and billing", amount: usd(12_000) },
      { label: "First-year maintenance reserve", amount: usd(9_000) },
    ),
    askAmount: usd(45_000),
    feedbackScore: 4.1,
    creatorVerified: true,
    creatorBio:
      "Amaka has delivered two community solar pilot projects and previously led operations at a clean-energy startup in Enugu.",
    responseRate: 0.85,
    changes: [
      {
        date: "2026-09-15",
        description:
          "Switched to pay-as-you-use billing after backers flagged flat monthly fees as a blocker.",
      },
    ],
    demoUrl: "https://example.com/sungrid-demo",
    verifiedSupporters: 201,
    supportersByRegion: [
      { label: "Local", count: 214 },
      { label: "Diaspora", count: 72 },
    ],
  },
  "farmlink-coldbox": {
    cover: null,
    gate: previewGateThresholds,
    publishedAt: "2026-07-25T09:00:00.000Z",
    problem:
      "Small-scale farmers lose a large share of each harvest to heat and delay. The nearest cold storage is usually too far to reach before produce spoils, and the cost is hard to justify for a small volume.",
    targetUser:
      "Smallholder farmers producing perishable crops close to a cooperative.",
    currentAlternative:
      "Selling immediately at harvest for a lower price, or paying for distant cold storage that is impractical for small volumes.",
    solution:
      "FarmLink ColdBox places compact solar-powered cold rooms within walking distance of a farming cluster and rents space by the crate. Farmers pay for the days they use rather than committing to a season, so the risk of a slow week stays with the operator.",
    roadmapSteps: steps(
      {
        date: "2026-10-31",
        description: "Build two ColdBox units near a producing cluster.",
      },
      {
        date: "2026-12-31",
        description:
          "Price storage per crate per day and collect by mobile money.",
      },
      {
        date: "2027-02-28",
        description:
          "Record spoilage before and after so the saving is visible.",
      },
    ),
    askBreakdown: breakdown(
      { label: "Two ColdBox units", amount: usd(18_000) },
      { label: "Solar and installation", amount: usd(7_000) },
      { label: "Launch operations", amount: usd(3_000) },
    ),
    askAmount: usd(28_000),
    feedbackScore: 4.0,
    creatorVerified: true,
    creatorBio:
      "Ibrahim has run an agricultural cooperative for five years and led a pilot cold-storage trial with two cooperatives.",
    responseRate: 0.71,
    changes: [],
    demoUrl: "https://example.com/farmlink-demo",
    verifiedSupporters: 150,
    supportersByRegion: [
      { label: "Local", count: 148 },
      { label: "Diaspora", count: 45 },
    ],
  },
  "studymate-ng": {
    cover: null,
    gate: previewGateThresholds,
    publishedAt: "2026-08-21T09:00:00.000Z",
    problem:
      "Students preparing for national exams often study alone, with past papers but no feedback on where they are actually weak. A wrong answer is marked wrong and then set aside.",
    targetUser: "Secondary students preparing for national exams in Nigeria.",
    currentAlternative:
      "Paper past questions and informal group study, neither of which explains why an answer is wrong.",
    solution:
      "StudyMate NG pairs a question bank with an assistant that explains wrong answers, tracks weak topics, and builds a short daily plan. It works offline first and syncs whenever there is a connection, which matters where data is expensive.",
    roadmapSteps: steps(
      {
        date: "2026-10-31",
        description: "Ship an offline question bank of 5,000 past questions.",
      },
      {
        date: "2026-12-31",
        description: "Add topic-level weakness tracking and a daily plan.",
      },
      {
        date: "2027-02-28",
        description:
          "Pilot with two secondary schools and measure score movement.",
      },
    ),
    askBreakdown: breakdown(
      { label: "Question bank licensing", amount: usd(8_000) },
      { label: "Offline sync build", amount: usd(7_000) },
      { label: "School pilot", amount: usd(3_000) },
    ),
    askAmount: usd(18_000),
    feedbackScore: 4.4,
  },
  "zippy-campus": {
    cover: null,
    gate: previewGateThresholds,
    publishedAt: "2026-06-30T09:00:00.000Z",
    problem:
      "Getting anything across a large campus takes a long walk, and student traders have no reliable way to reach buyers on the far side at all.",
    targetUser:
      "Students and student-run businesses on large university campuses.",
    currentAlternative:
      "Walking deliveries themselves, or informal WhatsApp arrangements with no tracking or accountability.",
    solution:
      "ZippyCampus is an on-demand delivery service run by students, for students. Orders are placed in an app and picked up by the nearest rider, usually within minutes. Riders earn per delivery and set their own hours between lectures.",
    roadmapSteps: steps(
      {
        date: "2026-09-30",
        description: "Run a rider pilot on one campus with 20 couriers.",
      },
      {
        date: "2026-11-30",
        description: "Publish delivery times and failed-delivery rates openly.",
      },
      {
        date: "2027-01-31",
        description: "Extend to two more campuses once the pilot holds up.",
      },
    ),
    askBreakdown: breakdown(
      { label: "Rider app", amount: usd(5_000) },
      { label: "Pilot operations", amount: usd(4_000) },
      { label: "Campus access and insurance", amount: usd(3_000) },
    ),
    askAmount: usd(12_000),
    feedbackScore: 3.8,
  },
  "crop-circle": {
    cover: null,
    gate: previewGateThresholds,
    publishedAt: "2026-07-09T09:00:00.000Z",
    problem:
      "Small farms cannot justify buying a tractor, a thresher, or an irrigation pump for the few days a year they need one, so the work waits for the machine or the machine is never bought at all.",
    targetUser:
      "Smallholder farms needing occasional access to equipment they cannot own.",
    currentAlternative:
      "Waiting for shared machines arranged informally, which is unreliable and hard to plan around.",
    solution:
      "CropCircle is a booking service for shared farm equipment. Owners list a machine for the periods it would otherwise sit idle; farmers book a slot, and the platform handles scheduling, deposits, and payment.",
    roadmapSteps: steps(
      {
        date: "2026-10-31",
        description: "Onboard 40 equipment owners across the area.",
      },
      {
        date: "2026-12-31",
        description: "Add calendar booking with deposit handling.",
      },
      {
        date: "2027-02-28",
        description: "Measure idle time saved on the busiest machines.",
      },
    ),
    askBreakdown: breakdown(
      { label: "Booking platform", amount: usd(9_000) },
      { label: "Owner onboarding", amount: usd(5_000) },
      { label: "Deposit handling and support", amount: usd(6_000) },
    ),
    askAmount: usd(20_000),
    feedbackScore: 3.9,
  },
  agroroute: {
    cover: null,
    gate: previewGateThresholds,
    publishedAt: "2026-07-30T09:00:00.000Z",
    problem:
      "Produce moves from rural growers to city retailers through a chain of middlemen, each taking a margin, while growers carry most of the risk when something spoils on the way.",
    targetUser: "Rural growers and city retailers trading fresh produce.",
    currentAlternative:
      "Several ad-hoc trips with multiple middlemen, raising both cost and spoilage.",
    solution:
      "AgroRoute runs a coordinated route. Growers book space, produce is collected at a fixed time, and retailers order ahead. One scheduled route replaces several ad-hoc trips, which cuts both cost and spoilage.",
    roadmapSteps: steps(
      {
        date: "2026-10-31",
        description:
          "Establish one weekly route between a growing area and a city market.",
      },
      {
        date: "2026-12-31",
        description:
          "Give retailers an ordering window and growers a guaranteed pickup.",
      },
      {
        date: "2027-02-28",
        description: "Publish spoilage and margin numbers for every trip.",
      },
    ),
    askBreakdown: breakdown(
      { label: "Route logistics", amount: usd(10_000) },
      { label: "Refrigerated van deposit", amount: usd(9_000) },
      { label: "Ordering platform", amount: usd(5_000) },
    ),
    askAmount: usd(24_000),
    feedbackScore: 4.2,
  },
  "ecocharge-kiosks": {
    cover: null,
    gate: previewGateThresholds,
    publishedAt: "2026-08-14T09:00:00.000Z",
    problem:
      "Traders and commuters in busy markets need to keep phones charged to keep trading and travelling. Today they pay a stallholder for a shared socket, with no fixed price and no guarantee it will be free.",
    targetUser: "Market traders and commuters in busy neighbourhood markets.",
    currentAlternative:
      "Shared wall sockets at a stallholder's discretion, with no fixed price or availability guarantee.",
    solution:
      "EcoCharge Kiosks are solar-powered charging points placed in markets. Each kiosk is run by a local operator on a small commission and takes payment per charge by mobile money, so the price is the same for everyone.",
    roadmapSteps: steps(
      {
        date: "2026-10-31",
        description: "Install five kiosks across one market.",
      },
      {
        date: "2026-12-31",
        description: "Recruit and train five local operators.",
      },
      {
        date: "2027-02-28",
        description: "Report daily usage and uptime for every kiosk.",
      },
    ),
    askBreakdown: breakdown(
      { label: "Kiosk hardware", amount: usd(15_000) },
      { label: "Installation", amount: usd(4_000) },
      { label: "Operator training", amount: usd(3_000) },
    ),
    askAmount: usd(22_000),
    feedbackScore: 4.0,
  },
  solarchill: {
    cover: null,
    gate: previewGateThresholds,
    publishedAt: "2026-08-27T09:00:00.000Z",
    problem:
      "Clinics and food sellers off the grid lose medicine and stock when there is no reliable refrigeration, and a single failure can wipe out a month of work.",
    targetUser: "Off-grid clinics and market food sellers.",
    currentAlternative:
      "Ice blocks and intermittent grid power, both of which fail unpredictably.",
    solution:
      "SolarChill builds modular solar refrigeration units that start small and expand. A unit holds a fixed payload, keeps its temperature through cloudy spells, and is maintained by a technician trained in the area rather than shipped away.",
    roadmapSteps: steps(
      {
        date: "2026-10-31",
        description:
          "Deploy two units, one to a clinic and one to a market seller.",
      },
      {
        date: "2026-12-31",
        description: "Log temperature through a typical cloudy week.",
      },
      {
        date: "2027-02-28",
        description: "Train two local technicians to maintain the units.",
      },
    ),
    askBreakdown: breakdown(
      { label: "Two refrigeration units", amount: usd(18_000) },
      { label: "Temperature logging", amount: usd(3_000) },
      { label: "Technician training", amount: usd(5_000) },
    ),
    askAmount: usd(26_000),
    feedbackScore: 4.1,
  },
  "naijacraft-collective": {
    cover: null,
    gate: previewGateThresholds,
    publishedAt: "2026-07-12T09:00:00.000Z",
    problem:
      "Nigerian artisans make high-quality goods but sell mostly to whoever passes by, with no reliable way to reach buyers outside their town and no standard way to describe what they make.",
    targetUser: "Artisans and handmade-goods makers across Nigeria.",
    currentAlternative:
      "Local stalls and occasional word-of-mouth orders, which never scale beyond a single town.",
    solution:
      "NaijaCraft Collective is a curated marketplace. Artisans are vetted, products are photographed and described to one standard, and orders are consolidated so a single shipment carries goods from several makers.",
    roadmapSteps: steps(
      {
        date: "2026-10-31",
        description: "Curate a first group of 50 artisans across four crafts.",
      },
      {
        date: "2026-12-31",
        description:
          "Standardise photography, pricing, and product descriptions.",
      },
      {
        date: "2027-02-28",
        description: "Set up consolidated shipping to two cities.",
      },
    ),
    askBreakdown: breakdown(
      { label: "Photography and listing standardisation", amount: usd(6_000) },
      { label: "Curation", amount: usd(4_000) },
      { label: "Shipping setup", amount: usd(5_000) },
    ),
    askAmount: usd(15_000),
    feedbackScore: 3.9,
  },
  "story-foundry": {
    cover: null,
    gate: previewGateThresholds,
    publishedAt: "2026-07-05T09:00:00.000Z",
    problem:
      "Independent African animators and writers work alone, and few can afford the studio overhead a full production needs. Good work stalls at the stage where it needs a team.",
    targetUser: "Independent African animators, writers, and sound artists.",
    currentAlternative:
      "Working solo and pausing projects when they need a team, or paying unaffordable studio rates.",
    solution:
      "StoryFoundry is a shared production space and pipeline. Writers, animators, and sound artists join a project, split the work, and share the revenue by contribution, with the split agreed before production starts.",
    roadmapSteps: steps(
      {
        date: "2026-10-31",
        description: "Open the studio with room for 12 resident creators.",
      },
      {
        date: "2026-12-31",
        description: "Run a first short film as a proof of the pipeline.",
      },
      {
        date: "2027-02-28",
        description: "Publish a simple revenue split by contribution.",
      },
    ),
    askBreakdown: breakdown(
      { label: "Studio fit-out", amount: usd(18_000) },
      { label: "Pipeline tooling", amount: usd(8_000) },
      { label: "First project", amount: usd(6_000) },
    ),
    askAmount: usd(32_000),
    feedbackScore: 4.2,
  },
  "skill-circle": {
    cover: null,
    gate: previewGateThresholds,
    publishedAt: "2026-06-24T09:00:00.000Z",
    problem:
      "Neighbourhoods hold a lot of practical skill, but matching someone who can teach with someone who wants to learn usually depends on knowing the right person already.",
    targetUser:
      "Residents of a neighbourhood who want to teach or learn practical skills.",
    currentAlternative:
      "Asking around personally, which is limited to a person's existing network.",
    solution:
      "SkillCircle is a neighbourhood skill exchange. Members offer what they can teach and ask for what they want to learn; sessions are arranged locally and are free at the point of use, so the exchange stays about skill rather than money.",
    roadmapSteps: steps(
      {
        date: "2026-09-30",
        description: "Run the exchange in one neighbourhood by hand.",
      },
      {
        date: "2026-11-30",
        description: "Add member profiles and a simple request board.",
      },
      {
        date: "2027-01-31",
        description: "Publish participation and repeat-session rates.",
      },
    ),
    askBreakdown: breakdown(
      { label: "Request board build", amount: usd(5_000) },
      { label: "Coordination", amount: usd(2_500) },
      { label: "Launch materials", amount: usd(1_500) },
    ),
    askAmount: usd(9_000),
    feedbackScore: 3.7,
  },
  "care-bridge": {
    cover: null,
    gate: previewGateThresholds,
    publishedAt: "2026-07-21T09:00:00.000Z",
    problem:
      "Family caregivers and volunteers coordinate over scattered phone calls, and gaps in cover are usually found only when they cause a problem.",
    targetUser:
      "Family caregivers and community volunteers coordinating care visits.",
    currentAlternative:
      "Phone calls and group chats, where a missed visit is only discovered after it happens.",
    solution:
      "CareBridge is a coordination network: a shared schedule, a short handover note for each visit, and volunteers who can be matched to a gap in cover. The aim is to make a missed visit visible before it happens rather than after.",
    roadmapSteps: steps(
      {
        date: "2026-10-31",
        description: "Onboard 30 caregivers and 20 volunteers in one area.",
      },
      {
        date: "2026-12-31",
        description: "Ship the shared schedule and handover notes.",
      },
      {
        date: "2027-02-28",
        description: "Track gaps in cover and how long they take to fill.",
      },
    ),
    askBreakdown: breakdown(
      { label: "Schedule build", amount: usd(7_000) },
      { label: "Onboarding", amount: usd(3_000) },
      { label: "Pilot support", amount: usd(4_000) },
    ),
    askAmount: usd(14_000),
    feedbackScore: 4.0,
  },
  "market-basket": {
    cover: null,
    gate: previewGateThresholds,
    publishedAt: "2026-08-08T09:00:00.000Z",
    problem:
      "Buying household staples in small quantities costs more than buying in bulk, and prices for the same item differ sharply between stalls a street apart.",
    targetUser:
      "Households buying staples regularly in the same neighbourhood.",
    currentAlternative:
      "Small-quantity purchases at retail prices, with no visibility into wholesale pricing.",
    solution:
      "MarketBasket groups orders for staples and buys at wholesale, then schedules a local pickup. Members see the wholesale price and the pickup time before they commit, so the saving is clear rather than implied.",
    roadmapSteps: steps(
      {
        date: "2026-10-31",
        description: "Run group orders for five staples in one area.",
      },
      {
        date: "2026-12-31",
        description: "Publish wholesale prices and pickup schedules.",
      },
      {
        date: "2027-02-28",
        description: "Add mobile-money payment and a pickup log.",
      },
    ),
    askBreakdown: breakdown(
      { label: "Order grouping build", amount: usd(5_000) },
      { label: "Sourcing and wholesale agreements", amount: usd(4_000) },
      { label: "Pickup logistics", amount: usd(2_000) },
    ),
    askAmount: usd(11_000),
    feedbackScore: 3.8,
  },
  "kitchen-collective": {
    cover: null,
    gate: previewGateThresholds,
    publishedAt: "2026-08-19T09:00:00.000Z",
    problem:
      "Small food brands cannot afford a certified kitchen of their own, so they either sell informally or pay high hourly rates that eat the margin on every batch.",
    targetUser: "Small food brands producing to sell beyond their own street.",
    currentAlternative:
      "Informal home production, or expensive per-hour commercial kitchens.",
    solution:
      "Kitchen Collective is a shared certified kitchen booked by the hour. Members get compliant space, basic equipment, and a shared quality checklist, so a small brand can produce at a standard that lets it sell beyond its own street.",
    roadmapSteps: steps(
      {
        date: "2026-10-31",
        description: "Fit out one certified kitchen with eight hourly slots.",
      },
      {
        date: "2026-12-31",
        description: "Recruit 20 member brands and run bookings.",
      },
      {
        date: "2027-02-28",
        description: "Apply the shared quality checklist to every batch.",
      },
    ),
    askBreakdown: breakdown(
      { label: "Certified fit-out", amount: usd(18_000) },
      { label: "Equipment", amount: usd(6_000) },
      { label: "Booking system", amount: usd(3_000) },
    ),
    askAmount: usd(27_000),
    feedbackScore: 4.0,
  },
};
