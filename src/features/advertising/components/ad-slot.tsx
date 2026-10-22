import { SidebarAdSlot } from "@/features/advertising/components/sidebar-ad-slot";
import { SponsoredBanner } from "@/features/advertising/components/sponsored-banner";
import { SponsoredContentCard } from "@/features/advertising/components/sponsored-content-card";
import { getAdSlotView } from "@/features/advertising/server/view";
import type {
  AdPageContext,
  AdPlacementId,
} from "@/features/advertising/types";

/**
 * One server-selected advertisement.
 *
 * The slot returns `null` for every reason it should not appear: flags off,
 * creative unapproved, outside its schedule, wrong format, wrong page, already
 * seen, or no eligible inventory. Nothing is reserved when there is no ad, so an
 * empty placement cannot become a blank rectangle or a layout shift.
 *
 * Selection runs on the server and is deterministic, which keeps marketing
 * routes static and prevents a client re-render from swapping creative content.
 */
export function AdSlot({
  className = "",
  now,
  page,
  placementId,
}: {
  className?: string;
  now?: string;
  page: AdPageContext;
  placementId: AdPlacementId;
}) {
  const selection = getAdSlotView({
    page,
    placementId,
    ...(now === undefined ? {} : { now }),
  });

  if (!selection) return null;

  const wrapperClass = [
    selection.placement.hiddenBelow === "lg" ? "hidden lg:block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content =
    selection.creative.format === "native-card" ? (
      <SponsoredContentCard
        creative={selection.creative}
        placementId={selection.placement.id}
      />
    ) : selection.creative.format === "sidebar" ? (
      <SidebarAdSlot
        creative={selection.creative}
        placementId={selection.placement.id}
      />
    ) : (
      <SponsoredBanner
        creative={selection.creative}
        placementId={selection.placement.id}
      />
    );

  return (
    <div className={wrapperClass} data-ad-slot={selection.placement.id}>
      {content}
    </div>
  );
}
