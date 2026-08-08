'use client';

import { useState, useEffect, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useCurrentUser } from '@/lib/auth/use-user';
import { Button } from '@/components/ui/button';
import { AFRICAN_CURRENCIES, detectAfricanCurrency } from '@/lib/currency/african-currencies';

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

  // Dynamic African currency selection (auto-detects Nigeria, Kenya, Ghana, South Africa, etc.)
  const [currencyCode, setCurrencyCode] = useState<string>(() => detectAfricanCurrency().code);
  const currency = AFRICAN_CURRENCIES[currencyCode] || AFRICAN_CURRENCIES.NGN;
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);

  // Balances state (simulated Web3 multi-asset balance)
  const [usdcBalance] = useState<number>(450.0);
  const [solBalance] = useState<number>(0.45);
  // Equivalent $166.67 USD in local token balance
  const localUsdEquivalent = 166.67;
  const localTokenBalance = localUsdEquivalent * currency.ratePerUsd;

  // Form states
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState<'USDC' | 'LOCAL'>('USDC');
  const [recipient, setRecipient] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState<string>(currency.banks[0] || 'Local Bank');
  const [processing, setProcessing] = useState(false);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(e.target as Node)) {
        setCurrencyDropdownOpen(false);
      }
    };
    if (currencyDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [currencyDropdownOpen]);

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

  const handleCurrencyChange = (newCode: string) => {
    setCurrencyCode(newCode);
    const newCurr = AFRICAN_CURRENCIES[newCode] || AFRICAN_CURRENCIES.NGN;
    setBankName(newCurr.banks[0] || 'Local Bank');
  };

  const selectedTokenName = token === 'USDC' ? 'USDC' : currency.tokenSymbol;

  const handleOnRamp = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTxSuccess(null);
    setTimeout(() => {
      setProcessing(false);
      setTxSuccess(`Successfully deposited $${amount} ${selectedTokenName} into your wallet!`);
      setAmount('');
    }, 1500);
  };

  const handleOffRamp = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTxSuccess(null);
    setTimeout(() => {
      setProcessing(false);
      setTxSuccess(`Successfully initiated cash out of $${amount} ${selectedTokenName} to ${bankName} (${bankAccount}).`);
      setAmount('');
    }, 1500);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTxSuccess(null);
    setTimeout(() => {
      setProcessing(false);
      setTxSuccess(`Transferred $${amount} ${selectedTokenName} to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`);
      setAmount('');
      setRecipient('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface shadow-lift text-ink flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border px-6 py-4 bg-paper/50 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 border border-accent-200 text-accent-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-ink tracking-tight">Privy Web3 Wallet</h2>
              <p className="text-xs text-ink-muted">Non-custodial Solana wallet &amp; African stablecoin rails</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Custom Interactive African Currency Selector Dropdown */}
            <div className="relative" ref={currencyDropdownRef}>
              <button
                type="button"
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-paper/80 px-3 py-1.5 text-xs font-semibold text-ink shadow-2xs hover:bg-surface hover:border-accent-500/40 transition cursor-pointer"
                title="Select Region / Fiat Currency"
              >
                <span>{currency.flag}</span>
                <span>{currency.code}</span>
                <span className="text-[11px] text-ink-muted">({currency.symbol})</span>
                <svg
                  className={`h-3.5 w-3.5 text-ink-muted transition-transform duration-200 ${
                    currencyDropdownOpen ? 'rotate-180 text-accent-700' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {currencyDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-border bg-surface p-1.5 shadow-lift text-ink animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted border-b border-border/80 mb-1 flex items-center justify-between">
                    <span>Select African Region</span>
                    <span className="text-accent-700 font-bold">8 Currencies</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-0.5 pr-0.5">
                    {Object.values(AFRICAN_CURRENCIES).map((curr) => {
                      const isSelected = curr.code === currencyCode;
                      return (
                        <button
                          key={curr.code}
                          type="button"
                          onClick={() => {
                            handleCurrencyChange(curr.code);
                            setCurrencyDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                            isSelected
                              ? 'bg-accent-50 text-accent-900 font-semibold ring-1 ring-accent-500/20'
                              : 'text-ink hover:bg-paper/80'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{curr.flag}</span>
                            <div>
                              <span className="font-medium text-ink block">{curr.country}</span>
                              <span className="text-[10px] text-ink-muted block">{curr.code} · {curr.name} ({curr.symbol})</span>
                            </div>
                          </div>
                          {isSelected && (
                            <svg className="h-4 w-4 text-accent-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
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
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">{currency.tokenSymbol} Balance</span>
                    <span className="text-xs">{currency.flag}</span>
                  </div>
                  <p className="text-xl font-bold text-ink font-mono">${localUsdEquivalent.toFixed(2)}</p>
                  <span className="text-[11px] text-ink-muted block">{currency.symbol}{Math.round(localTokenBalance).toLocaleString()} {currency.code}</span>
                </div>

                <div className="rounded-xl border border-border bg-paper/60 p-4 space-y-1">
                  <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">SOL (Gas)</span>
                  <p className="text-xl font-bold text-ink font-mono">{solBalance} SOL</p>
                  <span className="text-[11px] text-ink-muted block">Solana Native</span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-paper/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">Quick Wallet Actions</h3>
                  <span className="text-xs text-ink-muted">{currency.flag} {currency.name} ({currency.symbol})</span>
                </div>
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
                <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">Select Asset to Buy ({currency.flag} {currency.country})</label>
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
                    <span>$1 = {currency.symbol}{currency.ratePerUsd.toLocaleString()}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setToken('LOCAL')}
                    className={`rounded-xl p-3 border text-xs font-bold transition flex items-center justify-between ${
                      token === 'LOCAL'
                        ? 'border-accent-600 bg-accent-50 text-accent-900'
                        : 'border-border bg-paper/60 text-ink-muted'
                    }`}
                  >
                    <span>{currency.tokenName}</span>
                    <span>1 {currency.tokenSymbol} = {currency.symbol}1</span>
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
                    <span>Estimated Fiat Payment ({currency.code}):</span>
                    <span className="font-semibold text-ink">
                      {currency.symbol}{(Number(amount) * (token === 'USDC' ? currency.ratePerUsd : 1)).toLocaleString()}
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
                {processing ? 'Processing On-Ramp...' : `Pay & Deposit $${amount || '0'} ${selectedTokenName}`}
              </Button>
            </form>
          )}

          {/* TAB 3: OFF-RAMP */}
          {activeTab === 'offramp' && (
            <form onSubmit={handleOffRamp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">
                  Select Destination Bank / Provider ({currency.flag} {currency.country})
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-paper/60 px-4 py-2.5 text-sm text-ink focus:bg-surface focus:border-accent-500 focus:outline-none"
                >
                  {currency.banks.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">Account / Phone Number</label>
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
                    <span>{currency.name} Payout to {bankName}:</span>
                    <span className="font-semibold text-accent-700">
                      {currency.symbol}{(Number(amount) * currency.ratePerUsd).toLocaleString()} {currency.code}
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
                    onClick={() => setToken('LOCAL')}
                    className={`rounded-xl p-3 border text-xs font-bold transition ${
                      token === 'LOCAL'
                        ? 'border-accent-600 bg-accent-50 text-accent-900'
                        : 'border-border bg-paper/60 text-ink-muted'
                    }`}
                  >
                    {currency.tokenSymbol} (${localUsdEquivalent.toFixed(2)})
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
                {processing ? 'Signing Transaction...' : `Transfer $${amount || '0'} ${selectedTokenName}`}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

