import { useState } from 'react';
import { usePageT, usePreferences } from '../context/PreferencesContext.jsx';
import { CopyButton, ToolHeader } from '../components/ui.jsx';
import { parseLocaleNumber } from '../lib/numbers.js';
import { clean } from '../lib/expression.js';

const STRINGS = {
  pt: {
    ofTitle: 'Quanto é X% de Y?',
    ofA: '',
    ofB: '% de',
    whatTitle: 'X é quantos % de Y?',
    whatA: '',
    whatB: 'é quantos % de',
    changeTitle: 'Variação percentual',
    changeA: 'De',
    changeB: 'para',
    increaseTitle: 'Aumentar ou diminuir em %',
    increaseA: '',
    increaseB: 'com acréscimo de',
    discountB: 'com desconto de',
    increase: 'Acréscimo',
    discount: 'Desconto',
    up: 'aumento de {v}',
    down: 'queda de {v}',
    none: 'sem variação',
  },
  en: {
    ofTitle: 'What is X% of Y?',
    ofA: '',
    ofB: '% of',
    whatTitle: 'X is what % of Y?',
    whatA: '',
    whatB: 'is what % of',
    changeTitle: 'Percentage change',
    changeA: 'From',
    changeB: 'to',
    increaseTitle: 'Increase or decrease by %',
    increaseA: '',
    increaseB: 'plus',
    discountB: 'minus',
    increase: 'Increase',
    discount: 'Discount',
    up: 'increase of {v}',
    down: 'decrease of {v}',
    none: 'no change',
  },
};

function NumberInput({ value, onChange, label, suffix }) {
  return (
    <span className="inline-input">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode="decimal"
        aria-label={label}
        size={Math.max(4, value.length + 1)}
      />
      {suffix && <span className="inline-input__suffix">{suffix}</span>}
    </span>
  );
}

function Row({ title, children, result, copyValue }) {
  return (
    <section className="pct-row">
      <h2 className="pct-row__title">{title}</h2>
      <div className="pct-row__body">
        <div className="pct-row__sentence">{children}</div>
        <div className="pct-row__result">
          <span className="mono">{result}</span>
          <CopyButton value={copyValue} iconOnly />
        </div>
      </div>
    </section>
  );
}

export default function PercentagePage() {
  const t = usePageT(STRINGS);
  const { locale } = usePreferences();
  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 4 });
  const fmt = (n) => (n === null || !Number.isFinite(n) ? '—' : nf.format(clean(n)));
  const raw = (n) => (n === null || !Number.isFinite(n) ? '' : String(clean(n)));
  const num = parseLocaleNumber;

  const [a, setA] = useState({ p: '15', v: '200' });
  const [b, setB] = useState({ x: '30', y: '120' });
  const [c, setC] = useState({ from: '80', to: '100' });
  const [d, setD] = useState({ v: '250', p: '10' });

  const r1 = num(a.p) !== null && num(a.v) !== null ? (num(a.p) / 100) * num(a.v) : null;
  const r2 = num(b.x) !== null && num(b.y) ? (num(b.x) / num(b.y)) * 100 : null;
  const r3 = num(c.from) && num(c.to) !== null ? ((num(c.to) - num(c.from)) / Math.abs(num(c.from))) * 100 : null;
  const plus = num(d.v) !== null && num(d.p) !== null ? num(d.v) * (1 + num(d.p) / 100) : null;
  const minus = num(d.v) !== null && num(d.p) !== null ? num(d.v) * (1 - num(d.p) / 100) : null;

  const changeText =
    r3 === null ? '—' : r3 > 0 ? t('up', { v: `${fmt(r3)}%` }) : r3 < 0 ? t('down', { v: `${fmt(-r3)}%` }) : t('none');

  return (
    <div className="tool tool--narrow">
      <ToolHeader title={t('tools.percentage.name')} description={t('tools.percentage.long')} />

      <Row title={t('ofTitle')} result={fmt(r1)} copyValue={raw(r1)}>
        <NumberInput value={a.p} onChange={(p) => setA({ ...a, p })} label="X" />
        <span>{t('ofB')}</span>
        <NumberInput value={a.v} onChange={(v) => setA({ ...a, v })} label="Y" />
      </Row>

      <Row title={t('whatTitle')} result={r2 === null ? '—' : `${fmt(r2)}%`} copyValue={raw(r2)}>
        <NumberInput value={b.x} onChange={(x) => setB({ ...b, x })} label="X" />
        <span>{t('whatB')}</span>
        <NumberInput value={b.y} onChange={(y) => setB({ ...b, y })} label="Y" />
      </Row>

      <Row title={t('changeTitle')} result={changeText} copyValue={raw(r3)}>
        <span>{t('changeA')}</span>
        <NumberInput value={c.from} onChange={(from) => setC({ ...c, from })} label={t('changeA')} />
        <span>{t('changeB')}</span>
        <NumberInput value={c.to} onChange={(to) => setC({ ...c, to })} label={t('changeB')} />
      </Row>

      <section className="pct-row">
        <h2 className="pct-row__title">{t('increaseTitle')}</h2>
        <div className="pct-row__body">
          <div className="pct-row__sentence">
            <NumberInput value={d.v} onChange={(v) => setD({ ...d, v })} label={t('common.value')} />
            <span>±</span>
            <NumberInput value={d.p} onChange={(p) => setD({ ...d, p })} label="%" suffix="%" />
          </div>
          <div className="pct-row__pair">
            <div className="pct-row__result">
              <span className="muted">{t('increase')}</span>
              <span className="mono">{fmt(plus)}</span>
              <CopyButton value={raw(plus)} iconOnly />
            </div>
            <div className="pct-row__result">
              <span className="muted">{t('discount')}</span>
              <span className="mono">{fmt(minus)}</span>
              <CopyButton value={raw(minus)} iconOnly />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
