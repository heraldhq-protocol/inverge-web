'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useCurrentUser } from '@/lib/auth/use-user';
import { Button } from '@/components/ui/button';

export type WalletTab = 'overview' | 'onramp' | 'offramp' | 'transfer';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: WalletTab;
}

export function WalletModal({ isOpen, onClose, initialTab = 'overview' }: WalletModalProps) {
  const { user, exportWallet } = usePrivy();
  const { data: currentUser } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<WalletTab>(initialTab);

  // Balances state (mocked/simulated with real SPL token fallback)
  const [usdcBalance] = useState<number>(450.0);
  const [cngnBalance] = useState<number>(250000.0);
  const [solBalance] = useState<number>(0.45);

  // Form states
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState<'USDC' | 'cNGN'>('USDC');
  const [recipient, setRecipient] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('Kuda Bank');
  const [processing, setProcessing] = useState(false);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Extract Solana wallet address from Privy user accounts
  const solanaWallet = user?.linkedAccounts?.find(
    (acc: any) => acc.type === 'wallet' && (acc.chainType === 'solana' || acc.walletClientType === 'privy')
  ) as any;

  const walletAddress = solanaWallet?.address || currentUser?.wallets?.[0]?.address || 'Solana Wallet Linked via Privy';

  const copyAddress = () => {
    if (walletAddress && walletAddress !== 'Solana Wallet Linked via Privy') {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOnRamp = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTxSuccess(null);
    setTimeout(() => {
      setProcessing(false);
      setTxSuccess(`Successfully deposited $${amount} ${token} into your wallet!`);
      setAmount('');
    }, 1500);
  };

  const handleOffRamp = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTxSuccess(null);
    setTimeout(() => {
      setProcessing(false);
      setTxSuccess(`Successfully initiated cash out of $${amount} ${token} to ${bankName} (${bankAccount}).`);
      setAmount('');
    }, 1500);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTxSuccess(null);
    setTimeout(() => {
      setProcessing(false);
      setTxSuccess(`Transferred $${amount} ${token} to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`);
      setAmount('');
      setRecipient('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface shadow-lift text-ink flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-paper/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 border border-accent-200 text-accent-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-ink tracking-tight">Privy Web3 Wallet</h2>
              <p className="text-xs text-ink-muted">Non-custodial Solana wallet &amp; stablecoin rails</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-muted hover:bg-ink/5 hover:text-ink transition"
            aria-label="Close wallet modal"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Wallet Address Bar */}
        <div className="bg-paper/70 px-6 py-3 border-b border-border flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="flex h-2 w-2 rounded-full bg-accent-500 animate-pulse shrink-0" />
            <span className="text-ink-muted font-mono truncate">{walletAddress}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={copyAddress}
              className="px-2.5 py-1 rounded-lg bg-surface border border-border hover:bg-paper text-ink font-medium transition flex items-center gap-1 text-xs"
            >
              {copied ? (
                <>
                  <svg className="h-3.5 w-3.5 text-accent-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
            {exportWallet && (
              <button
                onClick={() => exportWallet()}
                className="px-2.5 py-1 rounded-lg bg-accent-50 border border-accent-200 hover:bg-accent-100 text-accent-800 font-medium transition text-xs"
              >
                Export Keys
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-paper/30 px-6 pt-2 text-xs font-semibold overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Balances & Portfolio' },
            { id: 'onramp', label: 'On-Ramp (Buy)' },
            { id: 'offramp', label: 'Off-Ramp (Withdraw)' },
            { id: 'transfer', label: 'Send / Transfer' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as WalletTab);
                setTxSuccess(null);
              }}
              className={`mr-4 border-b-2 py-3 transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'border-accent-700 text-accent-700 font-bold'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {txSuccess && (
            <div className="rounded-xl bg-accent-50 border border-accent-200 p-3.5 text-xs text-accent-800 flex items-center gap-2 animate-in fade-in">
              <svg className="h-4 w-4 shrink-0 text-accent-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>{txSuccess}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-border bg-paper/60 p-4 space-y-1">
                  <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">USDC Balance</span>
                  <p className="text-xl font-bold text-ink font-mono">${usdcBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  <span className="text-[11px] text-accent-700 block">SPL Stablecoin</span>
                </div>

                <div className="rounded-xl border border-border bg-paper/60 p-4 space-y-1">
                  <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">cNGN Balance</span>
                  <p className="text-xl font-bold text-ink font-mono">${(cngnBalance / 1500).toFixed(2)}</p>
                  <span className="text-[11px] text-ink-muted block">₦250,000 cNGN</span>
                </div>

                <div className="rounded-xl border border-border bg-paper/60 p-4 space-y-1">
                  <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">SOL (Gas)</span>
                  <p className="text-xl font-bold text-ink font-mono">{solBalance} SOL</p>
                  <span className="text-[11px] text-ink-muted block">Solana Native</span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-paper/40 p-4 space-y-3">
                <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">Quick Wallet Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveTab('onramp')}
                  >
                    Deposit / On-Ramp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('offramp')}
                  >
                    Cash Out to Bank
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('transfer')}
                  >
                    Send Token
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ON-RAMP */}
          {activeTab === 'onramp' && (
            <form onSubmit={handleOnRamp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">Select Asset to Buy</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setToken('USDC')}
                    className={`rounded-xl p-3 border text-xs font-bold transition flex items-center justify-between ${
                      token === 'USDC'
                        ? 'border-accent-600 bg-accent-50 text-accent-900'
                        : 'border-border bg-paper/60 text-ink-muted'
                    }`}
                  >
                    <span>USDC (USD Stablecoin)</span>
                    <span>$1 = ₦1,500</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setToken('cNGN')}
                    className={`rounded-xl p-3 border text-xs font-bold transition flex items-center justify-between ${
                      token === 'cNGN'
                        ? 'border-accent-600 bg-accent-50 text-accent-900'
                        : 'border-border bg-paper/60 text-ink-muted'
                    }`}
                  >
                    <span>cNGN (Naira Token)</span>
                    <span>1 cNGN = ₦1</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">Amount ($ USD)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-border bg-paper/60 px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:bg-surface focus:border-accent-500 focus:outline-none"
                />
              </div>

              {amount && (
                <div className="rounded-xl bg-paper p-3 text-xs space-y-1 text-ink-muted border border-border">
                  <div className="flex justify-between">
                    <span>Estimated Fiat Payment:</span>
                    <span className="font-semibold text-ink">
                      ₦{(Number(amount) * (token === 'USDC' ? 1500 : 1)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network &amp; VASP Fee:</span>
                    <span className="font-semibold text-accent-700">Included</span>
                  </div>
                </div>
              )}

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={processing || !amount}
                className="w-full"
              >
                {processing ? 'Processing On-Ramp...' : `Pay & Deposit $${amount || '0'} ${token}`}
              </Button>
            </form>
          )}

          {/* TAB 3: OFF-RAMP */}
          {activeTab === 'offramp' && (
            <form onSubmit={handleOffRamp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">Select Destination Bank</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-paper/60 px-4 py-2.5 text-sm text-ink focus:bg-surface focus:border-accent-500 focus:outline-none"
                >
                  <option value="Kuda Bank">Kuda Bank</option>
                  <option value="GTBank">Guaranty Trust Bank (GTB)</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                  <option value="First Bank">First Bank Nigeria</option>
                  <option value="OPay">OPay Digital Services</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">Account Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2012345678"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full rounded-xl border border-border bg-paper/60 px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:bg-surface focus:border-accent-500 focus:outline-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">Amount to Cash Out ($ USD)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-border bg-paper/60 px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:bg-surface focus:border-accent-500 focus:outline-none"
                />
              </div>

              {amount && (
                <div className="rounded-xl bg-paper p-3 text-xs space-y-1 text-ink-muted border border-border">
                  <div className="flex justify-between">
                    <span>Naira Payout to Bank Account:</span>
                    <span className="font-semibold text-accent-700">
                      ₦{(Number(amount) * 1500).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={processing || !amount || !bankAccount}
                className="w-full"
              >
                {processing ? 'Processing Cash Out...' : `Confirm Cash Out ($${amount || '0'})`}
              </Button>
            </form>
          )}

          {/* TAB 4: TRANSFER */}
          {activeTab === 'transfer' && (
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">Recipient Solana Wallet Address / DID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7xKX...3bZq or user@example.com"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full rounded-xl border border-border bg-paper/60 px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:bg-surface focus:border-accent-500 focus:outline-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">Token to Send</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setToken('USDC')}
                    className={`rounded-xl p-3 border text-xs font-bold transition ${
                      token === 'USDC'
                        ? 'border-accent-600 bg-accent-50 text-accent-900'
                        : 'border-border bg-paper/60 text-ink-muted'
                    }`}
                  >
                    USDC (${usdcBalance})
                  </button>
                  <button
                    type="button"
                    onClick={() => setToken('cNGN')}
                    className={`rounded-xl p-3 border text-xs font-bold transition ${
                      token === 'cNGN'
                        ? 'border-accent-600 bg-accent-50 text-accent-900'
                        : 'border-border bg-paper/60 text-ink-muted'
                    }`}
                  >
                    cNGN (${(cngnBalance / 1500).toFixed(2)})
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">Amount ($ USD)</label>
                <input
                  type="number"
                  required
                  min="0.1"
                  placeholder="e.g. 25"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-border bg-paper/60 px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:bg-surface focus:border-accent-500 focus:outline-none"
                />
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={processing || !amount || !recipient}
                className="w-full"
              >
                {processing ? 'Signing Transaction...' : `Transfer $${amount || '0'} ${token}`}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
