import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  Compass01Icon,
  Idea01Icon,
  MessageMultiple01Icon,
  TrophyIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import type { QuickAction } from "@/features/home/types";

const icons: Record<QuickAction["icon"], IconSvgElement> = {
  compass: Compass01Icon,
  feedback: MessageMultiple01Icon,
  idea: Idea01Icon,
  trophy: TrophyIcon,
};

/**
 * Four high-value next steps.
 *
 * Every destination exists and does something: discovery, a real feedback form,
 * the ideathon hub, and the creation flow. Nothing here implies money moves.
 */
export function QuickActionGrid({
  actions,
}: {
  actions: readonly QuickAction[];
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {actions.map((action) => (
        <li key={action.href + action.label}>
          <Link
            href={action.href}
            className="group flex h-full items-start gap-3 rounded-2xl border border-border bg-surface p-3.5 transition-[border-color,box-shadow] hover:border-brand/35 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:p-4"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-strong">
              <HugeiconsIcon
                icon={icons[action.icon]}
                size={18}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1">
                <span className="truncate text-sm font-semibold text-ink">
                  {action.label}
                </span>
                <HugeiconsIcon
                  icon={ArrowRight02Icon}
                  size={13}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none"
                />
              </span>
              <span className="mt-0.5 line-clamp-2 block text-xs leading-4 text-muted">
                {action.description}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
