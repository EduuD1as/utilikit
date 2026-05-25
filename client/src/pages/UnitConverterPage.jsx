import { useCallback, useState } from 'react';
import { Logo } from '../components/Logo.jsx';
import { SiteFooter } from '../components/SiteFooter.jsx';

export function UnitConverterPage({ onNavigate }) {
  const [inputValue, setInputValue] = useState('1');
  const [inputUnit, setInputUnit] = useState('m');
  const [outputUnit, setOutputUnit] = useState('km');
  const [category, setCategory] = useState('length');

  const conversions = {
    length: {
      name: 'Comprimento',
      units: {
        mm: { name: 'Milímetro (mm)', toBase: 0.001 },
        cm: { name: 'Centímetro (cm)', toBase: 0.01 },
        m: { name: 'Metro (m)', toBase: 1 },
        km: { name: 'Quilômetro (km)', toBase: 1000 },
        in: { name: 'Polegada (in)', toBase: 0.0254 },
        ft: { name: 'Pé (ft)', toBase: 0.3048 },
        mi: { name: 'Milha (mi)', toBase: 1609.34 },
      },
    },
    weight: {
      name: 'Peso',
      units: {
        mg: { name: 'Miligrama (mg)', toBase: 0.001 },
        g: { name: 'Grama (g)', toBase: 1 },
        kg: { name: 'Quilograma (kg)', toBase: 1000 },
        oz: { name: 'Onça (oz)', toBase: 28.35 },
        lb: { name: 'Libra (lb)', toBase: 453.59 },
        ton: { name: 'Tonelada (ton)', toBase: 1000000 },
      },
    },
    temperature: {
      name: 'Temperatura',
      units: {
        c: { name: 'Celsius (°C)', toBase: null },
        f: { name: 'Fahrenheit (°F)', toBase: null },
        k: { name: 'Kelvin (K)', toBase: null },
      },
    },
    volume: {
      name: 'Volume',
      units: {
        ml: { name: 'Mililitro (ml)', toBase: 0.001 },
        l: { name: 'Litro (l)', toBase: 1 },
        gal: { name: 'Galão (gal)', toBase: 3.785 },
        pt: { name: 'Pinta (pt)', toBase: 0.473 },
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
    else if (fromUnit === 'f') celsius = (value - 32) * 5/9;
    else if (fromUnit === 'k') celsius = value - 273.15;

    let result;
    if (toUnit === 'c') result = celsius;
    else if (toUnit === 'f') result = celsius * 9/5 + 32;
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
              ← Todas as ferramentas
            </button>
            <h1>Conversor de Unidades</h1>
            <p className="hero__subtitle">
              Converta entre diferentes unidades de medida instantaneamente
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
              <label className="converter-label">De</label>
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

            <button className="converter-swap" onClick={handleSwap} title="Trocar">
              ⇄
            </button>

            <div className="converter-side">
              <label className="converter-label">Para</label>
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
          Conversões realizadas localmente no seu navegador.
        </p>
      </main>

      <SiteFooter
        onNavigate={onNavigate}
        note="Conversor de unidades instantâneo."
      />
    </div>
  );
}
