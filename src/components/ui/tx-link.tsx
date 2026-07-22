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
      className="text-sm text-foreground/60 underline underline-offset-2 hover:text-foreground"
    >
      {label}
    </a>
  );
}
