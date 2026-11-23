import { useState } from 'react';
import { usePageT, usePreferences } from '../context/PreferencesContext.jsx';
import { Input, ToolHeader } from '../components/ui.jsx';
import { parseLocaleNumber } from '../lib/numbers.js';

const STRINGS = {
  pt: {
    weight: 'Peso',
    height: 'Altura',
    yourBmi: 'Seu IMC',
    fill: 'Informe peso e altura para calcular.',
    healthy: 'Peso saudável para esta altura: {min} a {max} kg',
    note: 'O IMC é uma referência para adultos e não considera massa muscular, idade ou sexo. Para avaliação, consulte um profissional de saúde.',
    c0: 'Abaixo do peso',
    c1: 'Peso normal',
    c2: 'Sobrepeso',
    c3: 'Obesidade grau I',
    c4: 'Obesidade grau II',
    c5: 'Obesidade grau III',
  },
  en: {
    weight: 'Weight',
    height: 'Height',
    yourBmi: 'Your BMI',
    fill: 'Enter weight and height to calculate.',
    healthy: 'Healthy weight for this height: {min} to {max} kg',
    note: 'BMI is a reference for adults and does not account for muscle mass, age or sex. For an assessment, talk to a health professional.',
    c0: 'Underweight',
    c1: 'Normal weight',
    c2: 'Overweight',
    c3: 'Obesity class I',
    c4: 'Obesity class II',
    c5: 'Obesity class III',
  },
};

const BANDS = [
  { max: 18.5, key: 'c0', range: '< 18,5' },
  { max: 25, key: 'c1', range: '18,5 – 24,9' },
  { max: 30, key: 'c2', range: '25 – 29,9' },
  { max: 35, key: 'c3', range: '30 – 34,9' },
  { max: 40, key: 'c4', range: '35 – 39,9' },
  { max: Infinity, key: 'c5', range: '≥ 40' },
];

export default function BmiPage() {
  const t = usePageT(STRINGS);
  const { locale } = usePreferences();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  const w = parseLocaleNumber(weight);
  let h = parseLocaleNumber(height);
  if (h !== null && h < 3) h *= 100; // aceita "1,75" como metros
  const valid = w > 0 && h > 50 && h < 280 && w < 700;
  const bmi = valid ? w / (h / 100) ** 2 : null;
  const bandIndex = bmi === null ? -1 : BANDS.findIndex((b) => bmi < b.max);
  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  const marker = bmi === null ? null : Math.min(100, Math.max(0, ((bmi - 15) / (42 - 15)) * 100));

  return (
    <div className="tool tool--narrow">
      <ToolHeader title={t('tools.bmi.name')} description={t('tools.bmi.long')} />

      <div className="grid-2">
        <Input label={t('weight')} value={weight} onChange={(e) => setWeight(e.target.value)} inputMode="decimal" suffix="kg" className="input--lg input--mono" placeholder="70" />
        <Input label={t('height')} value={height} onChange={(e) => setHeight(e.target.value)} inputMode="decimal" suffix="cm" className="input--lg input--mono" placeholder="175" />
      </div>

      <div className="result-panel">
        {bmi === null ? (
          <p className="muted">{t('fill')}</p>
        ) : (
          <>
            <p className="muted">{t('yourBmi')}</p>
            <p className="big-number">{nf.format(bmi)}</p>
            <p className={`bmi-band bmi-band--${bandIndex}`}>{t(BANDS[bandIndex].key)}</p>
            <p className="field__hint">
              {t('healthy', {
                min: nf.format(18.5 * (h / 100) ** 2),
                max: nf.format(24.9 * (h / 100) ** 2),
              })}
            </p>
          </>
        )}
      </div>

      <div className="bmi-scale">
        <div className="bmi-scale__bar">
          {BANDS.map((band, index) => (
            <span
              key={band.key}
              className={`bmi-scale__seg bmi-band--${index}${index === bandIndex ? ' is-active' : ''}`}
              style={{ flexGrow: [3.5, 6.5, 5, 5, 5, 2][index] }}
            />
          ))}
          {marker !== null && <span className="bmi-scale__marker" style={{ left: `${marker}%` }} />}
        </div>
        <ul className="bmi-scale__legend">
          {BANDS.map((band, index) => (
            <li key={band.key} className={index === bandIndex ? 'is-active' : undefined}>
              <span>{t(band.key)}</span>
              <span className="mono muted">{band.range}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="field__hint">{t('note')}</p>
    </div>
  );
}
