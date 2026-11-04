import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { Container } from "@/components/ui/container";
import { StatePanel } from "@/components/ui/state-panel";
import { CompetitionNav } from "@/features/ideathon/components/competition-nav";
import { ProgrammeDetail } from "@/features/programmes/components/programme-detail";
import { RetryButton } from "@/features/programmes/components/retry-button";
import {
  fetchPublicEntries,
  fetchPublicProgramme,
} from "@/features/programmes/api/public";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchPublicProgramme(slug);

  if (!result.ok) {
    return buildPageMetadata({
      description: "An Inverge ideathon programme.",
      robots: result.code === "NOT_FOUND" ? "noindex" : "all",
      og: { eyebrow: "Ideathon", template: "ideathon" },
      path: `/ideathon/${slug}`,
      title: "Ideathon programme",
    });
  }

  return buildPageMetadata({
    description: result.data.tagline || result.data.description.slice(0, 160),
    og: { eyebrow: "Ideathon", template: "ideathon" },
    path: `/ideathon/${result.data.slug}`,
    title: result.data.title,
  });
}

export default async function ProgrammeDetailPage({ params }: PageProps) {
  await connection();
  const { slug } = await params;

  const [programmeResult, entriesResult] = await Promise.all([
    fetchPublicProgramme(slug),
    fetchPublicEntries(slug),
  ]);

  if (!programmeResult.ok && programmeResult.code === "NOT_FOUND") {
    notFound();
  }

  if (!programmeResult.ok) {
    return (
      <>
        <Container className="py-8 sm:py-10">
          <CompetitionNav />
          <div className="py-10">
            <StatePanel
              variant="unavailable"
              eyebrow="Programme"
              title="This programme is temporarily unavailable"
              description="The programme service could not load this edition. This is not a missing programme and nothing has been removed from the archive."
              action={<RetryButton label="Reload programme" />}
            />
          </div>
        </Container>
      </>
    );
  }

  return (
    <ProgrammeDetail
      entries={entriesResult.ok ? entriesResult.data.data : []}
      entriesUnavailable={!entriesResult.ok}
      programme={programmeResult.data}
    />
  );
}
