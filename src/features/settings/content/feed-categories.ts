/**
 * Feed preference categories.
 *
 * The API validates `preferredCategories` against its own `IDEA_CATEGORIES`
 * list, so this vocabulary must match it exactly. The broad discovery labels
 * used elsewhere in the web app are for browsing, not for this write.
 */
export const settingsFeedCategories = [
  { value: "technology", label: "Technology" },
  { value: "software", label: "Software" },
  { value: "fintech", label: "Fintech" },
  { value: "agritech", label: "Agritech" },
  { value: "healthtech", label: "Healthtech" },
  { value: "cleantech", label: "Clean energy" },
  { value: "edtech", label: "Edtech" },
  { value: "logistics", label: "Logistics" },
  { value: "e-commerce", label: "E-commerce" },
  { value: "web3", label: "Web3" },
  { value: "art", label: "Art" },
  { value: "comics", label: "Comics" },
  { value: "crafts", label: "Crafts" },
  { value: "dance", label: "Dance" },
  { value: "design", label: "Design" },
  { value: "fashion", label: "Fashion" },
  { value: "film", label: "Film" },
  { value: "food", label: "Food" },
  { value: "games", label: "Games" },
  { value: "journalism", label: "Journalism" },
  { value: "music", label: "Music" },
  { value: "photography", label: "Photography" },
  { value: "publishing", label: "Publishing" },
  { value: "theater", label: "Theater" },
  { value: "community", label: "Community" },
  { value: "other", label: "Other" },
] as const;

export type SettingsFeedCategory =
  (typeof settingsFeedCategories)[number]["value"];
