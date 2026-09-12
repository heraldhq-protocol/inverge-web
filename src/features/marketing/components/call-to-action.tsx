import { ButtonLink } from "@/features/marketing/components/button-link";
import { Container } from "@/features/marketing/components/container";

type CallToActionProps = {
  title: string;
  body: string;
  label: string;
  href: string;
};

export function CallToAction({ title, body, label, href }: CallToActionProps) {
  return (
    <section className="bg-canvas py-14 sm:py-18">
      <Container>
        <div className="rounded-[2rem] bg-contrast px-7 py-12 text-center text-white sm:px-12 sm:py-16">
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-white/68">
            {body}
          </p>
          <div className="mt-8">
            <ButtonLink href={href}>{label}</ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
