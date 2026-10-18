import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  FileValidationIcon,
  Route01Icon,
  Shield01Icon,
  Target02Icon,
  Undo03Icon,
} from "@hugeicons/core-free-icons";

import { Amount } from "@/components/ui/amount";
import {
  accountabilitySteps,
  campaignTermRows,
  type AccountabilityIcon,
} from "@/features/campaigns/lib/escrow";
import { escrowLedger } from "@/features/campaigns/lib/milestones";
import { hasEscrowActivity } from "@/features/campaigns/lib/status";
import type { Campaign } from "@/features/campaigns/types";

/**
 * The escrow explainer.
 *
 * Every sentence is generated from this campaign's own published terms, so the
 * page can never quote a platform-wide number the campaign does not apply. The
 * ledger appears only once a campaign has actually reached escrow activity; on a
 * campaign still collecting contributions there is nothing to reconcile, and an
 * all-zero ledger would read as "nothing raised".
 */

const stepIcons: Record<AccountabilityIcon, IconSvgElement> = {
  evidence: FileValidationIcon,
  refund: Undo03Icon,
  release: Route01Icon,
  shield: Shield01Icon,
  target: Target02Icon,
};

function EscrowLedgerTable({ campaign }: { campaign: Campaign }) {
  const ledger = escrowLedger(campaign);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        <div className="p-3.5">
          <p className="text-xs text-muted">Released</p>
          <p className="mt-0.5 text-base font-bold tabular-nums text-ink">
            <Amount value={ledger.released} />
          </p>
        </div>
        <div className="p-3.5">
          <p className="text-xs text-muted">Approved, awaiting release</p>
          <p className="mt-0.5 text-base font-bold tabular-nums text-ink">
            <Amount value={ledger.pending} />
          </p>
        </div>
        <div className="p-3.5">
          <p className="text-xs text-muted">Refundable</p>
          <p className="mt-0.5 text-base font-bold tabular-nums text-ink">
            <Amount value={ledger.refundable} />
          </p>
        </div>
      </div>

      <table className="w-full text-left text-sm">
        <caption className="sr-only">
          Each tranche and which part of the escrow it sits in.
        </caption>
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-[0.08em] text-muted">
            <th scope="col" className="px-3.5 py-2 font-semibold">
              Tranche
            </th>
            <th scope="col" className="px-3.5 py-2 font-semibold">
              Amount
            </th>
            <th scope="col" className="px-3.5 py-2 font-semibold">
              In escrow
            </th>
          </tr>
        </thead>
        <tbody>
          {ledger.rows.map((row) => (
            <tr
              key={row.milestoneId}
              className="border-b border-border/70 last:border-0"
            >
              <th scope="row" className="px-3.5 py-2.5 font-normal text-ink">
                <span className="text-muted">{row.sequence}.</span> {row.title}
              </th>
              <td className="px-3.5 py-2.5 tabular-nums text-ink">
                <Amount value={row.tranche} />
              </td>
              <td className="px-3.5 py-2.5 capitalize text-muted">
                {row.bucket}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="border-t border-border px-3.5 py-2.5 text-xs leading-5 text-muted">
        Released funds have left escrow. Approved funds are decided but not yet
        transferred. Refundable funds can be claimed back by backers, and
        unreleased funds are still held pending their milestone.
      </p>
    </div>
  );
}

export function CampaignEscrowSection({ campaign }: { campaign: Campaign }) {
  const steps = accountabilitySteps(campaign);
  const terms = campaignTermRows(campaign);

  return (
    <div className="space-y-5">
      <ul className="grid gap-3 sm:grid-cols-2">
        {steps.map((step) => (
          <li
            key={step.id}
            className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-brand/10 text-brand-strong">
              <HugeiconsIcon
                icon={stepIcons[step.icon]}
                size={18}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </span>
            <h3 className="mt-3 text-base font-semibold text-ink">
              {step.title}
            </h3>
            <p className="mt-1.5 text-sm leading-6 text-muted">{step.body}</p>
          </li>
        ))}
      </ul>

      {hasEscrowActivity(campaign.phase) ? (
        <EscrowLedgerTable campaign={campaign} />
      ) : null}

      <div className="rounded-2xl border border-border bg-canvas p-4 sm:p-5">
        <h3 className="text-base font-semibold text-ink">
          This campaign&apos;s published terms
        </h3>
        <dl className="mt-3 space-y-2 text-sm">
          {terms.map((term) => (
            <div
              key={term.label}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-border/70 pb-2 last:border-0 last:pb-0"
            >
              <dt className="text-muted">{term.label}</dt>
              <dd
                className={`font-medium ${term.unknown ? "text-muted" : "text-ink"}`}
              >
                {term.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
