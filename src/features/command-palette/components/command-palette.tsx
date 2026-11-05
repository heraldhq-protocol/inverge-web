"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  AlertCircleIcon,
  ArrowRight02Icon,
  Cancel01Icon,
  Idea01Icon,
  Megaphone01Icon,
  Search01Icon,
  SearchXIcon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";

import { useCommandShortcutLabel } from "@/features/command-palette/components/command-palette-provider";
import { filterCommands } from "@/features/command-palette/lib/fuzzy";
import type {
  PaletteCommand,
  PaletteContext,
} from "@/features/command-palette/types";
import { requestSearch } from "@/features/search/lib/request";
import type { SearchHit, SearchPayload } from "@/features/search/types";

type PaletteOption = {
  description?: string | undefined;
  domId: string;
  href: string;
  icon: IconSvgElement;
  isOwn?: boolean | undefined;
  key: string;
  label: string;
};

type PaletteGroup = {
  id: string;
  label: string;
  options: PaletteOption[];
};

type SearchStatus = "idle" | "loading" | "ready" | "error";

const MIN_REMOTE_QUERY = 2;

const SEARCH_DEBOUNCE_MS = 220;

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function commandOption(command: PaletteCommand, baseId: string): PaletteOption {
  return {
    description: command.description,
    domId: `${baseId}-command-${slug(command.id)}`,
    href: command.href,
    icon: command.icon,
    key: `command-${command.id}`,
    label: command.label,
  };
}

function hitOption(hit: SearchHit, baseId: string): PaletteOption {
  return {
    description: hit.subtitle || undefined,
    domId: `${baseId}-hit-${hit.kind}-${slug(hit.id)}`,
    href: hit.href,
    icon: hit.kind === "idea" ? Idea01Icon : Megaphone01Icon,
    isOwn: hit.isOwn,
    key: `hit-${hit.kind}-${hit.id}`,
    label: hit.title,
  };
}

function buildGroups(
  commands: readonly PaletteCommand[],
  payload: SearchPayload | null,
  baseId: string,
): PaletteGroup[] {
  const groups: PaletteGroup[] = [];

  for (const command of commands) {
    const existing = groups.find((group) => group.label === command.group);
    const option = commandOption(command, baseId);
    if (existing) {
      existing.options.push(option);
    } else {
      groups.push({
        id: `commands-${slug(command.group)}`,
        label: command.group,
        options: [option],
      });
    }
  }

  if (!payload) return groups;

  const groupsFor = [
    {
      hits: payload.ideas.filter((hit) => hit.isOwn),
      id: "your-ideas",
      label: "Your ideas",
    },
    {
      hits: payload.campaigns.filter((hit) => hit.isOwn),
      id: "your-campaigns",
      label: "Your campaigns",
    },
    {
      hits: payload.ideas.filter((hit) => !hit.isOwn),
      id: "ideas",
      label: "Ideas",
    },
    {
      hits: payload.campaigns.filter((hit) => !hit.isOwn),
      id: "campaigns",
      label: "Campaigns",
    },
  ];

  for (const group of groupsFor) {
    if (group.hits.length === 0) continue;
    groups.push({
      id: group.id,
      label: group.label,
      options: group.hits.map((hit) => hitOption(hit, baseId)),
    });
  }

  return groups;
}

/**
 * The one search surface.
 *
 * The dialog owns the query; the header only opens it. Local commands filter
 * instantly while content results come from the API through `/api/search`,
 * debounced and cancelled on every keystroke. Focus stays on the input and the
 * listbox is driven by `aria-activedescendant`, which is the pattern screen
 * readers expect from a combobox.
 */
export function CommandPalette({
  commands,
  context,
  includeOwnSearch,
  onClose,
  open,
}: {
  commands: readonly PaletteCommand[];
  context: PaletteContext;
  includeOwnSearch: boolean;
  onClose: () => void;
  open: boolean;
}) {
  if (!open) return null;

  return (
    <CommandPaletteDialog
      commands={commands}
      context={context}
      includeOwnSearch={includeOwnSearch}
      onClose={onClose}
    />
  );
}

