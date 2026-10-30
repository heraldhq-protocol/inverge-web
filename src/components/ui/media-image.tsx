import Image from "next/image";

import { isStoredMediaPath } from "@/lib/media-path";

/**
 * The one renderer for an image whose frame the caller owns.
 *
 * Three sources reach this component, and each needs a different transport:
 *
 * - a bundled or `public/` asset is a same-origin path, so Next's optimiser can
 *   resize and reformat it;
 * - an uploaded image is `/api/media/<id>`. That route needs the viewer's
 *   session cookie, and the optimiser fetches the source server-side without
 *   cookies, so it must be loaded by the browser directly. The same reasoning
 *   applies to a signed URL the API hands out for an immediate preview;
 * - somebody else's `https` image. The optimiser would have to allow every host
 *   a creator can type, which turns it into an open image proxy, so the browser
 *   loads it from their host.
 *
 * Every branch fills the parent, which must be positioned. `sizes` only affects
 * the optimised branch; the browser cannot build a srcset for an opaque URL.
 */
export function MediaImage({
  src,
  alt,
  sizes = "100vw",
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (src.startsWith("/") && !src.startsWith("//") && !isStoredMediaPath(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- the optimiser cannot carry a session or reach an arbitrary host.
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`absolute inset-0 h-full w-full ${className}`}
    />
  );
}
