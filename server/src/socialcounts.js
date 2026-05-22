import {
  fetchOfficialChannelById,
  isYouTubeApiConfigured,
} from './youtube-data-api.js';

const SOCIALCOUNTS_BASE = 'https://api.socialcounts.org/youtube-live-subscriber-count';
const SUPERPLAYCOUNTS_BASE =
  'https://api.superplaycounts.pp.ua/api/youtube-channel-counter/user';
const YOUTUBE_BASE = 'https://www.youtube.com';
const FETCH_TIMEOUT_MS = 8000;
const SOCIALCOUNTS_TIMEOUT_MS = 4500;
const SOCIALCOUNTS_CACHE_TTL_MS = 20000;
const SOCIALCOUNTS_FAIL_BACKOFF_MS = 90000;
const SUPERPLAYCOUNTS_CACHE_TTL_MS = 5000;

const SOCIALCOUNTS_HEADERS = {
  Accept: 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  Referer: 'https://socialcounts.org/',
  Origin: 'https://socialcounts.org',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

const YOUTUBE_HEADERS = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

const offsetCache = new Map();
const socialCountsCache = new Map();
const superPlayCountsCache = new Map();
const channelState = new Map();

function getChannelState(channelId) {
  let state = channelState.get(channelId);
  if (!state) {
    state = { lastTickMs: Date.now() };
    channelState.set(channelId, state);
  }
  return state;
}

function fetchWithTimeout(url, options = {}, ms = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

function isRetryableError(err) {
  return (
    err.name === 'AbortError' ||
    err.cause?.code === 'ECONNRESET' ||
    err.cause?.code === 'ETIMEDOUT'
  );
}

async function fetchSocialCounts(channelId, attempt = 1) {
  try {
    const res = await fetchWithTimeout(
      `${SOCIALCOUNTS_BASE}/${encodeURIComponent(channelId)}`,
      { headers: SOCIALCOUNTS_HEADERS },
      SOCIALCOUNTS_TIMEOUT_MS
    );

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      const retryable = res.status >= 500 || res.status === 429;
      if (retryable && attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
        return fetchSocialCounts(channelId, attempt + 1);
      }
      throw new Error(
        `SocialCounts ${res.status}${body ? `: ${body.slice(0, 80)}` : ''}`
      );
    }

    return res.json();
  } catch (err) {
    if (attempt < 2 && err.name !== 'AbortError' && isRetryableError(err)) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      return fetchSocialCounts(channelId, attempt + 1);
    }
    throw err;
  }
}

async function fetchSocialCountsCached(channelId) {
  const cached = socialCountsCache.get(channelId);
  const now = Date.now();

  if (cached?.data && cached.at && now - cached.at < SOCIALCOUNTS_CACHE_TTL_MS) {
    return cached.data;
  }

  if (cached?.failUntil && now < cached.failUntil) {
    throw new Error('SocialCounts unavailable (cooldown)');
  }

  try {
    const data = await fetchSocialCounts(channelId);
    socialCountsCache.set(channelId, { data, at: now, failUntil: undefined });
    return data;
  } catch (err) {
    socialCountsCache.set(channelId, {
      ...cached,
      failUntil: now + SOCIALCOUNTS_FAIL_BACKOFF_MS,
    });
    throw err;
  }
}

async function fetchSuperPlayCountsCached(channelId) {
  const cached = superPlayCountsCache.get(channelId);
  const now = Date.now();

  if (cached?.data && cached.at && now - cached.at < SUPERPLAYCOUNTS_CACHE_TTL_MS) {
    return cached.data;
  }

  const res = await fetchWithTimeout(
    `${SUPERPLAYCOUNTS_BASE}/${encodeURIComponent(channelId)}`,
    { headers: { Accept: 'application/json' } },
    FETCH_TIMEOUT_MS
  );

  if (!res.ok) {
    throw new Error(`SuperPlayCounts ${res.status}`);
  }

  const data = await res.json();
  superPlayCountsCache.set(channelId, { data, at: now });
  return data;
}

function warnOnce(channelId, message) {
  const cached = socialCountsCache.get(channelId) ?? {};
  const now = Date.now();
  if (cached.lastWarnAt && now - cached.lastWarnAt < 60_000) return;
  socialCountsCache.set(channelId, { ...cached, lastWarnAt: now });
  console.warn(`[subscribers] ${channelId}: ${message}`);
}

function youtubeSigFigStep(rounded) {
  if (rounded <= 0) return 1;
  const exp = Math.floor(Math.log10(rounded));
  return 10 ** Math.max(0, exp - 2);
}

