import { useYouTubeCounter } from '../hooks/useYouTubeCounter.js';
import { YouTubeSearchForm } from '../components/YouTubeSearchForm.jsx';
import { YouTubeChannelCard } from '../components/YouTubeChannelCard.jsx';
import { YouTubeSubscriberCounter } from '../components/YouTubeSubscriberCounter.jsx';
import { Logo } from '../components/Logo.jsx';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { useLanguage } from '../context/LanguageContext';
import '../youtube-counter.css';

export function YouTubeCounterPage({ onNavigate }) {
  const { t, language } = useLanguage();
  const {
    channel,
    subscriberCount,
    loading,
    error,
    lastUpdate,
    searchChannel,
    stopMonitoring,
  } = useYouTubeCounter();

  const monitoring = Boolean(channel);

  return (
    <div className="app app--youtube">
      <header className="hero">
        <div className="hero__brand">
          <Logo size={52} className="hero__logo" onNavigate={onNavigate} />
          <div>
            <button
              type="button"
              className="hero__back"
              onClick={() => onNavigate('/')}
              aria-label={t('backToTools')}
            >
              ← {t('backToTools')}
            </button>
            <h1>{t('youtubeCounterTitle')}</h1>
            <p className="hero__subtitle">
              {t('youtubeCounterSubtitle')}
            </p>
          </div>
        </div>
      </header>

      <main className="panel generator-panel">
        <YouTubeSearchForm
          onSearch={searchChannel}
          loading={loading}
          disabled={monitoring}
        />

        {error && (
          <div className="alert alert--error" role="alert">
            {error}
          </div>
        )}

        {monitoring && (
          <section className="result">
            <YouTubeChannelCard channel={channel} />
            <YouTubeSubscriberCounter
              count={subscriberCount}
              lastUpdate={lastUpdate}
            />
            <div className="result__actions">
              <button
                type="button"
                className="btn-outline btn-outline--danger"
                onClick={stopMonitoring}
              >
                {t('youtubeMonitorAnother')}
              </button>
            </div>
          </section>
        )}

        {!monitoring && (
          <section className="empty">
            <p>{t('youtubeEmptyMessage')}</p>
            <p className="empty__examples">
              <span>{t('youtubeExampleLabel')}</span>
              <code>@MrBeast</code>
              <code>MrBeast</code>
              <code>youtube.com/@MrBeast</code>
            </p>
          </section>
        )}
      </main>

      <SiteFooter
        onNavigate={onNavigate}
        note={t('youtubeFooterNote')}
      />
    </div>
  );
}
