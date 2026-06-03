import { useCallback, useState, useEffect, useMemo } from 'react';
import { Logo } from '../components/Logo.jsx';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { useLanguage } from '../context/LanguageContext';
import { CONVERSIONS } from '../data/conversions';

export function UnitConverterPage({ onNavigate }) {
  const { t, language } = useLanguage();

  const [inputValue, setInputValue] = useState('1');
  const [inputUnit, setInputUnit] = useState('m');
  const [outputUnit, setOutputUnit] = useState('km');
  const [category, setCategory] = useState('length');
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState('');

  const convertValue = useCallback(() => {
    // Handle empty input
    if (!inputValue || inputValue.trim() === '') {
      return '0';
    }

    const num = parseFloat(inputValue);

    // Validate input is a number
    if (isNaN(num)) {
      return '0';
    }

    // Check for infinity
    if (!isFinite(num)) {
      return '0';
    }

    // Special handling for fuel economy (inverse conversions)
    if (category === 'fuel') {
      return convertFuel(num, inputUnit, outputUnit);
    }

    // Special handling for temperature
    if (category === 'temperature') {
      return convertTemperature(num, inputUnit, outputUnit);
    }

    // Regular linear conversions
    const categoryData = CONVERSIONS[category];
    const inputFactor = categoryData.units[inputUnit]?.toBase;
    const outputFactor = categoryData.units[outputUnit]?.toBase;

    if (!inputFactor || !outputFactor) {
      return '0';
    }

    const baseValue = num * inputFactor;
    const result = baseValue / outputFactor;

    // Check for overflow
    if (!isFinite(result)) {
      return '0';
    }

    // Format result based on magnitude
    if (Math.abs(result) < 0.000001 || Math.abs(result) > 999999999) {
      return result.toExponential(6);
    }

    return parseFloat(result.toFixed(6)).toString();
  }, [inputValue, inputUnit, outputUnit, category, t]);

  // Handle error validation separately to avoid infinite loops
  useEffect(() => {
    setError('');

    if (!inputValue || inputValue.trim() === '') {
      return;
    }

    const num = parseFloat(inputValue);

    // Validate input is a number
    if (isNaN(num)) {
      setError(t('errorInvalidNumber'));
      return;
    }

    // Check for infinity
    if (!isFinite(num)) {
      setError(t('errorNumberTooLarge'));
      return;
    }

    // Check for conversion errors
    const categoryData = CONVERSIONS[category];
    if (category !== 'fuel' && category !== 'temperature') {
      const inputFactor = categoryData.units[inputUnit]?.toBase;
      const outputFactor = categoryData.units[outputUnit]?.toBase;
      if (!inputFactor || !outputFactor) {
        setError(t('errorConversionFailed'));
        return;
      }
    }
  }, [inputValue, inputUnit, outputUnit, category, t]);

  const convertTemperature = (value, fromUnit, toUnit) => {
    let celsius;

    // Convert to Celsius first
    if (fromUnit === 'c') {
      celsius = value;
    } else if (fromUnit === 'f') {
      celsius = (value - 32) * 5 / 9;
    } else if (fromUnit === 'k') {
      celsius = value - 273.15;
    }

    // Convert from Celsius to target
    let result;
    if (toUnit === 'c') {
      result = celsius;
    } else if (toUnit === 'f') {
      result = celsius * 9 / 5 + 32;
    } else if (toUnit === 'k') {
      result = celsius + 273.15;
    }

    // Check for absolute zero violation
    if (fromUnit === 'k' && value < 0) {
      return '0';
    }
    if (toUnit === 'k' && result < 0) {
      return '0';
    }

    // Format result
    if (Math.abs(result) < 0.0001 || Math.abs(result) > 999999) {
      return result.toExponential(4);
    }

    return parseFloat(result.toFixed(4)).toString();
  };

  const convertFuel = (value, fromUnit, toUnit) => {
    // Fuel economy conversions are inverse
    // Base: liters per 100km
    const toL100km = {
      l100km: (v) => v,
      kml: (v) => 100 / v,
      mpg: (v) => 235.215 / v,
      mpgus: (v) => 282.481 / v,
    };

    const fromL100km = {
      l100km: (v) => v,
      kml: (v) => 100 / v,
      mpg: (v) => 235.215 / v,
      mpgus: (v) => 282.481 / v,
    };

    if (value <= 0) {
      return '0';
    }

    const l100km = toL100km[fromUnit](value);
    const result = fromL100km[toUnit](l100km);

    if (!isFinite(result)) {
      return '0';
    }

    return parseFloat(result.toFixed(4)).toString();
  };

  const output = convertValue();

  const handleSwap = () => {
    setInputUnit(outputUnit);
    setOutputUnit(inputUnit);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setError(t('errorCopyFailed'));
    }
  };

  const handleCategoryChange = (key, data) => {
    setCategory(key);
    const units = Object.keys(data.units);
    setInputUnit(units[0]);
    setOutputUnit(units[1] || units[0]);
    setError('');
  };


  return (
    <div className="app app--unit">
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
            <h1>{t('unitConverterTitle')}</h1>
            <p className="hero__subtitle">
              {t('unitConverterSubtitle')}
            </p>
          </div>
        </div>
      </header>

      <main className="panel generator-panel">
        <div className="unit-converter">
          <div className="unit-categories">
            {Object.entries(CONVERSIONS).map(([key, data]) => (
              <button
                key={key}
                className={`unit-category-btn ${category === key ? 'unit-category-btn--active' : ''}`}
                onClick={() => handleCategoryChange(key, data)}
                aria-label={t(data.name)}
                aria-pressed={category === key}
                role="button"
              >
                <span aria-hidden="true">{getCategoryIcon(key)}</span>
                {t(data.name)}
              </button>
            ))}
          </div>

          <div className="unit-conversion-section">
            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            <div className="conversion-box">
              <div className="conversion-input-group">
                <input
                  type="number"
                  className="converter-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t('placeholderZero')}
                  aria-label={t('unitFrom')}
                  step="any"
                  inputMode="decimal"
                />
                <div className="custom-select-wrapper">
                  <select
                    className="converter-select"
                    value={inputUnit}
                    onChange={(e) => setInputUnit(e.target.value)}
                    aria-label={t('unitFrom')}
                  >
                    {CONVERSIONS[category]?.units && Object.entries(CONVERSIONS[category].units).map(([key, unit]) => (
                      <option key={key} value={key}>
                        {t(unit.name)}
                      </option>
                    ))}
                  </select>
                  <svg className="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              <div className="conversion-swap">
                <button
                  className="swap-btn"
                  onClick={handleSwap}
                  title={t('unitSwap')}
                  aria-label={t('unitSwap')}
                  type="button"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M7 16V4M7 4 3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4" />
                  </svg>
                </button>
              </div>

              <div className="conversion-input-group">
                <div className="converter-output">{output}</div>
                <button
                  className={`copy-btn ${copySuccess ? 'copy-btn--success' : ''}`}
                  onClick={handleCopy}
                  title={copySuccess ? t('copied') : t('copy')}
                  aria-label={copySuccess ? t('copied') : t('copy')}
                  type="button"
                >
                  {copySuccess ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
                <div className="custom-select-wrapper">
                  <select
                    className="converter-select"
                    value={outputUnit}
                    onChange={(e) => setOutputUnit(e.target.value)}
                    aria-label={t('unitTo')}
                  >
                    {CONVERSIONS[category]?.units && Object.entries(CONVERSIONS[category].units).map(([key, unit]) => (
                      <option key={key} value={key}>
                        {t(unit.name)}
                      </option>
                    ))}
                  </select>
                  <svg className="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="fx-disclaimer">
          {t('unitDisclaimer')}
        </p>
      </main>

      <SiteFooter
        onNavigate={onNavigate}
        note={t('unitFooterNote')}
      />
    </div>
  );
}

function getCategoryIcon(category) {
  const icons = {
    length: '📏',
    weight: '⚖️',
    temperature: '🌡️',
    volume: '🧊',
    speed: '🚀',
    area: '📐',
    time: '⏱️',
    digital: '💾',
    energy: '⚡',
    pressure: '🔘',
    frequency: '📊',
    angle: '📐',
    fuel: '⛽',
  };
  return icons[category] || '📊';
}
