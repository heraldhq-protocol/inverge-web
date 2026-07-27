# Inverge Web — Engineering Conventions

> The rulebook for every line of UI code in `inverge-web`. Read this before writing code,
> whether you are a human or a model. It is deliberately prescriptive: a codebase stays clean
> because the decisions were made once, up front, not re-litigated per file.
>
> Companion docs: [`feed-api.md`](./feed-api.md) and [`feed-design.md`](./feed-design.md) are the
> backend contract and its rationale. [`landing-brief.md`](./landing-brief.md) is the build spec
> for the marketing landing page.

---

## 0. Stack of record

| Thing | Version | Notes |
|---|---|---|
| Next.js | `16.2.10` | App Router. **Turbopack is the default bundler** — no `--turbopack` flag. |
| React | `19.2.4` | Server Components by default. App Router runs a React Canary with 19.2 features. |
| TypeScript | `^5` | `strict: true`. Minimum supported by Next 16 is 5.1. |
| Tailwind CSS | `v4` | **CSS-first config.** There is no `tailwind.config.js` and there must not be one. |
| Node.js | `>= 20.9` | Next 16 dropped Node 18. |
| Fonts | `geist` package | Bundled, offline-safe. Display face added via `next/font/google`. |
| API client | `openapi-fetch` | Typed from `openapi.json` via `pnpm gen:api`. |
| Auth | `@privy-io/react-auth` | **Quarantined** — see §6. |
| Package manager | `pnpm` | `pnpm-workspace.yaml` is present. Never mix in npm/yarn. |

Browser floor (set by Next 16): Chrome/Edge/Firefox 111+, Safari 16.4+. This means you may use
`:has()`, container queries, `oklch()`, and CSS nesting without fallbacks.

Commands:

```bash
pnpm dev         # next dev -p 3001  (API runs on :3000)
pnpm build       # next build
pnpm lint        # eslint  — NOT `next lint`, which was removed in Next 16
pnpm typecheck   # tsc --noEmit
pnpm gen:api     # regenerate the typed API client from openapi.json
```

---

## 1. Product non-negotiables that are also code rules

These are compliance-shaped, not taste-shaped. A PR that violates one does not merge.

1. **Solana is invisible to backers.** No wallet-connect button, no gas or network fee copy, no
   "mainnet/devnet" string, no seed phrase, no raw wallet address, no signature rendered as a
   signature, no price ticker — anywhere in backer-facing UI. A transaction reference is a
   **receipt**. `TxLink` ([tx-link.tsx](../src/components/ui/tx-link.tsx)) is the only component
   permitted to touch an explorer URL, and it renders the words "View receipt".
2. **Money uses tabular figures, always.** Route every amount through `Amount` and every count
   through `Count` ([amount.tsx](../src/components/ui/amount.tsx)). Never hand-format currency
   in JSX. Columns of digits must not jitter.
3. **Paid placement is labelled.** Any feed slot the backend marks as promoted renders a visible,
   non-dismissable label and is visually distinct from organic results. See
   [`feed-design.md`](./feed-design.md) §7 — this is architectural, not cosmetic.
4. **Every button says what happens.** "Fund this idea", not "Submit". "Publish idea", not "Send".
5. **No `Lorem ipsum`, no `Company Name`, no placeholder avatars** in committed code. Realistic
   Nigerian/West African names, believable ₦/$ amounts, real project titles.

---

## 2. Next.js 16 — what changed from what you probably know

Most training data describes Next 13–15. These are the differences that will silently break code
or trigger deprecation errors. **This section is the single highest-value part of this document.**

### 2.1 Request APIs are async. All of them.

Next 15 made them async with a sync compatibility shim. Next 16 **removed the shim**.

```tsx
// ❌ Next 14/15 — throws in Next 16
export default function Page({ params, searchParams }) {
  const { id } = params;
}

// ✅ Next 16
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const query = await searchParams;
}
```

Applies to `params` in `layout`, `page`, `route`, `default`, `opengraph-image`, `twitter-image`,
`icon`, `apple-icon`; `searchParams` in `page`; and `cookies()`, `headers()`, `draftMode()` from
`next/headers`. Also: the `id` passed to `sitemap` from `generateSitemaps`, and `params`/`id` in
image-generating functions, are now Promises.

**Prefer the generated type helpers** over hand-writing the Promise types. Run `pnpm exec next typegen`
and use:

