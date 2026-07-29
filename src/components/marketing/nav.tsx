import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { ResourcesDropdown } from './resources-dropdown';
import { MobileMenu } from './mobile-menu';

export function Nav() {
  return (
    <header className="relative w-full bg-paper py-5 transition-all">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Logo */}
        <Logo variant="light" />

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
          <Button variant="outline" size="md" href="/signin">
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
