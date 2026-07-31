# Landing Page — Build Brief

> Implementation spec for the Inverge marketing landing page, written against the approved desktop
> mockup. All engineering rules live in [`conventions.md`](./conventions.md) — this document is
> scope, structure, and the build order. Where the two disagree, `conventions.md` wins.

---

## 1. Scope

**In scope.** One route, `/`, rendered as a Server Component: nav, hero, how-it-works, stat strip,
trust row, footer. Fully responsive from 320px to 1440px+. Static and correct with zero JavaScript
animation.

**Out of scope for this pass:** animations and transitions (separate pass — §8), the discovery feed,
auth flows, campaign UI, live data.

### 1.1 Files that may be created or modified

```
src/app/(marketing)/page.tsx          # move the landing page here out of app/page.tsx
src/app/(marketing)/layout.tsx        # marketing chrome, if it differs from root
src/components/marketing/*.tsx        # one file per section
src/components/ui/*.tsx               # new primitives: button.tsx, section.tsx, stat.tsx, ...
src/app/globals.css                   # @theme tokens only
src/lib/utils.ts                      # cn() helper
src/app/layout.tsx                    # fonts + metadata only
public/*                              # image assets
```

### 1.2 Files that must not be touched

`src/lib/api/**`, `src/lib/auth/**`, `src/lib/kyc/**`, `src/components/providers/**`,
`src/components/auth/**`, `src/components/kyc/**`, `src/components/ideas/**`, `openapi.json`,
`next.config.ts`, `eslint.config.mjs`, `tsconfig.json`.

The landing page is presentational. It renders zero live data — the stat strip and the "recently
funded" card use hard-coded, believable figures behind typed constants at the top of their files,
ready to swap for real endpoints later.

**Amended 2026-07-31: one section is now live.** `components/marketing/momentum.tsx` reads the ranked
feed and shows three ideas with a route into `/feed`. The rule held everywhere else, but it failed on
this specific section: hard-coded ideas on a page whose whole job is proving that real people back real
projects collapse the moment a visitor clicks through and cannot find them. Stale proof is worse than
no proof.

Conditions that come with the exception, and they are not optional:

- **Promoted items are filtered out before the shortlist is taken.** Paid placement is correct inside
  the ranked feed, clearly labelled. On a marketing page it would read as us vouching for something a
  creator paid for, in a section headed "being backed now" (FR-206a).
- **It renders the real `IdeaCard`.** No marketing variant, so the figures, the "Estimated interest"
  label and the explainability chip are identical to the feed. A friendlier number here would be a
  different claim about the same idea.
- **The route revalidates** (`export const revalidate` in `(marketing)/page.tsx`) rather than going
  dynamic. Before `USE_FIXTURES` flips, `getFeed` needs a revalidating fetch — it currently reads with
  `cache: 'no-store'`, which would opt the landing page out of static rendering entirely.

---

## 2. Build order — one section at a time

**Do not one-shot this page.** Each stage below is a separate, reviewable step. Finish a stage,
run `pnpm typecheck && pnpm lint`, look at it in the browser, then start the next. A single 900-line
generation produces duplicated spacing values, six near-identical button styles, and markup nobody
can animate later.

| Stage | Deliverable | Gate before moving on |
|---|---|---|
| **0** | `globals.css` `@theme` token set (§4) + `cn()` in `src/lib/utils.ts` | Tokens compile; no section built yet |
| **1** | `ui/` primitives: `Button`, `Section`, `Container`, `Stat`, `Eyebrow` | Each renders in isolation; variants driven by `cn()` |
| **2** | `marketing/nav.tsx` + `marketing/footer.tsx` — the frame | Frame renders top and bottom with empty middle |
| **3** | `marketing/hero.tsx` | Headline is server-rendered text at full opacity |
| **4** | `marketing/how-it-works.tsx` | Connector works at all widths (§3.3) |
| **5** | `marketing/stat-strip.tsx` | All figures via `Amount`/`Count`, tabular |
| **6** | `marketing/trust-row.tsx` | Semantic `<figure>`/`<blockquote>` |
| **7** | Responsive pass — 320 / 768 / 1024 / 1440 | No horizontal scroll at 320px |
| **8** | Accessibility pass — contrast, focus, keyboard, targets | `conventions.md` §8 numbers verified |

Stage 0 is not optional and not reorderable. Building sections first and extracting tokens
afterwards is how a codebase ends up with fourteen greens.

---

