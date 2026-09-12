import { Container } from "@/features/marketing/components/container";
import { Prose } from "@/features/marketing/components/prose";

export type LegalSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export function LegalDocument({ sections }: { sections: LegalSection[] }) {
  return (
    <Container className="py-12 sm:py-16">
      <div className="grid gap-12 lg:grid-cols-[14rem_1fr] lg:gap-16">
        <nav
          aria-label="On this page"
          className="lg:sticky lg:top-8 lg:self-start"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            On this page
          </p>
          <ol className="mt-4 space-y-1 border-l border-border">
            {sections.map((section, index) => {
              const id = section.heading
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
              return (
                <li key={section.heading}>
                  <a
                    className="block py-2 pl-4 text-sm text-muted hover:text-ink"
                    href={`#${id}`}
                  >
                    <span className="mr-2 font-mono text-xs text-brand">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {section.heading}
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
        <Prose>
          {sections.map((section) => {
            const id = section.heading
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");
            return (
              <section
                key={section.heading}
                className="border-b border-border pb-10 last:border-0"
              >
                <h2 id={id}>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            );
          })}
        </Prose>
      </div>
    </Container>
  );
}
