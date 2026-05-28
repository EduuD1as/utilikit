import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from '../components/Logo';
import { SiteFooter } from '../components/SiteFooter';

export default function RandomPickerPage({ onNavigate }) {
  const { t } = useLanguage();
  const [items, setItems] = useState(['Opção 1', 'Opção 2', 'Opção 3', 'Opção 4']);
  const [inputValue, setInputValue] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef(null);

  const addItem = () => {
    if (inputValue.trim()) {
      setItems([...items, inputValue.trim()]);
      setInputValue('');
      setWinner(null);
    }
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
    setWinner(null);
  };

  const clearAll = () => {
    setItems([]);
    setWinner(null);
    setRotation(0);
  };

  const spinWheel = () => {
    if (items.length < 2 || isSpinning) return;

    setIsSpinning(true);
    setWinner(null);

    const segmentAngle = 360 / items.length;
    const spins = 5 + Math.random() * 3; // 5-8 full spins
    const randomAngle = Math.random() * 360;
    const totalRotation = rotation + (spins * 360) + randomAngle;

    setRotation(totalRotation);

    setTimeout(() => {
      // Calcular qual segmento está sob o ponteiro (topo)
      const finalAngle = totalRotation % 360;
      // O ponteiro está no topo (0 graus), então precisamos calcular qual segmento está lá
      // Como a roleta gira no sentido horário, o segmento sob o ponteiro é:
      const pointerAngle = (360 - finalAngle) % 360;
      const winningIndex = Math.floor(pointerAngle / segmentAngle);
      setWinner(items[winningIndex]);
      setIsSpinning(false);
    }, 5000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addItem();
    }
  };

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1'
  ];

  return (
    <div className="app app--random-picker">
      <header className="hero">
        <div className="hero__brand">
          <Logo size={52} className="hero__logo" onNavigate={onNavigate} />
          <div>
            <button
              type="button"
              className="hero__back"
              onClick={() => onNavigate('/')}
            >
              ← {t('backToTools')}
            </button>
            <h1>{t('randomPickerTitle')}</h1>
            <p className="hero__subtitle">
              {t('randomPickerSubtitle')}
            </p>
          </div>
        </div>
      </header>

      <main className="panel">
        <div className="random-picker">
          <div className="random-picker__wheel-container">
            <div className="random-picker__pointer">▼</div>
            <div
              ref={wheelRef}
              className="random-picker__wheel"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                background: items.length > 0
                  ? `conic-gradient(
                      ${items.map((item, index) => {
                    const angle = (index * 360) / items.length;
                    const color = colors[index % colors.length];
                    return `${color} ${angle}deg ${(angle + 360 / items.length)}deg`;
                  }).join(', ')}
                    )`
                  : '#ccc',
              }}
            >
              {items.map((item, index) => {
                const angle = (index * 360) / items.length;
                const segmentAngle = 360 / items.length;
                const textAngle = angle + segmentAngle / 2;
                const radius = 35; // percentage from center (reduzido de 45 para 35)
                const x = 50 + radius * Math.cos((textAngle - 90) * Math.PI / 180);
                const y = 50 + radius * Math.sin((textAngle - 90) * Math.PI / 180);

                return (
                  <span
                    key={index}
                    className="random-picker__segment-text"
                    style={{
                      position: 'absolute',
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                      fontSize: items.length > 8 ? '0.7rem' : '1rem',
                      fontWeight: 700,
                      color: '#fff',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.4)',
                      whiteSpace: 'nowrap',
                      textAlign: 'center',
                      zIndex: 2,
                      padding: '0.5rem',
                    }}
                  >
                    {item.length > 15 ? item.substring(0, 15) + '...' : item}
                  </span>
                );
              })}
            </div>
          </div>

          {winner && (
            <div className="random-picker__result">
              <div className="random-picker__result-content">
                <button className="btn-ghost random-picker__close" onClick={() => setWinner(null)}>
                  ✕
                </button>
                <h2>{t('winner')}</h2>
                <p className="random-picker__winner-text">{winner}</p>
                <button className="search__btn" onClick={spinWheel}>
                  {t('spinAgain')}
                </button>
              </div>
            </div>
          )}

          <div className="random-picker__controls">
            <div className="random-picker__input-group">
              <input
                type="text"
                className="search__input"
                placeholder={t('addOptionPlaceholder')}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSpinning}
              />
              <button className="search__btn" onClick={addItem} disabled={isSpinning}>
                {t('add')}
              </button>
            </div>

            <div className="random-picker__items-list">
              <div className="random-picker__items-header">
                <span>{t('options')} ({items.length})</span>
                <button className="btn-ghost" onClick={clearAll} disabled={isSpinning || items.length === 0}>
                  {t('clearAll')}
                </button>
              </div>
              <div className="random-picker__items">
                {items.map((item, index) => (
                  <div key={index} className="random-picker__item">
                    <span className="random-picker__item-text">{item}</span>
                    <button
                      className="btn-ghost btn-ghost--danger"
                      onClick={() => removeItem(index)}
                      disabled={isSpinning}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              className="search__btn search__btn--large"
              onClick={spinWheel}
              disabled={items.length < 2 || isSpinning}
            >
              {isSpinning ? t('spinning') : t('spinWheel')}
            </button>
          </div>
        </div>
      </main>

      <SiteFooter onNavigate={onNavigate} />
    </div>
  );
}
