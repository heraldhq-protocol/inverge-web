# App Screen Prompts — copy-paste ready

*Send these to GPT image generation, in order, in the same chat that produced the landing page
mockup. Each block below is one message. The art direction and reasoning behind them live in
[`app-mockup-kit.md`](./app-mockup-kit.md) — this file is just the prompts.*

**Do not send the PRD.** Every prompt here is self-contained. See §"Why not the PRD" at the bottom.

---

## How to run this

1. **Message 0 first**, once, in the landing-page chat. It reuses that thread's palette memory while
   resetting the composition — the landing page is a marketing page and these are not.
2. **Then one screen prompt per message**, in the order given. Screen 1 first, always.
   The three auth screens (A1–A3) live at the bottom and run in a **separate fresh thread** — they
   are the only screens with no app shell, so they don't belong in the inheritance chain.
3. **Set aspect ratio to widescreen 16:9** before generating, except where a prompt says "tall".
4. **Lock screen 1 before moving on.** It sets the shell, card, and type scale everything else
   inherits. Regenerate it until it's right.
5. From screen 2 onward, if the model drifts, **re-attach the approved screen 1 image** with:
   *"Match this image's app shell, density, and type scale exactly. Ignore its content."*
6. Correct **one specific thing per turn**. Never restate the whole prompt.

**The four drifts to watch for**, in order of likelihood:

| What you see | Say exactly this |
|---|---|
| It looks like a landing page | "Reduce all type by about 30%. Page title 28px, body 14px. Tighten vertical spacing." |
| Everything became cards | "Screen N uses a table, not cards. Redraw the main region as a dense table." |
| A shield / padlock / checkmark-circle appeared | "Remove the shield icon. Draw the mechanic instead, per the icon rule." |
| Copy went generic or garbled | Re-paste only the quoted strings for that one region. |

---
---

# MESSAGE 0 — send this once

```
We're moving from the Inverge landing page to the logged-in product screens.

Keep from the landing page: the exact palette, the type character, the restrained
texture, the photographic style. That identity is locked and correct.

Reset completely: the composition. The landing page is a marketing page. Everything
from here is a working product screen, and six rules invert.

1. TYPE GETS MUCH SMALLER. The landing hero ran 56-90px. Nothing here does.
   Page title ~28px, section heading ~20px, card title ~16-18px, body and UI 14-16px,
   table and metadata text 13-14px. Oversized type is the number-one tell that a
   "product screenshot" is really a landing page with a table pasted into it.

2. DENSITY IS A FEATURE. Marketing pages breathe; product screens work. A screen
   showing nine ideas is more credible than one showing three with a lot of air.
   Keep the 8px grid, but section rhythm compresses from 96px down to 24-32px.

3. THE APP SHELL IS IDENTICAL ON EVERY SCREEN.
   - Left sidebar, 240px, deep forest green ground. Leaf mark + "inverge" wordmark
     at top. Nav items: "Discover", "My ideas", "Campaigns", "Receipts", "Settings".
     The active item gets a pale green fill and a solid green left edge — marked by
     shape as well as colour, never colour alone.
   - Top bar, 64px, on warm cream. Page title or breadcrumb at left. At right: a
     search field, a notification bell, and a 32px avatar with a real name beside it.
   - Content area on warm cream, max 1200px, 32px gutters, white cards for grouped
     content.

4. SHOW THE INTERESTING STATE, NOT THE HAPPY PATH. An idea at 34% of its threshold
   is a better screenshot than one at 100%, because it proves the meter means
   something mid-flight. Real products are mostly in progress.

5. CARDS OR TABLE IS DECIDED PER SCREEN AND I WILL TELL YOU WHICH. Cards are for
   browsing. Tables are for comparing and acting in bulk. Do not default everything
   to cards.

6. THE SIGNATURE MOMENT IS THE MECHANIC, NOT DECORATION. On each screen, one
   element is the thing the screen exists for — the validation meter, the milestone
   tracker. Draw that with real care and let everything around it be quiet and
   ordinary. Remove any graphic that isn't carrying information.

LOCKED PALETTE — these are the real production values, nothing here is open:
  Accent 50    oklch(0.96 0.03 150)    palest tint, hover fills
  Accent 100   oklch(0.91 0.06 150)    pale tint, pills, chips, selected rows
  Accent 500   oklch(0.58 0.18 152)    the accent, primary buttons, active states
  Accent 700   oklch(0.42 0.14 152)    small green text, numerals, links
  Accent 900   oklch(0.26 0.08 152)    deep, rare, high-emphasis
  Forest       oklch(0.18 0.045 155)   sidebar, inverted bands
  Paper        oklch(0.975 0.006 95)   warm cream page background
  Surface      oklch(1 0 0)            white card surface
  Ink          oklch(0.18 0.01 95)     primary text
  Ink muted    oklch(0.48 0.01 95)     labels, metadata, secondary text
  Border       oklch(0.91 0.01 95)     warm hairline borders

Hierarchy comes from tints and shades of that one green plus the warm neutrals. Do
not introduce a second hue to signal a second thing — use weight, size, and position.
One exception: a failed or refunded state may use a muted, desaturated warm red,
because "failed" in the same green as "approved" is a comprehension failure. Keep it
quiet; this is not an alert dashboard. Shadows are warm-tinted, never neutral black.

TYPE: geometric-humanist display sans for headings (character close to Outfit or
Plus Jakarta Sans), neutral humanist sans for body and UI (character close to Geist),
monospace ONLY for receipts, IDs, and technical data (character close to Geist Mono).
Tabular numerals on every money figure and every column of numbers.

ICONS — no stock trust badges. No shield, padlock, checkmark-in-a-circle, handshake,
or rocket. This product category reaches for them by reflex, which is why they read
as generic on sight. Draw the actual mechanic: a milestone stepper with real stage
labels, a receipt card, a return arrow for a refund. Line icons, one weight, small —
16-20px in UI, not 48px feature glyphs.

TEXTURE: restrained. No glassmorphism, no gradient meshes, no glow. Borders are 1px
warm hairlines. Elevation is a soft warm shadow used sparingly, never on every card
at once.

IMAGERY: any person reads as a specific individual caught candidly, not stock-agency
gloss. Idea cover images look like something a founder actually uploaded — a product
screenshot, a photo of the thing, a plain typographic cover. Not agency stock. Where
West Africa appears it's a specific-feeling place, never a generic "Africa" motif
like an acacia silhouette or a print pattern used as decoration.

WHAT MUST NEVER APPEAR, ON ANY SCREEN: Inverge runs on Solana underneath and users
must never see it. No wallet-connect button, no wallet address, no gas or network
fees, no "mainnet/devnet", no seed phrase, no transaction signature, no crypto price
ticker, no blockchain explorer branding. A transaction reference is always a
"receipt", never a signature.

COPY: I will write every visible string in quotes. Render them exactly as written —
every label, button, column header, and empty-state line. Never "Lorem ipsum", never
"Company Name", never "John Doe". Real Nigerian and West African names, believable
Naira amounts. Plain language over jargon: "No money moves yet" beats "non-binding
pre-pledge commitment". Every button says exactly what happens.

Don't generate anything yet. Confirm you've got it, and I'll send screen 1.
```

