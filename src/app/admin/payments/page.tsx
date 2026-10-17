import { HugeiconsIcon } from "@hugeicons/react";
import {
  Invoice01Icon,
  StarAward01Icon,
  Ticket01Icon,
  TrophyIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Amount } from "@/components/ui/amount";
import { NgnEstimate } from "@/components/ui/ngn-estimate";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Pill } from "@/components/ui/pill";
import { previewProgrammes } from "@/features/programmes/content/preview-programmes";
import {
  formatProgrammeDate,
  prizePoolTotal,
  securedSponsorFunding,
} from "@/features/programmes/lib/programme";
import { PLANS } from "@/features/programmes/lib/monetisation";

function Ledger({
  title,
  description,
  icon,
  children,
  note,
}: {
  title: string;
  description: string;
  icon: typeof Invoice01Icon;
  children: React.ReactNode;
  note: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-ink">{title}</h2>
          <p className="mt-0.5 text-xs leading-5 text-muted">{description}</p>
        </div>
        <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-brand-strong">
          <HugeiconsIcon icon={icon} size={17} strokeWidth={1.8} aria-hidden="true" />
        </span>
      </div>
      <div className="mt-3">{children}</div>
      <p className="mt-3 border-t border-border pt-2 text-[0.625rem] leading-4 text-muted">
        {note}
      </p>
    </section>
  );
}

