import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  FingerPrintIcon,
  Key01Icon,
  LockKeyIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import {
  CapabilityStatusPill,
  WalletStatusPill,
} from "@/features/wallet/components/wallet-status-pill";
import { capabilityStatus } from "@/features/wallet/lib/capabilities";
import { walletProvisioningDescriptions } from "@/features/wallet/lib/status";
import type { WalletView } from "@/features/wallet/types";

/**
 * Security.
 *
 * The important statement on this page is a limit, not a control: Inverge never
 * reads, stores, logs, or displays a private key, seed phrase, or signing share.
 * Key export is therefore unavailable, and the page says why rather than
 * offering an export button that cannot work. Session and device management are
 * equally absent because no authenticated session exists to manage.
 */

function SecurityRow({
  description,
  label,
  status,
}: {
  description: string;
  label: string;
  status: "available" | "preview" | "unavailable";
}) {
  return (
    <li className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 py-3.5 first:pt-0 last:border-0 last:pb-0">
      <div className="min-w-0 max-w-xl">
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="mt-0.5 text-xs leading-5 text-muted">{description}</p>
      </div>
      <CapabilityStatusPill status={status} />
    </li>
  );
}

export function WalletSecurity({ view }: { view: WalletView }) {
  const signing = capabilityStatus(view.capabilities, "signing");
  const provisioning = capabilityStatus(view.capabilities, "provisioning");
  const exportStatus = capabilityStatus(view.capabilities, "export");

  return (
    <div className="space-y-7">
      <section aria-labelledby="security-posture-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              id="security-posture-title"
              className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl"
            >
              How this wallet is protected
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-muted">
              The wallet is an embedded account tied to your Inverge identity.
              It is not an imported key, and this product never handles the
              material that would sign with one.
            </p>
          </div>
          <WalletStatusPill state={view.account.provisioning} />
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={Shield01Icon}
                size={17}
                strokeWidth={1.8}
                aria-hidden="true"
                className="text-brand-strong"
              />
              <p className="text-sm font-semibold text-ink">
                Secrets never reach Inverge
              </p>
            </div>
            <ul className="mt-2.5 space-y-2 text-xs leading-5 text-muted">
              <li>
                No private key, seed phrase, or signing share is stored in the
                database, logs, analytics, clipboard, URL, or browser storage.
              </li>
              <li>
                Signing happens in the provider&apos;s own flow. This build
                cannot start that flow because no provider SDK is installed.
              </li>
              <li>
                A wallet address is never your Inverge account identifier. Your
                internal user id remains the stable identity.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-canvas p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={FingerPrintIcon}
                size={17}
                strokeWidth={1.8}
                aria-hidden="true"
                className="text-brand-strong"
              />
              <p className="text-sm font-semibold text-ink">Account binding</p>
            </div>
            <dl className="mt-2.5 space-y-2 text-xs">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <dt className="text-muted">Identity</dt>
                <dd className="font-medium text-ink">Inverge user id</dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <dt className="text-muted">Provider</dt>
                <dd className="font-medium text-ink">
                  {view.account.provider.label}
                </dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <dt className="text-muted">Public address</dt>
                <dd className="font-medium text-ink">
                  {view.account.address ?? "None exists"}
                </dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <dt className="text-muted">Authenticated session</dt>
                <dd className="font-medium text-ink">Not available</dd>
              </div>
            </dl>
            <p className="mt-2.5 text-xs leading-5 text-muted">
              {walletProvisioningDescriptions[view.account.provisioning]}
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="security-controls-title">
        <h2
          id="security-controls-title"
          className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl"
        >
          Security controls
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-5 text-muted">
          A control is only marked connected when the mechanism behind it
          exists. Anything unavailable names the missing piece.
        </p>
        <ul className="mt-3 rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <SecurityRow
            label="Wallet provisioning"
            description="An embedded account created for your Inverge user id and bound to an authenticated session."
            status={provisioning}
          />
          <SecurityRow
            label="Transaction signing"
            description="Provider-hosted approval for a specific destination and amount. This build has no signature step."
            status={signing}
          />
          <SecurityRow
            label="Key export"
            description="Export is offered only where the provider documents and supports it. This build reads no key material, so there is nothing to export and no button that pretends otherwise."
            status={exportStatus}
          />
          <SecurityRow
            label="Sessions and devices"
            description="Reviewing or revoking an active session needs session records. No authenticated session exists in this preview."
            status="unavailable"
          />
          <SecurityRow
            label="Recovery"
            description="Recovery is the provider's own flow. Inverge support never asks for a seed phrase or signing share."
            status="unavailable"
          />
        </ul>
      </section>

      <section aria-labelledby="security-report-title">
        <div className="flex gap-3 rounded-2xl border border-warning/30 bg-warning/[0.07] px-4 py-3.5">
          <HugeiconsIcon
            icon={Alert02Icon}
            size={17}
            strokeWidth={1.9}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-warning-strong"
          />
          <div>
            <p
              id="security-report-title"
              className="text-sm font-semibold text-ink"
            >
              If someone asks for wallet secrets
            </p>
            <p className="mt-1 text-sm leading-6 text-muted">
              No Inverge employee, support agent, or creator will ever ask for a
              private key, seed phrase, signing share, or one-time code. Treat
              any request as fraud. This page has no reporting channel connected
              yet; use the help centre for the current contact route.
            </p>
            <Link
              href="/help"
              className="mt-2 inline-flex min-h-10 items-center gap-1.5 rounded-lg text-sm font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <HugeiconsIcon
                icon={LockKeyIcon}
                size={15}
                strokeWidth={1.9}
                aria-hidden="true"
              />
              Open the help centre
            </Link>
          </div>
        </div>
      </section>

      <p className="flex items-start gap-2 text-xs leading-5 text-muted">
        <HugeiconsIcon
          icon={Key01Icon}
          size={14}
          strokeWidth={1.9}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-brand-strong"
        />
        Key export stays unavailable until the provider documents a supported
        export flow and the product has reviewed what it would expose. Nothing
        on this page can reveal key material.
      </p>
    </div>
  );
}
