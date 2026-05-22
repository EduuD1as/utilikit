const INTERNAL_API_BASE = import.meta.env.VITE_API_URL || '';
const FRANKFURTER_API_BASE = 'https://api.frankfurter.app';
const CACHE_MS = 60 * 60 * 1000;
const FALLBACK_DATE = '2026-05-21';
const FETCH_TIMEOUT_MS = 12000;

const FALLBACK_CURRENCIES = {
  AUD: 'Australian Dollar',
  BRL: 'Brazilian Real',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Renminbi Yuan',
  CZK: 'Czech Koruna',
  DKK: 'Danish Krone',
  EUR: 'Euro',
  GBP: 'British Pound',
  HKD: 'Hong Kong Dollar',
  HUF: 'Hungarian Forint',
  IDR: 'Indonesian Rupiah',
  ILS: 'Israeli New Shekel',
  INR: 'Indian Rupee',
  ISK: 'Icelandic Krona',
  JPY: 'Japanese Yen',
  KRW: 'South Korean Won',
  MXN: 'Mexican Peso',
  MYR: 'Malaysian Ringgit',
  NOK: 'Norwegian Krone',
  NZD: 'New Zealand Dollar',
  PHP: 'Philippine Peso',
  PLN: 'Polish Zloty',
  RON: 'Romanian Leu',
  SEK: 'Swedish Krona',
  SGD: 'Singapore Dollar',
  THB: 'Thai Baht',
  TRY: 'Turkish Lira',
  USD: 'United States Dollar',
  ZAR: 'South African Rand',
};

const FALLBACK_RATES_FROM_BRL = {
  AUD: 0.27992,
  BRL: 1,
  CAD: 0.27474,
  CHF: 0.15731,
  CNY: 1.3572,
  CZK: 4.1786,
  DKK: 1.2855,
  EUR: 0.17202,
  GBP: 0.14868,
  HKD: 1.5632,
  HUF: 62.017,
  IDR: 3527.02,
  ILS: 0.58178,
  INR: 19.1953,
  ISK: 24.667,
  JPY: 31.753,
  KRW: 301.03,
  MXN: 3.462,
  MYR: 0.7906,
  NOK: 1.8419,
  NZD: 0.34063,
  PHP: 12.2901,
  PLN: 0.73078,
  RON: 0.90197,
  SEK: 1.8684,
  SGD: 0.25541,
  THB: 6.5213,
  TRY: 9.1007,
  USD: 0.19952,
  ZAR: 3.3029,
};

/** @type {Map<string, { base: string; rates: Record<string, number>; date: string; fetchedAt: number; source: string }>} */
const rateCache = new Map();

/** @type {Record<string, string> | null} */
let currenciesCache = null;

function buildApiCandidates(path) {
  return [
    `${INTERNAL_API_BASE}/api/currency${path}`,
    `${FRANKFURTER_API_BASE}${path}`,
  ];
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!res.ok) {
      let message = `Cotações indisponíveis (${res.status})`;
      try {
        const data = await res.json();
        if (data?.error) message = data.error;
      } catch {
        // Keep the status-based message when the response is not JSON.
      }
      throw new Error(message);
    }

    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function apiFetch(path) {
  const errors = [];

  for (const url of buildApiCandidates(path)) {
    try {
      return await fetchJson(url);
    } catch (error) {
      errors.push(error);
    }
  }

  const lastError = errors.at(-1);
  throw new Error(
    lastError?.message === 'Failed to fetch'
      ? 'Não foi possível conectar ao serviço de cotações.'
      : lastError?.message || 'Não foi possível carregar as cotações.'
  );
}

function buildFallbackRates(from) {
  const base = from.toUpperCase();
  const baseRate = FALLBACK_RATES_FROM_BRL[base];

  if (!baseRate) {
    throw new Error(`Moeda ${base} não suportada.`);
  }

  const rates = Object.fromEntries(
    Object.entries(FALLBACK_RATES_FROM_BRL).map(([code, rate]) => [
      code,
      rate / baseRate,
    ])
  );

  rates[base] = 1;

  return {
    base,
    date: FALLBACK_DATE,
    rates,
    fetchedAt: Date.now(),
    source: 'fallback',
  };
}

function normalizeRates(data, fallbackBase) {
  const base = String(data.base || fallbackBase).toUpperCase();

  return {
    base,
    date: data.date || FALLBACK_DATE,
    rates: {
      ...(data.rates ?? {}),
      [base]: 1,
    },
    fetchedAt: Date.now(),
    source: data.source || 'frankfurter',
  };
}

export async function fetchCurrencyList() {
  if (currenciesCache) return currenciesCache;

  try {
    currenciesCache = await apiFetch('/currencies');
  } catch {
    currenciesCache = FALLBACK_CURRENCIES;
  }

  return currenciesCache;
}

export async function fetchRates(from) {
  const key = from.toUpperCase();
  const cached = rateCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_MS) {
    return cached;
  }

  try {
    const data = await apiFetch(`/latest?from=${encodeURIComponent(key)}`);
    const entry = normalizeRates(data, key);
    rateCache.set(key, entry);
    return entry;
  } catch {
    const entry = buildFallbackRates(key);
    rateCache.set(key, entry);
    return entry;
  }
}

export function convertAmount(amount, rates, to) {
  const rate = rates[to?.toUpperCase()];
  if (rate == null || !Number.isFinite(amount)) return null;
  return amount * rate;
}

export function formatMoney(value, currency, locale = 'pt-BR') {
  if (value == null || !Number.isFinite(value)) return '—';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}
