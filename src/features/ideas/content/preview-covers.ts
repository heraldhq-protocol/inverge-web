/**
 * Editorial covers for preview ideas.
 *
 * Vendored locally on purpose. These fixtures used to hotlink Unsplash photo
 * URLs; two of those ids had already rotted to 404 and every card depended on a
 * third party at render time. The files under `public/images/ideas/` keep
 * discovery deterministic and offline-capable, and `public/images/README.md`
 * records their provenance.
 *
 * Preview-only. The API's `coverImageUrl` field (web UI gap item 3) is not
 * populated yet, so discovery and detail fall back to the deterministic
 * artwork component whenever an idea has no cover.
 */
export const previewIdeaCovers: Readonly<Record<string, string>> = {
  "campus-konekt": "/images/ideas/campus-konekt.jpg",
  "sungrid-community-power": "/images/ideas/sungrid-community-power.jpg",
  "farmlink-coldbox": "/images/ideas/farmlink-coldbox.jpg",
  "studymate-ng": "/images/ideas/studymate-ng.jpg",
  "zippy-campus": "/images/ideas/zippy-campus.jpg",
  "crop-circle": "/images/ideas/crop-circle.jpg",
  agroroute: "/images/ideas/agroroute.jpg",
  "ecocharge-kiosks": "/images/ideas/ecocharge-kiosks.jpg",
  solarchill: "/images/ideas/solarchill.jpg",
  "naijacraft-collective": "/images/ideas/naijacraft-collective.jpg",
  "story-foundry": "/images/ideas/story-foundry.jpg",
  "skill-circle": "/images/ideas/skill-circle.jpg",
  "care-bridge": "/images/ideas/care-bridge.jpg",
  "market-basket": "/images/ideas/market-basket.jpg",
  "kitchen-collective": "/images/ideas/kitchen-collective.jpg",
};

export function previewCoverFor(ideaId: string): string | null {
  return previewIdeaCovers[ideaId] ?? null;
}
