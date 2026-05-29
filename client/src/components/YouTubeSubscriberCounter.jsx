import { useLanguage } from '../context/LanguageContext';

export function YouTubeSubscriberCounter({ count, lastUpdate }) {
  const { t, language } = useLanguage();

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '---';
    return new Intl.NumberFormat(language === 'pt' ? 'pt-BR' : 'en-US').format(num);
  };

  return (
    <div className="youtube-subscriber-counter">
      <div className="youtube-subscriber-counter__count">
        {formatNumber(count)}
      </div>
      <div className="youtube-subscriber-counter__label">
        {t('youtubeSubscribersLabel')}
      </div>
      {lastUpdate && (
        <div className="youtube-subscriber-counter__update">
          {t('youtubeUpdated')} {lastUpdate.toLocaleTimeString(language === 'pt' ? 'pt-BR' : 'en-US')}
        </div>
      )}
    </div>
  );
}
