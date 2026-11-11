"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  adminFieldClass,
  adminLinkClass,
} from "@/features/admin/components/admin-workspace-ui";
import {
  boostPriceDraft,
  boostPriceFormSchema,
  boostPricesReceiptSchema,
  changedBoostPrices,
  matchesBoostPriceUpdate,
  type BoostPriceDraft,
  type BoostPrices,
} from "@/features/admin/lib/boost-prices";
import { sendJson } from "@/lib/api/client";
import { formatMoneyWithCents } from "@/lib/money";

const fieldLabels: Record<keyof BoostPriceDraft, string> = {
  basicPrice: "Basic price",
  basicDuration: "Basic duration",
  featuredPrice: "Featured price",
  featuredDuration: "Featured duration",
};
const tiers = [
  {
    key: "basic",
    label: "Basic",
    priceField: "basicPrice",
    daysField: "basicDuration",
  },
  {
    key: "featured",
    label: "Featured",
    priceField: "featuredPrice",
    daysField: "featuredDuration",
  },
] as const;
type SaveState =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "saved" }
  | { status: "failed"; message: string; reload: boolean; field?: string };
const unconfirmedMessage =
  "The change could not be confirmed. Some prices or durations may already have been saved. Reload prices before trying again.";

export function BoostPriceEditor({
  prices: initialPrices,
}: {
  prices: BoostPrices;
}) {
  const [prices, setPrices] = useState(initialPrices);
  const [draft, setDraft] = useState(() => boostPriceDraft(initialPrices));
  const [state, setState] = useState<SaveState>({ status: "idle" });
  const busyRef = useRef(false);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const saved = boostPriceDraft(prices);
  const hasChanges = tiers.some(
    (tier) =>
      draft[tier.priceField] !== saved[tier.priceField] ||
      draft[tier.daysField] !== saved[tier.daysField],
  );
  const locked =
    state.status === "saving" || (state.status === "failed" && state.reload);

  useEffect(() => {
    if (state.status === "saved" || state.status === "failed")
      feedbackRef.current?.focus();
  }, [state]);

  function change(field: keyof BoostPriceDraft, value: string) {
    setDraft({ ...draft, [field]: value });
    if (
      state.status === "saved" ||
      (state.status === "failed" && !state.reload)
    )
      setState({ status: "idle" });
  }

  async function handleSave() {
    if (busyRef.current || locked) return;
    const parsed = boostPriceFormSchema.safeParse(draft);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = String(issue?.path[0] ?? "");
      const label =
        Object.entries(fieldLabels).find(([key]) => key === field)?.[1] ??
        "Pricing";
      setState({
        status: "failed",
        reload: false,
        field,
        message: `${label}: ${issue?.message ?? "Check this value."}`,
      });
      return;
    }
    const update = changedBoostPrices(parsed.data, prices);
    if (!update) {
      setDraft(saved);
      setState({ status: "idle" });
      return;
    }
    busyRef.current = true;
    setState({ status: "saving" });
    try {
      const response = await sendJson<unknown>("/api/admin/boost-prices", {
        method: "PATCH",
        body: update,
      });
      if (!response.ok) {
        const uncertain = response.status === 0 || response.status >= 500;
        setState({
          status: "failed",
          message: uncertain ? unconfirmedMessage : response.message,
          reload: uncertain || [401, 403, 404, 409].includes(response.status),
        });
        return;
      }
      const receipt = boostPricesReceiptSchema.safeParse(response.data);
      if (
        !receipt.success ||
        !matchesBoostPriceUpdate(receipt.data.prices, update)
      ) {
        setState({
          status: "failed",
          reload: true,
          message: unconfirmedMessage,
        });
        return;
      }
      setPrices(receipt.data.prices);
      setDraft(boostPriceDraft(receipt.data.prices));
      setState({ status: "saved" });
    } catch {
      setState({ status: "failed", reload: true, message: unconfirmedMessage });
    } finally {
      busyRef.current = false;
    }
  }

  return (
    <form
      aria-label="Boost pricing"
      aria-busy={state.status === "saving"}
      noValidate
      className="mt-6 overflow-hidden rounded-xl border border-border bg-surface"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSave();
      }}
    >
      <fieldset disabled={locked} className="min-w-0">
        <legend className="sr-only">Placement prices and durations</legend>
        <div className="grid divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
          {tiers.map((tier) => (
            <fieldset key={tier.key} className="min-w-0 p-5 sm:p-6">
              <legend className="sr-only">{tier.label} placement</legend>
              <h2 className="text-lg font-semibold text-ink">{tier.label}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-soft">
                Current setting:{" "}
                <span className="font-mono font-medium tabular-nums text-ink">
                  {formatMoneyWithCents(prices[tier.key].price)}
                </span>{" "}
                for {prices[tier.key].durationDays}{" "}
                {prices[tier.key].durationDays === 1 ? "day" : "days"}.
              </p>
              <div className="mt-5">
                <label
                  htmlFor={`${id}-${tier.priceField}`}
                  className="text-sm font-medium text-ink"
                >
                  {tier.label} price (USD)
                </label>
                <input
                  id={`${id}-${tier.priceField}`}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  required
                  maxLength={40}
                  value={draft[tier.priceField]}
                  onChange={(event) =>
                    change(tier.priceField, event.target.value)
                  }
                  aria-invalid={
                    state.status === "failed" && state.field === tier.priceField
                      ? true
                      : undefined
                  }
                  aria-describedby={
                    state.status === "failed" && state.field === tier.priceField
                      ? `${id}-error`
                      : undefined
                  }
                  className={`mt-2 font-mono tabular-nums ${adminFieldClass}`}
                />
              </div>
              <div className="mt-5">
                <label
                  htmlFor={`${id}-${tier.daysField}`}
                  className="text-sm font-medium text-ink"
                >
                  {tier.label} duration (days)
                </label>
                <input
                  id={`${id}-${tier.daysField}`}
                  type="number"
                  inputMode="numeric"
                  required
                  min={1}
                  max={365}
                  step={1}
                  value={draft[tier.daysField]}
                  onChange={(event) =>
                    change(tier.daysField, event.target.value)
                  }
                  aria-invalid={
                    state.status === "failed" && state.field === tier.daysField
                      ? true
                      : undefined
                  }
                  aria-describedby={
                    state.status === "failed" && state.field === tier.daysField
                      ? `${id}-error`
                      : `${id}-duration-help`
                  }
                  className={`mt-2 font-mono tabular-nums ${adminFieldClass}`}
                />
              </div>
            </fieldset>
          ))}
        </div>
        <div className="border-t border-border p-5 sm:p-6">
          <p
            id={`${id}-duration-help`}
            className="text-sm leading-6 text-ink-soft"
          >
            Prices are one-off charges in USD. Placement can run for 1 to 365
            days.
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-soft">
            Paid placement affects discovery. Validation metrics and campaign
            approval remain independent. Price and duration changes are recorded
            in the platform audit history.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              type="submit"
              disabled={!hasChanges}
              className="w-full cursor-pointer bg-brand-strong hover:bg-contrast focus-visible:outline-brand-strong sm:w-auto"
            >
              {state.status === "saving"
                ? "Saving pricing..."
                : "Save boost pricing"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!hasChanges}
              className="w-full cursor-pointer focus-visible:outline-brand-strong sm:w-auto"
              onClick={() => {
                if (busyRef.current || locked) return;
                setDraft(saved);
                setState({ status: "idle" });
              }}
            >
              Discard changes
            </Button>
          </div>
        </div>
      </fieldset>
      {state.status === "saved" || state.status === "failed" ? (
        <div
          ref={feedbackRef}
          tabIndex={-1}
          className="border-t border-border p-5 outline-none sm:px-6"
        >
          {state.status === "saved" ? (
            <p
              role="status"
              className="text-sm font-medium leading-6 text-brand-strong"
            >
              Boost pricing saved.
            </p>
          ) : (
            <>
              <p
                id={`${id}-error`}
                role="alert"
                className="text-sm leading-6 text-ink [overflow-wrap:anywhere]"
              >
                {state.message}
              </p>
              {state.reload ? (
                <a
                  href="/admin/boost-prices"
                  className={`mt-3 ${adminLinkClass}`}
                >
                  Reload prices
                </a>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </form>
  );
}
