import { useCallback, useState } from "react";
import { Logo } from "../components/Logo.jsx";
import { SiteFooter } from "../components/SiteFooter.jsx";
import { useLanguage } from "../context/LanguageContext";

export function CharacterCounterPage({ onNavigate }) {
  const { t } = useLanguage();
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
    <div className="app app--wordcount">
      <header className="hero">
        <div className="hero__brand">
          <Logo size={52} className="hero__logo" onNavigate={onNavigate} />
          <div>
            <button
              type="button"
              className="hero__back"
              onClick={() => onNavigate("/")}
              aria-label={t('backToTools')}
            >
              ← {t('backToTools')}
            </button>
            <h1>{t('characterCounterTitle')}</h1>
            <p className="hero__subtitle">
              {t('characterCounterSubtitle')}
            </p>
          </div>
        </div>
      </header>

      <main className="panel generator-panel">
        <div className="fx-converter">
          <div className="sql-toolbar">
            <div className="sql-toolbar__actions">
              <button
                type="button"
                className="btn-outline"
                onClick={handleLoadExample}
                aria-label={t('exampleButton')}
              >
                {t('exampleButton')}
              </button>
              <button
                type="button"
                className="btn-outline btn-outline--danger"
                onClick={handleClear}
                aria-label={t('clearButton')}
              >
                {t('clearButton')}
              </button>
            </div>
          </div>

          <div className="sql-editor">
            <div className="sql-editor__pane sql-editor__pane--full">
              <div className="sql-editor__head">
                <span className="sql-editor__title">
                  {t('typeOrPasteText')}
                </span>
              </div>
              <textarea
                className="sql-editor__area"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('characterCounterPlaceholder')}
                aria-label={t('typeOrPasteText')}
              />
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card__value">{stats.characters}</div>
              <div className="stat-card__label">{t('charactersLabel')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{stats.charactersNoSpaces}</div>
              <div className="stat-card__label">{t('noSpacesLabel')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{stats.words}</div>
              <div className="stat-card__label">{t('wordsLabel')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{stats.lines}</div>
              <div className="stat-card__label">{t('linesLabel')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{stats.paragraphs}</div>
              <div className="stat-card__label">{t('paragraphsLabel')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{stats.spaces}</div>
              <div className="stat-card__label">{t('spacesLabel')}</div>
            </div>
          </div>
        </div>

        <p className="fx-disclaimer">
          {t('characterCounterDisclaimer')}
        </p>
      </main>

      <SiteFooter onNavigate={onNavigate} note={t('realtimeCountingNote')} />
    </div>
  );
}
