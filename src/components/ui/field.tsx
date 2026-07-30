'use client';

import React, { useId, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Form field. Label **above** the control, always visible — a placeholder is never a label
 * (app-mockup-kit §6).
 *
 * Validation runs on blur, never while typing: premature validation reads as scolding. An invalid field
 * gets a red-tinted wash **plus** a message beneath it, not a red border alone, so it stays findable in a
 * long form and does not depend on colour (WCAG 1.4.1).
 *
 * `help` is coaching, not instruction: it tells a creator what a good answer contains
 * (pitch-narrative-playbook.md §4).
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
  /** Soft character count. Never a hard limit — a cut-off sentence is worse than a long one. */
  counter?: { value: number; target: number };
  children: (props: { id: string; invalid: boolean; describedBy: string }) => React.ReactNode;
}) {
  const id = useId();
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const invalid = Boolean(error);
  const describedBy = [help ? helpId : null, error ? errorId : null].filter(Boolean).join(' ');

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
          {optional && <span className="ml-1.5 text-xs font-normal text-ink-muted">optional</span>}
        </label>
        {counter && (
          <span
            className={cn(
              'text-xs tabular-nums',
              counter.value > counter.target ? 'text-ink-muted' : 'text-ink-muted/70'
            )}
          >
            {counter.value}/{counter.target}
          </span>
        )}
      </div>

      {help && (
        <p id={helpId} className="mt-1 text-xs leading-relaxed text-ink-muted">
          {help}
        </p>
      )}

      <div className="mt-1.5">{children({ id, invalid, describedBy })}</div>

      {error && (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-danger-700">
          {error}
        </p>
      )}
    </div>
  );
}

/** Shared control styling so inputs, textareas and selects cannot drift apart. */
export function controlClass(invalid: boolean, extra?: string): string {
  return cn(
    'w-full min-h-11 rounded-lg border px-3 py-2.5 text-sm text-ink transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1',
    invalid ? 'border-danger/50 bg-danger-50' : 'border-border bg-surface',
    extra
  );
}

/** A titled group of fields. Long forms are grouped into sections, not one endless scroll. */
export function FieldSet({
  legend,
  description,
  children,
}: {
  legend: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-xl border border-border bg-surface p-5">
      <legend className="px-1 font-display text-base font-bold tracking-tight text-ink">
        {legend}
      </legend>
      {description && <p className="mb-4 mt-1 text-xs leading-relaxed text-ink-muted">{description}</p>}
      <div className="space-y-5">{children}</div>
    </fieldset>
  );
}

/** Tracks which fields have been left, so errors only appear after a first blur. */
export function useTouched<K extends string>() {
  const [touched, setTouched] = useState<Partial<Record<K, boolean>>>({});
  return {
    touched,
    touch: (key: K) => setTouched((t) => ({ ...t, [key]: true })),
    touchAll: (keys: K[]) =>
      setTouched(Object.fromEntries(keys.map((k) => [k, true])) as Partial<Record<K, boolean>>),
  };
}
