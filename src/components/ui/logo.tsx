import React from 'react';
import Link from 'next/link';

interface LogoProps {
  variant?: 'light' | 'dark';
  className?: string;
  showText?: boolean;
}

export function Logo({ variant = 'light', className = '', showText = true }: LogoProps) {
  const textColor = variant === 'dark' ? 'text-white' : 'text-ink';
  
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-lg ${className}`}
      aria-label="Inverge Home"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform group-hover:scale-105 shrink-0"
        aria-hidden="true"
      >
        {/* Dual angled leaf mark matching Inverge branding */}
        <rect
          x="7"
          y="8"
          width="6"
          height="17"
          rx="3"
          transform="rotate(-15 7 8)"
          fill={variant === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'var(--color-accent-100)'}
        />
        <rect
          x="16"
          y="5"
          width="6"
          height="22"
          rx="3"
          transform="rotate(-15 16 5)"
          fill="var(--color-accent-500)"
        />
      </svg>
      {showText && (
        <span className={`font-display text-2xl font-bold tracking-tight ${textColor}`}>
          inverge
        </span>
      )}
    </Link>
  );
}
