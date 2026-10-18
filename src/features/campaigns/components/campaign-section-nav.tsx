"use client";

import { useEffect, useState } from "react";

export type CampaignSection = { id: string; label: string };

/**
 * In-page section navigation for the campaign detail page.
 *
 * These are anchors, not routes: the detail page is one document because a
 * backer reads it top to bottom, and splitting the story, the plan, and the
 * disclosures across separate URLs would hide the context each needs.
 *
 * `aria-current="true"` marks the section in view. It is deliberately not
 * `="page"` — nothing navigated. The scroll-spy is an enhancement: without
 * JavaScript every link still jumps to its section, and the first section is the
 * default marker rather than an empty bar.
 */
export function CampaignSectionNav({
  sections,
}: {
  sections: readonly CampaignSection[];
}) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const inView = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        const first = inView[0]?.target;
        if (first?.id) setActiveId(first.id);
      },
      { rootMargin: "-96px 0px -55% 0px", threshold: 0 },
    );

    for (const element of elements) observer.observe(element);

    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="Campaign sections"
      className="sticky top-16 z-30 -mx-4 border-b border-border bg-surface/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0 lg:mx-0 lg:rounded-full lg:border lg:px-2"
    >
      <ul className="flex min-w-max items-center gap-1 overflow-x-auto py-1.5">
        {sections.map((section) => {
          const active = section.id === activeId;

          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={active ? "true" : undefined}
                className={`inline-flex min-h-10 items-center whitespace-nowrap rounded-full px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  active
                    ? "bg-brand/10 font-semibold text-brand-strong"
                    : "font-medium text-muted hover:bg-canvas hover:text-ink"
                }`}
              >
                {section.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
