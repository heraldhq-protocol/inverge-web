import { Container } from '@/components/ui/container';

/**
 * TODO (pre-launch, blocking): every name below is a placeholder standing in for a real
 * partner. Displaying a third-party name or logotype as an endorsement needs written
 * permission from that organisation — swap these for approved assets, or cut the section.
 * Do not ship this list as-is.
 */
const PARTNERS = [
  'techstars_',
  'Ingressive',
  'Flutterwave',
  'Ventures Platform',
  'Paystack',
  'Future Africa',
] as const;

export function BackedBy() {
  return (
    <section
      id="backed-by"
      aria-label="Organisations backing Inverge"
      className="border-y border-border bg-paper py-10"
      data-reveal
    >
      <Container>
        <p className="mb-7 text-center text-xs font-bold uppercase tracking-widest text-ink-muted" data-reveal>
          Backed by
        </p>

        <div
          data-marquee
          className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        >
          {/* Spacing lives on the items, not as flex `gap`. With `gap` the duplicated track is
              one half-gap wider than two clean cycles, so translateX(-50%) visibly jumps. */}
          <div data-marquee-track className="flex w-max items-center">
            {PARTNERS.map((name) => (
              <Logotype key={name} name={name} />
            ))}
            {/* Second pass makes the loop seamless; it is a visual duplicate, so it stays
                out of the accessibility tree. */}
            {PARTNERS.map((name) => (
              <Logotype key={`clone-${name}`} name={name} clone />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function Logotype({ name, clone = false }: { name: string; clone?: boolean }) {
  return (
    <span
      aria-hidden={clone || undefined}
      data-marquee-clone={clone || undefined}
      className="mr-14 shrink-0 whitespace-nowrap font-display text-xl font-black tracking-tight text-ink/45 sm:mr-20 sm:text-2xl"
    >
      {name}
    </span>
  );
}
