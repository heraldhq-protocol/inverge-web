import { ProductSearch } from "@/features/app-shell/components/product-search";
import { NotificationCenter } from "@/features/notifications/components/notification-center";
import type {
  NotificationFilter,
  NotificationRecord,
} from "@/features/notifications/types";

export function NotificationsDashboard({
  items,
  query = "",
  selectedFilter = "all",
}: {
  items: NotificationRecord[];
  query?: string;
  selectedFilter?: NotificationFilter;
}) {
  return (
    <div className="mx-auto w-full max-w-[90rem] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10">
      <ProductSearch
        action="/notifications"
        defaultValue={query}
        hiddenFields={
          selectedFilter === "all"
            ? []
            : [{ name: "filter", value: selectedFilter }]
        }
        label="Search notifications"
        placeholder="Search notifications and projects"
      />

      <header className="mt-8 sm:mt-10">
        <div className="flex items-center gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-strong">
            Notifications
          </p>
          <span
            className="text-xs text-muted"
            title="Notifications are sample data"
          >
            Sample data
          </span>
        </div>
        <h1 className="mt-2 text-balance text-3xl font-bold tracking-[-0.045em] text-ink sm:text-4xl">
          Notifications
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted sm:text-base">
          Updates from the ideas and campaigns you follow.
        </p>
      </header>

      <NotificationCenter
        items={items}
        query={query}
        selectedFilter={selectedFilter}
      />
    </div>
  );
}
