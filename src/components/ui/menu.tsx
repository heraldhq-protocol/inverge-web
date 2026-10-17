"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

/**
 * One accessible popover for the shell's header actions.
 *
 * The trigger is an icon-only button, so the caller must supply `triggerLabel`.
 * Focus moves into the panel on open and returns to the trigger on Escape, and
 * arrow keys move between `role="menuitem"` children. Clicking an item closes
 * the panel, which is what happens when a menu item is a route link.
 *
 * Deliberately dependency-free: the shell already ships without a component
 * library, and one primitive with tested keyboard behaviour is smaller than
 * adopting a positioning or headless-UI package for two menus.
 */
export function Menu({
  align = "end",
  children,
  label,
  panelClassName = "",
  triggerClassName = "",
  triggerLabel,
  trigger,
}: {
  align?: "start" | "end";
  /** Renders the panel body. Call `close` after an in-place action. */
  children: (state: { close: () => void }) => ReactNode;
  /** Accessible name for the panel itself. */
  label: string;
  panelClassName?: string;
  triggerClassName?: string;
  triggerLabel: string;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);

  const closeAndRestoreFocus = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      closeAndRestoreFocus();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeAndRestoreFocus, open]);

  // Move focus to the first item once the panel exists, so a keyboard user can
  // act without tabbing through the rest of the header.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [open]);

  function menuItems() {
    return Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ??
        [],
    );
  }

  function handlePanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const items = menuItems();
    if (items.length === 0) return;

    const current = items.indexOf(document.activeElement as HTMLElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      items[(current + 1) % items.length]?.focus();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      items[(current - 1 + items.length) % items.length]?.focus();
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      items[0]?.focus();
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      items[items.length - 1]?.focus();
      return;
    }

    if (event.key === "Tab") setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-controls={open ? panelId : undefined}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={triggerLabel}
        onClick={() => setOpen((value) => !value)}
        className={triggerClassName}
      >
        {trigger}
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          role="menu"
          aria-label={label}
          onKeyDown={handlePanelKeyDown}
          onClick={(event) => {
            if (
              (event.target as HTMLElement).closest('[role="menuitem"]') !==
              null
            ) {
              setOpen(false);
            }
          }}
          className={`absolute z-50 mt-2 min-w-64 overflow-hidden rounded-2xl border border-border bg-surface shadow-xl shadow-ink/[0.08] ${
            align === "end" ? "right-0" : "left-0"
          } ${panelClassName}`}
        >
          {children({ close })}
        </div>
      ) : null}
    </div>
  );
}

/**
 * A menu row. `href` renders a link, otherwise a button; both carry the same
 * presentation and keyboard contract.
 */
export function MenuItem({
  children,
  href,
  onSelect,
}: {
  children: ReactNode;
  href?: string;
  onSelect?: () => void;
}) {
  const className =
    "flex min-h-11 w-full items-center gap-3 px-3.5 text-left text-sm font-medium text-ink transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand";

  if (href) {
    return (
      <a href={href} role="menuitem" className={className} onClick={onSelect}>
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className={className}
    >
      {children}
    </button>
  );
}
