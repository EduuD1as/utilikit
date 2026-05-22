const API_BASE = 'https://www.googleapis.com/youtube/v3';
const FETCH_TIMEOUT_MS = 8000;

function getApiKey() {
  return process.env.YOUTUBE_API_KEY?.trim() || '';
}

export function isYouTubeApiConfigured() {
  return Boolean(getApiKey());
}

async function fetchWithTimeout(url, options = {}, ms = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

async function youtubeFetch(path, params) {
  const key = getApiKey();
  if (!key) {
    throw new Error('YOUTUBE_API_KEY is not configured.');
  }

  const url = new URL(`${API_BASE}${path}`);
  for (const [name, value] of Object.entries(params)) {
    if (value != null && value !== '') url.searchParams.set(name, String(value));
  }
  url.searchParams.set('key', key);

  const res = await fetchWithTimeout(url);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data?.error?.message || `YouTube API ${res.status}`);
    error.status = res.status;
    throw error;
  }

  return data;
}

export function mapYouTubeChannel(item) {
  const stats = item.statistics || {};
  const snippet = item.snippet || {};
  return {
    id: item.id,
    title: snippet.title || 'Canal',
    description: snippet.description || '',
    thumbnail:
      snippet.thumbnails?.high?.url ||
      snippet.thumbnails?.medium?.url ||
      snippet.thumbnails?.default?.url ||
      null,
    customUrl: snippet.customUrl || null,
    subscriberCount: Number(stats.subscriberCount ?? 0),
    subscriberCountApiRounded:
      stats.subscriberCount != null ? Number(stats.subscriberCount) : null,
    subscriberCountPrecise: false,
    subscriberCountSource: 'youtube_api_rounded',
    hiddenSubscriberCount: stats.hiddenSubscriberCount === true,
    viewCount: Number(stats.viewCount ?? 0),
    videoCount: Number(stats.videoCount ?? 0),
  };
}

export async function fetchOfficialChannelById(channelId) {
  const data = await youtubeFetch('/channels', {
    part: 'snippet,statistics',
    id: channelId,
  });

  const item = data.items?.[0];
  if (!item) throw new Error('Canal nao encontrado.');
  return mapYouTubeChannel(item);
}

export async function resolveOfficialHandleToChannelId(handle) {
  const data = await youtubeFetch('/channels', {
    part: 'id',
    forHandle: handle.replace(/^@/, ''),
  });

  const item = data.items?.[0];
  if (!item?.id) throw new Error(`Canal @${handle} nao encontrado.`);
  return item.id;
}

export async function resolveOfficialNameToChannelId(name) {
  const data = await youtubeFetch('/search', {
    part: 'snippet',
    type: 'channel',
    maxResults: 1,
    q: name,
  });

  const item = data.items?.[0];
  const channelId = item?.id?.channelId || item?.snippet?.channelId;
  if (!channelId) throw new Error(`Nenhum canal encontrado para "${name}".`);
  return channelId;
}
