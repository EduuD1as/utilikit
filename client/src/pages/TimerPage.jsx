import { useCallback, useEffect, useRef, useState } from 'react';
import { usePageT } from '../context/PreferencesContext.jsx';
import { Button, Checkbox, Input, Kbd, Pane, Segmented, ToolHeader } from '../components/ui.jsx';
import { readJson, writeJson } from '../lib/storage.js';

const STRINGS = {
  pt: {
    focus: 'Foco',
    short: 'Pausa curta',
    long: 'Pausa longa',
    start: 'Iniciar',
    resume: 'Continuar',
    pause: 'Pausar',
    skip: 'Pular',
    settings: 'Durações (minutos)',
    autoStart: 'Iniciar a próxima etapa automaticamente',
    sound: 'Tocar som ao terminar',
    cycle: 'Ciclo {n} de 4',
    done: '{n} ciclos de foco concluídos hoje',
    shortcuts: 'atalhos',
    space: 'Espaço',
    toggle: 'iniciar/pausar',
    reset: 'reiniciar',
  },
  en: {
    focus: 'Focus',
    short: 'Short break',
    long: 'Long break',
    start: 'Start',
    resume: 'Resume',
    pause: 'Pause',
    skip: 'Skip',
    settings: 'Durations (minutes)',
    autoStart: 'Start the next step automatically',
    sound: 'Play a sound when done',
    cycle: 'Cycle {n} of 4',
    done: '{n} focus cycles completed today',
    shortcuts: 'shortcuts',
    space: 'Space',
    toggle: 'start/pause',
    reset: 'reset',
  },
};

const STORAGE_KEY = 'utilikit-timer';
const DEFAULTS = { focus: 25, short: 5, long: 15, autoStart: false, sound: true };

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.35, 0.7].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.3);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch {
    // Sem Web Audio: segue sem som.
  }
}

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function TimerPage() {
  const t = usePageT(STRINGS);
  const [settings, setSettings] = useState(() => ({ ...DEFAULTS, ...readJson(STORAGE_KEY, {}) }));
  const [phase, setPhase] = useState('focus');
  const [remaining, setRemaining] = useState(settings.focus * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const endRef = useRef(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => writeJson(STORAGE_KEY, settings), [settings]);

  const total = settings[phase] * 60;

  const goTo = useCallback((next, autoStart = false) => {
    setPhase(next);
    const secs = settingsRef.current[next] * 60;
    setRemaining(secs);
    if (autoStart) {
      endRef.current = Date.now() + secs * 1000;
      setRunning(true);
    } else {
      endRef.current = null;
      setRunning(false);
    }
  }, []);

  const finish = useCallback(() => {
    if (settingsRef.current.sound) beep();
    const auto = settingsRef.current.autoStart;
    if (phase === 'focus') {
      const n = completed + 1;
      setCompleted(n);
      goTo(n % 4 === 0 ? 'long' : 'short', auto);
    } else {
      goTo('focus', auto);
    }
  }, [phase, completed, goTo]);

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      const left = Math.max(0, Math.round((endRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) finish();
    }, 250);
    return () => clearInterval(id);
  }, [running, finish]);

  const start = useCallback(() => {
    if (remaining <= 0) return;
    endRef.current = Date.now() + remaining * 1000;
    setRunning(true);
  }, [remaining]);

  const pause = useCallback(() => {
    setRunning(false);
    endRef.current = null;
  }, []);

  const reset = useCallback(() => goTo(phase), [goTo, phase]);

  // Título da aba mostra o tempo restante.
  useEffect(() => {
    const previous = document.title;
    if (running) document.title = `${fmt(remaining)} · ${t(phase)}`;
    return () => {
      document.title = previous;
    };
  }, [running, remaining, phase, t]);

  useEffect(() => {
    const onKey = (event) => {
      if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(event.target.tagName)) return;
      if (event.code === 'Space') {
        event.preventDefault();
        if (running) pause();
        else start();
      } else if (event.key.toLowerCase() === 'r' && !event.ctrlKey && !event.metaKey) {
        reset();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running, start, pause, reset]);

  const setDuration = (key) => (event) => {
    const value = Math.min(180, Math.max(1, Math.round(Number(event.target.value) || 1)));
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (key === phase && !running) setRemaining(value * 60);
  };

  const progress = total ? 1 - remaining / total : 0;
  const R = 130;
  const C = 2 * Math.PI * R;

  return (
    <div className="tool tool--narrow">
      <ToolHeader title={t('tools.timer.name')} description={t('tools.timer.long')} />

      <Segmented
        label={t('tools.timer.name')}
        value={phase}
        size="lg"
        onChange={(next) => goTo(next)}
        options={[
          { value: 'focus', label: t('focus') },
          { value: 'short', label: t('short') },
          { value: 'long', label: t('long') },
        ]}
      />

      <div className={`timer timer--${phase}`}>
        <svg viewBox="0 0 300 300" className="timer__ring" aria-hidden="true">
          <circle cx="150" cy="150" r={R} className="timer__track" />
          <circle
            cx="150"
            cy="150"
            r={R}
            className="timer__progress"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
          />
        </svg>
        <div className="timer__center">
          <div className="timer__time" role="timer" aria-live="off">
            {fmt(remaining)}
          </div>
          <div className="timer__cycle muted">
            {t('cycle', { n: (completed % 4) + (phase === 'focus' ? 1 : 0) || 4 })}
          </div>
        </div>
      </div>

      <div className="row row--center">
        {running ? (
          <Button size="lg" icon="pause" onClick={pause}>
            {t('pause')}
          </Button>
        ) : (
          <Button size="lg" variant="primary" icon="play" onClick={start}>
            {remaining === total ? t('start') : t('resume')}
          </Button>
        )}
        <Button size="lg" icon="refresh" onClick={reset}>
          {t('common.reset')}
        </Button>
        <Button size="lg" variant="ghost" onClick={finish}>
          {t('skip')}
        </Button>
      </div>

      <p className="hint row--center row">
        {t('shortcuts')}: <Kbd>{t('space')}</Kbd> {t('toggle')} · <Kbd>R</Kbd> {t('reset')}
      </p>
      {completed > 0 && <p className="muted row--center row">{t('done', { n: completed })}</p>}

      <Pane title={t('settings')}>
        <div className="pane__pad stack">
          <div className="grid-3">
            {['focus', 'short', 'long'].map((key) => (
              <Input
                key={key}
                label={t(key)}
                type="number"
                min={1}
                max={180}
                value={settings[key]}
                onChange={setDuration(key)}
                suffix="min"
              />
            ))}
          </div>
          <Checkbox
            label={t('autoStart')}
            checked={settings.autoStart}
            onChange={(autoStart) => setSettings((prev) => ({ ...prev, autoStart }))}
          />
          <Checkbox
            label={t('sound')}
            checked={settings.sound}
            onChange={(sound) => setSettings((prev) => ({ ...prev, sound }))}
          />
        </div>
      </Pane>
    </div>
  );
}
