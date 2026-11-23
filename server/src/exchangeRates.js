/**
 * Proxy com cache para a API Frankfurter (taxas de referência do BCE).
 * O cliente consulta a API pública direto; este proxy é a segunda opção,
 * útil quando a rede do usuário bloqueia o domínio externo.
 */
const API_BASE = 'https://api.frankfurter.dev/v1';
const CACHE_MS = 60 * 60 * 1000;
const TIMEOUT_MS = 10000;

const cache = new Map();

async function fetchJson(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Frankfurter respondeu ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function cached(key, loader) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value;
  const value = await loader();
  cache.set(key, { at: Date.now(), value });
  return value;
}

export function fetchCurrencyList() {
  return cached('currencies', () => fetchJson('/currencies'));
}

export function fetchRates(base) {
  const code = String(base || 'EUR').toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) {
    const error = new Error('Código de moeda inválido.');
    error.status = 400;
    return Promise.reject(error);
  }
  return cached(`latest:${code}`, () => fetchJson(`/latest?base=${code}`));
}
