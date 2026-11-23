import { useMemo, useState } from 'react';
import { usePageT, usePreferences } from '../context/PreferencesContext.jsx';
import { CopyButton, IconButton, Input, Notice, Select, ToolHeader } from '../components/ui.jsx';
import { UNIT_CATEGORIES, convertUnit, formatNumber } from '../lib/units.js';
import { parseLocaleNumber } from '../lib/numbers.js';

const STRINGS = {
  pt: {
    category: 'Categoria',
    invalid: 'Digite um número. Use vírgula ou ponto para decimais.',
    all: 'Todas as unidades',
  },
  en: {
    category: 'Category',
    invalid: 'Type a number. Use a dot or comma for decimals.',
    all: 'All units',
  },
};

export default function UnitConverterPage() {
  const t = usePageT(STRINGS);
  const { language, locale } = usePreferences();
  const [categoryId, setCategoryId] = useState('length');
  const [fromId, setFromId] = useState('m');
  const [toId, setToId] = useState('km');
  const [raw, setRaw] = useState('1');

  const category = UNIT_CATEGORIES.find((c) => c.id === categoryId);
  const from = category.units.find((x) => x.id === fromId) ?? category.units[0];
  const to = category.units.find((x) => x.id === toId) ?? category.units[1];
  const value = parseLocaleNumber(raw);

  const results = useMemo(() => {
    if (value === null) return [];
    return category.units.map((unit) => ({ unit, value: convertUnit(value, from, unit) }));
  }, [value, category, from]);

  const main = results.find((r) => r.unit.id === to.id);

  const changeCategory = (id) => {
    const next = UNIT_CATEGORIES.find((c) => c.id === id);
    setCategoryId(id);
    setFromId(next.units[0].id);
    setToId(next.units[1].id);
  };

  const unitOptions = category.units.map((unit) => ({ value: unit.id, label: unit[language] }));

  return (
    <div className="tool tool--narrow">
      <ToolHeader title={t('tools.units.name')} description={t('tools.units.long')} />

      <div className="chip-tabs" role="tablist" aria-label={t('category')}>
        {UNIT_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={c.id === categoryId}
            className={`chip-tab${c.id === categoryId ? ' chip-tab--active' : ''}`}
            onClick={() => changeCategory(c.id)}
          >
            {c[language]}
          </button>
        ))}
      </div>

      <div className="converter">
        <div className="converter__side">
          <Input
            label={t('common.value')}
            value={raw}
            onChange={(event) => setRaw(event.target.value)}
            inputMode="decimal"
            className="input--lg input--mono"
          />
          <Select label={t('common.from')} value={from.id} onChange={setFromId} options={unitOptions} />
        </div>
        <IconButton
          icon="swap"
          label={t('common.swap')}
          className="converter__swap"
          onClick={() => {
            setFromId(to.id);
            setToId(from.id);
            if (main && Number.isFinite(main.value)) setRaw(String(Number(main.value.toPrecision(12))));
          }}
        />
        <div className="converter__side">
          <div className="field">
            <span className="field__label">{t('common.result')}</span>
            <div className="output-box output-box--lg">
              <code>{main ? formatNumber(main.value, locale) : '—'}</code>
              <CopyButton value={main ? String(Number(main.value.toPrecision(12))) : ''} iconOnly />
            </div>
          </div>
          <Select label={t('common.to')} value={to.id} onChange={setToId} options={unitOptions} />
        </div>
      </div>

      {value === null && raw.trim() !== '' && <Notice tone="error">{t('invalid')}</Notice>}

      {results.length > 0 && (
        <table className="table">
          <caption className="table__caption">{t('all')}</caption>
          <tbody>
            {results.map(({ unit, value: v }) => (
              <tr key={unit.id} className={unit.id === from.id ? 'table__row--muted' : undefined}>
                <th scope="row">{unit[language]}</th>
                <td className="mono">{formatNumber(v, locale)}</td>
                <td className="table__action">
                  <CopyButton value={String(Number(v.toPrecision(12)))} iconOnly />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
