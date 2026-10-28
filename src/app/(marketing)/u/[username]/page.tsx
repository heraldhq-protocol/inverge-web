import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/ui/container";
import { StatePanel } from "@/components/ui/state-panel";
import { PublicProfileView } from "@/features/profile/components/public-profile";
import { getPublicProfile } from "@/features/profile/server/public-profile";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const result = await getPublicProfile(username);

  if (result.status !== "found") {
    return { robots: { follow: false, index: false } };
  }

  const { profile } = result;
  const name = profile.displayName ?? `@${profile.username}`;

  return buildPageMetadata({
    description:
      profile.bio ??
      `Public ideas and creator activity from ${name} on Inverge.`,
    og: {
      alt: `${name} on Inverge`,
      eyebrow: "Creator",
      template: "default",
    },
    path: `/u/${profile.username}`,
    title: name,
  });
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const result = await getPublicProfile(username);

  if (result.status === "not_found") notFound();

  if (result.status === "unavailable") {
    return (
      <Container className="py-10 sm:py-14">
        <StatePanel
          variant="unavailable"
          eyebrow="Profile unavailable"
          title="We couldn't load this profile"
          description="The profile service is not reachable right now. Nothing has been hidden or changed; please try again shortly."
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

  return <PublicProfileView profile={result.profile} />;
}
