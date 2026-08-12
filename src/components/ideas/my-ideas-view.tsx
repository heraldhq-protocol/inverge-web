'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Amount, Count } from '@/components/ui/amount';
import { Button } from '@/components/ui/button';
import { Pill, type PillTone } from '@/components/ui/pill';
import { listMyIdeas } from '@/lib/campaigns/my-ideas';

export interface MyIdeaItem {
  id: string;
  title: string;
  summary: string;
  status: 'Draft' | 'Validating' | 'Threshold met' | 'Campaign live';
  tone: PillTone;
  supporters: number;
  prePledgeTotal: number;
  askAmount: number;
  updatedAt: string;
  category: string;
}

const INITIAL_IDEAS: MyIdeaItem[] = [
  {
    id: 'payflex-lagos',
    title: 'PayFlex Lagos',
    summary: 'Offline USSD micro-payments for informal market vendors in Yaba.',
    status: 'Threshold met',
    tone: 'accent',
    supporters: 842,
    prePledgeTotal: 48500,
    askAmount: 50000,
    updatedAt: '2 hours ago',
    category: 'Fintech',
  },
  {
    id: 'campuskonekt',
    title: 'CampusKonekt Technologies',
    summary: 'Student marketplace and verified room matching across Nigerian universities.',
    status: 'Campaign live',
    tone: 'accent',
    supporters: 610,
    prePledgeTotal: 32400,
    askAmount: 35000,
    updatedAt: 'Yesterday',
    category: 'EdTech',
  },
  {
    id: 'agrisolar-ibadan',
    title: 'AgriSolar Cold Storage',
    summary: 'Solar-powered cold storage pods for tomato farmers in Ibadan.',
    status: 'Validating',
    tone: 'neutral',
    supporters: 352,
    prePledgeTotal: 18500,
    askAmount: 25000,
    updatedAt: '3 days ago',
    category: 'AgriTech',
  },
  {
    id: 'kano-logistics',
    title: 'Kano Logistics Hub',
    summary: 'Last-mile freight routing connecting Sahel trade routes.',
    status: 'Draft',
    tone: 'neutral',
    supporters: 0,
    prePledgeTotal: 0,
    askAmount: 20000,
    updatedAt: '5 days ago',
    category: 'Logistics',
  },
  {
    id: 'afrobeats-studio',
    title: 'AfroBeats Studio Pass',
    summary: 'Community sound stage and equipment rental pool in Ikeja.',
    status: 'Validating',
    tone: 'neutral',
    supporters: 180,
    prePledgeTotal: 3600,
    askAmount: 10000,
    updatedAt: '1 week ago',
    category: 'Creative Economy',
  },
];

type FilterTab = 'ALL' | 'VALIDATING' | 'THRESHOLD' | 'LIVE' | 'DRAFT';

