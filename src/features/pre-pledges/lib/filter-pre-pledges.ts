import type {
  PrePledgeRecord,
  PrePledgeSort,
  PrePledgeStatusFilter,
} from "@/features/pre-pledges/types";

function matchesQuery(record: PrePledgeRecord, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (!normalizedQuery) return true;

  return [
    record.idea.title,
    record.idea.category,
    record.idea.creator,
    record.idea.description,
  ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
}

export function filterAndSortPrePledges({
  items,
  query,
  sort,
  status,
}: {
  items: readonly PrePledgeRecord[];
  query: string;
  sort: PrePledgeSort;
  status: PrePledgeStatusFilter;
}) {
  const filtered = items.filter(
    (record) =>
      (status === "all" || record.status === status) &&
      matchesQuery(record, query),
  );

  return filtered.toSorted((left, right) => {
    switch (sort) {
      case "oldest":
        return Date.parse(left.updatedAt) - Date.parse(right.updatedAt);
      case "highest-intent":
        if (BigInt(right.intent.atomic) === BigInt(left.intent.atomic))
          return 0;
        return BigInt(right.intent.atomic) > BigInt(left.intent.atomic)
          ? 1
          : -1;
      case "closest-to-validation":
        return (
          right.idea.validationPercent - left.idea.validationPercent ||
          Date.parse(right.updatedAt) - Date.parse(left.updatedAt)
        );
      case "most-recent":
        return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
    }
  });
}
