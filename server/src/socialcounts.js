/**
 * SocialCounts API - Busca de canais YouTube e contagem em tempo real
 * Sem necessidade de chave de API do YouTube
 */

const SOCIALCOUNTS_BASE = 'https://api.socialcounts.org/youtube-live-subscriber-count';
const FETCH_HEADERS = {
  Accept: 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  Referer: 'https://socialcounts.org/',
  Origin: 'https://socialcounts.org',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

const FETCH_TIMEOUT_MS = 8000;
const SOCIALCOUNTS_CACHE_TTL_MS = 20000;
const SOCIALCOUNTS_FAIL_BACKOFF_MS = 90000;

const offsetCache = new Map();
const socialCountsCache = new Map();
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
      { headers: FETCH_HEADERS }
    );

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      const retryable = res.status >= 500 || res.status === 429;
      if (retryable && attempt < 2) {
        await new Promise((r) => setTimeout(r, attempt * 500));
        return fetchSocialCounts(channelId, attempt + 1);
      }
      throw new Error(
        `SocialCounts ${res.status}${body ? `: ${body.slice(0, 80)}` : ''}`
      );
    }

    return res.json();
  } catch (err) {
    if (attempt < 2 && isRetryableError(err)) {
      await new Promise((r) => setTimeout(r, attempt * 500));
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
    throw new Error('SocialCounts indisponível (cooldown)');
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

  return null;
}

export async function fetchLiveSubscriberStats(channelId) {
  const data = await fetchSocialCountsCached(channelId);
  const parsed = parseSocialCountsPayload(data);
  if (!parsed) {
    throw new Error('Contagem de inscritos indisponível para este canal.');
  }
  return parsed;
}

export function applyLiveStats(channel, liveStats) {
  if (!liveStats) return channel;

  const apiRounded = liveStats.apiRounded ?? channel.subscriberCount;
  if (liveStats.precise && liveStats.apiRounded != null) {
    offsetCache.set(channel.id, liveStats.subscriberCount - liveStats.apiRounded);
  }
  updateVelocity(channel.id, liveStats.subscriberCount);

  return {
    ...channel,
    subscriberCount: liveStats.subscriberCount,
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
    const rounded =
      apiRounded ?? getChannelState(channelId).lastApiRounded ?? null;
    if (rounded == null) throw err;
    if (!String(err.message).includes('cooldown')) {
      warnOnce(channelId, err.message);
    }
    return buildLocalEstimate(channelId, rounded);
  }
}

/**
 * Busca canal no SocialCounts por ID
 * Retorna objeto mínimo com info do canal
 */
export async function getChannelById(channelId) {
  const data = await fetchSocialCountsCached(channelId);

  const metadata = data?.metadata || {};
  const channel = {
    id: channelId,
    title: metadata.title || metadata.channelName || 'Canal',
    description: metadata.description || '',
    thumbnail: metadata.thumbnails?.default?.url || null,
    customUrl: metadata.customUrl || null,
    subscriberCount: 0,
    subscriberCountPrecise: false,
    subscriberCountSource: 'socialcounts',
    hiddenSubscriberCount: false,
    viewCount: 0,
    videoCount: 0,
  };

  const parsed = parseSocialCountsPayload(data);
  if (parsed) {
    channel.subscriberCount = parsed.subscriberCount;
    channel.subscriberCountPrecise = parsed.precise;
    channel.subscriberCountSource = parsed.source;
    if (parsed.viewCount != null) channel.viewCount = parsed.viewCount;
    if (parsed.videoCount != null) channel.videoCount = parsed.videoCount;
  }

  return channel;
}

/**
 * Parse input do usuário (URL, handle @, ID ou nome)
 * Retorna strategy e value para resolução
 */
export function parseChannelInput(raw) {
  const input = raw?.trim();
  if (!input) throw new Error('Informe o link ou nome do canal.');

  // URL com ID: youtube.com/channel/UC...
  const channelUrl = input.match(
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/channel\/(UC[\w-]{22})/i
  );
  if (channelUrl) return { strategy: 'id', value: channelUrl[1] };

  // URL com @handle: youtube.com/@NomeCanal
  const handleUrl = input.match(
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/@([\w.-]+)/i
  );
  if (handleUrl) return { strategy: 'handle', value: handleUrl[1] };

  // URL legada: youtube.com/c/NomeCanal ou youtube.com/user/NomeCanal
  const legacyUrl = input.match(
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:c|user)\/([\w.-]+)/i
  );
  if (legacyUrl) return { strategy: 'search', value: legacyUrl[1] };

  // ID puro: UC...
  if (/^UC[\w-]{22}$/i.test(input)) {
    return { strategy: 'id', value: input };
  }

  // Handle com @
  if (input.startsWith('@')) {
    return { strategy: 'search', value: input.slice(1) };
  }

  // Nome puro - buscar
  return { strategy: 'search', value: input };
}

/**
 * Resolve canal a partir de entrada do usuário
 * Atualmente SocialCounts só funciona com ID, então tentamos ID direto
 * Se for handle/nome, convertemos para ID (simplificado - pode precisar scraping ou cache)
 */
export async function resolveChannel(query) {
  const parsed = parseChannelInput(query);

  switch (parsed.strategy) {
    case 'id':
      return getChannelById(parsed.value);

    case 'handle':
    case 'search':
      // SocialCounts não tem endpoint de busca por nome/handle
      // Tentamos como ID direto ou lançamos erro sugestivo
      if (/^UC[\w-]{22}$/.test(parsed.value)) {
        return getChannelById(parsed.value);
      }
      throw new Error(
        `Para usar SocialCounts, forneça o ID do canal (UC...) ou URL direta do YouTube. ` +
        `Exemplo: https://youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxxxx`
      );

    default:
      throw new Error('Estratégia de resolução inválida.');
  }
}

export function clearSubscriberOffset(channelId) {
  offsetCache.delete(channelId);
  channelState.delete(channelId);
  socialCountsCache.delete(channelId);
}
