import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SiteHeader } from '../components/SiteHeader';
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

    const randomIndex = Math.floor(Math.random() * items.length);
    const segmentAngle = 360 / items.length;
    const targetAngle = 360 - (randomIndex * segmentAngle) - (segmentAngle / 2);
    const spins = 5 + Math.random() * 3; // 5-8 full spins
    const totalRotation = rotation + (spins * 360) + targetAngle - (rotation % 360);

    setRotation(totalRotation);

    setTimeout(() => {
      setWinner(items[randomIndex]);
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
      <SiteHeader onNavigate={onNavigate} variant="tool" />

      <header className="hero">
        <div className="hero__content">
          <h1>{t('randomPickerTitle')}</h1>
          <p className="hero__subtitle">{t('randomPickerSubtitle')}</p>
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
                transition: isSpinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
              }}
            >
              {items.map((item, index) => {
                const angle = (index * 360) / items.length;
                const color = colors[index % colors.length];
                return (
                  <div
                    key={index}
                    className="random-picker__segment"
                    style={{
                      transform: `rotate(${angle}deg) skewY(-${90 - 360 / items.length}deg)`,
                      backgroundColor: color,
                      transformOrigin: 'center'
                    }}
                  >
                    <span
                      className="random-picker__segment-text"
                      style={{
                        transform: `skewY(${90 - 360 / items.length}deg) rotate(${360 / items.length / 2}deg)`
                      }}
                    >
                      {item.length > 15 ? item.substring(0, 15) + '...' : item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {winner && (
            <div className="random-picker__result">
              <div className="random-picker__result-content">
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
