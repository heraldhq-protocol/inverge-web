"use client";

import { type FormEvent, useState } from "react";

const topics = [
  "General question",
  "Backing a campaign",
  "I am a builder",
  "Press and partnerships",
  "Something else",
] as const;

const fieldClass =
  "min-h-11 w-full rounded-lg border border-border bg-canvas/50 px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-brand focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/20";

export function ContactForm() {
  const [didOpenEmail, setDidOpenEmail] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const topic = String(data.get("topic") ?? topics[0]);
    const message = String(data.get("message") ?? "");
    const body = [`Name: ${name}`, `Reply to: ${email}`, "", message].join(
      "\n",
    );

    setDidOpenEmail(true);
    window.location.href = `mailto:hello@inverge.africa?subject=${encodeURIComponent(topic)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="contact-name"
            className="text-[13px] font-medium text-ink"
          >
            Your name
          </label>
          <input
            id="contact-name"
            name="name"
            required
            autoComplete="name"
            placeholder="Your name"
            className={fieldClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="contact-email"
            className="text-[13px] font-medium text-ink"
          >
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
        <label
          htmlFor="contact-topic"
          className="text-[13px] font-medium text-ink"
        >
          What is this about?
        </label>
        <select
          id="contact-topic"
          name="topic"
          defaultValue={topics[0]}
          className={fieldClass}
        >
          {topics.map((topic) => (
            <option key={topic}>{topic}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="contact-message"
          className="text-[13px] font-medium text-ink"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          placeholder="Tell us what is on your mind…"
          className={`${fieldClass} resize-y`}
        />
      </div>

      <button
        type="submit"
        className="min-h-11 w-full rounded-md bg-brand-strong px-6 text-sm font-semibold text-white transition-colors hover:bg-contrast focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand sm:w-auto"
      >
        Continue in email
      </button>
      <p aria-live="polite" className="text-xs leading-5 text-muted">
        {didOpenEmail
          ? "Your email app should open with the message filled in. Review it there before sending."
          : "This opens your email app. Nothing is submitted to Inverge from this page."}
      </p>
    </form>
  );
}
