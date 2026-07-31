import React from 'react';
import { Hero } from '@/components/marketing/hero';
import { BackedBy } from '@/components/marketing/backed-by';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { Momentum } from '@/components/marketing/momentum';
import { StatStrip } from '@/components/marketing/stat-strip';
import { TrustRow } from '@/components/marketing/trust-row';

/**
 * Revalidate every five minutes. The landing page is otherwise static, and the one live section on it
 * (Momentum) is an anonymous public read — fresh enough that the ideas shown still exist when a visitor
 * clicks through, cheap enough that the page is not rebuilt per visit.
 */
export const revalidate = 300;

export default function MarketingPage() {
  return (
    <>
      <Hero />
      <BackedBy />
      <HowItWorks />
      <Momentum />
      <StatStrip />
      <TrustRow />
    </>
  );
}
