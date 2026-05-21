import { useMemo, useState } from 'react';
import { CATEGORIES, TOOLS } from '../data/tools.js';
import { SiteHeader } from '../components/SiteHeader.jsx';
import { ToolCard } from '../components/ToolCard.jsx';

export function HomePage({ onNavigate }) {
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
          <p className="home-hero__eyebrow">Grátis · Sem cadastro · No navegador</p>
          <h1 className="home-hero__title">
            Ferramentas úteis,
            <span className="home-hero__title-accent"> num só lugar</span>
          </h1>
          <p className="home-hero__lead">
            Calculadoras, conversores, geradores e contadores para o dia a dia —
            rápidos, modernos e feitos para funcionar no celular.
          </p>

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
              placeholder="Buscar ferramenta…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar ferramentas"
            />
          </div>

          <div className="home-hero__stats">
            <div className="home-stat">
              <span className="home-stat__value">{TOOLS.length}</span>
              <span className="home-stat__label">ferramentas</span>
            </div>
            <div className="home-stat">
              <span className="home-stat__value">{availableCount}</span>
              <span className="home-stat__label">disponíveis</span>
            </div>
            <div className="home-stat">
              <span className="home-stat__value">{soonCount}</span>
              <span className="home-stat__label">em breve</span>
            </div>
          </div>
        </div>
      </section>

      <main className="home-main">
        <div className="home-filters" role="tablist" aria-label="Categorias">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={category === cat.id}
              className={`home-filter${category === cat.id ? ' home-filter--active' : ''}`}
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="home-empty">
            {category === 'soon'
              ? 'Nenhuma ferramenta em breve encontrada para essa busca.'
              : 'Nenhuma ferramenta encontrada. Tente outro termo ou categoria.'}
          </p>
        ) : (
          <div className="home-grid">
            {filtered.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onOpen={onNavigate} />
            ))}
          </div>
        )}
      </main>

      <footer className="site-footer">
        <p>
          UtiliKit — ferramentas em evolução. Novas utilidades são adicionadas
          regularmente.
        </p>
      </footer>
    </div>
  );
}
