import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';

export default function IMCCalculatorPage({ onNavigate }) {
  const { t } = useLanguage();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState(null);

  const calculateBMI = () => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (!weightNum || !heightNum || weightNum <= 0 || heightNum <= 0) {
      return;
    }

    const heightInMeters = heightNum / 100;
    const bmi = weightNum / (heightInMeters * heightInMeters);
    
    let category = '';
    let color = '';

    if (bmi < 18.5) {
      category = t('bmiUnderweight');
      color = '#3498db';
    } else if (bmi < 25) {
      category = t('bmiNormal');
      color = '#2ecc71';
    } else if (bmi < 30) {
      category = t('bmiOverweight');
      color = '#f39c12';
    } else if (bmi < 35) {
      category = t('bmiObese1');
      color = '#e67e22';
    } else if (bmi < 40) {
      category = t('bmiObese2');
      color = '#e74c3c';
    } else {
      category = t('bmiObese3');
      color = '#c0392b';
    }

    setResult({
      bmi: bmi.toFixed(1),
      category,
      color
    });
  };

  const clearForm = () => {
    setWeight('');
    setHeight('');
    setResult(null);
  };

  return (
    <div className="app app--bmi-calculator">
      <SiteHeader onNavigate={onNavigate} variant="tool" />

      <header className="hero">
        <div className="hero__content">
          <h1>{t('bmiTitle')}</h1>
          <p className="hero__subtitle">{t('bmiSubtitle')}</p>
        </div>
      </header>

      <main className="panel">
        <div className="bmi-calculator">
          <div className="bmi-calculator__input-group">
            <div className="bmi-calculator__input-wrapper">
              <label htmlFor="weight">{t('weight')}</label>
              <input
                id="weight"
                type="number"
                className="search__input"
                placeholder={t('weightPlaceholder')}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <span className="bmi-calculator__unit">kg</span>
            </div>

            <div className="bmi-calculator__input-wrapper">
              <label htmlFor="height">{t('height')}</label>
              <input
                id="height"
                type="number"
                className="search__input"
                placeholder={t('heightPlaceholder')}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
              <span className="bmi-calculator__unit">cm</span>
            </div>
          </div>

          <div className="bmi-calculator__buttons">
            <button className="search__btn" onClick={calculateBMI} disabled={!weight || !height}>
              {t('calculate')}
            </button>
            <button className="btn-ghost" onClick={clearForm}>
              {t('clear')}
            </button>
          </div>

          {result && (
            <div className="bmi-calculator__result">
              <div className="bmi-calculator__result-value" style={{ color: result.color }}>
                {result.bmi}
              </div>
              <div className="bmi-calculator__result-category" style={{ color: result.color }}>
                {result.category}
              </div>
            </div>
          )}

          <div className="bmi-calculator__scale">
            <div className="bmi-calculator__scale-item bmi-calculator__scale-item--underweight">
              <span className="bmi-calculator__scale-label">{t('bmiUnderweight')}</span>
              <span className="bmi-calculator__scale-range">&lt; 18.5</span>
            </div>
            <div className="bmi-calculator__scale-item bmi-calculator__scale-item--normal">
              <span className="bmi-calculator__scale-label">{t('bmiNormal')}</span>
              <span className="bmi-calculator__scale-range">18.5 - 24.9</span>
            </div>
            <div className="bmi-calculator__scale-item bmi-calculator__scale-item--overweight">
              <span className="bmi-calculator__scale-label">{t('bmiOverweight')}</span>
              <span className="bmi-calculator__scale-range">25 - 29.9</span>
            </div>
            <div className="bmi-calculator__scale-item bmi-calculator__scale-item--obese">
              <span className="bmi-calculator__scale-label">{t('bmiObese')}</span>
              <span className="bmi-calculator__scale-range">≥ 30</span>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter onNavigate={onNavigate} />
    </div>
  );
}
