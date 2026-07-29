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
  'w-full rounded-lg border border-border bg-paper/40 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 transition-colors focus:bg-surface focus:border-accent-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500';
const labelClass = 'text-[13px] font-medium text-ink';

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setTimeout(() => setStatus('success'), 700);
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-3 rounded-xl border border-accent-500/30 bg-accent-50 p-6"
      >
        <span
          aria-hidden="true"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-700 text-lg font-bold text-white"
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <div className="relative">
          <select
            id="contact-topic"
            name="topic"
            defaultValue={TOPICS[0]}
            className={`${fieldClass} appearance-none pr-10`}
          >
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-ink-muted">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
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
        size="md"
        disabled={status === 'submitting'}
        className="self-start mt-1 bg-accent-700 hover:bg-accent-900 text-white font-medium px-6 py-2.5 rounded-md text-sm"
      >
        {status === 'submitting' ? 'Sending…' : 'Send message'}
      </Button>

      <span aria-live="polite" className="sr-only">
        {status === 'submitting' ? 'Sending your message' : ''}
      </span>
    </form>
  );
}
