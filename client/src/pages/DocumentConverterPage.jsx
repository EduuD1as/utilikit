import { useState } from 'react';
import { Logo } from '../components/Logo.jsx';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { useLanguage } from '../context/LanguageContext';
import {
  wordToPdf,
  pdfToWord,
  downloadBlob,
  formatFileSize,
} from '../lib/documentConverter.js';

export function DocumentConverterPage({ onNavigate }) {
  const { t } = useLanguage();
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('word-to-pdf');
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const acceptTypes = mode === 'word-to-pdf' ? '.docx,.doc,.odt' : '.pdf';
  const modeLabel = mode === 'word-to-pdf' ? t('wordToPdfMode') : t('pdfToWordMode');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validSize = selectedFile.size <= 50 * 1024 * 1024; // 50MB
    if (!validSize) {
      setError(t('fileTooLarge'));
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(false);
  };

  const handleConvert = async () => {
    if (!file) {
      setError(t('selectFileToConvert'));
      return;
    }

    setConverting(true);
    setError(null);
    setSuccess(false);

    try {
      let result;
      if (mode === 'word-to-pdf') {
        result = await wordToPdf(file);
      } else {
        result = await pdfToWord(file);
      }

      if (result.success) {
        downloadBlob(result.blob, result.fileName);
        setSuccess(true);
        setFile(null);
        setError(null);
      } else {
        setError(`${t('errorPrefix')} ${result.error}`);
      }
    } catch (err) {
      setError(`${t('convertError')} ${err.message}`);
    } finally {
      setConverting(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="app app--converter">
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
            <h1>{t('documentConverterTitle')}</h1>
            <p className="hero__subtitle">
              {t('documentConverterSubtitle')}
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

        {success && (
          <div className="alert alert--success" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px', marginRight: '0.5rem' }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {t('fileConvertedSuccess')}
          </div>
        )}

        <div className="doc-converter">
          {/* Mode selector */}
          <div className="doc-mode-selector">
            <button
              type="button"
              className={`doc-mode-btn ${mode === 'word-to-pdf' ? 'doc-mode-btn--active' : ''}`}
              onClick={() => {
                setMode('word-to-pdf');
                handleClear();
              }}
              aria-label={t('wordToPdf')}
            >
              <span className="doc-mode-icon">📄</span>
              <span>{t('wordToPdf')}</span>
            </button>
            <button
              type="button"
              className={`doc-mode-btn ${mode === 'pdf-to-word' ? 'doc-mode-btn--active' : ''}`}
              onClick={() => {
                setMode('pdf-to-word');
                handleClear();
              }}
              aria-label={t('pdfToWord')}
            >
              <span className="doc-mode-icon">📋</span>
              <span>{t('pdfToWord')}</span>
            </button>
          </div>

          {/* File upload */}
          <div className="doc-upload">
            <div className="doc-upload__zone">
              <svg className="doc-upload__icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  d="M12 3v12m-6-6 6-6 6 6M3 18h18"
                />
              </svg>
              <h3 className="doc-upload__title">
                {file ? file.name : `${t('dragFile')} ${modeLabel.split(' ')[0]}`}
              </h3>
              <p className="doc-upload__hint">
                {file
                  ? `${formatFileSize(file.size)} • ${mode === 'word-to-pdf' ? '.docx, .doc, .odt' : '.pdf'}`
                  : t('maxFileSize')}
              </p>
              <label className="doc-upload__input-wrapper">
                <input
                  type="file"
                  accept={acceptTypes}
                  onChange={handleFileSelect}
                  disabled={converting}
                  className="doc-upload__input"
                />
                <span className="btn-primary">
                  {file ? t('changeFile') : t('selectFile')}
                </span>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="doc-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={handleConvert}
              disabled={!file || converting}
              aria-label={t('convertTo')}
            >
              {converting ? (
                <>
                  <span className="spinner"></span>
                  {t('converting')}
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  {t('convertTo')} {mode === 'word-to-pdf' ? t('pdf') : t('word')}
                </>
              )}
            </button>
            {file && (
              <button
                type="button"
                className="btn-outline btn-outline--danger"
                onClick={handleClear}
                disabled={converting}
                aria-label={t('clearButton')}
              >
                {t('clearButton')}
              </button>
            )}
          </div>

          <div className="doc-info">
            <p className="doc-info__title">{t('information')}</p>
            <ul className="doc-info__list">
              <li>
                <strong>Word → PDF:</strong> {t('wordToPdfDesc')}
              </li>
              <li>
                <strong>PDF → Word:</strong> {t('pdfToWordDesc')}
              </li>
              <li>
                <strong>{t('documentConverterPrivacy')}</strong> {t('documentConverterPrivacyText')}
              </li>
              <li>
                <strong>{t('maxSize')}</strong> {t('maxFileSizeValue')}
              </li>
              <li>
                <strong>{t('compatibility')}</strong> {t('compatibilityValue')}
              </li>
            </ul>
          </div>
        </div>

        <p className="fx-disclaimer">
          {t('localProcessingDisclaimer')}
        </p>
      </main>

      <SiteFooter
        onNavigate={onNavigate}
        note={t('documentConverterFooterNote')}
      />
    </div>
  );
}