export function MyIdeasView() {
  const { data: liveIdeas } = useQuery({
    queryKey: ['my-ideas'],
    queryFn: () => listMyIdeas(),
    staleTime: 15_000,
  });

  const [ideas, setIdeas] = useState<MyIdeaItem[]>(INITIAL_IDEAS);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'supporters' | 'pledges' | 'updated'>('supporters');
  const [openRowId, setOpenRowId] = useState<string | null>(null);

  // Edit Modal State
  const [editingIdea, setEditingIdea] = useState<MyIdeaItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editAskAmount, setEditAskAmount] = useState('');
  const [editStatus, setEditStatus] = useState<MyIdeaItem['status']>('Validating');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync API ideas if available
  React.useEffect(() => {
    if (liveIdeas && liveIdeas.length > 0) {
      setIdeas(
        liveIdeas.map((i) => ({
          id: i.id,
          title: i.title,
          summary: i.problem,
          status: i.ready ? ('Threshold met' as const) : ('Validating' as const),
          tone: i.ready ? ('accent' as const) : ('neutral' as const),
          supporters: i.supporterCount,
          prePledgeTotal: Number(i.askAmount),
          askAmount: Number(i.askAmount) * 1.2,
          updatedAt: 'Recently',
          category: 'General',
        }))
      );
    }
  }, [liveIdeas]);

  const openEditModal = (idea: MyIdeaItem) => {
    setEditingIdea(idea);
    setEditTitle(idea.title);
    setEditSummary(idea.summary);
    setEditCategory(idea.category);
    setEditAskAmount(idea.askAmount.toString());
    setEditStatus(idea.status);
    setOpenRowId(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIdea) return;

    const updatedAsk = parseFloat(editAskAmount) || editingIdea.askAmount;
    const isReady = editStatus === 'Threshold met' || editStatus === 'Campaign live';

    setIdeas((prev) =>
      prev.map((item) =>
        item.id === editingIdea.id
          ? {
              ...item,
              title: editTitle,
              summary: editSummary,
              category: editCategory,
              askAmount: updatedAsk,
              status: editStatus,
              tone: isReady ? 'accent' : 'neutral',
              updatedAt: 'Just now',
            }
          : item
      )
    );

    setEditingIdea(null);
    setToastMessage(`Successfully updated pitch details for "${editTitle}"!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Tab count metrics
  const counts = useMemo(() => {
    return {
      ALL: ideas.length,
      VALIDATING: ideas.filter((i) => i.status === 'Validating').length,
      THRESHOLD: ideas.filter((i) => i.status === 'Threshold met').length,
      LIVE: ideas.filter((i) => i.status === 'Campaign live').length,
      DRAFT: ideas.filter((i) => i.status === 'Draft').length,
    };
  }, [ideas]);

  // Filter & sort logic
  const filteredIdeas = useMemo(() => {
    let result = ideas.filter((idea) => {
      if (activeTab === 'VALIDATING') return idea.status === 'Validating';
      if (activeTab === 'THRESHOLD') return idea.status === 'Threshold met';
      if (activeTab === 'LIVE') return idea.status === 'Campaign live';
      if (activeTab === 'DRAFT') return idea.status === 'Draft';
      return true;
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) => i.title.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'supporters') {
      result.sort((a, b) => b.supporters - a.supporters);
    } else if (sortBy === 'pledges') {
      result.sort((a, b) => b.prePledgeTotal - a.prePledgeTotal);
    }

    return result;
  }, [ideas, activeTab, searchQuery, sortBy]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-accent-600 text-white px-4 py-3 shadow-lift text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-semibold text-accent-700 border border-accent-200">
              Creator Hub
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            My Ideas &amp; Campaigns
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Manage your draft pitches, active validation campaigns, and USDC milestone escrow targets.
          </p>
        </div>
        <Button variant="primary" size="md" href="/ideas/new" className="self-start sm:self-auto shrink-0">
          Start an idea
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: `All Ideas (${counts.ALL})` },
            { id: 'VALIDATING', label: `Validating (${counts.VALIDATING})` },
            { id: 'THRESHOLD', label: `Threshold Met (${counts.THRESHOLD})` },
            { id: 'LIVE', label: `Campaign Live (${counts.LIVE})` },
            { id: 'DRAFT', label: `Drafts (${counts.DRAFT})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as FilterTab)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-accent-500 text-white shadow-xs'
                  : 'bg-paper/80 border border-border text-ink-muted hover:bg-surface hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1 sm:w-48">
            <input
              type="text"
              placeholder="Search ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-ink placeholder:text-ink-muted/50 focus:border-accent-500 focus:outline-none"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-ink focus:border-accent-500 focus:outline-none cursor-pointer"
          >
            <option value="supporters">Sort: Most Supporters</option>
            <option value="pledges">Sort: Highest Pre-pledged</option>
            <option value="updated">Sort: Recently Updated</option>
          </select>
        </div>
      </div>

      {/* Main Project List Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-ink">
            <thead className="border-b border-border bg-paper/60 text-xs font-semibold uppercase tracking-wider text-ink-muted">
              <tr>
                <th scope="col" className="px-5 py-3.5">
                  Idea / Pitch
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Status
                </th>
                <th scope="col" className="px-4 py-3.5 text-right">
                  Supporters
                </th>
                <th scope="col" className="px-4 py-3.5 text-right">
                  USDC Pre-Pledged
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Validation Progress
                </th>
                <th scope="col" className="px-4 py-3.5 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredIdeas.length > 0 ? (
                filteredIdeas.map((idea) => {
                  const progressPct = Math.min(
                    100,
                    Math.round((idea.prePledgeTotal / (idea.askAmount || 1)) * 100)
                  );

                  return (
                    <tr key={idea.id} className="group transition-colors hover:bg-paper/40">
                      <td className="px-5 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/ideas/${idea.id}`}
                              className="font-semibold text-ink hover:text-accent-700 hover:underline transition-colors"
                            >
                              {idea.title}
                            </Link>
                            <span className="text-[10px] rounded-full bg-paper px-2 py-0.5 text-ink-muted border border-border/60">
                              {idea.category}
                            </span>
                          </div>
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
                        <Amount value={idea.prePledgeTotal} currency="USD" />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap w-44">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-ink-muted font-medium">{progressPct}% of goal</span>
                            <span className="text-ink font-semibold">${idea.askAmount.toLocaleString()} USDC</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper">
                            <div
                              className="h-full bg-accent-500 rounded-full transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap relative">
                        <div className="inline-block text-left">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenRowId((current) => (current === idea.id ? null : idea.id))
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
                            <div className="absolute right-4 top-12 z-30 w-52 rounded-xl border border-border bg-surface py-1 shadow-lift text-left">
                              <Link
                                href={`/ideas/${idea.id}`}
                                className="block px-3.5 py-2 text-xs font-medium text-ink hover:bg-accent-50"
                                onClick={() => setOpenRowId(null)}
                              >
                                View public pitch page
                              </Link>
                              <Link
                                href={`/ideas/${idea.id}/insights`}
                                className="block px-3.5 py-2 text-xs font-medium text-ink hover:bg-accent-50"
                                onClick={() => setOpenRowId(null)}
                              >
                                View analytics &amp; insights
                              </Link>
                              <button
                                type="button"
                                className="block w-full px-3.5 py-2 text-left text-xs font-medium text-ink hover:bg-accent-50 border-t border-border/60"
                                onClick={() => openEditModal(idea)}
                              >
                                Edit pitch details
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-ink-muted">
                    <p className="text-sm font-semibold">No ideas found matching your filter</p>
                    <p className="text-xs mt-1">Try resetting your filter or creating a new idea.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT IDEA MODAL */}
      {editingIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-lift text-ink p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-ink">Edit Pitch Details</h3>
                <p className="text-xs text-ink-muted">Update your project narrative and USDC validation target.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingIdea(null)}
                className="rounded-full p-1.5 text-ink-muted hover:bg-paper hover:text-ink transition"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink-muted uppercase tracking-wider mb-1">Idea Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-paper/60 px-3.5 py-2 text-sm text-ink focus:bg-surface focus:border-accent-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink-muted uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full rounded-xl border border-border bg-paper/60 px-3 py-2 text-xs text-ink focus:bg-surface focus:border-accent-500 focus:outline-none"
                  >
                    <option value="Fintech">Fintech</option>
                    <option value="EdTech">EdTech</option>
                    <option value="AgriTech">AgriTech</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Creative Economy">Creative Economy</option>
                    <option value="AI/SaaS">AI/SaaS</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-ink-muted uppercase tracking-wider mb-1">Validation Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-paper/60 px-3 py-2 text-xs text-ink focus:bg-surface focus:border-accent-500 focus:outline-none"
                  >
                    <option value="Validating">Validating</option>
                    <option value="Threshold met">Threshold met</option>
                    <option value="Campaign live">Campaign live</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink-muted uppercase tracking-wider mb-1">USDC Validation Goal ($ USD)</label>
                <input
                  type="number"
                  required
                  min="100"
                  value={editAskAmount}
                  onChange={(e) => setEditAskAmount(e.target.value)}
                  className="w-full rounded-xl border border-border bg-paper/60 px-3.5 py-2 text-sm text-ink focus:bg-surface focus:border-accent-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink-muted uppercase tracking-wider mb-1">Pitch Summary / Problem</label>
                <textarea
                  rows={3}
                  required
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="w-full rounded-xl border border-border bg-paper/60 px-3.5 py-2 text-xs text-ink focus:bg-surface focus:border-accent-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" type="button" onClick={() => setEditingIdea(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
