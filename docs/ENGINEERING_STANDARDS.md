# Engineering standards

These rules turn the architecture and Inverge requirements into day-to-day
implementation choices. General framework guidance lives beside the product's
money, custody, compliance, and lifecycle safeguards.

## Version and setup policy

The scaffold verification on 2026-09-12 selected Next.js 16.3.5, React 19.3.0,
and Tailwind CSS 4.3.3 as the latest stable, mutually compatible application
baseline. It uses Node.js 24.21.0 LTS and pnpm 12.3.4. TypeScript 6.0.3 and ESLint
9.39.5 are the newest lines accepted across the complete lint and test toolchain;
their next majors remain deferred until those peer ranges catch up. At scaffold
or upgrade time, verify the latest security-patched versions again and confirm
their peer compatibility before installing them.

- Pin dependency ranges in `package.json` according to the chosen update policy
  and always commit exactly one package-manager lockfile.
- Use an active Node.js LTS release that satisfies the installed Next.js version.
  Record it in `package.json#engines` and a version file once selected.
- Prefer stable framework features. Experimental flags require a use case, an exit
  plan, and an entry in `docs/DECISIONS.md`.
- Treat framework security releases as high priority. Do not leave a known-vulnerable
  React Server Components or Next.js version installed.

## TypeScript

- Enable `strict`. Also consider `noUncheckedIndexedAccess` from the start; enable
  stricter optional-property semantics when dependencies and generated types are
  compatible.
- Do not use `any`. Use `unknown`, narrow it, and validate data at runtime when it
  crosses a trust boundary.
- Do not hide errors with `@ts-ignore`, broad assertions, or non-null assertions.
  A rare exception must explain why it is safe and link to a removal condition.
- Model valid states so invalid combinations are difficult to represent. Prefer
  discriminated unions over clusters of related booleans.
- Infer types from schemas, functions, and database definitions where possible.
  Do not maintain duplicate shapes by hand.
- Keep types close to their owners. Move a type to shared code only when multiple
  modules genuinely share the same contract.

## React and Next.js

- Components and Hooks must be pure. Never mutate props or state, perform side
  effects during render, call components as plain functions, or call Hooks
  conditionally.
- Default to Server Components. Add `'use client'` only when the subtree needs
  state, event handlers, effects, custom client Hooks, context, or browser APIs.
  Keep that boundary low because its imports join the client bundle.
- Props crossing a server/client boundary must be minimal and serializable.
- Mark modules containing secrets, privileged data access, or server-only business
  logic with `import 'server-only'`.
- Fetch on the server and near the component that consumes the data. Start
  independent requests together; avoid accidental sequential waterfalls.
- Do not assume `fetch` is cached. Choose fresh, cached, revalidated, or streamed
  behavior deliberately. Document non-obvious cache lifetimes and invalidation.
- Use `Suspense` or `loading.tsx` for meaningful streaming states. Add `error.tsx`
  for unexpected failures, return expected errors as values, and use `notFound()`
  for missing resources.
- Treat Server Actions and Route Handlers as public server entry points. Validate
  input, authenticate, authorize the specific resource/action, and return safe
  errors every time. Never rely on a hidden button or Client Component check for
  authorization.
- Use Server Actions for mutations originating in this app. Use Route Handlers
  when an actual HTTP endpoint is required by an external caller, webhook, or
  protocol.
- In current App Router code, treat `params`, `searchParams`, `cookies()`, and
  `headers()` according to the installed version's async APIs. Do not copy old
  synchronous examples.
- Use `proxy.ts` for request-boundary concerns only; it is not a data-access or
  general business-logic layer.
- Prefer derived values during render over synchronized duplicate state. Use an
  effect only to synchronize with an external system.
- Do not add `useMemo`, `useCallback`, or `memo` by habit. Measure a problem first,
  and account for React Compiler support in the installed Next.js version.
- Use `next/link`, `next/image`, the Metadata API, and `next/font` where applicable.
  Give images dimensions and meaningful alt text, or empty alt text when decorative.

## Components and reuse

- A component should have one clear reason to change, but avoid splitting markup
  into tiny wrappers that make behavior harder to follow.
- Prefer composition and explicit variants to large components controlled by many
  booleans.
- Keep domain vocabulary in feature components and keep primitives domain-neutral.
- Separate pure calculations from rendering when that makes them independently
  testable. Keep one-off, obvious transformations inline.
