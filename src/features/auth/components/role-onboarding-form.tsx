"use client";

import { Check, Lightbulb, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

type StartingPoint = "build" | "support";

const startingPoints = [
  {
    value: "support" as const,
    eyebrow: "Discover & support",
    title: "Find ideas worth backing",
    description:
      "Explore early-stage ideas, support promising builders, and follow progress from validation to delivery.",
    features: ["Discover new ideas", "Give feedback", "Make pre-pledges"],
    icon: Search,
  },
  {
    value: "build" as const,
    eyebrow: "Build & validate",
    title: "Test an idea with real people",
    description:
      "Publish what you are building, gather support and feedback, and understand demand before asking people to fund it.",
    features: ["Publish an idea", "Gather validation", "Build supporters"],
    icon: Lightbulb,
  },
] as const;

export function RoleOnboardingForm() {
  const router = useRouter();
  const [startingPoint, setStartingPoint] = useState<StartingPoint | null>(
    null,
  );
  const [status, setStatus] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!startingPoint) {
      setStatus("Choose where you would like to start.");
      return;
    }

    setStatus("");
    router.push("/home");
  }

  function handleSkip() {
    setStartingPoint(null);
    setStatus("");
    router.push("/home");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
      <fieldset className="space-y-2.5 sm:space-y-3">
        <legend className="sr-only">Choose your starting point</legend>
        {startingPoints.map((option) => {
          const Icon = option.icon;

          return (
            <label key={option.value} className="group relative block">
              <input
                type="radio"
                name="startingPoint"
                value={option.value}
                checked={startingPoint === option.value}
                onChange={() => {
                  setStartingPoint(option.value);
                  setStatus("");
                }}
                className="peer sr-only"
              />
              <span className="block cursor-pointer rounded-2xl border border-border bg-surface p-4 transition-all hover:border-brand/45 peer-checked:border-brand peer-checked:ring-1 peer-checked:ring-brand peer-checked:bg-brand/[0.035] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-brand sm:p-5">
                <span className="flex items-start justify-between gap-3 sm:gap-4">
                  <span className="flex min-w-0 items-start gap-2.5 sm:gap-3">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-canvas text-brand-strong transition-colors group-has-[:checked]:bg-brand/10 sm:size-9">
                      <Icon className="size-4 sm:size-4.5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-brand-strong sm:text-xs">
                        {option.eyebrow}
                      </span>
                      <span className="mt-0.5 block text-base font-bold tracking-tight text-ink sm:mt-1 sm:text-lg">
                        {option.title}
                      </span>
                    </span>
                  </span>
                  <span className="mt-0.5 grid size-5.5 shrink-0 place-items-center rounded-full border-2 border-border text-transparent transition-all group-has-[:checked]:border-brand group-has-[:checked]:bg-brand group-has-[:checked]:text-white sm:size-6">
                    <Check
                      className="size-3 stroke-[2.5] sm:size-3.5"
                      aria-hidden="true"
                    />
                  </span>
                </span>

                <span className="mt-2 block text-xs leading-relaxed text-muted sm:mt-2.5 sm:text-sm">
                  {option.description}
                </span>
                <span className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 sm:gap-x-4 sm:gap-y-1.5">
                  {option.features.map((feature) => (
                    <span
                      key={feature}
                      className="inline-flex items-center gap-1 text-[11px] text-muted sm:text-xs"
                    >
                      <Check
                        className="size-3 text-brand-strong sm:size-3.5"
                        aria-hidden="true"
                      />
                      {feature}
                    </span>
                  ))}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <p className="text-center text-xs leading-relaxed text-muted sm:text-left">
        You are not locked into a role. This only helps Inverge choose where to
        start.
      </p>

      <div className="space-y-1.5 pt-1">
        <button
          type="submit"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-55 sm:min-h-12"
        >
          Continue
        </button>
        <button
          type="button"
          onClick={handleSkip}
          className="inline-flex min-h-10 w-full items-center justify-center rounded-xl px-6 text-sm font-semibold text-muted transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
        >
          Skip for now
        </button>
      </div>
      <p
        aria-live="polite"
        className="min-h-5 text-center text-xs leading-5 text-muted"
      >
        {status}
      </p>
    </form>
  );
}
