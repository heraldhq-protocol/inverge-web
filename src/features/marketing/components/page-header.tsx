import { Container } from "@/features/marketing/components/container";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  note?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  note,
}: PageHeaderProps) {
  return (
    <header className="border-b border-border bg-canvas py-14 sm:py-20">
      <Container>
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="h-0.5 w-6 bg-brand" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
              {eyebrow}
            </p>
          </div>
          <h1 className="mt-4 text-balance text-4xl font-bold leading-[1.05] tracking-[-0.05em] sm:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted">
            {description}
          </p>
          {note ? (
            <p className="mt-5 inline-flex items-center gap-2 border-l-2 border-warning pl-3 text-xs font-semibold text-warning-strong">
              {note}
            </p>
          ) : null}
        </div>
      </Container>
    </header>
  );
}
