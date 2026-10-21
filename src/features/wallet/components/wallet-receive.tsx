import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  CreditCardIcon,
  InformationCircleIcon,
  LockKeyIcon,
  QrCodeIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Pill } from "@/components/ui/pill";
import { PrototypeNotice } from "@/features/campaigns/components/prototype-notice";
import {
  CapabilityStatusPill,
  WalletStatusPill,
} from "@/features/wallet/components/wallet-status-pill";
import { capabilityStatus } from "@/features/wallet/lib/capabilities";
import {
  getWalletNetwork,
  WALLET_ASSETS,
} from "@/features/wallet/lib/networks";
import { evaluateOnRampQuote } from "@/features/wallet/lib/quote";
import type { WalletView } from "@/features/wallet/types";

/**
 * Receive and deposit.
 *
 * There is no address, so there is no address to copy and no QR code to draw. A
 * generated keypair or a made-up code would be the single most dangerous thing
 * this page could do: someone could send real money to it. Instead the page
 * names the missing provider step and shows the assets only where their
 * parameters are actually known.
 */
export function WalletReceive({ view }: { view: WalletView }) {
  const network = getWalletNetwork(view.account.network);
  const receiveStatus = capabilityStatus(view.capabilities, "receive");
  const onRampStatus = capabilityStatus(view.capabilities, "on-ramp");
  const quote = evaluateOnRampQuote(null, "");

  const assets = Object.values(WALLET_ASSETS);

  return (
    <div className="space-y-7">
      <section aria-labelledby="receive-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              id="receive-title"
              className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl"
            >
              Receive USDC or SOL
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-muted">
              On {network.label}, a deposit is sent to your wallet&apos;s public
              address. This build has no such address.
            </p>
          </div>
          <CapabilityStatusPill status={receiveStatus} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-canvas px-5 py-10 text-center">
              <span
                aria-hidden="true"
                className="grid size-12 place-items-center rounded-2xl bg-ink/[0.06] text-muted"
              >
                <HugeiconsIcon icon={QrCodeIcon} size={24} strokeWidth={1.6} />
              </span>
              <p className="mt-3 text-sm font-semibold text-ink">
                No receiving address exists
              </p>
              <p className="mt-1 max-w-sm text-xs leading-5 text-muted">
                This build has no embedded-wallet SDK and no provider account,
                so there is nothing to show. It does not generate an address, a
                QR code, or a deposit memo to fill the space.
              </p>
              <div className="mt-3">
                <WalletStatusPill state={view.account.provisioning} size="xs" />
              </div>
            </div>

            <div className="mt-4 flex gap-2.5 rounded-xl border border-border bg-canvas p-3.5">
              <HugeiconsIcon
                icon={LockKeyIcon}
                size={16}
                strokeWidth={1.8}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-brand-strong"
              />
              <p className="text-xs leading-5 text-muted">
                Never share a private key, seed phrase, or signing share with
                anyone, including someone claiming to be Inverge support. This
                product never asks for one, and no wallet address is ever used
                as your Inverge account identifier.
              </p>
            </div>
          </div>

          <aside className="space-y-3">
            <div className="rounded-2xl border border-border bg-canvas p-4">
              <p className="text-sm font-semibold text-ink">
                What a real deposit needs
              </p>
              <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-xs leading-5 text-muted">
                <li>An authenticated Inverge session tied to your user id.</li>
                <li>
                  A MetaMask Embedded Wallets account provisioned for that user.
                </li>
                <li>
                  The provider&apos;s public address, read on the server and
                  bound to the session.
                </li>
                <li>
                  A balance read from the configured RPC endpoint, not a
                  fixture.
                </li>
              </ol>
            </div>

            <div className="rounded-2xl border border-border bg-canvas p-4">
              <p className="text-sm font-semibold text-ink">Network</p>
              <p className="mt-1 text-sm text-ink">{network.label}</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                Devnet is the default. This repository performs no production
                chain writes and will not default a preview into mainnet.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section aria-labelledby="assets-title">
        <h2
          id="assets-title"
          className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl"
        >
          Assets
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-5 text-muted">
          Listed only where the asset&apos;s parameters are known. An asset the
          product names but this build cannot build a transfer for stays visibly
          unsupported.
        </p>

        <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-surface">
          <ul className="divide-y divide-border">
            {assets.map((asset) => (
              <li
                key={asset.id}
                className="flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5"
              >
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
                    {asset.name}
                    <span className="text-xs font-medium text-muted">
                      {asset.symbol}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-muted">
                    {asset.kind === "unsupported"
                      ? asset.unavailableReason
                      : asset.funding
                        ? "Can fund a campaign contribution when signing is connected."
                        : asset.unavailableReason}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Pill tone="neutral" size="xs">
                    {asset.decimals === null
                      ? "Decimals unverified"
                      : `${asset.decimals} decimals`}
                  </Pill>
                  <Pill
                    tone={asset.kind === "unsupported" ? "warning" : "neutral"}
                    size="xs"
                  >
                    {asset.kind === "unsupported"
                      ? "Not supported"
                      : asset.funding
                        ? "Funding asset"
                        : "Fees only"}
                  </Pill>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="on-ramp-title" id="on-ramp">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              id="on-ramp-title"
              className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl"
            >
              Card or bank funding
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-muted">
              A licensed on-ramp converts your money into USDC before it can
              fund a campaign.
            </p>
          </div>
          <CapabilityStatusPill status={onRampStatus} />
        </div>

        <div className="mt-4">
          <PrototypeNotice title="No on-ramp provider is configured">
            {quote.reason} Nothing on this page is a quote, a fee, or a rate,
            and no card session can start.
          </PrototypeNotice>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={CreditCardIcon}
                size={17}
                strokeWidth={1.8}
                aria-hidden="true"
                className="text-brand-strong"
              />
              <p className="text-sm font-semibold text-ink">Card</p>
            </div>
            <p className="mt-1.5 text-xs leading-5 text-muted">
              A card payment needs a provider-hosted session, a live quote with
              its own expiry, and a webhook that Inverge verifies before it
              treats the payment as confirmed. None of those exists in this
              build.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={InformationCircleIcon}
                size={17}
                strokeWidth={1.8}
                aria-hidden="true"
                className="text-brand-strong"
              />
              <p className="text-sm font-semibold text-ink">Bank transfer</p>
            </div>
            <p className="mt-1.5 text-xs leading-5 text-muted">
              A bank transfer needs the same provider contract and a verified
              settlement event. No account number, reference, or transfer
              instruction is invented here.
            </p>
          </div>
        </div>

        <p className="mt-3 flex gap-2 text-xs leading-5 text-muted">
          <HugeiconsIcon
            icon={Alert02Icon}
            size={14}
            strokeWidth={2}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-warning-strong"
          />
          An expired quote is never charged at its old rate. When a provider is
          connected, this route must request a fresh quote before continuing.
        </p>
      </section>

      <p className="text-xs leading-5 text-muted">
        Looking for your contribution history?{" "}
        <Link
          href="/d/wallet/activity"
          className="font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Open activity
        </Link>
        .
      </p>
    </div>
  );
}