```tsx
export default async function Page(props: PageProps<'/ideas/[id]'>) {
  const { id } = await props.params;
}
```

`PageProps`, `LayoutProps`, and `RouteContext` are globally available and route-literal-typed —
a typo in the route string is a compile error. Use them.

### 2.2 `middleware.ts` → `proxy.ts`

```ts
// proxy.ts (repo root, sibling to src/)
import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  return NextResponse.next();
}
```

The `middleware` filename and named export are deprecated. The proxy runtime is **Node.js and not
configurable** — the edge runtime is not supported there. Config flags renamed too:
`skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`.

### 2.3 Caching APIs

- `revalidateTag(tag)` with one argument is **deprecated and a TypeScript error**. It now requires a
  `cacheLife` profile: `revalidateTag('ideas', 'max')`. Use `'max'` unless you have a reason.
- `updateTag(tag)` — Server Actions only. Read-your-writes: expires and re-reads in the same request.
  Use this after a mutation where the user must see their own change immediately (publishing an idea,
  editing a profile).
- `refresh()` — Server Actions only. Refreshes **uncached** data without touching the cache.
- `cacheLife` and `cacheTag` are stable. Drop the `unstable_` prefixes and the import aliases.

### 2.4 Cache Components / PPR

`experimental.ppr`, `export const experimental_ppr`, `experimental.dynamicIO`, and
`experimental.useCache` are **all removed**. The replacement is the top-level `cacheComponents: true`
flag plus the `"use cache"` directive.

**Decision for this repo: leave `cacheComponents` off for now.** It inverts the caching model
(everything dynamic by default, caching opt-in via `"use cache"`) and is a migration we should make
deliberately, with the feed and campaign routes in place, not in the middle of landing-page work.
Do not enable it in a landing-page PR.

### 2.5 `next/image` defaults changed

- `images.qualities` defaults to `[75]` only. A `quality` prop outside the configured array is
  **coerced** to the nearest allowed value. If you want `quality={90}`, you must add it to config.
- `images.minimumCacheTTL` is now 4 hours (was 60s).
- `16` was removed from default `images.imageSizes`.
- `images.domains` is deprecated — use `images.remotePatterns`.
- Local `src` with a query string requires an `images.localPatterns` entry.
- `next/legacy/image` is deprecated.

### 2.6 Other removals and behaviour changes

| Gone / changed | What to do |
|---|---|
| `next lint` | `pnpm lint` runs ESLint directly. `next build` no longer lints. |
| `serverRuntimeConfig`, `publicRuntimeConfig`, `next/config` | Env vars only. See §6.3. |
| AMP (`useAmp`, `config = { amp: true }`) | Removed entirely. |
| Auto `scroll-behavior: smooth` override | Add `data-scroll-behavior="smooth"` to `<html>` to restore it. |
| `experimental.turbopack` | Now top-level `turbopack` in `next.config.ts`. |
| Parallel route slots | Every `@slot` now **requires** an explicit `default.tsx` or the build fails. |
| `unstable_rootParams()` | Removed; no replacement yet. |
| `next build` size / First Load JS output | Removed as inaccurate for RSC. Measure with Lighthouse. |

### 2.7 Next 16.2 additions worth using

- **`<Link transitionTypes={['slide']}>`** — passes types to `React.addTransitionType` during the
  navigation Transition, so different links can drive different View Transition animations.
  App Router only; silently ignored on Pages Router.
- **`unstable_retry()` in `error.tsx`** — prefer it over `reset()`. `reset()` only clears error state
  and re-renders children, which does nothing when the error came from data fetching.
  `unstable_retry()` calls `router.refresh()` + `reset()` inside a transition, so it actually re-fetches.
- **`unstable_catchError()`** — component-level error boundaries that understand `redirect()` and
  `notFound()` and don't swallow them. Client Components only.
- **Multiple icon formats** — `icon.svg` + `icon.png` with the same basename are both emitted as
  `<link>` tags automatically.

---

## 3. Server and Client Components

**Server Component is the default. `'use client'` is a decision you must be able to defend.**

Reach for a Client Component only when you need state, event handlers, lifecycle effects, browser
APIs (`window`, `localStorage`), or custom hooks.

### 3.1 Push the boundary down

`'use client'` marks a **module-graph boundary**: everything the file imports and every component it
renders directly lands in the client bundle. So put the directive on the leaf, not the shell.

