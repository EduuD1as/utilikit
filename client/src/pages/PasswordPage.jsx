import { useCallback, useEffect, useState } from 'react';
import { usePageT } from '../context/PreferencesContext.jsx';
import { Button, Checkbox, CopyButton, Pane, Segmented, ToolHeader } from '../components/ui.jsx';
import { randomInt, shuffle } from '../lib/random.js';

const STRINGS = {
  pt: {
    mode: 'Tipo',
    password: 'Senha',
    pin: 'PIN numérico',
    length: 'Tamanho',
    lower: 'Minúsculas (a–z)',
    upper: 'Maiúsculas (A–Z)',
    digits: 'Números (0–9)',
    symbols: 'Símbolos (!@#…)',
    ambiguous: 'Evitar caracteres parecidos (I, l, 1, O, 0)',
    pickOne: 'Escolha pelo menos um conjunto de caracteres.',
    entropy: '{bits} bits de entropia',
    crack: 'Tempo estimado para quebrar por força bruta: {time}',
    veryWeak: 'Muito fraca',
    weak: 'Fraca',
    fair: 'Razoável',
    strong: 'Forte',
    veryStrong: 'Muito forte',
    history: 'Geradas nesta sessão',
    instant: 'instantâneo',
    seconds: 'segundos',
    minutes: 'minutos',
    hours: 'horas',
    days: 'dias',
    years: '{n} anos',
    forever: 'mais que a idade do universo',
  },
  en: {
    mode: 'Type',
    password: 'Password',
    pin: 'Numeric PIN',
    length: 'Length',
    lower: 'Lowercase (a–z)',
    upper: 'Uppercase (A–Z)',
    digits: 'Numbers (0–9)',
    symbols: 'Symbols (!@#…)',
    ambiguous: 'Avoid look-alike characters (I, l, 1, O, 0)',
    pickOne: 'Pick at least one character set.',
    entropy: '{bits} bits of entropy',
    crack: 'Estimated brute-force time: {time}',
    veryWeak: 'Very weak',
    weak: 'Weak',
    fair: 'Fair',
    strong: 'Strong',
    veryStrong: 'Very strong',
    history: 'Generated this session',
    instant: 'instant',
    seconds: 'seconds',
    minutes: 'minutes',
    hours: 'hours',
    days: 'days',
    years: '{n} years',
    forever: 'longer than the age of the universe',
  },
};

const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?',
};
const AMBIGUOUS = /[Il1O0o]/g;

function strengthOf(bits) {
  if (bits < 28) return { key: 'veryWeak', level: 1 };
  if (bits < 40) return { key: 'weak', level: 2 };
  if (bits < 60) return { key: 'fair', level: 3 };
  if (bits < 90) return { key: 'strong', level: 4 };
  return { key: 'veryStrong', level: 5 };
}

/** Supõe um ataque offline de 10 bilhões de tentativas por segundo (metade do espaço). */
function crackTime(bits, t) {
  const seconds = 2 ** bits / 2 / 1e10;
  if (seconds < 1) return t('instant');
  if (seconds < 60) return `${Math.round(seconds)} ${t('seconds')}`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} ${t('minutes')}`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} ${t('hours')}`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} ${t('days')}`;
  const years = seconds / 31536000;
  if (years > 1.4e10) return t('forever');
  return t('years', { n: years < 1e6 ? Math.round(years).toLocaleString() : years.toExponential(1) });
}

export default function PasswordPage() {
  const t = usePageT(STRINGS);
  const [mode, setMode] = useState('password');
  const [length, setLength] = useState(20);
  const [sets, setSets] = useState({ lower: true, upper: true, digits: true, symbols: true });
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(true);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState([]);

  const pools = (mode === 'pin' ? ['digits'] : Object.keys(SETS).filter((k) => sets[k])).map((k) =>
    avoidAmbiguous && mode !== 'pin' ? SETS[k].replace(AMBIGUOUS, '') : SETS[k]
  );
  const alphabet = pools.join('');
  const size = mode === 'pin' ? Math.min(length, 12) : length;
  const bits = alphabet ? Math.round(size * Math.log2(alphabet.length)) : 0;
  const strength = strengthOf(bits);

  const generate = useCallback(() => {
    if (!alphabet) return setValue('');
    // Garante pelo menos um caractere de cada conjunto escolhido.
    const chars = pools.map((pool) => pool[randomInt(pool.length)]);
    while (chars.length < size) chars.push(alphabet[randomInt(alphabet.length)]);
    const next = shuffle(chars.slice(0, size)).join('');
    setValue(next);
    setHistory((prev) => [next, ...prev].slice(0, 6));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alphabet, size]);

  useEffect(generate, [generate]);

  return (
    <div className="tool tool--narrow">
      <ToolHeader title={t('tools.password.name')} description={t('tools.password.long')} />

      <div className="password-out">
        <code className="password-out__value">{value || '—'}</code>
        <div className="password-out__actions">
          <Button icon="refresh" onClick={generate} disabled={!alphabet}>
            {t('common.generate')}
          </Button>
          <CopyButton value={value} variant="primary" />
        </div>
      </div>

      {alphabet && (
        <div className="meter" data-level={strength.level}>
          <div className="meter__bar">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={n <= strength.level ? 'on' : undefined} />
            ))}
          </div>
          <p className="meter__label">
            <strong>{t(strength.key)}</strong> · {t('entropy', { bits })}
          </p>
          <p className="field__hint">{t('crack', { time: crackTime(bits, t) })}</p>
        </div>
      )}

      <Pane title={t('common.moreOptions')}>
        <div className="pane__pad stack">
          <Segmented
            label={t('mode')}
            value={mode}
            onChange={(v) => {
              setMode(v);
              setLength(v === 'pin' ? 6 : 20);
            }}
            options={[
              { value: 'password', label: t('password') },
              { value: 'pin', label: t('pin') },
            ]}
          />
          <div className="field">
            <span className="field__label">
              {t('length')}: <b className="mono">{size}</b>
            </span>
            <input
              type="range"
              min={mode === 'pin' ? 4 : 8}
              max={mode === 'pin' ? 12 : 128}
              value={size}
              onChange={(event) => setLength(Number(event.target.value))}
              aria-label={t('length')}
            />
          </div>
          {mode === 'password' && (
            <div className="grid-2">
              {Object.keys(SETS).map((key) => (
                <Checkbox
                  key={key}
                  label={t(key)}
                  checked={sets[key]}
                  onChange={(on) => setSets((prev) => ({ ...prev, [key]: on }))}
                />
              ))}
              <Checkbox label={t('ambiguous')} checked={avoidAmbiguous} onChange={setAvoidAmbiguous} />
            </div>
          )}
          {!alphabet && <p className="field__hint">{t('pickOne')}</p>}
        </div>
      </Pane>

      {history.length > 1 && (
        <Pane title={t('history')}>
          <ul className="id-list pane__pad">
            {history.slice(1).map((item, index) => (
              <li key={`${index}-${item}`}>
                <code>{item}</code>
                <CopyButton value={item} iconOnly />
              </li>
            ))}
          </ul>
        </Pane>
      )}
    </div>
  );
}
