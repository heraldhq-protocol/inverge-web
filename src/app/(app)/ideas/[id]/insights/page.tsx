import type { Metadata } from 'next';
import { IdeaInsightsView } from '@/components/ideas/idea-insights-view';

export const metadata: Metadata = {
  title: 'Idea Insights — Creator Analytics',
  description: 'Private creator validation analytics, gate progress breakdown, and survey feedback.',
};

/**
 * Creator-only Idea Insights Page.
 *
 * Implements /ideas/[id]/insights route under (app).
 * Reads params as Promise (Next 16 convention) and renders IdeaInsightsView.
 */
export default async function IdeaInsightsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  return <IdeaInsightsView ideaId={id} />;
}
