import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  href,
  children,
  className,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-full transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 select-none min-h-[44px] shrink-0';

  const variants = {
    primary:
      'bg-accent-500 hover:bg-accent-700 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 motion-reduce:hover:translate-y-0',
    secondary: 'bg-accent-100 hover:bg-accent-500 hover:text-white text-accent-700',
    outline: 'border border-border/80 hover:border-ink/40 text-ink bg-surface/60 hover:bg-surface active:bg-paper',
    ghost: 'text-ink hover:bg-ink/5',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 min-w-[36px]',
    md: 'text-sm px-5 py-2.5 gap-2 min-w-[44px]',
    lg: 'text-base px-7 py-3.5 gap-2.5 min-w-[48px]',
  };

  const combined = cn(baseStyles, variants[variant], sizes[size], className);

  if (href) {
    return (
      <Link href={href} className={combined}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combined} {...props}>
      {children}
    </button>
  );
}