---
---

# SCREEN 1 — Discovery feed

**Lock this one before moving on.** 16:9 landscape.

```
SCREEN 1 of 9: Discovery feed. Format: one screen, above the fold, 16:9, a 1440px
desktop viewport. Layout: CARDS, 3-up grid.

Job: a logged-in backer browses and filters published ideas.

App shell as specified: forest sidebar with "Discover" as the active item, 64px top
bar with the page title "Discover", a search field, a bell, and a 32px avatar beside
the name "Amara Okonkwo".

A filter bar sits above the grid: "All categories ⌄", "Sort: Most validated ⌄", and a
result count reading "127 ideas". At the right of the top bar, a filled green button
"Start an idea".

Then nine idea cards in a 3-column grid, 24px gutter. Each card: a cover image at 3:2,
the title, a one-line problem summary, then a compact VALIDATION METER showing partial
progress, then supporter count and pre-pledge total in tabular numerals.

THE VALIDATION METER IS THE SIGNATURE ELEMENT OF THIS SCREEN. It must be legible
mid-flight, not just at 100% — a partial bar with its percentage labelled, so a
viewer immediately understands the idea is part-way to a threshold. Design it with
real care. Everything else on the card stays quiet.

Use these for the first three cards, exactly as written:

Card 1 — "CampusKonekt"
  "Students in Ibadan wait 40 minutes for lunch between lectures."
  68% to threshold · "412 supporters" · "₦2,840,000 pre-pledged"

Card 2 — "Zowasel Eats"
  "Smallholder farmers lose a third of their harvest before it reaches a buyer."
  34% to threshold · "189 supporters" · "₦1,120,000 pre-pledged"

Card 3 — "Kaduna Solar Co-op"
  "Six hours of grid power a day makes a cold chain impossible."
  91% to threshold · "1,203 supporters" · "₦6,410,000 pre-pledged"

The remaining six cards use realistic Nigerian and West African project names,
problems, and amounts in the same shape and register.

Exactly ONE card carries a "Promoted" label. It must be plainly visible, visually
distinct from the organic cards, and positioned so it can never be confused with or
overlap the validation numbers.

Output one image. High-fidelity and production-quality, like a real screen from a
product that already has users, with their data in it — the opposite of a wireframe
or a slide. Not a landing page.
```

---

# SCREEN 2 — Idea detail

**Tall composite, not 16:9.** Attach the approved screen 1.

