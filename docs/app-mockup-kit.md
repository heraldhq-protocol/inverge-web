# Inverge App Screens — Mockup Prompt Kit

*Companion to the landing-page prompt kit, for every screen behind the marketing site. Everything
above the divider is the kit and stays identical between screens; everything below it is the current
screen brief, swapped one at a time. Desktop web only — a mobile variant needs its own pass.*

*Why this is a separate kit: the landing page and the app are different design problems, and reusing
marketing art direction on a product screen is the fastest way to get a beautiful, empty dashboard.
See §3 — it is the part of this document that actually matters.*

*For the ready-to-send version of all of this, see [`app-screen-prompts.md`](./app-screen-prompts.md)
— one copy-paste message per screen. This document is the reasoning; that one is the prompts.*

**Creative license:** everything here is a strong default, not a locked spec. Where a rule fights a
genuinely better design decision, make the better decision. The few things that can't move are marked
**[must]** — those are compliance-shaped, not taste-shaped.

---

## 1. What you're making

A single high-fidelity screenshot of one screen of a working web app — not concept art, not a
wireframe, not a slide, not a Dribbble poster. Something you'd believe was screenshotted from a
product that already has users, with their data in it.

The test: it should look like someone's Tuesday afternoon, not like a product launch.

## 2. The product, in one breath

Inverge is where early-stage builders in Nigeria and West Africa post an idea, get free community
validation (real support, structured feedback, non-binding pre-pledges), and — once validated —
raise money in milestones. Backers approve each milestone's delivery proof before the next chunk
releases; a missed target or a failed milestone refunds automatically.

**[must]** It runs on Solana under the hood, and backer-facing screens must never show that. No
wallet-connect button, no gas or network fees, no "mainnet/devnet," no seed phrase, no raw wallet
address or signature, no crypto price ticker — anywhere. A transaction reference is a **receipt**,
never a signature.

**Backers** are diaspora Africans in the UK, US, and Canada funding projects back home. **Creators**
are early-stage founders and indie hackers in Nigeria and West Africa. Both want a well-run fintech
product, not a crypto app and not a donation page.

---

## 3. This is the app, not the landing page — what changes

The landing kit is tuned to convert a stranger in eight seconds. These screens are tuned for someone
who has already decided, is logged in, and is trying to get something done. Six rules invert.

**1. Type gets smaller. Much smaller.** The landing hero runs 56–90px. Nothing on an app screen does.
Page title ~28–32px, section heading ~20px, card title ~16–18px, body and UI 14–16px, table and
metadata text 13–14px. **Oversized type is the number-one tell that a "product screenshot" is
actually a landing page with a table pasted into it.** Money figures stay tabular-numeral.

**2. Density is a feature, not a failure.** Marketing pages breathe; product screens work. A screen
that shows nine ideas is more credible than one that shows three with a lot of air. Keep the 8px
grid, but the section rhythm compresses from 96px to 24–32px. Dense should stay readable, not become
sparse.

**3. Chrome is persistent and identical across every screen.** A left sidebar or a top app bar —
pick one in the first screen you generate and never change it. Logged-in state visible: avatar,
name, account menu. Breadcrumbs or a back affordance on any detail screen. This is what makes eight
screens read as one product instead of eight products.

**4. Show the interesting state, not the happy path.** An idea at 34% of its validation threshold is
a better screenshot than one at 100%, because it proves the meter means something mid-flight. A
milestone under a 7-day review window beats one already approved. Real products are mostly in
progress. Where a screen brief names a state, honour it exactly.

**5. Cards or table is a real decision, and it is made per screen — not defaulted to cards.** Cards
are for browsing and discovery, where an image and a headline do the work. Tables are for comparing
and acting in bulk, and they scale: two adjacent values in a row are easy to compare because the eye
barely moves. Idea feed is cards. Admin queue is a table. Dashboard is a table of the creator's own
ideas plus a small number of stat blocks. Each brief says which; don't override it, because "make
everything cards" is exactly the default this kit exists to beat.

**6. The signature moment is the mechanic, not the decoration.** On the landing page the signature
moment was editorial. Here it is always the thing the screen is actually for — the validation meter,
the milestone tracker, the refund path. Draw that one element with real care and let everything
around it be quiet and ordinary. Clear numbers minus decorative icons is the goal; remove any
graphic that isn't carrying information.

---

