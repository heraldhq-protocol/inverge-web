import type { PublicCreator } from '@/lib/feed/types';

/**
 * Fixture creators. Real-sounding Nigerian, Ghanaian and diaspora names, never "John Doe"
 * (conventions §1.5). No avatar URLs: there is no avatar field in the API and no stock faces in the
 * repo, so every avatar renders as initials, which is also the live fallback.
 */
export type FixtureCreator = PublicCreator & {
  bio: string;
  tier: 'STARTER' | 'TRUSTED' | 'ESTABLISHED';
  completedCampaigns: number;
  ideasPublished: number;
  memberSince: string;
};

export const CREATORS: Record<string, FixtureCreator> = {
  tobi: {
    id: 'cre_tobi',
    displayName: 'Tobi Adeyemi',
    identityVerified: true,
    verificationTier: 'TIER_3_TRACK_RECORD',
    bio: 'Building for campus life in Ibadan. Previously ran deliveries for two hostels by hand, which is how I know the 40-minute wait is real.',
    tier: 'TRUSTED',
    completedCampaigns: 1,
    ideasPublished: 2,
    memberSince: '2025-02-11',
  },
  amara: {
    id: 'cre_amara',
    displayName: 'Amara Okonkwo',
    identityVerified: true,
    verificationTier: 'TIER_2_CAC',
    bio: 'Agronomist turned operator. I spent four seasons buying from smallholders in Kano and watching a third of it spoil in transit.',
    tier: 'STARTER',
    completedCampaigns: 0,
    ideasPublished: 1,
    memberSince: '2026-01-20',
  },
  ibrahim: {
    id: 'cre_ibrahim',
    displayName: 'Ibrahim Sule',
    identityVerified: true,
    verificationTier: 'TIER_3_TRACK_RECORD',
    bio: 'Electrical engineer in Kaduna. I have wired six cold rooms that now sit idle because the grid gives us six hours.',
    tier: 'ESTABLISHED',
    completedCampaigns: 2,
    ideasPublished: 3,
    memberSince: '2024-08-02',
  },
  ngozi: {
    id: 'cre_ngozi',
    displayName: 'Ngozi Eze',
    identityVerified: false,
    bio: 'Trader and self-taught developer working out of Mushin market.',
    tier: 'STARTER',
    completedCampaigns: 0,
    ideasPublished: 1,
    memberSince: '2026-05-14',
  },
  yewande: {
    id: 'cre_yewande',
    displayName: 'Yewande Bakare',
    identityVerified: true,
    verificationTier: 'TIER_2_CAC',
    bio: 'Radio producer in Lagos. I have recorded 40 hours of Yoruba folktales that nobody can listen to yet.',
    tier: 'TRUSTED',
    completedCampaigns: 1,
    ideasPublished: 2,
    memberSince: '2025-06-30',
  },
  chinedu: {
    id: 'cre_chinedu',
    displayName: 'Chinedu Okafor',
    identityVerified: true,
    verificationTier: 'TIER_1_ID',
    bio: 'Fintech analyst from Aba, son of a tailor who has never been able to prove an income.',
    tier: 'STARTER',
    completedCampaigns: 0,
    ideasPublished: 1,
    memberSince: '2026-06-18',
  },
  kwabena: {
    id: 'cre_kwabena',
    displayName: 'Kwabena Mensah',
    identityVerified: false,
    bio: 'Mechanic and cycling club organiser in Accra.',
    tier: 'STARTER',
    completedCampaigns: 0,
    ideasPublished: 1,
    memberSince: '2026-07-02',
  },
  fatima: {
    id: 'cre_fatima',
    displayName: 'Fatima Bello',
    identityVerified: true,
    verificationTier: 'TIER_3_TRACK_RECORD',
    bio: 'Midwife in Enugu for nine years. I have sent women home from a queue that started at five in the morning.',
    tier: 'TRUSTED',
    completedCampaigns: 1,
    ideasPublished: 1,
    memberSince: '2025-04-09',
  },
  halima: {
    id: 'cre_halima',
    displayName: 'Halima Yusuf',
    identityVerified: true,
    verificationTier: 'TIER_1_ID',
    bio: 'Third-generation kilishi maker in Jos, now shipping to Abuja and running out of stock by Thursday.',
    tier: 'STARTER',
    completedCampaigns: 0,
    ideasPublished: 1,
    memberSince: '2026-03-27',
  },
  emeka: {
    id: 'cre_emeka',
    displayName: 'Emeka Nwosu',
    identityVerified: false,
    bio: 'Final-year student in Abuja collecting past papers since 2023.',
    tier: 'STARTER',
    completedCampaigns: 0,
    ideasPublished: 1,
    memberSince: '2026-06-05',
  },
};

/** Strips the private-ish extras down to the public projection a card renders. */
export function publicCreator(c: FixtureCreator): PublicCreator {
  return {
    id: c.id,
    displayName: c.displayName,
    avatarUrl: c.avatarUrl ?? null,
    identityVerified: c.identityVerified,
    verificationTier: c.verificationTier,
  };
}
