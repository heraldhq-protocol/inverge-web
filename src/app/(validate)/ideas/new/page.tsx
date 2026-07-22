'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getSessionToken } from '@/lib/api/client';

const field =
  'w-full rounded-lg border border-foreground/15 bg-transparent px-3 py-2 text-sm';

export default function NewIdeaPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    problem: '',
    solution: '',
    roadmap: '',
    askAmount: 10000,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!getSessionToken()) return setError('Sign in first.');
    setBusy(true);
    setError(null);
    const { data, error: createErr } = await api.POST('/ideas', {
      body: { ...form, askAmount: Number(form.askAmount) },
    });
    const id = (data as { id?: string } | undefined)?.id;
    if (createErr || !id) {
      setBusy(false);
      return setError('Could not create the idea — are you signed in?');
    }
    await api.POST('/ideas/{id}/publish', { params: { path: { id } } });
    router.push(`/ideas/${id}`);
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Publish an idea</h1>
      <Labeled label="Title">
        <input
          className={field}
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          required
        />
      </Labeled>
      <Labeled label="Problem">
        <textarea
          className={field}
          rows={3}
          value={form.problem}
          onChange={(e) => set('problem', e.target.value)}
          required
        />
      </Labeled>
      <Labeled label="Solution">
        <textarea
          className={field}
          rows={3}
          value={form.solution}
          onChange={(e) => set('solution', e.target.value)}
          required
        />
      </Labeled>
      <Labeled label="Roadmap">
        <textarea
          className={field}
          rows={3}
          value={form.roadmap}
          onChange={(e) => set('roadmap', e.target.value)}
          required
        />
      </Labeled>
      <Labeled label="Ask amount (USD)">
        <input
          type="number"
          min={1}
          className={field}
          value={form.askAmount}
          onChange={(e) => set('askAmount', Number(e.target.value))}
          required
        />
      </Labeled>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-40"
      >
        {busy ? 'Publishing…' : 'Publish idea'}
      </button>
    </form>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-foreground/70">{label}</span>
      {children}
    </label>
  );
}