## 4. Visual identity — now decided, not open

The landing pass settled every question the old prompt left blank. **Leaving a gap is how the model
fills it with the internet's average, so nothing here is open.** These are the real production
values, sampled from the shipped stylesheet.

### Colour — one hue, green

```
Accent 50    oklch(0.96 0.03 150)     palest tint — hover fills, subtle zones
Accent 100   oklch(0.91 0.06 150)     pale tint — pills, chips, selected rows
Accent 500   oklch(0.58 0.18 152)     the accent — primary buttons, active states
Accent 700   oklch(0.42 0.14 152)     small green text, numerals, links
Accent 900   oklch(0.26 0.08 152)     deep — rare, high-emphasis
Forest       oklch(0.18 0.045 155)    inverted bands, sidebar, footer
Paper        oklch(0.975 0.006 95)    warm cream page background
Surface      oklch(1 0 0)             white card surface
Ink          oklch(0.18 0.01 95)      primary text
Ink muted    oklch(0.48 0.01 95)      labels, metadata, secondary text
Border       oklch(0.91 0.01 95)      warm hairline borders
```

Hierarchy comes from tints and shades of that one green plus the warm neutrals. **Do not introduce a
second hue to signal a second thing** — use weight, size, and position instead. The one licensed
exception: a failed or refunded state may use a desaturated warm red, because "failed" carrying the
same green as "approved" is a comprehension failure, not a style choice. Keep it muted; this is not
an alert dashboard.

Shadows are warm-tinted, not neutral black — a pure black shadow over cream leaves a grey cast.

### Type

Geometric-humanist display sans for headings (character close to *Outfit* or *Plus Jakarta Sans*),
neutral humanist sans for body and UI (character close to *Geist*), monospace **only** for receipts,
IDs, and technical data (character close to *Geist Mono*). Tabular numerals on every money figure and
every column of numbers. Scale per §3.1 — small.

### Icons — no stock trust badges

**[must]** No shield, padlock, checkmark-in-a-circle, handshake, or rocket. This exact product
category reaches for them by reflex, which is why they read as slop on sight. Draw the actual
mechanic instead: a milestone stepper with real stage labels, a receipt card, a return arrow for a
refund, a number that is visibly moving. Line icons, one weight, small — 16–20px in UI, not 48px
feature glyphs.

### Imagery

Any person shown reads as a specific individual caught candidly, not stock-agency gloss or flat
illustration. Where West Africa shows up visually it is a specific-feeling place — a real Lagos or
Accra street reference — never a generic "Africa" motif like an acacia silhouette or a print pattern
used as decoration. Idea cover images look like something a founder actually uploaded: a product
screenshot, a photo of the thing, a plain typographic cover. Not agency stock.

### Texture

Restrained. Translucency only where it does a real job. **No glassmorphism panels, no gradient
meshes, no glow.** Borders are 1px hairlines in the warm border colour; elevation is a soft warm
shadow, used sparingly and never on every card at once.

---

## 5. The app shell — identical on every logged-in screen

Decide once, reuse everywhere:

- **Left sidebar, ~240px, forest ground**, with the leaf mark + "inverge" at top. Nav items: Discover,
  My ideas, Campaigns, Receipts, Settings. Active item marked with a pale accent fill and a solid
  accent left edge — not colour alone.
- **Top bar, 64px**, on paper: page title or breadcrumb on the left; on the right a search field, a
  notification bell, and a 32px avatar with the user's real name beside it.
- **Content area on paper**, max ~1200px, 32px gutters, white cards for grouped content.
- Backer-facing and creator-facing screens use the **same** shell. The nav items differ by role, the
  chrome does not.

---

## 6. Content rules

**[must] Write every visible string out in quotes, exactly as it should render.** Image models follow
quoted copy closely; leaving a gap is how you get garbled filler. Every label, every button, every
column header, every empty-state line.

Real-sounding project names, believable Naira and USD amounts, real-looking Nigerian and West African
names. Never "Lorem ipsum," never "Company Name," never "John Doe."

**Plain language over product jargon**, always — this audience is on mixed devices and mixed
bandwidth, and clarity beats precision-sounding vocabulary. "No money moves yet" beats "non-binding
pre-pledge commitment." "You'll get your money back" beats "automatic refund settlement." Every
button says exactly what happens: "Fund this idea," not "Submit."

