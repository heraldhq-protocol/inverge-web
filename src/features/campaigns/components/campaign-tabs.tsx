"use client";

import {
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import {
  campaignTabHref,
  type CampaignTab,
  type CampaignTabId,
} from "@/features/campaigns/lib/campaign-tabs";

export type CampaignTabPanel = {
  tab: CampaignTab;
  content: ReactNode;
};

/**
 * The campaign tabs.
 *
 * A tab is a real link to `?tab=…`, so a shared URL, a middle-click, and a
 * reader without JavaScript all land on the tab they asked for. With JavaScript
 * the click is intercepted and the panel is swapped in place, because a reader
 * comparing the plan with the escort terms should not pay a navigation for it.
 *
 * Only the selected panel is rendered, so the other tabs' content is absent
 * rather than hidden — a hidden panel is still in the accessibility tree's
 * document order and still read by a "find in page".
 */
export function CampaignTabs({
  activeTab,
  panels,
  slug,
}: {
  activeTab: CampaignTabId;
  panels: readonly CampaignTabPanel[];
  slug: string;
}) {
  const [active, setActive] = useState<CampaignTabId>(activeTab);
  const tabRefs = useRef(new Map<CampaignTabId, HTMLAnchorElement>());

  const requestedIndex = panels.findIndex((panel) => panel.tab.id === active);
  const selectedIndex = requestedIndex >= 0 ? requestedIndex : 0;
  const selected = panels[selectedIndex];

  const select = useCallback(
    (index: number, moveFocus: boolean) => {
      const panel = panels[index];
      if (!panel) return;

      setActive(panel.tab.id);

      const url = new URL(window.location.href);
      url.searchParams.set("tab", panel.tab.id);
      // Replace rather than push: switching a tab changes the view, not the
      // destination, so Back leaves the campaign instead of walking through
      // every tab the reader glanced at. The URL still round-trips, so a
      // refresh and a copied link open on the same tab.
      window.history.replaceState(window.history.state, "", url);

      if (moveFocus) tabRefs.current.get(panel.tab.id)?.focus();
    },
    [panels],
  );

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const last = panels.length - 1;

    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        select(selectedIndex === last ? 0 : selectedIndex + 1, true);
        return;
      case "ArrowLeft":
        event.preventDefault();
        select(selectedIndex === 0 ? last : selectedIndex - 1, true);
        return;
      case "Home":
        event.preventDefault();
        select(0, true);
        return;
      case "End":
        event.preventDefault();
        select(last, true);
        return;
      default:
        return;
    }
  }

  if (!selected) return null;

  return (
    <div>
      <div
        aria-label="Campaign sections"
        className="sticky top-20 z-30 border-b border-border bg-canvas"
        role="tablist"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-1 overflow-x-auto py-2.5">
          {panels.map((panel, index) => {
            const isActive = index === selectedIndex;

            return (
              <a
                key={panel.tab.id}
                aria-controls={`panel-${panel.tab.id}`}
                aria-selected={isActive}
                className={`inline-flex min-h-8 items-center whitespace-nowrap rounded-full px-3 text-xs md:text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none ${
                  isActive
                    ? "bg-brand/10 font-semibold text-brand-strong"
                    : "font-medium text-muted hover:bg-canvas hover:text-ink"
                }`}
                href={campaignTabHref(slug, panel.tab.id)}
                id={`tab-${panel.tab.id}`}
                onClick={(event) => {
                  // Let the browser handle a new-tab or new-window click.
                  if (
                    event.defaultPrevented ||
                    event.button !== 0 ||
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey
                  ) {
                    return;
                  }

                  event.preventDefault();
                  select(index, false);
                }}
                ref={(node) => {
                  if (node) tabRefs.current.set(panel.tab.id, node);
                  else tabRefs.current.delete(panel.tab.id);
                }}
                role="tab"
                tabIndex={isActive ? 0 : -1}
              >
                {panel.tab.label}
              </a>
            );
          })}
        </div>
      </div>

      {/* `scroll-mt` clears the sticky header (5rem) plus this bar. */}
      <div
        aria-labelledby={`tab-${selected.tab.id}`}
        className="mt-6 scroll-mt-36 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:mt-8"
        id={`panel-${selected.tab.id}`}
        role="tabpanel"
        tabIndex={0}
      >
        {selected.content}
      </div>
    </div>
  );
}
