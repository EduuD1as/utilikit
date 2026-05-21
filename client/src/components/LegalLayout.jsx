import { SiteHeader } from './SiteHeader.jsx';
import { SiteFooter } from './SiteFooter.jsx';

export function LegalLayout({ title, children, onNavigate }) {
  return (
    <div className="legal-page">
      <SiteHeader onNavigate={onNavigate} variant="home" />
      <main className="legal-page__main">
        <button
          type="button"
          className="hero__back legal-page__back"
          onClick={() => onNavigate('/')}
        >
          ← Voltar ao início
        </button>
        <h1 className="legal-page__title">{title}</h1>
        <article className="legal-page__content">{children}</article>
      </main>
      <SiteFooter onNavigate={onNavigate} />
    </div>
  );
}
