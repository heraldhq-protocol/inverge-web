import { KeyRound, ShieldCheck, Wallet } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { ProductSearch } from "@/features/app-shell/components/product-search";
import { AccountSettings } from "@/features/settings/components/account-settings";
import { EmailSettings } from "@/features/settings/components/email-settings";
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
  { href: "#email", label: "Email" },
  { href: "#verification", label: "Verification" },
  { href: "#wallet", label: "Wallet" },
  { href: "#feed", label: "Your feed" },
  { href: "#notification-preferences", label: "Notifications" },
  { href: "#account", label: "Account" },
] as const;

export function SettingsDashboard({
  adminEntry,
  data,
  dataSource = "preview",
  email = null,
  emailVerified = false,
}: {
  adminEntry?: ReactNode;
  data: SettingsData;
  dataSource?: "live" | "preview";
  email?: string | null;
  emailVerified?: boolean;
}) {
  const connections = data.connections.map((connection) =>
    connection.id === "email" && dataSource === "live"
      ? {
          ...connection,
          actionLabel: emailVerified ? "Change" : email ? "Verify" : "Add",
          detail: email ?? "No address added",
          status: emailVerified
            ? ("verified" as const)
            : ("not-connected" as const),
        }
      : connection,
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10">
      <ProductSearch action="/d" />

      <header className="mt-8 sm:mt-10">
        <div className="flex items-center gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-strong">
            Settings
          </p>
          <span
            className="text-xs text-muted"
            title={
              dataSource === "live"
                ? "Settings read from your Inverge account"
                : "Settings are sample data"
            }
          >
            {dataSource === "live" ? "Your account" : "Sample data"}
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

      {adminEntry}

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
          <ProfileSettingsForm mode={dataSource} profile={data.profile} />
        </SettingsSection>

        <SettingsSection
          id="sign-in"
          title="Signing in"
          description="Review the methods connected to your Inverge account."
        >
          <SignInSettings connections={connections} />
        </SettingsSection>

        <SettingsSection
          id="email"
          title="Email"
          description="The address used for account notices. Confirmation proves mailbox control, not identity."
        >
          <EmailSettings email={email} verified={emailVerified} />
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
              description="Open the verification centre for the live status on this account. Inverge stores provider references and outcomes, not raw identity documents."
              action={
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <Link
                    href="/guides/identity-verification"
                    className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-muted transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    How it works
                  </Link>
                  <Link
                    href="/d/settings/verification"
                    className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-brand-strong transition-colors hover:bg-brand/[0.07] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    Open verification
                  </Link>
                </div>
              }
            />
          </SettingsCard>
        </SettingsSection>

        <SettingsSection
          id="wallet"
          title="Wallet"
          description="Your wallet is tied to your Inverge identity. Balances, activity, and refund records live in the wallet, not here."
        >
          <SettingsCard>
            <SettingsRow
              icon={Wallet}
              title="Wallet and payments"
              description="Review the wallet account, labelled sample balances, contribution activity, and refund records."
              action={
                <Link
                  href="/d/wallet"
                  className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-brand-strong transition-colors hover:bg-brand/[0.07] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Open wallet
                </Link>
              }
            />
            <SettingsRow
              icon={KeyRound}
              title="Wallet security"
              description="See what protects signing, why key material is never handled here, and which security controls are connected."
              action={
                <Link
                  href="/d/wallet/security"
                  className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-brand-strong transition-colors hover:bg-brand/[0.07] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Review security
                </Link>
              }
            />
          </SettingsCard>
          <p className="mt-2 text-xs leading-5 text-muted">
            No wallet is provisioned in this build. No private key, seed phrase,
            or signing share is stored by Inverge, and key export is
            unavailable.
          </p>
        </SettingsSection>

        <SettingsSection
          id="feed"
          title="Your feed"
          description="Choose what Inverge should prioritize when showing you ideas."
        >
          {dataSource === "live" ? (
            <SettingsCard>
              <p className="text-sm leading-6 text-muted">
                Feed preferences are not connected to the API yet. Your ideas
                and discovery still use the platform defaults.
              </p>
            </SettingsCard>
          ) : (
            <FeedSettings feed={data.feed} />
          )}
        </SettingsSection>

        <SettingsSection
          id="notification-preferences"
          title="Notifications"
          description="Choose which updates Inverge should send you."
        >
          {dataSource === "live" ? (
            <SettingsCard>
              <p className="text-sm leading-6 text-muted">
                Notification preferences are not connected to the API yet. Your
                in-app inbox is live; email and digest settings will appear here
                when the API stores them.
              </p>
            </SettingsCard>
          ) : (
            <NotificationSettings initialPreferences={data.notifications} />
          )}
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
