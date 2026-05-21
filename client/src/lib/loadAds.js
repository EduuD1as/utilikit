/**
 * Carrega scripts de publicidade somente após consentimento de marketing (LGPD).
 * Defina VITE_ADSENSE_CLIENT=ca-pub-xxxxxxxx no .env quando o AdSense for aprovado.
 */
let loaded = false;

export function loadMarketingScripts() {
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT?.trim();
  if (!clientId || loaded) return;

  loaded = true;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}
