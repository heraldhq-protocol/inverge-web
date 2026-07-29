import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    n: '01',
    title: 'Validate',
    body: 'Founders share ideas and get real feedback, support, and non-binding pre-pledges.',
    shell: 'bg-accent-500 text-white shadow-md',
    Icon: FeedbackIcon,
  },
  {
    n: '02',
    title: 'Fund in milestones',
    body: 'Backers fund milestones. Money is held in escrow until each target is met.',
    shell: 'bg-accent-100 text-accent-700 border border-accent-500/20 shadow-sm',
    Icon: TrancheIcon,
  },
  {
    n: '03',
    title: 'Get proof or a refund',
    body: 'Founders submit proof, Backers approve to release funds — or get a full refund.',
    shell: 'bg-forest text-white shadow-md',
    Icon: ReceiptIcon,
  },
] as const;

export function HowItWorks() {
  return (
    <Section tone="cream" id="how-it-works">
      <Container>
        <div className="mb-14 md:mb-20" data-reveal>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            How it works
          </h2>
          <p className="mt-2 text-base text-ink-muted sm:text-lg">
            Three simple steps. Built for accountability.
          </p>
        </div>

        <div className="relative">
          {/* Below lg this is a vertical timeline: icon gutter on the left, copy on the right,
              spine running between the icons. At lg it flips to icon-above-copy with the
              connector running along the icon row. Spacing comes from the copy's bottom padding
              rather than a grid gap, so the mobile spine can run unbroken between steps. */}
          <ol className="grid lg:grid-cols-3 lg:gap-8" data-stagger>
            {STEPS.map(({ n, title, body, shell, Icon }, i) => {
              const isLast = i === STEPS.length - 1;

              return (
                <li
                  key={n}
                  data-reveal
                  data-step={n}
                  className="group/step relative flex gap-5 lg:flex-col lg:gap-0"
                >
                  {/* Stretches to the full row height below lg, which is what lets the spine
                      reach the next step's icon. */}
                  <div className="relative shrink-0">
                    <div
                      className={cn(
                        'grid h-14 w-14 place-items-center rounded-full lg:h-16 lg:w-16 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/step:scale-105',
                        shell
                      )}
                      data-reveal-scale
                    >
                      <Icon />
                    </div>

                    {!isLast && (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-0 left-1/2 top-[3.75rem] w-0 -translate-x-1/2 border-l-2 border-dashed border-accent-500/40 lg:hidden"
                      />
                    )}
                  </div>

                  <div className={cn('lg:pt-6', isLast ? 'pb-4 lg:pb-0' : 'pb-12 lg:pb-0')}>
                    <span className="text-xs font-bold uppercase tracking-widest text-accent-700">
                      {n}
                    </span>
                    <h3 className="mt-1.5 font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted sm:text-base">
                      {body}
                    </p>
                  </div>

                  {/* lg only: runs from this icon's right edge into the grid gap, stopping short
                      of the next icon. Absolute, so it never becomes a flex item — a static
                      wrapper here would add a gap to steps 01/02 and push them out of line
                      with 03. */}
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className="absolute -right-6 left-[4.5rem] top-8 hidden h-0 border-t-2 border-dashed border-accent-500/40 lg:block"
                    />
                  )}
                </li>
              );
            })}
          </ol>

          {/* The return loop — the section's signature moment. Labelled, because an unexplained
              bracket reads as decoration; naming it makes the refund path part of the diagram. */}
          <div className="relative mt-10 hidden h-16 lg:block">
            {/* Right edge rises to step 03's icon centre (two columns + half an icon), left edge
                to step 01's. Percentages, so it holds at any container width. */}
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-8 right-[calc(33.333%-3.333rem)] rounded-b-3xl border-x-2 border-b-2 border-dashed border-accent-500/40"
            />
            <span
              aria-hidden="true"
              className="absolute left-8 top-0 h-0 w-0 -translate-x-1/2 border-x-[5px] border-b-[7px] border-x-transparent border-b-accent-700"
            />
            {/* Centred on the loop's own midpoint, not the container's — the loop stops short
                of the right edge, so left-1/2 would sit noticeably off along the line. The
                paper background breaks the dash, which is what makes it read as a label on
                the path rather than text floating over it. */}
            <span className="absolute bottom-0 left-[calc(33.333%+2.667rem)] -translate-x-1/2 translate-y-1/2 bg-paper px-3 text-xs font-bold uppercase tracking-widest text-accent-700">
              Refund returns to backers
            </span>
          </div>

          {/* Same idea below lg, where a horizontal loop has nowhere to go. Aligned to the copy
              column so it reads as the timeline's closing note. */}
          <div className="ml-[4.75rem] inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-50 px-3 py-1.5 lg:hidden">
            <span aria-hidden="true" className="text-accent-700">
              ↑
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-accent-700">
              Refund returns to backers
            </span>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function FeedbackIcon() {
  return (
    <svg
      className="h-6 w-6 lg:h-7 lg:w-7"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

/** Tranche bars — milestones gate on delivered proof, not on dates, so not a calendar. */
function TrancheIcon() {
  return (
    <svg
      className="h-6 w-6 lg:h-7 lg:w-7"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}

/** Receipt, not a shield or a tick — draw the proof, never a symbol standing in for trust. */
function ReceiptIcon() {
  return (
    <svg
      className="h-6 w-6 lg:h-7 lg:w-7"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}
