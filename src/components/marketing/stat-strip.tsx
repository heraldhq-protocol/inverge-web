import React from 'react';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Stat } from '@/components/ui/stat';

export function StatStrip() {
  return (
    <Section tone="forest" id="stats">
      <Container className="space-y-10">
        {/* Header Status Indicator */}
        <div>
          <Eyebrow tone="forest" statusDot>
            LIVE ON INVERGE
          </Eyebrow>
        </div>

        {/* Stays stacked until lg — three equal columns at md leaves the escrowed figure too
            little room, which pushed the strip into horizontal overflow.

            At lg the columns are deliberately uneven: the escrowed figure is 14 glyphs and the
            other two are 3–5, so equal thirds starved the one that needed room while stranding
            the short ones in dead space. Hairline dividers make the strip read as one
            instrument panel instead of three floating islands. */}
        <div
          className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.6fr_1fr] lg:gap-0 lg:divide-x lg:divide-white/10 items-start"
          data-reveal
        >
          <Stat
            label="Ideas published"
            value={2734}
            type="count"
            delta="+32 this week"
            reserveClass="min-w-[6ch]"
            className="lg:pr-8"
          />

          <Stat
            label="Total escrowed"
            value={1248450000}
            type="amount"
            currency="NGN"
            delta="+₦73,650,000 this week"
            reserveClass="min-w-[14ch]"
            className="lg:px-8"
          />

          <Stat
            label="Active campaigns"
            value={156}
            type="count"
            delta="+6 this week"
            reserveClass="min-w-[5ch]"
            className="lg:pl-8"
          />
        </div>
      </Container>
    </Section>
  );
}