Empty and error states read as calm, plain-language direction with the action attached — not an
apology, not a stack trace, not an emoji.

### Forms

Where a screen has a form:

- Labels sit **above** their fields, always visible. A placeholder is never a label.
- Validation is **inline and after the field is left** — never while typing, never on focus.
  Premature validation reads as scolding.
- An error field gets a red-tinted background wash plus a message directly beneath it, so it stays
  findable in a long form. Not a red border alone.
- Long forms are grouped into labelled sections or steps, not one endless scroll.
- The primary action is a filled accent button; the secondary is outlined. Both say what they do.

---

## 7. Format

- **Short** — one screen, above the fold. Landscape 16:9, a 1440px desktop viewport, everything
  visible without scrolling. **This is the default for app screens** — a product screen is one
  viewport of work.
- **Long** — a tall composite, only when a screen genuinely has stacked sections that must be seen
  together (idea detail, campaign detail).

Each brief names its format.

---

## 8. Style reference image (if attached)

Borrow only [be specific each time — e.g. "table row density and card border treatment"]. Reinterpret
it for Inverge's product and audience; don't carry over its layout, industry, palette, or copy.

---
---

## Screen briefs

*Paste exactly one below the divider, per generation. One fresh thread per screen.*

### A. Discovery feed — `/ideas`

**Format:** Short. **Layout:** Cards, 3-up grid.

**Job:** a backer browses and filters published ideas.

Filter bar above the grid: "All categories ⌄", "Sort: Most validated ⌄", and a result count reading
"127 ideas". Nine idea cards in a 3-column grid, 24px gutter.

Each card: cover image (3:2), title, one-line problem summary, then a compact **validation meter**
showing partial progress — this is the signature element, and it must be legible mid-flight, not just
at 100%. Below it: supporter count and pre-pledge total in tabular numerals.

Use these for the first three cards, verbatim:

- "CampusKonekt" · "Students in Ibadan wait 40 minutes for lunch between lectures." · 68% to
  threshold · "412 supporters" · "₦2,840,000 pre-pledged"
- "Zowasel Eats" · "Smallholder farmers lose a third of their harvest before it reaches a buyer." ·
  34% to threshold · "189 supporters" · "₦1,120,000 pre-pledged"
- "Kaduna Solar Co-op" · "Six hours of grid power a day makes a cold chain impossible." · 91% to
  threshold · "1,203 supporters" · "₦6,410,000 pre-pledged"

**[must]** Exactly one card carries a "Promoted" label — visible, plain, and positioned so it can
never be confused with or overlap the validation numbers. It must be visually distinct from organic
cards.

Persistent "Start an idea" button in the top bar.

---

### B. Idea detail — `/ideas/[id]`

**Format:** Long. **Layout:** Two columns — content left, sticky action panel right.

**Job:** read one idea and act on it.

Header: title "CampusKonekt", creator "Tobi Adeyemi" with a 40px avatar, "Published 12 March", cover
image.

Left column, four clearly separated sections with headings "The problem", "The solution", "Roadmap",
"What we're asking for" — each with two or three sentences of real, specific copy about a campus food
ordering platform in Ibadan.

Right column, sticky panel — **the signature element**. A validation meter at 68% with the label
"68% to validation threshold", then a small stat stack: "412 supporters", "₦2,840,000 pre-pledged",
"Feedback score 4.2". Then the action cluster: "Support this idea" (filled accent), "Leave feedback"
(outlined), and "Pre-pledge ₦25,000" with the line "No money moves yet — this tells the creator
you're in." directly beneath it, so it cannot read as a payment.

Below the fold: structured feedback — four entries, each with a name, avatar, a small rating, and two
sentences of specific, useful criticism. Not a bare comment thread, not praise.

---

### C. Publish an idea — `/ideas/new`

**Format:** Short. **Layout:** Form left (~60%), live preview right (~40%).

**Job:** a creator publishes a new idea.

Form grouped into labelled sections, fields with labels above: "Idea title", "The problem you're
solving", "Your solution", "Roadmap", "How much you're asking for". The ask field is prefixed "₦" and
shows "500,000".

**Show one field mid-error** to prove the pattern: "The problem you're solving" has a red-tinted
background wash and the message "Tell us who has this problem and how often — one sentence is enough."
beneath it. No other field is in an error state.

Right side: a live preview of the resulting idea card under the heading "This is what backers will
see", rendered as the real card component from screen A.

