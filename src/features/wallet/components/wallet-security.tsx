import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  LockKeyIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Pill } from "@/components/ui/pill";
import { WalletSecurityActions } from "@/features/wallet/components/wallet-security-actions";
import { WalletStatusPill } from "@/features/wallet/components/wallet-status-pill";
import type { WalletView } from "@/features/wallet/types";

/**
 * Wallet security.
 *
 * The page explains the one security boundary Inverge actually owns: it never
 * receives wallet key material. Recovery, key export, connected sessions and
 * transaction approval belong to MetaMask Embedded Wallets, so the page sends
 * the user to the provider's own wallet UI instead of listing controls that
 * Inverge cannot operate.
 */

export function WalletSecurity({ view }: { view: WalletView }) {
  const hasLinkedWallet =
    view.account.provisioning === "ready" && view.account.address !== null;
  const providerConfigured = view.account.provider.configured;

  const statusDescription = hasLinkedWallet
    ? "The provider returned an account and it is linked to your Inverge user."
    : view.account.provisioning === "failed"
      ? "Provisioning did not complete. Nothing was created and no address exists."
      : providerConfigured
        ? "No wallet is linked yet. Connect the embedded wallet to create or restore the provider account."
        : "Embedded wallet services are not configured in this environment. No account or address can be created until a provider is configured.";

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
              Your wallet is an embedded account held by MetaMask Embedded
              Wallets. Inverge links it to your account, but never holds the
              material that can move funds.
            </p>
          </div>
          {hasLinkedWallet ? (
            <WalletStatusPill state={view.account.provisioning} />
          ) : (
            <Pill tone="neutral" size="sm">
              {providerConfigured ? "Not linked" : "Not configured"}
            </Pill>
          )}
        </div>

        <p className="mt-2 max-w-2xl text-xs leading-5 text-muted">
          {statusDescription}
        </p>

        <div className="mt-3 rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={Shield01Icon}
              size={17}
              strokeWidth={1.8}
              aria-hidden="true"
              className="text-brand-strong"
            />
            <p className="text-sm font-semibold text-ink">
              Keys stay with the provider
            </p>
          </div>
          <ul className="mt-2.5 space-y-2 text-xs leading-5 text-muted">
            <li>
              The provider holds the key shares. Inverge only receives your
              public address.
            </li>
            <li>
              Every approval happens inside MetaMask Embedded Wallets. Inverge
              never signs a transaction on your behalf.
            </li>
            <li>
              Your address is linked to your Inverge account, but your user id
              remains your identity.
            </li>
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="security-manage-title"
        className="rounded-2xl border border-brand/20 bg-brand/[0.06] p-4 sm:p-5"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand-strong"
          >
            <HugeiconsIcon icon={LockKeyIcon} size={20} strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <h2
              id="security-manage-title"
              className="text-base font-semibold text-ink"
            >
              Manage your wallet
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
              Recovery, key export, connected sessions, and transaction approval
              are handled by MetaMask Embedded Wallets. Open the provider wallet
              to review the options your project supports.
            </p>
            <WalletSecurityActions linked={hasLinkedWallet} />
          </div>
        </div>
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
    </div>
  );
}