## 3. Sections

Content and layout are fixed by the mockup. These are the implementation notes.

### 3.1 Nav

Logo (leaf mark + "inverge" wordmark) · "Explore ideas" · "How it works" · "About" · "Resources ⌄" ·
"Sign in" (outlined) · "Start an idea" (green filled). Height ~72–80px, sitting on the cream
background with no bottom border.

- **No "Connect wallet", ever.** "Sign in" is a `<Link>` to the existing auth entry point — it does
  **not** import Privy (`conventions.md` §6.4).
- "Resources ⌄" is the only interactive element here. It is a disclosure, so it is the one
  `'use client'` leaf in this section — nav itself stays a Server Component. It needs
  `aria-expanded`, `aria-controls`, Escape-to-close, and focus return to the trigger.
- If the nav becomes sticky, every anchor target needs `scroll-margin-top` equal to its height, or
  keyboard focus lands underneath it (WCAG 2.4.11).
- Below `md`, collapse to logo + "Start an idea" + a disclosure holding the rest. The mobile menu
  trigger needs an `aria-label` and a ≥44px touch target.

### 3.2 Hero

Two-column, asymmetric — this is the deliberate break from the centered-hero template, so preserve it.

**Left column.** The headline is two-tone and that is semantic, not decorative: "Back African
builders." in near-black, "Get your money back if they don't deliver." in the accent green. One
`<h1>`, with the second clause wrapped in a `<span>` — never two headings, never a `<br>`-separated
pair of elements.

The headline is the **LCP element**. Server-rendered text, present in the initial HTML, at full
opacity. It does not wait on a font, a bundle, or an animation. Size with `clamp()` so it scales
continuously instead of jumping at breakpoints.

Below it: the supporting paragraph, then the CTA pair — "Explore ideas →" (green filled, trailing
arrow) → `/ideas`, and "Start an idea" (outlined) → `/ideas/new`. Then the social-proof row:
overlapping avatar stack + "Join 18,431 backers supporting builders across Africa".

The avatar stack is decorative repetition — `aria-hidden` on the images, with the count carried by
the adjacent text. Do not ship eight `alt="Avatar"` strings to a screen reader.

**Right column.** The Lagos street photograph (danfo buses, specific and place-real — keep it; this
is the anti-generic-Africa requirement paying off). Then the "RECENTLY FUNDED" card overlapping the
image's bottom edge.

- The photo needs `priority` — it is the only image on the page that gets it. Explicit
  `width`/`height`, and a real descriptive `alt`.
- The card overlaps the image, so it needs a real stacking context, not negative margins that break
  at `md`. Below `lg` it stops overlapping and stacks beneath.
- **₦4,200,000 goes through `Amount`.** "Milestone 1 funded" and the progress bar: the bar is
  `role="progressbar"` with `aria-valuenow`/`aria-valuemin`/`aria-valuemax`, or a `<progress>` element.
- Card text at these sizes over a light surface — check contrast on "School food ordering platform
  in Ibadan" and the "RECENTLY FUNDED" eyebrow specifically. Small + light grey is the usual failure.

### 3.3 How it works

Cream section. Heading + "Three simple steps. Built for accountability." Then three numbered stages
— 01 Validate, 02 Fund in milestones, 03 Get proof or a refund — joined by a **single continuous
routed path** that runs left to right, turns down past step 03, and returns leftward with an
arrowhead. That loop-back is the signature moment: it draws the refund returning to the backer. It
is the point of the section, not decoration.

- Semantically an `<ol>`, because it is one. The three stages are `<li>`.
- The connector is `aria-hidden` — an inline SVG or pseudo-elements. It must never reach the
  accessibility tree.
- **Responsive is the hard part.** The routed path cannot survive a narrow viewport. Below `lg`,
  the stages stack vertically and the connector becomes a vertical spine with the same return curve,
  or is dropped entirely. Do not scale the desktop SVG down — it becomes illegible. Build the mobile
  connector as a separate `lg:hidden` / `hidden lg:block` pair.
- Icon circles carry the tint hierarchy: 01 solid accent, 02 pale accent tint, 03 deep forest. Three
  shades of one hue, which is exactly the palette rule (`conventions.md` §5.2). Keep it.

**Icon correction — do not copy the mockup here.** Step 03 is drawn as a **shield with a
checkmark**. That is explicitly on the banned list in the visual identity brief: no shield, no
padlock, no checkmark-in-a-circle, no handshake, no rocket. This exact product category reaches for
them by reflex and they read as stock trust-badge slop on sight. Replace it with something that
draws the actual mechanic:

