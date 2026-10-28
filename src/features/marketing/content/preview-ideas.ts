export type PreviewIdea = {
  id: string;
  category: string;
  title: string;
  pitch: string;
  image: string;
  supporters: number;
  prePledgeTotal: string;
  promoted?: boolean;
};

/**
 * Illustrative idea records for the public homepage.
 *
 * These are preview records only. They are not live platform data. Replace this
 * module with a typed backend projection when the ideas endpoint is available.
 */
export const previewIdeas: PreviewIdea[] = [
  {
    id: "idea-digital-skills",
    category: "Education",
    title: "Digital skills for young women",
    pitch: "Practical tech training for young women in Lagos.",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=800&fit=crop",
    supporters: 128,
    prePledgeTotal: "$4,820",
    promoted: true,
  },
  {
    id: "idea-solar-storage",
    category: "Clean energy",
    title: "Solar cold storage for farmers",
    pitch: "Affordable, off-grid cooling for rural communities.",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=900&fit=crop",
    supporters: 89,
    prePledgeTotal: "$2,960",
  },
  {
    id: "idea-afrobeats-studio",
    category: "Creative",
    title: "Afrobeats production studio",
    pitch: "A community studio for emerging artists in Lagos.",
    image:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&h=800&fit=crop",
    supporters: 64,
    prePledgeTotal: "$1,240",
  },
];
