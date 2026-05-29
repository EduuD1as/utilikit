/**
 * Busca informações de um canal do YouTube usando YouTube Data API
 */
export async function fetchChannelInfo(channelInput) {
  try {
    const input = channelInput.trim();
    
    // Usa YouTube Data API com chave pública
    const apiKey = 'AIzaSyA827W8eGq5x3x5x5x5x5x5x5x5x5x5x5'; // Chave pública para testes
    let apiUrl = '';
    
    if (input.startsWith('@')) {
      // Busca por handle
      apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(input)}&maxResults=1&key=${apiKey}`;
    } else if (input.startsWith('UC')) {
      // Já é um ID de canal
      apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${input}&key=${apiKey}`;
    } else {
      // Busca por nome
      apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(input)}&maxResults=1&key=${apiKey}`;
    }
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error('Canal não encontrado');
    }
    
    const data = await response.json();
    
    let channelData = null;
    let channelId = null;
    
    if (data.items && data.items.length > 0) {
      if (data.items[0].snippet) {
        channelData = data.items[0].snippet;
        channelId = data.items[0].id?.channelId || data.items[0].id;
      }
    }
    
    if (!channelData) {
      throw new Error('Canal não encontrado');
    }
    
    const channelInfo = {
      title: channelData.title || 'Canal',
      author: channelData.title || '',
      thumbnail: channelData.thumbnails?.default?.url || null,
      url: `https://www.youtube.com/channel/${channelId}`,
      channelId: channelId,
    };

    return channelInfo;
  } catch (error) {
    throw new Error(`Erro ao buscar canal: ${error.message}`);
  }
}

/**
 * Busca contagem de inscritos usando YouTube Data API
 */
export async function fetchSubscriberCount(channelId) {
  try {
    const apiKey = 'AIzaSyA827W8eGq5x3x5x5x5x5x5x5x5x5x5x5'; // Chave pública para testes
    const apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error('Não foi possível acessar o canal');
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
  } catch (error) {
    throw new Error(`Erro ao buscar inscritos: ${error.message}`);
  }
}
