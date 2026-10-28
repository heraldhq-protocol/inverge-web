import Link from "next/link";

import { Container } from "@/components/ui/container";
import { StatePanel } from "@/components/ui/state-panel";

export default function PublicProfileNotFound() {
  return (
    <Container className="py-10 sm:py-14">
      <StatePanel
        variant="empty"
        eyebrow="Profile not found"
        title="We couldn't find that creator"
        description="The handle may have changed, or this creator has not published a public profile yet. Public profiles use the exact handle the creator chose."
        action={
          <Link
            href="/ideas"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Explore ideas
          </Link>
        }
      />
    </Container>
  );
}
