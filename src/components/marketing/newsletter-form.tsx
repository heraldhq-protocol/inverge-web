'use client';

import React, { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('submitting');
    // Stub form submission for static pass
    setTimeout(() => {
      setStatus('success');
    }, 600);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address for updates
      </label>
      
      {status === 'success' ? (
        <div className="rounded-xl border border-accent-500/30 bg-accent-900/60 p-3 text-sm font-semibold text-accent-100">
          ✓ Thanks for subscribing! We&apos;ll keep you updated.
        </div>
      ) : (
        // `min-w-0` is what makes the inline layout viable: flex items default to
        // min-width:auto, so the input refused to shrink below its placeholder and got
        // clipped instead. With that released it shares the row cleanly.
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 p-1.5 transition-colors focus-within:border-accent-500/60">
          <input
            id="newsletter-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full min-w-0 bg-transparent px-3 text-sm text-white placeholder-white/40 focus:outline-none"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={status === 'submitting'}
            className="shrink-0"
          >
            {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
          </Button>
        </div>
      )}
      <span id="newsletter-status" className="sr-only" aria-live="polite">
        {status === 'success' ? 'Subscribed successfully' : ''}
      </span>
    </form>
  );
}
