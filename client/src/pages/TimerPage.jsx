import { useCallback, useEffect, useRef, useState } from 'react';
import { Logo } from '../components/Logo.jsx';
import { SiteFooter } from '../components/SiteFooter.jsx';

const MODES = {
  pomodoro: { label: 'Pomodoro', minutes: 25, color: '#ef4444' },
  shortBreak: { label: 'Pausa curta', minutes: 5, color: '#22c55e' },
  longBreak: { label: 'Pausa longa', minutes: 15, color: '#3b82f6' },
  custom: { label: 'Personalizado', minutes: 10, color: '#8b5cf6' },
};

export function TimerPage({ onNavigate }) {
  const [mode, setMode] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(MODES.pomodoro.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(10);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef(null);
  const endTimeRef = useRef(null);

  const totalSeconds = useCallback(() => {
    if (mode === 'custom') return customMinutes * 60;
    return MODES[mode].minutes * 60;
  }, [mode, customMinutes]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progress = ((totalSeconds() - timeLeft) / totalSeconds()) * 100;
  const currentColor = MODES[mode].color;

  const start = useCallback(() => {
    if (timeLeft <= 0) return;
    
    endTimeRef.current = Date.now() + timeLeft * 1000;
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsRunning(false);
        
        // Tocar som de notificação (vibração se disponível)
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200, 100, 200]);
        }
        
        // Incrementar ciclos se for pomodoro
        if (mode === 'pomodoro') {
          setCycles(c => c + 1);
        }
      }
    }, 100);
  }, [timeLeft, mode]);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    endTimeRef.current = null;
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    endTimeRef.current = null;
    setIsRunning(false);
    setTimeLeft(totalSeconds());
  }, [totalSeconds]);

  const switchMode = (newMode) => {
    setMode(newMode);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    endTimeRef.current = null;
    setIsRunning(false);
    if (newMode === 'custom') {
      setTimeLeft(customMinutes * 60);
    } else {
      setTimeLeft(MODES[newMode].minutes * 60);
    }
  };

  const handleCustomChange = (e) => {
    const value = Math.max(1, Math.min(180, parseInt(e.target.value) || 1));
    setCustomMinutes(value);
    if (!isRunning && mode === 'custom') {
      setTimeLeft(value * 60);
    }
  };

  // Limpar intervalo ao desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        if (isRunning) {
          pause();
        } else {
          start();
        }
      } else if (e.code === 'Escape') {
        reset();
      } else if (e.code === 'KeyR' && e.ctrlKey) {
        e.preventDefault();
        reset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, start, pause, reset]);

  // Atualizar título da página
  useEffect(() => {
    const originalTitle = document.title;
    if (isRunning) {
      document.title = `${formatTime(timeLeft)} - Timer`;
    }
    return () => {
      document.title = originalTitle;
    };
  }, [timeLeft, isRunning]);

  return (
    <div className="app app--timer">
      <header className="hero">
        <div className="hero__brand">
          <Logo size={52} className="hero__logo" onNavigate={onNavigate} />
          <div>
            <button
              type="button"
              className="hero__back"
              onClick={() => onNavigate('/')}
            >
              ← Todas as ferramentas
            </button>
            <h1>Timer / Pomodoro</h1>
            <p className="hero__subtitle">
              Temporizador com modo Pomodoro e pausas programadas
            </p>
          </div>
        </div>
      </header>

      <main className="panel fx-panel">
        <div className="fx-converter">
          {/* Seletor de modo */}
          <div className="timer-modes">
            {Object.entries(MODES).map(([key, config]) => (
              <button
                key={key}
                type="button"
                className={`timer-mode-btn${mode === key ? ' timer-mode-btn--active' : ''}`}
                onClick={() => switchMode(key)}
                disabled={isRunning}
                style={{
                  '--mode-color': config.color,
                }}
              >
                {config.label}
              </button>
            ))}
          </div>

          {/* Input personalizado */}
          {mode === 'custom' && (
            <div className="fx-field">
              <label className="fx-field__label">Minutos (1-180)</label>
              <input
                type="number"
                className="fx-field__amount"
                value={customMinutes}
                onChange={handleCustomChange}
                min="1"
                max="180"
                disabled={isRunning}
              />
            </div>
          )}

          {/* Display do timer */}
          <div className="timer-display" style={{ '--timer-color': currentColor }}>
            <div className="timer-display__ring">
              <svg className="timer-display__svg" viewBox="0 0 200 200">
                <circle
                  className="timer-display__bg"
                  cx="100"
                  cy="100"
                  r="90"
                />
                <circle
                  className="timer-display__progress"
                  cx="100"
                  cy="100"
                  r="90"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 90}`,
                    strokeDashoffset: `${2 * Math.PI * 90 * (1 - progress / 100)}`,
                  }}
                />
              </svg>
              <div className="timer-display__time">{formatTime(timeLeft)}</div>
            </div>
          </div>

          {/* Controles */}
          <div className="timer-controls">
            {!isRunning ? (
              <button
                type="button"
                className="timer-btn timer-btn--primary"
                onClick={start}
                disabled={timeLeft <= 0}
              >
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M8 5v14l11-7z" />
                </svg>
                {timeLeft === totalSeconds() ? 'Iniciar' : 'Continuar'}
              </button>
            ) : (
              <button
                type="button"
                className="timer-btn timer-btn--pause"
                onClick={pause}
              >
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
                Pausar
              </button>
            )}
            <button
              type="button"
              className="timer-btn timer-btn--secondary"
              onClick={reset}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
              </svg>
              Reiniciar
            </button>
          </div>

          {/* Informações */}
          <div className="timer-info">
            {mode === 'pomodoro' && cycles > 0 && (
              <div className="timer-info__item">
                <span className="timer-info__label">Ciclos completados:</span>
                <span className="timer-info__value">{cycles}</span>
              </div>
            )}
            <div className="timer-info__item">
              <span className="timer-info__label">Modo atual:</span>
              <span className="timer-info__value" style={{ color: currentColor }}>
                {MODES[mode].label} ({MODES[mode].minutes}min)
              </span>
            </div>
          </div>
        </div>

        <p className="fx-disclaimer">
          💡 Dica: Use a barra de espaço para iniciar/pausar, Esc para reiniciar. 
          O timer continua rodando mesmo com a aba em segundo plano.
        </p>
      </main>

      <SiteFooter
        onNavigate={onNavigate}
        note="Timer com suporte a Pomodoro e notificação por vibração."
      />
    </div>
  );
}