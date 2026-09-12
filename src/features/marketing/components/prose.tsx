import type { ComponentPropsWithoutRef } from "react";

export function Prose({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={`max-w-[72ch] text-[1.02rem] leading-8 text-muted [&>*+*]:mt-5 [&_a]:font-semibold [&_a]:text-brand-strong [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-12 [&_h2]:scroll-mt-24 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-[-0.03em] [&_h2]:text-ink sm:[&_h2]:text-3xl [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-ink [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:space-y-3 [&_ol]:pl-6 [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-3 [&_ul]:pl-6 ${className}`}
      {...props}
    />
  );
}
