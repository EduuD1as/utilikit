import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

const EMOJIS = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎪', '🎸', '🎺', '🎻', '🎹', '🎬'];

export default function MemoryGamePage({ onNavigate }) {
  const { t } = useLanguage();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('memoryGameBestScore');
    return saved ? parseInt(saved, 10) : null;
  });

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
      <SiteHeader onNavigate={onNavigate} variant="tool" />

      <header className="hero">
        <div className="hero__content">
          <h1>{t('memoryGameTitle')}</h1>
          <p className="hero__subtitle">{t('memoryGameSubtitle')}</p>
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
                  }`}
                onClick={() => handleCardClick(card.id)}
                disabled={matched.includes(card.id) || gameOver}
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
