'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export function ResourcesDropdown() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    function handleClickOutside(e: MouseEvent) {
      if (
        open &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="resources-menu"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 text-sm font-medium text-ink hover:text-accent-500 transition-colors py-2 px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-md"
      >
        <span>Resources</span>
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          id="resources-menu"
          ref={menuRef}
          className="absolute left-0 mt-2 w-48 rounded-xl bg-surface p-2 shadow-lg border border-border/60 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <Link
            href="/guides"
            className="block px-3 py-2 text-sm text-ink hover:bg-paper hover:text-accent-700 rounded-lg transition-colors"
            onClick={() => setOpen(false)}
          >
            Guides & Specs
          </Link>
          <Link
            href="/blog"
            className="block px-3 py-2 text-sm text-ink hover:bg-paper hover:text-accent-700 rounded-lg transition-colors"
            onClick={() => setOpen(false)}
          >
            Builder Blog
          </Link>
          <Link
            href="/faq"
            className="block px-3 py-2 text-sm text-ink hover:bg-paper hover:text-accent-700 rounded-lg transition-colors"
            onClick={() => setOpen(false)}
          >
            Backer FAQ
          </Link>
        </div>
      )}
    </div>
  );
}
