import type { IdeaCategory } from '@/lib/feed/types';
import type { TiptapDoc } from './rich-content';

export interface IdeaPreset {
  id: 'weak' | 'normal' | 'detailed';
  name: string;
  badge: string;
  badgeTone: 'danger' | 'neutral' | 'accent';
  description: string;
  form: {
    title: string;
    category: IdeaCategory;
    region: string;
    problem: string;
    targetUser: string;
    currentAlternative: string;
    solution: string;
    solutionDoc: TiptapDoc | null;
    problemDoc: TiptapDoc | null;
    coverImageUrl: string | null;
    askAmount: string;
    risks: string;
    steps: Array<{ date: string; description: string }>;
  };
}

export const IDEA_PRESETS: Record<'weak' | 'normal' | 'detailed', IdeaPreset> = {
  weak: {
    id: 'weak',
    name: 'Weak Idea (Borderline)',
    badge: 'Fails Validation',
    badgeTone: 'danger',
    description: 'Minimal text, vague target user, small $500 ask. Useful for testing quality scoring and gate failure.',
    form: {
      title: 'Quick Task App',
      category: 'software',
      region: '',
      problem: 'People forget to complete daily tasks and need an app to remind them.',
      targetUser: 'Everyone who has tasks to do',
      currentAlternative: 'Paper notes and phone alarms',
      solution: 'A mobile app that sends push notifications to remind users of tasks.',
      solutionDoc: null,
      problemDoc: null,
      coverImageUrl: null,
      askAmount: '500',
      risks: '',
      steps: [
        { date: '2026-09-01', description: 'Build basic UI prototype' },
        { date: '2026-10-01', description: 'Launch to app store' },
      ],
    },
  },

  normal: {
    id: 'normal',
    name: 'Normal Idea (Standard Pitch)',
    badge: 'Standard Pitch',
    badgeTone: 'neutral',
    description: 'Realistic SaaS product, 2 dated steps, clear target user and alternative, $10,000 ask.',
    form: {
      title: 'VendorPay West Africa',
      category: 'fintech',
      region: 'Lagos',
      problem:
        'Small retail vendors in Lagos spend over 3 hours daily reconciling cash and bank transfers across multiple mobile apps, causing financial leakage.',
      targetUser: 'Micro-retailers and market merchants in Lagos managing daily inventory under $5,000',
      currentAlternative: 'Manual paper logbooks and fragmented WhatsApp receipts',
      solution:
        'A single POS dashboard aggregating bank transfers, USSD payments, and instant ledger reconciliation for informal market sellers.',
      solutionDoc: null,
      problemDoc: null,
      // Unsplash: Nathan Dumlao — person using mobile payment app
      coverImageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80',
      askAmount: '10000',
      risks: 'Bank network downtime during peak transaction hours. Mitigated via offline USSD queueing.',
      steps: [
        { date: '2026-09-15', description: 'Complete USSD integration & sandbox beta with 20 merchants' },
        { date: '2026-11-01', description: 'Deploy POS app to first 250 registered stores in Computer Village' },
      ],
    },
  },

  detailed: {
    id: 'detailed',
    name: 'Detailed Idea (High Quality)',
    badge: 'High Quality',
    badgeTone: 'accent',
    description: 'Comprehensive pitch with rich text documents, 3 dated steps, risk mitigation, and $25,000 ask.',
    form: {
      title: 'SolarKiosk — Off-Grid Micro Cold Storage',
      category: 'agritech',
      region: 'Ibadan, Oyo State',
      problem:
        'Smallholder tomato and cassava farmers in Oyo lose up to 40% of their harvest due to lack of immediate cold storage between harvest and market day.',
      targetUser: 'Cooperative farming associations and produce wholesalers in rural Oyo State, Nigeria',
      currentAlternative:
        'Selling immediately at distress prices to middle-men or leaving produce in shade under wet jute bags.',
      solution:
        'Solar-powered modular cold storage kiosks rented per crate per day via USDC micro-payments, preserving produce freshness up to 21 days.',
      solutionDoc: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Modular Solar Thermal System' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Each kiosk stores 150 standard produce crates (approx 3 metric tons) maintained at 4°C using solar-thermal absorption cooling with thermal battery backup.',
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'Key Operational Features' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: '• Pay-per-crate pricing: $0.20 per crate/day\n• Automated SMS receipt & temperature sensor alerts\n• Local cooperative profit-sharing model',
              },
            ],
          },
        ],
      },
      problemDoc: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'First-Hand Field Evidence' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'During our 3-month field assessment in Bodija Market, we recorded over 12 tons of spoiled tomatoes discarded weekly during rainy season spikes.',
              },
            ],
          },
        ],
      },
      // Unsplash: Zbynek Burival — solar panels on open land
      coverImageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80',
      askAmount: '25000',
      risks:
        'Prolonged overcast weather reducing solar charge. Mitigated by hybrid thermal battery packs providing 72-hour autonomy.',
      steps: [
        { date: '2026-08-30', description: 'Finalize thermal storage prototype testing & field validation' },
        { date: '2026-10-15', description: 'Deploy pilot kiosk 01 at Bodija Wholesale Market' },
        { date: '2026-12-01', description: 'Expand to 3 additional cooperative farming hubs' },
      ],
    },
  },
};
