import Link from "next/link";

type ButtonLinkProps = {
  children: React.ReactNode;
  href: string;
  variant?: "primary" | "secondary" | "light" | "outline-light";
  className?: string;
};

export function ButtonLink({
  children,
  href,
  variant = "primary",
  className = "",
}: ButtonLinkProps) {
  const variants = {
    primary: "bg-brand text-white hover:bg-brand-strong",
    secondary: "border border-border bg-surface text-ink hover:border-brand/50",
    light: "bg-white text-contrast hover:bg-canvas",
    "outline-light":
      "border border-white/30 bg-transparent text-white hover:bg-white/10 hover:border-white/50",
  } as const;

  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
