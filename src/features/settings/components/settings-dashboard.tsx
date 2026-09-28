import { ShieldCheck } from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/ui/status-badge";
import { ProductSearch } from "@/features/app-shell/components/product-search";
import { AccountSettings } from "@/features/settings/components/account-settings";
import { FeedSettings } from "@/features/settings/components/feed-settings";
import { NotificationSettings } from "@/features/settings/components/notification-settings";
import { ProfileSettingsForm } from "@/features/settings/components/profile-settings-form";
import {
  SettingsCard,
  SettingsSection,
} from "@/features/settings/components/settings-section";
import { SettingsRow } from "@/features/settings/components/settings-row";
import { SignInSettings } from "@/features/settings/components/sign-in-settings";
import type { SettingsData } from "@/features/settings/types";

const sections = [
  { href: "#profile", label: "Profile" },
  { href: "#sign-in", label: "Sign in" },
  { href: "#verification", label: "Verification" },
  { href: "#feed", label: "Your feed" },
  { href: "#notification-preferences", label: "Notifications" },
  { href: "#account", label: "Account" },
] as const;

export function SettingsDashboard({ data }: { data: SettingsData }) {
  return (
    <div className="mx-auto w-full max-w-[90rem] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10">
      <ProductSearch action="/home" />

      <header className="mt-8 sm:mt-10">
        <div className="flex items-center gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-strong">
            Settings
          </p>
          <span className="text-xs text-muted" title="Settings are sample data">
            Sample data
          </span>
        </div>
        <h1 className="mt-2 text-balance text-3xl font-bold tracking-[-0.045em] text-ink sm:text-4xl">
          Settings
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted sm:text-base">
          Manage your profile, sign-in preferences, discovery, and account
          controls.
        </p>
      </header>

      <nav
        aria-label="Settings sections"
        className="-mx-4 mt-7 overflow-x-auto border-y border-border px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
      >
        <ul className="flex min-w-max gap-2 py-2">
          {sections.map((section) => (
            <li key={section.href}>
              <a
                href={section.href}
                className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 max-w-5xl space-y-10 sm:mt-10 sm:space-y-12">
        <SettingsSection
          id="profile"
          title="Profile"
          description="The name, picture, and location people see on your ideas, feedback, and profile."
        >
          <ProfileSettingsForm profile={data.profile} />
        </SettingsSection>

        <SettingsSection
          id="sign-in"
          title="Signing in"
          description="Review the methods connected to your Inverge account."
        >
          <SignInSettings connections={data.connections} />
        </SettingsSection>

        <SettingsSection
          id="verification"
          title="Verification"
          description="Verification appears only when a funding or creator action requires it."
        >
          <SettingsCard>
            <SettingsRow
              icon={ShieldCheck}
              title="Identity verification"
              description="Not required right now. Inverge stores provider references and status, not raw identity documents."
              action={
                <div className="flex items-center gap-2 sm:gap-3">
                  <StatusBadge>Not required</StatusBadge>
                  <Link
                    href="/guides/identity-verification"
                    className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-brand-strong transition-colors hover:bg-brand/[0.07] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    Learn more
                  </Link>
                </div>
              }
            />
          </SettingsCard>
        </SettingsSection>

        <SettingsSection
          id="feed"
          title="Your feed"
          description="Choose what Inverge should prioritize when showing you ideas."
        >
          <FeedSettings feed={data.feed} />
        </SettingsSection>

        <SettingsSection
          id="notification-preferences"
          title="Notifications"
          description="Choose which updates Inverge should send you."
        >
          <NotificationSettings initialPreferences={data.notifications} />
        </SettingsSection>

        <SettingsSection
          id="account"
          title="Account"
          description="Manage account-level requests and actions."
        >
          <AccountSettings />
        </SettingsSection>
      </div>
    </div>
  );
}
