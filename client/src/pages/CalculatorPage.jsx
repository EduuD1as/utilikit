import { useCallback, useEffect, useState } from 'react';
import { usePageT, usePreferences } from '../context/PreferencesContext.jsx';
import { Button, CopyButton, Pane, ToolHeader } from '../components/ui.jsx';
import { clean, evaluate } from '../lib/expression.js';

const STRINGS = {
  pt: {
    history: 'Histórico',
    emptyHistory: 'As contas feitas aparecem aqui. Clique em uma para reutilizar o resultado.',
    error: 'Expressão inválida',
    divZero: 'Divisão por zero',
    keyboard: 'Funciona pelo teclado: números, + - * / ^ % ( ), Enter para calcular, Esc para limpar.',
    clearHistory: 'Limpar histórico',
  },
  en: {
    history: 'History',
    emptyHistory: 'Your calculations show up here. Click one to reuse its result.',
    error: 'Invalid expression',
    divZero: 'Division by zero',
    keyboard: 'Works with the keyboard: digits, + - * / ^ % ( ), Enter to calculate, Esc to clear.',
    clearHistory: 'Clear history',
  },
};

const KEYS = [
  ['C', '(', ')', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['%', '0', '.', '='],
];

const OPS = new Set(['+', '−', '×', '÷', '^']);

export default function CalculatorPage() {
  const t = usePageT(STRINGS);
  const { locale } = usePreferences();
  const [expr, setExpr] = useState('');
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [justEvaluated, setJustEvaluated] = useState(false);

  const fmt = useCallback(
    (n) => (Number.isFinite(n) ? new Intl.NumberFormat(locale, { maximumFractionDigits: 10 }).format(n) : '—'),
    [locale]
  );

  let preview = null;
  try {
    const v = evaluate(expr);
    if (v !== null && Number.isFinite(v)) preview = clean(v);
  } catch {
    preview = null;
  }

  const press = useCallback(
    (key) => {
      setError(null);
      if (key === 'C') {
        setExpr('');
        setJustEvaluated(false);
        return;
      }
      if (key === '⌫') {
        setExpr((e) => e.slice(0, -1));
        setJustEvaluated(false);
        return;
      }
      if (key === '=') {
        if (!expr) return;
        try {
          const value = evaluate(expr);
          if (!Number.isFinite(value)) {
            setError(t('divZero'));
            return;
          }
          const result = clean(value);
          setHistory((h) => [{ expr, result }, ...h].slice(0, 20));
          setExpr(String(result));
          setJustEvaluated(true);
        } catch {
          setError(t('error'));
        }
        return;
      }
      setExpr((e) => {
        // Depois de "=", um dígito começa conta nova; um operador continua a partir do resultado.
        const base = justEvaluated && !OPS.has(key) && key !== '%' ? '' : e;
        const last = base.slice(-1);
        if (OPS.has(key) && OPS.has(last)) return base.slice(0, -1) + key;
        return base + key;
      });
      setJustEvaluated(false);
    },
    [expr, justEvaluated, t]
  );

  useEffect(() => {
    const onKey = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;
      const map = { '*': '×', '/': '÷', '-': '−', Enter: '=', '=': '=', Escape: 'C', Backspace: '⌫', ',': '.' };
      const key = map[event.key] ?? event.key;
      if (/^[0-9.+−×÷^%()=C⌫]$/.test(key)) {
        event.preventDefault();
        press(key);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [press]);

  return (
    <div className="tool">
      <ToolHeader title={t('tools.calculator.name')} description={t('tools.calculator.long')} />

      <div className="calc-layout">
        <div className="calc">
          <div className="calc__display" aria-live="polite">
            <div className="calc__expr">{expr || '0'}</div>
            <div className={`calc__result${error ? ' calc__result--error' : ''}`}>
              {error || (preview !== null && !justEvaluated ? `= ${fmt(preview)}` : ' ')}
            </div>
          </div>
          <div className="calc__keys">
            {KEYS.flat().map((key) => (
              <button
                key={key}
                type="button"
                className={`calc__key${OPS.has(key) ? ' calc__key--op' : ''}${key === '=' ? ' calc__key--eq' : ''}${
                  key === 'C' ? ' calc__key--fn' : ''
                }`}
                onClick={() => press(key)}
              >
                {key}
              </button>
            ))}
          </div>
          <p className="field__hint">{t('keyboard')}</p>
        </div>

        <Pane
          title={t('history')}
          actions={
            history.length > 0 && (
              <Button size="sm" variant="ghost" onClick={() => setHistory([])}>
                {t('clearHistory')}
              </Button>
            )
          }
        >
          {history.length === 0 ? (
            <p className="pane__pad muted">{t('emptyHistory')}</p>
          ) : (
            <ul className="history">
              {history.map((item, index) => (
                <li key={index}>
                  <button
                    type="button"
                    className="history__item"
                    onClick={() => {
                      setExpr(String(item.result));
                      setJustEvaluated(true);
                    }}
                  >
                    <span className="muted mono">{item.expr} =</span>
                    <span className="mono">{fmt(item.result)}</span>
                  </button>
                  <CopyButton value={String(item.result)} iconOnly />
                </li>
              ))}
            </ul>
          )}
        </Pane>
      </div>
    </div>
  );
}
