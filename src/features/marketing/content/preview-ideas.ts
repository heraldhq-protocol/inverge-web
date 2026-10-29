import type { HomeIdeaCard } from "@/features/marketing/types";

/**
 * Illustrative idea records for a deployment with no API configured.
 *
 * These are preview records only. They are not live platform data, they have no
 * idea page to open (`href: null`), and the homepage always shows them beside a
 * "Preview data" label. A deployment whose API is configured never renders this
 * list — `getHomeView()` degrades to an unavailable state instead.
 */
export const previewIdeas: HomeIdeaCard[] = [
  {
    id: "idea-digital-skills",
    artwork: "campus",
    category: "Education",
    title: "Digital skills for young women",
    pitch: "Practical tech training for young women in Lagos.",
    cover:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=800&fit=crop",
    supporters: 128,
    estimatedInterest: { atomic: "482000", currency: "USD", decimals: 2 },
    promoted: true,
    href: null,
  },
  {
    id: "idea-solar-storage",
    artwork: "energy",
    category: "Clean energy",
    title: "Solar cold storage for farmers",
    pitch: "Affordable, off-grid cooling for rural communities.",
    cover:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=900&fit=crop",
    supporters: 89,
    estimatedInterest: { atomic: "296000", currency: "USD", decimals: 2 },
    promoted: false,
    href: null,
  },
  {
    id: "idea-afrobeats-studio",
    artwork: "creative",
    category: "Creative",
    title: "Afrobeats production studio",
    pitch: "A community studio for emerging artists in Lagos.",
    cover:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&h=800&fit=crop",
    supporters: 64,
    estimatedInterest: { atomic: "124000", currency: "USD", decimals: 2 },
    promoted: false,
    href: null,
  },
];
