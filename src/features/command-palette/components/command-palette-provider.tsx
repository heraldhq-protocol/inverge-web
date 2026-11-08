"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { CommandPalette } from "@/features/command-palette/components/command-palette";
import { commandsFor } from "@/features/command-palette/lib/commands";
import type { PaletteContext } from "@/features/command-palette/types";

type CommandPaletteController = {
  close: () => void;
  isOpen: boolean;
  open: () => void;
};

const CommandPaletteContext = createContext<CommandPaletteController | null>(
  null,
);

export function useCommandPalette(): CommandPaletteController {
  const controller = useContext(CommandPaletteContext);
  if (!controller) {
    throw new Error(
      "useCommandPalette must be used inside CommandPaletteProvider",
    );
  }
  return controller;
}

function shortcutLabelForPlatform(): string {
  const platform = navigator.platform || navigator.userAgent;
  return /mac|iphone|ipad|ipod/i.test(platform) ? "⌘K" : "Ctrl K";
}

function subscribeToPlatform(): () => void {
  return () => {};
}

/**
 * Reads the platform hint without a mount effect. The server snapshot is the
 * Windows/Linux form; React swaps in the client value after hydration.
 */
export function useCommandShortcutLabel(): string {
  return useSyncExternalStore(
    subscribeToPlatform,
    shortcutLabelForPlatform,
    () => "Ctrl K",
  );
}

export function CommandPaletteProvider({
  children,
  context,
  includeOwnSearch = false,
  signedIn,
  unreadCount = 0,
}: {
  children: ReactNode;
  context: PaletteContext;
  /** Product only: request the viewer's own ideas and campaigns. */
  includeOwnSearch?: boolean;
  signedIn: boolean;
  unreadCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const openRef = useRef(open);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const commands = useMemo(
    () => commandsFor({ context, signedIn, unreadCount }),
    [context, signedIn, unreadCount],
  );

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const rememberFocus = useCallback(() => {
    const active = document.activeElement;
    returnFocusRef.current = active instanceof HTMLElement ? active : null;
  }, []);

  const openPalette = useCallback(() => {
    if (!openRef.current) rememberFocus();
    openRef.current = true;
    setOpen(true);
  }, [rememberFocus]);

  const closePalette = useCallback(() => {
    openRef.current = false;
    setOpen(false);
  }, []);

  // One listener for the whole shell. The palette is a singleton, so a second
  // mount cannot double-toggle it.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) return;
      if (event.key.toLowerCase() !== "k") return;
      if (!event.ctrlKey && !event.metaKey) return;
      if (event.altKey || event.shiftKey) return;

      event.preventDefault();
      if (openRef.current) {
        closePalette();
      } else {
        openPalette();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closePalette, openPalette]);

  // Returning focus to whatever opened the palette is part of the dialog
  // contract. A trigger inside a collapsed mobile menu may already be gone, so
  // only restore a node that is still in the document.
  useEffect(() => {
    if (!open) return;
    const returnTo = returnFocusRef.current;
    return () => {
      if (returnTo?.isConnected) returnTo.focus();
    };
  }, [open]);

  const controller = useMemo<CommandPaletteController>(
    () => ({ close: closePalette, isOpen: open, open: openPalette }),
    [closePalette, open, openPalette],
  );

  return (
    <CommandPaletteContext.Provider value={controller}>
      {children}
      <CommandPalette
        commands={commands}
        context={context}
        includeOwnSearch={includeOwnSearch}
        onClose={closePalette}
        open={open}
      />
    </CommandPaletteContext.Provider>
  );
}
