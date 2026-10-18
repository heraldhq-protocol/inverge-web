import type { CampaignMedia, VideoSource } from "@/features/campaigns/types";

/**
 * Media parsing and validation.
 *
 * Campaign media is creator-supplied, so every source string is untrusted.
 * Nothing here echoes that string into an element: an image or a direct file is
 * accepted only as a same-origin path or an `https` URL, and a hosted player is
 * addressed by an id this module extracts, so the player URL is built rather
 * than passed through. A creator cannot reach an `<iframe>`, a `javascript:`
 * href, or a protocol-relative URL by typing one.
 *
 * The parse helpers return a reason as well as a verdict, because "this link is
 * not accepted" is useless advice next to "only YouTube, Vimeo, or a direct
 * video file can be played here".
 */

/** The base a same-origin path is resolved against, so relative paths parse. */
const ORIGIN = "https://inverge.local";

const VIDEO_FILE_EXTENSIONS = [
  ".mp4",
  ".webm",
  ".ogv",
  ".mov",
  ".m4v",
] as const;

/** A YouTube id is exactly eleven characters of that alphabet. */
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export const MAX_HERO_MEDIA = 6;
export const MAX_STORY_MEDIA = 8;

/** Alt text is the whole accessibility story for a photo, so it is not optional. */
export const MIN_MEDIA_ALT = 10;

export type MediaParse =
  { ok: true; src: string } | { ok: false; reason: string };

export type VideoParse =
  { ok: true; source: VideoSource } | { ok: false; reason: string };

/**
 * A same-origin path or an absolute `https` URL, and nothing else.
 *
 * Protocol-relative `//host` is refused: it inherits the page protocol but not
 * the origin, so it is a third-party host wearing a relative path's clothes.
 */
function absoluteUrl(input: string): URL | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/")) {
    if (trimmed.startsWith("//")) return null;
    try {
      return new URL(trimmed, ORIGIN);
    } catch {
      return null;
    }
  }

  if (!/^https:\/\//i.test(trimmed)) return null;

  try {
    return new URL(trimmed);
  } catch {
    return null;
  }
}

function host(url: URL): string {
  return url.hostname.replace(/^www\./, "").replace(/^m\./, "");
}

function isVideoFile(pathname: string): boolean {
  const lower = pathname.toLowerCase();
  return VIDEO_FILE_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

function youtubeVideoId(url: URL): string | null {
  const name = host(url);

  if (name === "youtu.be") {
    return YOUTUBE_ID.test(url.pathname.slice(1).split("/")[0] ?? "")
      ? (url.pathname.slice(1).split("/")[0] as string)
      : null;
  }

  if (name !== "youtube.com" && name !== "youtube-nocookie.com") return null;

  if (url.pathname === "/watch") {
    const id = url.searchParams.get("v") ?? "";
    return YOUTUBE_ID.test(id) ? id : null;
  }

  const match = /^\/(?:embed|shorts|live|v)\/([^/?#]+)/.exec(url.pathname);
  const id = match?.[1] ?? "";
  return YOUTUBE_ID.test(id) ? id : null;
}

function vimeoVideoId(url: URL): string | null {
  const name = host(url);
  if (name !== "vimeo.com" && name !== "player.vimeo.com") return null;

  const match = /^\/(?:video\/)?(\d{6,})/.exec(url.pathname);
  return match?.[1] ?? null;
}

/**
 * An image source: an `https` URL on any host, or a same-origin asset path.
 *
 * A remote host is accepted here because the renderer serves it directly rather
 * than through the image optimiser — see `MediaImage`.
 */
export function parseImageSource(input: string): MediaParse {
  const url = absoluteUrl(input);
  if (!url) {
    return {
      ok: false,
      reason: "Use an https image link, or an asset path that starts with /.",
    };
  }

  const trimmed = input.trim();
  return { ok: true, src: trimmed.startsWith("/") ? trimmed : url.toString() };
}

/**
 * A playable video: a YouTube or Vimeo page, or a direct file.
 *
 * A same-origin file path becomes an `upload` because this app is serving those
 * bytes; an `https` file URL becomes a `direct` link to someone else's host.
 */
export function parseVideoSource(input: string): VideoParse {
  const url = absoluteUrl(input);
  if (!url) {
    return {
      ok: false,
      reason:
        "Use a YouTube or Vimeo link, a direct video file link, or an asset path that starts with /.",
    };
  }

  const youtube = youtubeVideoId(url);
  if (youtube)
    return { ok: true, source: { kind: "youtube", videoId: youtube } };

  const vimeo = vimeoVideoId(url);
  if (vimeo) return { ok: true, source: { kind: "vimeo", videoId: vimeo } };

  const trimmed = input.trim();
  if (isVideoFile(url.pathname)) {
    return {
      ok: true,
      source: trimmed.startsWith("/")
        ? { kind: "upload", src: trimmed }
        : { kind: "direct", src: url.toString() },
    };
  }

  return {
    ok: false,
    reason:
      "Only a YouTube or Vimeo page, or a direct video file (.mp4, .webm, .ogv, .mov), can be played here.",
  };
}

/**
 * The player URL for a hosted video, or null when the source is a file.
 *
 * Built from the parsed id, never from the creator's original string, and served
 * from the privacy-preserving YouTube host so a campaign page sets no tracking
 * cookie before a backer presses play.
 */
export function videoEmbedUrl(source: VideoSource): string | null {
  switch (source.kind) {
    case "youtube":
      return `https://www.youtube-nocookie.com/embed/${source.videoId}`;
    case "vimeo":
      return `https://player.vimeo.com/video/${source.videoId}`;
    case "upload":
    case "direct":
      return null;
  }
}

/** The file URL the browser can play itself, or null for a hosted video. */
export function videoFileSrc(source: VideoSource): string | null {
  return source.kind === "upload" || source.kind === "direct"
    ? source.src
    : null;
}

/** The page a backer can open when an embed is blocked, or null for a file. */
export function videoWatchUrl(source: VideoSource): string | null {
  switch (source.kind) {
    case "youtube":
      return `https://www.youtube.com/watch?v=${source.videoId}`;
    case "vimeo":
      return `https://vimeo.com/${source.videoId}`;
    case "upload":
    case "direct":
      return null;
  }
}

/** Where the video lives, in words a backer can trust. */
export function videoProviderLabel(source: VideoSource): string {
  switch (source.kind) {
    case "upload":
      return "Uploaded video";
    case "direct":
      return "Video link";
    case "youtube":
      return "YouTube";
    case "vimeo":
      return "Vimeo";
  }
}

export type MediaCounts = { images: number; videos: number };

export function countMedia(media: readonly CampaignMedia[]): MediaCounts {
  let images = 0;
  let videos = 0;

  for (const item of media) {
    if (item.kind === "image") images += 1;
    else videos += 1;
  }

  return { images, videos };
}

/** A plain count for a summary line, e.g. "1 video and 2 photos". */
export function describeMediaCount(media: readonly CampaignMedia[]): string {
  const { images, videos } = countMedia(media);
  const parts: string[] = [];

  if (videos > 0) parts.push(videos === 1 ? "1 video" : `${videos} videos`);
  if (images > 0) parts.push(images === 1 ? "1 photo" : `${images} photos`);

  return parts.length === 0 ? "None attached" : parts.join(" and ");
}
