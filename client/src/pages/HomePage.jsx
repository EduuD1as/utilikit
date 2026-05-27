import { useMemo, useState } from 'react';
import { CATEGORIES, TOOLS } from '../data/tools.js';
import { SiteHeader } from '../components/SiteHeader.jsx';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { ToolCard } from '../components/ToolCard.jsx';
import { useLanguage } from '../context/LanguageContext';
import { categoryTranslations } from '../i18n/translations';

export function HomePage({ onNavigate }) {
  const { language, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((tool) => {
      const matchesAvailability =
        category === 'soon'
          ? !tool.available
          : category === 'all'
            ? tool.available
            : tool.available && tool.category === category;
      const matchesQuery =
        !q ||
        tool.title.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q);
      return matchesAvailability && matchesQuery;
    });
  }, [query, category]);

  const availableCount = TOOLS.filter((t) => t.available).length;
  const soonCount = TOOLS.length - availableCount;

  return (
    <div className="home">
      <SiteHeader onNavigate={onNavigate} />

      <section className="home-hero">
        <div className="home-hero__glow" aria-hidden="true" />
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">{t('homeHeroEyebrow')}</p>
          <h1 className="home-hero__title">
            {t('homeHeroTitle')}
            <span className="home-hero__title-accent">{t('homeHeroTitleAccent')}</span>
          </h1>
          <p className="home-hero__lead">{t('homeHeroLead')}</p>

          <div className="home-hero__search">
            <svg className="home-hero__search-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-5-5"
              />
            </svg>
            <input
              type="search"
              className="home-hero__search-input"
              placeholder={t('homeHeroSearchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t('homeHeroSearchLabel')}
            />
          </div>
        </div>
      </section>

      <main className="home-main">
        <div className="home-filters" role="tablist" aria-label={t('homeFiltersLabel')}>
          {CATEGORIES.map((cat) => {
            const translatedLabel = categoryTranslations[language][cat.id] || cat.label;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={category === cat.id}
                className={`home-filter${category === cat.id ? ' home-filter--active' : ''}`}
                onClick={() => setCategory(cat.id)}
              >
                {translatedLabel}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <p className="home-empty">
            {category === 'soon'
              ? t('homeEmptySoon')
              : t('homeEmpty')}
          </p>
        ) : (
          <div className="home-grid">
            {filtered.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onOpen={onNavigate} />
            ))}
          </div>
        )}
      </main>

      <SiteFooter onNavigate={onNavigate} />
    </div>
  );
}
