import { useCallback, useState } from "react";
import { Logo } from "../components/Logo.jsx";
import { SiteFooter } from "../components/SiteFooter.jsx";
import { useLanguage } from "../context/LanguageContext";

export function Base64EncoderPage({ onNavigate }) {
  const { t } = useLanguage();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("encode");

  const handleEncode = useCallback(() => {
    try {
      const encoded = btoa(input);
      setOutput(encoded);
    } catch (error) {
      setOutput("Error: Unable to encode input");
    }
  }, [input]);

  const handleDecode = useCallback(() => {
    try {
      const decoded = atob(input);
      setOutput(decoded);
    } catch (error) {
      setOutput("Error: Invalid Base64 input");
    }
  }, [input]);

  const handleConvert = useCallback(() => {
    if (mode === "encode") {
      handleEncode();
    } else {
      handleDecode();
    }
  }, [mode, handleEncode, handleDecode]);

  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleLoadExample = () => {
    setInput("Hello, World!");
    setMode("encode");
    setOutput(btoa("Hello, World!"));
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setOutput("");
  };

  return (
    <div className="app app--base64">
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
            <h1>{t('base64EncoderTitle')}</h1>
            <p className="hero__subtitle">
              {t('base64EncoderSubtitle')}
            </p>
          </div>
        </div>
      </header>

      <main className="panel generator-panel">
        <div className="fx-converter">
          <div className="sql-toolbar">
            <div className="sql-toolbar__field">
              <label className="sql-toolbar__label">{t('modeLabel')}</label>
              <select
                className="sql-toolbar__select"
                value={mode}
                onChange={(e) => handleModeChange(e.target.value)}
              >
                <option value="encode">{t('encodeMode')}</option>
                <option value="decode">{t('decodeMode')}</option>
              </select>
            </div>
            <div className="sql-toolbar__actions">
              <button
                type="button"
                className="btn-primary"
                onClick={handleConvert}
                aria-label={t('convertButton')}
              >
                {t('convertButton')}
              </button>
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
            <div className="sql-editor__pane">
              <div className="sql-editor__head">
                <span className="sql-editor__title">
                  {mode === "encode" ? t('inputLabel') : t('base64InputLabel')}
                </span>
              </div>
              <textarea
                className="sql-editor__area"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === "encode" ? t('inputPlaceholder') : t('base64InputPlaceholder')}
                aria-label={mode === "encode" ? t('inputLabel') : t('base64InputLabel')}
              />
            </div>

            <div className="sql-editor__pane">
              <div className="sql-editor__head">
                <span className="sql-editor__title">
                  {mode === "encode" ? t('base64OutputLabel') : t('outputLabel')}
                </span>
                {output && (
                  <div className="sql-editor__actions">
                    <button
                      type="button"
                      className="btn-copy-mini"
                      onClick={handleCopy}
                      aria-label={t('copyButton')}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <textarea
                className="sql-editor__area sql-editor__area--output"
                value={output}
                readOnly
                placeholder={mode === "encode" ? t('base64OutputPlaceholder') : t('outputPlaceholder')}
                aria-label={mode === "encode" ? t('base64OutputLabel') : t('outputLabel')}
              />
            </div>
          </div>
        </div>

        <p className="fx-disclaimer">
          {t('base64Disclaimer')}
        </p>
      </main>

      <SiteFooter onNavigate={onNavigate} />
    </div>
  );
}