| Step | Drawn in mockup | Use instead |
|---|---|---|
| 01 Validate | person/megaphone | Fine as-is — a speech/feedback mark is the real mechanic |
| 02 Fund in milestones | calendar | A milestone stepper or tranche bars — a calendar implies dates, but milestones are gated on *proof*, not time |
| 03 Get proof or a refund | **shield + checkmark** ❌ | A receipt/document mark, or a return arrow. Draw the proof or the refund — not a symbol standing in for "trust" |

Icons are inline SVG in the component or a small local set. Do **not** install an icon library for
six glyphs. Every icon is `aria-hidden` with the meaning carried by the adjacent text.

### 3.4 Stat strip

Full-bleed dark forest band — the page's only inverted section. "● LIVE ON INVERGE" eyebrow with a
status dot, then three figures: Ideas published `2,734`, Total escrowed `₦1,248,450,000`, Active
campaigns `156`. Each with a green delta pill: "↗ +32 this week".

- Every figure goes through `Amount` or `Count` (`conventions.md` §1). The mockup shows the figures
  with visible tabular spacing — that is `tabular-nums`, and it is mandatory here, not stylistic.
- **Reserve the width now.** These become live numbers. `₦1,248,450,000` must not reflow the section
  when it ticks. Set a `min-w` on each stat block sized to the widest plausible value.
- The "● LIVE" dot is the one place a pulse animation is warranted — deferred to the animation pass,
  but note it must be `prefers-reduced-motion` gated and must not be the only signal that data is live.
- **Contrast is the risk in this section.** Green-on-dark-green for the delta pills is exactly where
  4.5:1 fails. Check the pill text and the eyebrow against the band, not against white.
- Delta pills need their meaning in text, not just the ↗ glyph and colour — colour alone is not an
  accessible signal.

### 3.5 Trust row

Cream. Eyebrow "TRUSTED BY BUILDERS & BACKERS", then three parts: the "Supported by" Techstars
logotype block, the testimonial, and the CampusKonekt team photograph.

- Testimonial markup is `<figure>` + `<blockquote>` + `<figcaption>`. The attribution — Tobi Adeyemi,
  Founder CampusKonekt, "₦3.6M raised · 2 milestones completed" — lives in the `figcaption`.
- The large decorative quote glyph is `aria-hidden`; do not let a screen reader announce `"`.
- ₦3.6M goes through `Amount`.
- Techstars is a real third-party mark. Use their actual logotype as a static asset with correct
  `alt`, and confirm we are permitted to display it before launch. Do not redraw it in CSS.
- The photo needs a real `alt` describing the scene, not `alt="team"`.

### 3.6 Footer

Dark forest. Logo + "Backing ideas. Built on accountability." + social icons (X, LinkedIn,
Instagram). Three link columns: PRODUCT, COMPANY, RESOURCES. A newsletter card with an email input
and a green "Subscribe" button. Bottom bar: "© 2025 Inverge. All rights reserved." and "Made in
Africa, for the world." with the Africa outline mark.

- Update the copyright year — the mockup says 2025.
- Social icon links need accessible names ("Inverge on LinkedIn"), not bare icons, and ≥24px targets.
- The newsletter form is the second `'use client'` leaf on this page. It needs a real `<label>`
  (visually hidden is fine, `placeholder` is **not** a label), `type="email"`, `autoComplete="email"`,
  and a status region for success/error. Wire it to nothing for now — no endpoint exists — but do
  not ship a form that silently does nothing on submit; disable it or route it to a stub.
- Footer link columns are `<nav>` landmarks with `aria-label`, or a plain `<ul>` — not a stack of divs.

---

## 4. Design tokens (Stage 0)

The mockup settles the open colour question: **the accent is green**, and the whole page is built
from tints and shades of that single hue plus a warm paper neutral. That is exactly the
one-deliberate-accent rule, and it steers clear of both SaaS indigo and crypto purple.

Three surfaces carry the entire page: warm cream (default), deep forest (stat strip + footer), and
white (cards). Build the ramp, then alias it semantically — components reference the **semantic**
name so a brand refresh is a one-file change.

