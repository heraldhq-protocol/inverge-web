import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  Analytics01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  LockKeyIcon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import {
  formatAccessDate,
  type AnalyticsAccessView,
} from "@/features/analytics/lib/access";
import { requestAnalyticsAccess } from "@/features/analytics/server/actions";

const premiumReports = [
  "Acquisition sources for this idea",
  "Country-level view distribution",
  "Conversion rates with their denominators",
] as const;

function statusLabel(access: AnalyticsAccessView): {
  label: string;
  tone: "accent" | "danger" | "neutral" | "warning";
} {
  switch (access.status) {
    case "premium":
      return { label: "Active", tone: "accent" };
    case "pending":
      return { label: "Pending", tone: "warning" };
    case "rejected":
      return { label: "Not approved", tone: "danger" };
    case "expired":
      return { label: "Expired", tone: "warning" };
    case "available":
      return { label: "Not requested", tone: "neutral" };
    case "signed_out":
      return { label: "Signed out", tone: "neutral" };
    case "not_configured":
      return { label: "Unavailable", tone: "neutral" };
    case "unavailable":
      return { label: "Unavailable", tone: "danger" };
  }
}

function RequestButton({ children }: { children?: string }) {
  return (
    <form action={requestAnalyticsAccess}>
      <Button type="submit" size="md">
        {children ?? "Request premium access"}
      </Button>
    </form>
  );
}

function AccessBody({ access }: { access: AnalyticsAccessView }) {
  switch (access.status) {
    case "premium": {
      const expiry = formatAccessDate(access.access.expiresAt);
      return {
        body: expiry
          ? `Premium reports are available for this account through ${expiry}.`
          : "Premium reports are available for this account. No expiry is set.",
        icon: CheckmarkCircle02Icon,
        title: "Access active",
      };
    }
    case "pending": {
      const requested = formatAccessDate(access.access.requestedAt);
      return {
        body: requested
          ? `Requested ${requested}. The Inverge team reviews requests; basic reports stay available while you wait.`
          : "The Inverge team reviews requests; basic reports stay available while you wait.",
        icon: Clock01Icon,
        title: "Request pending",
      };
    }
    case "rejected": {
      const decided = formatAccessDate(access.access.decidedAt);
      return {
        body: decided
          ? `The request was not approved on ${decided}. You can ask again; a new request replaces the earlier decision.`
          : "The request was not approved. You can ask again; a new request replaces the earlier decision.",
        icon: Alert02Icon,
        title: "Not approved",
      };
    }
    case "expired": {
      const expired = formatAccessDate(access.access.expiresAt);
      return {
        body: expired
          ? `Premium access ended on ${expired}. You can request it again.`
          : "Premium access has ended. You can request it again.",
        icon: Clock01Icon,
        title: "Access expired",
      };
    }
    case "available":
      return {
        body: "Tell us how you plan to use premium reports. The Inverge team reviews each request; basic reports stay available without it.",
        icon: LockKeyIcon,
        title: "Request access",
      };
    case "signed_out":
      return {
        body: "Sign in to request premium reports for your creator account.",
        icon: LockKeyIcon,
        title: "Sign in to request access",
      };
    case "not_configured":
      return {
        body: "Premium access is not checked in this environment. Basic reports follow the data source configured for this deployment.",
        icon: Analytics01Icon,
        title: "Premium access is not configured",
      };
    case "unavailable":
      return {
        body: access.reason,
        icon: Alert02Icon,
        title: "We could not check access",
      };
  }
}

/**
 * Request-gated premium analytics.
 *
 * Collection and entitlement are separate: this panel asks the API for the
 * signed-in account's status and never infers approval from a local flag. It
 * deliberately shows no price, plan, or billing promise - the API owns the grant,
 * and a paid wall can later reuse the same `analytics.premium` feature key.
 */
export function PremiumAccessPanel({
  access,
  notice,
}: {
  access: AnalyticsAccessView;
  notice: "error" | "requested" | null;
}) {
  const status = statusLabel(access);
  const content = AccessBody({ access });
  const canRequest = "access" in access && access.access.canRequest;

  return (
    <section
      aria-labelledby="premium-analytics"
      data-access-status={access.status}
      className="mt-6 rounded-2xl border border-border bg-surface p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand-strong">
            <HugeiconsIcon
              icon={Analytics01Icon}
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="premium-analytics" className="text-sm font-bold text-ink">
                Premium analytics
              </h2>
              <Pill tone="accent" size="xs">
                Request-gated
              </Pill>
            </div>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">
              Basic reports cover views, support, estimated interest, and
              structured feedback. Premium adds acquisition sources, geography,
              and conversion rates.
            </p>
          </div>
        </div>
        <Pill tone={status.tone} size="sm">
          {status.label}
        </Pill>
      </div>

      {notice === "requested" ? (
        <p
          role="status"
          className="mt-4 rounded-xl bg-brand/10 px-3 py-2 text-xs font-semibold text-brand-strong"
        >
          Request received. The Inverge team will review it.
        </p>
      ) : null}
      {notice === "error" ? (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-danger/10 px-3 py-2 text-xs font-semibold text-danger"
        >
          We could not submit the request. Try again.
        </p>
      ) : null}

      <div className="mt-4 flex items-start gap-3 rounded-xl bg-canvas p-3">
        <HugeiconsIcon
          icon={content.icon}
          size={18}
          strokeWidth={1.8}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-brand-strong"
        />
        <div>
          <h3 className="text-xs font-bold text-ink">{content.title}</h3>
          <p className="mt-0.5 text-xs leading-5 text-muted">{content.body}</p>
        </div>
      </div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {premiumReports.map((report) => (
          <li
            key={report}
            className="flex items-start gap-2 text-xs leading-5 text-muted"
          >
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              size={15}
              strokeWidth={1.8}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-brand-strong"
            />
            {report}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {canRequest &&
        (access.status === "available" ||
          access.status === "rejected" ||
          access.status === "expired") ? (
          <RequestButton>
            {access.status === "available"
              ? "Request premium access"
              : "Request again"}
          </RequestButton>
        ) : null}
        {access.status === "signed_out" ? (
          <Link
            href="/auth?next=%2Fd%2Fcreator%2Fanalytics"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
          >
            Sign in to request access
          </Link>
        ) : null}
        {access.status === "unavailable" ? (
          <Link
            href="/d/creator/analytics"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:border-brand/45 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
          >
            Try again
          </Link>
        ) : null}
      </div>
    </section>
  );
}
