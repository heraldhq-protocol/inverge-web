import Link from "next/link";

import { BrandMark } from "@/components/shared/brand-mark";
import { Container } from "@/features/marketing/components/container";
import { NewsletterField } from "@/features/marketing/components/newsletter-field";

const groups = [
  {
    label: "Learn",
    links: [
      ["Explore ideas", "/discover"],
      ["How it works", "/#how-it-works"],
      ["Guides", "/guides"],
      ["Help centre", "/help"],
      ["Journal", "/blog"],
    ],
  },
  {
    label: "Company",
    links: [
      ["About", "/about"],
      ["Careers", "/careers"],
      ["Contact", "/contact"],
    ],
  },
  {
    label: "Legal",
    links: [
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-contrast py-16 text-white lg:py-20">
      <Container>
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-4 sm:col-span-2 lg:col-span-3">
            <BrandMark inverted />
            <p className="max-w-sm text-sm leading-6 text-white/68">
              Backing ideas. Built on accountability.
            </p>
            <a
              className="inline-flex min-h-11 items-center text-sm text-white/75 underline decoration-brand underline-offset-4 hover:text-white"
              href="mailto:hello@inverge.africa"
            >
              hello@inverge.africa
            </a>
          </div>

          {groups.map((group) => (
            <nav
              key={group.label}
              aria-label={`${group.label} links`}
              className="lg:col-span-2"
            >
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                {group.label}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {group.links.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      className="text-sm text-white/75 hover:text-white"
                      href={href}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="space-y-3 sm:col-span-2 lg:col-span-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
              Stay updated
            </h2>
            <p className="text-sm leading-6 text-white/68">
              Get updates on new ideas, campaigns, and the product launch.
            </p>
            <NewsletterField />
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-8 text-xs text-white/52 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Inverge. Built in Africa for builders everywhere.</p>
          <p>Rewards and donation crowdfunding only. No investment returns.</p>
        </div>
      </Container>
    </footer>
  );
}
