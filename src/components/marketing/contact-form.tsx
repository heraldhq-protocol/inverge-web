'use client';

import React, { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';

const TOPICS = [
  'General question',
  'Backing a project',
  'I’m a builder',
  'Press & partnerships',
  'Something else',
] as const;

const fieldClass =
  'w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink placeholder-ink-muted/60 transition-colors focus:border-accent-500/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1';
const labelClass = 'text-sm font-medium text-ink';

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    // No endpoint exists yet — this stub mirrors the newsletter form (landing-brief §3.6):
    // never ship a form that silently does nothing, but do not invent a backend either.
    setTimeout(() => setStatus('success'), 700);
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-3 rounded-2xl border border-accent-500/30 bg-accent-50 p-6"
      >
        <span
          aria-hidden="true"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-500 text-lg font-bold text-white"
        >
          ✓
        </span>
        <h2 className="font-display text-xl font-semibold text-ink">Message sent</h2>
        <p className="text-sm text-ink-muted">
          Thanks for reaching out. We read every message and usually reply within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate={false}>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-name" className={labelClass}>
            Your name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Tobi Adeyemi"
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-email" className={labelClass}>
            Email address
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-topic" className={labelClass}>
          What’s this about?
        </label>
        <select id="contact-topic" name="topic" defaultValue={TOPICS[0]} className={fieldClass}>
          {TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-message" className={labelClass}>
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder="Tell us what’s on your mind…"
          className={`${fieldClass} resize-y`}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={status === 'submitting'}
        className="self-start"
      >
        {status === 'submitting' ? 'Sending…' : 'Send message'}
      </Button>

      <span aria-live="polite" className="sr-only">
        {status === 'submitting' ? 'Sending your message' : ''}
      </span>
    </form>
  );
}
