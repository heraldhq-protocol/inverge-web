"use client";

import { useId, useState, type ReactNode } from "react";

/**
 * Form field. Label **above** the control, always visible — a placeholder is
 * never a label.
 *
 * Validation runs on blur, never while typing: premature validation reads as
 * scolding. An invalid field gets a tinted wash **plus** a message beneath it,
 * not a red border alone, so it stays findable in a long form and does not
 * depend on colour (WCAG 1.4.1).
 *
 * `help` is coaching, not instruction: it tells a creator what a good answer
 * contains.
 */
export function Field({
  label,
  help,
  error,
  optional,
  counter,
  children,
}: {
  label: string;
  help?: string;
  error?: string | null;
  optional?: boolean;
  /** Soft character count. Never a hard limit — a cut-off sentence is worse. */
  counter?: { value: number; target: number };
  children: (props: {
    id: string;
    invalid: boolean;
    describedBy: string;
  }) => ReactNode;
}) {
  const id = useId();
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const invalid = Boolean(error);
  const describedBy = [help ? helpId : null, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
          {optional ? (
            <span className="ml-1.5 text-xs font-normal text-muted">
              optional
            </span>
          ) : null}
        </label>
        {counter ? (
          // A soft target, never a limit: going past it is a hint to tighten, not
          // a failure, so it stays in the ink ramp. Red here would compete with
          // the actual error state below.
          <span
            className={`shrink-0 text-xs tabular-nums ${
              counter.value > counter.target
                ? "font-semibold text-ink"
                : "text-muted/70"
            }`}
            title={
              counter.value > counter.target
                ? `Aim for about ${counter.target} characters. Longer is allowed, but cards show the first two lines.`
                : undefined
            }
          >
            {counter.value}/{counter.target}
          </span>
        ) : null}
      </div>

      {help ? (
        <p id={helpId} className="mt-1 text-xs leading-relaxed text-muted">
          {help}
        </p>
      ) : null}

      <div className="mt-1.5">{children({ id, invalid, describedBy })}</div>

      {error ? (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Shared control styling so inputs, textareas and selects cannot drift apart. */
export function controlClass(invalid: boolean, extra = ""): string {
  const base =
    "min-h-12 w-full rounded-xl border bg-surface px-4 text-[0.9375rem] text-ink outline-none transition placeholder:text-muted/55 focus:ring-3";

  return invalid
    ? `${base} border-danger focus:border-danger focus:ring-danger/12 ${extra}`
    : `${base} border-border hover:border-muted/45 focus:border-brand focus:ring-brand/12 ${extra}`;
}

/** A titled group of fields. Long forms are grouped into sections, not one endless scroll. */
export function FieldSet({
  legend,
  description,
  children,
}: {
  legend: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="rounded-xl border border-border bg-surface p-5">
      <legend className="px-1 text-base font-bold tracking-tight text-ink">
        {legend}
      </legend>
      {description ? (
        <p className="mb-4 mt-1 text-xs leading-relaxed text-muted">
          {description}
        </p>
      ) : null}
      <div className="space-y-5">{children}</div>
    </fieldset>
  );
}

/** Tracks which fields have been left, so errors only appear after a first blur. */
export function useTouched<K extends string>() {
  const [touched, setTouched] = useState<Partial<Record<K, boolean>>>({});

  return {
    touched,
    touch: (key: K) => setTouched((current) => ({ ...current, [key]: true })),
    touchAll: (keys: K[]) =>
      setTouched(
        Object.fromEntries(keys.map((key) => [key, true])) as Partial<
          Record<K, boolean>
        >,
      ),
  };
}
