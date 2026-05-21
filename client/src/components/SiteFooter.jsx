import { useCookieConsent } from '../context/CookieConsentContext.jsx';
import { LEGAL } from '../data/legal.js';

export function SiteFooter({ onNavigate, note }) {
  const { openBanner } = useCookieConsent();

  return (
    <footer className="site-footer">
      <nav className="site-footer__nav" aria-label="Links legais">
        <button
          type="button"
          className="site-footer__link"
          onClick={() => onNavigate('/privacidade')}
        >
          Privacidade
        </button>
        <button
          type="button"
          className="site-footer__link"
          onClick={() => onNavigate('/termos')}
        >
          Termos de Uso
        </button>
        <button
          type="button"
          className="site-footer__link"
          onClick={openBanner}
        >
          Preferências de cookies
        </button>
      </nav>
      <p className="site-footer__note">
        {note ?? (
          <>
            {LEGAL.siteName} — ferramentas em evolução. Dúvidas sobre dados:{' '}
            <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>
          </>
        )}
      </p>
    </footer>
  );
}
