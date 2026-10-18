import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Alert02Icon,
  ShieldKeyIcon,
  Undo03Icon,
} from "@hugeicons/core-free-icons";

import type { Campaign } from "@/features/campaigns/types";

/**
 * Eligibility, risk, and the failure plan.
 *
 * These are the three things a backer has to be able to find without asking, so
 * they sit in their own section rather than inside the story, and each is
 * labelled with what it is rather than folded into reassurance.
 */
const blocks: readonly {
  body: (campaign: Campaign) => string;
  icon: IconSvgElement;
  key: string;
  title: string;
}[] = [
  {
    body: (campaign) => campaign.disclosures.eligibility,
    icon: ShieldKeyIcon,
    key: "eligibility",
    title: "Who can contribute",
  },
  {
    body: (campaign) => campaign.disclosures.risks,
    icon: Alert02Icon,
    key: "risks",
    title: "Risks",
  },
  {
    body: (campaign) => campaign.disclosures.failurePlan,
    icon: Undo03Icon,
    key: "failure",
    title: "If the target is not reached",
  },
];

export function CampaignDisclosures({ campaign }: { campaign: Campaign }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {blocks.map((block) => (
        <li
          key={block.key}
          className="rounded-2xl border border-border bg-surface p-4"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-canvas text-muted">
            <HugeiconsIcon
              icon={block.icon}
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>
          <h3 className="mt-3 text-sm font-semibold text-ink">{block.title}</h3>
          <p className="mt-1.5 text-sm leading-6 text-muted">
            {block.body(campaign)}
          </p>
        </li>
      ))}
    </ul>
  );
}
