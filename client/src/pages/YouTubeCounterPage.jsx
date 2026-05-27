import { useChannelMonitor } from '../hooks/useChannelMonitor.js';
import { SearchForm } from '../components/SearchForm.jsx';
import { SubscriberCounter } from '../components/SubscriberCounter.jsx';
import { ChannelCard } from '../components/ChannelCard.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { Logo } from '../components/Logo.jsx';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { useLanguage } from '../context/LanguageContext';

export function YouTubeCounterPage({ onNavigate }) {
  const { t, language } = useLanguage();
  const {
    channel,
    subscriberCount,
    delta,
    status,
    lastUpdate,
    error,
    loading,
    searchChannel,
    stopMonitoring,
  } = useChannelMonitor();

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
            >
              ← {t('backToTools')}
            </button>
            <h1>{t('youtubeCounterTitle')}</h1>
            <p className="hero__subtitle">
              {t('youtubeCounterSubtitle')}
            </p>
          </div>
        </div>
        <StatusBadge status={status} />
      </header>

      <main className="panel">
        <SearchForm
          onSearch={searchChannel}
          loading={loading}
          disabled={loading}
        />

        {error && (
          <div className="alert alert--error" role="alert">
            {error.split('\n').map((line, i) => (
              <div key={i} style={{ marginBottom: line ? '0.5rem' : 0 }}>
                {line}
              </div>
            ))}
          </div>
        )}

        {monitoring ? (
          <section className="result">
            <ChannelCard channel={channel} />
            <SubscriberCounter
              count={subscriberCount}
              delta={delta}
              hidden={channel.hiddenSubscriberCount}
            />
            <div className="result__actions">
              {lastUpdate && (
                <time className="result__time" dateTime={lastUpdate.toISOString()}>
                  {t('youtubeLastUpdate')}{' '}
                  {lastUpdate.toLocaleTimeString(language === 'pt' ? 'pt-BR' : 'en-US')}
                </time>
              )}
              <button
                type="button"
                className="btn-ghost"
                onClick={stopMonitoring}
              >
                {t('youtubeMonitorAnother')}
              </button>
            </div>
          </section>
        ) : (
          <section className="empty">
            <div className="empty__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 14.5v-9l6 4.5-6 4.5Z"
                />
              </svg>
            </div>
            <p>{t('youtubeEnterChannel')}</p>
            <p className="empty__examples">
              <span>{t('youtubeExample')}</span>
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
