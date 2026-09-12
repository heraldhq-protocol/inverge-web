<!-- BEGIN:nextjs-agent-rules -->

# Next.js: always read version-matched docs before coding

After Next.js is installed, read the relevant documentation in
`node_modules/next/dist/docs/` before any Next.js work. Those docs match the
installed version and are the source of truth when remembered APIs or external
examples disagree.

<!-- END:nextjs-agent-rules -->

# Repository agent guide

This file is the entry point for every coding agent working in this repository.
Its rules apply to the whole repository unless a more specific `AGENTS.md` is
added in a subdirectory.

## Current state

Inverge is a milestone-escrowed crowdfunding and idea-validation platform for
African builders. The approved product requirements are in
`docs/Inverge_PRD_SRS_v1.2.md`. The application in this repository is a fresh
implementation: older Inverge code is reference material, not a source of truth
and not a dependency.

## Read before changing code

Read these files in order:

1. `docs/Inverge_PRD_SRS_v1.2.md` — authoritative product and system requirements.
2. `docs/PROJECT_BRIEF.md` — implementation scope, invariants, and open choices.
3. `docs/BRAND_SYSTEM.md` — product UI, content, and token conventions.
4. `docs/ARCHITECTURE.md` — module boundaries and intended project structure.
5. `docs/ENGINEERING_STANDARDS.md` — implementation and verification rules.
6. `docs/DECISIONS.md` — decisions that must not be silently reversed.

If the documents disagree, the PRD/SRS wins for product behavior. Then follow
this file, the project brief, accepted decisions, architecture, brand system,
and engineering standards in that order. Call out a conflict rather than
silently choosing when it affects money, authorization, custody, compliance,
privacy, an on-chain transition, or a public interface.

## Working agreement

- Inspect the repository and nearby code before editing. Match established
  patterns unless they conflict with these documents.
- Make the smallest coherent change that fully solves the request. Do not mix
  unrelated cleanup into feature work.
- Do not overwrite or remove changes you did not create. Treat a dirty worktree
  as user-owned work.
- Prefer readable functions and composition. Use a class only when object
  identity, controlled lifecycle, or a stateful domain invariant genuinely makes
  it clearer.
- Reuse behavior intentionally, but do not create abstractions for hypothetical
  reuse. Two similar pieces of UI may remain separate when their reasons to
  change differ.
- Keep route files thin. Put domain behavior in the owning feature and generic
  behavior in shared modules.
- Link implementation and tests to the relevant `FR-*` or `NFR-*` identifier
  when a requirement is security-, money-, compliance-, or lifecycle-critical.
- Model campaign, milestone, payment, KYC, and transaction lifecycles explicitly.
  Never infer a confirmed state from a button click or optimistic UI alone.
- Represent money with explicit currency and integer atomic units or a safe
  decimal representation. Never use binary floating-point arithmetic for money.
- Treat on-chain escrow state as authoritative. Off-chain records are indexed
  projections and must be reconcilable rather than silently overwriting chain
  truth.
- Add dependencies only when the platform and current dependencies cannot solve
  the problem cleanly. Explain any material dependency choice in
  `docs/DECISIONS.md`.
- Never place secrets, credentials, real customer data, or private keys in source,
  fixtures, screenshots, logs, or committed environment files.
- Preserve accessibility, responsive behavior, and sensible loading, empty, and
  error states in every user-facing change.
- Keep default backer flows free of chain jargon. Expose transaction and network
  detail progressively where it builds trust or supports verification.
- Update relevant documentation in the same change when behavior, setup,
  architecture, or an important decision changes.

## Technology baseline

When the app is scaffolded, use the latest stable, mutually compatible releases
of Next.js, React, TypeScript, and Tailwind CSS. Do not use canary, beta, or
experimental APIs without a recorded reason. The research snapshot in
`docs/ENGINEERING_STANDARDS.md` is context, not a dependency lock; `package.json`
and the committed lockfile become authoritative after setup.

Unless the product brief says otherwise:

- Use the Next.js App Router under `src/app`.
- Use TypeScript in strict mode; do not add JavaScript application files.
- Use React Server Components by default and add Client Components only at the
  smallest interactive boundary.
- Use Tailwind CSS's current CSS-first setup and design tokens.
- Use the package manager indicated by the existing lockfile. If none exists at
  scaffold time, default to `pnpm` and commit `pnpm-lock.yaml`.
- Use ESLint's flat configuration with the Next.js Core Web Vitals and TypeScript
  rules. Formatting must be automated and consistent.

## Before handing work back

Run the narrowest useful checks while iterating, then all available quality gates
affected by the change. A normal completed code change should pass:

```text
format/check -> lint -> typecheck -> relevant tests -> production build
```

Use the scripts defined in `package.json`; do not assume script names. If a check
cannot run, state exactly which check and why. Never claim a check passed unless
you ran it successfully.

End each task with a short account of what changed, what was verified, and any
remaining decision or risk.
