import { useCallback, useEffect, useRef, useState } from 'react';
import { usePageT } from '../context/PreferencesContext.jsx';
import { Button, Segmented, Stat, ToolHeader } from '../components/ui.jsx';
import { shuffle } from '../lib/random.js';
import { readJson, writeJson } from '../lib/storage.js';

const STRINGS = {
  pt: {
    level: 'Nível',
    easy: 'Fácil',
    medium: 'Médio',
    hard: 'Difícil',
    moves: 'Jogadas',
    time: 'Tempo',
    pairs: 'Pares',
    best: 'Recorde',
    newGame: 'Novo jogo',
    won: 'Você encontrou todos os pares em {moves} jogadas e {time}.',
    record: 'Novo recorde neste nível.',
    card: 'Carta {n}',
    hidden: 'virada para baixo',
  },
  en: {
    level: 'Level',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    moves: 'Moves',
    time: 'Time',
    pairs: 'Pairs',
    best: 'Best',
    newGame: 'New game',
    won: 'You found every pair in {moves} moves and {time}.',
    record: 'New record for this level.',
    card: 'Card {n}',
    hidden: 'face down',
  },
};

const SYMBOLS = ['{ }', '</>', '=>', '&&', '||', '[ ]', '#!', '$_', '@', '%', '::', '++', '!=', '?.', '**', '~/', '>>', ';;'];
const LEVELS = { easy: { pairs: 8, cols: 4 }, medium: { pairs: 10, cols: 5 }, hard: { pairs: 18, cols: 6 } };
const STORAGE_KEY = 'utilikit-memory-best';

const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function deal(level) {
  const symbols = shuffle(SYMBOLS).slice(0, LEVELS[level].pairs);
  return shuffle([...symbols, ...symbols]).map((symbol, id) => ({ id, symbol }));
}

export default function MemoryGamePage() {
  const t = usePageT(STRINGS);
  const [level, setLevel] = useState('easy');
  const [cards, setCards] = useState(() => deal('easy'));
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState(() => new Set());
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [best, setBest] = useState(() => readJson(STORAGE_KEY, {}));
  const [record, setRecord] = useState(false);
  const lock = useRef(false);
  const flipTimer = useRef(null);

  const total = LEVELS[level].pairs;
  const won = matched.size === total * 2;

  const newGame = useCallback((nextLevel = level) => {
    clearTimeout(flipTimer.current);
    lock.current = false;
    setLevel(nextLevel);
    setCards(deal(nextLevel));
    setOpen([]);
    setMatched(new Set());
    setMoves(0);
    setSeconds(0);
    setStarted(false);
    setRecord(false);
  }, [level]);

  useEffect(() => () => clearTimeout(flipTimer.current), []);

  useEffect(() => {
    if (!started || won) return undefined;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [started, won]);

  useEffect(() => {
    if (!won) return;
    const prev = best[level];
    if (!prev || moves < prev.moves || (moves === prev.moves && seconds < prev.seconds)) {
      const next = { ...best, [level]: { moves, seconds } };
      setBest(next);
      writeJson(STORAGE_KEY, next);
      setRecord(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won]);

  const flip = (card) => {
    if (lock.current || open.includes(card.id) || matched.has(card.id)) return;
    if (!started) setStarted(true);
    const next = [...open, card.id];
    setOpen(next);
    if (next.length < 2) return;

    setMoves((m) => m + 1);
    const [a, b] = next.map((id) => cards[id]);
    if (a.symbol === b.symbol) {
      setMatched((prev) => new Set([...prev, a.id, b.id]));
      setOpen([]);
    } else {
      lock.current = true;
      flipTimer.current = setTimeout(() => {
        setOpen([]);
        lock.current = false;
      }, 800);
    }
  };

  const bestHere = best[level];

  return (
    <div className="tool tool--narrow">
      <ToolHeader title={t('tools.memory.name')} description={t('tools.memory.long')} />

      <div className="row">
        <Segmented
          label={t('level')}
          value={level}
          onChange={(v) => newGame(v)}
          options={[
            { value: 'easy', label: `${t('easy')} 4×4` },
            { value: 'medium', label: `${t('medium')} 5×4` },
            { value: 'hard', label: `${t('hard')} 6×6` },
          ]}
        />
        <Button icon="refresh" onClick={() => newGame()}>
          {t('newGame')}
        </Button>
      </div>

      <div className="stats">
        <Stat label={t('moves')} value={moves} />
        <Stat label={t('time')} value={fmtTime(seconds)} />
        <Stat label={t('pairs')} value={`${matched.size / 2}/${total}`} />
        <Stat label={t('best')} value={bestHere ? `${bestHere.moves} · ${fmtTime(bestHere.seconds)}` : '—'} />
      </div>

      {won && (
        <div className="win" role="status">
          <p>{t('won', { moves, time: fmtTime(seconds) })}</p>
          {record && <p className="win__record">{t('record')}</p>}
          <Button variant="primary" icon="refresh" onClick={() => newGame()}>
            {t('newGame')}
          </Button>
        </div>
      )}

      <div className="memory" style={{ '--cols': LEVELS[level].cols }}>
        {cards.map((card, index) => {
          const faceUp = open.includes(card.id) || matched.has(card.id);
          return (
            <button
              key={`${level}-${card.id}`}
              type="button"
              className={`memory__card${faceUp ? ' is-up' : ''}${matched.has(card.id) ? ' is-matched' : ''}`}
              onClick={() => flip(card)}
              disabled={matched.has(card.id)}
              aria-label={`${t('card', { n: index + 1 })}: ${faceUp ? card.symbol : t('hidden')}`}
            >
              <span className="memory__inner">
                <span className="memory__back" aria-hidden="true" />
                <span className="memory__face" aria-hidden="true">
                  {card.symbol}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
