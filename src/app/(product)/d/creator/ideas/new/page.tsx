import type { Metadata } from "next";

import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { IdeaBuilder } from "@/features/idea-builder/components/idea-builder";
import { isApiConfigured } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Create an idea",
  description:
    "Publish an idea, choose what kind of support you need, and configure optional feedback and community settings.",
};

export default function NewIdeaPage() {
  const mode =
    isPreviewAuth() || !isApiConfigured() ? ("preview" as const) : ("live" as const);

  return <IdeaBuilder mode={mode} />;
}
