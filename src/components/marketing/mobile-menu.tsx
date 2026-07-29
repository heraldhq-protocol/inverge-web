'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Toggle Navigation Menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center justify-center p-2.5 rounded-lg text-ink hover:text-accent-500 hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 min-h-[44px] min-w-[44px]"
      >
        {open ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-surface border-b border-border p-5 shadow-xl flex flex-col gap-4 z-50">
          <Link
            href="/ideas"
            className="text-base font-medium text-ink hover:text-accent-500 py-2"
            onClick={() => setOpen(false)}
          >
            Explore ideas
          </Link>
          <Link
            href="#how-it-works"
            className="text-base font-medium text-ink hover:text-accent-500 py-2"
            onClick={() => setOpen(false)}
          >
            How it works
          </Link>
          <Link
            href="/about"
            className="text-base font-medium text-ink hover:text-accent-500 py-2"
            onClick={() => setOpen(false)}
          >
            About
          </Link>
          <Link
            href="/guides"
            className="text-base font-medium text-ink hover:text-accent-500 py-2"
            onClick={() => setOpen(false)}
          >
            Resources
          </Link>
          <div className="pt-2 border-t border-border flex flex-col gap-3">
            <Link
              href="/auth"
              className="text-center font-medium text-ink border border-border py-2.5 rounded-full hover:bg-paper"
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>
            <Link
              href="/ideas/new"
              className="text-center font-medium text-white bg-accent-500 py-2.5 rounded-full hover:bg-accent-700"
              onClick={() => setOpen(false)}
            >
              Start an idea
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
