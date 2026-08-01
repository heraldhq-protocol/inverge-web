import type { MilestoneClaim, Milestone } from '@/lib/campaigns/types';

/**
 * The proof a creator submitted for a stage.
 *
 * **Always public, in every state, with no gate of any kind.** The reference gates update posts
 * behind backing and it is right to, because those are creator commentary. This is not: it is the
 * evidence backers are being asked to judge, and gating the thing people vote on behind a payment
 * would be indefensible (teardown §5.5, campaign-brief.md §9 rule 2).
 *
 * The evidence definition renders beside it deliberately. Proof only means something against what
 * was agreed in advance, and the agreement was fixed when the campaign was published (FR-303), so
 * showing the claim without the standard it is being measured against invites the reader to judge on
 * vibes.
 */
export function MilestoneProof({
  milestone,
  claim,
}: {
  milestone: Milestone;
  claim: MilestoneClaim;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-ink">What was delivered</h4>
        <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-ink-muted">{claim.proof.note}</p>

        {claim.proof.links && claim.proof.links.length > 0 && (
          <ul className="mt-3 space-y-1">
            {claim.proof.links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-9 items-center rounded text-sm font-medium text-accent-700 underline decoration-accent-700/30 underline-offset-2 hover:decoration-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs leading-relaxed text-ink-muted">
        Agreed at the start of the campaign as proof for this stage:{' '}
        {milestone.evidenceDefinition.type}, from{' '}
        {milestone.evidenceDefinition.source.toLowerCase()}.
      </p>
    </div>
  );
}
