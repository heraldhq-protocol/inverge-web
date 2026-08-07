'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/use-auth';
import { useCurrentUser } from '@/lib/auth/use-user';
import { clearSessionToken } from '@/lib/api/client';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Pill } from '@/components/ui/pill';
import { WalletModal, type WalletTab } from '@/components/wallets/wallet-modal';

export function SettingsView() {
  const { user, logout, exportWallet, connectWallet } = useAuth();
  const { data: currentUser } = useCurrentUser();

  // Web3 Wallet modal state
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletTab, setWalletTab] = useState<WalletTab>('overview');

  // Profile form state
  const [displayName, setDisplayName] = useState(
    currentUser?.creatorProfile?.displayName ||
    currentUser?.creator?.displayName ||
    (user?.email?.address ? user.email.address.split('@')[0] : 'Amara Okonkwo')
  );
  const [location, setLocation] = useState('Lagos, Nigeria');
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  // Modals state
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Email change form state
  const userEmail = user?.email?.address ?? currentUser?.email ?? 'amara.okonkwo@gmail.com';
  const [newEmail, setNewEmail] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Connected accounts state
  const [googleConnected, setGoogleConnected] = useState(true);
  const [xConnected, setXConnected] = useState(false);

  // Your feed category & region selections
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Software',
    'Agriculture',
  ]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['Lagos']);

  // Notification toggle states
  const [milestoneUpdates, setMilestoneUpdates] = useState(true);
  const [feedbackOnIdeas, setFeedbackOnIdeas] = useState(true);
  const [categoryDigest, setCategoryDigest] = useState(false);

  // Active navigation anchor indicator
  const [activeSection, setActiveSection] = useState('profile');

  const categoriesList = ['Software', 'Agriculture', 'Film', 'Arts', 'Other'];
  const regionsList = [
    'Lagos',
    'Ibadan',
    'Abuja',
    'Kano',
    'Accra',
    'Anywhere in West Africa',
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedFeedback('Changes saved successfully');
      setTimeout(() => setSavedFeedback(null), 3000);
    }, 600);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarSrc(url);
      setShowPhotoModal(false);
      setSavedFeedback('Photo updated');
      setTimeout(() => setSavedFeedback(null), 3000);
    }
  };

  const handleChangeEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) return;
    setEmailSuccess(true);
    setTimeout(() => {
      setEmailSuccess(false);
      setShowEmailModal(false);
      setNewEmail('');
    }, 2000);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleRegion = (reg: string) => {
    setSelectedRegions((prev) =>
      prev.includes(reg) ? prev.filter((r) => r !== reg) : [...prev, reg]
    );
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl pb-24">
      {/* Header & Sub-navigation bar */}
      <div className="mb-8">
        <nav aria-label="Breadcrumbs" className="mb-2 flex items-center gap-1.5 text-xs text-ink-muted">
          <Link href="/feed" className="hover:text-ink transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="font-medium text-ink">Settings</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border pb-6">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Account Settings
            </h1>
            <p className="mt-1.5 text-sm text-ink-muted">
              Manage your personal details, Privy Web3 wallet, feed preferences, and notifications.
            </p>
          </div>
        </div>

        {/* Quick jump sub-nav pills */}
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {[
            { id: 'profile', label: 'Profile' },
            { id: 'web3-wallets', label: 'Web3 & Wallets' },
            { id: 'signing-in', label: 'Signing in' },
            { id: 'verification', label: 'Verification' },
            { id: 'your-feed', label: 'Your feed' },
            { id: 'notifications', label: 'Notifications' },
            { id: 'account', label: 'Account' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className={`rounded-full px-3 py-1.5 font-medium transition-all duration-150 shrink-0 ${
                activeSection === item.id
                  ? 'bg-ink text-white shadow-xs'
                  : 'bg-surface border border-border/80 text-ink-muted hover:bg-ink/5 hover:text-ink'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-12">
        {/* SECTION 1: PROFILE */}
        <section id="profile" className="scroll-mt-20">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-ink">Profile</h2>
          </div>
          <p className="text-sm text-ink-muted">
            The name and picture other people see on your ideas and feedback.
          </p>

          <form
            onSubmit={handleSaveProfile}
            className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6"
          >
            {/* Avatar Row with Hover Upload Affordance */}
            <div className="flex items-center gap-5">
              <div
                className="relative group cursor-pointer"
                onClick={() => setShowPhotoModal(true)}
              >
                <Avatar
                  name={displayName}
                  src={avatarSrc}
                  size={64}
                  className="ring-2 ring-border/80 transition-all group-hover:ring-accent-500/50"
                />
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/40 text-white opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-[1px]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPhotoModal(true)}
                >
                  Change photo
                </Button>
                <p className="text-xs text-ink-muted">JPG, PNG or GIF up to 5MB.</p>
              </div>
            </div>

            <div className="space-y-5 max-w-lg">
              <Field label="Display name">
                {({ id, describedBy }) => (
                  <div className="relative">
                    <input
                      id={id}
                      type="text"
                      value={displayName}
                      aria-describedby={describedBy || undefined}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full rounded-xl border border-border bg-paper/50 px-3.5 py-2.5 pl-10 text-sm text-ink transition-all focus:border-accent-500 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                    />
                    <svg className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </Field>

              <Field label="Where you're based">
                {({ id, describedBy }) => (
                  <div className="relative">
                    <input
                      id={id}
                      type="text"
                      value={location}
                      aria-describedby={describedBy || undefined}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full rounded-xl border border-border bg-paper/50 px-3.5 py-2.5 pl-10 text-sm text-ink transition-all focus:border-accent-500 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                    />
                    <svg className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                )}
              </Field>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save changes'}
              </Button>
              {savedFeedback && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-accent-700 animate-in fade-in slide-in-from-left-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  {savedFeedback}
                </span>
              )}
            </div>
          </form>
        </section>

        <div className="h-px bg-border/80" />

        {/* SECTION: WEB3 & WALLETS */}
        <section id="web3-wallets" className="scroll-mt-20">
          <div className="flex items-center justify-between gap-4 mb-1">
            <h2 className="text-xl font-bold text-ink">Web3 & Stablecoin Wallet</h2>
            <Pill tone="accent" size="sm">Privy Solana Mainnet</Pill>
          </div>
          <p className="text-sm text-ink-muted">
            Non-custodial Solana wallet for funding campaigns, receiving milestone tranches, and managing USDC / cNGN.
          </p>

          <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
            {/* Wallet Address & Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-paper/60 border border-border/60">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block">Embedded Solana Address</span>
                <span className="text-xs font-mono font-medium text-ink block break-all">
                  {currentUser?.wallets?.[0]?.address || 'Solana Wallet Linked via Privy'}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {exportWallet && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportWallet()}
                  >
                    Export Private Key
                  </Button>
                )}
                {connectWallet && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => connectWallet()}
                  >
                    Connect External Wallet
                  </Button>
                )}
              </div>
            </div>

            {/* Balances & Stablecoin Rail Quick Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border bg-paper/40 p-4 space-y-1">
                <span className="text-xs font-medium text-ink-muted block">USDC Balance</span>
                <span className="text-xl font-bold text-ink font-mono">$450.00</span>
                <span className="text-[11px] text-accent-700 block">SPL Token</span>
              </div>

              <div className="rounded-xl border border-border bg-paper/40 p-4 space-y-1">
                <span className="text-xs font-medium text-ink-muted block">cNGN Balance</span>
                <span className="text-xl font-bold text-ink font-mono">$166.67</span>
                <span className="text-[11px] text-accent-700 block">₦250k Equivalent</span>
              </div>

              <div className="rounded-xl border border-border bg-paper/40 p-4 space-y-1">
                <span className="text-xs font-medium text-ink-muted block">SOL Gas Balance</span>
                <span className="text-xl font-bold text-ink font-mono">0.45 SOL</span>
                <span className="text-[11px] text-ink-muted block">Fee Subsidized</span>
              </div>
            </div>

            {/* Quick Rail Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setWalletTab('onramp');
                  setWalletModalOpen(true);
                }}
              >
                Deposit / On-Ramp Fiat
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setWalletTab('offramp');
                  setWalletModalOpen(true);
                }}
              >
                Cash Out to Bank
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setWalletTab('transfer');
                  setWalletModalOpen(true);
                }}
              >
                Transfer / Send Token
              </Button>
            </div>
          </div>
        </section>

        <div className="h-px bg-border/80" />

        {/* SECTION 2: SIGNING IN */}
        <section id="signing-in" className="scroll-mt-20">
          <h2 className="text-xl font-bold text-ink">Signing in</h2>
          <p className="mt-1 text-sm text-ink-muted">
            You sign in with a code sent to your email, or with a connected account.
          </p>

          <div className="mt-6 rounded-2xl border border-border bg-surface shadow-xs overflow-hidden">
            {/* Email Row */}
            <div className="flex items-center justify-between gap-4 p-5 hover:bg-paper/40 transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-100/80 text-accent-700">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block sm:hidden">
                    Email
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="hidden text-sm font-semibold text-ink sm:inline-block">
                      Email
                    </span>
                    <span className="text-sm font-medium text-ink">{userEmail}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEmailModal(true)}
              >
                Change
              </Button>
            </div>

            <div className="h-px bg-border/60" />

            {/* Google Connected Row */}
            <div className="flex items-center justify-between gap-4 p-5 hover:bg-paper/40 transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface shadow-2xs">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink">Google</span>
                    {googleConnected && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-700 bg-accent-100/70 px-2 py-0.5 rounded-full">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent-500 animate-pulse" />
                        Connected
                      </span>
                    )}
                  </div>
                  {googleConnected && (
                    <span className="text-xs text-ink-muted">{userEmail}</span>
                  )}
                </div>
              </div>
              {googleConnected ? (
                <button
                  type="button"
                  onClick={() => setGoogleConnected(false)}
                  className="text-xs font-semibold text-accent-700 hover:text-accent-900 hover:underline transition-colors"
                >
                  Disconnect
                </button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setGoogleConnected(true)}>
                  Connect
                </Button>
              )}
            </div>

            <div className="h-px bg-border/60" />

            {/* X Connected Row */}
            <div className="flex items-center justify-between gap-4 p-5 hover:bg-paper/40 transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface shadow-2xs">
                  <svg className="h-4 w-4 fill-ink shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink">X</span>
                    {xConnected ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-700 bg-accent-100/70 px-2 py-0.5 rounded-full">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent-500 animate-pulse" />
                        Connected
                      </span>
                    ) : (
                      <span className="text-xs text-ink-muted">Not connected</span>
                    )}
                  </div>
                </div>
              </div>
              {xConnected ? (
                <button
                  type="button"
                  onClick={() => setXConnected(false)}
                  className="text-xs font-semibold text-accent-700 hover:text-accent-900 hover:underline transition-colors"
                >
                  Disconnect
                </button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setXConnected(true)}>
                  Connect
                </Button>
              )}
            </div>
          </div>

          <div className="mt-3.5 flex items-center gap-2 text-xs text-ink-muted bg-paper/60 px-3.5 py-2.5 rounded-xl border border-border/50">
            <svg className="h-4 w-4 shrink-0 text-accent-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>There&apos;s no password on your account, so there&apos;s nothing to change or forget.</span>
          </div>
        </section>

        <div className="h-px bg-border/80" />

        {/* SECTION 3: VERIFICATION */}
        <section id="verification" className="scroll-mt-20">
          <h2 className="text-xl font-bold text-ink">Verification</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Verified businesses can launch campaigns and receive money.
          </p>

          <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-xs transition-all hover:border-accent-500/30">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-semibold text-ink text-base">CampusKonekt Technologies Ltd</h3>
                  <Pill tone="neutral" size="sm">In review</Pill>
                </div>
                <p className="text-xs text-ink-muted flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Started 2 August. We&apos;ll email you when it&apos;s done.
                </p>
              </div>

              <Link
                href="/verify"
                className="inline-flex items-center gap-1 text-xs font-semibold text-accent-700 hover:text-accent-900 hover:underline transition-colors shrink-0"
              >
                View verification
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        <div className="h-px bg-border/80" />

        {/* SECTION 4: YOUR FEED */}
        <section id="your-feed" className="scroll-mt-20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-ink">Your feed</h2>
              <p className="mt-1 text-sm text-ink-muted">
                This shapes what you see first. You can still see every idea on Inverge.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Categories
                </span>
                <span className="text-xs font-medium text-accent-700">
                  {selectedCategories.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {categoriesList.map((cat) => {
                  const isSelected = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all duration-150 active:scale-95 ${
                        isSelected
                          ? 'border-accent-500 bg-accent-100/90 text-accent-900 font-semibold shadow-2xs'
                          : 'border-border bg-paper/40 text-ink hover:bg-surface hover:border-ink/20'
                      }`}
                    >
                      {isSelected ? (
                        <svg
                          className="h-3.5 w-3.5 text-accent-700"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-ink/20" />
                      )}
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-border/60" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Regions
                </span>
                <span className="text-xs font-medium text-accent-700">
                  {selectedRegions.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {regionsList.map((reg) => {
                  const isSelected = selectedRegions.includes(reg);
                  return (
                    <button
                      key={reg}
                      type="button"
                      onClick={() => toggleRegion(reg)}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all duration-150 active:scale-95 ${
                        isSelected
                          ? 'border-accent-500 bg-accent-100/90 text-accent-900 font-semibold shadow-2xs'
                          : 'border-border bg-paper/40 text-ink hover:bg-surface hover:border-ink/20'
                      }`}
                    >
                      {isSelected ? (
                        <svg
                          className="h-3.5 w-3.5 text-accent-700"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-ink/20" />
                      )}
                      {reg}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-border/80" />

        {/* SECTION 5: NOTIFICATIONS */}
        <section id="notifications" className="scroll-mt-20">
          <h2 className="text-xl font-bold text-ink">Notifications</h2>
          <p className="mt-1 text-sm text-ink-muted">Email only for now.</p>

          <div className="mt-6 rounded-2xl border border-border bg-surface shadow-xs overflow-hidden">
            {/* Toggle Row 1 */}
            <div className="flex items-center justify-between gap-4 p-5 hover:bg-paper/40 transition-colors">
              <div>
                <h3 className="text-sm font-semibold text-ink">Milestone updates</h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  When a campaign you backed submits proof.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={milestoneUpdates}
                onClick={() => setMilestoneUpdates((v) => !v)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 ${
                  milestoneUpdates ? 'bg-accent-500' : 'bg-ink/15'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    milestoneUpdates ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="h-px bg-border/60" />

            {/* Toggle Row 2 */}
            <div className="flex items-center justify-between gap-4 p-5 hover:bg-paper/40 transition-colors">
              <div>
                <h3 className="text-sm font-semibold text-ink">Feedback on your ideas</h3>
                <p className="text-xs text-ink-muted mt-0.5">When someone leaves structured feedback.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={feedbackOnIdeas}
                onClick={() => setFeedbackOnIdeas((v) => !v)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 ${
                  feedbackOnIdeas ? 'bg-accent-500' : 'bg-ink/15'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    feedbackOnIdeas ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="h-px bg-border/60" />

            {/* Toggle Row 3 */}
            <div className="flex items-center justify-between gap-4 p-5 hover:bg-paper/40 transition-colors">
              <div>
                <h3 className="text-sm font-semibold text-ink">New ideas in your categories</h3>
                <p className="text-xs text-ink-muted mt-0.5">A weekly digest, never more.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={categoryDigest}
                onClick={() => setCategoryDigest((v) => !v)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 ${
                  categoryDigest ? 'bg-accent-500' : 'bg-ink/15'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    categoryDigest ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        <div className="h-px bg-border/80" />

        {/* SECTION 6: ACCOUNT */}
        <section id="account" className="scroll-mt-20">
          <h2 className="text-xl font-bold text-ink">Account</h2>
          <p className="mt-1 text-sm text-ink-muted">Sign out or request account deletion.</p>

          <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-ink">Sign out of Inverge</h3>
                <p className="text-xs text-ink-muted">Ends your active session on this device.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearSessionToken();
                  void logout();
                }}
              >
                Sign out
              </Button>
            </div>

            <div className="h-px bg-border/60" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-danger-500/20 bg-danger-50/40 p-4">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-danger-700 block">Danger Zone</span>
                <p className="text-xs text-ink-muted">
                  Ideas you&apos;ve published stay up unless you remove them first.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="text-xs font-semibold text-danger hover:underline shrink-0"
              >
                Delete account
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* MODAL 1: Photo Upload Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-lift space-y-4">
            <h3 className="text-lg font-bold text-ink">Update profile photo</h3>
            <p className="text-xs text-ink-muted">
              Choose an image from your computer to update your avatar.
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="w-full text-xs text-ink file:mr-3 file:rounded-full file:border-0 file:bg-accent-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-accent-900 hover:file:bg-accent-500 hover:file:text-white transition-all cursor-pointer"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowPhotoModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Change Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-lift space-y-4">
            <h3 className="text-lg font-bold text-ink">Change email address</h3>
            <p className="text-xs text-ink-muted">
              Enter your new email. We&apos;ll send a verification code to complete the update.
            </p>
            <form onSubmit={handleChangeEmail} className="space-y-4">
              <Field label="New email address">
                {({ id }) => (
                  <input
                    id={id}
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-paper/50 px-3.5 py-2.5 text-sm text-ink focus:border-accent-500 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                  />
                )}
              </Field>
              {emailSuccess && (
                <p className="text-xs font-medium text-accent-700">
                  Verification code sent to {newEmail}!
                </p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowEmailModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Send verification code
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete Account Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-lift space-y-4">
            <div className="flex items-center gap-3 text-danger-700">
              <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-bold text-ink">Delete account?</h3>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              This action cannot be undone. Ideas you&apos;ve published will stay up unless you remove them first, but your profile and sign-in credentials will be deleted.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowDeleteModal(false)}>
                Keep account
              </Button>
              <button
                type="button"
                onClick={() => {
                  alert('Account deletion request submitted.');
                  setShowDeleteModal(false);
                }}
                className="rounded-full bg-danger px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-danger-700 transition-colors"
              >
                Confirm deletion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Web3 Wallet Modal */}
      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        initialTab={walletTab}
      />
    </div>
  );
}
