'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import { getSessionToken } from '@/lib/api/client';
import { env } from '@/lib/env';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  isMandatory?: boolean;
  onLogout?: () => void;
}

export function OnboardingModal({
  isOpen,
  onClose,
  initialEmail,
  isMandatory = true,
  onLogout,
}: OnboardingModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<{
    loading: boolean;
    available?: boolean;
    message?: string;
  }>({ loading: false });
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [localAvatarPreview, setLocalAvatarPreview] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [role, setRole] = useState<'CREATOR' | 'BACKER' | 'BOTH'>('CREATOR');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialEmail && !displayName) {
      const namePart = initialEmail.split('@')[0];
      if (namePart) {
        setDisplayName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
        const slug = namePart.toLowerCase().replace(/[^a-z0-9_-]/g, '');
        setUsername(slug);
      }
    }
  }, [initialEmail]);

  useEffect(() => {
    return () => {
      if (localAvatarPreview && localAvatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(localAvatarPreview);
      }
    };
  }, [localAvatarPreview]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMandatory) {
          triggerShake();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isMandatory, onClose]);

  if (!isOpen) return null;

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const handleBackdropClick = () => {
    if (isMandatory) {
      triggerShake();
    } else {
      onClose();
    }
  };

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDisplayName(val);
    if (!username) {
      const slug = val.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/^-+|-+$/g, '');
      setUsername(slug);
    }
  };

  const checkUsername = async (val: string) => {
    const clean = val.trim().toLowerCase().replace(/^@/, '');
    if (!clean) {
      setUsernameStatus({ loading: false, available: false, message: 'Username handle is required' });
      return;
    }
    if (clean.length < 3) {
      setUsernameStatus({ loading: false, available: false, message: 'Username must be at least 3 characters' });
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(clean)) {
      setUsernameStatus({ loading: false, available: false, message: 'Only letters, numbers, underscores & dashes allowed' });
      return;
    }

    setUsernameStatus({ loading: true });
    try {
      const res = await fetch(`${env.apiUrl}/auth/check-username?username=${encodeURIComponent(clean)}`);
      if (!res.ok) {
        setUsernameStatus({ loading: false, available: false, message: 'Could not verify username availability' });
        return;
      }
      const data = await res.json();
      if (data.available) {
        setUsernameStatus({ loading: false, available: true, message: `Username @${clean} is available!` });
      } else {
        setUsernameStatus({ loading: false, available: false, message: data.reason || 'This username is already taken' });
      }
    } catch {
      setUsernameStatus({ loading: false, available: false, message: 'Availability check failed' });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be under 5MB.');
      return;
    }

    setError(null);
    if (localAvatarPreview && localAvatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(localAvatarPreview);
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalAvatarPreview(objectUrl);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.warn('[OnboardingModal] Failed to process avatar image:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }
    if (!username.trim()) {
      setError('Username handle is required');
      return;
    }
    if (usernameStatus.available === false) {
      setError(usernameStatus.message || 'Please choose an available username');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = getSessionToken();
      if (!token) throw new Error('No active session. Please sign in again.');

      const finalAvatar = avatarUrl.trim() || localAvatarPreview || undefined;

      const res = await fetch(`${env.apiUrl}/auth/me/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          displayName: displayName.trim(),
          bio: bio.trim()
            ? `${role === 'CREATOR' ? '[Creator]' : role === 'BACKER' ? '[Backer]' : '[Builder & Backer]'} ${bio.trim()}`
            : undefined,
          avatarUrl: finalAvatar,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to update profile');
      }

      await queryClient.invalidateQueries({ queryKey: ['me'] });
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving your profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentPreview = localAvatarPreview || avatarUrl;

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-md px-4 py-6 sm:py-10 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative my-auto w-full max-w-md overflow-hidden rounded-3xl border border-border/80 bg-surface px-6 py-5 sm:px-7 sm:py-6 shadow-lift-lg text-ink ring-1 ring-black/5 transition-transform duration-200 ${
          shaking ? 'animate-bounce' : ''
        }`}
      >
        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-accent-500/10 blur-3xl" />

        {!isMandatory && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-ink-muted hover:text-ink transition p-2 rounded-full hover:bg-paper"
            title="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className="mb-3.5 text-center">
          <div className="mx-auto mb-1.5 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 border border-accent-200 shadow-xs">
            <Image src="/icon.svg" width={24} height={24} alt="Inverge logo" className="h-6 w-6" />
          </div>
          <h2 className="font-display text-xl font-bold tracking-tight text-ink">Welcome to Inverge</h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            Personalize your creator &amp; backer experience to continue.
          </p>
          {isMandatory && (
            <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-2.5 py-0.5 text-[11px] font-semibold text-accent-700 border border-accent-200">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500 animate-pulse" />
              <span>Required: Complete profile setup</span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-3 rounded-xl bg-danger-50 border border-danger-700/30 p-2.5 text-xs text-danger-700 flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Avatar Upload Picker */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-paper/40 p-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-accent-300 bg-accent-50 text-accent-700 transition hover:border-accent-500"
              title="Upload photo"
            >
              {currentPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentPreview}
                  alt="Avatar preview"
                  className="h-full w-full object-cover transition group-hover:opacity-80"
                />
              ) : (
                <svg className="h-6 w-6 text-accent-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink block">Profile Photo</span>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-[11px] font-medium text-accent-700 hover:underline cursor-pointer"
                >
                  {showUrlInput ? 'Upload file' : 'Paste URL'}
                </button>
              </div>

              {!showUrlInput ? (
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg bg-surface border border-border px-2.5 py-1 text-xs font-semibold text-ink hover:bg-paper hover:border-accent-500/40 transition cursor-pointer"
                  >
                    Choose file
                  </button>
                  {currentPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setLocalAvatarPreview(null);
                        setAvatarUrl('');
                      }}
                      className="text-[11px] text-ink-muted hover:text-danger-700 cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                  <span className="text-[10px] text-ink-muted truncate hidden sm:inline">PNG, JPG up to 5MB</span>
                </div>
              ) : (
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full mt-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs text-ink placeholder:text-ink-muted/50 focus:border-accent-500 focus:outline-none"
                />
              )}
            </div>
          </div>

          {/* Role selection cards */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
              Primary Goal
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('CREATOR')}
                className={`flex flex-col items-center justify-center rounded-xl p-2 text-center border transition-all cursor-pointer ${
                  role === 'CREATOR'
                    ? 'border-accent-500 bg-accent-50 text-accent-900 ring-2 ring-accent-500/20 shadow-xs font-semibold'
                    : 'border-border bg-paper/60 text-ink-muted hover:border-accent-500/40 hover:text-ink'
                }`}
              >
                <div className="mb-0.5 flex h-6 w-6 items-center justify-center rounded-lg bg-accent-100/60 text-accent-700">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-[11px]">Build &amp; Validate</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('BACKER')}
                className={`flex flex-col items-center justify-center rounded-xl p-2 text-center border transition-all cursor-pointer ${
                  role === 'BACKER'
                    ? 'border-accent-500 bg-accent-50 text-accent-900 ring-2 ring-accent-500/20 shadow-xs font-semibold'
                    : 'border-border bg-paper/60 text-ink-muted hover:border-accent-500/40 hover:text-ink'
                }`}
              >
                <div className="mb-0.5 flex h-6 w-6 items-center justify-center rounded-lg bg-accent-100/60 text-accent-700">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <span className="text-[11px]">Back Projects</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('BOTH')}
                className={`flex flex-col items-center justify-center rounded-xl p-2 text-center border transition-all cursor-pointer ${
                  role === 'BOTH'
                    ? 'border-accent-500 bg-accent-50 text-accent-900 ring-2 ring-accent-500/20 shadow-xs font-semibold'
                    : 'border-border bg-paper/60 text-ink-muted hover:border-accent-500/40 hover:text-ink'
                }`}
              >
                <div className="mb-0.5 flex h-6 w-6 items-center justify-center rounded-lg bg-accent-100/60 text-accent-700">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="text-[11px]">Both</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
              Display Name <span className="text-accent-700">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ada Lovelace"
              value={displayName}
              onChange={handleDisplayNameChange}
              className="w-full rounded-xl border border-border bg-paper/60 px-3.5 py-2 text-sm text-ink placeholder:text-ink-muted/50 transition focus:bg-surface focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
              Username Handle <span className="text-accent-700">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-semibold text-accent-600">@</span>
              <input
                type="text"
                required
                placeholder="username"
                value={username}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '');
                  setUsername(val);
                  setUsernameStatus({ loading: false });
                }}
                onBlur={() => checkUsername(username)}
                className="w-full rounded-xl border border-border bg-paper/60 pl-8 pr-3.5 py-2 text-sm text-ink placeholder:text-ink-muted/50 transition focus:bg-surface focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
              />
            </div>
            {usernameStatus.loading && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
                <svg className="h-3 w-3 animate-spin text-accent-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Checking availability...</span>
              </p>
            )}
            {!usernameStatus.loading && usernameStatus.message && (
              <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${usernameStatus.available ? 'text-accent-600' : 'text-danger-700'}`}>
                {usernameStatus.available ? '✓ ' : '✕ '}
                {usernameStatus.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
              Bio / Tagline
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Building Web3 applications in West Africa | Tech enthusiast"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-xl border border-border bg-paper/60 px-3.5 py-2 text-sm text-ink placeholder:text-ink-muted/50 transition focus:bg-surface focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
            />
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-accent-500 hover:bg-accent-700 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-accent-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Saving Profile...</span>
                </>
              ) : (
                'Complete Registration'
              )}
            </button>
          </div>

          {onLogout && (
            <div className="pt-0.5 text-center text-xs text-ink-muted">
              {initialEmail && <span className="block mb-0.5">Signed in as <strong className="text-ink font-medium">{initialEmail}</strong></span>}
              <button
                type="button"
                onClick={onLogout}
                className="font-medium text-ink-muted hover:text-accent-700 hover:underline transition cursor-pointer text-[11px]"
              >
                Need to use a different account? Sign out
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
