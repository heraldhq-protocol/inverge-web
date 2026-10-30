"use client";

import { useWalletSession } from "@solana/react-hooks";
import { useAuthTokenInfo, useWeb3AuthConnect } from "@web3auth/modal/react";
import { useSolanaWallet } from "@web3auth/modal/react/solana";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  postAuthPath,
  type OnboardingIntent,
} from "@/features/auth/lib/onboarding";
import { isSolanaAddress } from "@/features/wallet/lib/address";

/** How long the exchange waits for the provider's Solana account. */
const WALLET_WAIT_MS = 2_500;

type Phase = "idle" | "connecting" | "exchanging" | "error";

const ERROR_COPY: Record<string, string> = {
  api_not_configured:
    "Account services aren't connected in this environment yet. Nothing was created.",
  api_unreachable:
    "We couldn't reach Inverge just now. Give it a moment and try again.",
  invalid_response: "Something went wrong on our side. Please try again.",
  missing_token: "Sign-in didn't complete. Please try again.",
  session_rejected:
    "We couldn't verify that sign-in. Try again, or use the same option you signed up with.",
};

const FALLBACK_ERROR = "We couldn't finish signing you in. Please try again.";

/**
 * Opens the provider's own modal, then exchanges the resulting identity token
 * for an Inverge session through the server route.
 *
 * A provider session that is still valid is exchanged silently, so returning to
 * this page does not ask the visitor to choose a method again. The exchange is
 * attempted once per mount: retrying is an explicit action, never a loop.
 */
export function AuthSignInPanel({
  intent,
  returnPath,
}: {
  intent: OnboardingIntent;
  returnPath: string;
}) {
  const router = useRouter();
  const {
    connect,
    error: connectError,
    isConnected,
    loading: connecting,
  } = useWeb3AuthConnect();
  const { getAuthTokenInfo } = useAuthTokenInfo();
  const { accounts } = useSolanaWallet();
  const session = useWalletSession();

  const sessionAddress = session?.account.address.toString() ?? null;
  const walletAddress =
    sessionAddress && isSolanaAddress(sessionAddress)
      ? sessionAddress
      : (accounts?.find((candidate) => isSolanaAddress(candidate)) ?? null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const exchangeAttempted = useRef(false);

  const completeSignIn = useCallback(async () => {
    setPhase("exchanging");
    setErrorMessage("");

    try {
      const idToken = await getAuthTokenInfo();
      if (!idToken) throw new Error("missing_token");

      // The provider's Solana address is sent only after the client has
      // published it. The API verifies it against the identity token's wallet
      // attestation before linking it; a mismatch rejects the session rather
      // than storing an unverified address.
      const response = await fetch("/api/auth/session", {
        body: JSON.stringify({
          idToken,
          intent,
          ...(walletAddress ? { walletAddress } : {}),
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: unknown;
        } | null;
        const code = typeof body?.error === "string" ? body.error : "";
        setErrorMessage(ERROR_COPY[code] ?? FALLBACK_ERROR);
        setPhase("error");
        return;
      }

      const body = (await response.json().catch(() => null)) as {
        requiresOnboarding?: unknown;
      } | null;

      router.replace(
        postAuthPath({
          intent,
          requiresOnboarding: body?.requiresOnboarding === true,
          returnPath,
        }),
      );
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      setErrorMessage(ERROR_COPY[code] ?? FALLBACK_ERROR);
      setPhase("error");
    }
  }, [getAuthTokenInfo, intent, returnPath, router, walletAddress]);

  useEffect(() => {
    if (!isConnected || exchangeAttempted.current) return;

    // A sign-in method without a Solana wallet must still finish. The timeout
    // lets the exchange proceed, and the server decides what it can link. When
    // the address is already available, a zero-delay task keeps the exchange
    // out of the effect body.
    const timeout = window.setTimeout(
      () => {
        if (exchangeAttempted.current) return;
        exchangeAttempted.current = true;
        void completeSignIn();
      },
      walletAddress ? 0 : WALLET_WAIT_MS,
    );

    return () => window.clearTimeout(timeout);
  }, [completeSignIn, isConnected, walletAddress]);

  async function handleContinue() {
    setPhase("connecting");
    setErrorMessage("");

    const connection = await connect().catch(() => null);

    // Closing the provider modal is not an error; it just returns to the start.
    if (!connection && !exchangeAttempted.current) setPhase("idle");
  }

  function handleRetry() {
    exchangeAttempted.current = true;
    void completeSignIn();
  }

  const busy = phase === "connecting" || phase === "exchanging" || connecting;

  return (
    <div className="space-y-5">
      <section
        aria-labelledby="wallet-signin-title"
        className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
      >
        <h2
          id="wallet-signin-title"
          className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl"
        >
          Your account
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-muted">
          Pick Google, email, or a wallet in the next step. First time?
          We&apos;ll create your account as you go.
        </p>

        <Button
          aria-busy={busy}
          className="mt-4 w-full"
          disabled={busy}
          onClick={() => void handleContinue()}
          size="lg"
        >
          {phase === "connecting"
            ? "Opening sign-in…"
            : phase === "exchanging"
              ? "Signing you in…"
              : "Continue"}
        </Button>

        <p className="mt-3 text-xs leading-5 text-muted">
          Use the same option each time so you always come back to the same
          account.
        </p>

        {intent === "creator" ? (
          <p className="mt-3 rounded-xl bg-canvas px-3 py-2 text-xs leading-5 text-ink">
            Here to build? Creator setup comes next, one step at a time.
          </p>
        ) : null}

        <p
          aria-live="polite"
          className="mt-3 min-h-5 text-xs leading-5 text-danger"
        >
          {phase === "error"
            ? errorMessage
            : connectError
              ? "We couldn't open the sign-in window. Please try again."
              : ""}
        </p>

        {phase === "error" ? (
          <Button
            className="mt-1 w-full"
            onClick={handleRetry}
            size="sm"
            variant="secondary"
          >
            Try again
          </Button>
        ) : null}
      </section>

      <p className="text-center text-xs leading-5 text-muted">
        By continuing, you agree to our{" "}
        <Link
          href="/terms"
          className="font-medium text-ink underline underline-offset-3"
        >
          Terms of Use
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="font-medium text-ink underline underline-offset-3"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
