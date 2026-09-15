# Inverge product UI and brand system

Status: **Working baseline; owner may revise**  
Last reviewed: 2026-09-15

This working brand direction is not an immutable specification. Product
correctness, accessibility, and the PRD/SRS override any conflicting sample.
Keep tokens centralized so visual changes are deliberate and inexpensive.

## Product character

The interface should feel trustworthy, precise, warm, modern, and human. It should
communicate accountability without looking like a traditional blue bank or a
neon crypto product.

Four working principles guide product UI:

- trustworthy escrow — status and consequences are explicit;
- evidence-led validation — metrics are legible and never manufactured;
- Web3 infrastructure with familiar interactions — complexity is progressively
  disclosed; and
- warm high contrast — the product feels ambitious without sacrificing clarity.

## Voice and terminology

- Write in concise, direct sentences. Explain what happens, when it happens, and
  what the user can do next.
- Buttons name their outcome: `Publish idea`, `Submit for review`, `Back campaign`,
  or `Claim refund`, not `Submit` or `Continue` when a precise verb exists.
- Use `pre-pledge` only for the non-binding idea-validation intent where no funds
  move. Use `contribution`, `back`, or `fund` for campaign money.
- Describe the campaign record as verifiable or on-chain when detail is useful.
  In the default flow, call a transaction link a `receipt` and put hashes, wallet
  addresses, and network detail behind progressive disclosure.
- Avoid `invest`, `returns`, `yield`, `profit`, `APY`, token speculation, meme
  language, and guarantees broader than the actual refund rules.
- Explain the non-refundable working-capital tranche before contribution confirmation.
- Label paid placement visibly with `Promoted` or equally clear language. Never
  imply that promotion improves validation quality or campaign approval odds.

The SRS defines campaign funding in USDC and cNGN where available. Do not copy
SOL-denominated payment examples from exploratory brand material into product
behavior.

## Working visual tokens

The current direction uses emerald over a warm-paper canvas with a deep forest
contrast surface. Exact values remain editable, but token roles are stable:

| Semantic role | Current reference | Intended use |
| --- | --- | --- |
| Brand accent | Emerald `#1FA85C` | Primary actions, progress, selected states. |
| Canvas | Warm paper `#FBF9F5` | Main application background. |
| Surface | White `#FFFFFF` | Cards, menus, dialogs, inputs. |
| Primary ink | Near-black `#1F1F1E` | Headings and body text. |
| Muted ink | Warm gray `#71716E` | Secondary text that still meets contrast. |
| Border | Warm gray `#EAE6E1` | Dividers and low-emphasis boundaries. |
| Contrast surface | Forest `#0D1D15` | Rare high-contrast regions. |
| Danger/refund | Terracotta `#D94A38` | Failed, destructive, and refund states. |
| Warning/review | Amber `#D97706` | Pending review and time-sensitive caution. |
| Chain accent | Solana purple `#9945FF` | Sparse chain-specific detail only. |

- Define these roles through Tailwind `@theme` variables and semantic CSS custom
  properties. Components consume roles, never repeated raw hex values.
- Success and the brand accent may currently share a hue, but keep their semantic
  token names separate so the design can evolve safely.
- Color never carries status alone. Pair it with explicit text and, where useful,
  a shape or icon.
- Verify contrast with tools. A token's name or old brand-book ratio is not proof
  that a particular foreground/background/font-size combination passes.

## Typography and numeric data

- Use Geist Sans as the working UI and heading face and Geist Mono for transaction
  identifiers, timers, percentages, and financial values.
- Load fonts once through `next/font`; expose font variables through the token
  layer.
- Use tabular numerals for changing or aligned numeric data.
- Constrain long-form campaign stories and updates to roughly `65ch`–`75ch`.
- Product hierarchy should come from type, spacing, and weight—not excessive
  uppercase text or decorative icons.

## Layout and components

- Use a 4px base spacing rhythm while choosing the smallest token set that covers
  real layouts.
- Design mobile-first for mid-range Android devices and unreliable connections.
  Validate at 320px and at representative tablet, laptop, and wide widths.
- Interactive targets should be at least 44 by 44 CSS pixels unless an equivalent
  accessible target-spacing treatment is justified.
- UI primitives expose semantic variants such as `primary`, `secondary`,
  `destructive`, and domain statuses—not raw color props.
- Financial values, progress, deadlines, escrow availability, and lifecycle state
  must remain legible without relying on hover.
- Do not hide consequential disclosures in tooltips. Tooltips supplement labels;
  they do not replace them.
- Tables must have a useful narrow-screen treatment chosen for the data: horizontal
  containment, priority columns, or a semantic card/list representation.

## Required product states

Every asynchronous or data-driven component deliberately covers:

- initial/loading and background-refresh states;
- empty and first-use states;
- validation and expected-action errors;
- unavailable partner/network state;
- pending wallet signature, submitted, confirmed, failed, and retryable states
  where transactions are involved;
- permission/KYC blocked state with a clear resolution path; and
- stale or reconciling indexer data without presenting it as current truth.

Never use a success color or success message until the responsible server or chain
state confirms success.

## Imagery, icons, and motion

- Prefer authentic contemporary African builders working in real studios,
  workshops, labs, and collaborative spaces. Avoid generic handshakes, token
  coins, rockets, cyberpunk scenes, and stereotypes.
- Use one coherent, accessible icon set for interface actions. The Inverge mark
  is a brand identifier, not a generic action icon.
- Motion is fast, subtle, and optional. Use it for feedback and spatial continuity,
  never to delay content or communicate a required fact by itself.
- Animate compositor-friendly properties and respect `prefers-reduced-motion`.
  Auto-playing or infinite motion must be avoidable and must never distract from
  financial or time-sensitive decisions.

## Evolution rule

When visual direction changes, update the centralized tokens and primitives first,
then evaluate feature compositions. Do not scatter one-off overrides to imitate a
new mockup. Record changes that alter component APIs, accessibility behavior, or
the product's status vocabulary in `DECISIONS.md`.
