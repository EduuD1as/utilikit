const API_BASE = import.meta.env.VITE_API_URL || '';
const SOCIALCOUNTS_BASE =
  'https://api.socialcounts.org/youtube-live-subscriber-count';

const FETCH_HEADERS = {
  Accept: 'application/json',
  Referer: 'https://socialcounts.org/',
  Origin: 'https://socialcounts.org',
};

function parsePayload(data) {
  const estimation = data?.counters?.estimation;
  const api = data?.counters?.api;

  if (estimation?.subscriberCount != null) {
    return {
      subscriberCount: Number(estimation.subscriberCount),
      apiRounded: api?.subscriberCount != null ? Number(api.subscriberCount) : null,
      precise: true,
    };
  }

  if (api?.subscriberCount != null) {
    return {
      subscriberCount: Number(api.subscriberCount),
      apiRounded: Number(api.subscriberCount),
      precise: false,
    };
  }

  return null;
}

async function fetchFromServer(channelId, apiRounded) {
  const params = new URLSearchParams();
  if (apiRounded != null) params.set('apiRounded', String(apiRounded));
  const qs = params.toString();
  const res = await fetch(
    `${API_BASE}/api/channel/${encodeURIComponent(channelId)}/live-stats${qs ? `?${qs}` : ''}`,
    { signal: AbortSignal.timeout(10000) }
  );
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `Servidor ${res.status}`);
  }
  const stats = body.stats;
  if (stats?.subscriberCount == null) {
    throw new Error('Resposta inválida do servidor');
  }
  return {
    subscriberCount: Number(stats.subscriberCount),
    apiRounded: stats.apiRounded != null ? Number(stats.apiRounded) : null,
    precise: stats.precise !== false,
  };
}

async function fetchFromSocialCounts(channelId) {
  const res = await fetch(
    `${SOCIALCOUNTS_BASE}/${encodeURIComponent(channelId)}`,
    {
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(8000),
    }
  );

  if (!res.ok) {
    throw new Error(`SocialCounts ${res.status}`);
  }

  const data = await res.json().catch(() => {
    throw new Error('SocialCounts resposta inválida');
  });
  const parsed = parsePayload(data);
  if (!parsed) throw new Error('Contagem indisponível');
  return parsed;
}

/**
 * Contagem ao vivo: servidor (cache + estimativa local) com fallback direto ao SocialCounts.
 */
export async function fetchLiveSubscriberCount(channelId, { apiRounded } = {}) {
  try {
    return await fetchFromServer(channelId, apiRounded);
  } catch (serverError) {
    try {
      return await fetchFromSocialCounts(channelId);
    } catch {
      throw serverError;
    }
  }
}
