import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guides — Inverge",
  description:
    "Practical guides to validating ideas, backing campaigns, milestone review, refunds, and identity verification.",
};

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
