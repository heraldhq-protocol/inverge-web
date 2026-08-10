import type { IdeaCategory } from './types';
export { CATEGORIES } from './types';

/**
 * The browsing taxonomy.
 *
 * The API's category enum has exactly five values, and `GET /feed?category=` validates against them
 * (400 on anything else). Five is too coarse to browse — the reference runs fifteen — so this adds a
 * display layer of **topics**, each of which maps onto one API category.
 *
 * That keeps both halves honest: a topic filter is a real, shareable filter, and the request that
 * eventually goes to the live API is still one of the five values it accepts. Widening the enum itself
 * is an API ask; until then a topic narrows client-side within its category.
 *
 * Order matters — this is the order they render in the topic bar.
 */
export type Topic = {
  slug: string;
  label: string;
  /** The API category this topic lives inside. */
  category: IdeaCategory;
  /** Matched against an idea's own `topics` in fixtures; ignored once the API owns topics. */
  keywords: string[];
};

export const TOPICS: Topic[] = [
  // Technology & Software
  { slug: 'apps', label: 'Mobile & Web Apps', category: 'software', keywords: ['app', 'software', 'mobile', 'platform'] },
  { slug: 'saas', label: 'B2B SaaS & Workflows', category: 'software', keywords: ['saas', 'b2b', 'enterprise', 'workflow'] },
  { slug: 'dev-tools', label: 'Developer Tools & APIs', category: 'software', keywords: ['developer', 'api', 'tools', 'code'] },
  { slug: 'ai-tools', label: 'AI & Machine Learning', category: 'technology', keywords: ['ai', 'machine learning', 'llm', 'automation'] },
  { slug: 'robotics', label: 'Robotics & Hardware', category: 'technology', keywords: ['robotics', 'hardware', 'gadgets', 'iot'] },

  // Fintech
  { slug: 'payments', label: 'Payments & USSD', category: 'fintech', keywords: ['payments', 'ussd', 'transfers', 'gateway'] },
  { slug: 'neobanks', label: 'Neobanking & Wallets', category: 'fintech', keywords: ['neobank', 'wallet', 'banking', 'savings'] },
  { slug: 'lending', label: 'Micro-Lending & Credit', category: 'fintech', keywords: ['lending', 'credit', 'loans', 'microfinance'] },
  { slug: 'insurtech', label: 'InsurTech & Protection', category: 'fintech', keywords: ['insurance', 'claims', 'risk', 'protection'] },

  // AgriTech & Agriculture
  { slug: 'cold-chain', label: 'Cold Storage & Solar Logistics', category: 'agritech', keywords: ['cold storage', 'solar', 'preservation', 'harvest'] },
  { slug: 'farm-mgmt', label: 'Farm Management & Sensors', category: 'agritech', keywords: ['farm', 'crops', 'sensors', 'yield'] },
  { slug: 'hydroponics', label: 'Hydroponics & Urban Farming', category: 'agritech', keywords: ['hydroponics', 'greenhouse', 'urban farm'] },
  { slug: 'produce-market', label: 'Produce & Feed Marketplaces', category: 'agriculture', keywords: ['produce', 'wholesale', 'livestock', 'grain'] },

  // HealthTech
  { slug: 'telemedicine', label: 'Telemedicine & Virtual Care', category: 'healthtech', keywords: ['telemedicine', 'doctor', 'virtual care', 'clinic'] },
  { slug: 'medtech', label: 'Medical Devices & Hardware', category: 'healthtech', keywords: ['medical', 'device', 'hardware', 'diagnostic'] },
  { slug: 'digital-health', label: 'Wellness & Health Tracking', category: 'healthtech', keywords: ['wellness', 'fitness', 'tracking', 'mental health'] },

  // Clean Energy
  { slug: 'solar-microgrids', label: 'Solar & Microgrids', category: 'cleantech', keywords: ['solar', 'microgrid', 'power', 'clean energy'] },
  { slug: 'battery-storage', label: 'Battery & Energy Storage', category: 'cleantech', keywords: ['battery', 'storage', 'inverter', 'capacity'] },
  { slug: 'metering', label: 'Smart Metering & Billing', category: 'cleantech', keywords: ['meter', 'billing', 'utility', 'grid'] },

  // EdTech
  { slug: 'campus-apps', label: 'Campus & University Tools', category: 'edtech', keywords: ['campus', 'university', 'student', 'hostel'] },
  { slug: 'elearning', label: 'E-Learning & Video Courses', category: 'edtech', keywords: ['course', 'elearning', 'video', 'tutor'] },
  { slug: 'skills-training', label: 'Vocational Skills & Bootcamps', category: 'edtech', keywords: ['skills', 'bootcamp', 'jobs', 'vocational'] },

  // Logistics & Mobility
  { slug: 'dispatch-pools', label: 'Dispatch & Courier Pools', category: 'logistics', keywords: ['dispatch', 'rider', 'courier', 'delivery'] },
  { slug: 'freight', label: 'Freight & Heavy Haulage', category: 'logistics', keywords: ['freight', 'truck', 'cargo', 'shipping'] },
  { slug: 'last-mile', label: 'Last-Mile & Micro-Mobility', category: 'logistics', keywords: ['last mile', 'bike', 'scooter', 'transit'] },

  // E-Commerce
  { slug: 'd2c', label: 'Direct-to-Consumer Brands', category: 'e-commerce', keywords: ['d2c', 'brand', 'products', 'store'] },
  { slug: 'marketplaces', label: 'B2B & Social Marketplaces', category: 'e-commerce', keywords: ['marketplace', 'vendors', 'traders', 'wholesale'] },
  { slug: 'merchant-tools', label: 'Merchant POS & Inventory', category: 'e-commerce', keywords: ['pos', 'inventory', 'ledger', 'storefront'] },

  // Web3 & Crypto
  { slug: 'solana-apps', label: 'Solana Ecosystem Apps', category: 'web3', keywords: ['solana', 'dapp', 'anchor', 'spl'] },
  { slug: 'defi', label: 'DeFi & Yield Protocols', category: 'web3', keywords: ['defi', 'yield', 'staking', 'liquidity'] },
  { slug: 'onchain-id', label: 'On-Chain Identity & Verification', category: 'web3', keywords: ['identity', 'attestation', 'kyc', 'onchain'] },

  // Art & Fine Art
  { slug: 'painting', label: 'Fine Art & Painting', category: 'art', keywords: ['painting', 'canvas', 'fine art', 'gallery'] },
  { slug: 'digital-art', label: 'Digital Art & Motion Graphics', category: 'art', keywords: ['digital art', 'motion', '3d', 'nft'] },
  { slug: 'sculpture', label: 'Sculptures & Public Installations', category: 'art', keywords: ['sculpture', 'installation', 'public art'] },
  { slug: 'illustration', label: 'Illustration & Art Prints', category: 'art', keywords: ['illustration', 'print', 'poster', 'sketch'] },

  // Comics
  { slug: 'comic-books', label: 'Comic Books & Serials', category: 'comics', keywords: ['comic', 'superhero', 'indie comic'] },
  { slug: 'graphic-novels', label: 'Graphic Novels & Hardcovers', category: 'comics', keywords: ['graphic novel', 'hardcover', 'story'] },
  { slug: 'webcomics', label: 'Webcomics & Digital Serials', category: 'comics', keywords: ['webcomic', 'manga', 'digital comic'] },

  // Crafts
  { slug: 'ceramics', label: 'Pottery & Ceramics', category: 'crafts', keywords: ['pottery', 'ceramics', 'clay', 'vessel'] },
  { slug: 'woodwork', label: 'Woodworking & Furniture', category: 'crafts', keywords: ['wood', 'furniture', 'carpentry', 'table'] },
  { slug: 'jewelry', label: 'Handcrafted Jewelry', category: 'crafts', keywords: ['jewelry', 'silver', 'beads', 'gem'] },

  // Dance
  { slug: 'dance-shows', label: 'Live Dance Performances', category: 'dance', keywords: ['dance', 'choreography', 'ballet', 'stage'] },
  { slug: 'dance-studios', label: 'Dance Spaces & Rehearsal Hubs', category: 'dance', keywords: ['studio', 'space', 'rehearsal'] },

  // Design
  { slug: 'product-design', label: 'Physical Product Design', category: 'design', keywords: ['product design', 'gadget', 'industrial'] },
  { slug: 'architecture', label: 'Architecture & Civic Spaces', category: 'design', keywords: ['architecture', 'civic', 'building', 'space'] },
  { slug: 'typography', label: 'Graphic Design & Typefaces', category: 'design', keywords: ['graphic design', 'type', 'font', 'branding'] },

  // Fashion
  { slug: 'streetwear', label: 'Apparel & Streetwear', category: 'fashion', keywords: ['clothing', 'streetwear', 'apparel', 'fashion'] },
  { slug: 'footwear', label: 'Footwear & Custom Shoes', category: 'fashion', keywords: ['shoes', 'footwear', 'sneakers'] },
  { slug: 'textiles', label: 'Sustainable Fabrics & Textiles', category: 'fashion', keywords: ['textiles', 'fabric', 'weaving', 'pattern'] },

  // Film & Video
  { slug: 'narrative-film', label: 'Feature Films & Shorts', category: 'film', keywords: ['movie', 'feature', 'short film', 'cinema'] },
  { slug: 'documentary', label: 'Documentaries & Non-Fiction', category: 'film', keywords: ['documentary', 'real story', 'history'] },
  { slug: 'animation', label: 'Animation & VFX Shorts', category: 'film', keywords: ['animation', 'anime', 'vfx', '3d film'] },

  // Food & Culinary
  { slug: 'artisan-food', label: 'Artisan Packaged Foods', category: 'food', keywords: ['sauce', 'kilishi', 'spices', 'packaged food'] },
  { slug: 'restaurants', label: 'Ghost Kitchens & Dining', category: 'food', keywords: ['kitchen', 'restaurant', 'dining', 'food truck'] },
  { slug: 'beverages', label: 'Craft Beverages & Juices', category: 'food', keywords: ['drink', 'juice', 'brew', 'coffee', 'tea'] },

  // Games & Gaming
  { slug: 'video-games', label: 'Indie Video Games', category: 'games', keywords: ['indie game', 'steam', 'console', 'pc game'] },
  { slug: 'tabletop', label: 'Board Games & Card Games', category: 'games', keywords: ['board game', 'card game', 'deck', 'tabletop'] },
  { slug: 'rpgs', label: 'RPGs & Miniatures', category: 'games', keywords: ['rpg', 'd&d', 'miniatures', 'dice'] },

  // Journalism
  { slug: 'investigative', label: 'Investigative Newsrooms', category: 'journalism', keywords: ['news', 'investigative', 'reporting'] },
  { slug: 'podcasts', label: 'Podcasts & Audio Shows', category: 'journalism', keywords: ['podcast', 'audio show', 'interview'] },

  // Music
  { slug: 'albums', label: 'Vinyl & Album Releases', category: 'music', keywords: ['album', 'vinyl', 'ep', 'recording'] },
  { slug: 'live-venues', label: 'Live Tours & Venues', category: 'music', keywords: ['tour', 'live venue', 'concert'] },
  { slug: 'synths-gear', label: 'Synths & Audio Gear', category: 'music', keywords: ['synth', 'instrument', 'mic', 'audio gear'] },

  // Photography
  { slug: 'photo-books', label: 'Photo Books & Prints', category: 'photography', keywords: ['photo book', 'photobook', 'gallery prints'] },
  { slug: 'photojournalism', label: 'Documentary Photography', category: 'photography', keywords: ['documentary photo', 'street photo'] },

  // Publishing
  { slug: 'fiction', label: 'Fiction & Novels', category: 'publishing', keywords: ['novel', 'fiction', 'fantasy', 'sci-fi'] },
  { slug: 'non-fiction', label: 'Non-Fiction & Memoirs', category: 'publishing', keywords: ['memoir', 'history', 'biography', 'guide'] },
  { slug: 'childrens-books', label: 'Children’s & Picture Books', category: 'publishing', keywords: ['children', 'picture book', 'kids'] },

  // Theater
  { slug: 'stage-plays', label: 'Stage Plays & Musicals', category: 'theater', keywords: ['play', 'musical', 'theater', 'stage'] },
  { slug: 'immersive-theater', label: 'Immersive & Experimental Theater', category: 'theater', keywords: ['immersive', 'experimental', 'drama'] },

  // Community
  { slug: 'co-ops', label: 'Cooperative Marketplaces', category: 'community', keywords: ['coop', 'cooperative', 'shared pool'] },
  { slug: 'civic-projects', label: 'Civic & Neighborhood Hubs', category: 'community', keywords: ['neighborhood', 'civic', 'hub', 'community'] },

  // Other
  { slug: 'frontier-tech', label: 'Frontier & DeepTech', category: 'other', keywords: ['frontier', 'deeptech', 'quantum', 'biotech'] },
];

