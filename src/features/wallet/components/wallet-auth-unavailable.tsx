import { Pill } from "@/components/ui/pill";

/**
 * Sign-in when no Client ID is present.
 *
 * It says what is missing without naming environment variables in product UI,
 * and it adds no control that could pretend a wallet was created.
 */
export function WalletAuthUnavailable() {
  return (
    <section
      aria-labelledby="wallet-signin-title"
      className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="wallet-signin-title"
          className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl"
        >
          Your account
        </h2>
        <Pill tone="neutral" size="xs">
          Not configured
        </Pill>
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Sign-in isn&apos;t set up in this environment yet, so no account can be
        created or recovered here. Nothing on this page is linked to a real
        wallet, and any balances or activity stay labelled as preview.
      </p>
    </section>
  );
}
