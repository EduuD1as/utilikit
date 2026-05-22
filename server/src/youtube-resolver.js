import {
  isYouTubeApiConfigured,
  resolveOfficialHandleToChannelId,
  resolveOfficialNameToChannelId,
} from './youtube-data-api.js';

const YOUTUBE_BASE = 'https://www.youtube.com';
const FETCH_TIMEOUT_MS = 8000;

function fetchWithTimeout(url, options = {}, ms = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

function youtubeHeaders() {
  return {
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };
}

function extractChannelIdFromHtml(html) {
  const patterns = [
    /"channelMetadataRenderer":\{[^}]*"externalId":"(UC[\w-]{22})"/,
    /"externalId":"(UC[\w-]{22})"/,
    /"responseContext":\{[\s\S]{0,1200}?"browse_id","value":"(UC[\w-]{22})"/,
    /"channelId":"(UC[\w-]{22})"/,
    /"browseId":"(UC[\w-]{22})"/,
    /"webCommandMetadata":\{"url":"\/channel\/(UC[\w-]{22})"/,
    /<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{22})"/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export async function resolveHandleToChannelId(handle) {
  const cleanHandle = handle.replace(/^@/, '').trim();
  if (!cleanHandle) throw new Error('Handle invalido');

  if (isYouTubeApiConfigured()) {
    try {
      return await resolveOfficialHandleToChannelId(cleanHandle);
    } catch (err) {
      console.warn(`[youtube-resolver] official handle lookup failed: ${err.message}`);
    }
  }

  try {
    const url = `${YOUTUBE_BASE}/@${encodeURIComponent(cleanHandle)}`;
    const res = await fetchWithTimeout(url, { headers: youtubeHeaders() });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`Canal @${cleanHandle} nao encontrado no YouTube`);
      }
      throw new Error(`YouTube respondeu com erro ${res.status}`);
    }

    const channelId = extractChannelIdFromHtml(await res.text());
    if (!channelId) {
      throw new Error(
        `Nao foi possivel extrair o channel ID para @${cleanHandle}. O layout do YouTube pode ter mudado.`
      );
    }

    return channelId;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Timeout ao conectar em youtube.com/@${cleanHandle}.`);
    }
    throw err;
  }
}

export async function resolveNameToChannelId(name) {
  const cleanName = name.trim();
  if (!cleanName) throw new Error('Nome invalido');

  if (isYouTubeApiConfigured()) {
    try {
      return await resolveOfficialNameToChannelId(cleanName);
    } catch (err) {
      console.warn(`[youtube-resolver] official search failed: ${err.message}`);
    }
  }

  try {
    const query = encodeURIComponent(cleanName);
    const url = `${YOUTUBE_BASE}/results?search_query=${query}`;
    const res = await fetchWithTimeout(url, { headers: youtubeHeaders() });

    if (!res.ok) {
      if (res.status === 429) {
        throw new Error('Muitas buscas muito rapido. Aguarde alguns segundos.');
      }
      throw new Error(`YouTube respondeu com erro ${res.status}`);
    }

    const html = await res.text();
    const channelMatch =
      html.match(/"url":"\/channel\/(UC[\w-]{22})"/) ||
      html.match(/"channelId":"(UC[\w-]{22})"/) ||
      html.match(/"browseId":"(UC[\w-]{22})"/);

    if (channelMatch) return channelMatch[1];

    throw new Error(`Nenhum canal encontrado para "${cleanName}".`);
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Timeout ao buscar "${cleanName}". Tente novamente.`);
    }
    throw err;
  }
}

export async function resolveUserInput(input) {
  const raw = input?.trim();
  if (!raw) throw new Error('Entrada vazia');

  const channelUrlMatch = raw.match(
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/channel\/(UC[\w-]{22})/i
  );
  if (channelUrlMatch) return channelUrlMatch[1];

  const handleUrlMatch = raw.match(
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/@([\w.-]+)/i
  );
  if (handleUrlMatch) return resolveHandleToChannelId(handleUrlMatch[1]);

  const legacyUrlMatch = raw.match(
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:c|user)\/([\w.-]+)/i
  );
  if (legacyUrlMatch) return resolveNameToChannelId(legacyUrlMatch[1]);

  if (/^UC[\w-]{22}$/i.test(raw)) return raw;
  if (raw.startsWith('@')) return resolveHandleToChannelId(raw.slice(1));

  return resolveNameToChannelId(raw);
}
