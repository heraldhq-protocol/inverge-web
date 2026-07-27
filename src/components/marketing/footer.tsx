import React from 'react';
import Link from 'next/link';
import { NewsletterForm } from './newsletter-form';

export function Footer() {
  return (
    <footer className="w-full bg-forest text-white py-16 lg:py-20 border-t border-white/10">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          {/* Brand Column */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-3">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <svg
                width="28"
                height="28"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-accent-500"
                aria-hidden="true"
              >
                <path
                  d="M16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4Z"
                  fill="currentColor"
                  fillOpacity="0.2"
                />
                <path d="M8 22C11 12 18 8 24 9C23 15 19 22 8 22Z" fill="currentColor" />
              </svg>
              <span className="font-display text-2xl font-bold tracking-tight text-white">
                inverge
              </span>
            </Link>

            <p className="text-sm text-white/70 max-w-sm">
              Backing ideas. Built on accountability.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Inverge on X (formerly Twitter)"
                className="flex items-center justify-center h-8 w-8 rounded-full bg-white/10 hover:bg-accent-500 transition-colors text-white/80 hover:text-white"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Inverge on LinkedIn"
                className="flex items-center justify-center h-8 w-8 rounded-full bg-white/10 hover:bg-accent-500 transition-colors text-white/80 hover:text-white"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.7a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26Z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Inverge on Instagram"
                className="flex items-center justify-center h-8 w-8 rounded-full bg-white/10 hover:bg-accent-500 transition-colors text-white/80 hover:text-white"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Navigation Grid */}
          <nav aria-label="Footer Product Links" className="space-y-3 lg:col-span-2">
            <h2 className="text-xs font-bold tracking-widest uppercase text-white/50">
              PRODUCT
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/ideas" className="text-white/80 hover:text-white transition-colors">
                  Explore ideas
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-white/80 hover:text-white transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/ideas/new" className="text-white/80 hover:text-white transition-colors">
                  Start an idea
                </Link>
              </li>
              <li>
                <Link href="/updates" className="text-white/80 hover:text-white transition-colors">
                  Updates
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Footer Company Links" className="space-y-3 lg:col-span-2">
            <h2 className="text-xs font-bold tracking-widest uppercase text-white/50">
              COMPANY
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-white/80 hover:text-white transition-colors">
                  About us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white/80 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-white/80 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/80 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Footer Resources Links" className="space-y-3 lg:col-span-2">
            <h2 className="text-xs font-bold tracking-widest uppercase text-white/50">
              RESOURCES
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-white/80 hover:text-white transition-colors">
                  Help center
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-white/80 hover:text-white transition-colors">
                  Guides
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/80 hover:text-white transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/80 hover:text-white transition-colors">
                  Privacy
                </Link>
              </li>
            </ul>
          </nav>

          {/* Newsletter Box */}
          <div className="space-y-3 sm:col-span-2 lg:col-span-3">
            <h2 className="text-xs font-bold tracking-widest uppercase text-white/50">
              STAY UPDATED
            </h2>
            <p className="text-sm text-white/70">
              Get updates on new ideas and campaigns.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>© 2026 Inverge. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Made in Africa, for the world.</span>
            {/* Africa continent mark */}
            <svg
              width="16"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-accent-500"
              aria-hidden="true"
            >
              <path d="M12 2C10 3 7 5 6 8C5 11 6 13 8 16C10 19 11 22 13 22C15 22 16 19 17 16C18 13 19 9 17 6C15 3 14 2 12 2Z" />
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
}