- Custom Hooks share stateful behavior, not arbitrary helper functions. A Hook must
  obey the Rules of Hooks and should expose the smallest useful API.
- Prefer plain functions and modules. Use classes only when stateful identity,
  lifecycle, polymorphism, or an invariant is better expressed by an instance.
- Introduce a variant/class composition dependency only after repeated component
  variants make manual composition error-prone.

## Tailwind CSS and visual consistency

- Use Tailwind's CSS-first setup: `@import "tailwindcss"` and the official
  PostCSS integration for Next.js. Do not create legacy `tailwind.config.js` or
  `@tailwind` directives unless a supported integration requires them.
- Define shared design tokens with Tailwind `@theme` variables. Use semantic CSS
  variables for values that change by theme or context. Avoid scattering repeated
  raw brand colors and arbitrary pixel values through JSX.
- Use utilities as the normal styling API. Add small global base rules where they
  truly apply globally; use custom CSS for behavior utilities cannot express
  clearly.
- Never assemble partial Tailwind class names dynamically. Map props or state to
  complete, statically detectable class strings.
- Prefer logical properties when directionality may matter and container queries
  when a reusable component should respond to its container rather than viewport.
- Build mobile-first. Check narrow, intermediate, and wide layouts, plus zoom and
  long-content behavior.
- Keep focus indicators visible. Respect `prefers-reduced-motion`, and do not make
  color the only carrier of meaning.
- Do not combine Sass/Less/Stylus with Tailwind 4. Avoid mixing CSS Modules with
  Tailwind unless a concrete legacy or isolation need justifies it.

## Accessibility and UX states

- Use semantic HTML first; add ARIA only when native semantics are insufficient.
- Every interactive element must work by keyboard and have an accessible name.
- Associate form controls, labels, help text, and errors. Move focus or announce
  changes when an interaction otherwise leaves assistive-technology users lost.
- Each page needs one useful primary heading and unique, descriptive metadata.
- Meet WCAG 2.2 AA across core flows, including contrast, reflow, focus, names,
  roles, status announcements, and target sizing.
- Every data-driven surface must deliberately handle loading, empty, error, and
  success states without layout-breaking content shifts.

## Security and data handling

- Parse and validate all user input, URL values, webhook payloads, third-party
  responses, and environment variables at their boundary.
- Authentication answers who the caller is; authorization separately determines
  whether that caller can act on the specific resource. Enforce both server-side.
- Expose a variable to browser code only when it is intentionally public. Treat
  every `NEXT_PUBLIC_` value as visible to anyone and remember it is inlined at
  build time.
- Return minimal data transfer objects to the UI. Do not pass database records or
  secret-bearing configuration wholesale to Client Components.
- Use parameterized database APIs and framework-safe output escaping. Sanitize
  intentionally rendered HTML and restrict external image/source hosts.
- Do not log tokens, passwords, personal data, payment data, or full sensitive
  payloads. User-visible errors must not expose internals.

## Inverge domain correctness

- Read the relevant `FR-*` and `NFR-*` entries before implementing a product flow.
  Preserve those IDs in acceptance tests and in code comments only where they
  explain a non-obvious invariant.
- Use a typed client generated from the backend's OpenAPI contract when that
  contract is available. Generated files are never hand-edited. Wrap generated
  transport shapes at the feature boundary rather than leaking them throughout UI.
- Validate all external response data at runtime when correctness affects money,
  authorization, custody, KYC, deadlines, or public settlement totals. Static
  generated types alone do not validate network input.
- Never perform financial arithmetic with JavaScript floating-point numbers.
  Parse lossless wire values into an amount type with explicit currency and
  precision, and format through one shared money component/function.
- Transaction status is a lifecycle, not a boolean. Distinguish awaiting user
  approval, signed, submitted, processed/confirmed, finalized, failed, expired,
  and replaced when the selected Solana integration exposes those states.
- A wallet signature or RPC submission is not proof of success. Show final success
  only after the required confirmation/finality policy, then reconcile the indexed
  view.
- Never compute refund eligibility, tranche availability, voting weight, or
  milestone approval solely in browser code. Client calculations may preview an
  outcome but the authoritative program/service must decide it.
- Keep paid placement ranking and organic validation signals in separate data
  fields and code paths. A promoted label is mandatory and cannot be dismissed.
