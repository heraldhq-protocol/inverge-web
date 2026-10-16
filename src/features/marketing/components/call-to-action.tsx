import type { ReactNode } from "react";

import { ButtonLink } from "@/features/marketing/components/button-link";
import { Container } from "@/features/marketing/components/container";
import { SectionBackground } from "@/features/marketing/components/section-background";

type CallToActionProps = {
  eyebrow?: string;
  title: string;
  body?: string;
  children?: ReactNode;
  className?: string;
  titleSize?: "default" | "large";
  label?: string;
  href?: string;
};

export function CallToAction({
  eyebrow,
  title,
  body,
  children,
  className = "py-16 sm:py-20",
  titleSize = "default",
  label,
  href,
}: CallToActionProps) {
  return (
    <section className={`bg-canvas ${className}`}>
      <Container>
        <div className="relative isolate overflow-hidden rounded-3xl bg-[#0b251a] px-6 py-12 text-center text-white shadow-sm sm:px-12 sm:py-16">
          <SectionBackground
            tone="forest"
            className="-z-10 object-[50%_70%] opacity-45"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0b251a]/55 via-[#0b251a]/65 to-[#0b251a]/85"
          />
          {eyebrow ? (
            <div className="flex items-center justify-center gap-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white/60">
              <span
                className="size-1.5 rounded-full bg-brand"
                aria-hidden="true"
              />
              <span>{eyebrow}</span>
            </div>
          ) : null}
          <h2
            className={`mx-auto max-w-2xl font-bold tracking-tight ${
              eyebrow ? "mt-4" : ""
            } ${
              titleSize === "large"
                ? "text-3xl sm:text-5xl"
                : "text-2xl sm:text-4xl"
            }`}
          >
            {title}
          </h2>
          {body ? (
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:mt-5 sm:text-lg">
              {body}
            </p>
          ) : null}
          <div className="mx-auto mt-8 flex w-full max-w-sm flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row sm:gap-4">
            {children ? (
              children
            ) : label && href ? (
              <ButtonLink href={href} variant="light">
                {label}
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
