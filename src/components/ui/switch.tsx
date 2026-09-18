"use client";

export function Switch({
  "aria-label": ariaLabel,
  checked,
  disabled = false,
  onCheckedChange,
}: {
  "aria-label": string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={ariaLabel}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span
        className={`relative block h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-brand" : "bg-muted/35 ring-1 ring-inset ring-border"
        }`}
        aria-hidden="true"
      >
        <span
          className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform motion-reduce:transition-none ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}
