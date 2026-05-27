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

      <main className="panel fx-panel">
        {error && (
          <div className="alert alert--error" role="alert">
            <span>{error}</span>
          </div>
        )}

        <div className="fx-converter">
          <div className="sql-toolbar">
            <div className="sql-toolbar__field">
              <label className="sql-toolbar__label">Espaçamento</label>
              <select
                className="sql-toolbar__select"
                value={tabWidth}
                onChange={(e) => setTabWidth(Number(e.target.value))}
              >
                <option value={2}>2 espaços</option>
                <option value={4}>4 espaços</option>
                <option value={8}>8 espaços</option>
              </select>
            </div>

            <div className="sql-toolbar__actions">
              <button
                type="button"
                className="search__btn"
                onClick={() => runFormat('format')}
              >
                Formatar
              </button>
              <button
                type="button"
                className="search__btn"
                onClick={() => runFormat('minify')}
              >
                Minificar
              </button>
              <button
                type="button"
                className="btn-ghost sql-toolbar__btn"
                onClick={loadExample}
              >
                {t('exampleButton')}
              </button>
              <button
                type="button"
                className="btn-ghost sql-toolbar__btn"
                onClick={handleClear}
              >
                {t('clearButton')}
              </button>
            </div>
          </div>

          <div className="sql-editor">
            <div className="sql-editor__pane">
              <div className="sql-editor__head">
                <span className="sql-editor__title">Entrada</span>
              </div>
              <textarea
                className="sql-editor__area"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Cole seu JSON aqui..."
              />
            </div>

            <div className="sql-editor__pane">
              <div className="sql-editor__head">
                <span className="sql-editor__title">Saída</span>
                {output && (
                  <button
                    type="button"
                    className="btn-ghost sql-editor__link"
                    onClick={handleCopy}
                  >
                    {copied ? t('copiedButton') : t('copyButton')}
                  </button>
                )}
              </div>
              <textarea
                className="sql-editor__area sql-editor__area--output"
                value={output}
                readOnly
                placeholder="O JSON formatado aparecerá aqui..."
              />
            </div>
          </div>

          {sizeInfo && (
            <div className="fx-meta" style={{ marginTop: '1.5rem' }}>
              <span>
                Original: {sizeInfo.original} bytes | Minificado: {sizeInfo.minified} bytes |
                {sizeInfo.saved > 0 && ` Economia: ${sizeInfo.saved}%`}
              </span>
            </div>
          )}
        </div>

        <p className="fx-disclaimer">
          Todo processamento ocorre localmente no seu navegador. Seus dados não são enviados para servidores.
        </p>
      </main>

      <SiteFooter
        onNavigate={onNavigate}
        note="Formatação de JSON executada no navegador."
      />
    </div>
  );
}
