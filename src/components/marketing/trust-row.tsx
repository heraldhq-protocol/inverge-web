import React from 'react';
import Image from 'next/image';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Amount } from '@/components/ui/amount';

export function TrustRow() {
  return (
    <Section tone="cream" id="trust">
      <Container className="space-y-12">
        <Eyebrow>TRUSTED BY BUILDERS & BACKERS</Eyebrow>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center" data-reveal>
          {/* Testimonial Column — the institutional mark now lives in the Backed by marquee,
              which keeps this row to one idea instead of two competing for the same column. */}
          <div className="lg:col-span-7">
            {/* Semantic Testimonial Quote */}
            <figure className="space-y-6 relative">
              {/* Decorative quotation mark glyph (aria-hidden) */}
              <div
                aria-hidden="true"
                className="font-display text-5xl font-bold leading-none text-accent-500"
              >
                “
              </div>

              <blockquote className="text-xl sm:text-2xl lg:text-3xl font-display font-semibold text-ink leading-snug tracking-tight">
                Inverge gave us more than money — it gave us belief and structure. We hit our first milestone, and the community showed up.
              </blockquote>

              <figcaption className="flex items-center gap-4 pt-2">
                <div className="h-12 w-12 rounded-full bg-accent-900 text-white font-bold flex items-center justify-center text-sm shrink-0 border-2 border-surface">
                  TA
                </div>
                <div>
                  <div className="font-display font-bold text-base text-ink">
                    Tobi Adeyemi
                  </div>
                  <div className="text-xs sm:text-sm text-ink-muted">
                    Founder, CampusKonekt ·{' '}
                    <span className="font-medium text-ink">
                      <Amount value={3600000} currency="NGN" /> raised
                    </span>{' '}
                    · 2 milestones completed
                  </div>
                </div>
              </figcaption>
            </figure>
          </div>

          {/* CampusKonekt Team Photo Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-black/5 aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3]">
              <Image
                src="/images/team-campuskonekt.png"
                alt="CampusKonekt founder team smiling together outdoors in dark green branded shirts holding smartphones"
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Photo Overlay Badge */}
              <div className="absolute top-5 right-5 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-right text-white border border-white/10">
                <div className="font-display font-bold text-sm">CampusKonekt</div>
                <div className="text-[10px] text-white/80">Connecting campus life</div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
