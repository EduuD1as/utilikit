import { useState } from 'react';
import { Logo } from '../components/Logo.jsx';
import { SiteFooter } from '../components/SiteFooter.jsx';

export function UnitConverterPage({ onNavigate }) {
  const [category, setCategory] = useState('length');
  const [inputValue, setInputValue] = useState('1');
  const [inputUnit, setInputUnit] = useState('m');
  const [outputUnit, setOutputUnit] = useState('km');

  const categories = {
    length: {
      title: '📏 Comprimento',
      icon: '📏',
      units: {
        mm: { label: 'Milímetros (mm)', baseValue: 0.001 },
        cm: { label: 'Centímetros (cm)', baseValue: 0.01 },
        m: { label: 'Metros (m)', baseValue: 1 },
        km: { label: 'Quilômetros (km)', baseValue: 1000 },
        in: { label: 'Polegadas (in)', baseValue: 0.0254 },
        ft: { label: 'Pés (ft)', baseValue: 0.3048 },
        yd: { label: 'Jardas (yd)', baseValue: 0.9144 },
        mi: { label: 'Milhas (mi)', baseValue: 1609.344 },
      },
    },
    weight: {
      title: '⚖️ Peso',
      icon: '⚖️',
      units: {
        mg: { label: 'Miligramas (mg)', baseValue: 0.000001 },
        g: { label: 'Gramas (g)', baseValue: 0.001 },
        kg: { label: 'Quilogramas (kg)', baseValue: 1 },
        ton: { label: 'Toneladas (ton)', baseValue: 1000 },
        oz: { label: 'Onças (oz)', baseValue: 0.0283495 },
        lb: { label: 'Libras (lb)', baseValue: 0.453592 },
        st: { label: 'Stones (st)', baseValue: 6.35029 },
      },
    },
    temperature: {
      title: '🌡️ Temperatura',
      icon: '🌡️',
      units: {
        c: { label: 'Celsius (°C)', baseValue: null },
        f: { label: 'Fahrenheit (°F)', baseValue: null },
        k: { label: 'Kelvin (K)', baseValue: null },
      },
    },
    speed: {
      title: '💨 Velocidade',
      icon: '💨',
      units: {
        'ms': { label: 'Metros por segundo (m/s)', baseValue: 1 },
        'kmh': { label: 'Quilômetros por hora (km/h)', baseValue: 1 / 3.6 },
        'mph': { label: 'Milhas por hora (mph)', baseValue: 0.44704 },
        'knot': { label: 'Nós (knot)', baseValue: 0.51444 },
      },
    },
    volume: {
      title: '🥤 Volume',
      icon: '🥤',
      units: {
        ml: { label: 'Mililitros (ml)', baseValue: 0.001 },
        l: { label: 'Litros (l)', baseValue: 1 },
        gal: { label: 'Galões US (gal)', baseValue: 3.78541 },
        floz: { label: 'Onças Fluidas US (fl oz)', baseValue: 0.0295735 },
      },
    },
    area: {
      title: '📐 Área',
      icon: '📐',
      units: {
        'mm2': { label: 'Milímetros quadrados (mm²)', baseValue: 0.000001 },
        'cm2': { label: 'Centímetros quadrados (cm²)', baseValue: 0.0001 },
        'm2': { label: 'Metros quadrados (m²)', baseValue: 1 },
        'km2': { label: 'Quilômetros quadrados (km²)', baseValue: 1000000 },
        'ha': { label: 'Hectares (ha)', baseValue: 10000 },
        'acre': { label: 'Acres', baseValue: 4046.86 },
      },
    },
  };

  const convertTemperature = (value, from, to) => {
    let celsius;

    if (from === 'c') celsius = value;
    else if (from === 'f') celsius = (value - 32) * (5 / 9);
    else if (from === 'k') celsius = value - 273.15;

    if (to === 'c') return celsius;
    else if (to === 'f') return celsius * (9 / 5) + 32;
    else if (to === 'k') return celsius + 273.15;
  };

  const convert = () => {
    if (!inputValue || isNaN(inputValue)) return '';

    const num = parseFloat(inputValue);
    const catData = categories[category];

    if (!catData.units[inputUnit] || !catData.units[outputUnit]) return '';

    if (category === 'temperature') {
      return convertTemperature(num, inputUnit, outputUnit).toFixed(6);
    }

    const baseUnitValue = num * catData.units[inputUnit].baseValue;
    const result = baseUnitValue / catData.units[outputUnit].baseValue;

    return result.toFixed(6).replace(/\.?0+$/, '');
  };

  const result = convert();
  const currentCategory = categories[category];

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
            <h1>Conversor de Unidades</h1>
            <p className="hero__subtitle">
              Converta comprimento, peso, temperatura, velocidade e mais
            </p>
          </div>
        </div>
      </header>

      <main className="panel fx-panel">
        <div className="unit-converter">
          {/* Category selector */}
          <div className="unit-categories">
            {Object.entries(categories).map(([key, config]) => (
              <button
                key={key}
                type="button"
                className={`unit-category-btn ${category === key ? 'unit-category-btn--active' : ''}`}
                onClick={() => {
                  setCategory(key);
                  setInputUnit(Object.keys(config.units)[0]);
                  setOutputUnit(Object.keys(config.units)[1]);
                }}
                title={config.title}
              >
                <span>{config.icon}</span>
                <span>{config.title.split(' ')[1]}</span>
              </button>
            ))}
          </div>

          {/* Conversion section */}
          <div className="unit-conversion-section">
            {/* Input */}
            <div className="conversion-box">
              <label className="form-label">De</label>
              <div className="conversion-input-group">
                <input
                  type="number"
                  className="form-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="0"
                  step="any"
                />
                <select
                  className="form-select"
                  value={inputUnit}
                  onChange={(e) => setInputUnit(e.target.value)}
                >
                  {Object.entries(currentCategory.units).map(([key, unit]) => (
                    <option key={key} value={key}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap button */}
            <div className="conversion-swap">
              <button
                type="button"
                className="swap-btn"
                onClick={() => {
                  const temp = inputUnit;
                  setInputUnit(outputUnit);
                  setOutputUnit(temp);
                }}
                title="Inverter unidades"
              >
                ⇅
              </button>
            </div>

            {/* Output */}
            <div className="conversion-box">
              <label className="form-label">Para</label>
              <div className="conversion-input-group">
                <input
                  type="text"
                  className="form-input"
                  value={result}
                  readOnly
                  placeholder="0"
                />
                <select
                  className="form-select"
                  value={outputUnit}
                  onChange={(e) => setOutputUnit(e.target.value)}
                >
                  {Object.entries(currentCategory.units).map(([key, unit]) => (
                    <option key={key} value={key}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick conversions */}
          {result && (
            <div className="unit-quick-facts">
              <p className="quick-fact">
                <strong>{inputValue}</strong> {currentCategory.units[inputUnit].label.split('(')[0].trim()} =
                <strong> {result}</strong> {currentCategory.units[outputUnit].label.split('(')[0].trim()}
              </p>
            </div>
          )}

          {/* Reference table */}
          <div className="unit-reference">
            <h3 className="unit-reference__title">📊 Conversões Rápidas</h3>
            <div className="unit-reference-table">
              {Object.entries(currentCategory.units)
                .slice(0, 4)
                .map(([key, unit]) => {
                  const equivalent =
                    category === 'temperature'
                      ? convertTemperature(0, key, Object.keys(currentCategory.units)[0]).toFixed(1)
                      : (1 * unit.baseValue) / Object.values(currentCategory.units)[0].baseValue;

                  return (
                    <div key={key} className="unit-ref-item">
                      <span className="unit-ref-label">1 {key}</span>
                      <span className="unit-ref-value">
                        {typeof equivalent === 'number'
                          ? equivalent.toFixed(6).replace(/\.?0+$/, '')
                          : equivalent}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="unit-info">
            <p className="unit-info__title">ℹ️ Informações</p>
            <ul className="unit-info__list">
              <li>
                <strong>Conversão em tempo real:</strong> Resultados instantâneos enquanto você digita
              </li>
              <li>
                <strong>Múltiplas categorias:</strong> Comprimento, peso, temperatura, velocidade, volume e área
              </li>
              <li>
                <strong>Unidades populares:</strong> Métricas e imperiais suportadas
              </li>
              <li>
                <strong>Swap de unidades:</strong> Clique no botão ⇅ para inverter
              </li>
              <li>
                <strong>Privacidade:</strong> Todo cálculo é feito localmente no seu navegador
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
        note="Conversor de unidades executado no navegador."
      />
    </div>
  );
}
