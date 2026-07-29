import React from 'react';
import { Hero } from '@/components/marketing/hero';
import { BackedBy } from '@/components/marketing/backed-by';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { StatStrip } from '@/components/marketing/stat-strip';
import { TrustRow } from '@/components/marketing/trust-row';

export default function MarketingPage() {
  return (
    <>
      <Hero />
      <BackedBy />
      <HowItWorks />
      <StatStrip />
      <TrustRow />
    </>
  );
}
