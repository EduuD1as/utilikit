import { useCallback, useState } from "react";
import { Logo } from "../components/Logo.jsx";
import { SiteFooter } from "../components/SiteFooter.jsx";

export function CharacterCounterPage({ onNavigate }) {
  const [text, setText] = useState("");

  const counts = useCallback(() => {
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.trim() ? text.split(/\n/).length : 0;
    const paragraphs = text.trim() ? text.split(/\n\n+/).length : 0;

    return {
      characters,
      charactersNoSpaces,
      words,
      lines,
      paragraphs,
      spaces: characters - charactersNoSpaces,
    };
  }, [text]);

  const stats = counts();

  const handleClear = () => {
    setText("");
  };

  const handleLoadExample = () => {
    setText(
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    );
  };

  return (
    <div className="app">
      <header className="hero">
        <div className="hero__brand">
          <Logo size={52} className="hero__logo" onNavigate={onNavigate} />
          <div>
            <button
              type="button"
              className="hero__back"
              onClick={() => onNavigate("/")}
            >
              ← Todas as ferramentas
            </button>
            <h1>Contador de Caracteres</h1>
            <p className="hero__subtitle">
              Conte caracteres, palavras, linhas e parágrafos em tempo real
            </p>
          </div>
        </div>
      </header>

      <main className="panel fx-panel">
        <div className="fx-converter">
          <div className="sql-toolbar">
            <div className="sql-toolbar__actions">
              <button
                type="button"
                className="btn-ghost sql-toolbar__btn"
                onClick={handleLoadExample}
              >
                Exemplo
              </button>
              <button
                type="button"
                className="btn-ghost sql-toolbar__btn"
                onClick={handleClear}
              >
                Limpar
              </button>
            </div>
          </div>

          <div className="sql-editor">
            <div className="sql-editor__pane sql-editor__pane--full">
              <div className="sql-editor__head">
                <span className="sql-editor__title">
                  Digite ou cole seu texto
                </span>
              </div>
              <textarea
                className="sql-editor__area"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Cole seu texto aqui para contar caracteres, palavras e muito mais..."
              />
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card__value">{stats.characters}</div>
              <div className="stat-card__label">Caracteres</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{stats.charactersNoSpaces}</div>
              <div className="stat-card__label">Sem espaços</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{stats.words}</div>
              <div className="stat-card__label">Palavras</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{stats.lines}</div>
              <div className="stat-card__label">Linhas</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{stats.paragraphs}</div>
              <div className="stat-card__label">Parágrafos</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{stats.spaces}</div>
              <div className="stat-card__label">Espaços</div>
            </div>
          </div>
        </div>

        <p className="fx-disclaimer">
          Toda contagem é feita localmente no seu navegador. Seus dados não são
          enviados para servidores.
        </p>
      </main>

      <SiteFooter onNavigate={onNavigate} note="Contagem em tempo real." />
    </div>
  );
}
