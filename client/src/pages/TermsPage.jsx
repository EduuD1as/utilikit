import { LegalLayout } from '../components/LegalLayout.jsx';
import { LEGAL } from '../data/legal.js';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../i18n/translations';

export function TermsPage({ onNavigate }) {
  const { language, t } = useLanguage();
  const content = translations[language].termsSections;

  return (
    <LegalLayout title={t('termsTitle')} onNavigate={onNavigate}>
      <p className="legal-page__meta">
        {t('termsLastUpdated')} {LEGAL.lastUpdated} · {LEGAL.siteUrl}
      </p>

      <p>{t('termsIntro')}</p>

      <h2>1. {content.use.title}</h2>
      <p>{content.use.content}</p>

      <h2>2. {content.ip.title}</h2>
      <p>{content.ip.content}</p>

      <h2>3. {content.disclaimer.title}</h2>
      <p>{content.disclaimer.content}</p>

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