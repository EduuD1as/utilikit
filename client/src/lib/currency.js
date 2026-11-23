/**
 * Cotações de referência do BCE via Frankfurter (aceita CORS, sem chave).
 * Ordem de tentativa: API pública → proxy do próprio servidor → tabela embutida.
 */
const PUBLIC_API = 'https://api.frankfurter.dev/v1';
const SERVER_API = `${import.meta.env.VITE_API_URL || ''}/api/currency`;
const CACHE_MS = 60 * 60 * 1000;
const TIMEOUT_MS = 8000;

/** Usada só quando nenhuma API responde. Base EUR, BCE em 23/11/2026. */
const FALLBACK = {
  date: '2026-11-23',
  rates: {
    EUR: 1,
    AUD: 1.6532,
    BRL: 6.5611,
    CAD: 1.5711,
    CHF: 0.9186,
    CNY: 7.2905,
    CZK: 24.455,
    DKK: 7.4746,
    GBP: 0.83673,
    HKD: 8.5772,
    HUF: 372.28,
    IDR: 19932.94,
    ILS: 3.6643,
    INR: 101.6395,
    ISK: 137.2,
    JPY: 174.01,
    KRW: 1475.51,
    MXN: 21.0528,
    MYR: 4.5101,
    NOK: 10.7285,
    NZD: 2.0079,
    PHP: 69.851,
    PLN: 4.4588,
    RON: 5.3483,
    SEK: 11.2375,
    SGD: 1.4124,
    THB: 37.242,
    TRY: 55.3405,
    USD: 1.0939,
    ZAR: 19.1513,
  },
};

export const POPULAR = ['BRL', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'MXN'];

const cache = new Map();

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Retorna todas as taxas em relação ao EUR (uma única chamada cobre qualquer par).
 * @returns {Promise<{ rates: Record<string, number>, date: string, source: 'live' | 'fallback' }>}
 */
export async function getRates({ force = false } = {}) {
  const cached = cache.get('EUR');
  if (!force && cached && Date.now() - cached.at < CACHE_MS) return cached.value;

  const candidates = [`${PUBLIC_API}/latest?base=EUR`, `${SERVER_API}/latest?from=EUR`];
  for (const url of candidates) {
    try {
      const data = await fetchJson(url);
      if (data?.rates) {
        const value = { rates: { ...data.rates, EUR: 1 }, date: data.date, source: 'live' };
        cache.set('EUR', { at: Date.now(), value });
        return value;
      }
    } catch {
      // Tenta a próxima fonte.
    }
  }
  return { ...FALLBACK, source: 'fallback' };
}

export function convert(amount, from, to, rates) {
  if (!rates[from] || !rates[to]) return null;
  return (amount / rates[from]) * rates[to];
}

export function currencyName(code, locale) {
  try {
    return new Intl.DisplayNames([locale], { type: 'currency' }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function formatMoney(value, currency, locale) {
  if (value == null || !Number.isFinite(value)) return '—';
  const digits = Math.abs(value) > 0 && Math.abs(value) < 1 ? 4 : 2;
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: digits,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}
