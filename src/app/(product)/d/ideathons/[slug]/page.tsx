import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";

import { StatePanel } from "@/components/ui/state-panel";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { readSessionToken } from "@/features/auth/server/session";
import { ParticipantProgrammeWorkspace } from "@/features/programmes/components/participant-programme-workspace";
import { RetryButton } from "@/features/programmes/components/retry-button";
import {
  fetchMyIdeas,
  fetchParticipantProgramme,
} from "@/features/programmes/api/participant";
import { fetchPublicProgramme } from "@/features/programmes/api/public";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchPublicProgramme(slug);
  return {
    title: result.ok ? `Enter ${result.data.title}` : "Programme workspace",
    description:
      "Register, save a private draft, submit an idea and read your published result.",
  };
}

export default async function ParticipantProgrammePage({ params }: PageProps) {
  await connection();
  const { slug } = await params;
  const preview = isPreviewAuth();
  const token = preview ? null : await readSessionToken();
  const publicResult = await fetchPublicProgramme(slug);

  if (!preview && !token) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <BackLink />
        <div className="mt-5">
          <StatePanel
            variant="empty"
            eyebrow="Programme workspace"
            title="Sign in to manage your entry"
            description="This workspace keeps drafts, submissions and results attached to your account. Browsing the public brief does not require a session."
            action={
              <Link
                href={`/auth?next=${encodeURIComponent(`/d/ideathons/${slug}`)}`}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Sign in
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  if (preview) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <BackLink />
        <div className="mt-5 rounded-2xl border border-warning/25 bg-warning/10 p-5">
          <div className="flex items-start gap-3">
            <HugeiconsIcon
              icon={InformationCircleIcon}
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-warning-strong"
            />
            <div>
              <h1 className="text-lg font-bold tracking-[-0.03em] text-ink">
                Preview identity has no programme account
              </h1>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-ink-soft">
                This environment signs in locally without exchanging a token
                with the API. Registration, drafts and submissions therefore
                cannot be recorded, and this page will not pretend they were.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {publicResult.ok ? (
                  <Link
                    href={`/ideathon/${publicResult.data.slug}`}
                    className="inline-flex min-h-11 items-center rounded-xl bg-contrast px-4 text-sm font-semibold text-white transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    Read the public brief
                  </Link>
                ) : null}
                <Link
                  href="/d/ideathons"
                  className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Back to ideathons
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!token) notFound();

  const [stateResult, ideasResult] = await Promise.all([
    fetchParticipantProgramme(token, slug),
    fetchMyIdeas(token),
  ]);

  if (!stateResult.ok) {
    if (stateResult.status === 401) {
      return (
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <BackLink />
          <div className="mt-5">
            <StatePanel
              variant="empty"
              eyebrow="Session"
              title="Your session has expired"
              description="Your draft is safe on the server. Sign in again to reopen this workspace."
              action={
                <Link
                  href={`/auth?next=${encodeURIComponent(`/d/ideathons/${slug}`)}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Sign in again
                </Link>
              }
            />
          </div>
        </div>
      );
    }

    if (stateResult.status === 404) notFound();

    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <BackLink />
        <div className="mt-5">
          <StatePanel
            variant="unavailable"
            eyebrow="Programme workspace"
            title="Your workspace is temporarily unavailable"
            description="The programme service could not load your registration or entries. Nothing has been withdrawn or changed."
            action={<RetryButton label="Reload workspace" />}
          />
        </div>
      </div>
    );
  }

  const programme = stateResult.data.programme;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <BackLink />
      <header className="mt-3">
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
          Participant workspace
        </p>
        <h1 className="mt-1 text-balance text-2xl font-bold tracking-[-0.045em] text-ink sm:text-3xl">
          {programme.title}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
          Register, draft and submit here. The public page shows the brief and
          only the entries the organiser publishes.
        </p>
      </header>

      <div className="mt-5">
        <ParticipantProgrammeWorkspace
          ideas={ideasResult.ok ? ideasResult.data : []}
          ideasUnavailable={!ideasResult.ok}
          initial={stateResult.data}
          programme={programme}
        />
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/d/ideathons"
      className="inline-flex min-h-10 items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <HugeiconsIcon
        icon={ArrowLeft02Icon}
        size={13}
        strokeWidth={2}
        aria-hidden="true"
      />
      All ideathons
    </Link>
  );
}
