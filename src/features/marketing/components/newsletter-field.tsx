export function NewsletterField() {
  return (
    <div>
      <div className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.06] p-1.5">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address for Inverge updates
        </label>
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          disabled
          placeholder="Enter your email"
          className="min-h-10 w-full min-w-0 bg-transparent px-3 text-sm text-white placeholder:text-white/42 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          disabled
          className="min-h-10 shrink-0 cursor-not-allowed rounded-full bg-brand px-4 text-xs font-semibold text-white opacity-75"
        >
          Subscribe
        </button>
      </div>
      <p className="mt-2 text-xs text-white/48">
        Email signup will open with backend integration.
      </p>
    </div>
  );
}
