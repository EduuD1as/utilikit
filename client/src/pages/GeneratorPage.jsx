import { useCallback, useState } from 'react';
import { Logo } from '../components/Logo.jsx';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { useLanguage } from '../context/LanguageContext';
import crypto from 'crypto';

export function GeneratorPage({ onNavigate }) {
  const { t } = useLanguage();
  const [generatedId, setGeneratedId] = useState('');
  const [generatedHash, setGeneratedHash] = useState('');
  const [hashInput, setHashInput] = useState('');
  const [hashType, setHashType] = useState('sha256');
  const [copiedId, setCopiedId] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [idCount, setIdCount] = useState(1);
  const [generatedIds, setGeneratedIds] = useState([]);

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const generateRandomString = (length = 16) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGenerateUUID = useCallback(() => {
    const ids = Array(parseInt(idCount) || 1).fill(0).map(() => generateUUID());
    setGeneratedIds(ids);
    setGeneratedId(ids[0]);
  }, [idCount]);

  const handleGenerateString = useCallback(() => {
    const ids = Array(parseInt(idCount) || 1).fill(0).map(() => generateRandomString(16));
    setGeneratedIds(ids);
    setGeneratedId(ids[0]);
  }, [idCount]);

  const computeHash = (text, type) => {
    // Simulated hash since crypto is browser-based
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    // For browser, we'll use a simple approach with SHA-256 via SubtleCrypto
    // or fallback to a basic hash
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      return hashWithSubtleCrypto(text, type);
    }

    return simpleHash(text);
  };

  const simpleHash = (text) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  };

  const hashWithSubtleCrypto = async (text, type) => {
    try {
      const alg = type === 'sha256' ? 'SHA-256' : type === 'sha1' ? 'SHA-1' : 'SHA-512';
      const buffer = await crypto.subtle.digest(alg, new TextEncoder().encode(text));
      const hashArray = Array.from(new Uint8Array(buffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return simpleHash(text);
    }
  };

  const handleComputeHash = async () => {
    if (!hashInput.trim()) return;

    const hash = await computeHash(hashInput, hashType);
    setGeneratedHash(hash);
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'id') {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      } else {
        setCopiedHash(true);
        setTimeout(() => setCopiedHash(false), 2000);
      }
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
            <h1>{t('generatorTitle')}</h1>
            <p className="hero__subtitle">
              {t('generatorSubtitle')}
            </p>
          </div>
        </div>
      </header>

      <main className="panel fx-panel">
        <div className="generator-container">
          <div className="generator-section">
            <h2 className="generator-title">Gerador de IDs</h2>

            <div className="generator-form">
              <div className="generator-form__group">
                <label className="generator-form__label">Quantidade: {idCount}</label>
                <input
                  type="range"
                  className="generator-form__range"
                  min="1"
                  max="10"
                  value={idCount}
                  onChange={(e) => setIdCount(e.target.value)}
                />
              </div>

              <div className="generator-form__buttons">
                <button className="search__btn" onClick={handleGenerateUUID}>
                  Gerar UUID
                </button>
                <button className="search__btn" onClick={handleGenerateString}>
                  Gerar String Aleatória
                </button>
              </div>
            </div>

            {generatedIds.length > 0 && (
              <div className="generator-result">
                <div className="generator-result__primary">
                  <input
                    type="text"
                    className="generator-result__input"
                    value={generatedId}
                    readOnly
                  />
                  <button
                    className="search__btn"
                    onClick={() => copyToClipboard(generatedId, 'id')}
                  >
                    {copiedId ? '✓ Copiado!' : 'Copiar'}
                  </button>
                </div>

                {generatedIds.length > 1 && (
                  <div className="generator-result__list">
                    <h3>Todos os IDs gerados</h3>
                    <div className="generator-result__items">
                      {generatedIds.map((id, idx) => (
                        <div key={idx} className="generator-result__item">
                          <code>{id}</code>
                          <button
                            className="btn-ghost"
                            onClick={() => copyToClipboard(id, 'id')}
                          >
                            📋
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="generator-divider"></div>

          <div className="generator-section">
            <h2 className="generator-title">Gerador de Hash</h2>

            <div className="generator-form">
              <div className="generator-form__group">
                <label className="generator-form__label">Texto</label>
                <textarea
                  className="generator-form__textarea"
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  placeholder="Digite o texto para gerar hash..."
                  rows={3}
                />
              </div>

              <div className="generator-form__group">
                <label className="generator-form__label">Tipo de Hash</label>
                <select
                  className="generator-form__select"
                  value={hashType}
                  onChange={(e) => setHashType(e.target.value)}
                >
                  <option value="sha256">SHA-256</option>
                  <option value="sha1">SHA-1</option>
                  <option value="sha512">SHA-512</option>
                </select>
              </div>

              <button className="search__btn" onClick={handleComputeHash}>
                Gerar Hash
              </button>
            </div>

            {generatedHash && (
              <div className="generator-result">
                <div className="generator-result__primary">
                  <input
                    type="text"
                    className="generator-result__input"
                    value={generatedHash}
                    readOnly
                  />
                  <button
                    className="search__btn"
                    onClick={() => copyToClipboard(generatedHash, 'hash')}
                  >
                    {copiedHash ? t('copied') : t('copy')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="fx-disclaimer">
          {t('generatorDisclaimer')}
        </p>
      </main>

      <SiteFooter
        onNavigate={onNavigate}
        note={t('generatorFooterNote')}
      />
    </div>
  );
}
