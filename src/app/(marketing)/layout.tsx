import { MotionProvider } from "@/features/marketing/components/motion/motion-provider";
import { SiteFooter } from "@/features/marketing/components/site-footer";
import { SiteHeader } from "@/features/marketing/components/site-header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MotionProvider>
      <SiteHeader />
      {children}
      <SiteFooter />
    </MotionProvider>
  );
}
