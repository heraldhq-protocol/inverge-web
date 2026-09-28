import { PrePledgeItem } from "@/features/pre-pledges/components/pre-pledge-item";
import type {
  PrePledgeRecord,
  PrePledgeStage,
} from "@/features/pre-pledges/types";

export function PrePledgeSection({
  description,
  items,
  stage,
  title,
}: {
  description?: string;
  items: PrePledgeRecord[];
  stage: PrePledgeStage;
  title: string;
}) {
  return (
    <section aria-labelledby={`${stage}-pre-pledges-title`}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2
            id={`${stage}-pre-pledges-title`}
            className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm leading-5 text-muted">{description}</p>
          ) : null}
        </div>
        <p className="shrink-0 text-xs text-muted">
          Showing all {items.length}
        </p>
      </div>

      <ul
        className={
          stage === "active"
            ? "grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3"
            : "grid gap-4 lg:grid-cols-2"
        }
      >
        {items.map((item) => (
          <PrePledgeItem key={item.idea.id} item={item} />
        ))}
      </ul>
    </section>
  );
}
