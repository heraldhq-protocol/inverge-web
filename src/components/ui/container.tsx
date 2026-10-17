import type { ComponentPropsWithoutRef } from "react";

/**
 * The one horizontal measure for the product.
 *
 * Marketing pages, discovery, and the product shell all cap content at the same
 * width and share the same gutters, so a sticky header, a page body, and a
 * footer line up on every surface. Previously the ideas surfaces used a wider
 * measure than the marketing shell, which left the header floating inside the
 * page edge.
 */
export function Container({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={`mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 ${className}`}
      {...props}
    />
  );
}
