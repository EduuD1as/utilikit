const SOCIALCOUNTS_BASE =
  'https://api.socialcounts.org/youtube-live-subscriber-count';

/**
 * A YouTube Data API arredonda inscritos para 3 algarismos significativos.
 * O Socialcounts interpola entre atualizações da API e devolve o número
 * completo usado por contadores ao vivo.
 */
export async function fetchLiveSubscriberStats(channelId) {
  const res = await fetch(`${SOCIALCOUNTS_BASE}/${channelId}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(12000),
  });

  if (!res.ok) {
    throw new Error(`Falha ao obter inscritos (${res.status}).`);
  }

  const data = await res.json();
  const estimation = data?.counters?.estimation;
  const api = data?.counters?.api;

  if (estimation?.subscriberCount != null) {
    return {
      subscriberCount: Number(estimation.subscriberCount),
      viewCount: estimation.viewCount != null ? Number(estimation.viewCount) : null,
      videoCount: estimation.videoCount != null ? Number(estimation.videoCount) : null,
      precise: true,
      source: 'live',
      apiRounded: api?.subscriberCount != null ? Number(api.subscriberCount) : null,
    };
  }

  if (api?.subscriberCount != null) {
    return {
      subscriberCount: Number(api.subscriberCount),
      viewCount: api.viewCount != null ? Number(api.viewCount) : null,
      videoCount: api.videoCount != null ? Number(api.videoCount) : null,
      precise: false,
      source: 'api_rounded',
      apiRounded: Number(api.subscriberCount),
    };
  }

  throw new Error('Contagem de inscritos indisponível para este canal.');
}

export function applyLiveStats(channel, liveStats) {
  if (!liveStats) return channel;

  return {
    ...channel,
    subscriberCount: liveStats.subscriberCount,
    subscriberCountPrecise: liveStats.precise,
    subscriberCountSource: liveStats.source,
    ...(liveStats.viewCount != null && { viewCount: liveStats.viewCount }),
    ...(liveStats.videoCount != null && { videoCount: liveStats.videoCount }),
  };
}

export async function enrichChannelWithLiveStats(channel) {
  if (channel.hiddenSubscriberCount) return channel;

  try {
    const liveStats = await fetchLiveSubscriberStats(channel.id);
    return applyLiveStats(channel, liveStats);
  } catch (err) {
    console.warn(`[subscribers] ${channel.id}: ${err.message}`);
    return {
      ...channel,
      subscriberCountPrecise: false,
      subscriberCountSource: 'youtube_api_rounded',
    };
  }
}
