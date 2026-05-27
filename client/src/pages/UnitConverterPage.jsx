import { useCallback, useState } from 'react';
import { Logo } from '../components/Logo.jsx';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { useLanguage } from '../context/LanguageContext';

export function UnitConverterPage({ onNavigate }) {
  const { t, language } = useLanguage();
  const [inputValue, setInputValue] = useState('1');
  const [inputUnit, setInputUnit] = useState('m');
  const [outputUnit, setOutputUnit] = useState('km');
  const [category, setCategory] = useState('length');

  const conversions = {
    length: {
      name: t('unitLength'),
      units: {
        mm: { name: t('unitMillimeter'), toBase: 0.001 },
        cm: { name: t('unitCentimeter'), toBase: 0.01 },
        m: { name: t('unitMeter'), toBase: 1 },
        km: { name: t('unitKilometer'), toBase: 1000 },
        in: { name: t('unitInch'), toBase: 0.0254 },
        ft: { name: t('unitFoot'), toBase: 0.3048 },
        mi: { name: t('unitMile'), toBase: 1609.34 },
      },
    },
    weight: {
      name: t('unitWeight'),
      units: {
        mg: { name: t('unitMilligram'), toBase: 0.001 },
        g: { name: t('unitGram'), toBase: 1 },
        kg: { name: t('unitKilogram'), toBase: 1000 },
        oz: { name: t('unitOunce'), toBase: 28.35 },
        lb: { name: t('unitPound'), toBase: 453.59 },
        ton: { name: t('unitTon'), toBase: 1000000 },
      },
    },
    temperature: {
      name: t('unitTemperature'),
      units: {
        c: { name: t('unitCelsius'), toBase: null },
        f: { name: t('unitFahrenheit'), toBase: null },
        k: { name: t('unitKelvin'), toBase: null },
      },
    },
    volume: {
      name: t('unitVolume'),
      units: {
        ml: { name: t('unitMilliliter'), toBase: 0.001 },
        l: { name: t('unitLiter'), toBase: 1 },
        gal: { name: t('unitGallon'), toBase: 3.785 },
        pt: { name: t('unitPint'), toBase: 0.473 },
      },
    },
  };

  const convertValue = useCallback(() => {
    const num = parseFloat(inputValue) || 0;

    if (category === 'temperature') {
      return convertTemperature(num, inputUnit, outputUnit);
    }

    const baseValue = num * conversions[category].units[inputUnit].toBase;
    const result = baseValue / conversions[category].units[outputUnit].toBase;

    // Arredondar para 3 casas decimais para distâncias, pesos e volumes
    return parseFloat(result.toFixed(3)).toString();
  }, [inputValue, inputUnit, outputUnit, category]);

  const convertTemperature = (value, fromUnit, toUnit) => {
    let celsius;

    if (fromUnit === 'c') celsius = value;
    else if (fromUnit === 'f') celsius = (value - 32) * 5 / 9;
    else if (fromUnit === 'k') celsius = value - 273.15;

    let result;
    if (toUnit === 'c') result = celsius;
    else if (toUnit === 'f') result = celsius * 9 / 5 + 32;
    else if (toUnit === 'k') result = celsius + 273.15;

    return result.toFixed(2);
  };

  const output = convertValue();

  const handleSwap = () => {
    setInputUnit(outputUnit);
    setOutputUnit(inputUnit);
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
            <h1>{t('unitConverterTitle')}</h1>
            <p className="hero__subtitle">
              {t('unitConverterSubtitle')}
            </p>
          </div>
        </div>
      </header>

      <main className="panel fx-panel">
        <div className="converter-container">
          <div className="converter-categories">
            {Object.entries(conversions).map(([key, data]) => (
              <button
                key={key}
                className={`converter-category ${category === key ? 'converter-category--active' : ''}`}
                onClick={() => {
                  setCategory(key);
                  setInputUnit(Object.keys(data.units)[0]);
                  setOutputUnit(Object.keys(data.units)[1] || Object.keys(data.units)[0]);
                }}
              >
                {data.name}
              </button>
            ))}
          </div>

          <div className="converter-box">
            <div className="converter-side">
              <label className="converter-label">{t('unitFrom')}</label>
              <input
                type="number"
                className="converter-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="0"
              />
              <select
                className="converter-select"
                value={inputUnit}
                onChange={(e) => setInputUnit(e.target.value)}
              >
                {Object.entries(conversions[category].units).map(([key, unit]) => (
                  <option key={key} value={key}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>

            <button className="converter-swap" onClick={handleSwap} title={t('unitSwap')}>
              ⇄
            </button>

            <div className="converter-side">
              <label className="converter-label">{t('unitTo')}</label>
              <div className="converter-output">{output}</div>
              <select
                className="converter-select"
                value={outputUnit}
                onChange={(e) => setOutputUnit(e.target.value)}
              >
                {Object.entries(conversions[category].units).map(([key, unit]) => (
                  <option key={key} value={key}>
                    {unit.name}
                  </option>
                ))}
              </select>
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
