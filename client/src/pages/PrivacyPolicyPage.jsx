import { LegalLayout } from '../components/LegalLayout.jsx';
import { LEGAL } from '../data/legal.js';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../i18n/translations';

export function PrivacyPolicyPage({ onNavigate }) {
  const { language, t } = useLanguage();
  const content = translations[language].privacySections;

  return (
    <LegalLayout title={t('privacyTitle')} onNavigate={onNavigate}>
      <p className="legal-page__meta">
        {t('privacyLastUpdated')} {LEGAL.lastUpdated} · {LEGAL.siteUrl}
      </p>

      <p>{t('privacyIntro')}</p>

      <h2>1. {content.infoWeCollect.title}</h2>
      <p>{content.infoWeCollect.content}</p>

      <h2>2. {content.cookies.title}</h2>
      <p>{content.cookies.content}</p>

      <h2>3. {content.thirdParty.title}</h2>
      <p>{content.thirdParty.content}</p>

      <h2>4. {content.changes.title}</h2>
      <p>{content.changes.content}</p>

      <h2>5. {content.contact.title}</h2>
      <p>
        {content.contact.content}{' '}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>
      </p>
    </LegalLayout>
  );
}