```
SCREEN 2 of 9: Idea detail. Format: TALL — a full-page composite showing the whole
page top to bottom, like a stitched full-page screenshot. Not 16:9. Layout: two
columns — content left, sticky action panel right.

Match the attached screen 1 for app shell, card style, density, and type scale
exactly. Ignore its content. Sidebar active item is "Discover". Top bar shows a
breadcrumb "Discover / CampusKonekt".

Job: a backer reads one idea and acts on it.

HEADER: the title "CampusKonekt", the creator "Tobi Adeyemi" with a 40px avatar,
"Published 12 March", and a cover image.

LEFT COLUMN — four clearly separated sections with these headings: "The problem",
"The solution", "Roadmap", "What we're asking for". Each holds two or three sentences
of real, specific copy about a campus food-ordering platform for students in Ibadan —
written like a founder wrote it, not like marketing.

RIGHT COLUMN — a sticky panel. THIS IS THE SIGNATURE ELEMENT; draw it with real care.
  - A validation meter at 68%, labelled "68% to validation threshold"
  - A small stat stack, tabular numerals: "412 supporters", "₦2,840,000 pre-pledged",
    "Feedback score 4.2"
  - Action cluster:
      "Support this idea"      (filled green)
      "Leave feedback"          (outlined)
      "Pre-pledge ₦25,000"      (outlined)
  - Directly beneath the pre-pledge button, this line, so it can never read as a
    payment: "No money moves yet — this tells the creator you're in."

BELOW THE FOLD — structured feedback, not a bare comment thread. Four entries, each
with a real Nigerian name, a small avatar, a small rating, and two sentences of
specific, useful criticism. Actual critique, not praise.

Output one tall image. High-fidelity, production-quality, a real product screen.
```

---

# SCREEN 3 — Publish an idea

16:9 landscape.

```
SCREEN 3 of 9: Publish an idea. Format: one screen, 16:9. Layout: form on the left
(~60%), live preview on the right (~40%).

Match the attached screen 1 for shell, density, and type scale. Sidebar active item
is "My ideas". Top bar title: "Publish an idea".

Job: a creator publishes a new idea.

FORM, grouped into labelled sections. Every field has its label ABOVE it, always
visible — a placeholder is never a label. Fields:
  "Idea title"
  "The problem you're solving"
  "Your solution"
  "Roadmap"
  "How much you're asking for"   — prefixed "₦", showing "500,000"

SHOW ONE FIELD MID-ERROR to demonstrate the validation pattern. "The problem you're
solving" has a soft red-tinted background wash across the field plus this message
directly beneath it: "Tell us who has this problem and how often — one sentence is
enough." No other field is in an error state. Error is shown by tint AND message, not
by a red border alone.

RIGHT SIDE — a live preview of the resulting idea card, under the heading "This is
what backers will see". Render it as the exact same card component from screen 1.

ACTIONS: "Publish idea" (filled green), "Save draft" (outlined).

CRITICAL: no verification, no KYC, no identity check, and no wallet mention anywhere
on this screen. Publishing an idea is free and completely ungated. Verification only
gates campaign submission much later.

Output one image, 16:9, high-fidelity, production-quality.
```

---

# SCREEN 4 — Creator dashboard

16:9 landscape. **This one is a table — say so if it drifts.**

```
SCREEN 4 of 9: Creator dashboard. Format: one screen, 16:9. Layout: a status strip,
then three stat blocks across the top, then a TABLE. Not cards.

Match the attached screen 1 for shell, density, and type scale. Sidebar active item
is "My ideas". Top bar title: "My ideas".

Job: a logged-in creator's home base.

TOP — a calm, informational verification status strip, not an alarm and not red:
"Verification: In review — we'll email you within 2 working days. You can keep
building meanwhile."

THREE STAT BLOCKS, tabular numerals, small and quiet:
  "Ideas published"     "3"
  "Total pre-pledged"   "₦4,120,000"
  "Supporters"          "1,804"

THEN A TABLE of the creator's own ideas — this is the main region and it is a table,
because the user is comparing their own records, not browsing. Columns: "Idea",
"Status", "Supporters", "Pre-pledged", "Updated". Five rows, with statuses spread
across "Draft", "Validating", "Threshold met", and "Campaign live". Status is a text
label with a tint or shape — never colour alone. A small row action menu at the right
edge of each row. Real project names and believable numbers in every row.

BELOW — a boost section, two flat-fee tiers priced plainly:
  "Basic — ₦15,000"
  "Featured — ₦45,000"
and this line beneath them: "Boosts affect where your idea appears. They never change
your validation numbers."
Draw this as an ordinary section of the page. It must NOT look like an upsell modal,
a pricing page, or a promotional banner.

Output one image, 16:9, high-fidelity, production-quality.
```

---

# SCREEN 5 — Campaign and milestone detail

**Tall composite.** This is the most important screen in the product.

