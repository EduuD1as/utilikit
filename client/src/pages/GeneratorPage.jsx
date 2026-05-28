import { useCallback, useState, useEffect } from 'react';
import { Logo } from '../components/Logo.jsx';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { useLanguage } from '../context/LanguageContext';

export function GeneratorPage({ onNavigate }) {
  const { t } = useLanguage();

  // UUID State
  const [uuidCount, setUuidCount] = useState(1);
  const [generatedUuids, setGeneratedUuids] = useState([]);
  const [copiedUuidIndex, setCopiedUuidIndex] = useState(null);
  const [isGeneratingUuid, setIsGeneratingUuid] = useState(false);

  // String State
  const [stringLength, setStringLength] = useState(16);
  const [stringOptions, setStringOptions] = useState({
    numbers: true,
    uppercase: true,
    lowercase: true,
    symbols: false,
  });
  const [generatedString, setGeneratedString] = useState('');
  const [copiedString, setCopiedString] = useState(false);
  const [isGeneratingString, setIsGeneratingString] = useState(false);

  // Hash State
  const [hashInput, setHashInput] = useState('');
  const [hashType, setHashType] = useState('sha256');
  const [generatedHash, setGeneratedHash] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);
  const [isComputingHash, setIsComputingHash] = useState(false);

  // Toast State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Vibration helper
  const vibrate = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  // UUID Generation using Web Crypto API
  const generateUUID = useCallback(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }, []);

  const handleGenerateUUID = useCallback(async () => {
    setIsGeneratingUuid(true);
    // Simulate animation delay
    await new Promise(resolve => setTimeout(resolve, 300));
    const uuids = Array.from({ length: uuidCount }, () => generateUUID());
    setGeneratedUuids(uuids);
    setCopiedUuidIndex(null);
    setIsGeneratingUuid(false);
  }, [uuidCount, generateUUID]);

  const copyAllUuids = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedUuids.join('\n'));
      setCopiedUuidIndex('all');
      setToastMessage(t('copiedToClipboard'));
      setShowToast(true);
      vibrate();
      setTimeout(() => {
        setCopiedUuidIndex(null);
        setShowToast(false);
      }, 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  }, [generatedUuids, t, vibrate]);

  const copySingleUuid = useCallback(async (uuid, index) => {
    try {
      await navigator.clipboard.writeText(uuid);
      setCopiedUuidIndex(index);
      setToastMessage(t('copiedToClipboard'));
      setShowToast(true);
      vibrate();
      setTimeout(() => {
        setCopiedUuidIndex(null);
        setShowToast(false);
      }, 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  }, [t, vibrate]);

  const clearUuids = useCallback(() => {
    setGeneratedUuids([]);
    setCopiedUuidIndex(null);
  }, []);

  // String Generation using Web Crypto API
  const generateRandomString = useCallback(() => {
    let chars = '';
    if (stringOptions.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (stringOptions.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (stringOptions.numbers) chars += '0123456789';
    if (stringOptions.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!chars) return '';

    let result = '';
    const array = new Uint32Array(stringLength);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
      for (let i = 0; i < stringLength; i++) {
        result += chars[array[i] % chars.length];
      }
    } else {
      // Fallback
      for (let i = 0; i < stringLength; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    return result;
  }, [stringLength, stringOptions]);

  const handleGenerateString = useCallback(async () => {
    setIsGeneratingString(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    const str = generateRandomString();
    setGeneratedString(str);
    setCopiedString(false);
    setIsGeneratingString(false);
  }, [generateRandomString]);

  const copyString = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedString);
      setCopiedString(true);
      setToastMessage(t('copiedToClipboard'));
      setShowToast(true);
      vibrate();
      setTimeout(() => {
        setCopiedString(false);
        setShowToast(false);
      }, 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  }, [generatedString, t, vibrate]);

  const clearString = useCallback(() => {
    setGeneratedString('');
    setCopiedString(false);
  }, []);

  // Hash Generation using Web Crypto API
  const computeHash = async (text, type) => {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      try {
        const algorithm = type === 'sha1' ? 'SHA-1' : type === 'sha256' ? 'SHA-256' : type === 'sha512' ? 'SHA-512' : 'SHA-256';
        const buffer = await crypto.subtle.digest(algorithm, new TextEncoder().encode(text));
        const hashArray = Array.from(new Uint8Array(buffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch {
        return simpleHash(text);
      }
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

  const handleComputeHash = useCallback(async () => {
    if (!hashInput.trim()) return;
    setIsComputingHash(true);
    const hash = await computeHash(hashInput, hashType);
    setGeneratedHash(hash);
    setCopiedHash(false);
    setIsComputingHash(false);
  }, [hashInput, hashType]);

  const copyHash = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedHash);
      setCopiedHash(true);
      setToastMessage(t('copiedToClipboard'));
      setShowToast(true);
      vibrate();
      setTimeout(() => {
        setCopiedHash(false);
        setShowToast(false);
      }, 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  }, [generatedHash, t, vibrate]);

  const clearHash = useCallback(() => {
    setGeneratedHash('');
    setCopiedHash(false);
  }, []);

  // Auto-compute hash when input changes
  useEffect(() => {
    if (hashInput.trim()) {
      const timer = setTimeout(async () => {
        const hash = await computeHash(hashInput, hashType);
        setGeneratedHash(hash);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setGeneratedHash('');
    }
  }, [hashInput, hashType]);

  return (
    <div className="app app--generator">
      <header className="hero">
        <div className="hero__brand">
          <Logo size={52} className="hero__logo" onNavigate={onNavigate} />
          <div>
            <button
              type="button"
              className="hero__back"
              onClick={() => onNavigate('/')}
              aria-label="Voltar para ferramentas"
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

      <main className="panel generator-panel">
        <div className="generator-grid">
          {/* Left Panel - UUID & String */}
          <div className="generator-column">
            {/* UUID Section */}
            <section className="generator-section">
              <div className="section-header">
                <div className="section-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <div>
                  <h2>{t('uuidGeneratorTitle')}</h2>
                  <p className="section-subtitle">{t('uuidGeneratorSubtitle')}</p>
                </div>
              </div>

              <div className="section-controls">
                <div className="control-group">
                  <label className="control-label">
                    {t('uuidQuantity')}
                    <span className="control-badge">{uuidCount}</span>
                  </label>
                  <input
                    type="range"
                    className="custom-slider"
                    min="1"
                    max="10"
                    value={uuidCount}
                    onChange={(e) => setUuidCount(Number(e.target.value))}
                    aria-label="Quantidade de UUIDs"
                  />
                  <div className="slider-labels">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>

                <div className="section-actions">
                  <button
                    className="btn-primary"
                    onClick={handleGenerateUUID}
                    disabled={isGeneratingUuid}
                    aria-label={t('ariaLabelGenerateUUIDs')}
                  >
                    {isGeneratingUuid ? (
                      <>
                        <span className="spinner"></span>
                        {t('generating')}
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="23 4 23 10 17 10" />
                          <polyline points="1 20 1 14 7 14" />
                          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                        </svg>
                        {t('generateUUIDs')}
                      </>
                    )}
                  </button>
                  {generatedUuids.length > 0 && (
                    <>
                      <button
                        className="btn-outline"
                        onClick={copyAllUuids}
                        aria-label={t('ariaLabelCopyAllUUIDs')}
                      >
                        {copiedUuidIndex === 'all' ? (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {t('copied')}
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            {t('copyAll')}
                          </>
                        )}
                      </button>
                      <button
                        className="btn-outline btn-outline--danger"
                        onClick={clearUuids}
                        aria-label={t('ariaLabelClear')}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        {t('clear')}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {generatedUuids.length > 0 && (
                <div className="results-container">
                  {generatedUuids.map((uuid, idx) => (
                    <div key={idx} className="result-card" style={{ animationDelay: `${idx * 50}ms` }}>
                      <div className="result-content">
                        <code className="result-value">{uuid}</code>
                        <button
                          className="btn-copy-mini"
                          onClick={() => copySingleUuid(uuid, idx)}
                          aria-label={`${t('ariaLabelCopyUUID')} ${idx + 1}`}
                        >
                          {copiedUuidIndex === idx ? (
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* String Section */}
            <section className="generator-section">
              <div className="section-header">
                <div className="section-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <h2>{t('randomStringTitle')}</h2>
                  <p className="section-subtitle">{t('randomStringSubtitle')}</p>
                </div>
              </div>

              <div className="section-controls">
                <div className="control-group">
                  <label className="control-label">
                    {t('stringLength')}
                    <span className="control-badge">{stringLength}</span>
                  </label>
                  <input
                    type="range"
                    className="custom-slider"
                    min="4"
                    max="64"
                    value={stringLength}
                    onChange={(e) => setStringLength(Number(e.target.value))}
                    aria-label={t('ariaLabelStringLength')}
                  />
                  <div className="slider-labels">
                    <span>4</span>
                    <span>64</span>
                  </div>
                </div>

                <div className="control-group">
                  <label className="control-label">{t('characters')}</label>
                  <div className="checkbox-grid">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={stringOptions.numbers}
                        onChange={(e) => setStringOptions({ ...stringOptions, numbers: e.target.checked })}
                      />
                      <span className="checkbox-custom"></span>
                      <span>{t('includeNumbers')}</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={stringOptions.uppercase}
                        onChange={(e) => setStringOptions({ ...stringOptions, uppercase: e.target.checked })}
                      />
                      <span className="checkbox-custom"></span>
                      <span>{t('includeUppercase')}</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={stringOptions.lowercase}
                        onChange={(e) => setStringOptions({ ...stringOptions, lowercase: e.target.checked })}
                      />
                      <span className="checkbox-custom"></span>
                      <span>{t('includeLowercase')}</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={stringOptions.symbols}
                        onChange={(e) => setStringOptions({ ...stringOptions, symbols: e.target.checked })}
                      />
                      <span className="checkbox-custom"></span>
                      <span>{t('includeSymbols')}</span>
                    </label>
                  </div>
                </div>

                <div className="section-actions">
                  <button
                    className="btn-primary"
                    onClick={handleGenerateString}
                    disabled={isGeneratingString}
                    aria-label={t('ariaLabelGenerateString')}
                  >
                    {isGeneratingString ? (
                      <>
                        <span className="spinner"></span>
                        {t('generating')}
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="23 4 23 10 17 10" />
                          <polyline points="1 20 1 14 7 14" />
                          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                        </svg>
                        {t('generateString')}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {generatedString && (
                <div className="results-container">
                  <div className="result-card result-card--highlight">
                    <div className="result-content">
                      <code className="result-value result-value--large">{generatedString}</code>
                      <div className="result-actions">
                        <button
                          className="btn-copy-mini"
                          onClick={copyString}
                          aria-label={t('ariaLabelCopyString')}
                        >
                          {copiedString ? (
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
                          className="btn-copy-mini btn-copy-mini--danger"
                          onClick={clearString}
                          aria-label={t('ariaLabelClear')}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right Panel - Hash */}
          <div className="generator-column">
            <section className="generator-section">
              <div className="section-header">
                <div className="section-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h2>{t('hashGeneratorTitle')}</h2>
                  <p className="section-subtitle">{t('hashGeneratorSubtitle')}</p>
                </div>
              </div>

              <div className="section-controls">
                <div className="control-group">
                  <label className="control-label">{t('hashText')}</label>
                  <textarea
                    className="custom-textarea"
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                    placeholder={t('hashPlaceholder')}
                    rows={5}
                    aria-label={t('ariaLabelTextForHash')}
                  />
                </div>

                <div className="control-group">
                  <label className="control-label">{t('hashAlgorithm')}</label>
                  <div className="custom-select-wrapper">
                    <select
                      className="custom-select"
                      value={hashType}
                      onChange={(e) => setHashType(e.target.value)}
                      aria-label={t('ariaLabelHashType')}
                    >
                      <option value="sha256">{t('sha256Recommended')}</option>
                      <option value="sha512">{t('sha512Secure')}</option>
                      <option value="sha1">{t('sha1Compatibility')}</option>
                      <option value="md5">{t('md5Legacy')}</option>
                    </select>
                    <svg className="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>

              {generatedHash && (
                <div className="results-container">
                  <div className="result-card result-card--hash">
                    <div className="result-header">
                      <span className="result-label">{t('hashLabel')} {hashType.toUpperCase()}</span>
                    </div>
                    <div className="result-content">
                      <code className="result-value result-value--hash">{generatedHash}</code>
                      <div className="result-actions">
                        <button
                          className="btn-copy-mini"
                          onClick={copyHash}
                          aria-label={t('ariaLabelCopyHash')}
                        >
                          {copiedHash ? (
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
                          className="btn-copy-mini btn-copy-mini--danger"
                          onClick={clearHash}
                          aria-label={t('ariaLabelClear')}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                  <p>{t('securityText')}</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter
        onNavigate={onNavigate}
        note={t('generatorFooterNote')}
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
