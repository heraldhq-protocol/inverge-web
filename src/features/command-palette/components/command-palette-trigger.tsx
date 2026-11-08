"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

import {
  useCommandPalette,
  useCommandShortcutLabel,
} from "@/features/command-palette/components/command-palette-provider";

/**
 * The visible entry point. It is a button, not an input: the dialog owns the
 * text field, so clicking the affordance opens one focus surface instead of
 * duplicating query state in the header.
 */
export function CommandPaletteTrigger({
  className = "",
  onBeforeOpen,
  variant = "field",
}: {
  className?: string;
  /** Used to close a surrounding mobile menu before the dialog opens. */
  onBeforeOpen?: () => void;
  variant?: "field" | "icon";
}) {
  const { open } = useCommandPalette();
  const shortcut = useCommandShortcutLabel();

  function handleClick() {
    onBeforeOpen?.();
    open();
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K"
        aria-label="Search ideas, campaigns, and pages"
        onClick={handleClick}
        className={`grid size-11 shrink-0 place-items-center rounded-full text-ink transition-colors hover:bg-surface hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${className}`}
      >
        <HugeiconsIcon
          icon={Search01Icon}
          size={20}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-keyshortcuts="Control+K Meta+K"
      aria-label="Search ideas, creators, or topics"
      onClick={handleClick}
      className={`group flex min-h-10 w-full items-center gap-2 rounded-full border border-border bg-surface py-1 pl-3.5 pr-1.5 text-left text-sm text-muted transition-[border-color,background-color] hover:border-border-strong hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${className}`}
    >
      <HugeiconsIcon
        icon={Search01Icon}
        size={16}
        strokeWidth={1.8}
        aria-hidden="true"
        className="shrink-0 text-muted"
      />
      <span className="min-w-0 flex-1 truncate">
        Search ideas, creators, or topics
      </span>
      <kbd className="hidden shrink-0 items-center rounded-full border border-border bg-canvas px-2 py-1 text-[0.625rem] font-semibold tracking-wide text-muted sm:inline-flex">
        {shortcut}
      </kbd>
    </button>
  );
}
