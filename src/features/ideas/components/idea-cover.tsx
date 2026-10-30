import { MediaImage } from "@/components/ui/media-image";
import { IdeaArtwork } from "@/features/home/components/idea-artwork";
import type { IdeaArtworkVariant } from "@/features/home/types";

/**
 * The one image renderer for an idea.
 *
 * A real cover is cropped to the frame the caller sets. When the API has no
 * cover yet, the deterministic artwork fills the same frame, so a card never
 * collapses and a mixed grid keeps its rhythm. Callers own the aspect ratio on
 * the wrapping element.
 */
export function IdeaCover({
  artwork,
  cover,
  alt,
  sizes,
  priority = false,
  className = "",
}: {
  artwork: IdeaArtworkVariant;
  cover?: string | null | undefined;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!cover) {
    return (
      <div aria-hidden="true" className={`h-full w-full ${className}`}>
        <IdeaArtwork fill variant={artwork} />
      </div>
    );
  }

  return (
    <MediaImage
      src={cover}
      alt={alt}
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}
