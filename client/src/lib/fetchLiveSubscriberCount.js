const SOCIALCOUNTS_BASE =
  'https://api.socialcounts.org/youtube-live-subscriber-count';

/**
 * Contagem exata via SocialCounts (CORS liberado).
 * Usado no navegador quando o servidor no Render só recebe o valor arredondado da YouTube API.
 */
export async function fetchLiveSubscriberCount(channelId) {
  const res = await fetch(
    `${SOCIALCOUNTS_BASE}/${encodeURIComponent(channelId)}`,
    { headers: { Accept: 'application/json' } }
  );

  if (!res.ok) {
    throw new Error(`SocialCounts ${res.status}`);
  }

  const data = await res.json();
  const estimation = data?.counters?.estimation;
  const api = data?.counters?.api;

  if (estimation?.subscriberCount != null) {
    return {
      subscriberCount: Number(estimation.subscriberCount),
      precise: true,
    };
  }

  if (api?.subscriberCount != null) {
    return {
      subscriberCount: Number(api.subscriberCount),
      precise: false,
    };
  }

  throw new Error('Contagem indisponível');
}
