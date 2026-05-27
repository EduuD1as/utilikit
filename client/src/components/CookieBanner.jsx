import { useState } from 'react';
import { useCookieConsent } from '../context/CookieConsentContext.jsx';
import { useLanguage } from '../context/LanguageContext';

export function CookieBanner({ onNavigate }) {
  const { t } = useLanguage();
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
          {t('cookieTitle')}
        </h2>
        <p id="cookie-banner-desc" className="cookie-banner__text">
          {t('cookieMessage')}
        </p>

        {showDetails && (
          <div className="cookie-banner__prefs">
            <label className="cookie-banner__option cookie-banner__option--locked">
              <input type="checkbox" checked disabled />
              <span>
                <strong>{t('cookieEssential')}</strong>
              </span>
            </label>
            <label className="cookie-banner__option">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
              />
              <span>
                <strong>{t('cookieAnalytics')}</strong>
              </span>
            </label>
            <label className="cookie-banner__option">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
              />
              <span>
                <strong>{t('cookieMarketing')}</strong>
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
            {t('cookieAccept')}
          </button>
          <button
            type="button"
            className="btn-ghost cookie-banner__btn"
            onClick={rejectNonEssential}
          >
            {t('cookieDecline')}
          </button>
          {!showDetails ? (
            <button
              type="button"
              className="btn-ghost cookie-banner__btn"
              onClick={() => setShowDetails(true)}
            >
              {t('cookieCustomize')}
            </button>
          ) : (
            <button
              type="button"
              className="btn-ghost cookie-banner__btn"
              onClick={handleSaveCustom}
            >
              {t('cookieSavePreferences')}
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
            {t('footerPrivacy')}
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
            {t('footerTerms')}
          </button>
        </p>
      </div>
    </div>
  );
}
