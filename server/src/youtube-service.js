/**
 * YouTube service with fallback scraping when YOUTUBE_API_KEY is not provided.
 * Exports: fetchChannelInfo(channelInput) and fetchSubscriberCount(channelId)
 */

const YT_API_KEY = process.env.YOUTUBE_API_KEY;

function parseCountString(str) {
  if (!str) return null;
  str = String(str).trim();
  // remove common words like 'subscribers' or 'inscritos'
  str = str.replace(/(subscribers|inscritos|inscritores|seguidores)/i, '').trim();

  const m = str.match(/([\d.,]+)\s*([kmmb]|mil)?/i);
  if (!m) {
    const digits = str.replace(/[^\d]/g, '');
    if (!digits) return null;
    return parseInt(digits, 10);
  }

  let numStr = m[1];
  const suffix = (m[2] || '').toLowerCase();

  // normalize thousands/decimal separators
  numStr = numStr.replace(/\s/g, '');
  if (numStr.indexOf(',') > -1 && numStr.indexOf('.') > -1) {
    if (numStr.indexOf('.') > numStr.indexOf(',')) {
      numStr = numStr.replace(/,/g, '');
    } else {
      numStr = numStr.replace(/\./g, '').replace(/,/g, '.');
    }
  } else if (numStr.indexOf(',') > -1 && numStr.indexOf('.') === -1) {
    numStr = numStr.replace(/,/g, '');
  }

  const num = parseFloat(numStr);
  if (isNaN(num)) return null;

  let value = num;
  if (suffix === 'k') value = Math.round(num * 1e3);
  else if (suffix === 'm') value = Math.round(num * 1e6);
  else if (suffix === 'b') value = Math.round(num * 1e9);
  else if (suffix === 'mil') value = Math.round(num * 1e3);
  else value = Math.round(num);

  return value;
}

function extractChannelIdFromHtml(html) {
  if (!html) return null;
  // Try <link rel="canonical" href="https://www.youtube.com/channel/UC...">
  const mCanon = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']https?:\/\/www\.youtube\.com\/channel\/(UC[-_A-Za-z0-9]+)["'][^>]*>/i);
  if (mCanon) return mCanon[1];
  // Try og:url meta
  const mOg = html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']https?:\/\/www\.youtube\.com\/channel\/(UC[-_A-Za-z0-9]+)["'][^>]*>/i);
  if (mOg) return mOg[1];
  // Try to find "channelId":"UC..."
  const mJson = html.match(/"channelId"\s*:\s*"?(UC[-_A-Za-z0-9]+)"?/i);
  if (mJson) return mJson[1];
  // Try href="/channel/UC..."
  const mHref = html.match(/\/channel\/(UC[-_A-Za-z0-9]+)/i);
  if (mHref) return mHref[1];
  return null;
}

function extractChannelInfoFromHtml(html, channelId) {
  if (!html) return null;
  const titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) || html.match(/<title>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : null;
  const thumbMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  const thumbnail = thumbMatch ? thumbMatch[1] : null;
  const url = `https://www.youtube.com/channel/${channelId}`;
  return {
    title: title || 'Canal',
    author: title || '',
    thumbnail: thumbnail || null,
    url,
    channelId,
  };
}

export async function fetchChannelInfo(channelInput) {
  try {
    const input = channelInput.trim();
    if (!input) throw new Error('Query é obrigatória');

    // If looks like a full YouTube URL, try to extract possible channel path
    const urlMatch = input.match(/https?:\/\/(www\.)?youtube\.com\/(channel\/[A-Za-z0-9_\\-]+|@[^\/]+|c\/[^\/]+|user\/[^\/]+)/i);
    if (urlMatch) {
      const path = input.split('youtube.com/')[1];
      if (path && path.startsWith('channel/')) {
        const id = path.split('/')[1];
        // delegate to by-id fetch below
        return await fetchChannelInfoById(id);
      }
      // else treat as handle/name
    }

    // If we have an API key, use YouTube Data API
    if (YT_API_KEY) {
      let apiUrl = '';
      if (input.startsWith('@')) {
        apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(input)}&maxResults=1&key=${YT_API_KEY}`;
      } else if (input.startsWith('UC')) {
        apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${input}&key=${YT_API_KEY}`;
      } else {
        apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(input)}&maxResults=1&key=${YT_API_KEY}`;
      }
      const response = await fetch(apiUrl);
      if (!response.ok) {
        const text = await response.text();
        throw new Error('Canal não encontrado' + (text ? ` (${text})` : ''));
      }
      const data = await response.json();
      let channelData = null;
      let channelId = null;
      if (data.items && data.items.length > 0) {
        channelData = data.items[0].snippet || data.items[0];
        channelId = (data.items[0].id && data.items[0].id.channelId) || (data.items[0].id && (data.items[0].id || null)) || null;
        // If id is string
        if (!channelId && data.items[0].id && typeof data.items[0].id === 'string') {
          channelId = data.items[0].id;
        }
      }
      if (!channelData) {
        throw new Error('Canal não encontrado');
      }
      return {
        title: channelData.title || 'Canal',
        author: channelData.title || '',
        thumbnail: channelData.thumbnails?.default?.url || channelData.thumbnails?.high?.url || null,
        url: `https://www.youtube.com/channel/${channelId}`,
        channelId,
      };
    }

    // No API key -> try public YouTube pages
    // If input looks like channel id
    if (input.startsWith('UC')) {
      return await fetchChannelInfoById(input);
    }

    // Try candidate public URLs for handle/name
    const candidates = [];
    if (input.startsWith('@')) {
      const handle = input.replace(/^@/, '');
      candidates.push(`https://www.youtube.com/@${encodeURIComponent(handle)}`);
      candidates.push(`https://www.youtube.com/${encodeURIComponent(handle)}`); // fallback
    } else {
      candidates.push(`https://www.youtube.com/c/${encodeURIComponent(input)}`);
      candidates.push(`https://www.youtube.com/@${encodeURIComponent(input)}`);
      candidates.push(`https://www.youtube.com/user/${encodeURIComponent(input)}`);
    }

    for (const url of candidates) {
      try {
        const res = await fetch(url, { redirect: 'follow' });
        const text = await res.text();
        const cid = extractChannelIdFromHtml(text) || null;
        if (cid) {
          return extractChannelInfoFromHtml(text, cid);
        }
      } catch (e) {
        // ignore and try next
      }
    }

    throw new Error('Canal não encontrado');
  } catch (error) {
    throw new Error(`Erro ao buscar canal: ${error.message}`);
  }
}

