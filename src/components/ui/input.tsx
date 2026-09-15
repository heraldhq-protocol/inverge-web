import { type ComponentProps, forwardRef } from "react";

export const inputClass =
  "min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-[0.9375rem] text-ink outline-none transition placeholder:text-muted/55 hover:border-muted/45 focus:border-brand focus:ring-3 focus:ring-brand/12 disabled:cursor-not-allowed disabled:opacity-50";

export const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  function Input({ className = "", ...props }, ref) {
    return (
      <input ref={ref} className={`${inputClass} ${className}`} {...props} />
    );
  },
);
Input.displayName = "Input";