- Store KYC provider references and statuses only. Raw identity documents must not
  enter application storage, fixtures, logs, analytics, or error reports.
- Backer-facing copy must not promise returns or present a contribution as equity,
  yield, or an investment. Compliance-sensitive copy changes require review.
- The backend and admin UI may coordinate escrow actions but must never imply or
  implement unilateral custody over escrowed funds.
- Chain-derived transparency figures include freshness/provenance metadata. When
  indexing is delayed or reconciliation fails, surface that state instead of
  presenting stale figures as current.

## Testing strategy

- Test behavior and public contracts, not implementation details.
- Unit-test pure domain logic, parsers, and non-trivial utilities.
- Use component/integration tests for interactive behavior, validation, and
  accessibility. Query elements as a user would, by role and accessible name.
- Use browser end-to-end tests for critical journeys, authentication boundaries,
  routing, and async Server Components. Official Next.js guidance prefers E2E
  coverage over unit-rendering async Server Components where tooling support is
  incomplete.
- Add a regression test for a bug when it is practical and valuable.
- Keep tests deterministic. Control time, randomness, network, and external
  services; do not depend on test order.
- Mock at external boundaries rather than mocking the implementation under test.
- Add contract tests for generated API compatibility and integration adapters.
- Exercise monetary logic with boundaries, precision, maximum values, wrong
  currencies, retries, duplicate webhooks/actions, and partial partner failures.
- The launch E2E suite must trace the SRS lifecycle gates: successful funding and
  tranche releases, target-miss refunds without backend help, milestone-failure
  pro-rata refunds, objection and appeal, KYC/application-fee gates, paid-placement
  metric separation, and chain-derived dashboard reconciliation.

## Performance and observability

- Optimize from evidence, but start with sound defaults: Server Components, small
  client bundles, parallel I/O, optimized images/fonts, and no unnecessary
  third-party scripts.
- Avoid passing large payloads into Client Components. Paginate or stream large
  collections and keep expensive work off the render path.
- Preserve cache correctness before increasing cache duration. Personalized or
  permission-sensitive data must not leak across users.
- Capture actionable server errors with request context and safe identifiers once
  observability is selected. Do not swallow exceptions or leave debugging logs in
  production paths.
- Measure the SRS mobile target on a representative mid-range Android profile over
  simulated 3G. Do not substitute a fast developer laptop result.
- Instrument contribution latency separately for Inverge-controlled work and
  third-party on-ramp latency so the P95 requirement can be evaluated honestly.

## Quality gates and definition of done

The scaffold should provide scripts for formatting, linting, type checking, unit
or integration tests, end-to-end tests when introduced, and production builds.
CI should run the non-interactive variants.

A change is done when:

- acceptance criteria are satisfied without unrelated scope;
- types, lint, relevant tests, and the production build pass;
- new UI works with keyboard navigation, WCAG 2.2 AA expectations, and responsive
  layouts;
- loading, empty, error, and success paths are handled where relevant;
- security and server/client boundaries were reviewed;
- documentation and environment examples are current;
- no secrets, debug output, dead code, or unexplained suppression remains.

## Official references

These were the primary sources for this baseline. Re-check them during major
upgrades because framework behavior changes.

- [Next.js App Router documentation](https://nextjs.org/docs/app)
- [Next.js guidance for AI coding agents](https://nextjs.org/docs/app/guides/ai-agents)
- [Next.js project structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Fetching data](https://nextjs.org/docs/app/getting-started/fetching-data)
- [Updating data](https://nextjs.org/docs/app/getting-started/mutating-data)
- [Next.js testing guide](https://nextjs.org/docs/app/guides/testing)
- [Next.js production checklist](https://nextjs.org/docs/app/guides/production-checklist)
- [Next.js accessibility guidance](https://nextjs.org/docs/architecture/accessibility)
- [React rules](https://react.dev/reference/rules)
- [React releases](https://react.dev/versions)
- [Tailwind CSS with Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs)
- [Tailwind theme variables](https://tailwindcss.com/docs/theme)
- [Tailwind class detection](https://tailwindcss.com/docs/detecting-classes-in-source-files)
- [Tailwind compatibility](https://tailwindcss.com/docs/compatibility)
- [TypeScript strict mode](https://www.typescriptlang.org/tsconfig/strict.html)
