import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePageT, usePreferences } from '../context/PreferencesContext.jsx';
import { Button, CopyButton, IconButton, Input, Notice, Select, ToolHeader } from '../components/ui.jsx';
import { POPULAR, convert, currencyName, formatMoney, getRates } from '../lib/currency.js';
import { parseLocaleNumber } from '../lib/numbers.js';
import { readJson, writeJson } from '../lib/storage.js';

const STRINGS = {
  pt: {
    amount: 'Quantia',
    loading: 'Carregando cotações…',
    rateOf: 'Taxa de referência do BCE em {date}',
    fallback: 'Sem conexão com o serviço de cotações. Mostrando taxas salvas de {date}, que podem estar desatualizadas.',
    refresh: 'Atualizar',
    invalid: 'Digite um valor numérico, como 1.250,90.',
    popular: 'Mais usadas',
    others: 'Outras moedas',
    table: 'Outras moedas para {amount}',
    disclaimer: 'Taxas de referência do Banco Central Europeu, publicadas por volta das 16h (CET) em dias úteis. Bancos e casas de câmbio cobram spread e IOF.',
  },
  en: {
    amount: 'Amount',
    loading: 'Loading rates…',
    rateOf: 'ECB reference rate on {date}',
    fallback: 'Could not reach the rates service. Showing saved rates from {date}, which may be outdated.',
    refresh: 'Refresh',
    invalid: 'Type a number, like 1,250.90.',
    popular: 'Popular',
    others: 'Other currencies',
    table: 'Other currencies for {amount}',
    disclaimer: 'European Central Bank reference rates, published around 16:00 CET on business days. Banks and exchange services add their own fees.',
  },
};

const STORAGE_KEY = 'utilikit-currency';

export default function CurrencyPage() {
  const t = usePageT(STRINGS);
  const { locale } = usePreferences();
  const saved = readJson(STORAGE_KEY, {});
  const [from, setFrom] = useState(saved.from || 'USD');
  const [to, setTo] = useState(saved.to || 'BRL');
  const [raw, setRaw] = useState('1');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setData(await getRates({ force }));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => writeJson(STORAGE_KEY, { from, to }), [from, to]);

  const amount = parseLocaleNumber(raw);
  const result = data && amount !== null ? convert(amount, from, to, data.rates) : null;
  const unit = data ? convert(1, from, to, data.rates) : null;

  const options = useMemo(() => {
    const codes = data ? Object.keys(data.rates) : POPULAR;
    const popular = POPULAR.filter((c) => codes.includes(c));
    const others = codes.filter((c) => !POPULAR.includes(c)).sort();
    return [...popular, ...others].map((code) => ({ value: code, label: `${code} — ${currencyName(code, locale)}` }));
  }, [data, locale]);

  const dateLabel = data ? new Date(`${data.date}T12:00:00`).toLocaleDateString(locale) : '';

  return (
    <div className="tool tool--narrow">
      <ToolHeader title={t('tools.currency.name')} description={t('tools.currency.long')} />

      {data?.source === 'fallback' && (
        <Notice
          tone="error"
          action={
            <Button size="sm" onClick={() => load(true)}>
              {t('refresh')}
            </Button>
          }
        >
          {t('fallback', { date: dateLabel })}
        </Notice>
      )}

      <Input
        label={t('amount')}
        value={raw}
        onChange={(event) => setRaw(event.target.value)}
        inputMode="decimal"
        className="input--lg input--mono"
      />

      <div className="converter converter--tight">
        <Select label={t('common.from')} value={from} onChange={setFrom} options={options} className="select--block" />
        <IconButton
          icon="swap"
          label={t('common.swap')}
          className="converter__swap"
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
        />
        <Select label={t('common.to')} value={to} onChange={setTo} options={options} className="select--block" />
      </div>

      <div className="result-panel" aria-live="polite">
        {loading && !data ? (
          <p className="muted">{t('loading')}</p>
        ) : (
          <>
            <p className="muted mono">{amount !== null ? formatMoney(amount, from, locale) : '—'} =</p>
            <div className="row" style={{ alignItems: 'center' }}>
              <p className="big-number">{formatMoney(result, to, locale)}</p>
              <CopyButton value={result != null ? result.toFixed(2) : ''} iconOnly />
            </div>
            {unit != null && (
              <p className="muted mono">
                1 {from} = {formatMoney(unit, to, locale)} · 1 {to} = {formatMoney(1 / unit, from, locale)}
              </p>
            )}
            {data && (
              <p className="field__hint">
                {t('rateOf', { date: dateLabel })}
                {' · '}
                <button type="button" className="link-btn" onClick={() => load(true)} disabled={loading}>
                  {t('refresh')}
                </button>
              </p>
            )}
          </>
        )}
      </div>

      {amount === null && raw.trim() !== '' && <Notice tone="error">{t('invalid')}</Notice>}

      {data && amount !== null && (
        <table className="table">
          <caption className="table__caption">{t('table', { amount: formatMoney(amount, from, locale) })}</caption>
          <tbody>
            {POPULAR.filter((code) => code !== from && data.rates[code]).map((code) => (
              <tr key={code}>
                <th scope="row">
                  <span className="mono">{code}</span> <span className="muted">{currencyName(code, locale)}</span>
                </th>
                <td className="mono">{formatMoney(convert(amount, from, code, data.rates), code, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="field__hint">{t('disclaimer')}</p>
    </div>
  );
}
