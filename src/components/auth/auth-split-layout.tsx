import React from 'react';
import { Logo } from '@/components/ui/logo';
import { AuthForm } from '@/components/auth/auth-form';

interface AuthSplitLayoutProps {
  initialMode?: 'signin' | 'signup';
}

export function AuthSplitLayout({ initialMode = 'signup' }: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-paper overflow-x-hidden">
      {/* Left Panel - Brand Panel (~45% width on desktop) */}
      <div className="w-full lg:w-[45%] bg-forest text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative shrink-0">
        {/* Brand Header */}
        <div>
          <Logo variant="dark" />
        </div>

        {/* Hero Copy & Stats Group */}
        <div className="my-12 lg:my-0 max-w-lg">
          {/* Main Headline */}
          <h2 className="font-display text-3xl sm:text-4xl lg:text-[40px] font-semibold text-white tracking-tight leading-[1.15] mb-4">
            Back money that has to deliver.
          </h2>

          {/* Subtitle */}
          <p className="text-base text-emerald-100/70 leading-relaxed mb-12 font-normal">
            Every milestone is approved by backers before it pays out.
          </p>

          {/* Stat 1 */}
          <div className="border-t border-white/15 pt-5 pb-5 flex items-baseline justify-between gap-4">
            <span className="font-sans text-2xl sm:text-[28px] font-bold text-white tabular-nums tracking-tight">
              ₦48,200,000
            </span>
            <span className="text-xs sm:text-sm text-emerald-100/70 text-right">
              released across 61 milestones
            </span>
          </div>

          {/* Stat 2 */}
          <div className="border-t border-white/15 pt-5 pb-5 flex items-baseline justify-between gap-4 border-b">
            <span className="font-sans text-2xl sm:text-[28px] font-bold text-white tabular-nums tracking-tight">
              ₦3,100,000
            </span>
            <span className="text-xs sm:text-sm text-emerald-100/70 text-right">
              refunded automatically
            </span>
          </div>
        </div>

        {/* Empty bottom space balancer for desktop flex column */}
        <div className="hidden lg:block h-4" />
      </div>

      {/* Right Panel - Auth Form Column (~55% width on desktop) */}
      <div className="w-full lg:w-[55%] bg-paper flex items-center justify-center py-12 px-6 sm:px-12 lg:py-16">
        <AuthForm initialMode={initialMode} />
      </div>
    </div>
  );
}
