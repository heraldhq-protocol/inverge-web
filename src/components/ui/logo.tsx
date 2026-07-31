import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  variant?: 'light' | 'dark';
  className?: string;
  showText?: boolean;
  /**
   * `sm` is app chrome, `md` is the marketing site. A wordmark sized for a landing page is the wrong
   * weight in a product top bar, where it competes with the page's own heading (app-mockup-kit §3.1).
   */
  size?: 'sm' | 'md';
}

export function Logo({ variant = 'light', className = '', showText = true, size = 'md' }: LogoProps) {
  const textColor = variant === 'dark' ? 'text-white' : 'text-ink';
  const mark = size === 'sm' ? 22 : 28;
  const wordmark = size === 'sm' ? 'text-lg' : 'text-2xl';

  return (
    <Link
      href="/"
      className={`inline-flex items-center ${size === 'sm' ? 'gap-2' : 'gap-2.5'} group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-lg ${className}`}
      aria-label="Inverge Home"
    >
      <Image src={"/icon.svg"} width={mark} height={mark} alt='Logo' />
      {showText && (
        <span className={`font-display ${wordmark} font-bold tracking-tight ${textColor}`}>
          inverge
        </span>
      )}
    </Link>
  );
}
