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

function compressAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      const size = 256;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(objectUrl);
        return;
      }
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2;
      const sy = (img.height - minDim) / 2;
      ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to process image file.'));
    };
    img.src = objectUrl;
  });
}

export function OnboardingModal({
  isOpen,
  onClose,
  initialEmail,
  isMandatory = true,
  onLogout,
}: OnboardingModalProps) {
  const [displayName, setDisplayName] = useState('');
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
      }
    }
  }, [initialEmail, displayName]);

  // Clean up object URLs when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (localAvatarPreview && localAvatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(localAvatarPreview);
      }
    };
  }, [localAvatarPreview]);

  // Handle escape key press
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

    // Create object URL for instant local preview
    const objectUrl = URL.createObjectURL(file);
    setLocalAvatarPreview(objectUrl);

    try {
      // Downscale & compress image to 256x256 JPEG (~25KB) so payload size stays well within backend limits
      const compressedDataUrl = await compressAvatar(file);
      setAvatarUrl(compressedDataUrl);
    } catch {
      // Fallback to FileReader if canvas compression fails
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Display name is required');
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
        {/* Glow ambient background accents matching Inverge palette */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-accent-500/10 blur-3xl" />

        {/* Close Button - Only shown if modal is not mandatory */}
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

        {/* Header with official Inverge /icon.svg */}
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
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </div>
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
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-border bg-paper/60 px-3.5 py-2 text-sm text-ink placeholder:text-ink-muted/50 transition focus:bg-surface focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
            />
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

          {/* Escape hatch for signing out if logged into wrong account */}
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



