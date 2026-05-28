import { useCallback, useEffect, useMemo, useState } from 'react';
import { Logo } from '../components/Logo.jsx';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { useLanguage } from '../context/LanguageContext';
import {
  CURRENCY_NAMES,
  getCurrencyLabel,
  POPULAR_CURRENCY_CODES,
} from '../data/currencies.js';
import {
  convertAmount,
  fetchCurrencyList,
  fetchRates,
  formatMoney,
} from '../lib/exchangeRates.js';

function parseAmount(raw) {
  const normalized = String(raw).replace(/\s/g, '').replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function sortCurrencyCodes(codes, popularSet) {
  const popular = POPULAR_CURRENCY_CODES.filter((c) => codes.includes(c));
  const rest = codes
    .filter((c) => !popularSet.has(c))
    .sort((a, b) => {
      const nameA = CURRENCY_NAMES[a] ?? a;
      const nameB = CURRENCY_NAMES[b] ?? b;
      return nameA.localeCompare(nameB, 'pt-BR');
    });
  return [...popular, ...rest];
}

export function CurrencyConverterPage({ onNavigate }) {
  const { t } = useLanguage();
  const [amountIn, setAmountIn] = useState('1');
  const [from, setFrom] = useState('BRL');
  const [to, setTo] = useState('USD');
  const [rates, setRates] = useState(null);
  const [rateDate, setRateDate] = useState(null);
  const [rateSource, setRateSource] = useState(null);
  const [currencyCodes, setCurrencyCodes] = useState(POPULAR_CURRENCY_CODES);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const popularSet = useMemo(
    () => new Set(POPULAR_CURRENCY_CODES),
    []
  );

  const sortedCodes = useMemo(
    () => sortCurrencyCodes(currencyCodes, popularSet),
    [currencyCodes, popularSet]
  );

  const amount = parseAmount(amountIn);
  const result = rates && amount != null ? convertAmount(amount, rates, to) : null;

  const loadRates = useCallback(async (base, { force = false } = {}) => {
    setError(null);
    if (force) setRefreshing(true);
    else setLoading(true);

    try {
      const list = await fetchCurrencyList();
      setCurrencyCodes(sortCurrencyCodes(Object.keys(list), popularSet));
      const data = await fetchRates(base);
      setRates(data.rates);
      setRateDate(data.date);
      setRateSource(data.source);
    } catch (err) {
      setError(err.message || t('errorCouldNotLoadRates'));
      setRates(null);
      setRateDate(null);
      setRateSource(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [popularSet]);

  useEffect(() => {
    loadRates(from);
  }, [from, loadRates]);

  useEffect(() => {
    if (rates && from !== to && rates[to] == null) {
      const fallback = POPULAR_CURRENCY_CODES.find(
        (c) => c !== from && rates[c]
      );
      if (fallback) setTo(fallback);
    }
  }, [from, to, rates]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const unitRate =
    rates && rates[to] != null ? rates[to] : null;

  return (
    <div className="app app--currency">
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
            <h1>{t('currencyConverterTitle')}</h1>
            <p className="hero__subtitle">
              {t('currencyConverterSubtitle')}
            </p>
          </div>
        </div>
      </header>

      <main className="panel generator-panel">
        {error && (
          <div className="alert alert--error" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px', marginRight: '0.5rem' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
            <button
              type="button"
              className="btn-outline"
              onClick={() => loadRates(from, { force: true })}
              aria-label={t('retryButton')}
            >
              {t('retryButton')}
            </button>
          </div>
        )}

        <div className="fx-converter">
          <label className="fx-field">
            <span className="fx-field__label">{t('value')}</span>
            <input
              type="text"
              inputMode="decimal"
              className="fx-field__amount"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              placeholder={t('placeholderCurrency')}
              disabled={loading}
              aria-label={t('value')}
            />
          </label>

          <div className="fx-row">
            <label className="fx-field fx-field--grow">
              <span className="fx-field__label">{t('from')}</span>
              <div className="custom-select-wrapper">
                <select
                  className="fx-field__select"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  disabled={loading}
                  aria-label={t('from')}
                >
                  {sortedCodes.map((code) => (
                    <option key={`from-${code}`} value={code}>
                      {getCurrencyLabel(code)}
                    </option>
                  ))}
                </select>
                <svg className="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </label>

            <button
              type="button"
              className="fx-swap"
              onClick={swap}
              disabled={loading}
              aria-label="Inverter moedas"
              title="Inverter"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  d="M7 16V4M7 4 3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4"
                />
              </svg>
            </button>

            <label className="fx-field fx-field--grow">
              <span className="fx-field__label">{t('to')}</span>
              <div className="custom-select-wrapper">
                <select
                  className="fx-field__select"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  disabled={loading}
                  aria-label={t('to')}
                >
                  {sortedCodes.map((code) => (
                    <option key={`to-${code}`} value={code}>
                      {getCurrencyLabel(code)}
                    </option>
                  ))}
                </select>
                <svg className="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </label>
          </div>

          <div className="fx-result" aria-live="polite">
            {loading ? (
              <p className="fx-result__loading">{t('loadingRates')}</p>
            ) : (
              <>
                <p className="fx-result__value">
                  {formatMoney(result, to)}
                </p>
                {unitRate != null && from !== to && (
                  <p className="fx-result__rate">
                    1 {from} = {formatMoney(unitRate, to)}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="fx-meta">
            {rateDate && !loading && (
              <span>
                {rateSource === 'fallback' ? t('estimatedRate') : t('rateOf')}
                {rateDate.split('-').reverse().join('/')}
              </span>
            )}
            <button
              type="button"
              className="btn-outline fx-meta__refresh"
              onClick={() => loadRates(from, { force: true })}
              disabled={loading || refreshing}
              aria-label={t('currencyUpdateRate')}
            >
              {refreshing ? (
                <>
                  <span className="spinner"></span>
                  {t('currencyUpdating')}
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  {t('currencyUpdateRate')}
                </>
              )}
            </button>
          </div>
        </div>

        <p className="fx-disclaimer">
          {t('currencyDisclaimer')}{' '}
          <a
            href="https://www.frankfurter.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Frankfurter
          </a>{' '}
          {t('currencyReference')}
        </p>
      </main>

      <SiteFooter
        onNavigate={onNavigate}
        note={t('currencyFooterNote')}
      />
    </div>
  );
}
