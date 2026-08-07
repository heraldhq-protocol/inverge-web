import React from 'react';
import Image from 'next/image';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Amount, Count } from '@/components/ui/amount';

/**
 * Believable placeholder testimonials — swap for real, cleared quotes pre-launch.
 *
 * Deliberately two voices, not three. The section proves one claim from both ends: a backer
 * who was actually refunded, and a creator who actually delivered. A third quote adds no new
 * evidence and turns the section into a wall of cards, which is the shape this page avoids.
 */

export function TrustRow() {
  return (
    <Section tone="cream" id="trust">
      <Container>
        <div className="max-w-xl" data-reveal>
          <Eyebrow>TRUSTED BY BUILDERS &amp; BACKERS</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Both sides of the promise
          </h2>
        </div>

        <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-12 lg:gap-12">
          {/* The refund story leads the section. It is the one claim a conventional crowdfunding
              page cannot make, so it carries the most weight and gets the largest type. */}
          <figure className="lg:col-span-7 lg:pt-4" data-reveal-right>
            {/* Collapsed line box so the glyph hugs the quote instead of reserving a full line. */}
            <span
              aria-hidden="true"
              className="block font-display text-6xl leading-[0.55] text-accent-100 sm:text-7xl"
            >
              &ldquo;
            </span>

            <blockquote className="mt-5 font-display text-2xl font-semibold leading-snug tracking-tight text-ink sm:text-3xl lg:text-4xl">
              I was sceptical at first. Then the first project I backed didn&rsquo;t deliver, and the
              money came back without me having to chase anyone. Now I back three at a time.
            </blockquote>

            <figcaption className="mt-8 border-t border-border pt-5 text-sm">
              <span className="font-display font-bold text-ink">Chidi Nwosu</span>
              <span className="mt-1 block text-ink-muted">
                Backer, London ·{' '}
                <span className="font-medium text-accent-700">
                  <Count value={1} /> refund received
                </span>{' '}
                · <Count value={3} /> projects backed
              </span>
            </figcaption>
          </figure>

          {/* Full opacity and full size. Held at 6% behind a card it cost a download and showed
              nothing; a photograph of real builders is the point of including one at all. */}
          <figure className="lg:col-span-5" data-reveal-left>
            <Image
              src="/images/team-campuskonekt.png"
              alt="Three student founders in matching Lagos Tech Innovators shirts, smiling outside the Senate Building at the University of Lagos. One holds up a phone showing an app."
              width={1024}
              height={1024}
              sizes="(max-width: 1024px) 100vw, 420px"
              className="w-full rounded-2xl shadow-lift"
            />
            <figcaption className="mt-5 text-sm text-ink-muted">
              Campus builders in Lagos.
            </figcaption>
          </figure>
        </div>

        {/* The creator half of the same promise. One line, no card — the numbers do the work. */}
        <figure className="mt-12 border-t border-border pt-6 md:mt-16" data-reveal>
          <blockquote className="max-w-3xl font-display text-lg font-medium leading-relaxed text-ink sm:text-xl">
            &ldquo;The milestone structure kept us honest. Our backers could see exactly where their
            money went — no guessing.&rdquo;
          </blockquote>
          <figcaption className="mt-4 text-sm">
            <span className="font-display font-bold text-ink">Tobi Adeyemi</span>
            <span className="mt-1 block text-ink-muted">
              Founder, CampusKonekt ·{' '}
              <span className="font-medium text-accent-700">
                <Amount value={3600} currency="USD" /> raised
              </span>{' '}
              · <Count value={2} /> milestones completed
            </span>
          </figcaption>
        </figure>
      </Container>
    </Section>
  );
}
