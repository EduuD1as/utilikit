import { useCallback, useState, useEffect, useRef } from 'react';
import { Logo } from '../components/Logo.jsx';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { useLanguage } from '../context/LanguageContext';
import {
  SQL_DIALECTS,
  formatSqlQuery,
  minifySqlQuery,
} from '../lib/formatSql.js';
import hljs from 'highlight.js/lib/core';
import sql from 'highlight.js/lib/languages/sql';
import 'highlight.js/styles/vs2015.css';

hljs.registerLanguage('sql', sql);

const EXAMPLE = `select u.id,u.name,o.total from users u inner join orders o on o.user_id=u.id where o.status='paid' and o.created_at>=date '2024-01-01' order by o.total desc limit 10;`;

export function SqlFormatterPage({ onNavigate }) {
  const { t } = useLanguage();

  // State
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [dialect, setDialect] = useState('firebird');
  const [keywordCase, setKeywordCase] = useState('upper');
  const [tabWidth, setTabWidth] = useState(2);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const outputRef = useRef(null);

  // Vibration helper
  const vibrate = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  // Calculate stats
  const inputStats = {
    lines: input.split('\n').length,
    characters: input.length,
  };

  const outputStats = {
    lines: output.split('\n').length,
    characters: output.length,
  };

  // Format SQL
  const runFormat = useCallback(
    async (mode) => {
      const sql = input.trim();
      if (!sql) {
        setError(t('sqlEmptyError'));
        setOutput('');
        return;
      }

      setIsFormatting(true);

      // Simulate processing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));

      try {
        const result =
          mode === 'minify'
            ? minifySqlQuery(sql, { dialect })
            : formatSqlQuery(sql, { dialect, tabWidth, keywordCase });
        setOutput(result);
        setError(null);
        setToastMessage(t('sqlSuccess'));
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      } catch (err) {
        setError(err.message || t('sqlValidationError'));
        setOutput('');
      } finally {
        setIsFormatting(false);
      }
    },
    [input, dialect, tabWidth, keywordCase, t]
  );

  // Copy to clipboard
  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setToastMessage(t('copiedToClipboard'));
      setShowToast(true);
      vibrate();
      setTimeout(() => {
        setCopied(false);
        setShowToast(false);
      }, 2000);
    } catch {
      setError(t('errorCouldNotCopy'));
    }
  };

  // Download SQL file
  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToastMessage(t('download'));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // Clear all
  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
    setCopied(false);
  };

  // Load example
  const loadExample = () => {
    setInput(EXAMPLE);
    setOutput('');
    setError(null);
    setCopied(false);
  };

  // Keyboard shortcut (Ctrl+Enter to format)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runFormat('format');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input, dialect, tabWidth, keywordCase, runFormat]);

  // Apply syntax highlighting to output
  useEffect(() => {
    if (output && outputRef.current) {
      outputRef.current.innerHTML = hljs.highlight(output, { language: 'sql' }).value;
    }
  }, [output]);

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
              aria-label={t('backToTools')}
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

      <main className="panel generator-panel">
        {/* Toolbar */}
        <div className="sql-toolbar">
          <div className="sql-toolbar__field">
            <label className="sql-toolbar__label">{t('dialect')}</label>
            <div className="custom-select-wrapper">
              <select
                className="sql-toolbar__select"
                value={dialect}
                onChange={(e) => setDialect(e.target.value)}
                aria-label={t('dialect')}
              >
                {SQL_DIALECTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
              <svg className="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <div className="sql-toolbar__field">
            <label className="sql-toolbar__label">{t('keywords')}</label>
            <div className="custom-select-wrapper">
              <select
                className="sql-toolbar__select"
                value={keywordCase}
                onChange={(e) => setKeywordCase(e.target.value)}
                aria-label={t('keywords')}
              >
                <option value="upper">{t('uppercase')}</option>
                <option value="lower">{t('lowercase')}</option>
                <option value="preserve">{t('preserve')}</option>
              </select>
              <svg className="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <div className="sql-toolbar__field">
            <label className="sql-toolbar__label">{t('indentation')}</label>
            <div className="custom-select-wrapper">
              <select
                className="sql-toolbar__select"
                value={tabWidth}
                onChange={(e) => setTabWidth(Number(e.target.value))}
                aria-label={t('indentation')}
              >
                <option value={2}>{t('spaces2')}</option>
                <option value={4}>{t('spaces4')}</option>
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
              disabled={isFormatting}
              aria-label={t('formatButton')}
            >
              {isFormatting ? (
                <>
                  <span className="spinner"></span>
                  {t('sqlFormatting')}
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  {t('formatButton')}
                </>
              )}
            </button>

            <button
              type="button"
              className="btn-outline"
              onClick={() => runFormat('minify')}
              disabled={isFormatting}
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

        {/* Error Alert */}
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

        {/* Keyboard Shortcut Tip */}
        <div className="sql-tip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px', marginRight: '0.5rem' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          {t('sqlKeyboardShortcut')}
        </div>

        {/* SQL Editor */}
        <div className="sql-editor">
          {/* Input Pane */}
          <div className="sql-editor__pane">
            <div className="sql-editor__head">
              <span className="sql-editor__title">{t('sqlEditorInput')}</span>
              <div className="sql-editor__stats">
                <span>{inputStats.lines} {t('sqlLines')}</span>
                <span>•</span>
                <span>{inputStats.characters} {t('sqlCharacters')}</span>
              </div>
            </div>
            <textarea
              className="sql-editor__area"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('sqlEmptyInput')}
              spellCheck={false}
              aria-label={t('sqlEditorInput')}
            />
          </div>

          {/* Output Pane */}
          <div className="sql-editor__pane">
            <div className="sql-editor__head">
              <span className="sql-editor__title">{t('sqlEditorOutput')}</span>
              <div className="sql-editor__actions">
                {outputStats.lines > 0 && (
                  <div className="sql-editor__stats">
                    <span>{outputStats.lines} {t('sqlLines')}</span>
                    <span>•</span>
                    <span>{outputStats.characters} {t('sqlCharacters')}</span>
                  </div>
                )}
                {output && (
                  <>
                    <button
                      type="button"
                      className="btn-copy-mini"
                      onClick={handleCopy}
                      aria-label={t('copyButton')}
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
                    <button
                      type="button"
                      className="btn-copy-mini"
                      onClick={handleDownload}
                      aria-label={t('sqlDownload')}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
            <div
              ref={outputRef}
              className="sql-editor__area sql-editor__area--output sql-editor__area--highlighted"
              dangerouslySetInnerHTML={{ __html: output ? hljs.highlight(output, { language: 'sql' }).value : '' }}
            />
          </div>
        </div>

        {/* Security Notice */}
        <div className="security-notice">
          <div className="security-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div className="security-content">
            <strong>{t('securityTitle')}</strong>
            <p>{t('sqlSecurityNotice')}</p>
          </div>
        </div>
      </main>

      <SiteFooter
        onNavigate={onNavigate}
        note={t('sqlFormatterFooterNote')}
      />

      {/* Toast Notification */}
      {showToast && (
        <div className="toast toast--visible">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
