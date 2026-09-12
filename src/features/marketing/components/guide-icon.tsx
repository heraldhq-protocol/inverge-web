import { Coins, FileBadge, Lightbulb, Scale, UserCheck } from "lucide-react";

type GuideIconProps = {
  slug: string;
  className?: string;
};

export function GuideIcon({ slug, className = "size-6" }: GuideIconProps) {
  switch (slug) {
    case "publish-and-validate-an-idea":
      return <Lightbulb className={className} aria-hidden="true" />;
    case "back-a-campaign":
      return <Coins className={className} aria-hidden="true" />;
    case "milestones-objections-and-refunds":
      return <Scale className={className} aria-hidden="true" />;
    case "identity-verification":
      return <UserCheck className={className} aria-hidden="true" />;
    default:
      return <FileBadge className={className} aria-hidden="true" />;
  }
}

export function getGuideAudience(slug: string) {
  if (slug === "publish-and-validate-an-idea") return "Builders";
  if (slug === "back-a-campaign") return "Backers";
  return "Everyone";
}
