import { useCookieConsent } from '../context/CookieConsentContext.jsx';
import { LEGAL } from '../data/legal.js';
import { useLanguage } from '../context/LanguageContext';

export function SiteFooter({ onNavigate, note }) {
  const { openBanner } = useCookieConsent();
  const { t } = useLanguage();

  return (
    <footer className="site-footer">
      <nav className="site-footer__nav" aria-label="Links legais">
        <button
          type="button"
          className="site-footer__link"
          onClick={() => onNavigate('/privacidade')}
        >
          {t('footerPrivacy')}
        </button>
        <button
          type="button"
          className="site-footer__link"
          onClick={() => onNavigate('/termos')}
        >
          {t('footerTerms')}
        </button>
        <button
          type="button"
          className="site-footer__link"
          onClick={openBanner}
        >
          {t('cookieDecline')}
        </button>
      </nav>
      <p className="site-footer__note">
        {note ?? (
          <>
            {LEGAL.siteName} — {t('footerDefaultNote')}{' '}
            <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>
          </>
        )}
      </p>
    </footer>
  );
}
