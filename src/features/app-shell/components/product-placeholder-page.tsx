import Link from "next/link";

import { StatePanel } from "@/components/ui/state-panel";

export function ProductPlaceholderPage({
  description,
  eyebrow,
  title,
  variant = "empty",
}: {
  description: string;
  eyebrow: string;
  title: string;
  variant?: "empty" | "unavailable";
}) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      <StatePanel
        variant={variant}
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={
          <Link
            href="/home"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Return home
          </Link>
        }
      />
    </div>
  );
}
