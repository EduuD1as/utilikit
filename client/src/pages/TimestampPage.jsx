import { useEffect, useMemo, useState } from 'react';
import { usePageT, usePreferences } from '../context/PreferencesContext.jsx';
import { Button, CopyButton, Input, KeyValueList, Notice, Pane, ToolHeader } from '../components/ui.jsx';

const STRINGS = {
  pt: {
    now: 'Agora',
    seconds: 'segundos',
    millis: 'milissegundos',
    toDate: 'Timestamp para data',
    toTimestamp: 'Data para timestamp',
    timestamp: 'Timestamp Unix',
    detected: 'Interpretado como {unit}',
    invalid: 'Digite um número inteiro (segundos, milissegundos ou microssegundos).',
    date: 'Data e hora (horário local)',
    local: 'Horário local',
    utc: 'UTC',
    iso: 'ISO 8601',
    relative: 'Relativo',
    weekday: 'Dia da semana',
    unixS: 'Unix (s)',
    unixMs: 'Unix (ms)',
    micro: 'microssegundos',
    useNow: 'Usar agora',
  },
  en: {
    now: 'Now',
    seconds: 'seconds',
    millis: 'milliseconds',
    toDate: 'Timestamp to date',
    toTimestamp: 'Date to timestamp',
    timestamp: 'Unix timestamp',
    detected: 'Read as {unit}',
    invalid: 'Type a whole number (seconds, milliseconds or microseconds).',
    date: 'Date and time (local time)',
    local: 'Local time',
    utc: 'UTC',
    iso: 'ISO 8601',
    relative: 'Relative',
    weekday: 'Weekday',
    unixS: 'Unix (s)',
    unixMs: 'Unix (ms)',
    micro: 'microseconds',
    useNow: 'Use now',
  },
};

function relative(ms, locale) {
  const diff = (ms - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(diff) >= size || unit === 'second') return rtf.format(Math.round(diff / size), unit);
  }
  return '';
}

function toLocalInput(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}:${pad(date.getSeconds())}`;
}

export default function TimestampPage() {
  const t = usePageT(STRINGS);
  const { locale } = usePreferences();
  const [now, setNow] = useState(() => Date.now());
  const [stamp, setStamp] = useState(() => String(Math.floor(Date.now() / 1000)));
  const [dateInput, setDateInput] = useState(() => toLocalInput(new Date()));

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const parsed = useMemo(() => {
    const clean = stamp.trim().replace(/[_\s.,]/g, '');
    if (!clean) return null;
    if (!/^-?\d+$/.test(clean)) return { error: true };
    const n = Number(clean);
    const digits = clean.replace('-', '').length;
    // Heurística por quantidade de dígitos: até 11 = s, até 14 = ms, mais = µs.
    let ms;
    let unit;
    if (digits <= 11) {
      ms = n * 1000;
      unit = t('seconds');
    } else if (digits <= 14) {
      ms = n;
      unit = t('millis');
    } else {
      ms = Math.floor(n / 1000);
      unit = t('micro');
    }
    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) return { error: true };
    return { date, ms, unit };
  }, [stamp, t]);

  const fmtLocal = new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'long' });
  const fmtWeekday = new Intl.DateTimeFormat(locale, { weekday: 'long' });

  const fromDate = useMemo(() => {
    if (!dateInput) return null;
    const date = new Date(dateInput);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [dateInput]);

  return (
    <div className="tool">
      <ToolHeader title={t('tools.timestamp.name')} description={t('tools.timestamp.long')} />

      <div className="now-strip">
        <span className="muted">{t('now')}</span>
        <code className="now-strip__value">{Math.floor(now / 1000)}</code>
        <CopyButton value={String(Math.floor(now / 1000))} iconOnly />
        <code className="now-strip__ms muted">{now}</code>
        <CopyButton value={String(now)} iconOnly />
      </div>

      <div className="grid-2 grid-2--top">
        <Pane title={t('toDate')}>
          <div className="pane__pad stack">
            <div className="row">
              <Input
                label={t('timestamp')}
                value={stamp}
                onChange={(event) => setStamp(event.target.value)}
                inputMode="numeric"
                className="input--lg input--mono"
                hint={parsed && !parsed.error ? t('detected', { unit: parsed.unit }) : undefined}
              />
              <Button onClick={() => setStamp(String(Math.floor(Date.now() / 1000)))}>{t('useNow')}</Button>
            </div>
            {parsed?.error && <Notice tone="error">{t('invalid')}</Notice>}
            {parsed && !parsed.error && (
              <KeyValueList
                rows={[
                  { label: t('local'), value: fmtLocal.format(parsed.date) },
                  { label: t('utc'), value: parsed.date.toUTCString() },
                  { label: t('iso'), value: parsed.date.toISOString() },
                  { label: t('relative'), value: relative(parsed.ms, locale), copy: false },
                  { label: t('weekday'), value: fmtWeekday.format(parsed.date), copy: false },
                ]}
              />
            )}
          </div>
        </Pane>

        <Pane title={t('toTimestamp')}>
          <div className="pane__pad stack">
            <div className="row">
              <Input
                label={t('date')}
                type="datetime-local"
                step="1"
                value={dateInput}
                onChange={(event) => setDateInput(event.target.value)}
                className="input--lg"
              />
              <Button onClick={() => setDateInput(toLocalInput(new Date()))}>{t('useNow')}</Button>
            </div>
            {fromDate && (
              <KeyValueList
                rows={[
                  { label: t('unixS'), value: String(Math.floor(fromDate.getTime() / 1000)) },
                  { label: t('unixMs'), value: String(fromDate.getTime()) },
                  { label: t('iso'), value: fromDate.toISOString() },
                  { label: t('utc'), value: fromDate.toUTCString() },
                ]}
              />
            )}
          </div>
        </Pane>
      </div>
    </div>
  );
}
