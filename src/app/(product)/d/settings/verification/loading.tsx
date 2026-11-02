export default function VerificationLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading identity verification"
      className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10"
    >
      <div className="h-9 w-24 rounded-lg bg-canvas" />
      <div className="mt-3 h-9 w-64 rounded-lg bg-canvas" />
      <div className="mt-2 h-4 w-full max-w-xl rounded bg-canvas" />

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="border-b border-border/70 px-5 py-5 sm:px-6">
          <div className="h-3 w-24 rounded bg-canvas" />
          <div className="mt-2 h-7 w-56 rounded bg-canvas" />
          <div className="mt-2 h-4 w-full max-w-lg rounded bg-canvas" />
        </div>
        <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <div className="rounded-xl border border-border bg-canvas p-5">
            <div className="flex gap-3">
              <div className="size-10 shrink-0 rounded-xl bg-surface" />
              <div className="flex-1">
                <div className="h-5 w-44 rounded bg-surface" />
                <div className="mt-2 h-4 w-full rounded bg-surface" />
                <div className="mt-1.5 h-4 w-4/5 rounded bg-surface" />
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <div className="h-11 w-40 rounded-xl bg-surface" />
              <div className="h-11 w-32 rounded-xl bg-surface" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-28 rounded-xl border border-border bg-canvas" />
            <div className="h-36 rounded-xl border border-border bg-canvas" />
          </div>
        </div>
        <div className="grid gap-2 px-5 pb-6 sm:grid-cols-2 sm:px-6">
          <div className="h-20 rounded-xl border border-border bg-canvas" />
          <div className="h-20 rounded-xl border border-border bg-canvas" />
        </div>
      </div>
    </main>
  );
}
