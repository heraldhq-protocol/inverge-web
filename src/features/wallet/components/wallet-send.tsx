"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  CheckmarkCircle01Icon,
  InformationCircleIcon,
  LockKeyIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useState, type FormEvent } from "react";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Pill } from "@/components/ui/pill";
import { Select } from "@/components/ui/select";
import {
  isEvmAddress,
  validateDestination,
  type DestinationIssue,
} from "@/features/wallet/lib/address";
import { capabilityStatus } from "@/features/wallet/lib/capabilities";
import {
  getWalletNetwork,
  WALLET_ASSETS,
} from "@/features/wallet/lib/networks";
import {
  formatTokenAmount,
  formatTokenAmountWithSymbol,
  isInsufficient,
  parseTokenAmount,
  shortfall,
} from "@/features/wallet/lib/token-amount";
import type {
  WalletAccount,
  WalletAssetId,
  WalletBalance,
  WalletCapability,
} from "@/features/wallet/types";

type SendResult =
  { kind: "idle" } | { kind: "invalid" } | { kind: "handoff"; message: string };

function balanceFor(
  balances: readonly WalletBalance[],
  assetId: WalletAssetId,
): WalletBalance | null {
  return balances.find((balance) => balance.assetId === assetId) ?? null;
}

/**
 * Send and withdraw.
 *
 * The form does real work: it validates a Solana destination byte-for-byte,
 * parses the amount without floating point, checks the labelled sample balance,
 * and refuses a wrong-network address. What it never does is claim a transfer
 * happened. Submitting reaches a labelled handoff because signing is not
 * connected, so there is no signature, no fee, and no explorer link.
 */
