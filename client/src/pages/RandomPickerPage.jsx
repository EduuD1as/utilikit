import { useEffect, useMemo, useRef, useState } from 'react';
import { usePageT } from '../context/PreferencesContext.jsx';
import { Button, Checkbox, Pane, ToolHeader } from '../components/ui.jsx';
import { randomInt, shuffle } from '../lib/random.js';
import { readJson, writeJson } from '../lib/storage.js';

const STRINGS = {
  pt: {
    options: 'Opções (uma por linha)',
    spin: 'Girar',
    spinning: 'Girando…',
    winner: 'Resultado',
    removeWinner: 'Remover o sorteado da lista após girar',
    shuffle: 'Embaralhar',
    needTwo: 'Adicione pelo menos duas opções.',
    count: '{n} opções',
    defaults: 'Pizza\nHambúrguer\nSushi\nSalada\nTacos\nMassa',
  },
  en: {
    options: 'Options (one per line)',
    spin: 'Spin',
    spinning: 'Spinning…',
    winner: 'Result',
    removeWinner: 'Remove the picked option after spinning',
    shuffle: 'Shuffle',
    needTwo: 'Add at least two options.',
    count: '{n} options',
    defaults: 'Pizza\nBurger\nSushi\nSalad\nTacos\nPasta',
  },
};

const STORAGE_KEY = 'utilikit-picker';
const SPIN_MS = 4200;

function polar(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function slicePath(index, count) {
  if (count === 1) return 'M150 150 m-140 0 a140 140 0 1 0 280 0 a140 140 0 1 0 -280 0';
  const a0 = (index * 360) / count;
  const a1 = ((index + 1) * 360) / count;
  const [x0, y0] = polar(150, 150, 140, a0);
  const [x1, y1] = polar(150, 150, 140, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M150 150 L${x0} ${y0} A140 140 0 ${large} 1 ${x1} ${y1} Z`;
}

export default function RandomPickerPage() {
  const t = usePageT(STRINGS);
  const [text, setText] = useState(() => readJson(STORAGE_KEY, null)?.text ?? t('defaults'));
  const [removeWinner, setRemoveWinner] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const timer = useRef(null);

  useEffect(() => writeJson(STORAGE_KEY, { text }), [text]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const items = useMemo(
    () =>
      text
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    [text]
  );

  const spin = () => {
    if (items.length < 2 || spinning) return;
    const count = items.length;
    const index = randomInt(count);
    const seg = 360 / count;
    // Ponto aleatório dentro da fatia sorteada, longe das bordas.
    const target = index * seg + seg * (0.15 + (randomInt(1000) / 1000) * 0.7);
    const current = ((rotation % 360) + 360) % 360;
    const delta = (360 - target - current + 720) % 360;
    setRotation(rotation + 360 * 6 + delta);
    setSpinning(true);
    setWinner(null);
    timer.current = setTimeout(() => {
      setSpinning(false);
      setWinner(items[index]);
      if (removeWinner) {
        const lines = text.split('\n');
        const pos = lines.findIndex((line) => line.trim() === items[index]);
        if (pos > -1) lines.splice(pos, 1);
        setText(lines.join('\n'));
      }
    }, SPIN_MS);
  };

  const fontSize = items.length > 16 ? 9 : items.length > 10 ? 11 : 13;

  return (
    <div className="tool">
      <ToolHeader title={t('tools.picker.name')} description={t('tools.picker.long')} />

      <div className="picker">
        <div className="picker__stage">
          <div className="picker__wheel-wrap">
            <span className="picker__pointer" aria-hidden="true" />
            <svg
              viewBox="0 0 300 300"
              className="picker__wheel"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.7, 0.1, 1)` : 'none',
              }}
              role="img"
              aria-label={t('tools.picker.name')}
            >
              {items.length === 0 && <circle cx="150" cy="150" r="140" className="picker__empty" />}
              {items.map((item, index) => {
                const mid = ((index + 0.5) * 360) / items.length;
                const [tx, ty] = polar(150, 150, 84, mid);
                const label = item.length > 16 ? `${item.slice(0, 15)}…` : item;
                return (
                  <g key={`${index}-${item}`}>
                    <path d={slicePath(index, items.length)} className={`picker__slice picker__slice--${index % 8}`} />
                    <text
                      x={tx}
                      y={ty}
                      fontSize={fontSize}
                      className="picker__label"
                      transform={`rotate(${mid - 90} ${tx} ${ty})`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}
              <circle cx="150" cy="150" r="16" className="picker__hub" />
            </svg>
          </div>

          <div className="picker__result" aria-live="polite">
            <span className="muted">{t('winner')}</span>
            <strong className="picker__winner">{winner ?? (spinning ? t('spinning') : '—')}</strong>
          </div>

          <Button variant="primary" size="lg" onClick={spin} disabled={items.length < 2 || spinning}>
            {spinning ? t('spinning') : t('spin')}
          </Button>
        </div>

        <Pane
          title={t('options')}
          meta={t('count', { n: items.length })}
          actions={
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setText(shuffle(items).join('\n'))}
              disabled={spinning || items.length < 2}
            >
              {t('shuffle')}
            </Button>
          }
        >
          <div className="pane__pad stack">
            <textarea
              className="textarea picker__input"
              value={text}
              onChange={(event) => setText(event.target.value)}
              disabled={spinning}
              aria-label={t('options')}
              rows={12}
            />
            {items.length < 2 && <p className="field__hint">{t('needTwo')}</p>}
            <Checkbox label={t('removeWinner')} checked={removeWinner} onChange={setRemoveWinner} />
          </div>
        </Pane>
      </div>
    </div>
  );
}
