import { useMemo, useState } from 'react';
import { usePageT, usePreferences } from '../context/PreferencesContext.jsx';
import { Input, Notice, Segmented, Stat, ToolHeader } from '../components/ui.jsx';
import { parseLocaleNumber } from '../lib/numbers.js';

const STRINGS = {
  pt: {
    initial: 'Valor inicial',
    monthly: 'Aporte mensal',
    rate: 'Taxa de juros',
    perYear: 'ao ano',
    perMonth: 'ao mês',
    period: 'Período',
    years: 'anos',
    months: 'meses',
    final: 'Valor final',
    invested: 'Total investido',
    interest: 'Total em juros',
    effective: 'Taxa mensal equivalente',
    table: 'Evolução ano a ano',
    year: 'Ano',
    balance: 'Saldo',
    invalid: 'Preencha todos os campos com números válidos. O período vai até 100 anos.',
    note: 'Simulação sem impostos, taxas ou inflação. Aportes feitos no fim de cada mês.',
  },
  en: {
    initial: 'Initial amount',
    monthly: 'Monthly deposit',
    rate: 'Interest rate',
    perYear: 'per year',
    perMonth: 'per month',
    period: 'Period',
    years: 'years',
    months: 'months',
    final: 'Final balance',
    invested: 'Total invested',
    interest: 'Total interest',
    effective: 'Equivalent monthly rate',
    table: 'Year-by-year growth',
    year: 'Year',
    balance: 'Balance',
    invalid: 'Fill every field with valid numbers. The period goes up to 100 years.',
    note: 'Simulation without taxes, fees or inflation. Deposits made at the end of each month.',
  },
};

export default function CompoundInterestPage() {
  const t = usePageT(STRINGS);
  const { locale, language } = usePreferences();
  const [initial, setInitial] = useState('1000');
  const [monthly, setMonthly] = useState('200');
  const [rate, setRate] = useState('10');
  const [rateUnit, setRateUnit] = useState('year');
  const [period, setPeriod] = useState('10');
  const [periodUnit, setPeriodUnit] = useState('years');

  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: language === 'pt' ? 'BRL' : 'USD' });
  const pct = new Intl.NumberFormat(locale, { maximumFractionDigits: 4 });

  const sim = useMemo(() => {
    const P = parseLocaleNumber(initial);
    const A = parseLocaleNumber(monthly);
    const r = parseLocaleNumber(rate);
    const n = parseLocaleNumber(period);
    if ([P, A, r, n].some((x) => x === null || x < 0)) return null;
    const months = Math.round(periodUnit === 'years' ? n * 12 : n);
    if (months < 1 || months > 1200) return null;
    // Taxa anual convertida para mensal equivalente (capitalização composta).
    const i = rateUnit === 'year' ? (1 + r / 100) ** (1 / 12) - 1 : r / 100;
    let balance = P;
    let invested = P;
    const rows = [];
    for (let m = 1; m <= months; m += 1) {
      balance = balance * (1 + i) + A;
      invested += A;
      if (m % 12 === 0 || m === months) rows.push({ month: m, balance, invested });
    }
    return { balance, invested, interest: balance - invested, monthlyRate: i * 100, rows };
  }, [initial, monthly, rate, rateUnit, period, periodUnit]);

  return (
    <div className="tool">
      <ToolHeader title={t('tools.interest.name')} description={t('tools.interest.long')} />

      <div className="grid-3">
        <Input label={t('initial')} value={initial} onChange={(e) => setInitial(e.target.value)} inputMode="decimal" className="input--mono" />
        <Input label={t('monthly')} value={monthly} onChange={(e) => setMonthly(e.target.value)} inputMode="decimal" className="input--mono" />
        <div className="field">
          <span className="field__label">{t('rate')}</span>
          <div className="row row--nowrap">
            <Input value={rate} onChange={(e) => setRate(e.target.value)} inputMode="decimal" suffix="%" className="input--mono" aria-label={t('rate')} />
            <Segmented
              label={t('rate')}
              value={rateUnit}
              onChange={setRateUnit}
              options={[
                { value: 'year', label: t('perYear') },
                { value: 'month', label: t('perMonth') },
              ]}
            />
          </div>
        </div>
        <div className="field">
          <span className="field__label">{t('period')}</span>
          <div className="row row--nowrap">
            <Input value={period} onChange={(e) => setPeriod(e.target.value)} inputMode="numeric" className="input--mono" aria-label={t('period')} />
            <Segmented
              label={t('period')}
              value={periodUnit}
              onChange={setPeriodUnit}
              options={[
                { value: 'years', label: t('years') },
                { value: 'months', label: t('months') },
              ]}
            />
          </div>
        </div>
      </div>

      {!sim ? (
        <Notice tone="error">{t('invalid')}</Notice>
      ) : (
        <>
          <div className="stats">
            <Stat label={t('final')} value={money.format(sim.balance)} />
            <Stat label={t('invested')} value={money.format(sim.invested)} />
            <Stat label={t('interest')} value={money.format(sim.interest)} />
            <Stat label={t('effective')} value={`${pct.format(sim.monthlyRate)}%`} />
          </div>

          <div className="bar-split" aria-hidden="true">
            <span style={{ flexGrow: Math.max(sim.invested, 0.0001) }} className="bar-split__a" />
            <span style={{ flexGrow: Math.max(sim.interest, 0.0001) }} className="bar-split__b" />
          </div>
          <div className="legend">
            <span><i className="legend__a" /> {t('invested')}</span>
            <span><i className="legend__b" /> {t('interest')}</span>
          </div>

          <table className="table">
            <caption className="table__caption">{t('table')}</caption>
            <thead>
              <tr>
                <th scope="col">{t('year')}</th>
                <th scope="col">{t('invested')}</th>
                <th scope="col">{t('interest')}</th>
                <th scope="col">{t('balance')}</th>
              </tr>
            </thead>
            <tbody>
              {sim.rows.map((row) => (
                <tr key={row.month}>
                  <th scope="row" className="mono">
                    {row.month % 12 === 0 ? row.month / 12 : `${(row.month / 12).toFixed(1)}`}
                  </th>
                  <td className="mono">{money.format(row.invested)}</td>
                  <td className="mono">{money.format(row.balance - row.invested)}</td>
                  <td className="mono">{money.format(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="field__hint">{t('note')}</p>
        </>
      )}
    </div>
  );
}