```tsx
// ❌ Whole section ships to the client for one toggle
'use client';
export function HowItWorks() { /* 200 lines of static markup + one useState */ }

// ✅ Static markup stays on the server; only the stepper is interactive
export function HowItWorks() {
  return (
    <section>
      <h2>How it works</h2>
      <MilestoneStepper />   {/* 'use client' lives in this file */}
    </section>
  );
}
```

### 3.2 Use `children` as a slot to interleave

Server Components passed as `children` or props to a Client Component are **not** pulled into the
client graph — they render on the server and arrive as finished output.

```tsx
// modal.tsx — 'use client'
export function Modal({ children }: { children: React.ReactNode }) { /* ... */ }

// page.tsx — Server Component
<Modal>
  <IdeaSummary id={id} />   {/* still a Server Component */}
</Modal>
```

### 3.3 Providers render as deep as possible

`Providers` currently wraps everything inside `<body>`. That is the correct floor — never lift a
provider up to wrap `<html>`, and never add a provider that only two routes need to the root layout.
Push it into the route group that needs it.

### 3.4 Prevent environment poisoning

Any module that reads a non-`NEXT_PUBLIC_` secret must start with `import 'server-only'`, so
importing it from a Client Component is a **build-time** error rather than a silent empty string.

---

## 4. Project structure and naming

```
src/
  app/
    (marketing)/            # route group — landing, how-it-works, legal. No auth chrome.
    (validate)/             # ideas: list, [id], new, verify
    (campaign)/             # campaigns (Phase 2)
    (admin)/                # review (Phase 1)
    layout.tsx              # root: fonts, Providers, Nav
    globals.css             # the ONLY global stylesheet
  components/
    ui/                     # primitives: Button, Card, Amount, TxLink, Stat. No API imports.
    marketing/              # landing-page sections. Presentational only.
    ideas/  kyc/  auth/     # feature components — may call the API
    providers/              # client-boundary wrappers
  lib/
    api/                    # typed client, generated schema, hand-written response types
    auth/  kyc/             # feature logic + hooks
    env.ts                  # client-safe env access
    utils.ts                # cn() and friends
```

Rules:

- **Files: `kebab-case.tsx`.** `login-button.tsx`, `milestone-stepper.tsx`. Matches what is already here.
- **Components: `PascalCase`.** **Hooks: `useCamelCase`** in a `use-*.ts` file.
- **Named exports for components.** The existing code does this (`export function Nav()`). Default
  exports are reserved for the files Next.js requires them in: `page`, `layout`, `template`, `error`,
  `not-found`, `loading`, `default`, `route` handlers, and metadata image files.
- **Imports use the `@/` alias.** Never `../../..`. `@/*` → `./src/*` is already configured.
- **One component per file** unless a second is a private sub-part used only by the first (as `Feature`
  is inside `page.tsx` today — that is fine, and it should not be exported).
- **A `ui/` primitive never imports from `lib/api`.** If it needs data, it takes props. This is what
  keeps the design system testable and the API swappable.
- **Route groups `(name)` do not appear in the URL.** Use them to scope layouts, not to organise files.

---

## 5. Styling — Tailwind v4

### 5.1 There is no JS config

Tailwind v4 is configured in CSS via `@theme` in `globals.css`. Do not create `tailwind.config.js`;
do not install `tailwindcss-animate` or similar v3-era plugins without checking v4 compatibility.

Theme variables both define a CSS custom property **and generate the matching utility**. Namespaces
that matter here: `--color-*`, `--font-*`, `--text-*`, `--font-weight-*`, `--tracking-*`, `--leading-*`,
`--spacing-*`, `--radius-*`, `--shadow-*`, `--breakpoint-*`, `--container-*`, `--animate-*`.

Use `@theme inline` when a token points at another variable (this is why the existing font tokens use
it — `--font-sans: var(--font-geist-sans)` would otherwise create a resolution chain that breaks).

### 5.2 Design tokens are the only source of colour

Every colour in the app comes from a named token. **No raw hex in JSX, no `bg-[#1a1a1a]` for brand
colour.** Arbitrary values are fine for genuinely one-off geometry (`grid-cols-[24rem_1fr]`,
`max-h-[calc(100dvh-var(--spacing-16))]`) — never for the palette.

**The accent is green.** One hue, with hierarchy built from its tints and shades, over a warm paper
neutral. Do not add a second hue to signal a second thing — use weight, size, and spacing. Define
colours in `oklch()`; it gives perceptually even tint ramps, which is exactly what a single-accent
system needs. The concrete ramp lives in [`landing-brief.md`](./landing-brief.md) §4.

