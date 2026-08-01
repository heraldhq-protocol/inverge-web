import type { Metadata } from 'next';
import { DashboardView } from '@/components/dashboard/dashboard-view';

export const metadata: Metadata = {
  title: 'My Ideas — Creator Dashboard',
  description: 'Track validation metrics, pre-pledged totals, and campaign readiness for your projects.',
};

/**
 * Creator Dashboard Page.
 *
 * Implements Screen 4 from app-screen-prompts.md:
 * Renders status strip, stat blocks, creator ideas data table, and boost section under (app).
 */
export default function DashboardPage() {
  return <DashboardView />;
}
