import type { Metadata } from "next";

import { IdeaBuilder } from "@/features/idea-builder/components/idea-builder";

export const metadata: Metadata = {
  title: "Create an idea",
  description:
    "Publish an idea, choose what kind of support you need, and configure optional feedback and community settings.",
};

export default function NewIdeaPage() {
  return <IdeaBuilder />;
}
