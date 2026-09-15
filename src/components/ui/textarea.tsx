import { type ComponentProps, forwardRef } from "react";

export const textareaClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-[0.9375rem] text-ink outline-none transition placeholder:text-muted/55 hover:border-muted/45 focus:border-brand focus:ring-3 focus:ring-brand/12 disabled:cursor-not-allowed disabled:opacity-50 resize-y";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  ComponentProps<"textarea">
>(function Textarea({ className = "", ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={`${textareaClass} ${className}`}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
