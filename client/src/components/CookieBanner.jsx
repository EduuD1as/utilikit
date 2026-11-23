import { useEffect, useState } from 'react';
import { useConsent } from '../context/ConsentContext.jsx';
import { useT } from '../context/PreferencesContext.jsx';
import { Link } from '../context/RouterContext.jsx';
import { Checkbox } from './ui.jsx';

export function CookieBanner() {
  const t = useT();
  const { bannerOpen, consent, acceptAll, rejectAll, save, closeBanner } = useConsent();
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!bannerOpen) return;
    setAnalytics(Boolean(consent?.analytics));
    setMarketing(Boolean(consent?.marketing));
    setDetails(Boolean(consent));
  }, [bannerOpen, consent]);

  if (!bannerOpen) return null;

  return (
    <section className="cookie" role="dialog" aria-labelledby="cookie-title" aria-describedby="cookie-text">
      <h2 id="cookie-title" className="cookie__title">
        {t('cookies.title')}
      </h2>
      <p id="cookie-text" className="cookie__text">
        {t('cookies.text')} <Link to="/privacidade">{t('legal.privacyTitle')}</Link>
      </p>

      {details && (
        <div className="cookie__prefs">
          <Checkbox label={t('cookies.essential')} checked disabled onChange={() => {}} />
          <Checkbox label={t('cookies.analytics')} checked={analytics} onChange={setAnalytics} />
          <Checkbox label={t('cookies.marketing')} checked={marketing} onChange={setMarketing} />
        </div>
      )}

      <div className="cookie__actions">
        {details ? (
          <button type="button" className="btn btn--primary" onClick={() => save({ analytics, marketing })}>
            {t('cookies.save')}
          </button>
        ) : (
          <button type="button" className="btn btn--primary" onClick={acceptAll}>
            {t('cookies.accept')}
          </button>
        )}
        <button type="button" className="btn" onClick={rejectAll}>
          {t('cookies.reject')}
        </button>
        {!details && (
          <button type="button" className="btn btn--ghost" onClick={() => setDetails(true)}>
            {t('cookies.customize')}
          </button>
        )}
        {consent && (
          <button type="button" className="btn btn--ghost" onClick={closeBanner}>
            {t('common.close')}
          </button>
        )}
      </div>
    </section>
  );
}