Semantic aliases (`--color-surface`, `--color-border`, `--color-ink-muted`) sit on top of the ramp,
and components reference the **semantic** name. That is what makes a brand refresh a one-file change.

Two rules that follow from a green accent and are easy to get wrong:

- Mid-green on a light surface lands near **3:1**. That passes for large text (≥24px) and UI
  boundaries and **fails for body text**. Small green text — numerals, pills, inline links — must
  step down to the darker end of the ramp.
- **Never signal with colour alone** (WCAG 1.4.1). A green "up" pill needs its meaning in text or
  shape too.

### 5.3 Duplication: components before `@apply`

Tailwind's own guidance, in order: loops → multi-cursor → **extract a component** → custom CSS as a
last resort. `@apply` is explicitly discouraged. If a button looks the same in nine places, that is a
`<Button>` component, not a `.btn` class.

### 5.4 Conditional classes

Add `clsx` and `tailwind-merge` and write one helper. The current pattern of
`` className={`font-mono ${className}`} `` silently loses conflict resolution — a caller passing
`font-sans` gets undefined behaviour depending on CSS order.

```ts
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 5.5 Spacing and type

8px base grid: **8 / 16 / 24 / 32 / 48 / 64 / 96** — Tailwind `2 / 4 / 6 / 8 / 12 / 16 / 24`.
Values off this grid need a reason.

Typography roles, fixed:

| Role | Face | Size |
|---|---|---|
| Hero headline | display | `clamp()` between ~40px mobile and ~90px desktop |
| H2 | display | ~32px |
| H3 | display or sans | ~22px |
| Stat figure | sans, `tabular-nums` | 28–36px |
| Body / UI | humanist sans (Geist) | 16px |
| Receipts, IDs, technical | mono (Geist Mono) | 14px |

Mono is for receipts and technical data **only**. It is not a decorative choice.

### 5.6 Responsive

Mobile-first: unprefixed styles are the small-screen case, `sm:`/`md:`/`lg:` layer up. Never write
desktop styles then undo them at `max-md:`.

Prefer **container queries** (`@container`, `@sm:`) for components that appear at different widths in
different places — a card in a 3-up grid and the same card full-bleed on mobile. Breakpoints are for
page layout; container queries are for components.

Content column: centered, max ~1200px, with a 80px gutter at 1440px (`px-5` mobile → `lg:px-20`).

---

## 6. Data, API, and environment

### 6.1 The typed client

`src/lib/api/client.ts` is the only place that constructs an API client. Never call `fetch` against
`NEXT_PUBLIC_API_URL` by hand — you lose the types and the auth middleware.

Regenerate after any backend change: `pnpm gen:api`. The generated `schema.d.ts` is **not** edited by
hand. Response body types live in `src/lib/api/types.ts` until the API ships response schemas.

### 6.2 Where fetching happens

- Public, cacheable reads (idea list, idea detail, feed) → **Server Component**, close to the source.
- Reads that depend on the session token → currently client-side, because the token lives in
  `localStorage`. This is a known constraint, not a pattern to spread. New auth-gated reads go through
  `use-auth`/feature hooks, not ad-hoc `useEffect` + `fetch`.
- Mutations → Server Actions where the data is server-fetched; the typed client where the session
  token is required. After a mutation, use `updateTag()` for read-your-writes, not `router.refresh()`.

### 6.3 Environment variables

Only `NEXT_PUBLIC_*` reaches the browser; everything else is replaced with an empty string in client
bundles. Read client-safe values through `src/lib/env.ts`, never `process.env` scattered in components.
Server-only secrets go in a `server-only`-guarded module (§3.4). `serverRuntimeConfig` /
`publicRuntimeConfig` no longer exist.

If a value must be read at **runtime** rather than baked in at build time, call `await connection()`
from `next/server` before reading `process.env`.

### 6.4 Privy stays quarantined

Privy is confined to `components/providers/providers.tsx` and `lib/auth/use-auth.ts`. **No other file
imports from `@privy-io/react-auth`.** The wallet vendor must stay swappable, and per §1 the wallet
must stay invisible.

---

## 7. Loading, errors, and empty states

Every route segment that fetches data ships all three. This is not polish; it is the difference
between a product and a demo.

- `loading.tsx` — a **skeleton that matches the final layout's dimensions**. A spinner that collapses
  to full-height content is how you fail CLS.
- `error.tsx` — Client Component. Plain language, one recovery action wired to `unstable_retry()`.
  Never render a stack trace or an error code to a backer.
- `not-found.tsx` — for `notFound()`.
- Empty states are **calm direction, not an apology**. "No ideas here yet — be the first to publish
  one." with the action attached. Not "Oops! Nothing found 😢".

Wrap slow independent sections in `<Suspense>` with a matching skeleton so the shell streams first.

---

## 8. Accessibility — WCAG 2.2 AA is the floor

Non-negotiable numbers:

| Criterion | Requirement |
|---|---|
| 1.4.3 Contrast (Minimum) | **4.5:1** body text; **3:1** for large text (≥24px, or ≥18.66px bold) |
| 1.4.11 Non-text Contrast | **3:1** for UI component boundaries, icons, focus rings, chart marks |
| 1.4.10 Reflow | No horizontal scrolling at **320 CSS px** width |
| 1.4.12 Text Spacing | No clipping at 1.5× line-height, 2× paragraph, 0.12em letter, 0.16em word |
| 2.4.7 Focus Visible | Every interactive element has a visible focus indicator |
| 2.4.11 Focus Not Obscured | A focused element is never fully hidden behind sticky headers/overlays |
| 2.5.8 Target Size (Minimum) | Interactive targets **≥ 24×24 CSS px** (aim for 44×44 on touch) |
| 2.3.3 Animation from Interactions | Interaction-triggered motion must be disableable — see §9 |

Practice:

- Semantic HTML first. `<button>` for actions, `<a>`/`<Link>` for navigation. A `<div onClick>` is a bug.
- One `<h1>` per page; heading levels never skip.
- Never remove the focus ring. Restyle it: `focus-visible:ring-2 focus-visible:ring-accent-500
  focus-visible:ring-offset-2`. Use `focus-visible`, not `focus`, so mouse users don't see it.
- A sticky nav needs `scroll-margin-top` on anchor targets, or focus lands under the header (2.4.11).
- Every `<Image>` needs a real `alt`; decorative images get `alt=""`.
- Icon-only buttons need an accessible name (`aria-label`) and a ≥24px hit area.
- Test the whole landing page with the keyboard alone, and once at 320px wide, before calling it done.

---

## 9. Motion and animation

Animation is layered **after** the static UI is correct and accessible. It is never load-bearing:
if every animation is stripped, the page must still be complete and usable.

### 9.1 The reduced-motion contract — mandatory

WCAG 2.2 SC 2.3.3 and technique C39. Every non-essential animation is wrapped:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

That global backstop goes in `globals.css` on day one. Individual components should still gate their
own motion rather than relying on it alone. Vestibular-trigger motion — parallax, large-scale
translation, zoom on scroll — is banned regardless of preference.

### 9.2 What to animate

Only compositor-friendly properties: **`transform` and `opacity`**. Animating `width`, `height`,
`top`, `left`, `margin`, or `box-shadow` triggers layout/paint and costs INP.

Durations: 150–250ms for state changes, 300–500ms for entrances and route transitions. Easing
`ease-out` for entering, `ease-in` for exiting. Anything over 600ms feels broken.

### 9.3 View Transitions

React 19.2 `<ViewTransition>` plus Next 16.2's `<Link transitionTypes>` is the sanctioned route
for page and shared-element transitions. Rules from the React docs:

- `<ViewTransition>` must be **the outermost element** in the component for enter/exit to fire —
  a wrapping `<div>` before it breaks the animation.
- `name` is **only** for shared-element transitions across components; otherwise let React generate it.
  Two mounted `<ViewTransition>` with the same `name` at once is invalid — namespace by id
  (`` name={`idea-${id}`} ``).
- Updates do not animate unless the state change is inside `startTransition`. `flushSync` skips animations.
- Return a cleanup function from `onEnter`/`onExit`/`onUpdate`/`onShare` callbacks.
- Style via View Transition **classes** (`::view-transition-group(.slide-in)`), not by setting
  `view-transition-name` yourself.

### 9.4 Budget

- No animation library on the landing page without a decision recorded here. CSS + View Transitions
  cover the brief; a 40kb motion runtime for a hero fade is a bad trade.
- No scroll-jacking, no scroll-hijacked pinning, no auto-playing carousels.
- No animation may delay LCP. The hero headline renders immediately; it does not fade in from
  `opacity: 0` after a JS bundle loads.
- Nothing infinite in the viewport at rest except a genuine loading indicator.

---

## 10. Performance

Targets are the Core Web Vitals "good" thresholds at the **75th percentile**, mobile and desktop
measured separately:

| Metric | Target |
|---|---|
| LCP — Largest Contentful Paint | **≤ 2.5s** |
| INP — Interaction to Next Paint | **≤ 200ms** |
| CLS — Cumulative Layout Shift | **≤ 0.1** |

Rules that keep us there:

- Every image is `next/image` with explicit `width`/`height` (or `fill` + a sized parent). This is
  the single biggest CLS lever.
- The hero image, if any, gets `priority`. Nothing else does.
- Fonts via `next/font` only — never a `<link>` to Google Fonts, never `@import` in CSS. `next/font`
  self-hosts and eliminates the layout shift. Keep `display: 'swap'` and preload only the faces used
  above the fold.
- Reserve space for anything that arrives late: skeletons match final dimensions, `min-h` on
  streamed slots, `aspect-ratio` on media.
- `next build` no longer prints bundle sizes (they were inaccurate for RSC). Measure with Lighthouse
  or field data — and treat "how much of this page is a Client Component" as the real budget.

---

## 11. TypeScript

- `strict` stays on. **No `any`.** Reach for `unknown` + a narrowing check, or fix the type.
- **No non-null `!`** on API data. The backend is an external boundary; narrow explicitly.
- **No `@ts-ignore`.** If genuinely unavoidable, `@ts-expect-error` with a one-line reason comment,
  so it fails loudly when the underlying type is fixed.
- Props are typed inline for small components, or as an exported `type XProps` when reused.
  `interface` only for something genuinely extended.
- Prefer `type` unions over `enum`.
- Do not re-declare API shapes by hand — import from the generated `schema.d.ts` / `types.ts`.

---

## 12. Comments and code style

Match what is in the repo already: comments explain **why**, and cite the rule or requirement they
enforce. Look at [tx-link.tsx](../src/components/ui/tx-link.tsx) — one comment, points at the
progressive-disclosure requirement, earns its place.

Do not write comments that restate the code. Do not leave commented-out code. Do not add
`// TODO` without a name and a concrete condition.

