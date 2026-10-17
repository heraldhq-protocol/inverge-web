import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  BalanceScaleIcon,
  Comment01Icon,
  Coins01Icon,
  Idea01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import { Pill } from "@/components/ui/pill";
import { IDEA_GOAL_META, type IdeaGoals } from "@/features/feedback/types";

const goalIcons: Record<keyof IdeaGoals, IconSvgElement> = {
  feedback: Comment01Icon,
  community: UserGroupIcon,
  funding: Coins01Icon,
};

/**
 * What the creator is asking for, stated plainly on the idea page.
 *
 * The labels distinguish validation, community, and funding intent, and the
 * footnote keeps a funding goal from reading like an approved campaign.
 */
export function IdeaGoalsStrip({
  goals,
  compact = false,
}: {
  goals: IdeaGoals | undefined;
  compact?: boolean;
}) {
  if (!goals) return null;

  const active = (Object.keys(goals) as (keyof IdeaGoals)[]).filter(
    (key) => goals[key],
  );
  if (active.length === 0) return null;

  return (
    <section
      aria-labelledby="idea-goals-title"
      className="rounded-2xl border border-border bg-surface p-4"
    >
      <div className="flex items-center gap-2">
        <HugeiconsIcon
          icon={BalanceScaleIcon}
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
          className="text-brand-strong"
        />
        <h2 id="idea-goals-title" className="text-xs font-semibold text-ink">
          What this idea is looking for
        </h2>
      </div>
      <ul className={`mt-2 flex flex-wrap gap-1.5 ${compact ? "" : "sm:gap-2"}`}>
        {active.map((key) => (
          <li key={key}>
            <Pill tone={key === "funding" ? "neutral" : "accent"} size="xs">
              <HugeiconsIcon
                icon={goalIcons[key]}
                size={12}
                strokeWidth={1.9}
                aria-hidden="true"
                className="mr-1"
              />
              {IDEA_GOAL_META[key].shortLabel}
            </Pill>
          </li>
        ))}
      </ul>
      {goals.funding ? (
        <p className="mt-2 text-[0.6875rem] leading-4 text-muted">
          Funding interest is exploratory. It is not a campaign, an approval, or
          money raised.
        </p>
      ) : null}
    </section>
  );
}

/** A link into the full goals explanation on the creation flow. */
export function GoalsExplainerLink() {
  return (
    <span className="inline-flex items-center gap-1 text-[0.6875rem] text-muted">
      <HugeiconsIcon
        icon={Idea01Icon}
        size={12}
        strokeWidth={1.8}
        aria-hidden="true"
      />
      Goals can change as the idea develops
      <HugeiconsIcon
        icon={ArrowRight02Icon}
        size={12}
        strokeWidth={1.9}
        aria-hidden="true"
      />
    </span>
  );
}
