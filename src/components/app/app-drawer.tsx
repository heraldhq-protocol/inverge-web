'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Logo } from '@/components/ui/logo';
import { SidebarNav } from './sidebar-nav';

/**
 * The sidebar as an off-canvas sheet below `lg`.
 *
 * Built on the native <dialog> + showModal(), which gives us the focus trap, Escape handling,
 * inert background and focus restore for free. Our browser floor (Chrome 111+, Safari 16.4+,
 * conventions §0) supports it fully, so hand-rolling any of that would be strictly worse.
 */
export function AppDrawer() {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    ref.current?.close();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onClose = () => setOpen(false);
    el.addEventListener('close', onClose);
    return () => el.removeEventListener('close', onClose);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          ref.current?.showModal();
          setOpen(true);
        }}
        aria-expanded={open}
        aria-label="Open main menu"
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink transition-colors hover:bg-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 lg:hidden"
      >
        <span aria-hidden="true" className="flex flex-col gap-[5px]">
          <span className="block h-[2px] w-5 rounded-full bg-current" />
          <span className="block h-[2px] w-5 rounded-full bg-current" />
          <span className="block h-[2px] w-5 rounded-full bg-current" />
        </span>
      </button>

      <dialog
        ref={ref}
        aria-label="Main menu"
        className="app-drawer m-0 h-dvh max-h-none w-[17rem] max-w-[85vw] bg-forest p-0 text-white backdrop:bg-ink/40"
      >
        <div className="flex h-full flex-col px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="px-2">
              <Logo variant="dark" />
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-xl leading-none text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div className="mt-8 flex-1">
            <SidebarNav onNavigate={close} />
          </div>
        </div>
      </dialog>
    </>
  );
}
