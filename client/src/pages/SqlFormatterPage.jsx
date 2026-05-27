import { useCallback, useState } from 'react';
import { Logo } from '../components/Logo.jsx';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { useLanguage } from '../context/LanguageContext';
import {
  SQL_DIALECTS,
  formatSqlQuery,
  minifySqlQuery,
} from '../lib/formatSql.js';

const EXAMPLE = `select u.id,u.name,o.total from users u inner join orders o on o.user_id=u.id where o.status='paid' and o.created_at>=date '2024-01-01' order by o.total desc limit 10;`;

export function SqlFormatterPage({ onNavigate }) {
  const { t } = useLanguage();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [dialect, setDialect] = useState('sql');
  const [keywordCase, setKeywordCase] = useState('upper');
  const [tabWidth, setTabWidth] = useState(2);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const runFormat = useCallback(
    (mode) => {
      const sql = input.trim();
      if (!sql) {
        setError(t('errorPasteOrTypeSQL'));
        setOutput('');
        return;
      }

      try {
        const result =
          mode === 'minify'
            ? minifySqlQuery(sql, { dialect })
            : formatSqlQuery(sql, { dialect, tabWidth, keywordCase });
        setOutput(result);
        setError(null);
      } catch (err) {
        setError(err.message || t('errorCouldNotFormat'));
        setOutput('');
      }
    },
    [input, dialect, tabWidth, keywordCase]
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
    setError(null);
  };

  const loadExample = () => {
    setInput(EXAMPLE);
    setOutput('');
    setError(null);
  };

  return (
    <div className="app app--sql">
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
            <h1>{t('sqlFormatterTitle')}</h1>
            <p className="hero__subtitle">
              {t('sqlFormatterSubtitle')}
            </p>
          </div>
        </div>
      </header>

      <main className="panel">
        <div className="sql-toolbar">
          <label className="sql-toolbar__field">
            <span className="sql-toolbar__label">Dialeto</span>
            <select
              className="sql-toolbar__select"
              value={dialect}
              onChange={(e) => setDialect(e.target.value)}
            >
              {SQL_DIALECTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>

          <label className="sql-toolbar__field">
            <span className="sql-toolbar__label">Palavras-chave</span>
            <select
              className="sql-toolbar__select"
              value={keywordCase}
              onChange={(e) => setKeywordCase(e.target.value)}
            >
              <option value="upper">MAIÚSCULAS</option>
              <option value="lower">minúsculas</option>
              <option value="preserve">Preservar</option>
            </select>
          </label>

          <label className="sql-toolbar__field">
            <span className="sql-toolbar__label">Indentação</span>
            <select
              className="sql-toolbar__select"
              value={tabWidth}
              onChange={(e) => setTabWidth(Number(e.target.value))}
            >
              <option value={2}>2 espaços</option>
              <option value={4}>4 espaços</option>
            </select>
          </label>

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
              className="btn-ghost sql-toolbar__btn"
              onClick={() => runFormat('minify')}
            >
              Minificar
            </button>
            <button
              type="button"
              className="btn-ghost sql-toolbar__btn"
              onClick={handleCopy}
              disabled={!output}
            >
              {copied ? t('copiedButton') : t('copyButton')}
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

        {error && (
          <div className="alert alert--error" role="alert">
            {error}
          </div>
        )}

        <div className="sql-editor">
          <div className="sql-editor__pane">
            <div className="sql-editor__head">
              <span className="sql-editor__title">{t('input')}</span>
              <button
                type="button"
                className="btn-ghost sql-editor__link"
                onClick={loadExample}
              >
                Carregar exemplo
              </button>
            </div>
            <textarea
              className="sql-editor__area"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('placeholderSqlInput')}
              spellCheck={false}
            />
          </div>

          <div className="sql-editor__pane">
            <div className="sql-editor__head">
              <span className="sql-editor__title">{t('output')}</span>
              <span className="sql-editor__head-spacer" aria-hidden="true">
                {t('loadExample')}
              </span>
            </div>
            <textarea
              className="sql-editor__area sql-editor__area--output"
              value={output}
              readOnly
              placeholder={t('placeholderSqlOutput')}
              spellCheck={false}
            />
          </div>
        </div>
      </main>

      <SiteFooter
        onNavigate={onNavigate}
        note={t('sqlFormatterFooterNote')}
      />
    </div>
  );
}
