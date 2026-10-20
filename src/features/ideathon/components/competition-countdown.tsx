"use client";

import { useSyncExternalStore } from "react";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

// One shared one-second clock. Several countdowns can be mounted at once, so the timer
// starts with the first subscriber and stops with the last. The server snapshot is 0,
// which renders neutral placeholders; the browser clock is published after hydration.
let clockNow = 0;
let clockTimer: number | null = null;
const clockListeners = new Set<() => void>();

function emitClockTick() {
  clockNow = Date.now();
  for (const listener of clockListeners) listener();
}

function subscribeToClock(listener: () => void) {
  clockListeners.add(listener);
  if (clockTimer === null) {
    clockNow = Date.now();
    clockTimer = window.setInterval(emitClockTick, 1_000);
    listener();
  }
  return () => {
    clockListeners.delete(listener);
    if (clockListeners.size === 0 && clockTimer !== null) {
      window.clearInterval(clockTimer);
      clockTimer = null;
    }
  };
}

function getClockSnapshot(): number {
  return clockNow;
}

function getClockServerSnapshot(): number {
  return 0;
}

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function remainingUntil(target: number, now: number): Remaining | null {
  const distance = target - now;
  if (distance <= 0) return null;

  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance % 86_400_000) / 3_600_000),
    minutes: Math.floor((distance % 3_600_000) / 60_000),
    seconds: Math.floor((distance % 60_000) / 1_000),
  };
}

/**
 * Countdown to the entry deadline.
 *
 * Renders neutral placeholders on the server and starts ticking after mount, so
 * a static render never disagrees with the browser clock. The visual digits are
 * hidden from assistive technology; the full deadline is announced once as
 * text. A missing or passed deadline renders "Submissions closed" rather than a
 * misleading zero counter.
 */
export function CompetitionCountdown({
  endsAt,
  startsAt,
}: {
  endsAt: string;
  startsAt: string;
}) {
  const target = new Date(endsAt).getTime();
  const starts = new Date(startsAt).getTime();
  const now = useSyncExternalStore(
    subscribeToClock,
    getClockSnapshot,
    getClockServerSnapshot,
  );

  const deadlineLabel = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(endsAt));

  if (now === 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted">Next ideathon ends in</span>
        <span aria-hidden="true" className="flex items-center gap-1">
          {["--", "--", "--", "--"].map((value, index) => (
            <span
              key={index}
              className="grid size-8 place-items-center rounded-md border border-border bg-surface text-xs font-semibold tabular-nums text-muted"
            >
              {value}
            </span>
          ))}
        </span>
        <span className="sr-only">Entries close on {deadlineLabel}.</span>
      </div>
    );
  }

  if (now < starts) {
    return (
      <p className="text-xs font-medium text-ink-soft">
        Entries open on{" "}
        {new Intl.DateTimeFormat("en-GB", {
          day: "numeric",
          month: "long",
          timeZone: "UTC",
        }).format(new Date(startsAt))}
        .
      </p>
    );
  }

  const remaining = remainingUntil(target, now);

  if (!remaining) {
    return (
      <p className="inline-flex items-center gap-2 text-xs font-medium text-ink-soft">
        <span aria-hidden="true" className="size-2 rounded-full bg-warning" />
        Entries closed on {deadlineLabel}.
      </p>
    );
  }

  const boxes = [
    { label: "Days", value: remaining.days },
    { label: "Hrs", value: remaining.hours },
    { label: "Min", value: remaining.minutes },
    { label: "Sec", value: remaining.seconds },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted">Next ideathon ends in</span>
      <span aria-hidden="true" className="flex items-center gap-1">
        {boxes.map(({ label, value }) => (
          <span
            key={label}
            className="inline-flex items-baseline gap-0.5 rounded-md border border-border bg-surface px-1.5 py-1 text-xs font-semibold tabular-nums text-ink"
          >
            {pad(value)}
            <span className="text-[0.5625rem] font-medium uppercase text-muted">
              {label.slice(0, 1)}
            </span>
          </span>
        ))}
      </span>
      <span className="sr-only">
        Entries close on {deadlineLabel}. Time remaining is announced visually.
      </span>
    </div>
  );
}
