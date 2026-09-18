export function IdeasLoading() {
  return (
    <div
      className="mx-auto w-full max-w-[90rem] animate-pulse px-4 py-7 sm:px-6 sm:py-9 lg:px-8 xl:px-10"
      role="status"
      aria-label="Loading ideas"
    >
      <div className="grid items-end gap-6 border-b border-border pb-8 xl:grid-cols-2">
        <div>
          <div className="h-3 w-32 rounded-full bg-border" />
          <div className="mt-4 h-10 w-full max-w-lg rounded-xl bg-border" />
          <div className="mt-3 h-5 w-full max-w-xl rounded-lg bg-border/75" />
        </div>
        <div className="h-14 rounded-xl bg-border/75" />
      </div>
      <div className="my-6 flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-12 w-36 shrink-0 rounded-xl bg-border/75"
          />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="h-[32rem] rounded-2xl bg-border/75 xl:col-span-2" />
        <div className="h-[32rem] rounded-2xl bg-border/75" />
      </div>
      <span className="sr-only">Loading ideas</span>
    </div>
  );
}
