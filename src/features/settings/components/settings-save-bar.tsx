import { AlertCircle, CheckCircle2, CircleDashed, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export type SettingsSaveState = "idle" | "dirty" | "saving" | "saved" | "error";

/**
 * Trailing action strip for a settings form.
 *
 * `saving`, `saved` and `error` describe a real request. The server's message is
 * shown on failure; the form keeps its entered values so a retry does not make
 * the person type everything again.
 */
export function SettingsSaveBar({
  children,
  errorMessage,
  idleMessage,
  savedMessage = "Saved",
  state,
}: {
  children: ReactNode;
  errorMessage?: string;
  idleMessage: string;
  savedMessage?: string;
  state: SettingsSaveState;
}) {
  const message =
    state === "saved"
      ? savedMessage
      : state === "saving"
        ? "Saving…"
        : state === "error"
          ? (errorMessage ?? "Could not save. Try again.")
          : state === "dirty"
            ? "Unsaved changes"
            : idleMessage;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/70 bg-surface-muted/45 px-4 py-3.5 sm:px-5">
      {children}
      <p
        aria-live="polite"
        className={`flex min-h-5 items-center gap-1.5 text-xs leading-5 ${
          state === "dirty"
            ? "font-medium text-warning-strong"
            : state === "saved"
              ? "font-medium text-brand-strong"
              : state === "error"
                ? "font-medium text-danger"
                : "text-muted"
        }`}
      >
        {state === "saved" ? (
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
        ) : state === "dirty" ? (
          <CircleDashed className="size-4 shrink-0" aria-hidden="true" />
        ) : state === "saving" ? (
          <Loader2
            className="size-4 shrink-0 motion-safe:animate-spin"
            aria-hidden="true"
          />
        ) : state === "error" ? (
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
        ) : null}
        {message}
      </p>
    </div>
  );
}
