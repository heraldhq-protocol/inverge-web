'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Amount, Count } from '@/components/ui/amount';
import { Button } from '@/components/ui/button';
import { Pill, type PillTone } from '@/components/ui/pill';

export interface DashboardIdeaRow {
  id: string;
  title: string;
  summary: string;
  status: 'Draft' | 'Validating' | 'Threshold met' | 'Campaign live';
  tone: PillTone;
  supporters: number;
  prePledgeTotal: number;
  updatedAt: string;
}

const DEMO_IDEAS: DashboardIdeaRow[] = [
  {
    id: 'payflex-lagos',
    title: 'PayFlex Lagos',
    summary: 'Offline USSD micro-payments for informal market vendors in Yaba.',
    status: 'Threshold met',
    tone: 'accent',
    supporters: 842,
    prePledgeTotal: 1850000,
    updatedAt: '2 hours ago',
  },
  {
    id: 'campuskonekt',
    title: 'CampusKonekt Technologies',
    summary: 'Student marketplace and verified room matching across Nigerian universities.',
    status: 'Campaign live',
    tone: 'accent',
    supporters: 610,
    prePledgeTotal: 1420000,
    updatedAt: 'Yesterday',
  },
  {
    id: 'agrisolar-ibadan',
    title: 'AgriSolar Cold Storage',
    summary: 'Solar-powered cold storage pods for tomato farmers in Ibadan.',
    status: 'Validating',
    tone: 'neutral',
    supporters: 352,
    prePledgeTotal: 850000,
    updatedAt: '3 days ago',
  },
  {
    id: 'kano-logistics',
    title: 'Kano Logistics Hub',
    summary: 'Last-mile freight routing connecting Sahel trade routes.',
    status: 'Draft',
    tone: 'neutral',
    supporters: 0,
    prePledgeTotal: 0,
    updatedAt: '5 days ago',
  },
  {
    id: 'afrobeats-studio',
    title: 'AfroBeats Studio Pass',
    summary: 'Community sound stage and equipment rental pool in Ikeja.',
    status: 'Validating',
    tone: 'neutral',
    supporters: 180,
    prePledgeTotal: 420000,
    updatedAt: '1 week ago',
  },
];

