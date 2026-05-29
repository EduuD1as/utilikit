export function YouTubeChannelCard({ channel }) {
  if (!channel) return null;

  return (
    <div className="youtube-channel-card">
      {channel.thumbnail && (
        <img
          src={channel.thumbnail}
          alt={channel.title}
          className="youtube-channel-card__thumbnail"
        />
      )}
      <div className="youtube-channel-card__info">
        <h2 className="youtube-channel-card__title">{channel.title}</h2>
        {channel.author && (
          <p className="youtube-channel-card__author">{channel.author}</p>
        )}
      </div>
    </div>
  );
}
