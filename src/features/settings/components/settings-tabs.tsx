"use client";

import {
  Bell,
  Compass,
  KeyRound,
  Mail,
  Settings2,
  ShieldCheck,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

type SettingsSectionLink = {
  icon: LucideIcon;
  id: string;
  label: string;
};

const defaultSectionId = "profile";

export const settingsSections: readonly SettingsSectionLink[] = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "sign-in", label: "Sign in", icon: KeyRound },
  { id: "email", label: "Email", icon: Mail },
  { id: "verification", label: "Verification", icon: ShieldCheck },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "feed", label: "Feed", icon: Compass },
  { id: "notification-preferences", label: "Notifications", icon: Bell },
  { id: "account", label: "Account", icon: Settings2 },
] as const;

/**
 * In-page settings navigation.
 *
 * These are real anchors, not a `tablist`: every section is rendered at once and
 * each link is shareable and works without JavaScript. The scroll listener only
 * supplies the current-section highlight; it never gates access to a panel.
 */
export function SettingsTabs() {
  const [active, setActive] = useState(defaultSectionId);

  useEffect(() => {
    let frame = 0;

    function update() {
      frame = 0;
      const marker = window.scrollY + 190;
      const hash = window.location.hash.replace(/^#/, "");
      const lastSection = settingsSections.at(-1)?.id ?? defaultSectionId;
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      let current = atBottom ? lastSection : defaultSectionId;
      let currentTop = Number.NEGATIVE_INFINITY;

      if (!atBottom) {
        for (const section of settingsSections) {
          const element = document.getElementById(section.id);
          if (!element) continue;
          const top = element.getBoundingClientRect().top + window.scrollY;
          if (top > marker) continue;
          // Some sections share a row on wide screens. Prefer the section the
          // reader followed from the URL rather than the last one in that row.
          if (top > currentTop) {
            current = section.id;
            currentTop = top;
          } else if (top === currentTop && section.id === hash) {
            current = section.id;
          }
        }
      }

      setActive(current);
    }

    function onScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="sticky top-16 z-20 -mx-4 mt-4 border-y border-border/80 bg-canvas/94 backdrop-blur sm:-mx-6 lg:mx-0 lg:rounded-xl lg:border">
      <nav aria-label="Settings sections">
        <ul className="settings-scroll-x flex items-stretch gap-0.5 overflow-x-auto px-4 py-1.5 sm:px-6 lg:px-2">
          {settingsSections.map(({ icon: Icon, id, label }) => {
            const isActive = active === id;

            return (
              <li key={id} className="shrink-0">
                <a
                  href={`#${id}`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => setActive(id)}
                  className={`relative inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    isActive
                      ? "bg-brand/[0.08] font-semibold text-brand-strong"
                      : "font-medium text-muted hover:bg-surface hover:text-ink"
                  }`}
                >
                  <Icon
                    className={`size-4 shrink-0 ${
                      isActive ? "text-brand-strong" : "text-muted"
                    }`}
                    strokeWidth={isActive ? 2.1 : 1.7}
                    aria-hidden="true"
                  />
                  {label}
                  {isActive ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 -bottom-1.5 h-0.5 rounded-full bg-brand"
                    />
                  ) : null}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-9 bg-gradient-to-l from-canvas to-transparent lg:hidden"
      />
    </div>
  );
}
