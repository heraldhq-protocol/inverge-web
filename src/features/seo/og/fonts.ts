import { readFile } from "node:fs/promises";
import path from "node:path";

const FONTS_DIRECTORY = path.join(
  process.cwd(),
  "src",
  "features",
  "seo",
  "og",
  "fonts",
);

export type OgFont = {
  data: ArrayBuffer;
  name: string;
  style: "normal";
  weight: 400 | 500 | 700;
};

/**
 * `readFile` returns a view over a pooled `ArrayBuffer`, so copy just this
 * view's bytes. The cast narrows `ArrayBufferLike` (which admits
 * `SharedArrayBuffer`) to the plain `ArrayBuffer` the renderer requires.
 */
function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return new Uint8Array(buffer).buffer as ArrayBuffer;
}

let cachedFonts: OgFont[] | null = null;

/**
 * Loads the brand faces for share-image rendering.
 *
 * The fonts are vendored rather than fetched at request time: the renderer
 * supports `ttf`, `otf`, and `woff` only, and a runtime fetch would put a
 * third-party outage between a request and its image. The three files total
 * roughly 112KB, well inside the renderer's 500KB bundle limit.
 */
export async function loadOgFonts(): Promise<OgFont[]> {
  if (cachedFonts !== null) return cachedFonts;

  const [geist, outfitMedium, outfitBold] = await Promise.all([
    readFile(path.join(FONTS_DIRECTORY, "geist-400.woff")),
    readFile(path.join(FONTS_DIRECTORY, "outfit-500.ttf")),
    readFile(path.join(FONTS_DIRECTORY, "outfit-700.ttf")),
  ]);

  cachedFonts = [
    {
      data: toArrayBuffer(geist),
      name: "Geist",
      style: "normal",
      weight: 400,
    },
    {
      data: toArrayBuffer(outfitMedium),
      name: "Outfit",
      style: "normal",
      weight: 500,
    },
    {
      data: toArrayBuffer(outfitBold),
      name: "Outfit",
      style: "normal",
      weight: 700,
    },
  ];

  return cachedFonts;
}
