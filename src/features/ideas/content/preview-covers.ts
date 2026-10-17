/**
 * Editorial covers for preview ideas.
 *
 * Preview-only. The API's `coverImageUrl` field (web UI gap item 3) is not
 * populated yet, so discovery and detail fall back to the deterministic
 * artwork component whenever an idea has no cover. Keeping the map in one file
 * means the same idea shows the same image on every surface.
 */
export const previewIdeaCovers: Readonly<Record<string, string>> = {
  "campus-konekt":
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=800&fit=crop&q=80",
  "sungrid-community-power":
    "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&h=800&fit=crop&q=80",
  "farmlink-coldbox":
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=800&fit=crop&q=80",
  "studymate-ng":
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=800&fit=crop&q=80",
  "zippy-campus":
    "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=1200&h=800&fit=crop&q=80",
  "crop-circle":
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&h=800&fit=crop&q=80",
  agroroute:
    "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=1200&h=800&fit=crop&q=80",
  "ecocharge-kiosks":
    "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&h=800&fit=crop&q=80",
  solarchill:
    "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=1200&h=800&fit=crop&q=80",
  "naijacraft-collective":
    "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=1200&h=800&fit=crop&q=80",
  "story-foundry":
    "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=1200&h=800&fit=crop&q=80",
  "skill-circle":
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=800&fit=crop&q=80",
  "care-bridge":
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&h=800&fit=crop&q=80",
  "market-basket":
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=800&fit=crop&q=80",
  "kitchen-collective":
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&h=800&fit=crop&q=80",
};

export function previewCoverFor(ideaId: string): string | null {
  return previewIdeaCovers[ideaId] ?? null;
}