function updateVelocity(channelId, nextCount) {
  const state = getChannelState(channelId);
  const now = Date.now();
  if (
    state.estimated != null &&
    state.lastTickMs &&
    nextCount > state.estimated
  ) {
    const elapsed = (now - state.lastTickMs) / 1000;
    if (elapsed > 0) {
      const rate = (nextCount - state.estimated) / elapsed;
      state.velocity =
        state.velocity == null ? rate : state.velocity * 0.7 + rate * 0.3;
    }
  }
  state.estimated = nextCount;
  state.lastTickMs = now;
}

function buildLocalEstimate(channelId, apiRounded) {
  const state = getChannelState(channelId);
  const offset = offsetCache.get(channelId);
  const now = Date.now();
  const elapsedSec = Math.max(0, (now - (state.lastTickMs ?? now)) / 1000);
  const rate = Math.min(Math.max(state.velocity ?? 1.5, 0.2), 50);

  if (offset != null) {
    let count = apiRounded + offset;
    if (apiRounded === state.lastApiRounded && elapsedSec >= 1) {
      count += Math.floor(elapsedSec * rate);
    }
    state.lastApiRounded = apiRounded;
    updateVelocity(channelId, count);
    return {
      subscriberCount: count,
      precise: true,
      source: 'estimated_offset',
      apiRounded,
    };
  }

  const step = youtubeSigFigStep(apiRounded);
  const ceiling = apiRounded + step - 1;

  if (
    state.estimated == null ||
    apiRounded !== state.lastApiRounded ||
    state.estimated < apiRounded
  ) {
    state.estimated = apiRounded;
    state.lastApiRounded = apiRounded;
    state.lastTickMs = now;
  } else if (state.estimated < ceiling && elapsedSec >= 1) {
    state.estimated += Math.max(1, Math.floor(elapsedSec * rate));
    if (state.estimated > ceiling) state.estimated = ceiling;
    state.lastTickMs = now;
  }

  return {
    subscriberCount: state.estimated ?? apiRounded,
    precise: false,
    source: 'local_interpolation',
    apiRounded,
  };
}

function parseSocialCountsPayload(data) {
  const estimation = data?.counters?.estimation;
  const api = data?.counters?.api;

  if (estimation?.subscriberCount != null) {
    return {
      subscriberCount: Number(estimation.subscriberCount),
      viewCount: estimation.viewCount != null ? Number(estimation.viewCount) : null,
      videoCount: estimation.videoCount != null ? Number(estimation.videoCount) : null,
      precise: true,
      source: 'socialcounts_live',
      apiRounded: api?.subscriberCount != null ? Number(api.subscriberCount) : null,
    };
  }

  if (api?.subscriberCount != null) {
    return {
      subscriberCount: Number(api.subscriberCount),
      viewCount: api.viewCount != null ? Number(api.viewCount) : null,
      videoCount: api.videoCount != null ? Number(api.videoCount) : null,
      precise: false,
      source: 'socialcounts_api_rounded',
      apiRounded: Number(api.subscriberCount),
    };
  }

  return null;
}

function findCount(items, value) {
  return items.find((item) => item?.value === value)?.count;
}

function parseSuperPlayCountsPayload(data) {
  const stats = data?.statistics?.[0];
  const counts = stats?.counts ?? [];
  const user = stats?.user ?? [];
  const subscriberCount = Number(findCount(counts, 'subscribers'));
  const apiRounded = Number(findCount(counts, 'apisubscribers'));

  if (!Number.isFinite(subscriberCount)) return null;

  return {
    subscriberCount,
    viewCount: Number(findCount(counts, 'views')) || null,
    videoCount: Number(findCount(counts, 'videos')) || null,
    goal: Number(findCount(counts, 'goal')) || null,
    apiRounded: Number.isFinite(apiRounded) ? apiRounded : null,
    precise: true,
    source: 'superplaycounts_estimate',
    title: findCount(user, 'name') || null,
    thumbnail: findCount(user, 'pfp') || null,
    banner: findCount(user, 'banner') || null,
  };
}

async function fetchSuperPlayCountsStats(channelId) {
  const data = await fetchSuperPlayCountsCached(channelId);
  const parsed = parseSuperPlayCountsPayload(data);
  if (!parsed) {
    throw new Error('SuperPlayCounts resposta sem contagem de inscritos.');
  }
  return parsed;
}

function decodeHtml(value = '') {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function parseJsonString(value) {
  try {
    return JSON.parse(`"${value.replace(/"/g, '\\"')}"`);
  } catch {
    return value;
  }
}

function extractMeta(html, name) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${name}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)["']`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHtml(match[1]);
  }
  return null;
}

