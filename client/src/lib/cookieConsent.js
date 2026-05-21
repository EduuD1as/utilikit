const STORAGE_KEY = 'utilikit-cookie-consent';
const VERSION = 1;

/** @typedef {{ essential: boolean; analytics: boolean; marketing: boolean; version: number; updatedAt: string }} CookieConsent */

/** @returns {CookieConsent | null} */
export function readConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.version !== VERSION) return null;
    return data;
  } catch {
    return null;
  }
}

/** @param {Omit<CookieConsent, 'version' | 'updatedAt'>} prefs */
export function saveConsent(prefs) {
  /** @type {CookieConsent} */
  const data = {
    essential: true,
    analytics: Boolean(prefs.analytics),
    marketing: Boolean(prefs.marketing),
    version: VERSION,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent('utilikit:consent', { detail: data }));
  return data;
}

export function acceptAll() {
  return saveConsent({ essential: true, analytics: true, marketing: true });
}

export function rejectNonEssential() {
  return saveConsent({ essential: true, analytics: false, marketing: false });
}

export function hasAnswered() {
  return readConsent() != null;
}

export function allowsMarketing() {
  const c = readConsent();
  return Boolean(c?.marketing);
}

export function allowsAnalytics() {
  const c = readConsent();
  return Boolean(c?.analytics);
}
