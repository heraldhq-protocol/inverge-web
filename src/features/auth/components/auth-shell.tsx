import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/shared/brand-mark";

type AuthShellProps = {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: ReactNode;
  panelTitle: string;
  panelDescription: string;
};

export function AuthShell({
  children,
  eyebrow,
  title,
  description,
  panelTitle,
  panelDescription,
}: AuthShellProps) {
  return (
    <div className="min-h-svh bg-surface lg:h-svh lg:overflow-hidden lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <section className="flex min-h-svh min-w-0 flex-col bg-surface lg:h-full lg:min-h-0 lg:overflow-y-auto">
        <header className="flex min-h-16 shrink-0 items-center justify-between gap-5 px-5 sm:px-8 lg:min-h-20 lg:px-12 xl:px-16">
          <BrandMark />
          <Link
            href="/#how-it-works"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-1 text-sm font-medium text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
          >
            How Inverge works
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </header>

        <main className="flex flex-1 justify-center px-5 pt-3 pb-12 sm:px-8 sm:py-8 lg:px-12 lg:py-10 lg:pb-10 xl:px-16">
          <div className="w-full max-w-[35rem] lg:my-auto">
            <div className="mb-5 sm:mb-6">
              <h1 className="text-balance text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl lg:text-4xl">
                {title}
              </h1>
              <div className="mt-2 max-w-[33rem] text-sm leading-relaxed text-muted sm:text-base">
                {description}
              </div>
            </div>

            {children}
          </div>
        </main>
      </section>

      <aside className="relative hidden h-full overflow-hidden bg-contrast p-8 text-white lg:flex lg:flex-col lg:p-10 xl:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-brand/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-32 size-96 rounded-full bg-brand/10 blur-3xl"
        />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[32rem] flex-col justify-between">
          <div className="shrink-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/58">
              {eyebrow}
            </p>
            <h2 className="mt-6 max-w-lg text-balance text-3xl font-bold tracking-[-0.045em] lg:mt-8 xl:text-4xl">
              {panelTitle}
            </h2>
            <p className="mt-3 max-w-md text-base leading-relaxed text-white/65">
              {panelDescription}
            </p>
          </div>

          <div
            data-slot="auth-visual"
            className="relative my-6 min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/12 shadow-2xl shadow-black/40"
          >
            <Image
              src="/images/auth_img.png"
              alt="African builder working on hardware in a workshop"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              priority
              className="object-cover object-center"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-contrast/70 via-transparent to-transparent"
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
