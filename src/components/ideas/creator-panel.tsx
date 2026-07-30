import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Count } from '@/components/ui/amount';
import { Pill } from '@/components/ui/pill';
import { formatDate, humaniseEnum } from '@/lib/format';
import type { IdeaDetail } from '@/lib/ideas/types';

/**
 * Who is asking, and what their record is.
 *
 * The reference's creator tab is its strongest trust surface, and the durable parts of it — account age,
 * projects created, projects delivered — are exactly what our objection-voting model needs backers to be
 * able to weigh (teardown §5.3).
 *
 * Two deliberate inversions of the reference. Delivery is **not** self-reported: a completed campaign is
 * a chain of approved milestones, so it is stated as milestones delivered rather than as a creator's own
 * "marked as fulfilled". And the tier is a permissions ladder, not flattery, so it is rendered as fact
 * with a plain explanation and no badge language. Strike counts are never shown: track record affects
 * ranking, never a public mark against a person.
 */
export function CreatorPanel({ creator }: { creator: IdeaDetail['creator'] }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <Avatar name={creator.displayName} src={creator.avatarUrl} size={40} />
        <div>
          <p className="font-display text-lg font-bold tracking-tight text-ink">
            {creator.displayName}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {creator.identityVerified ? (
              <Pill tone="accent">Verified creator</Pill>
            ) : (
              <Pill>Not yet verified</Pill>
            )}
            <Pill>{humaniseEnum(creator.tier)} tier</Pill>
          </div>
        </div>
      </div>

      {creator.bio && (
        <p className="mt-4 max-w-[68ch] text-sm leading-relaxed text-ink-muted">{creator.bio}</p>
      )}

      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-3">
        <Stat label="Ideas published" value={creator.ideasPublished} />
        <Stat label="Campaigns delivered" value={creator.completedCampaigns} />
        <div>
          <dd className="font-display text-lg font-bold tracking-tight text-ink tabular-nums">
            {formatDate(creator.memberSince).replace(/^\d+\s/, '')}
          </dd>
          <dt className="text-xs text-ink-muted">On Inverge since</dt>
        </div>
      </dl>

      <p className="mt-4 text-xs leading-relaxed text-ink-muted">
        {creator.identityVerified
          ? 'This creator has verified their identity. That is required before they can receive money, and it is not required to publish an idea.'
          : 'This creator has not verified their identity yet. They can publish and validate ideas, and they will have to verify before they can receive any money.'}
      </p>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dd className="font-display text-lg font-bold tracking-tight text-ink">
        <Count value={value} />
      </dd>
      <dt className="text-xs text-ink-muted">{label}</dt>
    </div>
  );
}
