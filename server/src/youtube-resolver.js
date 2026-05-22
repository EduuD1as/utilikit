/**
 * youtube-resolver.js
 * Converte handles (@MrBeast), nomes e links para channel ID
 * Usa scraping básico do YouTube para extrair metadados
 */

const YOUTUBE_BASE = 'https://www.youtube.com';
const FETCH_TIMEOUT_MS = 8000;

function fetchWithTimeout(url, options = {}, ms = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

/**
 * Extrai channel ID do HTML da página
 * Procura por padrões como "channelId":"UC..." ou externalId
 */
function extractChannelIdFromHtml(html) {
  // Padrão 1: "channelId":"UC..."
  const match1 = html.match(/"channelId":"(UC[\w-]{22})"/);
  if (match1) return match1[1];

  // Padrão 2: "externalId":"UC..."
  const match2 = html.match(/"externalId":"(UC[\w-]{22})"/);
  if (match2) return match2[1];

  // Padrão 3: "browse":"(UC[\w-]{22})"
  const match3 = html.match(/"browse[^"]*":"(UC[\w-]{22})"/);
  if (match3) return match3[1];

  // Padrão 4: ytInitialData com channel info
  const match4 = html.match(/"channelMetadataRenderer"[^}]*"externalId":"(UC[\w-]{22})"/);
  if (match4) return match4[1];

  return null;
}

/**
 * Busca canal pelo handle (@MrBeast)
 * Acessa youtube.com/@MrBeast e extrai o channel ID
 */
export async function resolveHandleToChannelId(handle) {
  const cleanHandle = handle.replace(/^@/, '').trim();
  if (!cleanHandle) throw new Error('Handle inválido');

  try {
    const url = `${YOUTUBE_BASE}/@${encodeURIComponent(cleanHandle)}`;
    const res = await fetchWithTimeout(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!res.ok) {
      throw new Error(`YouTube respondeu com ${res.status}`);
    }

    const html = await res.text();
    const channelId = extractChannelIdFromHtml(html);

    if (!channelId) {
      throw new Error(`Não foi possível extrair o channel ID para @${cleanHandle}`);
    }

    return channelId;
  } catch (err) {
    throw new Error(
      `Erro ao resolver handle @${cleanHandle}: ${err.message}`
    );
  }
}

/**
 * Busca canal pelo nome (busca no YouTube)
 * Acessa youtube.com/results?search_query=name e extrai primeiro canal
 */
export async function resolveNameToChannelId(name) {
  const cleanName = name.trim();
  if (!cleanName) throw new Error('Nome inválido');

  try {
    const query = encodeURIComponent(cleanName);
    const url = `${YOUTUBE_BASE}/results?search_query=${query}`;
    
    const res = await fetchWithTimeout(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!res.ok) {
      throw new Error(`YouTube respondeu com ${res.status}`);
    }

    const html = await res.text();
    
    // Procura pelo primeiro resultado que seja um canal
    const channelMatch = html.match(/"\/channel\/(UC[\w-]{22})/);
    if (channelMatch) {
      return channelMatch[1];
    }

    // Fallback: procura por padrão de channel ID em qualquer lugar
    const idMatch = html.match(/"channelId":"(UC[\w-]{22})"/);
    if (idMatch) {
      return idMatch[1];
    }

    throw new Error(`Nenhum canal encontrado para "${cleanName}"`);
  } catch (err) {
    throw new Error(
      `Erro ao buscar canal "${cleanName}": ${err.message}`
    );
  }
}

/**
 * Parse e resolve entrada do usuário
 * Suporta: ID, handle, URL @handle, URL c/user, nome puro
 * Retorna o channel ID
 */
export async function resolveUserInput(input) {
  const raw = input?.trim();
  if (!raw) throw new Error('Entrada vazia');

  // ========== URL com ID: youtube.com/channel/UC... ==========
  const channelUrlMatch = raw.match(
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/channel\/(UC[\w-]{22})/i
  );
  if (channelUrlMatch) {
    return channelUrlMatch[1];
  }

  // ========== URL com @handle: youtube.com/@NomeCanal ==========
  const handleUrlMatch = raw.match(
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/@([\w.-]+)/i
  );
  if (handleUrlMatch) {
    return resolveHandleToChannelId(handleUrlMatch[1]);
  }

  // ========== URL legada: youtube.com/c/NomeCanal ou /user/NomeCanal ==========
  const legacyUrlMatch = raw.match(
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:c|user)\/([\w.-]+)/i
  );
  if (legacyUrlMatch) {
    // URLs legadas precisam ser resolvidas por nome
    return resolveNameToChannelId(legacyUrlMatch[1]);
  }

  // ========== ID puro: UC... ==========
  if (/^UC[\w-]{22}$/i.test(raw)) {
    return raw;
  }

  // ========== Handle com @: @MrBeast ==========
  if (raw.startsWith('@')) {
    return resolveHandleToChannelId(raw.slice(1));
  }

  // ========== Nome puro: "MrBeast" ou "mr beast" ==========
  return resolveNameToChannelId(raw);
}
