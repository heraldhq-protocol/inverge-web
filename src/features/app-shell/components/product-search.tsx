import { Search } from "lucide-react";

type HiddenField = {
  name: string;
  value: string;
};

export function ProductSearch({
  action,
  defaultValue = "",
  hiddenFields = [],
  label = "Search ideas, creators, and projects",
  placeholder = "Search ideas, creators and projects",
}: {
  action: string;
  defaultValue?: string;
  hiddenFields?: HiddenField[];
  label?: string;
  placeholder?: string;
}) {
  return (
    <form action={action} role="search" className="flex max-w-2xl gap-2">
      <label htmlFor="product-search" className="sr-only">
        {label}
      </label>
      {hiddenFields.map(({ name, value }) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          id="product-search"
          name="q"
          type="search"
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="min-h-12 w-full rounded-xl border border-border bg-surface py-2 pl-12 pr-4 text-sm text-ink outline-none transition placeholder:text-muted/70 hover:border-muted/45 focus:border-brand focus:ring-3 focus:ring-brand/12 sm:min-h-13"
        />
      </div>
      <button
        type="submit"
        className="inline-flex min-h-12 items-center justify-center rounded-xl bg-contrast px-5 text-sm font-semibold text-white transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <span className="hidden sm:inline">Search</span>
        <Search className="size-5 sm:hidden" aria-hidden="true" />
      </button>
    </form>
  );
}
