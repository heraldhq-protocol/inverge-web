import React from 'react';
import Link from 'next/link';
import { NewsletterForm } from './newsletter-form';

export function Footer() {
  return (
    <footer className="w-full bg-forest text-white py-16 lg:py-20 border-t border-white/10" data-reveal>
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
              width="20"
              height="22"
              viewBox="0 0 109.39 122.88"
              fill="currentColor"
              className="text-accent-500 shrink-0"
              aria-hidden="true"
            >
              {/* Official Africa Continent + Madagascar silhouette */}
              <path d="M96.96,97.74c-1.23,0.04-2.61,0.09-3.09,0.11C93.39,97.87,93,97.84,93,97.8c0-0.17-0.18-0.01-0.89,0.82 c-1.73,2-2.86,2.99-4.08,3.57c-0.59,0.28-0.76,0.31-1.67,0.32c-0.9,0.02-1.09,0.05-1.59,0.3c-0.74,0.37-1.44,1.07-1.8,1.79 c-0.23,0.46-0.3,0.77-0.35,1.54c-0.11,1.55-0.43,2.24-1.93,4.1c-1.55,1.93-1.88,2.64-1.88,4.1c0,0.79,0.04,1.02,0.23,1.41 c0.34,0.67,1.01,1.3,1.65,1.54c0.7,0.27,0.92,0.26,1.66-0.03l0.61-0.25l3.26,0.13l3.26,0.13l0.48-0.25 c0.57-0.32,1.07-0.87,2.12-2.44c0.44-0.65,1.33-1.92,2-2.81c1.57-2.14,4.21-6.12,5.21-7.83c1-1.71,1.06-1.96,0.97-4.08 c-0.03-0.87-0.09-1.72-0.12-1.9c-0.06-0.31-0.08-0.32-0.52-0.3C99.39,97.65,98.18,97.7,96.96,97.74L96.96,97.74L96.96,97.74z M27.02,0.1c-0.3,0.08-0.94,0.37-1.43,0.64c-1.56,0.86-2.46,1.27-2.97,1.36c-0.77,0.15-1.29,0.4-1.94,0.91 c-0.72,0.57-1.36,1.39-1.76,2.22c-0.52,1.1-1.61,1.82-3.7,2.46c-1.82,0.56-2.82,0.94-3.34,1.24c-0.67,0.4-2.79,2.2-4.98,4.22 C4.43,15.44,4.32,15.64,3.65,19c-0.62,3.15-0.98,4.08-2.01,5.28c-0.71,0.82-1.1,1.51-1.41,2.52C0.04,27.43,0,27.76,0,28.88 c0.01,1.51,0.18,2.31,0.8,3.65c0.75,1.6,1.61,3.93,2.21,6c0.43,1.49,0.64,1.94,1.5,3.21c0.94,1.41,3.17,4.17,3.62,4.48 c0.73,0.5,1.48,0.66,3.07,0.66c0.78,0,1.56-0.03,1.74-0.07c0.47-0.09,1.56,0.22,2.86,0.79c1.71,0.76,1.85,0.8,3.01,0.79 c0.77,0,1.46-0.09,2.7-0.34l1.66-0.33l0.51,0.21c1.27,0.52,1.93,0.58,3.8,0.36l0.52-0.07l0.43,0.46c0.26,0.29,0.66,0.94,1.03,1.68 c0.96,1.93,1.71,2.51,3.47,2.63c1.07,0.08,1.54,0.27,2.23,0.91c0.24,0.22,0.55,0.65,0.7,0.96c0.24,0.47,0.28,0.66,0.27,1.34 c-0.02,1.12-0.24,1.84-1.13,3.71c-1,2.09-1.13,2.56-1.13,3.74c0,1.34,0.19,1.85,1.3,3.49c1.63,2.4,2.46,4.36,2.68,6.31 c0.28,2.44,0.62,8.74,0.51,9.14c-0.25,0.86-0.81,1.66-2.67,3.78c-1.17,1.34-1.51,2.02-1.75,3.46c-0.4,2.41-0.04,4.28,1.69,8.84 c0.4,1.03,0.77,2.12,0.84,2.42c0.08,0.34,0.15,1.81,0.2,3.9c0.09,3.92,0.05,3.74,1.26,6.57c1.32,3.06,1.7,4.62,1.49,6.12 c-0.06,0.41-0.08,0.96-0.05,1.23c0.13,1.15,1.13,2.44,2.11,2.75c0.3,0.1,1.12,0.17,2.28,0.21c2.43,0.09,3.21,0.21,3.42,0.52 c0.36,0.53,0.55,0.55,4.09,0.38c1.77-0.09,4.04-0.15,5.05-0.14c1.62,0.02,1.93-0.01,2.7-0.21c2.03-0.52,4.21-1.68,6.84-3.63 c1.73-1.28,2.92-2.54,3.61-3.77c0.68-1.24,1.3-1.74,2.96-2.38c1.54-0.59,2.31-1.17,2.67-2c0.19-0.43,0.23-0.77,0.29-2.43 c0.09-2.22,0.18-2.55,0.91-3.26c1.11-1.08,2.44-1.74,5.57-2.78c2.69-0.89,3.08-1.06,3.65-1.58c1.04-0.96,1.53-2.55,1.95-6.27 c0.09-0.85,0.09-1.53,0-3.06c-0.27-4.71-0.06-7.18,0.81-9.3c0.47-1.18,1.41-2.29,2.64-3.15c0.3-0.22,1.86-1.36,3.46-2.56 c1.6-1.2,3.59-2.59,4.4-3.1c3.15-1.98,4.51-3.06,5.67-4.51c0.97-1.2,3.47-5.36,4.43-7.36c0.48-1.02,0.54-1.19,0.49-1.6 c-0.16-1.3-1.48-2.45-2.71-2.32c-0.26,0.02-0.9,0.13-1.41,0.22c-0.56,0.11-1.41,0.18-2.12,0.18c-1.01,0-1.3-0.04-1.98-0.26 c-0.95-0.31-1.63-0.77-2.07-1.39c-0.39-0.55-0.52-0.9-1.05-2.73c-0.61-2.17-0.73-2.37-2.3-3.84c-1.2-1.12-2.26-3.04-2.88-5.25 c-0.17-0.58-0.54-1.46-0.99-2.32c-0.85-1.64-1.13-2.44-1.13-3.25c0-1.47-0.51-3.15-1.64-5.41c-0.8-1.6-1.28-2.78-1.52-3.68 c-0.1-0.38-0.6-1.84-1.12-3.22c-1.01-2.72-1.95-5.47-2.13-6.28c-0.31-1.3-1.64-1.98-4.26-2.16c-1.85-0.13-4.02-1.07-8-3.43 l-1.94-1.15l-3.82-0.43c-3.59-0.4-3.83-0.42-4.08-0.28l-0.27,0.17l-0.62-0.71c-1.17-1.33-2.33-2.11-3.5-2.33 c-0.74-0.14-1.25-0.42-1.8-0.95c-0.99-0.97-1.17-1.88-0.68-3.31c0.53-1.53,0.52-2.2-0.01-2.8c-0.3-0.35-0.31-0.35-1.11-0.35 c-1.45,0-2.38-0.16-6.33-1.09c-2.42-0.57-3.92-0.7-5.38-0.46c-0.7,0.12-0.92,0.1-4.05-0.35c-1.82-0.26-3.49-0.46-3.71-0.46 c-0.54-0.01-1.22,0.23-2.23,0.8l-0.85,0.47l-0.66-0.15c-0.87-0.21-1.51-0.45-2.09-0.81C28.33,0,27.73-0.09,27.02,0.1L27.02,0.1 L27.02,0.1z" />
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
}
