import type { StorySection } from './idea-story';

/**
 * In-page table of contents for the pitch (teardown §5.1). A long read stops being long when you can
 * see its shape.
 *
 * Generated from the structured pitch, so it is never out of step with the story. Sticky at `lg` only:
 * below that the action panel takes the sticky slot, and two competing sticky columns on a phone is
 * how a screen ends up with no room for content.
 */
/**
 * Below this, a contents list is longer than the thing it indexes.
 *
 * Exported because the page has to know **before** it lays out: the TOC returning `null` inside a
 * two-column grid does not collapse the column, it promotes the story into the 11rem one and squeezes
 * the pitch into a 176px ribbon. The column and the component have to agree.
 */
export const TOC_MIN_SECTIONS = 3;

export function hasToc(sections: StorySection[]): boolean {
  return sections.length >= TOC_MIN_SECTIONS;
}

export function IdeaStoryToc({ sections }: { sections: StorySection[] }) {
  if (!hasToc(sections)) return null;

  return (
    <nav aria-label="In this pitch" className="hidden lg:sticky lg:top-24 lg:block">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-muted">
        In this pitch
      </p>
      <ul className="space-y-1 border-l border-border">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="-ml-px block border-l-2 border-transparent py-1.5 pl-3 text-sm text-ink-muted transition-colors hover:border-accent-500 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            >
              {section.heading}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
