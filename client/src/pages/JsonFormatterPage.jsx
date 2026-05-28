import { useCallback, useState } from 'react';
import { Logo } from '../components/Logo.jsx';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { useLanguage } from '../context/LanguageContext';
import {
  formatJson,
  minifyJson,
  validateJson,
  getSizeInfo,
} from '../lib/formatJson.js';

const EXAMPLE = JSON.stringify({
  name: 'UtiliKit',
  version: '1.0.0',
  tools: [
    { id: 'json-formatter', name: 'Formatador de JSON' },
    { id: 'sql-formatter', name: 'Formatador de SQL' },
  ],
  settings: {
    theme: 'dark',
    notifications: true,
  },
});

export function JsonFormatterPage({ onNavigate }) {
  const { t } = useLanguage();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [tabWidth, setTabWidth] = useState(2);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [sizeInfo, setSizeInfo] = useState(null);

  const runFormat = useCallback(
    (mode) => {
      const json = input.trim();
      if (!json) {
        setError('Cole ou digite um JSON válido.');
        setOutput('');
        setSizeInfo(null);
        return;
      }

      const validation = validateJson(json);
      if (!validation.valid) {
        setError(`JSON inválido: ${validation.error}`);
        setOutput('');
        setSizeInfo(null);
        return;
      }

      try {
        const result = mode === 'minify' ? minifyJson(json) : formatJson(json, tabWidth);
        setOutput(result);
        setSizeInfo(getSizeInfo(json));
        setError(null);
      } catch (err) {
        setError(err.message || t('errorCouldNotProcessJSON') || 'Não foi possível processar o JSON.');
        setOutput('');
        setSizeInfo(null);
      }
    },
    [input, tabWidth]
  );

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(t('errorCouldNotCopy'));
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setSizeInfo(null);
    setError(null);
  };

  const loadExample = () => {
    setInput(EXAMPLE);
    setOutput('');
    setSizeInfo(null);
    setError(null);
  };

  return (
    <div className="app app--json">
      <header className="hero">
        <div className="hero__brand">
          <Logo size={52} className="hero__logo" onNavigate={onNavigate} />
          <div>
            <button
              type="button"
              className="hero__back"
              onClick={() => onNavigate('/')}
              aria-label={t('backToTools')}
            >
              ← {t('backToTools')}
            </button>
            <h1>{t('jsonFormatterTitle')}</h1>
            <p className="hero__subtitle">
              {t('jsonFormatterSubtitle')}
            </p>
          </div>
        </div>
      </header>

      <main className="panel generator-panel">
        {error && (
          <div className="alert alert--error" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px', marginRight: '0.5rem' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <div className="fx-converter">
          <div className="sql-toolbar">
            <div className="sql-toolbar__field">
              <label className="sql-toolbar__label">{t('spacing')}</label>
              <div className="custom-select-wrapper">
                <select
                  className="sql-toolbar__select"
                  value={tabWidth}
                  onChange={(e) => setTabWidth(Number(e.target.value))}
                  aria-label={t('spacing')}
                >
                  <option value={2}>{t('spaces2')}</option>
                  <option value={4}>{t('spaces4')}</option>
                  <option value={8}>{t('spaces8')}</option>
                </select>
                <svg className="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            <div className="sql-toolbar__actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => runFormat('format')}
                aria-label={t('formatButton')}
              >
                {t('formatButton')}
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => runFormat('minify')}
                aria-label={t('minifyButton')}
              >
                {t('minifyButton')}
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={loadExample}
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
            <div className="sql-editor__pane">
              <div className="sql-editor__head">
                <span className="sql-editor__title">{t('input')}</span>
              </div>
              <textarea
                className="sql-editor__area"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('placeholderJsonInput')}
                aria-label={t('input')}
              />
            </div>

            <div className="sql-editor__pane">
              <div className="sql-editor__head">
                <span className="sql-editor__title">{t('output')}</span>
                {output && (
                  <button
                    type="button"
                    className="btn-copy-mini"
                    onClick={handleCopy}
                    aria-label={t('copy')}
                  >
                    {copied ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
              <textarea
                className="sql-editor__area sql-editor__area--output"
                value={output}
                readOnly
                placeholder={t('placeholderJsonOutput')}
                aria-label={t('output')}
              />
            </div>
          </div>

          {sizeInfo && (
            <div className="fx-meta" style={{ marginTop: '1.5rem' }}>
              <span>
                Original: {sizeInfo.original} bytes | {t('minified')}: {sizeInfo.minified} bytes |
                {sizeInfo.saved > 0 && ` ${t('economy')}: ${sizeInfo.saved}%`}
              </span>
            </div>
          )}
        </div>

        <p className="fx-disclaimer">
          {t('jsonFormatterDisclaimer')}
        </p>
      </main>

      <SiteFooter
        onNavigate={onNavigate}
        note={t('jsonFormatterFooterNote')}
      />
    </div>
  );
}