function CommandPaletteDialog({
  commands,
  context,
  includeOwnSearch,
  onClose,
}: {
  commands: readonly PaletteCommand[];
  context: PaletteContext;
  includeOwnSearch: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const sequenceRef = useRef(0);
  const baseId = `palette-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const listboxId = `${baseId}-listbox`;
  const titleId = `${baseId}-title`;
  const shortcut = useCommandShortcutLabel();

  const [query, setQuery] = useState("");
  const [payload, setPayload] = useState<SearchPayload | null>(null);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [retryNonce, setRetryNonce] = useState(0);

  const trimmedQuery = query.trim();

  const localMatches = useMemo(
    () => filterCommands(commands, query),
    [commands, query],
  );

  const groups = useMemo(
    () => buildGroups(localMatches, payload, baseId),
    [baseId, localMatches, payload],
  );

  const flatOptions = useMemo(
    () => groups.flatMap((group) => group.options),
    [groups],
  );

  const safeActiveIndex =
    flatOptions.length === 0
      ? 0
      : Math.min(activeIndex, flatOptions.length - 1);
  const activeOption = flatOptions[safeActiveIndex] ?? null;

  const contentResultCount =
    (payload?.ideas.length ?? 0) + (payload?.campaigns.length ?? 0);

  const announcement = !trimmedQuery
    ? ""
    : status === "loading"
      ? "Searching ideas and campaigns"
      : status === "error"
        ? "Search is unavailable"
        : status === "ready"
          ? contentResultCount === 0
            ? `No results for ${trimmedQuery}`
            : `${contentResultCount} ${
                contentResultCount === 1 ? "result" : "results"
              } for ${trimmedQuery}`
          : "";

  // The dialog mounts on every open, so the query, results, and active row
  // start clean without a reset effect.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, []);

  useEffect(() => {
    if (!activeOption) return;
    const node = document.getElementById(activeOption.domId);
    node?.scrollIntoView?.({ block: "nearest" });
  }, [activeOption]);

  useEffect(() => {
    const sequence = ++sequenceRef.current;

    if (trimmedQuery.length < MIN_REMOTE_QUERY) return;

    const controller = new AbortController();

    const timer = window.setTimeout(() => {
      requestSearch(trimmedQuery, {
        includeOwn: includeOwnSearch,
        signal: controller.signal,
      })
        .then((next) => {
          if (sequence !== sequenceRef.current) return;
          setPayload(next);
          setStatus("ready");
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted || sequence !== sequenceRef.current) {
            return;
          }
          setStatus("error");
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Search is unavailable right now.",
          );
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [includeOwnSearch, retryNonce, trimmedQuery]);

  const choose = useCallback(
    (option: PaletteOption) => {
      onClose();
      router.push(option.href);
    },
    [onClose, router],
  );

  function updateQuery(next: string) {
    const nextTrimmed = next.trim();
    setQuery(next);

    if (nextTrimmed === trimmedQuery) return;

    setActiveIndex(0);
    setPayload(null);
    setErrorMessage("");
    setStatus(nextTrimmed.length >= MIN_REMOTE_QUERY ? "loading" : "idle");
  }

  function retrySearch() {
    setPayload(null);
    setStatus("loading");
    setErrorMessage("");
    setRetryNonce((value) => value + 1);
  }

  function handlePanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key === "Tab") {
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }

    // Arrow/Enter handling belongs to the combobox input, not to the close or
    // retry buttons that can also live in the dialog.
    if (event.target !== inputRef.current) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (flatOptions.length === 0) return;
      setActiveIndex((safeActiveIndex + 1) % flatOptions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (flatOptions.length === 0) return;
      setActiveIndex(
        (safeActiveIndex - 1 + flatOptions.length) % flatOptions.length,
      );
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(Math.max(0, flatOptions.length - 1));
      return;
    }

    if (event.key === "Enter") {
      if (!activeOption) return;
      event.preventDefault();
      choose(activeOption);
    }
  }

  function handleBackdropMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  const placeholder =
    context === "admin"
      ? "Search or jump to…"
      : "Search ideas, campaigns, or jump to…";

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex justify-center overflow-y-auto bg-contrast/40 p-0 backdrop-blur-[2px] motion-safe:animate-[inv-fade-in_120ms_ease-out] sm:p-6 sm:pt-[8vh]"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handlePanelKeyDown}
        className="relative flex h-dvh w-screen flex-col overflow-hidden border-border bg-surface shadow-2xl shadow-contrast/20 motion-safe:animate-[inv-dialog-in_160ms_ease-out] sm:h-auto sm:max-h-[min(80dvh,44rem)] sm:w-full sm:max-w-[42rem] sm:rounded-2xl sm:border"
      >
        <h2 id={titleId} className="sr-only">
          Search Inverge
        </h2>

        <div className="flex items-center gap-2 border-b border-border px-4 py-3 sm:px-5">
          <HugeiconsIcon
            icon={Search01Icon}
            size={19}
            strokeWidth={1.8}
            aria-hidden="true"
            className="shrink-0 text-muted"
          />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-activedescendant={activeOption?.domId}
            aria-label="Search ideas, campaigns, and pages"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            placeholder={placeholder}
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            className="min-h-11 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted/75 sm:min-h-9 sm:text-sm"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                updateQuery("");
                inputRef.current?.focus();
              }}
              className="grid size-11 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-brand sm:size-8"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                size={15}
                strokeWidth={2}
                aria-hidden="true"
              />
            </button>
          ) : null}
          <button
            type="button"
            aria-label="Close search"
            onClick={onClose}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-canvas text-muted transition-colors hover:border-border-strong hover:text-ink focus-visible:outline-2 focus-visible:outline-brand sm:size-8"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={15}
              strokeWidth={2}
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2 sm:px-3">
          <div
            id={listboxId}
            role="listbox"
            aria-label="Search results"
            aria-busy={status === "loading"}
          >
            {groups.map((group) => (
              <div
                key={group.id}
                role="group"
                aria-labelledby={`${baseId}-${group.id}-label`}
                className="pb-1"
              >
                <p
                  id={`${baseId}-${group.id}-label`}
                  className="px-3 pb-1 pt-3 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-muted"
                >
                  {group.label}
                </p>
                <ul role="presentation">
                  {group.options.map((option) => {
                    const index = flatOptions.findIndex(
                      (candidate) => candidate.key === option.key,
                    );
                    const active = index === safeActiveIndex;

                    return (
                      <li
                        key={option.key}
                        id={option.domId}
                        role="option"
                        aria-selected={active}
                        onMouseDown={(event) => event.preventDefault()}
                        onMouseMove={() => setActiveIndex(index)}
                        onClick={() => choose(option)}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                          active
                            ? "bg-brand-soft/70 text-ink"
                            : "text-ink-soft hover:bg-canvas"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`grid size-8 shrink-0 place-items-center rounded-lg transition-colors ${
                            active
                              ? "bg-brand text-white"
                              : "bg-brand-tint text-brand-strong"
                          }`}
                        >
                          <HugeiconsIcon
                            icon={option.icon}
                            size={16}
                            strokeWidth={1.8}
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-ink">
                              {option.label}
                            </span>
                            {option.isOwn ? (
                              <span className="shrink-0 rounded-full bg-brand-soft px-1.5 py-0.5 text-[0.5625rem] font-bold uppercase tracking-[0.08em] text-brand-strong">
                                Yours
                              </span>
                            ) : null}
                          </span>
                          {option.description ? (
                            <span className="mt-0.5 block truncate text-xs text-muted">
                              {option.description}
                            </span>
                          ) : null}
                        </span>
                        <HugeiconsIcon
                          icon={ArrowRight02Icon}
                          size={15}
                          strokeWidth={1.8}
                          aria-hidden="true"
                          className={`shrink-0 transition-opacity ${
                            active
                              ? "text-brand-strong opacity-100"
                              : "opacity-0"
                          }`}
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {status === "loading" ? (
            <div className="px-1 py-2" aria-hidden="true">
              <p className="px-2 py-1 text-xs text-muted">
                Searching ideas and campaigns…
              </p>
              {[0, 1, 2].map((row) => (
                <div
                  key={row}
                  className="flex items-center gap-3 px-2 py-2.5 motion-safe:animate-pulse"
                >
                  <span className="size-8 shrink-0 rounded-lg bg-canvas" />
                  <span className="min-w-0 flex-1 space-y-1.5">
                    <span className="block h-2.5 w-2/5 rounded-full bg-canvas" />
                    <span className="block h-2 w-3/5 rounded-full bg-canvas" />
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {status === "error" ? (
            <div
              role="alert"
              className="mx-1 my-2 rounded-xl border border-border bg-canvas px-4 py-3"
            >
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                <HugeiconsIcon
                  icon={AlertCircleIcon}
                  size={17}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="text-danger"
                />
                {errorMessage}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted">
                Navigation still works. Retry the content search when the
                connection is back.
              </p>
              <button
                type="button"
                onClick={retrySearch}
                className="mt-2 inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink transition-colors hover:border-brand/40 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-brand sm:min-h-9"
              >
                Try again
              </button>
            </div>
          ) : null}

          {status === "ready" &&
          contentResultCount === 0 &&
          localMatches.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <span className="mx-auto grid size-10 place-items-center rounded-full bg-canvas text-muted">
                <HugeiconsIcon
                  icon={SearchXIcon}
                  size={20}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </span>
              <p className="mt-3 text-sm font-semibold text-ink">
                No matches for “{trimmedQuery}”
              </p>
              <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-muted">
                Try an idea title, a campaign, or a creator&apos;s name.
              </p>
            </div>
          ) : null}

          {trimmedQuery.length > 0 &&
          trimmedQuery.length < MIN_REMOTE_QUERY &&
          localMatches.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              Keep typing to search ideas and campaigns.
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-canvas/60 px-4 py-2.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3 text-[0.6875rem] text-muted">
            <span className="hidden items-center gap-1.5 sm:flex">
              <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-sans text-[0.625rem] font-semibold text-ink-soft">
                ↑
              </kbd>
              <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-sans text-[0.625rem] font-semibold text-ink-soft">
                ↓
              </kbd>
              Navigate
            </span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-sans text-[0.625rem] font-semibold text-ink-soft">
                ↵
              </kbd>
              Open
            </span>
            <span className="flex items-center gap-1.5 sm:hidden">
              Tap a result to open
            </span>
          </div>
          <span className="hidden shrink-0 items-center gap-1.5 text-[0.6875rem] text-muted sm:flex">
            <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-sans text-[0.625rem] font-semibold text-ink-soft">
              esc
            </kbd>
            Close
            <span className="mx-1 h-3 w-px bg-border" aria-hidden="true" />
            <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-sans text-[0.625rem] font-semibold text-ink-soft">
              {shortcut}
            </kbd>
          </span>
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>
      </div>
    </div>,
    document.body,
  );
}
