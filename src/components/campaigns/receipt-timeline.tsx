import { Amount } from '@/components/ui/amount';
import { Timeline, type TimelineEntry } from '@/components/ui/timeline';
import { TxLink } from '@/components/ui/tx-link';
import { formatDate } from '@/lib/format';
import type { Receipt } from '@/lib/campaigns/types';

/**
 * Every money movement on a campaign, dated, each with its receipt (FR-802).
 *
 * This is the transparency dashboard in miniature, and it is the one place a reader can check the claims on
 * the rest of the page against something the platform cannot edit. Refunds are listed as prominently as
 * releases: a visible refund is proof the guarantee works, so hiding one would defeat the purpose.
 *
 * Signatures are never rendered as text — TxLink turns each into "View receipt" (conventions §1.1).
 */
export function ReceiptTimeline({ receipts }: { receipts: Receipt[] }) {
  if (receipts.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        No money has moved on this campaign yet. Every release and every refund will be listed here with a
        receipt.
      </p>
    );
  }

  // Newest first: the most recent movement is the one a returning backer came to check.
  const entries: TimelineEntry[] = [...receipts]
    .sort((a, b) => new Date(b.blockTime).getTime() - new Date(a.blockTime).getTime())
    .map((r) => ({
      id: r.txSignature,
      date: formatDate(r.blockTime),
      title: r.label,
      tone: r.kind === 'MILESTONE_FAILED' ? 'danger' : r.kind === 'REFUND_CLAIMED' ? 'neutral' : 'accent',
      detail: r.amount ? <Amount value={r.amount} currency="USD" className="font-semibold text-ink" /> : null,
      action: <TxLink signature={r.txSignature} />,
    }));

  return <Timeline entries={entries} />;
}