/** Display names for all categories. */
export const CATEGORY_LABEL: Record<IdeaCategory, string> = {
  technology: 'Technology',
  software: 'Software & B2B SaaS',
  fintech: 'Fintech & Payments',
  agritech: 'AgriTech & Farming',
  agriculture: 'Agriculture & Food',
  healthtech: 'Health & MedTech',
  cleantech: 'Clean Energy & Solar',
  edtech: 'EdTech & Learning',
  logistics: 'Logistics & Mobility',
  'e-commerce': 'E-Commerce & Retail',
  web3: 'Web3 & Crypto',
  art: 'Art',
  arts: 'Arts & Culture',
  comics: 'Comics',
  crafts: 'Crafts',
  dance: 'Dance',
  design: 'Design',
  fashion: 'Fashion',
  film: 'Film',
  food: 'Food & Culinary',
  games: 'Games',
  journalism: 'Journalism',
  music: 'Music',
  photography: 'Photography',
  publishing: 'Publishing',
  theater: 'Theater',
  community: 'Community',
  other: 'Other Innovations',
};

export const TOPIC_BY_SLUG = new Map(TOPICS.map((t) => [t.slug, t]));

export function topicFor(slug: string | undefined): Topic | undefined {
  if (!slug) return undefined;
  const direct = TOPIC_BY_SLUG.get(slug);
  if (direct) return direct;

  const categoryLabel = CATEGORY_LABEL[slug as keyof typeof CATEGORY_LABEL];
  if (categoryLabel) {
    return {
      slug,
      label: categoryLabel,
      category: slug as IdeaCategory,
      keywords: [slug, categoryLabel.toLowerCase()],
    };
  }
  return undefined;
}