function parseCompactCount(text) {
  const cleaned = String(text)
    .replace(/\\u0026/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  const match = cleaned.match(/([\d.,]+)\s*(K|M|B|mil|mi|bi)?/i);
  if (!match) return null;

  let raw = match[1];
  if (raw.includes(',') && !raw.includes('.')) raw = raw.replace(',', '.');
  raw = raw.replace(/,/g, '');

  const value = Number(raw);
  if (!Number.isFinite(value)) return null;

  const suffix = match[2]?.toLowerCase();
  const multiplier =
    suffix === 'k' || suffix === 'mil'
      ? 1_000
      : suffix === 'm' || suffix === 'mi'
        ? 1_000_000
        : suffix === 'b' || suffix === 'bi'
          ? 1_000_000_000
          : 1;

  return Math.round(value * multiplier);
}

function extractSubscriberCountFromHtml(html) {
  const pageHeader = html.match(
    /"metadata":\{"contentMetadataViewModel":\{"metadataRows":\[\{"metadataParts":\[\{"text":\{"content":"@[^"]+"[\s\S]{0,1500}?"content":"([^"]*(?:subscribers|inscritos)[^"]*)"/i
  );
  const matches = [
    pageHeader,
    html.match(/"content":"([^"]*(?:subscribers|inscritos)[^"]*)"/i),
    html.match(/"subscriberCountText":\{"simpleText":"([^"]+)"/),
    html.match(/"subscriberCountText":\{"runs":\[\{"text":"([^"]+)"/),
    html.match(/"simpleText":"([^"]*(?:subscribers|inscritos)[^"]*)"/i),
  ];

  for (const match of matches) {
    if (!match) continue;
    const count = parseCompactCount(parseJsonString(match[1]));
    if (count != null) return count;
  }

  return null;
}

function extractChannelMetadataFromHtml(html) {
  const metadata = html.match(
    /"channelMetadataRenderer":\{"title":"((?:\\.|[^"\\])*)","description":"((?:\\.|[^"\\])*)"/
  );
  const avatar = html.match(/"avatar":\{"thumbnails":\[\{"url":"((?:\\.|[^"\\])*)"/);

  return {
    title: metadata ? parseJsonString(metadata[1]) : null,
    description: metadata ? parseJsonString(metadata[2]) : null,
    thumbnail: avatar ? parseJsonString(avatar[1]) : null,
  };
}

async function fetchPublicChannelById(channelId) {
  const res = await fetchWithTimeout(`${YOUTUBE_BASE}/channel/${channelId}`, {
    headers: YOUTUBE_HEADERS,
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Canal nao encontrado.');
    throw new Error(`YouTube public page ${res.status}`);
  }

  const html = await res.text();
  const subscriberCount = extractSubscriberCountFromHtml(html);
  const metadata = extractChannelMetadataFromHtml(html);
  const title =
    metadata.title ||
    extractMeta(html, 'og:title') ||
    decodeHtml(html.match(/<title>([^<]+)<\/title>/i)?.[1] || '') ||
    'Canal';

  return {
    id: channelId,
    title,
    description: metadata.description || extractMeta(html, 'og:description') || '',
    thumbnail: metadata.thumbnail || extractMeta(html, 'og:image'),
    customUrl: null,
    subscriberCount: subscriberCount ?? 0,
    subscriberCountApiRounded: subscriberCount,
    subscriberCountPrecise: false,
    subscriberCountSource: 'youtube_public_rounded',
    hiddenSubscriberCount: subscriberCount == null,
    viewCount: 0,
    videoCount: 0,
  };
}

async function fetchPublicSubscriberStats(channelId) {
  const channel = await fetchPublicChannelById(channelId);
  if (channel.hiddenSubscriberCount || channel.subscriberCount == null) {
    throw new Error('Contagem publica indisponivel para este canal.');
  }
  return {
    subscriberCount: channel.subscriberCount,
    precise: false,
    source: 'youtube_public_rounded',
    apiRounded: channel.subscriberCount,
  };
}

export async function fetchLiveSubscriberStats(channelId) {
  try {
    return await fetchSuperPlayCountsStats(channelId);
  } catch (superErr) {
    warnOnce(channelId, superErr.message);
  }

  try {
    const data = await fetchSocialCountsCached(channelId);
    const parsed = parseSocialCountsPayload(data);
    if (parsed) return parsed;
  } catch (socialErr) {
    warnOnce(channelId, socialErr.message);
  }

  throw new Error('Contagem de inscritos indisponivel para este canal.');
}

export function applyLiveStats(channel, liveStats) {
  if (!liveStats) return channel;

  const apiRounded = liveStats.apiRounded ?? channel.subscriberCountApiRounded ?? channel.subscriberCount;
  if (liveStats.precise && liveStats.apiRounded != null) {
    offsetCache.set(channel.id, liveStats.subscriberCount - liveStats.apiRounded);
  }
  updateVelocity(channel.id, liveStats.subscriberCount);

  return {
    ...channel,
    subscriberCount: liveStats.subscriberCount,
    subscriberCountApiRounded: apiRounded,
    subscriberCountPrecise: liveStats.precise,
    subscriberCountSource: liveStats.source,
    ...(liveStats.viewCount != null && { viewCount: liveStats.viewCount }),
    ...(liveStats.videoCount != null && { videoCount: liveStats.videoCount }),
  };
}

export async function resolveLiveSubscriberStats(channelId, apiRounded) {
  try {
    return await fetchLiveSubscriberStats(channelId);
  } catch (err) {
    let rounded = apiRounded ?? getChannelState(channelId).lastApiRounded ?? null;
    if (!String(err.message).includes('cooldown')) warnOnce(channelId, err.message);

    if (rounded == null && isYouTubeApiConfigured()) {
      try {
        const channel = await fetchOfficialChannelById(channelId);
        rounded = channel.subscriberCountApiRounded ?? channel.subscriberCount;
      } catch (fallbackErr) {
        warnOnce(channelId, fallbackErr.message);
      }
    }

    if (rounded == null) {
      try {
        const publicStats = await fetchPublicSubscriberStats(channelId);
        rounded = publicStats.apiRounded;
      } catch (fallbackErr) {
        warnOnce(channelId, fallbackErr.message);
      }
    }

    if (rounded == null) throw err;
    return buildLocalEstimate(channelId, rounded);
  }
}

async function getSocialCountsChannelById(channelId) {
  const data = await fetchSocialCountsCached(channelId);
  const metadata = data?.metadata || {};
  const parsed = parseSocialCountsPayload(data);

  const channel = {
    id: channelId,
    title: metadata.title || metadata.channelName || 'Canal',
    description: metadata.description || '',
    thumbnail: metadata.thumbnails?.default?.url || null,
    customUrl: metadata.customUrl || null,
    subscriberCount: parsed?.subscriberCount ?? 0,
    subscriberCountApiRounded: parsed?.apiRounded ?? parsed?.subscriberCount ?? null,
    subscriberCountPrecise: parsed?.precise ?? false,
    subscriberCountSource: parsed?.source ?? 'socialcounts',
    hiddenSubscriberCount: false,
    viewCount: parsed?.viewCount ?? 0,
    videoCount: parsed?.videoCount ?? 0,
  };

  if (parsed) return applyLiveStats(channel, parsed);
  return channel;
}

async function getSuperPlayCountsChannelById(channelId) {
  const parsed = await fetchSuperPlayCountsStats(channelId);
  const channel = {
    id: channelId,
    title: parsed.title || 'Canal',
    description: '',
    thumbnail: parsed.thumbnail || null,
    customUrl: null,
    subscriberCount: parsed.subscriberCount,
    subscriberCountApiRounded: parsed.apiRounded,
    subscriberCountPrecise: parsed.precise,
    subscriberCountSource: parsed.source,
    hiddenSubscriberCount: false,
    viewCount: parsed.viewCount ?? 0,
    videoCount: parsed.videoCount ?? 0,
  };

  return applyLiveStats(channel, parsed);
}

export async function getChannelById(channelId) {
  let lastError;

  try {
    return await getSuperPlayCountsChannelById(channelId);
  } catch (err) {
    lastError = err;
    warnOnce(channelId, err.message);
  }

  try {
    return await getSocialCountsChannelById(channelId);
  } catch (err) {
    lastError = err;
    warnOnce(channelId, err.message);
  }

  if (isYouTubeApiConfigured()) {
    try {
      const channel = await fetchOfficialChannelById(channelId);
      if (channel.hiddenSubscriberCount) return channel;
      const liveStats = await resolveLiveSubscriberStats(
        channelId,
        channel.subscriberCountApiRounded ?? channel.subscriberCount
      );
      return applyLiveStats(channel, liveStats);
    } catch (err) {
      lastError = err;
      warnOnce(channelId, err.message);
    }
  }

  try {
    const channel = await fetchPublicChannelById(channelId);
    if (channel.hiddenSubscriberCount) return channel;
    const liveStats = await resolveLiveSubscriberStats(
      channelId,
      channel.subscriberCountApiRounded ?? channel.subscriberCount
    );
    return applyLiveStats(channel, liveStats);
  } catch (err) {
    lastError = err;
  }

  throw lastError || new Error('Nao foi possivel carregar o canal.');
}

export async function resolveChannel(query) {
  const { resolveUserInput } = await import('./youtube-resolver.js');

  try {
    const channelId = await resolveUserInput(query);
    return getChannelById(channelId);
  } catch (err) {
    throw new Error(`Nao foi possivel encontrar o canal: ${err.message}`);
  }
}

export function clearSubscriberOffset(channelId) {
  offsetCache.delete(channelId);
  channelState.delete(channelId);
  socialCountsCache.delete(channelId);
  superPlayCountsCache.delete(channelId);
}
