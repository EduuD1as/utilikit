import { useEffect, useRef } from 'react';

function formatCount(n) {
  if (n == null) return '-';
  return new Intl.NumberFormat('pt-BR').format(n);
}

export function SubscriberCounter({ count, delta, hidden }) {
  const prevCount = useRef(count);
  const previous = prevCount.current;
  const formatted = formatCount(count);
  const previousFormatted = formatCount(previous);
  const direction =
    count != null && previous != null && count < previous ? 'down' : 'up';
  const shouldAnimate =
    !hidden && count != null && previous != null && count !== previous;

  useEffect(() => {
    prevCount.current = count;
  }, [count, hidden]);

  const showDelta = !hidden && delta !== 0;
  const maxLength = Math.max(formatted.length, previousFormatted.length);
  const padded = formatted.padStart(maxLength, ' ');
  const previousPadded = previousFormatted.padStart(maxLength, ' ');

  return (
    <div className="counter-card">
      <div className="counter-card__inner">
        <div className="counter-card__header">
          <span className="counter-card__label">{t('subscribers')}</span>
          {!hidden && count != null && (
            <span className="counter-card__live" aria-hidden="true">
              <span className="counter-card__live-dot" />
              {t('live')}
            </span>
          )}
        </div>

        <div className="counter-card__row" aria-live="polite" aria-atomic="true">
          {hidden ? (
            <p className="counter-card__hidden">{t('countHidden')}</p>
          ) : (
            <div className="counter-card__main">
              <span
                className={`counter-card__number counter-card__number--${direction}`}
              >
                {padded.split('').map((char, index) => {
                  const oldChar = previousPadded[index];
                  const changed = shouldAnimate && char !== oldChar;
                  const isDigit = /\d/.test(char) && /\d/.test(oldChar);

                  if (!changed || !isDigit) {
                    return (
                      <span
                        key={`${index}-${char}`}
                        className="counter-card__digit counter-card__digit--static"
                      >
                        {char}
                      </span>
                    );
                  }

                  return (
                    <span
                      key={`${index}-${oldChar}-${char}-${count}`}
                      className="counter-card__digit counter-card__digit--rolling"
                    >
                      <span className="counter-card__digit-old">{oldChar}</span>
                      <span className="counter-card__digit-new">{char}</span>
                    </span>
                  );
                })}
              </span>
              {showDelta && (
                <span
                  className={`counter-card__delta ${delta > 0 ? 'counter-card__delta--up' : 'counter-card__delta--down'
                    }`}
                >
                  {delta > 0 ? '+' : ''}
                  {formatCount(delta)}
                </span>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
