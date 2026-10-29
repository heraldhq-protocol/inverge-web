"use client";

import { ArrowRight, Check } from "lucide-react";

import { useWaitlistLane } from "@/features/marketing/components/waitlist/waitlist-lane-context";
import { waitlistLanes } from "@/features/marketing/content/waitlist";

/**
 * The lane summary beside the form. It reads the same state as the form's lane
 * switch, so the visible lane always matches the list that will be joined.
 */
export function WaitlistLanePanel() {
  const { lane } = useWaitlistLane();
  const active =
    waitlistLanes.find((item) => item.id === lane) ?? waitlistLanes[0];
  const activeIndex = waitlistLanes.findIndex((item) => item.id === lane);

  function focusForm() {
    document.getElementById("join")?.scrollIntoView({ block: "center" });
    document
      .querySelector<HTMLInputElement>("#join input[type='email']")
      ?.focus({ preventScroll: true });
  }

  return (
    <aside
      aria-labelledby="waitlist-lane-title"
      aria-live="polite"
      className="border-y border-ink/15 py-5"
    >
      <p className="font-mono text-xs font-semibold text-brand-strong">
        0{activeIndex + 1}
      </p>
      <h2
        id="waitlist-lane-title"
        className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl"
      >
        {active.title}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-ink-soft">
        {active.body}
      </p>
      <ul className="mt-5 flex flex-col gap-2.5">
        {active.points.map((point) => (
          <li
            key={point}
            className="flex gap-3 text-sm leading-6 text-ink-soft"
          >
            <Check
              aria-hidden="true"
              className="mt-1 size-4 shrink-0 text-brand-strong"
            />
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={focusForm}
        className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-strong underline decoration-brand/40 underline-offset-4 transition-colors hover:decoration-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        {active.cta}
        <ArrowRight aria-hidden="true" className="size-4" />
      </button>
    </aside>
  );
}
