import { usePreferences } from '../context/PreferencesContext.jsx';
import { translations } from '../i18n/translations.js';

const CONTACT_EMAIL = 'privacidade@utilikit.com.br';

export default function LegalPage({ kind }) {
  const { t, language } = usePreferences();
  const legal = translations[language].legal;
  const sections = kind === 'privacy' ? legal.privacySections : legal.termsSections;

  return (
    <article className="tool legal">
      <h1 className="tool-header__title">{kind === 'privacy' ? legal.privacyTitle : legal.termsTitle}</h1>
      <p className="muted">{t('legal.updated', { date: legal.updatedAt })}</p>
      <p>{kind === 'privacy' ? legal.privacyIntro : legal.termsIntro}</p>
      {sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <p>{section.text}</p>
        </section>
      ))}
      <p>
        {t('legal.contact')} <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </article>
  );
}