```
SCREEN 5 of 9: Campaign and milestone detail. Format: TALL full-page composite, not
16:9. Layout: header, then a full-width milestone tracker, then supporting detail.

Match the attached screen 1 for shell, density, and type scale. Sidebar active item is
"Campaigns". Breadcrumb: "Campaigns / CampusKonekt".

Job: a backer watches a funded campaign deliver. THIS IS THE MOST DIFFERENTIATING
SCREEN IN THE PRODUCT — spend the design effort here.

HEADER: "CampusKonekt", creator "Tobi Adeyemi", "₦3,600,000 raised of ₦5,000,000",
"18 days left". Tabular numerals throughout.

THE MILESTONE TRACKER IS THE SIGNATURE ELEMENT. Four milestones in an ordered
horizontal sequence, each with a title, its tranche percentage, and a status. All four
states must be visible at once so the mechanic is legible at a glance:

  1. "Working prototype"              "25%"   approved and released   "View receipt"
  2. "First 100 orders delivered"     "25%"   approved and released   "View receipt"
  3. "Vendor payouts automated"       "30%"   under review — 4 days left to object
  4. "1,000 monthly active students"  "20%"   upcoming

Milestone 3 is the focal point. It carries a calm countdown and this line: "Backers
have 4 days to review the proof Tobi submitted. If enough object, this milestone
refunds automatically."

The feeling is a parcel delivery tracker — calm, factual, progress you can read at a
glance. NOT a governance vote, NOT a red countdown clock, NOT a vault or safe
metaphor, and no literal crypto iconography anywhere.

"View receipt" is a plain text link. No transaction signature, no wallet address, no
hash rendered as a hash, no blockchain explorer branding.

BELOW — the submitted proof for milestone 3: two photographs and a short written
update from the creator, in plain language.

Output one tall image. High-fidelity, production-quality.
```

---

# SCREEN 6 — Refund state

16:9 landscape.

```
SCREEN 6 of 9: Campaign in its refund state. Format: one screen, 16:9. Same campaign
shell as screen 5, in its failed state.

Match the attached screen 1 for shell, density, and type scale. Sidebar active item is
"Campaigns".

Job: prove the guarantee is real. This screen IS the entire product promise, so it
must read as matter-of-fact — never apologetic, never alarming.

The milestone tracker above shows: two released, one FAILED, one cancelled. The failed
state is the one licensed use of the muted, desaturated warm red. Keep it quiet.

HEADING: "Milestone not delivered — your money is being returned."

BODY: "Backers reviewed the proof for 'Vendor payouts automated' and it didn't pass.
The remaining ₦1,400,000 is going back to everyone who funded it. Nothing for you to
do."

THEN a personal line for the viewing backer: "Your refund: ₦45,000 — returned 4 March"
with a plain "View receipt" link beside it.

Calm, factual, plain language. Zero apology, zero emoji, no warning triangle, no alarm
styling, no exclamation marks. This is a system working correctly, and it should look
like one.

Output one image, 16:9, high-fidelity, production-quality.
```

---

# SCREEN 7 — Admin curation queue

16:9 landscape. **Dense table. Internal tool.**

```
SCREEN 7 of 9: Admin curation queue. Format: one screen, 16:9. Layout: a DENSE TABLE.
This is an internal tool — it should be more utilitarian and denser than the
backer-facing screens, and that is correct, not a compromise.

Match the attached screen 1 for shell and type scale, but tighten the row density
further. Sidebar active item is "Review". Top bar title: "Curation queue".

Job: a reviewer clears pending campaign submissions.

A table, seven rows. Columns: "Campaign", "Creator", "Verification", "Fee",
"Submitted", "Threshold", "Actions". Rows are denser than the product screens because
this user is comparing records, not browsing.

Checkboxes in the first column with "Select all" in the header. Three rows are checked,
and a batch action bar reads "3 selected" with buttons "Approve" and "Request changes".

Per-row actions: "Approve", "Request changes", "Reject".

On the right, a SIDE PANEL is open — NOT a modal, because the reviewer needs to keep
reading the table row while writing. The panel holds a textarea labelled "What does the
creator need to change?" and a button "Send to creator".

Real Nigerian creator names and real-sounding campaign titles in every row. Believable
Naira amounts and dates.

Output one image, 16:9, high-fidelity, production-quality.
```

---

# SCREEN 8 — Verification

16:9 landscape. **Three parts — 8a, 8b, 8c.** Send them in order, in one thread.

> **Rewritten against the shipped KYB integration.** The earlier version of this brief showed a
> three-step "Who you are → Your business → Review" stepper and an in-app CAC file upload. Neither
> exists. [`verify-business.tsx`](../src/components/kyc/verify-business.tsx) collects three fields,
> then `startBusinessSession` returns a `verificationUrl` and the browser **leaves for an outside
> provider**; documents are handled there and the user returns via `/kyc/callback`. There is no
> personal KYC step on the business path (KYB + AML only) and no stepper. Anything drawn from the old
> brief describes a product that doesn't exist.
>
> The real work on this screen is the **state matrix**, not the form — hence 8b. States come from
> `KycStatusValue` / `AmlStatusValue` in [`kyc-api.ts`](../src/lib/kyc/kyc-api.ts).

---

## SCREEN 8a — Verification, at rest

