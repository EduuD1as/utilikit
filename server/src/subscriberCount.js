const SOCIALCOUNTS_BASE =
  'https://api.socialcounts.org/youtube-live-subscriber-count';

const FETCH_HEADERS = {
  Accept: 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  Referer: 'https://socialcounts.org/',
  Origin: 'https://socialcounts.org',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

/** Diferença entre contagem exata e valor arredondado da API (por canal). */
const offsetCache = new Map();

function fetchWithTimeout(url, options = {}, ms = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

async function fetchSocialCounts(channelId, attempt = 1) {
  try {
    const res = await fetchWithTimeout(
      `${SOCIALCOUNTS_BASE}/${encodeURIComponent(channelId)}`,
      { headers: FETCH_HEADERS },
      15000
    );

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      const retryable = res.status >= 500 || res.status === 429;
      if (retryable && attempt < 3) {
        await new Promise((r) => setTimeout(r, attempt * 400));
        return fetchSocialCounts(channelId, attempt + 1);
      }
      throw new Error(
        `SocialCounts ${res.status}${body ? `: ${body.slice(0, 80)}` : ''}`
      );
    }

    return res.json();
  } catch (err) {
    const retryable =
      attempt < 3 &&
      (err.name === 'AbortError' ||
        err.cause?.code === 'ECONNRESET' ||
        err.cause?.code === 'ETIMEDOUT');
    if (retryable) {
      await new Promise((r) => setTimeout(r, attempt * 400));
      return fetchSocialCounts(channelId, attempt + 1);
    }
    throw err;
  }
}

/**
 * A YouTube Data API arredonda inscritos para 3 algarismos significativos.
 * O SocialCounts estima o número completo entre atualizações da API.
 */
export async function fetchLiveSubscriberStats(channelId) {
  const data = await fetchSocialCounts(channelId);
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

function applyOffsetEstimate(channel, apiRounded) {
  const offset = offsetCache.get(channel.id);
  if (offset == null) return null;

  return {
    ...channel,
    subscriberCount: apiRounded + offset,
    subscriberCountPrecise: true,
    subscriberCountSource: 'estimated_offset',
  };
}

export function applyLiveStats(channel, liveStats) {
  if (!liveStats) return channel;

  const apiRounded = liveStats.apiRounded ?? channel.subscriberCount;
  if (liveStats.precise && liveStats.apiRounded != null) {
    offsetCache.set(channel.id, liveStats.subscriberCount - liveStats.apiRounded);
  }

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

  const apiRounded = channel.subscriberCount;

  try {
    const liveStats = await fetchLiveSubscriberStats(channel.id);
    return applyLiveStats(channel, liveStats);
  } catch (err) {
    console.warn(`[subscribers] ${channel.id}: ${err.message}`);

    const estimated = applyOffsetEstimate(channel, apiRounded);
    if (estimated) return estimated;

    return {
      ...channel,
      subscriberCountPrecise: false,
      subscriberCountSource: 'youtube_api_rounded',
    };
  }
}

export function clearSubscriberOffset(channelId) {
  offsetCache.delete(channelId);
}
