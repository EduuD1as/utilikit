import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { readJson, writeJson } from '../lib/storage.js';

const STORAGE_KEY = 'utilikit-cookie-consent';
const VERSION = 1;
const ADSENSE_CLIENT = (import.meta.env.VITE_ADSENSE_CLIENT || 'ca-pub-9872963703717031').trim();

const ConsentContext = createContext(null);

function readConsent() {
  const data = readJson(STORAGE_KEY);
  return data?.version === VERSION ? data : null;
}

let adsLoaded = false;

/** O script do AdSense só é carregado depois do consentimento de publicidade (LGPD). */
function loadAds() {
  if (adsLoaded || !ADSENSE_CLIENT || import.meta.env.DEV) return;
  adsLoaded = true;
  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`;
  document.head.appendChild(script);
}

export function ConsentProvider({ children }) {
  const [consent, setConsent] = useState(readConsent);
  const [bannerOpen, setBannerOpen] = useState(() => readConsent() === null);

  useEffect(() => {
    if (consent?.marketing) loadAds();
  }, [consent]);

  const save = useCallback((prefs) => {
    const data = {
      essential: true,
      analytics: Boolean(prefs.analytics),
      marketing: Boolean(prefs.marketing),
      version: VERSION,
      updatedAt: new Date().toISOString(),
    };
    writeJson(STORAGE_KEY, data);
    setConsent(data);
    setBannerOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      consent,
      bannerOpen,
      acceptAll: () => save({ analytics: true, marketing: true }),
      rejectAll: () => save({ analytics: false, marketing: false }),
      save,
      openBanner: () => setBannerOpen(true),
      closeBanner: () => setBannerOpen(false),
    }),
    [consent, bannerOpen, save]
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent precisa estar dentro de ConsentProvider');
  return ctx;
}