export default function AdminPaymentsPage() {
  const sponsors = previewProgrammes.flatMap((programme) =>
    programme.sponsors.map((sponsor) => ({ programme, sponsor })),
  );
  const rewards = previewProgrammes.flatMap((programme) =>
    programme.rewards.map((reward) => ({ programme, reward })),
  );
  const workshops = previewProgrammes.flatMap((programme) =>
    programme.workshops.map((workshop) => ({ programme, workshop })),
  );
  const secured = previewProgrammes.reduce(
    (sum, programme) => sum + BigInt(securedSponsorFunding(programme).atomic),
    0n,
  );
  const prizePool = previewProgrammes.reduce(
    (sum, programme) => sum + BigInt(prizePoolTotal(programme.rewards).atomic),
    0n,
  );

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header>
        <Eyebrow>Money</Eyebrow>
        <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
          Payments and fulfilment
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted">
          Subscriptions, promotions, sponsor invoices, workshop tickets, prize
          fulfilment, and crowdfunding contributions are separate flows. They are
          shown side by side for operations, never merged into one transaction.
        </p>
      </header>

      <div className="mt-4 rounded-2xl border border-warning/30 bg-warning/5 px-4 py-3">
        <p className="text-xs font-semibold text-warning-strong">
          No payment provider is connected to this workspace
        </p>
        <p className="mt-1 text-[0.6875rem] leading-5 text-warning-strong/85">
          A payment cannot be marked successful from this page. Provider selection,
          recurring billing, webhooks, refunds, and settlement must be recorded as a
          technical decision first. Crowdfunding contributions remain in the
          existing escrow architecture and are not operating revenue.
        </p>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <dt className="text-xs text-muted">Sponsor funding secured</dt>
          <dd className="mt-1 text-xl font-bold tabular-nums text-ink">
            <Amount value={{ atomic: secured.toString(), currency: "USD", decimals: 2 }} compact />
          </dd>
          <p className="mt-0.5 text-[0.625rem] text-muted">Provider-confirmed invoices only</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <dt className="text-xs text-muted">Promised prize pool</dt>
          <dd className="mt-1 text-xl font-bold tabular-nums text-ink">
            <Amount value={{ atomic: prizePool.toString(), currency: "USD", decimals: 2 }} compact />
          </dd>
          <p className="mt-0.5 text-[0.625rem] text-muted">
            Commitment, not money received
          </p>
          <NgnEstimate
            amount={{ atomic: prizePool.toString(), currency: "USD", decimals: 2 }}
            block
            className="mt-0.5 text-[0.625rem] text-muted"
            showRate
          />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <dt className="text-xs text-muted">Pro plan</dt>
          <dd className="mt-1 text-xl font-bold text-ink">
            {PLANS.pro.price ? <Amount value={PLANS.pro.price} /> : "—"}
            <span className="text-xs font-normal text-muted"> / month</span>
          </dd>
          <p className="mt-0.5 text-[0.625rem] text-muted">Illustrative price, not a confirmed decision</p>
        </div>
      </dl>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Ledger
          title="Sponsor invoices"
          description="Committed sponsorship and its invoice state."
          icon={Invoice01Icon}
          note="An offline transfer can be recorded during the pilot only with a reference and an explicit verification. A client redirect is never proof of payment."
        >
          <ul className="space-y-2">
            {sponsors.map(({ programme, sponsor }) => (
              <li key={`${programme.id}-${sponsor.id}`} className="rounded-xl border border-border p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-ink">{sponsor.name}</p>
                    <p className="text-[0.625rem] text-muted">{programme.title}</p>
                    <p className="mt-1 text-[0.625rem] text-muted">
                      {sponsor.deliverables.join(" · ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold tabular-nums text-ink">
                      <Amount value={sponsor.commitment} compact />
                    </p>
                    <Pill
                      size="xs"
                      tone={
                        sponsor.invoiceStatus === "paid"
                          ? "accent"
                          : sponsor.invoiceStatus === "overdue"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {sponsor.invoiceStatus}
                    </Pill>
                  </div>
                </div>
                <Link
                  href={`/admin/programmes/${programme.id}?tab=sponsors`}
                  className="mt-2 inline-flex text-[0.625rem] font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
                >
                  Manage invoice
                </Link>
              </li>
            ))}
          </ul>
        </Ledger>

        <Ledger
          title="Prize fulfilment"
          description="What winners are owed and where it is in the process."
          icon={TrophyIcon}
          note="Prize money is fulfilled outside campaign escrow. It must never be paid from backer contributions."
        >
          <ul className="space-y-2">
            {rewards.map(({ programme, reward }) => (
              <li key={`${programme.id}-${reward.id}`} className="flex items-start justify-between gap-2 rounded-xl border border-border p-3">
                <div>
                  <p className="text-xs font-semibold text-ink">{reward.title}</p>
                  <p className="text-[0.625rem] text-muted">{programme.title} · {reward.fulfilmentOwner}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold tabular-nums text-ink">
                    {reward.amount ? <Amount value={reward.amount} compact /> : "Non-cash"}
                  </p>
                  <Pill size="xs" tone={reward.fulfilmentStatus === "delivered" ? "accent" : "neutral"}>
                    {reward.fulfilmentStatus}
                  </Pill>
                </div>
              </li>
            ))}
          </ul>
        </Ledger>

        <Ledger
          title="Workshop tickets"
          description="Paid sessions, capacity, and booking state."
          icon={Ticket01Icon}
          note="A paid ticket needs authoritative provider confirmation. Free sessions are registrations, not payments."
        >
          {workshops.length > 0 ? (
            <ul className="space-y-2">
              {workshops.map(({ programme, workshop }) => (
                <li key={`${programme.id}-${workshop.id}`} className="rounded-xl border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-ink">{workshop.title}</p>
                      <p className="text-[0.625rem] text-muted">
                        {formatProgrammeDate(workshop.startsAt, true)} · {workshop.seatsTaken}/{workshop.capacity} seats
                      </p>
                    </div>
                    <Pill size="xs" tone="neutral">
                      {workshop.price ? <Amount value={workshop.price} /> : "Free"}
                    </Pill>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted">No workshop sessions configured.</p>
          )}
        </Ledger>

        <Ledger
          title="Creator subscriptions"
          description="Plan entitlement and AI allowance."
          icon={UserGroupIcon}
          note="A subscription only becomes active from a verified provider event. A local upgrade click produces an incomplete state."
        >
          <div className="rounded-xl border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-ink">Pro</p>
              <Pill size="xs" tone="warning">Incomplete · provider not connected</Pill>
            </div>
            <p className="mt-1 text-[0.625rem] leading-4 text-muted">
              10 AI analyses per month, feedback themes, evidence gaps, and
              exportable reports. Basic analytics remain free.
            </p>
            <Link
              href="/d/creator/ideas/skill-circle/insights"
              className="mt-2 inline-flex text-[0.625rem] font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
            >
              View creator analytics
            </Link>
          </div>
        </Ledger>

        <Ledger
          title="Idea promotion"
          description="Paid visibility is separate from validation and judging."
          icon={StarAward01Icon}
          note="A promotion changes discovery placement only. It cannot alter supporters, estimated interest, feedback, or a leaderboard position."
        >
          <div className="rounded-xl border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-ink">CampusKonekt · Featured</p>
              <Pill size="xs" tone="promoted">Promoted</Pill>
            </div>
            <p className="mt-1 text-[0.625rem] text-muted">
              Fixed placement, labelled publicly. No per-view pricing.
            </p>
            <p className="mt-1 text-[0.625rem] text-muted">
              Organic metrics unchanged by construction.
            </p>
          </div>
        </Ledger>

        <Ledger
          title="Crowdfunding contributions"
          description="Handled by the existing campaign escrow architecture."
          icon={Invoice01Icon}
          note="Not operating revenue. Inverge holds no key that can move escrowed funds; refunds remain claimable without backend uptime."
        >
          <p className="text-xs leading-5 text-muted">
            Campaign contributions stay in the campaign and milestone flows. They
            are not imported into this ledger, and no programme action can point a
            contribution at a prize, ticket, subscription, or sponsorship.
          </p>
          <Link
            href="/d"
            className="mt-2 inline-flex text-[0.625rem] font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
          >
            Open the product workspace
          </Link>
        </Ledger>
      </div>
    </div>
  );
}
