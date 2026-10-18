"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { Select } from "@/components/ui/select";
import {
  backingStatusLabels,
  BACKING_STATUSES,
  type BackingSort,
  type BackingStatus,
} from "@/features/campaigns/lib/backing";

const statusOptions = BACKING_STATUSES.map((value) => ({
  label: backingStatusLabels[value],
  value,
}));

const sortOptions = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
] as const;

/**
 * Sort and status for the backing history.
 *
 * These navigate rather than filter in place, matching the rest of the product
 * shell: the list is rendered on the server from the URL, so a filtered history
 * is a real, shareable address and works before hydration.
 */
export function BackingFilters({
  sort,
  status,
}: {
  sort: BackingSort;
  status: BackingStatus;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateFilter(name: "sort" | "status", value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (
      (name === "status" && value === "all") ||
      (name === "sort" && value === "newest")
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
      className={`grid gap-3 sm:max-w-xl sm:grid-cols-2 ${
        isPending ? "opacity-65" : ""
      }`}
      aria-busy={isPending}
    >
      <div className="space-y-1.5">
        <label
          id="backing-status-label"
          htmlFor="backing-status"
          className="text-sm font-medium text-ink"
        >
          Status
        </label>
        <Select
          id="backing-status"
          aria-labelledby="backing-status-label"
          value={status}
          options={statusOptions}
          onValueChange={(nextValue) => updateFilter("status", nextValue)}
        />
      </div>
      <div className="space-y-1.5">
        <label
          id="backing-sort-label"
          htmlFor="backing-sort"
          className="text-sm font-medium text-ink"
        >
          Sort
        </label>
        <Select
          id="backing-sort"
          aria-labelledby="backing-sort-label"
          value={sort}
          options={sortOptions}
          onValueChange={(nextValue) => updateFilter("sort", nextValue)}
        />
      </div>
    </div>
  );
}
