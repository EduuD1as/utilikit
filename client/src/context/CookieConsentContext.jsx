import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  acceptAll,
  hasAnswered,
  readConsent,
  rejectNonEssential,
  saveConsent,
} from '../lib/cookieConsent.js';
import { loadMarketingScripts } from '../lib/loadAds.js';

const CookieConsentContext = createContext(null);

export function CookieConsentProvider({ children }) {
  const [consent, setConsent] = useState(() => readConsent());
  const [bannerOpen, setBannerOpen] = useState(() => !hasAnswered());

  const applyConsent = useCallback((next) => {
    setConsent(next);
    setBannerOpen(false);
    if (next.marketing) loadMarketingScripts();
  }, []);

  useEffect(() => {
    if (consent?.marketing) loadMarketingScripts();
  }, [consent]);

  useEffect(() => {
    const onStorage = () => setConsent(readConsent());
    const onConsent = (e) => setConsent(e.detail);
    window.addEventListener('storage', onStorage);
    window.addEventListener('utilikit:consent', onConsent);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('utilikit:consent', onConsent);
    };
  }, []);

  const value = useMemo(
    () => ({
      consent,
      bannerOpen,
      acceptAll: () => applyConsent(acceptAll()),
      rejectNonEssential: () => applyConsent(rejectNonEssential()),
      savePreferences: (prefs) => applyConsent(saveConsent(prefs)),
      openBanner: () => setBannerOpen(true),
      closeBanner: () => setBannerOpen(false),
    }),
    [consent, bannerOpen, applyConsent]
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error('useCookieConsent deve ser usado dentro de CookieConsentProvider');
  }
  return ctx;
}
