import { useMemo, useState } from 'react';
import { CATEGORIES, searchTools } from '../data/tools.js';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { Link, useRouter } from '../context/RouterContext.jsx';
import { Icon } from '../components/Icon.jsx';

export default function HomePage() {
  const { t } = usePreferences();
  const { navigate } = useRouter();
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchTools(query, t), [query, t]);

  return (
    <div className="tool home">
      <header className="home__intro">
        <h1 className="home__title">{t('home.title')}</h1>
        <p className="home__lead">{t('home.lead')}</p>
        <label className="prompt">
          <span className="prompt__sign" aria-hidden="true">
            &gt;
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && results[0]) navigate(results[0].path);
            }}
            placeholder={t('home.filter')}
            aria-label={t('home.filter')}
            spellCheck={false}
            autoComplete="off"
          />
          <span className="prompt__count">{t('home.count', { n: results.length })}</span>
        </label>
      </header>

      {results.length === 0 && <p className="muted home__empty">{t('shell.noResults')}</p>}

      {CATEGORIES.map((category) => {
        const items = results.filter((tool) => tool.category === category);
        if (items.length === 0) return null;
        return (
          <section className="home__group" key={category} aria-labelledby={`cat-${category}`}>
            <h2 className="home__heading" id={`cat-${category}`}>
              {t(`categories.${category}`)}
            </h2>
            <ul className="home__list">
              {items.map((tool) => (
                <li key={tool.id}>
                  <Link to={tool.path} className="home__item">
                    <Icon name={tool.icon} size={18} />
                    <span className="home__name">{t(`tools.${tool.id}.name`)}</span>
                    <span className="home__desc">{t(`tools.${tool.id}.desc`)}</span>
                    <span className="home__path">{tool.path}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
