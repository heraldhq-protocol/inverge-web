import { describe, expect, it } from "vitest";

import {
  assetIdFromMediaPath,
  isStoredMediaPath,
  mediaPathFor,
} from "@/lib/media-path";

const ASSET_ID = "cm3k9x2b10000abcd1234efgh";

describe("mediaPathFor", () => {
  it("builds the one shape a stored reference may take", () => {
    expect(mediaPathFor(ASSET_ID)).toBe(`/api/media/${ASSET_ID}`);
  });
});

describe("assetIdFromMediaPath", () => {
  it("returns the id inside a stored reference", () => {
    expect(assetIdFromMediaPath(`/api/media/${ASSET_ID}`)).toBe(ASSET_ID);
  });

  it("rejects an external URL, a bare id and a wrong prefix", () => {
    expect(assetIdFromMediaPath(`https://example.com/${ASSET_ID}`)).toBeNull();
    expect(assetIdFromMediaPath(ASSET_ID)).toBeNull();
    expect(assetIdFromMediaPath(`/media/${ASSET_ID}`)).toBeNull();
  });

  it("rejects a path that would escape the route", () => {
    expect(assetIdFromMediaPath("/api/media/../../admin")).toBeNull();
    expect(assetIdFromMediaPath("/api/media/cm3k9x2b1?x=1")).toBeNull();
    expect(assetIdFromMediaPath("/api/media/")).toBeNull();
  });
});

describe("isStoredMediaPath", () => {
  it("recognises our own assets and nothing else", () => {
    expect(isStoredMediaPath(mediaPathFor(ASSET_ID))).toBe(true);
    expect(isStoredMediaPath("https://example.com/photo.jpg")).toBe(false);
    expect(isStoredMediaPath("/images/ideas/example.jpg")).toBe(false);
    expect(isStoredMediaPath(null)).toBe(false);
    expect(isStoredMediaPath(undefined)).toBe(false);
  });
});
