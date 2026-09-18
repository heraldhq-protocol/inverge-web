"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { Select } from "@/components/ui/select";
import type {
  PrePledgeSort,
  PrePledgeStatusFilter,
} from "@/features/pre-pledges/types";

const statusOptions = [
  { value: "all", label: "All pre-pledges" },
  { value: "near-validation", label: "Near validation" },
  { value: "validating", label: "Still validating" },
  { value: "validation-closed", label: "Validation closed" },
] as const;

const sortOptions = [
  { value: "most-recent", label: "Most recent" },
  { value: "oldest", label: "Oldest first" },
  { value: "highest-intent", label: "Highest intent" },
  { value: "closest-to-validation", label: "Closest to validation" },
] as const;

export function PrePledgeFilters({
  sort,
  status,
}: {
  sort: PrePledgeSort;
  status: PrePledgeStatusFilter;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateFilter(name: "sort" | "status", value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (
      (name === "status" && value === "all") ||
      (name === "sort" && value === "most-recent")
    ) {
      params.delete(name);
    } else {
      params.set(name, value);
    }

    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  return (
    <div
      className={`grid gap-3 sm:max-w-2xl sm:grid-cols-2 ${
        isPending ? "opacity-65" : ""
      }`}
      aria-busy={isPending}
    >
      <div className="space-y-1.5">
        <label
          id="pre-pledge-status-label"
          htmlFor="pre-pledge-status"
          className="text-sm font-medium text-ink"
        >
          Status
        </label>
        <Select
          id="pre-pledge-status"
          aria-labelledby="pre-pledge-status-label"
          value={status}
          options={statusOptions}
          onValueChange={(nextValue) => updateFilter("status", nextValue)}
        />
      </div>
      <div className="space-y-1.5">
        <label
          id="pre-pledge-sort-label"
          htmlFor="pre-pledge-sort"
          className="text-sm font-medium text-ink"
        >
          Sort
        </label>
        <Select
          id="pre-pledge-sort"
          aria-labelledby="pre-pledge-sort-label"
          value={sort}
          options={sortOptions}
          onValueChange={(nextValue) => updateFilter("sort", nextValue)}
        />
      </div>
    </div>
  );
}
