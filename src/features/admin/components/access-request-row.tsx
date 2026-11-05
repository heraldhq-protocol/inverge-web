"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  adminFieldClass,
  adminLinkClass,
} from "@/features/admin/components/admin-workspace-ui";
import {
  accessDecisionReceiptSchema,
  accessDecisionSchema,
  accessStatusLabel,
  formatAccessDate,
  matchesAccessDecision,
  type AccessDecision,
  type AdminAccessRequest,
} from "@/features/admin/lib/access-requests";
import { sendJson } from "@/lib/api/client";

export function AccessRequestRow({
  request: initialRequest,
  endpointBase,
  queueHref,
  featureLabel,
  asOf,
  accountDetails,
  canRevise = false,
}: {
  request: AdminAccessRequest;
  endpointBase: string;
  queueHref: string;
  featureLabel: string;
  asOf: string;
  accountDetails?: ReactNode;
  canRevise?: boolean;
}) {
  const [request, setRequest] = useState(initialRequest);
  const [open, setOpen] = useState(false);
  const [decision, setDecision] =
    useState<AccessDecision["status"]>("APPROVED");
  const [expiry, setExpiry] = useState("");
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<{
    message: string;
    reload: boolean;
  } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const busyRef = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const firstChoice = useRef<HTMLInputElement>(null);
  const noticeRef = useRef<HTMLParagraphElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const name = request.email || request.userId;
  const canDecide = request.status === "PENDING" || canRevise;

  useEffect(() => {
    if (open) firstChoice.current?.focus();
  }, [open]);
  useEffect(() => {
    if (notice) noticeRef.current?.focus();
  }, [notice]);
  useEffect(() => {
    if (failure) errorRef.current?.focus();
  }, [failure]);

  function close() {
    if (busyRef.current) return;
    setOpen(false);
    trigger.current?.focus();
  }

  function beginReview() {
    if (busyRef.current || failure?.reload) return;
    setDecision("APPROVED");
    setExpiry("");
    setFailure(null);
    setNotice(null);
    setOpen(true);
  }

  async function save() {
    if (busyRef.current || failure?.reload || !canDecide) return;
    const date = expiry && decision === "APPROVED" ? new Date(expiry) : null;
    if (date && Number.isNaN(date.getTime())) {
      setFailure({
        message: "Enter a valid expiry date and time.",
        reload: false,
      });
      return;
    }
    const parsed = accessDecisionSchema.safeParse({
      status: decision,
      ...(date ? { expiresAt: date.toISOString() } : {}),
    });
    if (!parsed.success) {
      setFailure({
        message:
          parsed.error.issues[0]?.message ?? "Check the decision fields.",
        reload: false,
      });
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setFailure(null);
    try {
      const result = await sendJson<unknown>(
        `${endpointBase}/${encodeURIComponent(request.id)}`,
        { method: "PATCH", body: parsed.data },
      );
      if (!result.ok) {
        const reload =
          result.status === 0 ||
          result.status >= 500 ||
          [401, 403, 404, 409].includes(result.status);
        setFailure({
          message: reload
            ? `${result.message} Reload the requests before another decision.`
            : result.message,
          reload,
        });
        return;
      }
      const receipt = accessDecisionReceiptSchema.safeParse(result.data);
      if (
        !receipt.success ||
        receipt.data.request.userId !== request.userId ||
        !matchesAccessDecision(receipt.data.request, request.id, parsed.data)
      ) {
        setFailure({
          message:
            "The service did not confirm this decision. Reload the requests to check the current state.",
          reload: true,
        });
        return;
      }
      setRequest(receipt.data.request);
      setOpen(false);
      setNotice(
        decision === "APPROVED"
          ? `Access approved${receipt.data.request.expiresAt ? ` until ${formatAccessDate(receipt.data.request.expiresAt)}` : " without an expiry"}.`
          : "Access request rejected.",
      );
    } catch {
      setFailure({
        message:
          "The decision could not be confirmed. Reload the requests to check the current state.",
        reload: true,
      });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  const label = accessStatusLabel(request, asOf);
  const statusClass =
    request.status === "PENDING"
      ? "bg-warning/10 text-warning-strong"
      : label === "Approved"
        ? "bg-brand-soft text-brand-strong"
        : "bg-canvas text-ink-soft";

  return (
    <li className="p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 basis-52">
          <p className="text-sm font-semibold text-ink [overflow-wrap:anywhere]">
            {name}
          </p>
          {accountDetails}
          <p className="mt-1 text-xs leading-5 text-ink-soft">
            Requested {formatAccessDate(request.requestedAt)}
          </p>
          <p className="mt-1 text-xs leading-5 text-ink-soft">
            {request.source === "PAID"
              ? "Paid grant"
              : request.source === "ADMIN"
                ? "Administrator decision"
                : "Requested by account"}
            {request.decidedAt
              ? ` · Decided ${formatAccessDate(request.decidedAt)}`
              : ""}
          </p>
          {request.status === "APPROVED" ? (
            <p className="mt-1 text-xs leading-5 text-ink-soft">
              {request.expiresAt
                ? `Expires ${formatAccessDate(request.expiresAt)}`
                : "No expiry set"}
            </p>
          ) : null}
          <details className="mt-2 text-xs text-ink-soft">
            <summary className="inline-flex min-h-11 cursor-pointer items-center rounded-md font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-brand-strong">
              Account references
            </summary>
            <dl className="space-y-1 pb-2 [overflow-wrap:anywhere]">
              <div>
                <dt className="inline font-semibold">Account: </dt>
                <dd className="inline">{request.userId}</dd>
              </div>
              <div>
                <dt className="inline font-semibold">Request: </dt>
                <dd className="inline">{request.id}</dd>
              </div>
            </dl>
          </details>
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end">
          <span
            className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${statusClass}`}
          >
            {label}
          </span>
          {canDecide ? (
            <Button
              ref={trigger}
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer focus-visible:outline-brand-strong"
              aria-expanded={open}
              aria-controls={id}
              disabled={busy || failure?.reload}
              onClick={open ? close : beginReview}
            >
              {request.status === "PENDING"
                ? "Review request"
                : "Change access"}
            </Button>
          ) : null}
        </div>
      </div>

      {open ? (
        <form
          id={id}
          aria-label={`Review request for ${name}`}
          aria-busy={busy}
          className="mt-3 border-t border-border pt-4"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && !busyRef.current) {
              event.preventDefault();
              event.stopPropagation();
              close();
            }
          }}
        >
          <fieldset disabled={busy || failure?.reload} className="min-w-0">
            <legend className="text-sm font-semibold text-ink">
              Decide {featureLabel} access
            </legend>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
              <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-ink">
                <input
                  ref={firstChoice}
                  type="radio"
                  name={`${id}-decision`}
                  value="APPROVED"
                  checked={decision === "APPROVED"}
                  onChange={() => setDecision("APPROVED")}
                  className="size-4 accent-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
                />
                Approve access
              </label>
              <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-ink">
                <input
                  type="radio"
                  name={`${id}-decision`}
                  value="REJECTED"
                  checked={decision === "REJECTED"}
                  onChange={() => setDecision("REJECTED")}
                  className="size-4 accent-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
                />
                {request.status === "APPROVED"
                  ? "Revoke access"
                  : "Reject request"}
              </label>
            </div>
            {decision === "APPROVED" ? (
              <div className="mt-3 max-w-sm">
                <label
                  htmlFor={`${id}-expiry`}
                  className="text-sm font-medium text-ink"
                >
                  Expiry (optional)
                </label>
                <input
                  id={`${id}-expiry`}
                  type="datetime-local"
                  value={expiry}
                  onChange={(event) => setExpiry(event.target.value)}
                  aria-describedby={`${id}-expiry-help`}
                  className={`mt-2 ${adminFieldClass}`}
                />
                <p
                  id={`${id}-expiry-help`}
                  className="mt-2 text-xs leading-5 text-ink-soft"
                >
                  Use your local date and time. Leave blank for access without
                  expiry.
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm leading-6 text-ink-soft">
                This account will not have {featureLabel} access through this
                grant.
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                type="submit"
                size="sm"
                className="cursor-pointer bg-brand-strong hover:bg-contrast focus-visible:outline-brand-strong"
              >
                {busy
                  ? "Saving decision..."
                  : decision === "APPROVED"
                    ? "Approve access"
                    : request.status === "APPROVED"
                      ? "Revoke access"
                      : "Reject request"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="cursor-pointer focus-visible:outline-brand-strong"
                onClick={close}
              >
                Cancel
              </Button>
            </div>
          </fieldset>
        </form>
      ) : null}
      {notice ? (
        <p
          ref={noticeRef}
          role="status"
          tabIndex={-1}
          className="mt-3 rounded-lg bg-brand-soft px-3 py-2 text-sm leading-6 text-brand-strong outline-none [overflow-wrap:anywhere]"
        >
          {notice}
        </p>
      ) : null}
      {failure ? (
        <div
          ref={errorRef}
          role="alert"
          tabIndex={-1}
          className="mt-3 rounded-lg border border-danger/25 bg-danger/[0.06] p-3 text-sm leading-6 text-ink outline-none [overflow-wrap:anywhere]"
        >
          <p>{failure.message}</p>
          {failure.reload ? (
            <a href={queueHref} className={`mt-3 ${adminLinkClass}`}>
              Reload requests
            </a>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
