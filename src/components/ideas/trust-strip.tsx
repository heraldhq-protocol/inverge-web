/**
 * Three plain sentences about how money works here, immediately under the fold on idea and campaign
 * detail. Non-dismissable, never sells.
 *
 * The reference puts this exact band on every project page, and it is the pattern worth copying most
 * faithfully (teardown §4, band 4). Ours differs in one important way: their middle sentence is a
 * disclaimer of the guarantee, ours is the guarantee. And where the reference buries shipping and fees
 * at the bottom of the page because they are off-putting, we put the money mechanics at the top,
 * because for us they are the reason to trust the platform (playbook §5.1).
 *
 * No icons. A shield, padlock or tick-in-a-circle here is exactly the stock trust badge the art
 * direction bans (app-mockup-kit §4).
 */
const LINES = [
  {
    id: 'free',
    text: 'Publishing an idea is free. Nothing is charged and no money moves while an idea is being validated.',
  },
  {
    id: 'stages',
    text: 'Money for a funded campaign is released in stages, and only after backers have had time to review what was delivered.',
  },
  {
    id: 'refund',
    text: 'If a stage is not delivered, the money still held is returned to backers automatically.',
  },
];

export function TrustStrip() {
  return (
    <aside
      aria-label="How money works on Inverge"
      className="rounded-xl border border-border bg-paper px-5 py-5 sm:px-6"
    >
      <ul className="grid gap-4 sm:grid-cols-3 sm:gap-6">
        {LINES.map((line) => (
          <li key={line.id} className="border-l-2 border-accent-500/40 pl-3 text-sm leading-relaxed text-ink-muted">
            {line.text}
          </li>
        ))}
      </ul>
    </aside>
  );
}