Actions: "Publish idea" (filled accent), "Save draft" (outlined).

**[must]** No verification, KYC, or wallet mention anywhere on this screen — publishing an idea is
free and ungated. Verification only gates campaign submission, later.

---

### D. Creator dashboard — `/dashboard`

**Format:** Short. **Layout:** Three stat blocks across the top, then a table.

**Job:** a logged-in creator's home base.

Top: a verification status strip reading "Verification: In review — we'll email you within 2 working
days. You can keep building meanwhile." Informational and calm, not alarming, not red.

Three stat blocks, tabular numerals: "Ideas published 3", "Total pre-pledged ₦4,120,000", "Supporters
1,804".

Then a **table** of the creator's own ideas — columns "Idea", "Status", "Supporters", "Pre-pledged",
"Updated". Five rows with statuses spread across "Draft", "Validating", "Threshold met", "Campaign
live". Status is a text label with a shape or tint, never colour alone. A row action menu at the
right of each row.

A boost section below: two flat-fee tiers, "Basic — ₦15,000" and "Featured — ₦45,000", priced
plainly, with the line "Boosts affect where your idea appears. They never change your validation
numbers." Do not make this look like an upsell modal.

---

### E. Campaign and milestone detail

**Format:** Long. **Layout:** Header, then a full-width milestone tracker, then supporting detail.

**Job:** a backer watches a funded campaign deliver. **This is the most differentiating screen in the
product — spend the design effort here.**

Header: "CampusKonekt", creator "Tobi Adeyemi", "₦3,600,000 raised of ₦5,000,000", "18 days left",
tabular numerals throughout.

**The milestone tracker is the signature element.** Four milestones in an ordered horizontal
sequence, each with a title, its tranche percentage, and a status — and the four states must all be
visible at once so the mechanic is legible:

1. "Working prototype" · "25%" · **approved and released** · "View receipt"
2. "First 100 orders delivered" · "25%" · **approved and released** · "View receipt"
3. "Vendor payouts automated" · "30%" · **under review — 4 days left to object**
4. "1,000 monthly active students" · "20%" · **upcoming**

Milestone 3 is the focal point: a calm countdown and the line "Backers have 4 days to review the
proof Tobi submitted. If enough object, this milestone refunds automatically." Plain language, a
delivery-tracker feeling — not a governance vote, not a countdown clock in red.

**[must]** "View receipt" is a plain link. No transaction signature, no address, no explorer
branding, no hash rendered as a hash.

Below: the submitted proof for milestone 3 — two photos and a short written update.

---

### F. Refund state

**Format:** Short. **Layout:** Same campaign shell as E, in its failed state.

**Job:** prove the guarantee is real. This screen is the entire product promise, so it must feel
matter-of-fact rather than apologetic or alarming.

A campaign where milestone 3 failed. Heading "Milestone not delivered — your money is being returned."
Body: "Backers reviewed the proof for 'Vendor payouts automated' and it didn't pass. The remaining
₦1,400,000 is going back to everyone who funded it. Nothing for you to do." Then a per-backer line:
"Your refund: ₦45,000 — returned 4 March" with "View receipt".

The milestone tracker above shows two released, one failed, one cancelled. The failed state is the
one licensed use of the muted warm red. Calm, factual, zero apology, zero emoji.

---

### G. Admin curation queue — `/review`

**Format:** Short. **Layout:** Dense table. Internal tool — more utilitarian than backer-facing
screens, and that is correct.

**Job:** a reviewer clears pending campaign submissions.

A table, seven rows, columns: "Campaign", "Creator", "Verification", "Fee", "Submitted", "Threshold",
"Actions". Denser rows than the product screens — this user is comparing records, not browsing.
Checkboxes in the first column with a "Select all" in the header, and a batch action bar reading
"3 selected" with "Approve" and "Request changes".

Per-row actions: "Approve", "Request changes", "Reject". Selecting "Request changes" opens a **side
panel, not a modal** — the reviewer needs to keep reading the row while writing. The panel holds a
"Reason" textarea with the label "What does the creator need to change?" and a "Send to creator"
button.

Real Nigerian creator names and real-sounding campaign titles in every row.

---

### H. Verification — `/verify`

**Format:** Short. **Layout:** Single centred column, ~640px, stepped.

**Job:** a creator completes verification before submitting a campaign.

