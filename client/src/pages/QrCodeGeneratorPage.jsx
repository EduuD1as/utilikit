import { useRef, useState } from 'react';
import QRCode from 'qrcode.react';
import { Logo } from '../components/Logo.jsx';
import { SiteFooter } from '../components/SiteFooter.jsx';

export function QrCodeGeneratorPage({ onNavigate }) {
  const [inputValue, setInputValue] = useState('https://example.com');
  const [qrMode, setQrMode] = useState('url');
  const [errorSize, setErrorSize] = useState('256');
  const qrRef = useRef();

  const getModeConfig = () => {
    const configs = {
      url: {
        label: 'URL',
        placeholder: 'https://example.com',
        icon: '🔗',
      },
      text: {
        label: 'Texto',
        placeholder: 'Digite qualquer texto...',
        icon: '📝',
      },
      email: {
        label: 'Email',
        placeholder: 'seu@email.com',
        icon: '✉️',
      },
      phone: {
        label: 'Telefone',
        placeholder: '+55 11 9 8765-4321',
        icon: '📱',
      },
      wifi: {
        label: 'WiFi',
        placeholder: 'SSID;senha',
        icon: '📶',
      },
      contact: {
        label: 'Contato VCard',
        placeholder: 'Nome;Telefone;Email',
        icon: '👤',
      },
    };
    return configs[qrMode] || configs.url;
  };

  const formatQRData = () => {
    const value = inputValue.trim();
    if (!value) return '';

    switch (qrMode) {
      case 'email':
        return `mailto:${value}`;
      case 'phone':
        return `tel:${value.replace(/\D/g, '')}`;
      case 'wifi':
        const [ssid, password] = value.split(';');
        if (ssid && password) {
          return `WIFI:T:WPA;S:${ssid};P:${password};;`;
        }
        return value;
      case 'contact':
        const [name, phone, email] = value.split(';');
        if (name) {
          return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\n${phone ? `TEL:${phone}\n` : ''}${
            email ? `EMAIL:${email}\n` : ''
          }END:VCARD`;
        }
        return value;
      default:
        return value;
    }
  };

  const downloadQR = (format) => {
    if (!qrRef.current) return;

    const qrElement = qrRef.current.querySelector('canvas') || qrRef.current.querySelector('svg');
    if (!qrElement) return;

    const link = document.createElement('a');
    if (format === 'png' && qrElement instanceof HTMLCanvasElement) {
      link.href = qrElement.toDataURL('image/png');
      link.download = 'qr-code.png';
    } else if (format === 'svg') {
      const svg = qrRef.current.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          link.href = canvas.toDataURL('image/png');
          link.download = 'qr-code-svg.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        return;
      }
    }

    if (link.href) {
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const modes = ['url', 'text', 'email', 'phone', 'wifi', 'contact'];
  const config = getModeConfig();

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
            <h1>Gerador de QR Code</h1>
            <p className="hero__subtitle">
              Crie QR codes para URLs, texto, WiFi, contatos e mais
            </p>
          </div>
        </div>
      </header>

      <main className="panel fx-panel">
        <div className="qr-generator">
          {/* Mode selector */}
          <div className="qr-modes">
            {modes.map((mode) => {
              const modeConfig = {
                url: { label: 'URL', icon: '🔗' },
                text: { label: 'Texto', icon: '📝' },
                email: { label: 'Email', icon: '✉️' },
                phone: { label: 'Telefone', icon: '📱' },
                wifi: { label: 'WiFi', icon: '📶' },
                contact: { label: 'Contato', icon: '👤' },
              }[mode];

              return (
                <button
                  key={mode}
                  type="button"
                  className={`qr-mode-btn ${qrMode === mode ? 'qr-mode-btn--active' : ''}`}
                  onClick={() => {
                    setQrMode(mode);
                    setInputValue('');
                  }}
                >
                  <span>{modeConfig.icon}</span>
                  <span>{modeConfig.label}</span>
                </button>
              );
            })}
          </div>

          {/* Input section */}
          <div className="qr-input-section">
            <label className="form-label">{config.label}</label>
            <textarea
              className="form-textarea"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={config.placeholder}
              rows="3"
            />
          </div>

          {/* Size selector */}
          <div className="qr-size-section">
            <label className="form-label">Tamanho do QR Code</label>
            <div className="qr-size-controls">
              <input
                type="range"
                min="128"
                max="512"
                step="8"
                value={errorSize}
                onChange={(e) => setErrorSize(Number(e.target.value))}
                className="form-range"
              />
              <span className="qr-size-display">{errorSize}px</span>
            </div>
          </div>

          {/* QR Code display */}
          <div className="qr-display">
            {inputValue.trim() ? (
              <div className="qr-preview" ref={qrRef}>
                <QRCode
                  value={formatQRData() || inputValue}
                  size={Math.min(Number(errorSize), 300)}
                  level="H"
                  includeMargin
                />
              </div>
            ) : (
              <div className="qr-placeholder">
                <p>👆 Digite algo para gerar o QR Code</p>
              </div>
            )}
          </div>

          {/* Download buttons */}
          {inputValue.trim() && (
            <div className="qr-actions">
              <button
                type="button"
                className="search__btn"
                onClick={() => downloadQR('png')}
              >
                📥 Baixar como PNG
              </button>
              <button
                type="button"
                className="search__btn search__btn--secondary"
                onClick={() => {
                  const qrElement = qrRef.current?.querySelector('canvas');
                  if (qrElement) {
                    const link = document.createElement('a');
                    link.href = qrElement.toDataURL('image/png');
                    link.download = 'qr-code.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}
              >
                📋 Copiar para área de transferência
              </button>
            </div>
          )}

          <div className="qr-info">
            <p className="qr-info__title">ℹ️ Informações</p>
            <ul className="qr-info__list">
              <li>
                <strong>URL:</strong> Crie QR codes para websites e links
              </li>
              <li>
                <strong>Email:</strong> Gere QR codes que abrem o cliente de email
              </li>
              <li>
                <strong>Telefone:</strong> Crie QR codes para chamar números
              </li>
              <li>
                <strong>WiFi:</strong> Compartilhe credenciais de WiFi via QR code
              </li>
              <li>
                <strong>Contato VCard:</strong> Distribua informações de contato
              </li>
              <li>
                <strong>Privacidade:</strong> Tudo é processado localmente no seu navegador
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
        note="Gerador de QR Code executado no navegador."
      />
    </div>
  );
}
