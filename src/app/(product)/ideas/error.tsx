"use client";

import { IdeasError as IdeasErrorState } from "@/features/ideas/components/ideas-error";

export default function IdeasError({ reset }: { reset: () => void }) {
  return <IdeasErrorState reset={reset} />;
}
