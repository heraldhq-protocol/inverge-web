export interface AfricanCurrency {
  code: string;           // e.g. 'NGN'
  name: string;           // e.g. 'Nigerian Naira'
  symbol: string;         // e.g. '₦'
  tokenSymbol: string;    // e.g. 'cNGN'
  tokenName: string;      // e.g. 'cNGN (Naira Token)'
  flag: string;           // e.g. '🇳🇬'
  country: string;        // e.g. 'Nigeria'
  ratePerUsd: number;     // e.g. 1500
  timezones: string[];    // e.g. ['Africa/Lagos']
  banks: string[];        // list of local banks / mobile money rails
}

export const AFRICAN_CURRENCIES: Record<string, AfricanCurrency> = {
  NGN: {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    tokenSymbol: 'cNGN',
    tokenName: 'cNGN (Naira Token)',
    flag: '🇳🇬',
    country: 'Nigeria',
    ratePerUsd: 1500,
    timezones: ['Africa/Lagos'],
    banks: ['Kuda Bank', 'GTBank', 'Zenith Bank', 'First Bank Nigeria', 'OPay Digital Services', 'Access Bank'],
  },
  KES: {
    code: 'KES',
    name: 'Kenyan Shilling',
    symbol: 'KSh',
    tokenSymbol: 'cKES',
    tokenName: 'cKES (Shilling Token)',
    flag: '🇰🇪',
    country: 'Kenya',
    ratePerUsd: 130,
    timezones: ['Africa/Nairobi'],
    banks: ['M-Pesa (Safaricom)', 'Equity Bank Kenya', 'KCB Bank', 'Co-operative Bank', 'NCBA Bank'],
  },
  GHS: {
    code: 'GHS',
    name: 'Ghanaian Cedi',
    symbol: 'GH₵',
    tokenSymbol: 'cGHS',
    tokenName: 'cGHS (Cedi Token)',
    flag: '🇬🇭',
    country: 'Ghana',
    ratePerUsd: 15.5,
    timezones: ['Africa/Accra'],
    banks: ['MTN Mobile Money', 'Telecel Cash', 'Ecobank Ghana', 'GCB Bank', 'Stanbic Bank Ghana'],
  },
  ZAR: {
    code: 'ZAR',
    name: 'South African Rand',
    symbol: 'R',
    tokenSymbol: 'ZAR',
    tokenName: 'ZAR (Rand Token)',
    flag: '🇿🇦',
    country: 'South Africa',
    ratePerUsd: 18.5,
    timezones: ['Africa/Johannesburg'],
    banks: ['Capitec Bank', 'Standard Bank', 'First National Bank (FNB)', 'Nedbank', 'Absa Bank'],
  },
  EGP: {
    code: 'EGP',
    name: 'Egyptian Pound',
    symbol: 'E£',
    tokenSymbol: 'EGP',
    tokenName: 'EGP (Pound Token)',
    flag: '🇪🇬',
    country: 'Egypt',
    ratePerUsd: 48.5,
    timezones: ['Africa/Cairo'],
    banks: ['Vodafone Cash', 'CIB Egypt', 'National Bank of Egypt (NBE)', 'Banque Misr', 'Fawry Cash'],
  },
  XOF: {
    code: 'XOF',
    name: 'West African CFA Franc',
    symbol: 'FCFA',
    tokenSymbol: 'XOF',
    tokenName: 'XOF (CFA Token)',
    flag: '🇸🇳',
    country: 'Senegal / Ivory Coast',
    ratePerUsd: 600,
    timezones: ['Africa/Dakar', 'Africa/Abidjan', 'Africa/Bamako'],
    banks: ['Wave Digital Wallet', 'Orange Money', 'MTN MoMo', 'Ecobank UMOA', 'Société Générale'],
  },
  UGX: {
    code: 'UGX',
    name: 'Ugandan Shilling',
    symbol: 'USh',
    tokenSymbol: 'UGX',
    tokenName: 'UGX (Shilling Token)',
    flag: '🇺🇬',
    country: 'Uganda',
    ratePerUsd: 3700,
    timezones: ['Africa/Kampala'],
    banks: ['MTN Mobile Money Uganda', 'Airtel Money Uganda', 'Stanbic Bank Uganda', 'Centenary Bank'],
  },
  RWF: {
    code: 'RWF',
    name: 'Rwandan Franc',
    symbol: 'FRw',
    tokenSymbol: 'RWF',
    tokenName: 'RWF (Franc Token)',
    flag: '🇷🇼',
    country: 'Rwanda',
    ratePerUsd: 1350,
    timezones: ['Africa/Kigali'],
    banks: ['MTN Mobile Money Rwanda', 'Airtel Money Rwanda', 'Bank of Kigali (BK)', 'I&M Bank Rwanda'],
  },
};

export function detectAfricanCurrency(): AfricanCurrency {
  if (typeof window === 'undefined') return AFRICAN_CURRENCIES.NGN;
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    for (const curr of Object.values(AFRICAN_CURRENCIES)) {
      if (curr.timezones.includes(tz)) return curr;
    }
  } catch {}
  return AFRICAN_CURRENCIES.NGN;
}
