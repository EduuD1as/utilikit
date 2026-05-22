# Migração: YouTube Data API → SocialCounts API + Scraping

## Resumo das mudanças

### ✅ Concluído
1. **Removido youtube.js** - Eliminada dependência de chave de API
2. **Criado socialcounts.js** - Módulo que combina funcionalidades de youtube.js + subscriberCount.js
3. **Criado youtube-resolver.js** - Scraping para converter handles/nomes em channel IDs
4. **Atualizado index.js** - Removidas referências à YouTube API
5. **Atualizado poller.js** - Agora usa socialcounts.js
6. **Limpo .env** - Removida YOUTUBE_API_KEY
7. **Atualizado README.md** - Removida necessidade de chave API
8. **Atualizado YouTubeCounterPage.jsx** - Instruções corretas para entrada de usuário

## Benefícios

✅ **Sem limite de taxa (rate limit)** - SocialCounts é mais permissivo que YouTube Data API
✅ **Sem chave de API necessária** - Funciona como API pública
✅ **Números em tempo real** - Contadores precisos com estimativa local entre atualizações
✅ **Busca completa** - Funciona com nome, handle, URL ou ID
✅ **Simplicidade** - Menos dependências, menos configuração

## Como usar

O contador agora aceita:
- **Nome do canal:** `MrBeast`
- **Handle:** `@MrBeast`
- **URL com handle:** `https://www.youtube.com/@MrBeast`
- **ID do canal:** `UCX6OQ9DkcsbYNE6H8uQQuVA`
- **URL com ID:** `https://www.youtube.com/channel/UCX6OQ9DkcsbYNE6H8uQQuVA`

Todos os formatos funcionam igualmente bem!

## Como funciona

1. **Entrada do usuário** → youtube-resolver.js
2. **Resolver identifica o tipo** (nome, handle, ID, URL)
3. **Se for ID**: Pula direto para step 5
4. **Se for nome/handle/URL**: Faz scraping do YouTube para extrair channel ID
5. **socialcounts.js** busca os dados em tempo real
6. **Resultado**: Contador com números precisos ("quebrados")

## Tecnologias usadas

- **SocialCounts API**: Números em tempo real
- **Scraping simples**: Extração de channel ID das páginas do YouTube
- **Caching inteligente**: TTL de 20s para resultados do SocialCounts
- **Estimativa local**: Entre atualizações, o contador estima o crescimento

## Arquivos

- `server/src/socialcounts.js` - SocialCounts API wrapper + caching
- `server/src/youtube-resolver.js` - Resolver de handles/nomes para IDs
- `server/src/poller.js` - Polling de stats em tempo real
- `server/src/sse.js` - Server-Sent Events para atualização ao vivo