```css
@theme {
  /* Accent ramp — one hue. Calibrate against real brand colour before launch. */
  --color-accent-50:  oklch(0.96 0.03 150);
  --color-accent-100: oklch(0.91 0.06 150);
  --color-accent-500: oklch(0.63 0.17 150);   /* CTA fill, headline clause, numerals */
  --color-accent-700: oklch(0.48 0.13 150);
  --color-accent-900: oklch(0.30 0.07 152);
  --color-forest:     oklch(0.22 0.045 155);  /* stat strip + footer band */

  /* Warm neutrals — the paper the page is printed on */
  --color-paper:      oklch(0.97 0.008 95);
  --color-surface:    oklch(1    0     0);
  --color-ink:        oklch(0.20 0.01  95);
  --color-ink-muted:  oklch(0.50 0.01  95);
  --color-border:     oklch(0.90 0.01  95);
}
```

Values above are a starting ramp derived from the mockup, not sampled brand colour. Treat them as
placeholders to calibrate — but calibrate the **ramp**, do not add a second hue.

Two cautions, both load-bearing:

1. **Green at `--color-accent-500` on cream is around 3:1.** That is fine for the large headline
   clause (≥24px) and for UI boundaries, and it **fails** for body text. Any small green text —
   the "01/02/03" numerals, the delta pills, links — must use `--color-accent-700` or darker.
   Verify with a contrast checker, do not eyeball it.
2. **Never signal with colour alone.** The delta pills, the funded progress bar, and the "live" dot
   all need a text or shape equivalent.

Fonts: Geist Sans and Geist Mono are already wired via the `geist` package. The display face is
added through `next/font/google` (self-hosted at build time, no external `<link>` — see
`conventions.md` §10), exposed as `--font-display`, and used **only** for headlines. Mono is for
receipts and technical data only.

---

## 5. Component extraction

Anything appearing more than once becomes a component before the second use, not after the third.
Expect at minimum:

- `ui/button.tsx` — primary / secondary / ghost, variants via `cn()`. Renders `<button>` for actions
  and `<Link>` for navigation — every CTA on this page navigates. Min 44×44 touch target.
- `ui/section.tsx` — shared vertical rhythm and max-width container, so section spacing is defined
  once. Takes a `tone` prop for cream vs forest, since the page alternates.
- `ui/stat.tsx` — figure + label + delta pill, tabular figures, width reserved.
- `ui/eyebrow.tsx` — the uppercase tracked label used in at least four places.
- `marketing/nav.tsx`, `hero.tsx`, `how-it-works.tsx`, `stat-strip.tsx`, `trust-row.tsx`, `footer.tsx`.

Copy lives in the component that renders it, or in a typed const at the top of the file. Not in a
`content.json`, not in an i18n layer — premature for one page.

---

## 6. Responsive requirements

The mockup is a 1440px desktop composite. Responsive behaviour is **not** a follow-up — it ships in
the same pass, at Stage 7.

| Width | Requirement |
|---|---|
| 320px | Hard floor. No horizontal scroll, nothing clipped, no overlapping text. |
| 320–767 | Single column throughout. Nav collapses. Hero image moves below the headline; the "recently funded" card stops overlapping and stacks. How-it-works becomes a vertical spine. Stats stack or go 2-up. Footer columns stack. |
| 768–1023 | Two-column where content supports it. Hero may stay stacked. |
| ≥1024 | Full desktop composition as drawn, including the routed connector. |
| ≥1440 | Content column caps at ~1200px and centres; gutters grow. The page does not stretch edge-to-edge — but the forest stat strip and footer stay full-bleed with their *content* capped. |

Mobile-first CSS: unprefixed styles are the 320px case. Use container queries for cards that appear
at different widths in different places.

---

## 7. Copy

Every string in the mockup is final and ships as written — including the specific figures, the names
(Tobi Adeyemi, Zowasel Eats, CampusKonekt), and the amounts. They are real-sounding by design.

Do not substitute lorem ipsum, do not genericise "Zowasel Eats" to "Project Name", and do not round
₦1,248,450,000 to "₦1.2B+" — the precision is the point. It reads as a live system.

The one change: the footer copyright year.

---

## 8. The animation handoff contract

Animations are added in a **second pass** by a different author. That pass must not require
restructuring the markup, so this pass leaves the hooks:

1. **Stable, semantic structure.** Each section is one root element with a stable `id`
   (`id="how-it-works"`, `id="stats"`, `id="trust"`). The animation pass targets these; renaming
   them later breaks it.
