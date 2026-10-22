"use client";

import type { ComponentProps, ReactNode } from "react";

import { trackAdEvent } from "@/features/advertising/lib/client-events";
import type { AdPlacementId } from "@/features/advertising/types";

/**
 * The tracked CTA. External destinations open in a new tab with
 * `rel="noopener noreferrer sponsored"`.
 */
export function AdLink({
  children,
  className = "",
  creativeId,
  destination,
  placementId,
  ...props
}: Omit<ComponentProps<"a">, "href"> & {
  children: ReactNode;
  creativeId: string;
  destination: string;
  placementId: AdPlacementId;
}) {
  const external = destination.startsWith("http");

  return (
    <a
      href={destination}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer sponsored" : undefined}
      onClick={() => trackAdEvent("ad_click", creativeId, placementId)}
      className={className}
      {...props}
    >
      {children}
      {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </a>
  );
}