Formatting: single quotes, semicolons, trailing commas, 2-space indent, ~90 column soft wrap.
That is what the existing files use; stay consistent.

---

## 13. Definition of done

A UI change is not done until every line is true:

- [ ] `pnpm typecheck` and `pnpm lint` are clean.
- [ ] `pnpm build` succeeds.
- [ ] Works at **320px**, 768px, 1024px, 1440px. No horizontal scroll at any width.
- [ ] Full keyboard pass: every interactive element reachable, visible focus, sensible order,
      nothing trapped, nothing hidden behind the sticky nav.
- [ ] Contrast checked against §8 numbers — including placeholder text, disabled states, and
      text over images.
- [ ] Loading, error, and empty states exist and are calm.
- [ ] `prefers-reduced-motion: reduce` produces a still, complete page.
- [ ] No new `'use client'` that could have been pushed further down the tree.
- [ ] No wallet, chain, gas, or signature language anywhere (§1).
- [ ] Every amount goes through `Amount`; every count through `Count`.
- [ ] All copy is real. No lorem, no placeholder names.

---

## 14. Sources

Verified against official documentation, July 2026:

- [Next.js 16 release notes](https://nextjs.org/blog/next-16) ·
  [Upgrading: Version 16](https://nextjs.org/docs/app/guides/upgrading/version-16) ·
  [Next.js 16.2](https://nextjs.org/blog/next-16-2)
- [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) ·
  [Metadata and OG images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) ·
  [Proxy](https://nextjs.org/docs/app/getting-started/proxy) ·
  [cacheComponents](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents)
- [React `<ViewTransition>`](https://react.dev/reference/react/ViewTransition) ·
  [React 19.2](https://react.dev/blog/2025/10/01/react-19-2)
- [Tailwind CSS v4 — Theme variables](https://tailwindcss.com/docs/theme) ·
  [Styling with utility classes](https://tailwindcss.com/docs/styling-with-utility-classes)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) ·
  [Understanding SC 2.3.3: Animation from Interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html) ·
  [C39: Using `prefers-reduced-motion`](https://www.w3.org/WAI/WCAG21/Techniques/css/C39)
- [Web Vitals](https://web.dev/articles/vitals)