```
SCREEN 8a of 9: Verification. Format: one screen, 16:9. Layout: a single centred
column about 640px wide.

Match the attached screen 1 for app shell, density, and type scale. Sidebar active
item is "Settings". Top bar title: "Verification".

Job: a creator starts business verification before submitting a campaign.

IMPORTANT — this screen does NOT collect documents. Verification is completed with an
outside partner: the user fills three fields here, is handed off, and comes back. So
there is NO file upload, NO drop zone, NO attached-file row, and NO multi-step
stepper. Drawing any of those describes a product that doesn't exist.

At the top, one plain reassuring line, calm and not boxed in an alert:
"Creators receive money, so we verify the business first. This is required before you
can launch a campaign — never to publish an idea."

THEN ONE WHITE CARD, hairline border, holding the whole thing:
  Card title: "Verify your business"
  Muted line beneath it: "We check the company's registry, its documents, and its
  directors, and run anti-money-laundering screening. There's no separate personal
  ID check."

  Three fields, each with its label ABOVE it and always visible. The two optional ones
  carry a small muted "Optional" beside the label — never a required asterisk:
    "Registered legal name"     — filled in: "CampusKonekt Technologies Ltd"
    "Registration number"  Optional  — filled in: "RC 1847392"
    "Country"              Optional  — a short field, filled in: "NG"

  Filled green button: "Start business verification"

  Directly beneath the button, one small muted line — this is the whole point of the
  screen, so it must be plainly readable and not an afterthought:
  "This opens our verification partner in a new step. It takes about 5 minutes, and
  you'll come straight back here when it's done."

BELOW THE CARD, one small muted line, outside it:
"We never store your documents — only a verification reference and its status."

THE STATUS IS THE SIGNATURE ELEMENT of this screen, so give the card a quiet status
row at its top right reading "Not started" — a text label in a neutral pill, marked
by shape as well as colour.

Render every quoted string exactly as written.

MUST NOT APPEAR: no shield, no padlock, no checkmark-in-a-circle, no fingerprint, no
ID-card-with-a-tick graphic — this screen is exactly where those get reached for. No
file upload of any kind. No stepper. No progress bar. No wallet, no seed phrase, no
chain or network language. No verification-partner logo or branding. No passport or
selfie illustration.

Output one image, 16:9, high-fidelity, production-quality.
```

---

## SCREEN 8b — Verification states

**Tall, not 16:9.** A states sheet, not a screen — this is the one that actually gets built from.

```
SCREEN 8b of 9: Verification states. This is a STATES SHEET, not a screen — the same
card in every state it can be in, stacked in one column so the set can be built from
one image. So: no app shell, no sidebar, no top bar. Plain warm cream background, a
single centred column about 640px wide, generous space between each card.

Match the attached screen 1 for card style, type scale, border and shadow treatment.

Above each card, a small muted monospace label naming the state — these labels are
annotations for the developer, set clearly outside the card, never inside it:
  "CHECKING"  "IN REVIEW"  "VERIFIED"  "DECLINED"  "FLAGGED"

Every card is the same white card with a hairline border and a status pill at its top
right, so the five read as one component changing state — not five different designs.
The pill is marked by shape and label as well as colour, never colour alone.

CARD 1 — label "CHECKING". Status pill: "Checking". The card is in its loading state:
two grey skeleton bars where the title and body would be, at the real heights, and a
skeleton block where the button goes. No spinner. No text.

CARD 2 — label "IN REVIEW". Status pill: "In review".
  Title: "Verification in progress"
  Body: "You started this with our verification partner but didn't finish. Pick up
  where you left off — it takes about 5 minutes."
  Filled green button: "Continue business verification"
  Small muted line beneath: "Started 2 August, 14:20"
  Calm and factual. No countdown, no timer, no amber warning styling.

CARD 3 — label "VERIFIED". Status pill: "Verified", in the pale green tint.
  Title: "Business verified"
  Body: "CampusKonekt Technologies Ltd is verified. You can submit a campaign now."
  One filled green button: "Submit a campaign"
  Small muted line: "Verified 2 August 2026"
  NO large tick graphic, NO green checkmark-in-a-circle, NO confetti. The pill carries
  the good news; the card stays ordinary.

CARD 4 — label "DECLINED". This is one of the two licensed uses of the muted,
desaturated warm red on this sheet — keep it quiet.
  Status pill: "Declined", in that muted red tint.
  Title: "We couldn't verify this business"
  Body: "The details you gave didn't match the company register. Check the legal name
  and registration number against your certificate, then try again."
  Filled green button: "Try again"
  Outlined button beside it: "Contact support"
  Plain and matter-of-fact. Zero apology, no warning triangle, no exclamation mark, no
  alarm styling.

CARD 5 — label "FLAGGED". Same muted red, same restraint.
  Status pill: "On hold"
  Title: "This needs a person to look at it"
  Body: "Our screening flagged something we can't resolve automatically. Email
  support@inverge.africa and we'll sort it out — most cases clear within two working
  days."
  One outlined button only: "Contact support"
  There is deliberately NO retry button on this card.

Render every quoted string exactly as written.

MUST NOT APPEAR anywhere on this sheet: no shield, padlock, fingerprint, or
checkmark-in-a-circle; no warning triangle; no file upload or attached document; no
stepper or progress bar; no verification-partner logo; no wallet, seed phrase, or
chain language; no emoji; no illustration.

Output one tall image, high-fidelity, production-quality.
```

