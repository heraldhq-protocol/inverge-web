import { AlertTriangle, CloudOff, FileQuestion, SearchX } from "lucide-react";

type StateIllustrationVariant = "empty" | "error" | "not-found" | "unavailable";

const variants = {
  empty: {
    Icon: SearchX,
    accent: "bg-brand/12 text-brand-strong",
    orb: "bg-brand/[0.08]",
  },
  error: {
    Icon: AlertTriangle,
    accent: "bg-danger/10 text-danger",
    orb: "bg-danger/[0.07]",
  },
  "not-found": {
    Icon: FileQuestion,
    accent: "bg-brand/12 text-brand-strong",
    orb: "bg-brand/[0.08]",
  },
  unavailable: {
    Icon: CloudOff,
    accent: "bg-warning/12 text-warning-strong",
    orb: "bg-warning/[0.08]",
  },
} as const;

export function StateIllustration({
  variant,
}: {
  variant: StateIllustrationVariant;
}) {
  const { Icon, accent, orb } = variants[variant];

  return (
    <div
      aria-hidden="true"
      className="relative mx-auto grid h-28 w-40 place-items-center sm:h-32 sm:w-48"
    >
      <span className={`absolute left-2 top-3 size-12 rounded-full ${orb}`} />
      <span className="absolute bottom-4 right-4 size-8 rounded-full border border-border bg-surface" />
      <span className="absolute inset-x-5 bottom-3 h-px bg-border" />
      <span
        className={`relative grid size-20 place-items-center rounded-[1.75rem] border border-border shadow-sm ${accent}`}
      >
        <Icon className="size-9" strokeWidth={1.45} />
      </span>
    </div>
  );
}