export function WalletSend({
  account,
  balances,
  capabilities,
}: {
  account: WalletAccount;
  balances: readonly WalletBalance[];
  capabilities: readonly WalletCapability[];
}) {
  const [assetId, setAssetId] = useState<WalletAssetId>("USDC");
  const [destination, setDestination] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<SendResult>({ kind: "idle" });

  const asset = WALLET_ASSETS[assetId];
  const network = getWalletNetwork(account.network);
  const balance = balanceFor(balances, assetId);
  const signingStatus = capabilityStatus(capabilities, "signing");
  const decimals = asset.decimals ?? 0;

  const destinationIssue: DestinationIssue | null = submitted
    ? validateDestination(destination, account.address)
    : null;

  const parsedAtomic =
    asset.decimals === null ? null : parseTokenAmount(amountInput, decimals);

  const amountIssue = submitted
    ? amountInput.trim() === ""
      ? "Enter the amount you want to send."
      : parsedAtomic === null
        ? `Enter a positive amount with at most ${decimals} decimal places.`
        : null
    : null;

  const balanceShortfall =
    submitted && parsedAtomic !== null && balance !== null
      ? shortfall(
          {
            assetId,
            atomic: balance.atomic,
            decimals: balance.decimals,
          },
          { assetId, atomic: parsedAtomic, decimals: balance.decimals },
        )
      : null;

  const balanceIssue =
    balanceShortfall === null
      ? null
      : `This balance is short by ${formatTokenAmountWithSymbol(
          balanceShortfall,
          {
            maxFractionDigits: 2,
          },
        )}.`;

  function useMaximum() {
    if (!balance) return;
    setAmountInput(
      formatTokenAmount(
        {
          assetId,
          atomic: balance.atomic,
          decimals: balance.decimals,
        },
        { trimTrailingZeros: true },
      ).replaceAll(",", ""),
    );
    setResult({ kind: "idle" });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    const issue = validateDestination(destination, account.address);
    const atomic =
      asset.decimals === null ? null : parseTokenAmount(amountInput, decimals);

    if (issue || atomic === null) {
      setResult({ kind: "invalid" });
      return;
    }

    if (balance === null) {
      setResult({
        kind: "handoff",
        message:
          "No balance record exists for this asset, so a transfer cannot be checked or signed.",
      });
      return;
    }

    if (
      isInsufficient(
        { assetId, atomic: balance.atomic, decimals: balance.decimals },
        { assetId, atomic, decimals: balance.decimals },
      )
    ) {
      setResult({
        kind: "handoff",
        message:
          "The labelled sample balance cannot cover this amount. Nothing was signed or sent.",
      });
      return;
    }

    if (signingStatus !== "available") {
      setResult({
        kind: "handoff",
        message:
          "Wallet signing is not connected in this build, so there is no signature, no network fee, and no transfer. In the live product, your embedded wallet would ask you to approve or reject this exact destination and amount.",
      });
      return;
    }

    setResult({
      kind: "handoff",
      message:
        "This build has no provider SDK to submit a signed transfer. Nothing was sent.",
    });
  }

  const selectableAssets = Object.values(WALLET_ASSETS).filter(
    (candidate) => candidate.decimals !== null,
  );
  const assetHelp =
    asset.kind === "unsupported"
      ? asset.unavailableReason
      : `Sending ${asset.symbol} on ${network.label}.`;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <form className="space-y-5" noValidate onSubmit={submit}>
        <div>
          <h2 className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl">
            Send from this wallet
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-muted">
            A transfer leaves your wallet and goes to an external Solana
            address. It is not a contribution to a campaign and it is not
            refundable.
          </p>
        </div>

        <Field
          label="Asset"
          {...(assetHelp === null ? {} : { help: assetHelp })}
        >
          {({ id }) => (
            <Select
              id={id}
              value={assetId}
              onValueChange={(value) => {
                setAssetId(value as WalletAssetId);
                setSubmitted(false);
                setResult({ kind: "idle" });
              }}
              options={selectableAssets.map((candidate) => ({
                label: `${candidate.name} (${candidate.symbol})`,
                value: candidate.id,
              }))}
            />
          )}
        </Field>

        <Field
          label="Destination address"
          help="A Solana address. EVM addresses are a different network and are refused with that reason."
          error={destinationIssue?.message ?? null}
        >
          {({ describedBy, id, invalid }) => (
            <Input
              id={id}
              autoComplete="off"
              placeholder="Paste the recipient's Solana address"
              spellCheck={false}
              value={destination}
              aria-describedby={describedBy || undefined}
              aria-invalid={invalid || undefined}
              onChange={(event) => {
                setDestination(event.target.value);
                setResult({ kind: "idle" });
              }}
            />
          )}
        </Field>

        {destination.trim() && isEvmAddress(destination) ? (
          <p className="flex gap-2 rounded-xl border border-warning/40 bg-warning/[0.07] px-3.5 py-2.5 text-xs leading-5 text-muted">
            <HugeiconsIcon
              icon={Alert02Icon}
              size={14}
              strokeWidth={2}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-warning-strong"
            />
            Wrong network: that is an EVM address. This wallet is on{" "}
            {network.label}.
          </p>
        ) : null}

        <Field
          label={`Amount in ${asset.symbol}`}
          help={
            balance
              ? `Available: ${formatTokenAmount(
                  {
                    assetId,
                    atomic: balance.atomic,
                    decimals: balance.decimals,
                  },
                  { maxFractionDigits: 2 },
                )} ${asset.symbol}${balance.sample ? " (labelled sample)" : ""}`
              : "No balance is available for this asset."
          }
          error={amountIssue ?? null}
        >
          {({ describedBy, id, invalid }) => (
            <div className="flex gap-2">
              <Input
                id={id}
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                value={amountInput}
                aria-describedby={describedBy || undefined}
                aria-invalid={invalid || undefined}
                onChange={(event) => {
                  setAmountInput(event.target.value);
                  setResult({ kind: "idle" });
                }}
              />
              <button
                type="button"
                onClick={useMaximum}
                disabled={balance === null}
                className="shrink-0 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-ink transition-colors hover:border-brand/45 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
              >
                Max
              </button>
            </div>
          )}
        </Field>

        {balanceIssue ? (
          <p className="text-xs font-medium text-danger">{balanceIssue}</p>
        ) : null}

        {balance?.sample ? (
          <p className="flex gap-2 rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-xs leading-5 text-muted">
            <HugeiconsIcon
              icon={InformationCircleIcon}
              size={14}
              strokeWidth={1.9}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-brand-strong"
            />
            The balance on this screen is a labelled sample, not a chain read. A
            transfer cannot be built or signed against it.
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Review transfer
          </button>
          <Link
            href="/d/wallet"
            className="inline-flex min-h-11 items-center rounded-xl px-2 text-sm font-semibold text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Cancel
          </Link>
        </div>

        {result.kind === "invalid" ? (
          <div
            role="alert"
            className="rounded-2xl border border-danger/30 bg-danger/[0.06] p-4"
          >
            <p className="text-sm font-semibold text-ink">
              This transfer cannot be reviewed yet
            </p>
            <p className="mt-1 text-sm leading-6 text-muted">
              Fix the destination and amount above. Nothing was signed, sent, or
              checked against a chain.
            </p>
          </div>
        ) : null}

        {result.kind === "handoff" ? (
          <div
            role="status"
            className="rounded-2xl border border-warning/30 bg-warning/[0.07] p-4"
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <HugeiconsIcon
                icon={LockKeyIcon}
                size={16}
                strokeWidth={1.9}
                aria-hidden="true"
                className="text-warning-strong"
              />
              Transfer not submitted
            </p>
            <p className="mt-1 text-sm leading-6 text-muted">
              {result.message}
            </p>
            <p className="mt-2 text-xs leading-5 text-muted">
              The states a connected flow must show are kept separate: review,
              signature requested, signature rejected, submitted, pending,
              confirmed, and failed. This build reaches none of the on-chain
              ones.
            </p>
          </div>
        ) : null}
      </form>

      <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-border bg-canvas p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">Wallet</p>
            <Pill tone="neutral" size="xs">
              {network.shortLabel}
            </Pill>
          </div>
          <dl className="mt-2.5 space-y-2 text-xs">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <dt className="text-muted">Address</dt>
              <dd className="font-medium text-ink">
                {account.address ?? "None yet"}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <dt className="text-muted">Signing</dt>
              <dd className="font-medium text-ink">
                {signingStatus === "available" ? "Connected" : "Not connected"}
              </dd>
            </div>
          </dl>
          {account.address === null ? (
            <p className="mt-2 text-xs leading-5 text-muted">
              Destination validation and amount checks run locally. They do not
              create an account or make a transfer possible.
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-border bg-canvas p-4">
          <p className="text-sm font-semibold text-ink">Before you send</p>
          <ul className="mt-2 space-y-1.5 text-xs leading-5 text-muted">
            <li>
              Check the network: a Solana address cannot receive EVM funds.
            </li>
            <li>
              A transfer is final. Inverge cannot reverse one or recover funds
              sent to the wrong address.
            </li>
            <li>
              Keep enough SOL for the network fee. The fee is quoted by the RPC
              when signing is connected, never estimated here.
            </li>
          </ul>
        </div>

        <p className="flex items-start gap-2 text-xs leading-5 text-muted">
          <HugeiconsIcon
            icon={CheckmarkCircle01Icon}
            size={14}
            strokeWidth={2}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-brand-strong"
          />
          Inverge never asks for a private key, seed phrase, or signing share,
          and never stores one.
        </p>
      </aside>
    </div>
  );
}
