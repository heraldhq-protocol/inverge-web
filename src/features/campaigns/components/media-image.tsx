import Image from "next/image";

/**
 * A campaign image.
 *
 * Artwork served by this app goes through Next's optimiser. A creator-supplied
 * remote URL cannot: the optimiser refuses hosts that are not configured, and
 * configuring arbitrary hosts to satisfy a text field turns the optimiser into an
 * open image proxy. A remote URL is therefore rendered directly and the browser
 * loads it from the creator's host, which is also why the `sizes` hint only
 * matters for the optimised case.
 *
 * The caller supplies the positioned frame: both branches fill it with
 * `object-cover`, so a grid of mixed local and remote images stays even.
 */
export function MediaImage({
  src,
  alt,
  sizes,
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
}) {
  if (src.startsWith("/")) {
    return (
      <Image src={src} alt={alt} fill sizes={sizes} className={className} />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- a creator's own host cannot be routed through the configured optimiser.
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`absolute inset-0 h-full w-full ${className}`}
    />
  );
}
