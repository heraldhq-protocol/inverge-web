import { describe, expect, it } from "vitest";

import {
  countMedia,
  describeMediaCount,
  parseImageSource,
  parseVideoSource,
  videoEmbedUrl,
  videoFileSrc,
  videoProviderLabel,
  videoWatchUrl,
} from "@/features/campaigns/lib/media";
import type { CampaignMedia, VideoSource } from "@/features/campaigns/types";

describe("parseVideoSource", () => {
  it("extracts the id from every YouTube address form", () => {
    const id = "dQw4w9WgXcQ";

    const sources = [
      `https://www.youtube.com/watch?v=${id}`,
      `https://youtube.com/watch?v=${id}&t=42s`,
      `https://youtu.be/${id}`,
      `https://youtu.be/${id}?si=abc`,
      `https://www.youtube.com/shorts/${id}`,
      `https://www.youtube.com/embed/${id}`,
      `https://www.youtube.com/live/${id}`,
      `https://m.youtube.com/watch?v=${id}`,
    ];

    for (const input of sources) {
      expect(parseVideoSource(input)).toEqual({
        ok: true,
        source: { kind: "youtube", videoId: id },
      });
    }
  });

  it("extracts the id from both Vimeo address forms", () => {
    expect(parseVideoSource("https://vimeo.com/76979871")).toEqual({
      ok: true,
      source: { kind: "vimeo", videoId: "76979871" },
    });
    expect(
      parseVideoSource("https://player.vimeo.com/video/76979871?h=abc"),
    ).toEqual({
      ok: true,
      source: { kind: "vimeo", videoId: "76979871" },
    });
  });

  it("treats a same-origin file path as an upload and a remote file as a direct link", () => {
    expect(parseVideoSource("/media/clip.mp4")).toEqual({
      ok: true,
      source: { kind: "upload", src: "/media/clip.mp4" },
    });
    expect(parseVideoSource("https://cdn.example.com/clip.webm")).toEqual({
      ok: true,
      source: { kind: "direct", src: "https://cdn.example.com/clip.webm" },
    });
  });

  it("rejects a script URL, an inline data URL, and a non-https file", () => {
    for (const input of [
      "javascript:alert(1)",
      "data:video/mp4;base64,AAAA",
      "http://cdn.example.com/clip.mp4",
      "//cdn.example.com/clip.mp4",
    ]) {
      expect(parseVideoSource(input).ok).toBe(false);
    }
  });

  it("rejects a page that is not a video", () => {
    const result = parseVideoSource("https://example.com/blog/post");

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain("YouTube");
  });

  it("rejects a YouTube id that is not eleven characters", () => {
    expect(parseVideoSource("https://youtu.be/tooShort").ok).toBe(false);
  });

  it("reports why an empty value cannot be used", () => {
    const result = parseVideoSource("   ");

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason.length).toBeGreaterThan(0);
  });
});

describe("parseImageSource", () => {
  it("accepts an https link on any host and a same-origin path", () => {
    expect(parseImageSource("https://images.example.com/a.jpg")).toEqual({
      ok: true,
      src: "https://images.example.com/a.jpg",
    });
    expect(parseImageSource("/images/ideas/sungrid.jpg")).toEqual({
      ok: true,
      src: "/images/ideas/sungrid.jpg",
    });
  });

  it("rejects anything that is not an https URL or a same-origin path", () => {
    for (const input of [
      "javascript:alert(1)",
      "data:image/svg+xml,<svg/>",
      "http://example.com/a.jpg",
      "//example.com/a.jpg",
      "images/a.jpg",
    ]) {
      expect(parseImageSource(input).ok).toBe(false);
    }
  });
});

describe("video destination helpers", () => {
  it("builds a privacy-preserving embed URL from the parsed id", () => {
    expect(videoEmbedUrl({ kind: "youtube", videoId: "abc12345678" })).toBe(
      "https://www.youtube-nocookie.com/embed/abc12345678",
    );
    expect(videoEmbedUrl({ kind: "vimeo", videoId: "76979871" })).toBe(
      "https://player.vimeo.com/video/76979871",
    );
    expect(
      videoEmbedUrl({ kind: "upload", src: "/media/clip.mp4" }),
    ).toBeNull();
    expect(
      videoEmbedUrl({ kind: "direct", src: "https://x.example/clip.mp4" }),
    ).toBeNull();
  });

  it("returns the file URL only for a file the browser plays itself", () => {
    expect(videoFileSrc({ kind: "upload", src: "/media/clip.mp4" })).toBe(
      "/media/clip.mp4",
    );
    expect(
      videoFileSrc({ kind: "youtube", videoId: "abc12345678" }),
    ).toBeNull();
  });

  it("offers a way out to the host only for an embedded video", () => {
    expect(videoWatchUrl({ kind: "youtube", videoId: "abc12345678" })).toBe(
      "https://www.youtube.com/watch?v=abc12345678",
    );
    expect(videoWatchUrl({ kind: "vimeo", videoId: "76979871" })).toBe(
      "https://vimeo.com/76979871",
    );
    expect(
      videoWatchUrl({ kind: "upload", src: "/media/clip.mp4" }),
    ).toBeNull();
  });

  it("names the source for a reader", () => {
    const expected: Record<VideoSource["kind"], string> = {
      direct: "Video link",
      upload: "Uploaded video",
      vimeo: "Vimeo",
      youtube: "YouTube",
    };

    for (const [kind, label] of Object.entries(expected)) {
      const source =
        kind === "youtube" || kind === "vimeo"
          ? ({ kind, videoId: "abc12345678" } as VideoSource)
          : ({ kind, src: "/media/clip.mp4" } as VideoSource);

      expect(videoProviderLabel(source)).toBe(label);
    }
  });
});

describe("describeMediaCount", () => {
  const media: readonly CampaignMedia[] = [
    {
      alt: "A solar array",
      caption: null,
      id: "one",
      kind: "image",
      src: "/images/ideas/sungrid.jpg",
    },
    {
      alt: "A cold store",
      caption: null,
      id: "two",
      kind: "image",
      src: "/images/ideas/farmlink.jpg",
    },
    {
      alt: "A walkthrough",
      caption: null,
      id: "three",
      kind: "video",
      poster: null,
      source: { kind: "youtube", videoId: "abc12345678" },
    },
  ];

  it("counts each kind separately", () => {
    expect(countMedia(media)).toEqual({ images: 2, videos: 1 });
  });

  it("reads as a sentence and names the empty case", () => {
    expect(describeMediaCount(media)).toBe("1 video and 2 photos");
    expect(describeMediaCount(media.slice(0, 1))).toBe("1 photo");
    expect(describeMediaCount(media.slice(2))).toBe("1 video");
    expect(describeMediaCount([])).toBe("None attached");
  });
});