Three steps shown as a stepper: "1. Who you are" (done), "2. Your business" (current), "3. Review"
(upcoming). Step 2 open: fields "Registered business name", "RC number", "Business address",
"Upload CAC certificate" as a file drop zone showing an already-attached file
"cac-campuskonekt.pdf · 2.1 MB" with a "Remove" link.

Above the form, one plain line: "Creators receive money, so we verify who you are first. This is
required before you can launch a campaign — never to publish an idea."

Actions: "Continue" (filled), "Back" (outlined).

**[must]** No wallet, no seed phrase, no chain language. This is ordinary business verification.

---

### I. Empty and zero-result states

**Format:** Short. Generate as a variant of screen A.

The feed with a filter applied that returns nothing. Filter bar shows "Category: Agriculture ⌄" and
"Sort: Most validated ⌄" with an active-filter indicator. The grid area holds a calm message: "No
agriculture ideas yet. Yours would be the first." with "Start an idea" (filled accent) and "Clear
filters" (outlined) beneath it.

No illustration, no mascot, no "Oops," no emoji, no sad face. Plain type, generous space, the action
attached.

---

### J. Auth — `/signin`, and the account-creation flow

**Format:** Short, all three. **Layout:** Two-panel split for J1/J2 (forest brand panel left ~45%,
auth column right ~55%, form in a centred ~400px column); single centred ~640px column for J3.

**[must] These are the only screens with no app shell.** No sidebar, no top bar, no search, no bell,
no avatar — the user isn't signed in yet. This is the one licensed deviation from §5, and the reason
the auth briefs run in their own thread rather than inheriting screen A: attaching screen A is
precisely what makes a model paint a sidebar onto a sign-in page.

Density also relaxes here, and that is correct. An auth screen is one decision, not a working
surface. The small type scale from §3.1 holds (heading 28px, body 14–15px), but the centred column
breathes. It is neither a dense product screen nor a landing page.

**Sign-in is Privy-only, and Privy has no separate sign-up.** Entering an email for the first time
*is* creating the account, so a "sign up screen" and a "sign in screen" cannot be two mechanisms —
only two framings of one. That is why J2 is drawn in its **email-code state** rather than at rest: an
at-rest sign-up screen is J1 with two words changed, and generating it teaches nothing. The three
login paths are exactly the ones the app is configured for — email code, Google, X
([`providers.tsx`](../src/components/providers/providers.tsx) `loginMethods`).

**[must] What must never appear on an auth screen.** Every item here is something this screen type
reaches for by reflex, which is why each needs naming rather than implying:

- **No password.** No password field, no "Confirm password", no strength meter, no "Forgot password".
  The product has no passwords, so an inch of password UI is a lie about how it works.
- **No wallet.** No "Connect wallet", no wallet list, no Phantom/MetaMask/Solflare marks, no QR code,
  no "I already have a wallet", no seed phrase, no chain or network name. The embedded wallet is
  created silently on login and the user never learns it exists (§2).
- **No auth-vendor branding** or "protected by" badge. The vendor underneath is invisible exactly as
  the chain is. *(This is a product decision with a billing consequence — see the engineering note.)*
- **No padlock, shield, key, fingerprint, or checkmark-in-a-circle**, at any size (§4, icons).
- **No illustration, 3D graphic, person-at-a-laptop stock photo, or mascot.**

**J1 — Sign in.** Left panel: leaf mark + wordmark, then "Back money that has to deliver." (~24px)
and "Every milestone is approved by backers before it pays out.", then a quiet tabular proof row —
"₦48,200,000 released across 61 milestones", "₦3,100,000 refunded automatically". Right column:
heading "Sign in to Inverge", sub-line "We'll email you a 6-digit code. There's no password to
remember.", one field labelled "Email address" showing "amara.okonkwo@gmail.com", filled
"Email me a code", an "or" divider, then outlined "Continue with Google" and "Continue with X",
then "New to Inverge? Create an account", then "By continuing you agree to our Terms and Privacy
Policy."

**J2 — Create your account, email-code step.** Left panel identical to J1. Right column: "Step 2 of
2", heading "Check your email", "We sent a 6-digit code to amara.okonkwo@gmail.com — Change email".
**The six-box code input is the signature element** — four boxes filled "4 8 2 9" in the monospace
face (a one-time code is technical data, so mono is licensed here), the fifth focused with a solid
green 2px border and a caret, the sixth at rest. Focus is marked by border weight as well as colour.
Then filled "Continue", a disabled muted "Resend code in 0:24", "The code expires in 10 minutes.",
and "Wrong email? Start over". Worth also generating the wrong-code variant — all six filled, the
§6 error pattern (tinted wash **plus** message) reading "That code doesn't match. Codes expire after
10 minutes — resend to get a new one." — because that is the state that generates support tickets.

