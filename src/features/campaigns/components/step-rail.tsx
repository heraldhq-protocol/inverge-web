"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";

/**
 * The step rail shared by the contribution flow and the campaign wizard.
 *
 * Both are multi-step flows with the same rule: a step is reachable only once
 * every earlier step has been completed, and the current step is announced with
 * `aria-current="step"`. Anchor-style links would let a reader skip validation,
 * so steps are buttons and only completed ones are enabled.
 */
export function StepRail({
  currentIndex,
  onGoTo,
  steps,
}: {
  currentIndex: number;
  onGoTo: (index: number) => void;
  steps: readonly { id: string; title: string }[];
}) {
  return (
    <ol className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1 lg:overflow-visible scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
      {steps.map((step, index) => {
        const done = index < currentIndex;
        const current = index === currentIndex;

        return (
          <li key={step.id} className="shrink-0 lg:shrink">
            <button
              type="button"
              onClick={() => (index < currentIndex ? onGoTo(index) : undefined)}
              disabled={index > currentIndex}
              aria-current={current ? "step" : undefined}
              className={`flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm transition-colors ${
                current
                  ? "bg-brand/10 font-semibold text-brand-strong"
                  : done
                    ? "font-medium text-ink hover:bg-canvas"
                    : "font-medium text-muted"
              } ${index > currentIndex ? "cursor-not-allowed" : ""}`}
            >
              <span
                aria-hidden="true"
                className={`grid size-6 shrink-0 place-items-center rounded-full text-[0.6875rem] font-bold ${
                  done
                    ? "bg-brand text-white"
                    : current
                      ? "bg-brand/20 text-brand-strong"
                      : "bg-ink/10 text-muted"
                }`}
              >
                {done ? (
                  <HugeiconsIcon
                    icon={CheckmarkCircle01Icon}
                    size={13}
                    strokeWidth={2.4}
                  />
                ) : (
                  index + 1
                )}
              </span>
              <span className="whitespace-nowrap lg:whitespace-normal">
                {step.title}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
