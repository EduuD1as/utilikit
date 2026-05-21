import { useEffect, useRef } from 'react';

function formatCount(n) {
  if (n == null) return '—';
  return new Intl.NumberFormat('pt-BR').format(n);
}

export function SubscriberCounter({ count, delta, hidden }) {
  const numberRef = useRef(null);
  const prevCount = useRef(count);

  useEffect(() => {
    if (
      count == null ||
      hidden ||
      prevCount.current == null ||
      count === prevCount.current
    ) {
      prevCount.current = count;
      return;
    }

    const increased = count > prevCount.current;
    prevCount.current = count;
    const el = numberRef.current;
    if (!el) return;

    el.classList.remove(
      'counter-card__number--updated',
      'counter-card__number--up',
      'counter-card__number--down'
    );
    void el.offsetWidth;
    el.classList.add(
      increased
        ? 'counter-card__number--up'
        : 'counter-card__number--down'
    );

    const timer = setTimeout(() => {
      el.classList.remove(
        'counter-card__number--up',
        'counter-card__number--down'
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [count, hidden]);

  const showDelta = !hidden && delta !== 0;

  return (
    <div className="counter-card">
      <div className="counter-card__inner">
        <div className="counter-card__header">
          <span className="counter-card__label">Inscritos</span>
          {!hidden && count != null && (
            <span className="counter-card__live" aria-hidden="true">
              <span className="counter-card__live-dot" />
              Ao vivo
            </span>
          )}
        </div>

        <div className="counter-card__row" aria-live="polite" aria-atomic="true">
          {hidden ? (
            <p className="counter-card__hidden">Contagem oculta pelo canal</p>
          ) : (
            <>
              <span ref={numberRef} className="counter-card__number">
                {formatCount(count)}
              </span>
              {showDelta && (
                <span
                  className={`counter-card__delta ${
                    delta > 0 ? 'counter-card__delta--up' : 'counter-card__delta--down'
                  }`}
                >
                  {delta > 0 ? '+' : ''}
                  {formatCount(delta)}
                </span>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
