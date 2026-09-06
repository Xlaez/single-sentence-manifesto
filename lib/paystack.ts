import { ModifierType } from './types';

export type SupportedCurrency = 'USD' | 'NGN';

export const PRICING_CONFIG: Record<
  ModifierType,
  { usd: number; ngn: number; labelUsd: string; labelNgn: string }
> = {
  standard: {
    usd: 1.0,
    ngn: 1500,
    labelUsd: '$1.00',
    labelNgn: '₦1,500',
  },
  veto: {
    usd: 2.0,
    ngn: 3000,
    labelUsd: '$2.00',
    labelNgn: '₦3,000',
  },
  scream: {
    usd: 2.0,
    ngn: 3000,
    labelUsd: '$2.00',
    labelNgn: '₦3,000',
  },
  redacted: {
    usd: 1.0,
    ngn: 1500,
    labelUsd: '$1.00',
    labelNgn: '₦1,500',
  },
  period: {
    usd: 5.0,
    ngn: 7500,
    labelUsd: '$5.00',
    labelNgn: '₦7,500',
  },
};

export function getAmountInSubunits(modifier: ModifierType, currency: SupportedCurrency): number {
  const config = PRICING_CONFIG[modifier] || PRICING_CONFIG.standard;
  if (currency === 'USD') {
    // Paystack takes USD in cents (e.g. 100 = $1.00)
    return Math.round(config.usd * 100);
  }
  // Paystack takes NGN in kobo (e.g. 150000 = ₦1,500.00)
  return Math.round(config.ngn * 100);
}

export function getPriceDisplay(modifier: ModifierType, currency: SupportedCurrency): string {
  const config = PRICING_CONFIG[modifier] || PRICING_CONFIG.standard;
  return currency === 'USD' ? config.labelUsd : config.labelNgn;
}