2. **No wrapper divs added purely for layout hacks.** Extra nesting is exactly what makes
   `<ViewTransition>` fail — it must be the outermost element in a component to animate enter/exit
   (`conventions.md` §9.3).
3. **The reduced-motion backstop ships in this pass**, in `globals.css`, even though there is nothing
   to reduce yet. It must be in place before the first animation lands, not after.
4. **No animation libraries installed.** No Framer Motion, no GSAP, no AOS.
5. **No `opacity: 0` initial states in committed CSS.** If the animation pass never runs, or JS
   fails, the page must be fully visible. Entrances start from visible and are added as progressive
   enhancement.
6. **`data-*` markers on elements intended to animate** — `data-reveal` on the hero headline clauses
   and CTA row, `data-step` on each how-it-works stage, `data-count` on each stat figure,
   `data-live` on the status dot. They do nothing yet; they are the attachment points.
7. **Layout is final before motion.** Anything that will animate has its space already reserved, so
   adding motion cannot introduce CLS. This is why the stat widths are reserved at Stage 5, not later.

---

## 9. Prompt for the design-to-code pass

Paste this with the mockup image.

> Build the Inverge marketing landing page from the attached desktop mockup.
>
> **Read `docs/conventions.md` and `docs/landing-brief.md` in this repository first, and follow them
> exactly.** They are not background reading — they are the spec.
>
> This is **Next.js 16.2 with React 19 and Tailwind v4**, which differs from most training data:
> `params`/`searchParams`/`cookies()`/`headers()` are async; there is **no `tailwind.config.js`**
> (theme lives in `@theme` inside `globals.css`); `middleware.ts` is now `proxy.ts`; `next lint` no
> longer exists. Do not write Next 14 or Tailwind v3 patterns.
>
> **Work through the build order in `landing-brief.md` §2 one stage at a time.** Stop after each
> stage, run `pnpm typecheck && pnpm lint`, and show me the result before starting the next. Do not
> generate the whole page in one pass.
>
> Do not modify any file outside the allowlist in §1.1.
>
> Not negotiable:
> - Stage 0 first: the full `@theme` token set (§4) before any section is built. Every colour comes
>   from a token. No raw hex in JSX.
> - Server Components by default. `'use client'` only where interactivity genuinely requires it,
>   pushed to the smallest possible leaf. On this page that should be exactly two places: the nav's
>   "Resources" disclosure and the footer newsletter form.
> - **Icons: follow §3.3, not the mockup.** The shield-and-checkmark on step 03 is banned — replace
>   it as specified. No shield, padlock, checkmark-in-circle, handshake, or rocket anywhere. Inline
>   SVG only; do not install an icon library.
> - Responsive from 320px up, mobile-first, in this same pass. No horizontal scroll at 320px.
> - WCAG 2.2 AA: 4.5:1 text contrast, 3:1 for UI boundaries, visible `focus-visible` rings, ≥24px
>   targets, semantic HTML, one `<h1>`. Small green text needs `--color-accent-700` or darker — see §4.
> - Every money figure through `Amount`, every count through `Count`.
> - Ship the `prefers-reduced-motion` backstop in `globals.css`.
> - **No animations, no transitions, no animation libraries.** Separate pass. Follow the handoff
>   contract in §8 — stable section `id`s, `data-*` markers, nothing starting at `opacity: 0`.
> - No wallet, crypto, gas, chain, or signature language anywhere.
> - All copy ships exactly as written in the mockup (§7). No lorem ipsum, no genericised names.
>
> When done, `pnpm typecheck`, `pnpm lint`, and `pnpm build` must all pass.

---

## 10. Review gate

Before the animation pass starts, the static page must clear the Definition of Done in
`conventions.md` §13, plus:

- [ ] Page renders correctly with JavaScript disabled.
- [ ] `globals.css` holds a coherent token set; no orphan hex values anywhere in `src/`.
- [ ] No banned icon (shield, padlock, checkmark-in-circle, handshake, rocket) anywhere.
- [ ] Green-on-cream and green-on-forest contrast measured, not eyeballed — especially the delta
      pills and the 01/02/03 numerals.
- [ ] How-it-works connector is legible and correct at 320px, 768px, and 1440px.
- [ ] Stat figures are `tabular-nums` with widths reserved for larger values.
- [ ] Section `id`s and `data-*` markers in place per §8.
- [ ] Zero dependencies added beyond `clsx`, `tailwind-merge`, and the display font.
- [ ] The `'use client'` count on this route is justifiable, component by component.