/**
 * Named collections, the reference's row modules in our terms. Each is a query the feed already
 * supports, not a new concept: a lane is a filter with a headline, and the headline is the reason a
 * reader would want that filter.
 */
export type Collection = {
  slug: string;
  title: string;
  blurb: string;
  /** How the lane picks from the ranked pool. Never a re-sort by a paid signal. */
  kind: 'closing-soon' | 'new' | 'threshold-met' | 'near-you' | 'well-supported';
};

export const COLLECTIONS: Collection[] = [
  {
    slug: 'closing-soon',
    title: 'Closing soon',
    blurb: 'Validation windows ending in the next fortnight.',
    kind: 'closing-soon',
  },
  {
    slug: 'new',
    title: 'Just published',
    blurb: 'Ideas in their first two weeks, before the numbers mean much.',
    kind: 'new',
  },
  {
    slug: 'ready-to-raise',
    title: 'Ready to raise',
    blurb: 'Cleared every validation threshold and heading for a campaign.',
    kind: 'threshold-met',
  },
  {
    slug: 'near-you',
    title: 'Near you',
    blurb: 'Building in Lagos, Ibadan, Accra and everywhere between.',
    kind: 'near-you',
  },
  {
    slug: 'well-supported',
    title: 'Most supported',
    blurb: 'The ideas the most people have put their name to.',
    kind: 'well-supported',
  },
];
