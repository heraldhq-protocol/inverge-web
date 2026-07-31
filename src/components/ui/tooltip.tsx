'use client';

import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Accessible name for the trigger when the child is a bare glyph or a number. */
  label?: string;
  className?: string;
}

type Coords = { top: number; left: number };

const GAP = 8;
const PANEL_WIDTH = 240;
const VIEWPORT_MARGIN = 8;

/**
 * Explanatory tooltip.
 *
 * **Rendered in a portal on `document.body`, not as a positioned child.** Cards clip their content
 * (`overflow-hidden` keeps the cover's corners), so a tooltip nested inside one gets cut off and the
 * part that escapes lands on top of the neighbouring card. Portalling it out and positioning against
 * the trigger's viewport rect is the only fix that survives every container we drop it into.
 *
 * Accessibility, because a hover-only tooltip is a broken tooltip:
 * - The trigger is a real `<button>`, so it is keyboard-reachable and taps work on touch (WCAG 2.1.1).
 * - Escape dismisses while the pointer is still over the trigger (WCAG 1.4.13).
 * - Linked by `aria-describedby`, so it is announced rather than merely drawn.
 * - Motion is a short fade, dropped under `prefers-reduced-motion` (conventions §9.1).
 *
 * Tooltips carry **supporting** detail only. Anything a reader must have in order to act belongs in the
 * page: a rule that only exists inside a hover is a rule most people never read.
 */
export function Tooltip({ content, children, position = 'top', label, className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  // `useSyncExternalStore` rather than a mount effect: the portal target only exists in the browser, and
  // setting state in an effect to discover that is both a lint error and an extra render.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    []
  );

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();

    let top: number;
    let left: number;

    switch (position) {
      case 'bottom':
        top = r.bottom + GAP;
        left = r.left + r.width / 2 - PANEL_WIDTH / 2;
        break;
      case 'left':
        top = r.top + r.height / 2;
        left = r.left - PANEL_WIDTH - GAP;
        break;
      case 'right':
        top = r.top + r.height / 2;
        left = r.right + GAP;
        break;
      default:
        top = r.top - GAP;
        left = r.left + r.width / 2 - PANEL_WIDTH / 2;
    }

    // Keep the panel inside the viewport rather than letting it run off the edge, which is what
    // happens to a card tooltip in the last column of the grid.
    const maxLeft = window.innerWidth - PANEL_WIDTH - VIEWPORT_MARGIN;
    left = Math.max(VIEWPORT_MARGIN, Math.min(left, Math.max(VIEWPORT_MARGIN, maxLeft)));

    setCoords({ top, left });
  }, [position]);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  // A tooltip anchored to a viewport rect goes stale the moment the page moves under it.
  useEffect(() => {
    if (!open) return;
    const onMove = () => setOpen(false);
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const show = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const hide = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  const transform =
    position === 'top'
      ? 'translateY(-100%)'
      : position === 'left' || position === 'right'
        ? 'translateY(-50%)'
        : undefined;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-describedby={open ? id : undefined}
        aria-label={label}
        aria-expanded={open}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        className="inline-flex max-w-full cursor-help items-center rounded align-baseline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
      >
        {children}
      </button>

      {mounted &&
        open &&
        coords &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            onMouseEnter={show}
            onMouseLeave={hide}
            style={{ top: coords.top, left: coords.left, width: PANEL_WIDTH, transform }}
            className={cn(
              'pointer-events-auto fixed z-[100] rounded-lg bg-forest px-3 py-2 text-left text-[11px] font-normal leading-relaxed text-paper shadow-lift',
              'motion-safe:animate-[inv-scale-in_140ms_cubic-bezier(0.16,1,0.3,1)_both]',
              className
            )}
          >
            {content}
          </span>,
          document.body
        )}
    </>
  );
}

/**
 * The "what does this mean" affordance beside a metric or a label. A bare `i` in a circle is a standard
 * information affordance, not one of the stock trust badges the art direction bans.
 */
export function InfoTooltip({
  content,
  label,
  position = 'top',
  size = 13,
}: {
  content: React.ReactNode;
  /** What the icon explains, for screen readers: "About estimated interest". */
  label: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: number;
}) {
  return (
    <Tooltip content={content} position={position} label={label}>
      <span className="inline-flex items-center justify-center text-ink-muted transition-colors hover:text-accent-700">
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      </span>
    </Tooltip>
  );
}
