# Migração: YouTube Data API → SocialCounts API

## Resumo das mudanças

### ✅ Concluído
1. **Removido youtube.js** - Eliminada dependência de chave de API
2. **Criado socialcounts.js** - Novo módulo que combina funcionalidades de youtube.js + subscriberCount.js
3. **Atualizado index.js** - Removidas referências à YouTube API
4. **Atualizado poller.js** - Agora usa socialcounts.js
5. **Limpo .env** - Removida YOUTUBE_API_KEY
6. **Atualizado README.md** - Removida necessidade de chave API
7. **Atualizado YouTubeCounterPage.jsx** - Instruções corretas para entrada de usuário

## Benefícios

✅ **Sem limite de taxa (rate limit)** - SocialCounts é mais permissivo que YouTube Data API
✅ **Sem chave de API necessária** - Funciona como API pública
✅ **Números em tempo real** - Contadores precisos com estimativa local entre atualizações
✅ **Simplicidade** - Menos dependências, menos configuração

## Limitações

⚠️ **Entrada do usuário** - Agora requer ID do canal ou URL completa do YouTube
- Antes: "MrBeast" ou "@MrBeast" funcionava
- Agora: Precisa de `https://youtube.com/channel/UCX6OQ9DkcsbYNE6H8uQQuVA` ou apenas o ID `UCX6OQ9DkcsbYNE6H8uQQuVA`

## Como obter o ID de um canal

1. Abra o canal no YouTube
2. Na URL `youtube.com/channel/UC...` copie a parte `UC...`
3. Ou clique em "Compartilhar" e copie o link

## Testando

```bash
cd utilikit
npm run install:all
npm run dev
```

Acesse: http://localhost:5173/contador-youtube

**Exemplo de entrada válida:**
- `https://youtube.com/channel/UCX6OQ9DkcsbYNE6H8uQQuVA`
- `UCX6OQ9DkcsbYNE6H8uQQuVA`

## Arquivos deletados

- `server/src/youtube.js` - YouTube Data API v3 wrapper (obsoleto)
- `server/src/subscriberCount.js` - Agora integrado em socialcounts.js
