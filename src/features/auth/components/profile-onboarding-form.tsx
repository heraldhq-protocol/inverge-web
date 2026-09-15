"use client";

import { Camera, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useState } from "react";

import { Input } from "@/components/ui/input";

export function ProfileOnboardingForm() {
  const router = useRouter();
  const [photoName, setPhotoName] = useState("");

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    setPhotoName(event.target.files?.[0]?.name ?? "");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/onboarding/role");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-4">
        <div
          className="grid size-16 shrink-0 place-items-center rounded-full bg-canvas text-muted sm:size-20"
          aria-hidden="true"
        >
          <UserRound className="size-8 sm:size-9" strokeWidth={1.5} />
        </div>
        <div>
          <input
            id="profile-photo"
            name="profilePhoto"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handlePhotoChange}
            className="sr-only"
          />
          <label
            htmlFor="profile-photo"
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/45 hover:bg-canvas focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-brand"
          >
            <Camera className="size-4" aria-hidden="true" />
            Add photo
          </label>
          <p className="mt-1.5 max-w-64 truncate text-xs text-muted">
            {photoName || "Optional · JPG, PNG, or WebP"}
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="display-name"
          className="block text-sm font-semibold text-ink"
        >
          Display name
        </label>
        <Input
          id="display-name"
          name="displayName"
          required
          autoComplete="name"
          placeholder="Amara Okonkwo"
        />
        <p className="text-xs leading-normal text-muted">
          This is the name people will see on your ideas, feedback, and profile.
        </p>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="username"
          className="block text-sm font-semibold text-ink"
        >
          Username
        </label>
        <Input
          id="username"
          name="username"
          required
          autoComplete="username"
          minLength={3}
          maxLength={30}
          pattern="[a-z0-9-]+"
          placeholder="amara-okonkwo"
        />
        <p className="text-xs leading-normal text-muted">
          Use lowercase letters, numbers, or hyphens for your public profile.
        </p>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="location"
          className="block text-sm font-semibold text-ink"
        >
          Where are you based?{" "}
          <span className="font-normal text-muted">(optional)</span>
        </label>
        <Input
          id="location"
          name="location"
          autoComplete="address-level2"
          placeholder="Lagos, Nigeria"
        />
        <p className="text-xs leading-normal text-muted">
          Share only as much location detail as you are comfortable making
          public.
        </p>
      </div>

      <button
        type="submit"
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand sm:min-h-12"
      >
        Continue
      </button>
    </form>
  );
}
