import Image from "next/image";
import Link from "next/link";

import { Container } from "@/features/marketing/components/container";

export function MissionTeaserSection() {
  return (
    <section className="marketing-pattern py-16 md:py-24">
      <Container>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Visual on the Left */}
          <div
            data-reveal="left"
            data-parallax-scope
            className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-border/80 shadow-sm lg:col-span-6 lg:aspect-[4/3]"
          >
            <Image
              data-parallax
              src="/images/showcase/mission_lagos.png"
              alt="Lagos skyline and tech corridor at sunset"
              fill
              sizes="(max-width: 1024px) 100vw, 580px"
              className="object-cover object-center"
            />
          </div>

          {/* Copy on the Right */}
          <div
            data-reveal="right"
            className="flex flex-col gap-5 lg:col-span-6"
          >
            <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
              The funding gap is also a trust gap.
            </h2>

            <div className="space-y-4 text-base leading-relaxed text-muted sm:text-lg">
              <p>
                Great ideas exist across Africa. The gap is not just money. It
                is confidence, transparency and a fair process.
              </p>
              <p>
                We are building a platform that brings people together with
                clear rules and real accountability.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand transition-colors hover:text-brand-strong hover:underline"
              >
                <span>About Inverge</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
