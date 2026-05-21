import { enrichChannelWithLiveStats } from './subscriberCount.js';

const API_BASE = 'https://www.googleapis.com/youtube/v3';

function getApiKey() {
  return process.env.YOUTUBE_API_KEY?.trim() || '';
}

export function isConfigured() {
  return Boolean(getApiKey());
}

async function youtubeFetch(path, params) {
  const key = getApiKey();
  if (!key) {
    throw new Error(
      'YOUTUBE_API_KEY não configurada. Crie uma chave em Google Cloud Console (YouTube Data API v3).'
    );
  }

  const url = new URL(`${API_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== '') url.searchParams.set(k, String(v));
  }
  url.searchParams.set('key', key);

  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const reason = data?.error?.message || res.statusText;
    throw new Error(reason);
  }

  return data;
}

function mapChannel(item) {
  const stats = item.statistics || {};
  return {
    id: item.id,
    title: item.snippet?.title ?? 'Canal',
    description: item.snippet?.description ?? '',
    thumbnail:
      item.snippet?.thumbnails?.high?.url ||
      item.snippet?.thumbnails?.medium?.url ||
      item.snippet?.thumbnails?.default?.url ||
      null,
    customUrl: item.snippet?.customUrl ?? null,
    subscriberCount: Number(stats.subscriberCount ?? 0),
    subscriberCountPrecise: false,
    subscriberCountSource: 'youtube_api_rounded',
    hiddenSubscriberCount: stats.hiddenSubscriberCount === true,
    viewCount: Number(stats.viewCount ?? 0),
    videoCount: Number(stats.videoCount ?? 0),
  };
}

export async function getChannelById(channelId) {
  const data = await youtubeFetch('/channels', {
    part: 'snippet,statistics',
    id: channelId,
  });

  const item = data.items?.[0];
  if (!item) throw new Error('Canal não encontrado.');
  return enrichChannelWithLiveStats(mapChannel(item));
}

export async function getChannelByHandle(handle) {
  const data = await youtubeFetch('/channels', {
    part: 'snippet,statistics',
    forHandle: handle.replace(/^@/, ''),
  });

  const item = data.items?.[0];
  if (!item) throw new Error(`Canal @${handle} não encontrado.`);
  return enrichChannelWithLiveStats(mapChannel(item));
}

export async function searchChannel(query) {
  const data = await youtubeFetch('/search', {
    part: 'snippet',
    type: 'channel',
    maxResults: 5,
    q: query,
  });

  const items = data.items ?? [];
  if (items.length === 0) {
    throw new Error('Nenhum canal encontrado para essa busca.');
  }

  const channelId = items[0].id?.channelId || items[0].snippet?.channelId;
  if (!channelId) throw new Error('Canal inválido na resposta da API.');
  return getChannelById(channelId);
}

export function parseChannelInput(raw) {
  const input = raw?.trim();
  if (!input) throw new Error('Informe o link ou nome do canal.');

  const channelUrl = input.match(
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/channel\/(UC[\w-]{22})/i
  );
  if (channelUrl) return { strategy: 'id', value: channelUrl[1] };

  const handleUrl = input.match(
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/@([\w.-]+)/i
  );
  if (handleUrl) return { strategy: 'handle', value: handleUrl[1] };

  const legacyUrl = input.match(
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:c|user)\/([\w.-]+)/i
  );
  if (legacyUrl) return { strategy: 'search', value: legacyUrl[1] };

  if (/^UC[\w-]{22}$/i.test(input)) {
    return { strategy: 'id', value: input };
  }

  if (input.startsWith('@')) {
    return { strategy: 'handle', value: input.slice(1) };
  }

  return { strategy: 'search', value: input };
}

export async function resolveChannel(query) {
  const parsed = parseChannelInput(query);

  switch (parsed.strategy) {
    case 'id':
      return getChannelById(parsed.value);
    case 'handle':
      return getChannelByHandle(parsed.value);
    default:
      return searchChannel(parsed.value);
  }
}