async function fetchChannelInfoById(channelId) {
  try {
    const url = `https://www.youtube.com/channel/${channelId}`;
    let res = await fetch(url, { redirect: 'follow' });
    let text = await res.text();
    if (!text || text.length < 10) {
      res = await fetch(`${url}/about`, { redirect: 'follow' });
      text = await res.text();
    }
    const info = extractChannelInfoFromHtml(text, channelId);
    if (!info) throw new Error('Canal não encontrado');
    return info;
  } catch (err) {
    throw new Error(`Erro ao buscar canal: ${err.message}`);
  }
}

export async function fetchSubscriberCount(channelId) {
  try {
    if (!channelId || typeof channelId !== 'string') {
      throw new Error('channelId é obrigatório');
    }
    // If API key available, use Data API
    if (YT_API_KEY) {
      const apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${YT_API_KEY}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        const text = await response.text();
        throw new Error('Não foi possível acessar o canal' + (text ? ` (${text})` : ''));
      }
      const data = await response.json();
      if (!data.items || data.items.length === 0) {
        throw new Error('Não foi possível extrair contagem de inscritos');
      }
      const subscriberCount = data.items[0].statistics?.subscriberCount;
      if (subscriberCount === undefined) {
        throw new Error('Não foi possível extrair contagem de inscritos');
      }
      return parseInt(subscriberCount, 10);
    }

    // No API key -> try to scrape YouTube channel page
    const url = `https://www.youtube.com/channel/${channelId}`;
    let res = await fetch(url, { redirect: 'follow' });
    let text = await res.text();
    if (!text || text.length < 10) {
      res = await fetch(`${url}/about`, { redirect: 'follow' });
      text = await res.text();
    }

    // Try to find subscriberCountText in JSON embedded in page
    // Pattern 1: "subscriberCountText":{"simpleText":"1.23M subscribers"}
    let m = text.match(/"subscriberCountText"\s*:\s*\{\s*"simpleText"\s*:\s*"([^"]+)"/i);
    if (!m) {
      // Pattern 2: "subscriberCountText":{"runs":[{"text":"1.23M"}]}
      m = text.match(/"subscriberCountText"\s*:\s*\{\s*"runs"\s*:\s*\[\s*\{\s*"text"\s*:\s*"([^"]+)"/i);
    }
    let parsed = null;
    if (m && m[1]) {
      parsed = parseCountString(m[1]);
      if (parsed !== null) return parsed;
    }

    // Fallback: search for common textual patterns like "1,234 subscribers" or "1.23M subscribers"
    const fallback = text.match(/([\d\.,]+\s*(?:[kmmb]|mil)?)[\s\xa0]*?(?:subscribers|inscritos|inscritores)/i);
    if (fallback && fallback[1]) {
      parsed = parseCountString(fallback[1]);
      if (parsed !== null) return parsed;
    }

    // As last resort, look for digits near 'subscriber' label
    const digitsOnly = text.match(/(\d{2,3}(?:[.,]\d{3})+)/);
    if (digitsOnly) {
      parsed = parseCountString(digitsOnly[1]);
      if (parsed !== null) return parsed;
    }

    throw new Error('Não foi possível extrair contagem de inscritos');
  } catch (error) {
    throw new Error(`Erro ao buscar inscritos: ${error.message}`);
  }
}
