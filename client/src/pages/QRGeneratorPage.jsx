import { useCallback, useState } from 'react';
import { Logo } from '../components/Logo.jsx';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { useLanguage } from '../context/LanguageContext';

export function QRGeneratorPage({ onNavigate }) {
  const { t } = useLanguage();
  const [input, setInput] = useState('https://utilikit.com');
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [size, setSize] = useState(300);
  const [level, setLevel] = useState('M');

  const generateQR = useCallback(() => {
    if (!input.trim()) return;

    const encodedInput = encodeURIComponent(input);
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedInput}&ecc=${level}`;
    setQrUrl(url);
  }, [input, size, level]);

  const downloadQR = () => {
    if (!qrUrl) return;

    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = 'qr-code.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyQRUrl = async () => {
    if (!qrUrl) return;
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  return (
    <div className="app app--qr">
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
            <h1>{t('qrGeneratorTitle')}</h1>
            <p className="hero__subtitle">
              {t('qrGeneratorSubtitle')}
            </p>
          </div>
        </div>
      </header>

      <main className="panel generator-panel">
        <div className="qr-container">
          <div className="qr-form">
            <div className="qr-form__group">
              <label className="qr-form__label">{t('textOrUrl')}</label>
              <textarea
                className="qr-form__input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('placeholderQrInput')}
                rows={3}
                aria-label={t('textOrUrl')}
              />
            </div>

            <div className="qr-form__row">
              <div className="qr-form__group">
                <label className="qr-form__label">{t('size')}: {size}px</label>
                <input
                  type="range"
                  className="qr-form__range"
                  min="150"
                  max="500"
                  step="50"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  aria-label={t('size')}
                />
              </div>

              <div className="qr-form__group">
                <label className="qr-form__label">{t('correctionLevel')}</label>
                <div className="custom-select-wrapper">
                  <select
                    className="qr-form__select"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    aria-label={t('correctionLevel')}
                  >
                    <option value="L">{t('low')}</option>
                    <option value="M">{t('medium')}</option>
                    <option value="Q">{t('high')}</option>
                    <option value="H">{t('veryHigh')}</option>
                  </select>
                  <svg className="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>

            <button className="btn-primary" onClick={generateQR} aria-label={t('generateButton')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              {t('generateButton')} QR Code
            </button>
          </div>

          {qrUrl && (
            <div className="qr-result">
              <div className="qr-result__preview">
                <img src={qrUrl} alt="QR Code" className="qr-result__image" />
              </div>

              <div className="qr-result__actions">
                <button className="btn-primary" onClick={downloadQR} aria-label={t('download')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {t('download')}
                </button>
                <button className="btn-outline" onClick={copyQRUrl} aria-label={t('copyUrl')}>
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
                  {copied ? t('copied') : t('copyUrl')}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="fx-disclaimer">
          {t('qrGeneratorDisclaimer')}
        </p>
      </main>

      <SiteFooter
        onNavigate={onNavigate}
        note={t('qrGeneratorDisclaimer')}
      />
    </div>
  );
}
