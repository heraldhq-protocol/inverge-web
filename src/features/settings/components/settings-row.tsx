import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * One labelled setting inside a section.
 *
 * Actions stack below the copy by default, which keeps long descriptions
 * readable inside the two-column panel grid. Compact controls such as a switch
 * opt into the inline placement with `actionPlacement="inline"`. The icon is
 * decorative and the title always carries the meaning.
 */
export function SettingsRow({
  action,
  actionPlacement = "below",
  children,
  description,
  icon: Icon,
  title,
  tone = "default",
}: {
  action?: ReactNode;
  actionPlacement?: "below" | "inline";
  children?: ReactNode;
  description?: string;
  icon: LucideIcon;
  title: string;
  tone?: "danger" | "default";
}) {
  return (
    <li
      className={`grid gap-x-3 gap-y-2.5 px-4 py-4 sm:px-5 ${
        actionPlacement === "inline"
          ? "grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center"
          : "grid-cols-[2.5rem_minmax(0,1fr)]"
      }`}
    >
      <span
        className={`col-start-1 row-start-1 grid size-10 place-items-center rounded-xl ${
          tone === "danger"
            ? "bg-danger/[0.07] text-danger"
            : "bg-canvas text-brand-strong"
        }`}
        aria-hidden="true"
      >
        <Icon className="size-[1.15rem]" strokeWidth={1.7} />
      </span>
      <div className="col-start-2 row-start-1 min-w-0">
        <p
          className={`text-sm font-semibold ${
            tone === "danger" ? "text-danger" : "text-ink"
          }`}
        >
          {title}
        </p>
        {description ? (
          <p className="mt-0.5 max-w-2xl text-xs leading-5 text-muted">
            {description}
          </p>
        ) : null}
        {children}
      </div>
      {action ? (
        <div
          className={`flex min-h-11 flex-wrap items-center gap-2 ${
            actionPlacement === "inline"
              ? "col-start-3 row-start-1 justify-end gap-0"
              : "col-start-2 row-start-2 justify-start sm:justify-end"
          }`}
        >
          {action}
        </div>
      ) : null}
    </li>
  );
}
