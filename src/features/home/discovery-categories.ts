export const discoveryCategories = [
  { value: "technology", label: "Technology" },
  { value: "agriculture", label: "Agriculture" },
  { value: "clean-energy", label: "Clean energy" },
  { value: "creative", label: "Creative" },
  { value: "community", label: "Community" },
  { value: "food-retail", label: "Food & retail" },
] as const;

export type DiscoveryCategory = (typeof discoveryCategories)[number]["value"];

export function isDiscoveryCategory(value: string): value is DiscoveryCategory {
  return discoveryCategories.some((category) => category.value === value);
}
