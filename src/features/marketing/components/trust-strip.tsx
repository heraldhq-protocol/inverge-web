import { Container } from "@/features/marketing/components/container";

const trustItems = [
  {
    icon: (
      <svg
        className="size-6 text-ink"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="8" width="18" height="4" rx="1" />
        <path d="M12 8v13" />
        <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
        <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
      </svg>
    ),
    title: "Rewards and donation based only.",
  },
  {
    icon: (
      <svg
        className="size-6 text-ink"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "Funds held in escrow, not by Inverge.",
  },
  {
    icon: (
      <svg
        className="size-6 text-ink"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    title: "Builders verified before review.",
  },
  {
    icon: (
      <svg
        className="size-6 text-ink"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="m9 15 2 2 4-4" />
      </svg>
    ),
    title: "Every release has a public receipt.",
  },
];

export function TrustStrip() {
  return (
    <section className="border-y border-border/70 bg-surface/80 py-8 lg:py-10">
      <Container>
        <ul
          data-reveal-stagger="0.07"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8"
        >
          {trustItems.map(({ icon, title }) => (
            <li
              key={title}
              className="flex items-center gap-4 sm:flex-col sm:items-center sm:text-center"
            >
              <div className="flex size-10 shrink-0 items-center justify-center">
                {icon}
              </div>
              <p className="text-sm font-semibold leading-snug text-ink sm:max-w-[200px]">
                {title}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
