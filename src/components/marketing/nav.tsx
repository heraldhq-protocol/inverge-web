import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ResourcesDropdown } from './resources-dropdown';
import { MobileMenu } from './mobile-menu';

export function Nav() {
  return (
    <header className="relative w-full bg-paper py-5 transition-all">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-lg">
          <svg
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-accent-500 transition-transform group-hover:scale-105"
            aria-hidden="true"
          >
            {/* Elegant Inverge Leaf / Arc logo mark */}
            <path
              d="M16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4Z"
              fill="currentColor"
              fillOpacity="0.15"
            />
            <path
              d="M8 22C11 12 18 8 24 9C23 15 19 22 8 22Z"
              fill="currentColor"
            />
          </svg>
          <span className="font-display text-2xl font-bold tracking-tight text-ink">
            inverge
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-8">
          <Link
            href="/ideas"
            className="text-sm font-medium text-ink hover:text-accent-500 transition-colors py-2"
          >
            Explore ideas
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-ink hover:text-accent-500 transition-colors py-2"
          >
            How it works
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-ink hover:text-accent-500 transition-colors py-2"
          >
            About
          </Link>
          <ResourcesDropdown />
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline" size="md" href="/auth">
            Sign in
          </Button>
          <Button variant="primary" size="md" href="/ideas/new">
            Start an idea
          </Button>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <Button variant="primary" size="sm" href="/ideas/new">
            Start an idea
          </Button>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
