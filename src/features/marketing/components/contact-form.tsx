"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const topics = [
  "General question",
  "Backing a campaign",
  "I am a builder",
  "Press and partnerships",
  "Something else",
] as const;

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
            className="text-sm font-semibold text-ink"
          >
            Your name
          </label>
          <Input
            id="contact-name"
            name="name"
            required
            autoComplete="name"
            placeholder="Your name"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="contact-email"
            className="text-sm font-semibold text-ink"
          >
            Email address
          </label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="contact-topic"
          className="text-sm font-semibold text-ink"
        >
          What is this about?
        </label>
        <Select id="contact-topic" name="topic" defaultValue={topics[0]}>
          {topics.map((topic) => (
            <option key={topic}>{topic}</option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="contact-message"
          className="text-sm font-semibold text-ink"
        >
          Message
        </label>
        <Textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder="Tell us what is on your mind…"
        />
      </div>

      <Button type="submit" size="md" className="w-full sm:w-auto">
        Continue in email
      </Button>
      <p aria-live="polite" className="text-xs leading-5 text-muted">
        {didOpenEmail
          ? "Your email app should open with the message filled in. Review it there before sending."
          : "This opens your email app. Nothing is submitted to Inverge from this page."}
      </p>
    </form>
  );
}
