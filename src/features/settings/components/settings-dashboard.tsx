import {
  Bell,
  Compass,
  KeyRound,
  Mail,
  Settings2,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Eyebrow } from "@/components/ui/eyebrow";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  AccountIdentityCard,
  type IdentityBadge,
} from "@/features/settings/components/account-identity-card";
import { AccountSettings } from "@/features/settings/components/account-settings";
import { EmailSettings } from "@/features/settings/components/email-settings";
import { FeedSettings } from "@/features/settings/components/feed-settings";
import { NotificationSettings } from "@/features/settings/components/notification-settings";
import { ProfileSettingsForm } from "@/features/settings/components/profile-settings-form";
import { SettingsRow } from "@/features/settings/components/settings-row";
import {
  SettingsCard,
  SettingsSection,
} from "@/features/settings/components/settings-section";
import { SettingsOverview } from "@/features/settings/components/settings-overview";
import { SettingsTabs } from "@/features/settings/components/settings-tabs";
import { SignInSettings } from "@/features/settings/components/sign-in-settings";
import type { SettingsData } from "@/features/settings/types";

const actionLinkClass =
  "inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-brand-strong transition-colors hover:bg-brand/[0.07] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

/**
 * Inverge settings workspace.
 *
 * Values come from `GET /me/settings` on a live account. A preview session and
 * an unreachable API are labelled explicitly and leave the controls read-only,
 * so a control never claims a server write that did not happen.
 */