**J3 — First-run interests.** Single centred column; only the small leaf mark and wordmark at top
left. Heading "What do you want to see first?", sub-line "Pick anything that interests you. This
only shapes your feed — you can still see every idea on Inverge." Category chips matching the feed
contract's enum exactly — "Software", "Agriculture", "Film", "Arts", "Other" — with "Agriculture"
and "Software" selected; region chips "Lagos", "Ibadan", "Abuja", "Kano", "Accra", "Anywhere in West
Africa" with "Lagos" selected. Selected chips get a pale green fill, a solid green border, **and** a
small check glyph — shape as well as colour. Actions "Show me ideas" (filled) and "Skip for now"
(plain text link, visibly clickable — this step is optional and must look it), then "You can change
this any time in Settings." No progress bar, no confetti, no "Welcome aboard!", no emoji.

**Engineering note — two things these mockups commit us to.** First, they depict *first-party* auth
UI, not the vendor's drop-in modal. That means the email-code and OAuth flows run through the SDK's
headless hooks, and per [`conventions.md`](./conventions.md) §6.4 those imports stay inside
`lib/auth/use-auth.ts` — the auth *screens* import `useAuth`, never `@privy-io/react-auth`. Second,
removing the vendor badge is a paid-plan feature on most auth vendors; if the plan doesn't cover it,
the badge is a real constraint and the mockup is aspirational on that one detail. Worth confirming
before these ship. The feed personalization J3 writes to is `PUT /me/interests`
([`feed-api.md`](./feed-api.md)).

---

## Output

One image. High-fidelity and production-quality, like a real screen from a real product with real
users' data in it — the opposite of a wireframe or a slide.

---

## How to run this

1. **One fresh thread per screen.** The model anchors hard on whatever it generated first; reusing a
   thread across screens drags every screen toward the first one's composition.
2. Paste §1–§8 (the kit), then exactly one screen brief. Set the aspect ratio to widescreen 16:9
   before generating for Short briefs.
3. **Generate screen A first and lock it.** It establishes the shell, the card, and the density that
   every other screen inherits. Do not move on until it is right. **Exception: the auth briefs (§J)
   run in their own thread and never take screen A as a reference** — they have no app shell, and
   attaching screen A is how a sidebar ends up on a sign-in page.
4. From screen B onward, **attach the approved screen A image** as the style reference, with the
   borrow-scope line in §8 filled in: "borrow the app shell, table and card density, and type scale
   exactly; ignore its content."
5. When a result drifts, correct **one specific thing per turn**. Don't restate the prompt. The
   drifts to watch for, in order of likelihood:
   - Type has crept up and it looks like a landing page → "reduce all type by roughly 30%; page
     title 28px, body 14px."
   - Everything became cards → name the table again.
   - A shield, padlock, or checkmark-circle appeared → call it out directly.
   - The shell changed from the locked version → re-attach screen A.
   - Copy went generic or garbled → re-paste the quoted strings for that region only.

---

## Sources

Researched July 2026:

- [NN/G — 8 Design Guidelines for Complex Applications](https://www.nngroup.com/articles/complex-application-design/)
- [NN/G — Data Tables: Four Major User Tasks](https://www.nngroup.com/articles/data-tables/)
- [NN/G — 10 Design Guidelines for Reporting Errors in Forms](https://www.nngroup.com/articles/errors-forms-design-guidelines/)
- [NN/G — Dashboards: Making Charts and Graphs Easier to Understand](https://www.nngroup.com/articles/dashboards-preattentive/)
- [The AI design aesthetic — why AI content all looks the same](https://kompozy.io/guides/the-ai-design-aesthetic)
- [SaaS UI/UX Design: Best Practices for Enterprise Apps in 2026](https://www.theskinsfactory.com/uiux-design-blog/saas-ui-ux-design-best-practices-2026)
- [Designing Fintech Products for Africa: Building Trust and Accessibility](https://technext24.com/2025/10/09/designing-fintech-products-for-africa/)
