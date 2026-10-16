import Link from "next/link";

type ButtonLinkProps = {
  children: React.ReactNode;
  href: string;
  variant?: "primary" | "secondary" | "light" | "outline-light";
  className?: string;
};

const variants = {
  primary:
    "bg-brand text-ink hover:brightness-95 active:brightness-90 focus-visible:outline-ink",
  secondary:
    "border border-border bg-surface text-ink hover:border-brand/60 hover:bg-canvas focus-visible:outline-ink",
  light: "bg-white text-contrast hover:bg-canvas focus-visible:outline-white",
  "outline-light":
    "border border-white/30 bg-transparent text-white hover:border-white/60 hover:bg-white/10 focus-visible:outline-white",
} as const;

export function ButtonLink({
  children,
  href,
  variant = "primary",
  className = "",
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 w-full items-center justify-center rounded-full px-6 text-sm font-semibold transition-[filter,background-color,border-color,color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