---

## SCREEN 8c — Profile and settings

**Tall, not 16:9.** The surface that owns verification status and links into 8a/8b.

```
SCREEN 8c of 9: Profile and settings. Format: TALL — a full-page composite, top to
bottom. Layout: a single centred column about 720px wide.

Match the attached screen 1 for app shell, density, and type scale. Sidebar active
item is "Settings". Top bar title: "Settings".

Job: the signed-in user manages their profile, how they sign in, and what's in their
feed.

The page is a single column of labelled SECTIONS separated by full-width hairlines —
not a grid of cards and not a settings sub-navigation. Each section has a small bold
heading, a one-line muted description, then its rows. Section headings, in order:
"Profile", "Signing in", "Verification", "Your feed", "Notifications", "Account".

PROFILE
  "The name and picture other people see on your ideas and feedback."
  A 64px avatar of a specific-looking woman, candid not stock, with a small outlined
  button beside it: "Change photo"
  Then two fields, labels above, filled in:
    "Display name" — "Amara Okonkwo"
    "Where you're based" — "Lagos, Nigeria"
  A filled green button, left-aligned, not full width: "Save changes"

SIGNING IN
  "You sign in with a code sent to your email, or with a connected account."
  A row showing "Email" with the value "amara.okonkwo@gmail.com" and a small outlined
  button at the right: "Change"
  Then two connected-account rows, each with a small 18px brand glyph, the name, and a
  status at the right:
    "Google" — connected, showing "amara.okonkwo@gmail.com" and a "Disconnect" link
    "X" — not connected, showing an outlined "Connect" button
  Beneath the rows, one small muted line:
  "There's no password on your account, so there's nothing to change or forget."

VERIFICATION
  "Verified businesses can launch campaigns and receive money."
  One row: "CampusKonekt Technologies Ltd", with a status pill at the right reading
  "In review" — the same pill component from the verification states sheet. Beneath it
  a muted line: "Started 2 August. We'll email you when it's done." and a green text
  link: "View verification"
  No shield, no padlock, no tick graphic anywhere in this section.

YOUR FEED
  "This shapes what you see first. You can still see every idea on Inverge."
  Two wrapping rows of selectable chips, each with a small label above:
    "Categories" — "Software"  "Agriculture"  "Film"  "Arts"  "Other"
      with "Agriculture" and "Software" selected: pale green fill, solid green border,
      and a small check glyph before the label
    "Regions" — "Lagos"  "Ibadan"  "Abuja"  "Kano"  "Accra"  "Anywhere in West Africa"
      with "Lagos" selected, same treatment
  Selection is marked by border and glyph as well as colour.

NOTIFICATIONS
  "Email only for now."
  Three rows, each a label, a muted line of explanation, and a toggle switch at the
  right. Two are on, one is off:
    "Milestone updates" — "When a campaign you backed submits proof." — ON
    "Feedback on your ideas" — "When someone leaves structured feedback." — ON
    "New ideas in your categories" — "A weekly digest, never more." — OFF

ACCOUNT
  Two plain rows at the bottom, quiet and unemphasised:
    "Sign out" — an outlined button
    "Delete account" — a plain text link in the muted red, with one muted line beside
    it: "Ideas you've published stay up unless you remove them first."

Render every quoted string exactly as written.

MUST NOT APPEAR — a settings page is where every one of these gets added by reflex:
no "Change password", no "Forgot password", no password field of any kind; no
two-factor setup, no authenticator app, no backup codes; no wallet address, no
"Export wallet", no "Export private key", no seed or recovery phrase, no chain or
network name, no wallet section at all; no shield, padlock, or key icon; no
verification-partner or auth-vendor logo; no API keys, no developer settings, no theme
picker, no language picker.

Output one tall image, high-fidelity, production-quality.
```

**Two build notes for whoever picks this up:**

1. The chips in "Your feed" write to `PUT /me/interests` ([`feed-api.md`](./feed-api.md)) — the same
   values as the first-run interests screen (A3), so build the chip group once and reuse it.
2. The "Change" button on the email row has **no backend today**. Privy supports it, but nothing in
   [`use-auth.ts`](../src/lib/auth/use-auth.ts) exposes it. Wire it or drop it — don't ship a control
   that does nothing.

---

# SCREEN 9 — Empty and zero-result state

16:9 landscape.

```
SCREEN 9 of 9: Zero-result state. Format: one screen, 16:9. Generate this as a variant
of screen 1 — same shell, same filter bar, same everything, with an empty grid.

Match the attached screen 1 exactly. Sidebar active item is "Discover".

Job: a backer has filtered the feed down to nothing.

The filter bar shows "Category: Agriculture ⌄" and "Sort: Most validated ⌄", with a
clear visual indicator that a filter is active.

Where the card grid would be, a calm message:
  "No agriculture ideas yet. Yours would be the first."
with two buttons beneath it: "Start an idea" (filled green) and "Clear filters"
(outlined).

No illustration. No mascot. No "Oops". No emoji. No sad face. No magnifying-glass
graphic. Plain type, generous space, and the action attached. It should read as calm
direction, not as an apology.

Output one image, 16:9, high-fidelity, production-quality.
```

