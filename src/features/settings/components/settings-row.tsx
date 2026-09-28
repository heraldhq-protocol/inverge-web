import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function SettingsRow({
  action,
  children,
  description,
  icon: Icon,
  mobileAction = "below",
  title,
  tone = "default",
}: {
  action?: ReactNode;
  children?: ReactNode;
  description?: string;
  icon: LucideIcon;
  mobileAction?: "below" | "inline";
  title: string;
  tone?: "danger" | "default";
}) {
  return (
    <li
      className={`grid gap-x-3 gap-y-2 p-4 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-x-4 sm:px-5 ${
        mobileAction === "inline"
          ? "grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center"
          : "grid-cols-[2.5rem_minmax(0,1fr)]"
      }`}
    >
      <span
        className={`col-start-1 row-start-1 grid size-10 place-items-center rounded-xl ${
          tone === "danger"
            ? "bg-danger/[0.08] text-danger"
            : "bg-canvas text-muted"
        }`}
        aria-hidden="true"
      >
        <Icon className="size-5" strokeWidth={1.7} />
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
          <p className="mt-0.5 text-xs leading-5 text-muted">{description}</p>
        ) : null}
        {children}
      </div>
      {action ? (
        <div
          className={`flex min-h-11 items-center justify-end sm:col-start-3 sm:row-start-1 ${
            mobileAction === "inline"
              ? "col-start-3 row-start-1"
              : "col-start-2 row-start-2"
          }`}
        >
          {action}
        </div>
      ) : null}
    </li>
  );
}
