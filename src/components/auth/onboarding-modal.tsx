'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSessionToken } from '@/lib/api/client';
import { env } from '@/lib/env';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

export function OnboardingModal({ isOpen, onClose, initialEmail }: OnboardingModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [role, setRole] = useState<'CREATOR' | 'BACKER' | 'BOTH'>('CREATOR');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialEmail && !displayName) {
      const namePart = initialEmail.split('@')[0];
      if (namePart) {
        setDisplayName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
      }
    }
  }, [initialEmail, displayName]);

  if (!isOpen) return null;

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

      const res = await fetch(`${env.apiUrl}/auth/me/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName: displayName.trim(),
          bio: bio.trim() ? `${role === 'CREATOR' ? '[Creator]' : role === 'BACKER' ? '[Backer]' : '[Builder & Backer]'} ${bio.trim()}` : undefined,
          avatarUrl: avatarUrl.trim() || undefined,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-slate-900/95 p-6 sm:p-8 shadow-2xl text-slate-100 ring-1 ring-white/10">
        {/* Glow ambient background accent */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-teal-500/20 blur-3xl" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1.5 rounded-full hover:bg-white/5"
          title="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome to Inverge</h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
            Tell us how you plan to use the platform so we can personalize your experience.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/30 p-3.5 text-xs text-red-400 flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role selection pills */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Primary Goal
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setRole('CREATOR')}
                className={`flex flex-col items-center justify-center rounded-xl p-3 text-center border transition-all ${
                  role === 'CREATOR'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="text-base mb-1">🚀</span>
                <span className="text-xs font-semibold">Build & Validate</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('BACKER')}
                className={`flex flex-col items-center justify-center rounded-xl p-3 text-center border transition-all ${
                  role === 'BACKER'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="text-base mb-1">💡</span>
                <span className="text-xs font-semibold">Back Projects</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('BOTH')}
                className={`flex flex-col items-center justify-center rounded-xl p-3 text-center border transition-all ${
                  role === 'BOTH'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="text-base mb-1">🤝</span>
                <span className="text-xs font-semibold">Both</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Display Name <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ada Lovelace"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-800/70 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Bio / Tagline
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Building Web3 applications in West Africa | Tech enthusiast"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-800/70 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Avatar Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-800/70 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:opacity-95 hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Saving Profile...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

