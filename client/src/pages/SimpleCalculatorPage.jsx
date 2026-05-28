import { useCallback, useEffect, useState } from 'react';
import { Logo } from '../components/Logo.jsx';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { useLanguage } from '../context/LanguageContext';

export function SimpleCalculatorPage({ onNavigate }) {
  const { t } = useLanguage();
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState([]);
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num) => {
    if (newNumber) {
      setDisplay(String(num));
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const handleDecimal = () => {
    if (newNumber) {
      setDisplay('0.');
      setNewNumber(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperation = (op) => {
    const currentValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(currentValue);
    } else if (operation) {
      const result = calculate(previousValue, currentValue, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setOperation(op);
    setNewNumber(true);
  };

  const calculate = (prev, current, op) => {
    switch (op) {
      case '+':
        return prev + current;
      case '-':
        return prev - current;
      case '*':
        return prev * current;
      case '/':
        return current !== 0 ? prev / current : 0;
      case '%':
        return prev % current;
      default:
        return current;
    }
  };

  const handleEquals = () => {
    if (previousValue !== null && operation) {
      const currentValue = parseFloat(display);
      const result = calculate(previousValue, currentValue, operation);
      const entry = `${previousValue} ${operation} ${currentValue} = ${result}`;

      setHistory([entry, ...history.slice(0, 9)]);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
      setNewNumber(true);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  // Suporte a teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleNumber(parseInt(e.key));
      } else if (e.key === '.' || e.key === ',') {
        e.preventDefault();
        handleDecimal();
      } else if (e.key === '+') {
        e.preventDefault();
        handleOperation('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleOperation('-');
      } else if (e.key === '*') {
        e.preventDefault();
        handleOperation('*');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperation('/');
      } else if (e.key === '%') {
        e.preventDefault();
        handleOperation('%');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, previousValue, operation, newNumber]);

  return (
    <div className="app app--calculator">
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
            <h1>{t('calculatorTitle')}</h1>
            <p className="hero__subtitle">
              {t('calculatorSubtitle')}
            </p>
          </div>
        </div>
      </header>

      <main className="panel generator-panel">
        <div className="calculator-wrapper">
          <div className="calculator">
            <div className="calc-display">{display}</div>

            <div className="calc-buttons">
              <button className="calc-btn calc-btn--func" onClick={handleClear} aria-label="Clear all">AC</button>
              <button className="calc-btn calc-btn--func" onClick={handleBackspace} aria-label="Delete last digit">← Del</button>
              <button className="calc-btn calc-btn--op" onClick={() => handleOperation('%')} aria-label="Percent">%</button>
              <button className="calc-btn calc-btn--op" onClick={() => handleOperation('/')} aria-label="Divide">÷</button>

              <button className="calc-btn" onClick={() => handleNumber(7)} aria-label="7">7</button>
              <button className="calc-btn" onClick={() => handleNumber(8)} aria-label="8">8</button>
              <button className="calc-btn" onClick={() => handleNumber(9)} aria-label="9">9</button>
              <button className="calc-btn calc-btn--op" onClick={() => handleOperation('*')} aria-label="Multiply">×</button>

              <button className="calc-btn" onClick={() => handleNumber(4)} aria-label="4">4</button>
              <button className="calc-btn" onClick={() => handleNumber(5)} aria-label="5">5</button>
              <button className="calc-btn" onClick={() => handleNumber(6)} aria-label="6">6</button>
              <button className="calc-btn calc-btn--op" onClick={() => handleOperation('-')} aria-label="Subtract">−</button>

              <button className="calc-btn" onClick={() => handleNumber(1)} aria-label="1">1</button>
              <button className="calc-btn" onClick={() => handleNumber(2)} aria-label="2">2</button>
              <button className="calc-btn" onClick={() => handleNumber(3)} aria-label="3">3</button>
              <button className="calc-btn calc-btn--op" onClick={() => handleOperation('+')} aria-label="Add">+</button>

              <button className="calc-btn calc-btn--zero" onClick={() => handleNumber(0)} aria-label="0">0</button>
              <button className="calc-btn" onClick={handleDecimal} aria-label="Decimal point">,</button>
              <button className="calc-btn calc-btn--equals" onClick={handleEquals} aria-label="Equals">=</button>
            </div>
          </div>

          {history.length > 0 && (
            <div className="calc-history">
              <div className="calc-history__header">
                <h3>{t('history')}</h3>
                <button className="btn-outline btn-outline--danger calc-history__clear" onClick={handleClearHistory} aria-label={t('clearButton')}>{t('clearButton')}</button>
              </div>
              <div className="calc-history__list">
                {history.map((entry, idx) => (
                  <div key={idx} className="calc-history__entry">{entry}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="fx-disclaimer">
          {t('calculatorTip')}
        </p>
      </main>

      <SiteFooter
        onNavigate={onNavigate}
        note={t('calculatorDisclaimer')}
      />
    </div>
  );
}
