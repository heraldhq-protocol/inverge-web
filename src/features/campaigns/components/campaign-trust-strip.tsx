import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  CheckmarkBadge01Icon,
  Route01Icon,
  Shield01Icon,
  Target02Icon,
} from "@hugeicons/core-free-icons";

import { Container } from "@/components/ui/container";

/**
 * The four accountability promises, stated once.
 *
 * The wording is deliberately narrower than a marketing claim: it describes
 * exactly what the escrow does (SRS §5, FR-502, FR-503a, FR-602) and nothing
 * about outcomes the product cannot guarantee.
 */
const promises = [
  {
    body: "A funding target on its own is not a plan. Each campaign publishes what every tranche buys before it opens.",
    icon: Route01Icon,
    title: "A plan to deliver",
  },
  {
    body: "All-or-Nothing funding. If the target is not reached by the deadline, the campaign fails and contributions are refundable in full.",
    icon: Target02Icon,
    title: "All-or-Nothing funding",
  },
  {
    body: "Published deliverables, evidence definitions and timelines. The evidence fix a claim is judged against is set before funding opens.",
    icon: CheckmarkBadge01Icon,
    title: "Published milestones",
  },
  {
    body: "Funds stay in a campaign-specific escrow and are released in stages as milestones are approved. Rejected milestones stay refundable.",
    icon: Shield01Icon,
    title: "Accountable releases",
  },
] as const satisfies readonly {
  body: string;
  icon: IconSvgElement;
  title: string;
}[];

export function CampaignTrustStrip() {
  return (
    <section
      aria-labelledby="how-backing-works-heading"
      className="border-t border-border bg-canvas py-9 sm:py-11"
    >
      <Container>
        <h2
          id="how-backing-works-heading"
          className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl"
        >
          More than a funding target
        </h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {promises.map(({ body, icon, title }) => (
            <li
              key={title}
              className="rounded-2xl border border-border bg-surface p-4"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-brand/10 text-brand-strong">
                <HugeiconsIcon
                  icon={icon}
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </span>
              <p className="mt-3 text-sm font-semibold text-ink">{title}</p>
              <p className="mt-1 text-xs leading-5 text-muted">{body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
