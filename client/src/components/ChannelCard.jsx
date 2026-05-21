function formatCount(n) {
  return new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(n);
}

export function ChannelCard({ channel }) {
  if (!channel) return null;

  const handle = channel.customUrl
    ? `@${channel.customUrl.replace(/^@/, '')}`
    : null;

  return (
    <div className="channel-card">
      {channel.thumbnail ? (
        <img
          className="channel-card__avatar"
          src={channel.thumbnail}
          alt=""
          width={72}
          height={72}
        />
      ) : (
        <div className="channel-card__avatar channel-card__avatar--placeholder">
          YT
        </div>
      )}
      <div className="channel-card__info">
        <h2 className="channel-card__title">{channel.title}</h2>
        {handle && <p className="channel-card__handle">{handle}</p>}
        <div className="channel-card__meta">
          <span>{formatCount(channel.viewCount)} visualizações</span>
          <span>·</span>
          <span>{formatCount(channel.videoCount)} vídeos</span>
        </div>
      </div>
    </div>
  );
}
