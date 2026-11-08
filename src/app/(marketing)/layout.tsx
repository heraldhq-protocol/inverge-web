import { readSessionUser } from "@/features/auth/server/session-user";
import { CommandPaletteProvider } from "@/features/command-palette/components/command-palette-provider";
import { MotionProvider } from "@/features/marketing/components/motion/motion-provider";
import { ScrollToTop } from "@/features/marketing/components/scroll-to-top";
import type { SiteViewer } from "@/features/marketing/components/site-account";
import { SiteFooter } from "@/features/marketing/components/site-footer";
import { SiteHeader } from "@/features/marketing/components/site-header";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await readSessionUser();
  const viewer: SiteViewer | null = user
    ? {
        avatarUrl: user.avatarUrl,
        displayName: user.displayName,
        mode: user.mode,
        username: user.username,
      }
    : null;

  return (
    <MotionProvider>
      <CommandPaletteProvider context="public" signedIn={Boolean(viewer)}>
        <ScrollToTop />
        <SiteHeader viewer={viewer} />
        {children}
        <SiteFooter />
      </CommandPaletteProvider>
    </MotionProvider>
  );
}