export function SettingsDashboard({
  adminEntry,
  data,
  verification = { label: "Not started", tone: "neutral" },
}: {
  adminEntry?: ReactNode;
  data: SettingsData;
  verification?: IdentityBadge;
}) {
  const emailVerified = data.account.emailVerified;
  const additionalMethods = data.connections.filter(
    (connection) =>
      connection.id !== "email" && connection.status !== "not-connected",
  ).length;
  const live = data.source === "api";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-5 sm:px-6 sm:pb-28 sm:pt-6 lg:px-8 lg:py-7 xl:px-10">
      <header className="relative isolate overflow-hidden rounded-2xl border border-border bg-canvas shadow-[0_14px_38px_rgba(13,29,21,0.045)]">
        <Image
          src="/images/bg/settings-light-bg.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 1536px) 1400px, 100vw"
          className="pointer-events-none -z-10 object-cover object-[72%_center]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-canvas via-canvas/94 to-canvas/30 sm:via-canvas/82 sm:to-canvas/10"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-canvas/45 via-transparent to-transparent"
        />

        <div className="max-w-2xl px-5 py-6 sm:px-7 sm:py-7 lg:px-8 lg:py-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <Eyebrow>Workspace settings</Eyebrow>
            {!live ? (
              <span className="inline-flex items-center rounded-full border border-border/80 bg-surface/70 px-2.5 py-0.5 text-[0.625rem] font-semibold text-muted backdrop-blur">
                {data.source === "preview"
                  ? "Preview session"
                  : "API unavailable"}
              </span>
            ) : null}
          </div>
          <h1 className="mt-2 text-balance text-[2rem] font-bold leading-[1.05] tracking-[-0.045em] text-ink sm:text-4xl">
            Settings
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted sm:text-[0.9375rem]">
            {data.source === "api"
              ? "Manage your profile, sign-in, verification, wallet, discovery and account controls. Changes save to your account."
              : data.source === "preview"
                ? "This is a local preview session. Profile and preference fields show sample values and cannot be saved."
                : "Settings could not be loaded from the API. Your signed-in identity is shown, and controls stay read-only until it reconnects."}
          </p>
        </div>
      </header>

      <div className="mt-4">
        <AccountIdentityCard
          badge={verification}
          profile={data.profile}
          source={data.source}
        />
      </div>

      <SettingsTabs />

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_19rem] xl:items-start xl:gap-6">
        <div className="min-w-0 space-y-5">
          <SettingsSection
            id="profile"
            icon={UserRound}
            title="Profile"
            description="The name, picture, and location people see on your ideas, feedback, and public profile."
            status={
              <StatusBadge variant={live ? "success" : "neutral"}>
                {live ? "Saved to account" : "Read-only"}
              </StatusBadge>
            }
          >
            <ProfileSettingsForm profile={data.profile} source={data.source} />
          </SettingsSection>

          <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
            <SettingsSection
              id="sign-in"
              icon={KeyRound}
              title="Signing in"
              description="Review the methods connected to your Inverge account."
              status={
                <StatusBadge
                  variant={additionalMethods > 0 ? "success" : "neutral"}
                >
                  {additionalMethods > 0
                    ? `${additionalMethods} connected`
                    : "Email only"}
                </StatusBadge>
              }
            >
              <SignInSettings connections={data.connections} />
            </SettingsSection>

            <SettingsSection
              id="email"
              icon={Mail}
              title="Email"
              description="The address used for account notices, notifications and important updates."
              status={
                <StatusBadge
                  variant={
                    emailVerified
                      ? "success"
                      : data.account.email
                        ? "warning"
                        : "neutral"
                  }
                >
                  {emailVerified
                    ? "Verified"
                    : data.account.email
                      ? "Not verified"
                      : "No email"}
                </StatusBadge>
              }
            >
              <EmailSettings
                account={data.account}
                challenge={data.emailChallenge}
                fallbackEmail={data.profile.email}
                pendingEmail={data.pendingEmail}
                source={data.source}
              />
            </SettingsSection>

            <SettingsSection
              id="verification"
              icon={ShieldCheck}
              title="Verification"
              description="Complete verification to unlock creator and funding actions. Verification appears only when an action requires it."
              status={
                <StatusBadge variant={verification.tone}>
                  {verification.label}
                </StatusBadge>
              }
            >
              <SettingsCard>
                <SettingsRow
                  icon={ShieldCheck}
                  title="Identity verification"
                  description="Open the verification centre for the live status on this account. Inverge stores provider references and outcomes, not raw identity documents."
                  action={
                    <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
                      <Link
                        href="/guides/identity-verification"
                        className="inline-flex min-h-11 items-center rounded-xl px-2.5 text-sm font-semibold text-muted transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      >
                        How it works
                      </Link>
                      <Link
                        href="/d/settings/verification"
                        className={actionLinkClass}
                      >
                        Open verification
                      </Link>
                    </div>
                  }
                />
              </SettingsCard>
              <p className="px-4 py-2.5 text-xs leading-5 text-muted sm:px-5">
                Verification outcomes come from the provider. This page cannot
                approve an identity by itself.
              </p>
            </SettingsSection>

            <SettingsSection
              id="wallet"
              icon={Wallet}
              title="Wallet"
              description="Your wallet is tied to your Inverge identity. Balances, activity, and refund records live in the wallet, not here."
              status={
                <StatusBadge
                  variant={data.wallet.connected ? "success" : "neutral"}
                >
                  {data.wallet.connected ? "Connected" : "Not connected"}
                </StatusBadge>
              }
            >
              <SettingsCard>
                <SettingsRow
                  icon={Wallet}
                  title="Wallet and payments"
                  description={
                    data.wallet.connected
                      ? "Review the wallet account tied to this identity, contribution activity, and refund records."
                      : "No wallet is connected to this account yet. Open the wallet to set one up."
                  }
                  action={
                    <Link href="/d/wallet" className={actionLinkClass}>
                      Open wallet
                    </Link>
                  }
                />
                <SettingsRow
                  icon={KeyRound}
                  title="Wallet security"
                  description="See what protects signing, why key material is never handled here, and which security controls are connected."
                  action={
                    <Link href="/d/wallet/security" className={actionLinkClass}>
                      Review security
                    </Link>
                  }
                />
              </SettingsCard>
              <p className="px-4 py-2.5 text-xs leading-5 text-muted sm:px-5">
                No private key, seed phrase, or signing share is stored by
                Inverge, and key export is unavailable. Wallet addresses are
                never shown on this page.
              </p>
            </SettingsSection>

            <SettingsSection
              id="feed"
              icon={Compass}
              title="Your feed"
              description="Choose what Inverge should prioritize when showing you ideas."
            >
              <FeedSettings feed={data.feed} source={data.source} />
            </SettingsSection>

            <SettingsSection
              id="notification-preferences"
              icon={Bell}
              title="Notifications"
              description="Choose which updates Inverge should send you."
            >
              <NotificationSettings
                initialPreferences={data.notifications}
                source={data.source}
              />
            </SettingsSection>
          </div>

          <SettingsSection
            id="account"
            icon={Settings2}
            title="Account"
            description="Manage account-level requests, data rights, sign-out, and account deletion."
          >
            <AccountSettings requests={data.requests} source={data.source} />
          </SettingsSection>
        </div>

        <SettingsOverview
          adminEntry={adminEntry}
          emailVerified={emailVerified}
          source={data.source}
          verification={verification}
          walletConnected={data.wallet.connected}
        />
      </div>
    </div>
  );
}
