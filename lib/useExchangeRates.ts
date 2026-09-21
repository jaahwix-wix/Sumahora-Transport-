'use client';

import { useState, useEffect, useCallback } from 'react';
import { CurrencyCode } from './types';
import { EXCHANGE_RATES, updateLiveExchangeRates } from './data';

export interface ExchangeRatesData {
  rates: Record<CurrencyCode, number>;
  isLive: boolean;
  loading: boolean;
  lastUpdated: Date | null;
  source: string;
  refreshRates: () => Promise<void>;
  convert: (amount: number, from: CurrencyCode, to: CurrencyCode) => { raw: number; formatted: string };
}

export function useExchangeRates(): ExchangeRatesData {
  const [rates, setRates] = useState<Record<CurrencyCode, number>>({
    USD: EXCHANGE_RATES.USD.rate,
    NGN: EXCHANGE_RATES.NGN.rate,
    GHS: EXCHANGE_RATES.GHS.rate,
    SLE: EXCHANGE_RATES.SLE.rate,
    XOF: EXCHANGE_RATES.XOF.rate,
    GNF: EXCHANGE_RATES.GNF.rate,
  });
  const [isLive, setIsLive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [source, setSource] = useState<string>('ECOWAS Central Bank Parity');

  const fetchRates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/exchange-rates');
      if (res.ok) {
        const data = await res.json();
        if (data.rates) {
          const newRates: Record<CurrencyCode, number> = {
            USD: Number(data.rates.USD) || 1.0,
            NGN: Number(data.rates.NGN) || 1485.50,
            GHS: Number(data.rates.GHS) || 15.35,
            SLE: Number(data.rates.SLE) || 22.90,
            XOF: Number(data.rates.XOF) || 612.40,
            GNF: Number(data.rates.GNF) || 8690.00,
          };
          setRates(newRates);
          setIsLive(Boolean(data.isLive));
          setSource(data.source || 'Live ECOWAS Forex Feed');
          setLastUpdated(new Date());

          // Also update data.ts live cache so all system components reflect live rates
          updateLiveExchangeRates(newRates);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch real-time exchange rates, using cached rates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();

    // Auto-refresh rates every 5 minutes
    const interval = setInterval(() => {
      fetchRates();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchRates]);

  const convert = useCallback((amount: number, from: CurrencyCode, to: CurrencyCode) => {
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;
    // Normalize to USD then convert to target
    const amountInUSD = amount / fromRate;
    const raw = amountInUSD * toRate;

    const symbols: Record<CurrencyCode, string> = {
      USD: '$',
      NGN: '₦',
      GHS: '₵',
      SLE: 'Le ',
      XOF: 'CFA ',
      GNF: 'FG ',
    };

    let formatted = '';
    if (to === 'USD' || to === 'GHS') {
      formatted = `${symbols[to]}${raw.toFixed(2)}`;
    } else {
      formatted = `${symbols[to]}${Math.round(raw).toLocaleString()}`;
    }

    return { raw, formatted };
  }, [rates]);

  return {
    rates,
    isLive,
    loading,
    lastUpdated,
    source,
    refreshRates: fetchRates,
    convert,
  };
}
