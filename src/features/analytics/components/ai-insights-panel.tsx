import { HugeiconsIcon } from "@hugeicons/react";
import {
  Analytics01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Pill } from "@/components/ui/pill";
import type { AiInsightsEntitlement } from "@/features/analytics/lib/entitlements";

const capabilities = [
  "Feedback-theme clustering",
  "Qualitative sentiment summary",
  "Audience-interest interpretation",
  "Growth opportunities grounded in observed data",
] as const;

/**
 * The AI capability is presented as a real gate, not as a decorative upgrade
 * card. No generated insight is rendered here: the entitlement service reports
 * that the feature is not configured, so the panel explains what is missing and
 * links to a real human path.
 */
export function AiInsightsPanel({
  entitlement,
}: {
  entitlement: AiInsightsEntitlement;
}) {
  return (
    <section
      aria-labelledby="ai-insights"
      data-ai-status={entitlement.status}
      className="rounded-2xl border border-border bg-brand-tint p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-brand/10 text-brand-strong">
          <HugeiconsIcon
            icon={Analytics01Icon}
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>
        <Pill tone="promoted" size="xs">
          Pro
        </Pill>
      </div>

      <h2 id="ai-insights" className="mt-3 text-base font-bold text-ink">
        AI insights
      </h2>
      <p className="mt-1 text-xs leading-5 text-muted">
        Go deeper into the feedback your idea has already received. AI analysis
        works from the responses and signals on this page, and separates what was
        observed from what the model interprets.
      </p>

      <ul className="mt-3 space-y-1.5">
        {capabilities.map((capability) => (
          <li
            key={capability}
            className="flex items-start gap-2 text-xs leading-5 text-ink-soft"
          >
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              size={14}
              strokeWidth={2}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-brand-strong"
            />
            {capability}
          </li>
        ))}
      </ul>

      {!entitlement.allowed ? (
        <div className="mt-4">
          <Link
            href="/contact"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-contrast px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Ask about Pro access
          </Link>
          <p className="mt-2 text-[0.6875rem] leading-4 text-muted">
            {entitlement.reason}
          </p>
        </div>
      ) : null}
    </section>
  );
}
