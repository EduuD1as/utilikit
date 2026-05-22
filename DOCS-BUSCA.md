📚 DOCUMENTAÇÃO - SISTEMA DE BUSCA DE CANAIS YOUTUBE
═════════════════════════════════════════════════════════════

## 📋 Visão Geral

O UtiliKit agora possui um sistema robusto de busca de canais YouTube que aceita múltiplos formatos de entrada sem requerer chave de API.

## 🎯 Formatos Suportados

| Formato | Exemplo | Tipo |
|---------|---------|------|
| Nome puro | `MrBeast` | Busca por nome |
| Handle | `@MrBeast` | Converte para ID |
| URL @handle | `https://www.youtube.com/@MrBeast` | Extrai e converte |
| ID direto | `UCX6OQ9DkcsbYNE6H8uQQuVA` | Usa direto |
| URL com ID | `https://www.youtube.com/channel/UC...` | Extrai e usa |
| URL legada | `https://youtube.com/c/MrBeast` | Busca por nome |

## 🏗️ Arquitetura

### Módulos

#### 1. `youtube-resolver.js` (novo)
Responsável por converter qualquer formato de entrada em channel ID.

**Funções:**
- `resolveUserInput(input)` - Parse e resolução automática
- `resolveHandleToChannelId(handle)` - Converte @handle para ID
- `resolveNameToChannelId(name)` - Busca por nome

**Técnica:**
- Scraping simples usando regex no HTML
- Busca por padrões: `"channelId"`, `"externalId"`, `/channel/`, etc.

#### 2. `socialcounts.js` (refatorado)
Busca dados em tempo real da SocialCounts API.

**Funções:**
- `resolveChannel(query)` - Wrapper que usa youtube-resolver
- `getChannelById(channelId)` - Busca dados do canal
- `fetchLiveSubscriberStats(channelId)` - Stats em tempo real
- `resolveLiveSubscriberStats(channelId, apiRounded)` - Com fallback local

**Features:**
- Caching com TTL de 20s
- Retry automático com backoff
- Estimativa local entre atualizações
- Velocity tracking para suavidade visual

#### 3. `poller.js`
Atualiza dados periodicamente e envia via SSE.

#### 4. `sse.js`
Server-Sent Events para atualização ao vivo no frontend.

## 🔄 Fluxo de Requisição

```
User Input (qualquer formato)
        ↓
resolveChannel(query)
        ↓
resolveUserInput(query)
        ↓
Parse Input
        ↓
├─ Se é ID direto?
│  └─ Retorna o ID
│
├─ Se é nome/handle?
│  └─ Faz scraping do YouTube
│  └─ Extrai channel ID do HTML
│  └─ Retorna o ID
│
└─ Se é URL?
   └─ Extrai handle/ID via regex
   └─ Se for handle, faz scraping
   └─ Retorna o ID
        ↓
getChannelById(channelId)
        ↓
fetchSocialCountsCached(channelId)
        ↓
SocialCounts API
        ↓
Parse Response
        ↓
buildLocalEstimate() ou returnLiveStats()
        ↓
applyLiveStats()
        ↓
Return Channel Object
        ↓
Frontend recebe dados + mostra contador
```

## 🛡️ Tratamento de Erros

### Timeout
- Scraping: 8 segundos
- SocialCounts: 8 segundos
- Retry automático até 2 vezes

### Fallbacks
1. Se SocialCounts falha, usa estimativa local
2. Se scraping falha, lança erro sugestivo
3. Cache protege contra thundering herd

## 📊 Caching

| Recurso | TTL | Backoff |
|---------|-----|---------|
| SocialCounts | 20s | 90s em falha |
| Channel Estado | Permanente | - |
| Offset Cache | Permanente | - |

## 🧪 Testes

Dois scripts de teste disponíveis:

```bash
# Teste básico (apenas SocialCounts)
node test-socialcounts.mjs

# Teste completo (resolver + socialcounts)
node test-resolver.mjs
```

## ⚠️ Limitações e Considerações

### Scraping
- YouTube pode bloquear em caso de rate limit
- Padrões regex podem quebrar com mudanças no YouTube
- Recomendado: cache de resultados em produção

### SocialCounts
- Sem SLA oficial
- Pode estar indisponível ocasionalmente
- Local estimation ativa como fallback

### Performance
- Primeira busca por nome/handle: 500-2000ms (scraping)
- Buscas subsequentes: <50ms (cache)
- SSE atualiza a cada 3 segundos (configurável)

## 🚀 Deployment

### Produção
```bash
npm run install:all
npm run build
npm run start
```

### Desenvolvimento
```bash
npm run install:all
npm run dev
```

### Variáveis de Ambiente
```env
PORT=3001
POLL_INTERVAL_MS=3000
CLIENT_ORIGIN=http://localhost:5173
```

## 📝 Exemplos de Uso

### cURL
```bash
# Busca por nome
curl -X POST http://localhost:3001/api/channel/lookup \
  -H "Content-Type: application/json" \
  -d '{"query": "MrBeast"}'

# Busca por handle
curl -X POST http://localhost:3001/api/channel/lookup \
  -H "Content-Type: application/json" \
  -d '{"query": "@MrBeast"}'
```

### Cliente
```javascript
// No frontend
const response = await fetch('/api/channel/lookup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'MrBeast' })
});
const { channel } = await response.json();
```

## 🔐 Segurança

- ✅ Sem chave de API exposta
- ✅ Rate limiting via SocialCounts
- ✅ Timeout para prevenir DoS
- ✅ Validação de entrada básica
- ⚠️ Scraping pode ser detectado como bot

## 📈 Próximos Passos

1. **Cache Persistente**: Salvar handles → IDs em banco de dados
2. **Retry Policy**: Exponential backoff mais sofisticado
3. **Monitoring**: Logs de falhas de scraping
4. **Fallback**: Integrar outra API se SocialCounts cair
5. **Performance**: Worker thread para scraping pesado

═════════════════════════════════════════════════════════════
