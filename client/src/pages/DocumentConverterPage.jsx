import { useState } from 'react';
import { Logo } from '../components/Logo.jsx';
import { SiteFooter } from '../components/SiteFooter.jsx';
import {
  wordToPdf,
  pdfToWord,
  downloadBlob,
  formatFileSize,
} from '../lib/documentConverter.js';

export function DocumentConverterPage({ onNavigate }) {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('word-to-pdf');
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const acceptTypes = mode === 'word-to-pdf' ? '.docx,.doc,.odt' : '.pdf';
  const modeLabel = mode === 'word-to-pdf' ? 'Word → PDF' : 'PDF → Word';

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validSize = selectedFile.size <= 50 * 1024 * 1024; // 50MB
    if (!validSize) {
      setError('Arquivo muito grande. Máximo: 50MB');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(false);
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Selecione um arquivo para converter.');
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
        setError(`Erro: ${result.error}`);
      }
    } catch (err) {
      setError(`Erro ao converter: ${err.message}`);
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
            >
              ← Todas as ferramentas
            </button>
            <h1>Conversor de Documentos</h1>
            <p className="hero__subtitle">
              Converta entre Word e PDF com suporte local no navegador
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

        {success && (
          <div className="alert alert--success" role="alert">
            <span>✓ Arquivo convertido e baixado com sucesso!</span>
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
            >
              <span className="doc-mode-icon">📄</span>
              <span>Word para PDF</span>
            </button>
            <button
              type="button"
              className={`doc-mode-btn ${mode === 'pdf-to-word' ? 'doc-mode-btn--active' : ''}`}
              onClick={() => {
                setMode('pdf-to-word');
                handleClear();
              }}
            >
              <span className="doc-mode-icon">📋</span>
              <span>PDF para Word</span>
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
                {file ? file.name : `Arraste um arquivo ${modeLabel.split(' ')[0]}`}
              </h3>
              <p className="doc-upload__hint">
                {file
                  ? `${formatFileSize(file.size)} • ${mode === 'word-to-pdf' ? '.docx, .doc, .odt' : '.pdf'}`
                  : 'Máximo 50MB'}
              </p>
              <label className="doc-upload__input-wrapper">
                <input
                  type="file"
                  accept={acceptTypes}
                  onChange={handleFileSelect}
                  disabled={converting}
                  className="doc-upload__input"
                />
                <span className="search__btn">
                  {file ? 'Trocar arquivo' : 'Selecionar arquivo'}
                </span>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="doc-actions">
            <button
              type="button"
              className="search__btn"
              onClick={handleConvert}
              disabled={!file || converting}
            >
              {converting ? 'Convertendo...' : `Converter para ${mode === 'word-to-pdf' ? 'PDF' : 'Word'}`}
            </button>
            {file && (
              <button
                type="button"
                className="btn-ghost"
                onClick={handleClear}
                disabled={converting}
              >
                Limpar
              </button>
            )}
          </div>

          <div className="doc-info">
            <p className="doc-info__title">ℹ️ Informações</p>
            <ul className="doc-info__list">
              <li>
                <strong>Word → PDF:</strong> Converte documentos Word para PDF preservando o layout e formatação.
              </li>
              <li>
                <strong>PDF → Word:</strong> Extrai o texto do PDF e cria um documento Word. O layout pode não ser 100% preservado.
              </li>
              <li>
                <strong>Privacidade:</strong> Todo processamento ocorre localmente no seu navegador.
              </li>
              <li>
                <strong>Tamanho máximo:</strong> 50MB por arquivo.
              </li>
              <li>
                <strong>Compatibilidade:</strong> Funciona com .docx, .doc, .odt e .pdf.
              </li>
            </ul>
          </div>
        </div>

        <p className="fx-disclaimer">
          Todo processamento ocorre localmente no seu navegador. Seus dados não são enviados para servidores.
        </p>
      </main>

      <SiteFooter
        onNavigate={onNavigate}
        note="Conversão de documentos executada no navegador."
      />
    </div>
  );
}

