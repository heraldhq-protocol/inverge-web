import { redirect } from 'next/navigation';

/**
 * `/ideas` was the Phase-0 browse list. The ranked feed supersedes it as the discovery surface
 * (feed-api.md), so this redirects rather than keeping a second, worse list alive. It stays as a route
 * because the marketing nav and existing links point at it.
 */
export default function IdeasIndexPage() {
  redirect('/feed');
}