export function DashboardView() {
  const [ideas] = useState<DashboardIdeaRow[]>(DEMO_IDEAS);
  const [openRowId, setOpenRowId] = useState<string | null>(null);

  // Compute stat totals
  const totalIdeas = ideas.length;
  const totalSupporters = ideas.reduce((acc, i) => acc + i.supporters, 0);
  const totalPrePledge = ideas.reduce((acc, i) => acc + i.prePledgeTotal, 0);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 pb-20">
      {/* Top Verification Status Strip (Calm & Factual) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-paper/80 px-4 py-3.5 shadow-2xs">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm text-ink">
          <span className="h-2 w-2 shrink-0 rounded-full bg-accent-500 animate-pulse" />
          <span>
            <strong className="font-semibold text-ink">Verification: In review</strong> — We&apos;ll email you within 2 working days. You can keep building meanwhile.
          </span>
        </div>
        <Link
          href="/verify"
          className="text-xs font-semibold text-accent-700 hover:text-accent-900 hover:underline shrink-0 pl-4 sm:pl-0"
        >
          View status →
        </Link>
      </div>

      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            My Ideas
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Track validation progress, pre-pledges, and campaign readiness for your projects.
          </p>
        </div>
        <Button variant="primary" size="sm" href="/ideas/new" className="self-start sm:self-auto">
          Start an idea
        </Button>
      </div>

      {/* Three Tabular Stat Blocks */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block mb-1">
            Ideas published
          </span>
          <div className="font-display text-3xl font-bold text-ink">
            <Count value={totalIdeas} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block mb-1">
            Total pre-pledged
          </span>
          <div className="font-display text-3xl font-bold text-ink">
            <Amount value={totalPrePledge} currency="NGN" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block mb-1">
            Supporters
          </span>
          <div className="font-display text-3xl font-bold text-ink">
            <Count value={totalSupporters} />
          </div>
        </div>
      </div>

      {/* Main Table Region */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-ink">Your Projects</h2>
          <span className="text-xs text-ink-muted">{ideas.length} ideas</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-ink">
              <thead className="border-b border-border bg-paper/60 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    Idea
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right">
                    Supporters
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right">
                    Pre-pledged
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Updated
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {ideas.map((idea) => (
                  <tr
                    key={idea.id}
                    className="group transition-colors hover:bg-paper/40"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <Link
                          href={`/ideas/${idea.id}`}
                          className="font-semibold text-ink hover:text-accent-700 hover:underline transition-colors"
                        >
                          {idea.title}
                        </Link>
                        <p className="text-xs text-ink-muted line-clamp-1 max-w-sm mt-0.5">
                          {idea.summary}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Pill tone={idea.tone} size="xs">
                        {idea.status}
                      </Pill>
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-ink whitespace-nowrap">
                      <Count value={idea.supporters} />
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-ink whitespace-nowrap">
                      <Amount value={idea.prePledgeTotal} currency="NGN" />
                    </td>
                    <td className="px-4 py-4 text-xs text-ink-muted whitespace-nowrap">
                      {idea.updatedAt}
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap relative">
                      <div className="inline-block text-left">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenRowId((current) =>
                              current === idea.id ? null : idea.id
                            )
                          }
                          className="rounded-lg p-1.5 text-ink-muted hover:bg-ink/5 hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent-500"
                          aria-label={`Actions for ${idea.title}`}
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>

                        {/* Row Action Dropdown Popover */}
                        {openRowId === idea.id && (
                          <div className="absolute right-4 top-12 z-30 w-44 rounded-xl border border-border bg-surface py-1 shadow-lift text-left">
                            <Link
                              href={`/ideas/${idea.id}`}
                              className="block px-3.5 py-2 text-xs font-medium text-ink hover:bg-accent-50"
                              onClick={() => setOpenRowId(null)}
                            >
                              View public page
                            </Link>
                            <Link
                              href={`/ideas/${idea.id}/insights`}
                              className="block px-3.5 py-2 text-xs font-medium text-ink hover:bg-accent-50"
                              onClick={() => setOpenRowId(null)}
                            >
                              View insights
                            </Link>
                            <button
                              type="button"
                              className="block w-full px-3.5 py-2 text-left text-xs font-medium text-ink hover:bg-accent-50"
                              onClick={() => {
                                alert(`Editing ${idea.title}`);
                                setOpenRowId(null);
                              }}
                            >
                              Edit pitch
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Ordinary Boost Section (Flat-fee tiers) */}
      <section className="space-y-4 pt-4 border-t border-border/80">
        <div>
          <h2 className="text-lg font-bold text-ink">Idea Visibility & Boosts</h2>
          <p className="text-xs text-ink-muted">
            Boost your idea to feature it across category lanes and search surfaces.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Basic Tier */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-ink">Basic Boost</h3>
                <span className="text-sm font-bold text-ink">₦15,000</span>
              </div>
              <p className="text-xs text-ink-muted">
                Highlighted placement in topic directory and category lanes for 7 days.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert('Basic boost selected')}
            >
              Get Basic Boost
            </Button>
          </div>

          {/* Featured Tier */}
          <div className="flex flex-col justify-between rounded-2xl border border-accent-500/40 bg-accent-50/30 p-5 shadow-xs space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-ink">Featured Boost</h3>
                <span className="text-sm font-bold text-accent-700">₦45,000</span>
              </div>
              <p className="text-xs text-ink-muted">
                Top carousel placement on homepage and category headers for 14 days.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => alert('Featured boost selected')}
            >
              Get Featured Boost
            </Button>
          </div>
        </div>

        <p className="text-xs text-ink-muted italic">
          Boosts affect where your idea appears. They never change your validation numbers.
        </p>
      </section>
    </div>
  );
}
