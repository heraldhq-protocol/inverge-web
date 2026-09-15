import { type ComponentProps, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "outline";
type ButtonSize = "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-strong focus-visible:outline-brand",
  secondary:
    "border border-border bg-surface text-ink hover:border-brand/45 hover:bg-canvas focus-visible:outline-brand",
  outline:
    "border border-border bg-transparent text-ink hover:border-brand/45 hover:bg-canvas focus-visible:outline-brand",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-6 text-sm font-semibold",
};

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "lg", className = "", children, ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-xl font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
