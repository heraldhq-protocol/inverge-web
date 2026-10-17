import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import type { ReactNode } from "react";

import { Eyebrow } from "@/components/ui/eyebrow";

export type InfoSection = {
  title: string;
  body: string;
  bullets?: readonly string[];
};

/**
 * Editorial body shared by the competition's About and Rules pages. It keeps
 * the same measure and rhythm as an idea story so the ideathon reads as part of
 * the product rather than a separate microsite.
 */
export function CompetitionInfoPage({
  eyebrow,
  intro,
  sections,
  aside,
  title,
}: {
  eyebrow: string;
  intro: string;
  sections: readonly InfoSection[];
  aside?: {
    icon: IconSvgElement;
    title: string;
    body: ReactNode;
  };
  title: string;
}) {
  return (
    <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10">
      <article className="min-w-0 max-w-[72ch]">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
          {title}
        </h2>
        <p className="mt-3 text-base leading-7 text-ink-soft">{intro}</p>

        <div className="mt-7 space-y-7">
          {sections.map((section) => (
            <section key={section.title}>
              <h3 className="text-lg font-bold tracking-[-0.025em] text-ink">
                {section.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-ink-soft">
                {section.body}
              </p>
              {section.bullets && section.bullets.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {section.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex gap-2.5 text-sm leading-6 text-ink-soft"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-brand"
                      />
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </article>

      {aside ? (
        <aside className="rounded-2xl border border-border bg-brand-tint p-4 lg:self-start">
          <span className="grid size-9 place-items-center rounded-xl bg-brand/10 text-brand-strong">
            <HugeiconsIcon
              icon={aside.icon}
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>
          <h3 className="mt-3 text-sm font-bold text-ink">{aside.title}</h3>
          <div className="mt-1 text-xs leading-5 text-muted">{aside.body}</div>
        </aside>
      ) : null}
    </div>
  );
}
