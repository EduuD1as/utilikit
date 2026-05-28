import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from '../components/Logo';
import { SiteFooter } from '../components/SiteFooter';

const EMOJIS = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎪', '🎸', '🎺', '🎻', '🎹', '🎬'];

export default function MemoryGamePage({ onNavigate }) {
  const { t } = useLanguage();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [removed, setRemoved] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [bestScore, setBestScore] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('memoryGameBestScore');
    if (saved) {
      setBestScore(parseInt(saved, 10));
    }
  }, []);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffledCards = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji }));
    setCards(shuffledCards);
    setFlipped([]);
    setMatched([]);
    setRemoved([]);
    setMoves(0);
    setGameOver(false);
  };

  const handleCardClick = (cardId) => {
    if (flipped.length === 2 || flipped.includes(cardId) || matched.includes(cardId)) {
      return;
    }

    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlipped;

      if (cards[first].emoji === cards[second].emoji) {
        setMatched([...matched, first, second]);
        setFlipped([]);

        // Remove as cartas após um delay para animação
        setTimeout(() => {
          setRemoved([...removed, first, second]);
        }, 1200);

        if (matched.length + 2 === cards.length) {
          setTimeout(() => {
            setGameOver(true);
            const currentBest = localStorage.getItem('memoryGameBestScore');
            if (!currentBest || moves + 1 < parseInt(currentBest, 10)) {
              localStorage.setItem('memoryGameBestScore', (moves + 1).toString());
              setBestScore(moves + 1);
            }
          }, 500);
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const handleRestart = () => {
    initializeGame();
  };

  return (
    <div className="app app--memory">
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
            <h1>{t('memoryGameTitle')}</h1>
            <p className="hero__subtitle">
              {t('memoryGameSubtitle')}
            </p>
          </div>
        </div>
      </header>

      <main className="panel">
        <div className="memory-game">
          <div className="memory-game__stats">
            <div className="memory-game__stat">
              <span className="memory-game__stat-label">{t('moves')}</span>
              <span className="memory-game__stat-value">{moves}</span>
            </div>
            <div className="memory-game__stat">
              <span className="memory-game__stat-label">{t('bestScore')}</span>
              <span className="memory-game__stat-value">{bestScore || '-'}</span>
            </div>
            <button className="btn-ghost" onClick={handleRestart}>
              {t('restart')}
            </button>
          </div>

          <div className="memory-game__grid">
            {cards.map((card) => (
              <button
                key={card.id}
                className={`memory-card ${flipped.includes(card.id) || matched.includes(card.id) ? 'memory-card--flipped' : ''
                  } ${matched.includes(card.id) ? 'memory-card--matched' : ''} ${removed.includes(card.id) ? 'memory-card--removed' : ''}`}
                onClick={() => handleCardClick(card.id)}
                disabled={matched.includes(card.id) || gameOver || removed.includes(card.id)}
              >
                <div className="memory-card__inner">
                  <div className="memory-card__front">?</div>
                  <div className="memory-card__back">{card.emoji}</div>
                </div>
              </button>
            ))}
          </div>

          {gameOver && (
            <div className="memory-game__overlay">
              <div className="memory-game__result">
                <h2>{t('gameOver')}</h2>
                <p>{t('gameComplete').replace('{{moves}}', moves)}</p>
                <button className="search__btn" onClick={handleRestart}>
                  {t('playAgain')}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter onNavigate={onNavigate} />
    </div>
  );
}
