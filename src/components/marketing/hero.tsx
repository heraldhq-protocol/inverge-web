import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Count } from '@/components/ui/amount';
import { RecentlyFunded } from './recently-funded';

export function Hero() {
  return (
    <section className="relative py-12 md:py-20 lg:py-24 overflow-hidden bg-paper" id="hero">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Asymmetric Copy & CTAs */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* clamp() rather than breakpoint jumps so the display size scales continuously
                across the 40–76px range the brief asks for, with no step at each breakpoint.
                Deliberately NOT animated: this is the LCP element, and fading it in from
                opacity 0 would push LCP out by the full animation duration. */}
            <h1 className="font-display font-extrabold tracking-tight text-ink leading-[1.05] text-[clamp(2.5rem,4.6vw+0.75rem,4.75rem)]">
              Back African builders.{' '}
              <span className="text-accent-500 block sm:inline mt-1 sm:mt-0">
                Get your money back if they don’t deliver.
              </span>
            </h1>

            <p
              className="text-base sm:text-lg lg:text-xl text-ink-muted leading-relaxed max-w-xl font-normal [--inv-delay:80ms]"
              data-enter
            >
              Inverge helps early-stage founders validate ideas, raise in milestones, and build with accountability — so you can back with confidence.
            </p>

            {/* CTA Button Pair */}
            <div className="flex flex-wrap items-center gap-4 pt-1 [--inv-delay:160ms]" data-enter>
              <Button variant="primary" size="lg" href="/ideas" className="group shadow-md">
                <span>Explore ideas</span>
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Button>

              <Button variant="outline" size="lg" href="/ideas/new">
                Start an idea
              </Button>
            </div>

            {/* Social Proof Row */}
            <div className="flex items-center gap-3 pt-2 [--inv-delay:240ms]" data-enter>
              {/* Overlapping Avatar Stack (aria-hidden decorative images) */}
              <div className="flex -space-x-2.5 overflow-hidden shrink-0" aria-hidden="true">
                <div className="h-9 w-9 rounded-full ring-2 ring-paper bg-accent-900 text-white flex items-center justify-center font-bold text-xs">
                  TA
                </div>
                <div className="h-9 w-9 rounded-full ring-2 ring-paper bg-accent-700 text-white flex items-center justify-center font-bold text-xs">
                  KO
                </div>
                <div className="h-9 w-9 rounded-full ring-2 ring-paper bg-accent-500 text-white flex items-center justify-center font-bold text-xs">
                  ZE
                </div>
                <div className="h-9 w-9 rounded-full ring-2 ring-paper bg-ink/70 text-white flex items-center justify-center font-bold text-xs">
                  BA
                </div>
              </div>

              <p className="text-xs sm:text-sm font-medium text-ink-muted leading-snug">
                Join <Count value={18431} className="font-semibold text-ink" /> backers supporting builders across Africa
              </p>
            </div>
          </div>

          {/* Right Column: Lagos Street Image + Overlapping Recently Funded Card */}
          {/* Also unanimated — it holds the priority image, the other LCP candidate. */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Priority Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-black/5 bg-paper aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/5]">
                <Image
                  src="/images/hero-lagos.png"
                  alt="Bustling street scene in Lagos featuring yellow Danfo buses and skyline"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 500px"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>

              {/* Overlapping RECENTLY FUNDED stack */}
              <div className="mt-4 lg:mt-0 lg:absolute lg:-bottom-8 lg:-left-12 lg:right-4 z-20">
                <RecentlyFunded />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
