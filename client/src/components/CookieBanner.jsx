import { useState } from 'react';
import { useCookieConsent } from '../context/CookieConsentContext.jsx';

export function CookieBanner({ onNavigate }) {
  const {
    bannerOpen,
    acceptAll,
    rejectNonEssential,
    savePreferences,
    closeBanner,
  } = useCookieConsent();
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  if (!bannerOpen) return null;

  const handleSaveCustom = () => {
    savePreferences({ essential: true, analytics, marketing });
    setShowDetails(false);
  };

  return (
    <div
      className="cookie-banner"
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
    >
      <div className="cookie-banner__panel">
        <h2 id="cookie-banner-title" className="cookie-banner__title">
          Privacidade e cookies
        </h2>
        <p id="cookie-banner-desc" className="cookie-banner__text">
          Usamos cookies essenciais para lembrar suas preferências. Com seu
          consentimento, também podemos usar cookies para análise e publicidade
          (Google AdSense). Você pode recusar os opcionais sem perder o uso das
          ferramentas.
        </p>

        {showDetails && (
          <div className="cookie-banner__prefs">
            <label className="cookie-banner__option cookie-banner__option--locked">
              <input type="checkbox" checked disabled />
              <span>
                <strong>Essenciais</strong> — necessários para o site funcionar
                (ex.: salvar esta escolha)
              </span>
            </label>
            <label className="cookie-banner__option">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
              />
              <span>
                <strong>Análise</strong> — métricas de uso para melhorar o site
              </span>
            </label>
            <label className="cookie-banner__option">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
              />
              <span>
                <strong>Publicidade</strong> — anúncios (Google AdSense)
              </span>
            </label>
          </div>
        )}

        <div className="cookie-banner__actions">
          <button
            type="button"
            className="search__btn cookie-banner__btn"
            onClick={acceptAll}
          >
            Aceitar todos
          </button>
          <button
            type="button"
            className="btn-ghost cookie-banner__btn"
            onClick={rejectNonEssential}
          >
            Apenas essenciais
          </button>
          {!showDetails ? (
            <button
              type="button"
              className="btn-ghost cookie-banner__btn"
              onClick={() => setShowDetails(true)}
            >
              Personalizar
            </button>
          ) : (
            <button
              type="button"
              className="btn-ghost cookie-banner__btn"
              onClick={handleSaveCustom}
            >
              Salvar preferências
            </button>
          )}
        </div>

        <p className="cookie-banner__links">
          <button
            type="button"
            className="cookie-banner__link"
            onClick={() => {
              closeBanner();
              onNavigate('/privacidade');
            }}
          >
            Política de Privacidade
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            className="cookie-banner__link"
            onClick={() => {
              closeBanner();
              onNavigate('/termos');
            }}
          >
            Termos de Uso
          </button>
        </p>
      </div>
    </div>
  );
}
