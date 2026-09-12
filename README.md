# Inverge

A fresh Next.js and Tailwind CSS implementation of Inverge: milestone-escrowed
crowdfunding and idea validation for African builders.

## Prerequisites

- Node.js 24.21.0 (see `.nvmrc`)
- pnpm 12.3.4 (pinned by `package.json#packageManager`)

## Local development

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`.

No application-specific environment variables are required by the scaffold. Add
future variable names and safe example values to `.env.example`; keep real values
in an ignored `.env.local` file.

## Quality checks

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run the full sequence with `pnpm check`. Use `pnpm format`, `pnpm lint:fix`, and
`pnpm test:watch` while iterating.

## Source structure

```text
src/
  app/
    (marketing)/       # Public marketing routes and route metadata
  features/marketing/  # Shared marketing UI and editorial content
  lib/env/              # Environment schema and server-only validated access
public/images/          # Reviewed static marketing imagery
```

The public route set is `/`, `/about`, `/blog`, `/blog/[slug]`, `/guides`,
`/guides/[slug]`, `/help`, `/careers`, `/contact`, `/privacy`, and `/terms`.
Product, authentication, provider, API, and E2E directories are added only when
their implementation begins, following `docs/ARCHITECTURE.md`.

## Documentation

- [`AGENTS.md`](./AGENTS.md): required starting point for coding agents.
- [`CLAUDE.md`](./CLAUDE.md): loads the same instructions in Claude Code.
- [`docs/Inverge_PRD_SRS_v1.2.md`](./docs/Inverge_PRD_SRS_v1.2.md): authoritative
  PRD and SRS.
- [`docs/PROJECT_BRIEF.md`](./docs/PROJECT_BRIEF.md): implementation scope and
  product invariants.
- [`docs/BRAND_SYSTEM.md`](./docs/BRAND_SYSTEM.md): product UI and content system.
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md): intended structure and module
  boundaries.
- [`docs/ENGINEERING_STANDARDS.md`](./docs/ENGINEERING_STANDARDS.md): coding,
  styling, testing, security, and delivery standards.
- [`docs/DECISIONS.md`](./docs/DECISIONS.md): durable technical decisions.

## Status

The clean application foundation and public marketing website are implemented.
Product screens, backend endpoints, authentication, wallet, database, and
provider integrations have not been implemented. Privacy and terms pages are
pre-launch drafts and require Nigerian legal review before they become binding.
