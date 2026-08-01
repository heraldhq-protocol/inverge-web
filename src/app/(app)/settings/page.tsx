import type { Metadata } from 'next';
import { SettingsView } from '@/components/settings/settings-view';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your profile, sign-in methods, feed interests, and notification settings.',
};

/**
 * Profile & Settings Page.
 *
 * Placed within the (app) route group, inheriting the AppLayout topbar shell.
 * Renders the SettingsView client component inside a single centered column.
 */
export default function SettingsPage() {
  return <SettingsView />;
}
