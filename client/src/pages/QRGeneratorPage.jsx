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
    <div className="app">
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
            <h1>{t('qrGeneratorTitle')}</h1>
            <p className="hero__subtitle">
              {t('qrGeneratorSubtitle')}
            </p>
          </div>
        </div>
      </header>

      <main className="panel fx-panel">
        <div className="qr-container">
          <div className="qr-form">
            <div className="qr-form__group">
              <label className="qr-form__label">Texto ou URL</label>
              <textarea
                className="qr-form__input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite uma URL, texto ou dados..."
                rows={3}
              />
            </div>

            <div className="qr-form__row">
              <div className="qr-form__group">
                <label className="qr-form__label">Tamanho: {size}px</label>
                <input
                  type="range"
                  className="qr-form__range"
                  min="150"
                  max="500"
                  step="50"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                />
              </div>

              <div className="qr-form__group">
                <label className="qr-form__label">Nível de Correção</label>
                <select
                  className="qr-form__select"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option value="L">Baixa (7%)</option>
                  <option value="M">Médio (15%)</option>
                  <option value="Q">Elevado (25%)</option>
                  <option value="H">Alto (30%)</option>
                </select>
              </div>
            </div>

            <button className="search__btn" onClick={generateQR}>
              {t('generateButton')} QR Code
            </button>
          </div>

          {qrUrl && (
            <div className="qr-result">
              <div className="qr-result__preview">
                <img src={qrUrl} alt="QR Code" className="qr-result__image" />
              </div>

              <div className="qr-result__actions">
                <button className="search__btn" onClick={downloadQR}>
                  {t('download')}
                </button>
                <button className="search__btn" onClick={copyQRUrl}>
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
