const API_BASE = 'https://api.frankfurter.app';
const CACHE_MS = 60 * 60 * 1000;

/** @type {Map<string, { rates: Record<string, number>; date: string; fetchedAt: number }>} */
const rateCache = new Map();

/** @type {Record<string, string> | null} */
let currenciesCache = null;

async function apiFetch(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) {
    throw new Error(`Cotações indisponíveis (${res.status})`);
  }
  return res.json();
}

export async function fetchCurrencyList() {
  if (currenciesCache) return currenciesCache;
  currenciesCache = await apiFetch('/currencies');
  return currenciesCache;
}

export async function fetchRates(from) {
  const key = from.toUpperCase();
  const cached = rateCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_MS) {
    return cached;
  }

  const data = await apiFetch(`/latest?from=${encodeURIComponent(key)}`);
  const entry = {
    base: data.base,
    date: data.date,
    rates: data.rates ?? {},
    fetchedAt: Date.now(),
  };
  rateCache.set(key, entry);
  return entry;
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