---
---

# AUTH SCREENS — A1, A2, A3

*Numbered separately from 1–9 on purpose: **these are the only screens with no app shell**, so they
sit outside the "lock screen 1, inherit its shell" chain. Send Message 0 first, then these in a
**fresh thread**, A1 → A2 → A3. Do **not** attach screen 1 — attaching it is what makes the model
draw a sidebar onto a sign-in page.*

**Sign-in is Privy-only, and Privy has no separate sign-up.** Entering an email for the first time
*is* creating the account. So A1 and A2 are the same mechanism with different framing copy, and A2 is
drawn in its email-code state rather than at rest — an at-rest sign-up screen would be A1 with two
words changed. A3 is what actually distinguishes a new account: the first-run interest pick.

**One extra drift to watch for on these three:**

| What you see | Say exactly this |
|---|---|
| A sidebar or top bar appeared | "Remove the sidebar and top bar. This screen has no app shell — the user isn't signed in yet." |
| A password field appeared | "Remove the password field, the 'Confirm password' field, and 'Forgot password'. There is no password in this product." |
| A padlock, shield, or key graphic | "Remove it. No padlock, shield, key, or checkmark-circle — per the icon rule." |

---

# SCREEN A1 — Sign in

16:9 landscape. **No app shell.** Fresh thread, after Message 0.

```
SCREEN A1: Sign in. Format: one screen, 16:9, a 1440px desktop viewport. Layout: a
two-panel split — a forest-green brand panel on the left (~45%), the auth column on
the right (~55%) with the form in a single centred column about 400px wide.

THIS SCREEN HAS NO APP SHELL. No left sidebar, no 64px top bar, no search field, no
bell, no avatar. The user is not signed in yet, so none of that chrome exists. This is
the one deviation from the locked shell, and it is deliberate.

Density also relaxes here: an auth screen is one decision, not a working surface. Keep
the small type scale — heading 28px, body 14-15px, labels 13px — but let the centred
column breathe. It is neither a dense product screen nor a landing page.

LEFT PANEL — forest green ground, quiet, carrying information rather than decoration.
The leaf mark and "inverge" wordmark at the top. Then one line, set large but not
landing-page large (~24px):
  "Back money that has to deliver."
and beneath it, in a muted tint of the panel:
  "Every milestone is approved by backers before it pays out."
Then a small, quiet proof row in tabular numerals, hairline-separated:
  "₦48,200,000 released across 61 milestones"
  "₦3,100,000 refunded automatically"
No photograph, no illustration, no pattern, no gradient mesh, no glow.

RIGHT PANEL — warm cream, the auth column centred:
  Heading (28px):  "Sign in to Inverge"
  Sub-line:        "We'll email you a 6-digit code. There's no password to remember."

  A single field, label ABOVE it and always visible:
    Label:  "Email address"
    Field showing a real typed value: "amara.okonkwo@gmail.com"

  Full-width filled green button:  "Email me a code"

  A hairline divider with the word "or" centred in it.

  Two full-width OUTLINED buttons, stacked, each with a small 18px brand glyph at the
  left of its label:
    "Continue with Google"
    "Continue with X"

  Beneath, a small centred line with the second half as a green link:
    "New to Inverge? Create an account"

  At the very bottom, one small muted legal line, "Terms" and "Privacy Policy" as links:
    "By continuing you agree to our Terms and Privacy Policy."

WHAT MUST NOT APPEAR ON THIS SCREEN — this is the exact screen where each of these gets
reached for by reflex:
  - NO password field, no "Confirm password", no password strength meter, no "Forgot
    password" link. This product has no passwords at all.
  - NO wallet anything. No "Connect wallet" button, no wallet list, no Phantom /
    MetaMask / Solflare logos, no QR code, no "I already have a wallet", no seed
    phrase, no chain or network name.
  - NO third-party auth-vendor branding or "protected by" badge. Inverge is the
    product; the vendor underneath is invisible, exactly like the chain is.
  - NO padlock, shield, key, fingerprint, or checkmark-in-a-circle icon, at any size.
  - NO illustration, no 3D graphic, no person-at-a-laptop stock photo, no mascot.

Output one image, 16:9, high-fidelity, production-quality — a real sign-in screen from
a product that already has users, not a template.
```

---

# SCREEN A2 — Create your account (email code step)

16:9 landscape. **No app shell.** Attach the approved A1.

