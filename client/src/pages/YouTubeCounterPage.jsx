import { useChannelMonitor } from '../hooks/useChannelMonitor.js';
import { SearchForm } from '../components/SearchForm.jsx';
import { SubscriberCounter } from '../components/SubscriberCounter.jsx';
import { ChannelCard } from '../components/ChannelCard.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { Logo } from '../components/Logo.jsx';

export function YouTubeCounterPage({ onNavigate }) {
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
              ← Todas as ferramentas
            </button>
            <h1>Contador de Inscritos</h1>
            <p className="hero__subtitle">
              YouTube em tempo real — cole o link ou digite o nome do canal
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
            {error}
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
                  Última atualização:{' '}
                  {lastUpdate.toLocaleTimeString('pt-BR')}
                </time>
              )}
              <button
                type="button"
                className="btn-ghost"
                onClick={stopMonitoring}
              >
                Monitorar outro canal
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
            <p>Informe um canal para começar a acompanhar os inscritos.</p>
            <p className="empty__examples">
              Ex.: <code>https://youtube.com/@MrBeast</code> ou <code>MrBeast</code>
            </p>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>Dados oficiais via YouTube Data API</p>
      </footer>
    </div>
  );
}
