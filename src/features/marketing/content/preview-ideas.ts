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
 * These are preview records only. They are not live platform data and must
 * always be shown alongside a "Preview data" label. Replace this module with a
 * typed backend projection when the ideas endpoint is available.
 */
export const previewIdeas: PreviewIdea[] = [
  {
    id: "idea-digital-skills",
    category: "Education",
    title: "Digital skills for young women",
    pitch: "Practical tech training for young women in Lagos.",
    image: "/images/builder_women_tech.png",
    supporters: 128,
    prePledgeTotal: "$4,820",
    promoted: true,
  },
  {
    id: "idea-solar-storage",
    category: "Clean energy",
    title: "Solar cold storage for farmers",
    pitch: "Affordable, off-grid cooling for rural communities.",
    image: "/images/auth_img.png",
    supporters: 89,
    prePledgeTotal: "$2,960",
  },
  {
    id: "idea-afrobeats-studio",
    category: "Creative",
    title: "Afrobeats production studio",
    pitch: "A community studio for emerging artists in Lagos.",
    image: "/images/studio_afrobeats.png",
    supporters: 64,
    prePledgeTotal: "$1,240",
  },
];