```
SCREEN A2: Create your account, shown in its email-code step. Format: one screen, 16:9.
Same two-panel split as the attached A1.

Match the attached A1 exactly for the left brand panel, the column width, the type
scale, and the button style. The left panel is IDENTICAL — do not change its copy or
its numbers. Only the right column changes. Still NO app shell.

Sign-up and sign-in are the same mechanism in this product — entering an email for the
first time creates the account — so this screen is the second step of that one flow,
not a different form. There is no password field here either, and no "Confirm email".

RIGHT COLUMN, centred, ~400px:
  A small muted step line above the heading:  "Step 2 of 2"

  Heading (28px):  "Check your email"
  Sub-line, with the last two words as a green link:
    "We sent a 6-digit code to amara.okonkwo@gmail.com — Change email"

  THE CODE INPUT IS THE SIGNATURE ELEMENT OF THIS SCREEN; draw it with real care.
  Six separate single-character boxes in a row, evenly spaced, each about 48px wide and
  56px tall with a 1px warm hairline border. The first four hold the digits "4", "8",
  "2", "9" — set in the monospace face, since a one-time code is technical data. The
  fifth box is focused: a solid green 2px border and a visible text caret. The sixth is
  empty and at rest. The focused box must be distinguishable by border weight as well
  as colour, never colour alone.

  Full-width filled green button:  "Continue"

  Beneath it, two small muted lines:
    "Resend code in 0:24"
    "The code expires in 10 minutes."
  The resend line is plainly disabled — muted, not a live link — and the countdown is
  calm and factual. Not red, not a large timer, not an alarm.

  At the bottom, a small line with the last three words as a link:
    "Wrong email? Start over"

Everything banned on A1 is banned here too: no password, no wallet, no seed phrase, no
auth-vendor badge, no padlock or shield, no illustration.

Output one image, 16:9, high-fidelity, production-quality.
```

**Optional variant** — worth generating once, since it is the state that actually gets support
tickets. Send as a follow-up in the same thread:

```
Same screen, one change only: the code is wrong. All six boxes are filled with
"4 8 2 9 1 7". Apply the error pattern from the form rules — a soft red-tinted
background wash across the code boxes PLUS this message directly beneath them:
  "That code doesn't match. Codes expire after 10 minutes — resend to get a new one."
The "Resend code" line below is now a live green link, not a countdown. Error is shown
by tint AND message, never by a red border alone. Nothing else on the screen changes.
```

---

# SCREEN A3 — First-run interests

16:9 landscape. **No app shell yet.** Attach the approved A1.

```
SCREEN A3: First-run interests, the last step of creating an account. Format: one
screen, 16:9. Layout: a single centred column about 640px wide on warm cream — NOT the
two-panel split, and still NO sidebar and NO top bar. Only the leaf mark and "inverge"
wordmark sit at the top left of the page, small.

Match the attached A1 for type scale, button style, and chip and border treatment.
Ignore its layout.

Job: a brand-new backer tells us what to put in their feed. This step is genuinely
optional and the screen must look like it — skipping is a plain, visible choice, never
a greyed-out afterthought and never a dismissal X in a corner.

  Heading (28px):  "What do you want to see first?"
  Sub-line:        "Pick anything that interests you. This only shapes your feed — you
                    can still see every idea on Inverge."

  FIRST GROUP, with the small label "Categories" above it:
  Five selectable chips in a wrapping row, exactly these labels:
    "Software"   "Agriculture"   "Film"   "Arts"   "Other"
  "Agriculture" and "Software" are SELECTED: pale green fill, a solid green 1.5px
  border, and a small 14px check glyph before the label. The unselected chips are white
  with a warm hairline border and no glyph. Selection is marked by shape and border as
  well as colour — never colour alone.

  SECOND GROUP, with the small label "Regions" above it:
  Six chips in the same style, exactly these labels:
    "Lagos"   "Ibadan"   "Abuja"   "Kano"   "Accra"   "Anywhere in West Africa"
  "Lagos" is selected, in the same selected treatment.

  ACTIONS, left-aligned at the bottom of the column:
    "Show me ideas"   (filled green)
    "Skip for now"    (plain text link, clearly clickable, not a disabled-looking ghost
                       button)

  One small muted line beneath the actions:
    "You can change this any time in Settings."

No progress bar, no confetti, no "Welcome aboard!", no emoji, no illustration, no
mascot, no wallet mention, no padlock or shield. Calm and ordinary.

Output one image, 16:9, high-fidelity, production-quality.
```

---
---

## Why not the PRD

Don't send it. Three reasons:

1. **It's the wrong kind of information.** A PRD describes behaviour, edge cases, and business
   rules. An image model can't draw a business rule — it draws layout, hierarchy, type, and copy.
   The parts of the PRD that matter visually are already compressed into Message 0.
2. **It dilutes the art direction.** Every thousand tokens of business context lowers the relative
   weight of the specific instructions that actually control output — the type scale, the palette,
   the banned icons. Those are the lines doing the work.
3. **It reopens gaps you already closed.** The PRD names features these prompts deliberately don't
   show, and mentions the Solana layer these screens must never reveal. Feeding it back in gives the
   model both more to invent and something to leak.

The one thing worth sending beyond these prompts is the **approved screen 1 image**, re-attached
whenever a later screen drifts.
