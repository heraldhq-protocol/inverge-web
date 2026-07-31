// Progressive disclosure (NFR-10): render "View receipt", never a raw signature by
// default. The chain is implementation detail in mainstream flows (plan §12).
export function TxLink({
  signature,
  cluster = 'devnet',
  label = 'View receipt',
}: {
  signature: string;
  cluster?: 'devnet' | 'mainnet-beta';
  label?: string;
}) {
  const suffix = cluster === 'mainnet-beta' ? '' : `?cluster=${cluster}`;
  return (
    <a
      href={`https://explorer.solana.com/tx/${signature}${suffix}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-11 items-center rounded text-sm font-medium text-accent-700 underline decoration-accent-700/30 underline-offset-2 transition-colors hover:decoration-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
    >
      {label}
    </a>
  );
}
