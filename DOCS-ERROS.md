# 🛡️ Sistema de Tratamento de Erros - UtiliKit

## 📋 Visão Geral

O UtiliKit agora possui um sistema robusto e amigável de tratamento de erros que classifica problemas técnicos e exibe mensagens claras para o usuário.

## 🎯 Erros Tratados

### 1. **SocialCounts Indisponível** ⚠️
**Quando ocorre:** API SocialCounts está fora do ar ou inacessível

```
⚠️ Serviço Temporariamente Indisponível

O SocialCounts (que fornece os números em tempo real) está 
temporariamente fora do ar.

Tente novamente em alguns segundos. Se o problema persistir, 
verifique a página: https://socialcounts.org
```

### 2. **Rate Limit** ⏳
**Quando ocorre:** Muitas requisições muito rápido (429)

```
⏳ Muitas Requisições

Você fez muitas requisições muito rápido.

Por favor, aguarde alguns segundos antes de tentar novamente.
```

### 3. **Canal Não Encontrado** 🔍
**Quando ocorre:** Nome/handle/ID não existe ou é inválido

```
🔍 Canal Não Encontrado

Não conseguimos encontrar um canal com esse nome, handle ou ID.

Verifique se o nome está correto ou tente usar a URL completa 
do YouTube (https://www.youtube.com/@nomedocanal).
```

### 4. **Timeout** ⏱️
**Quando ocorre:** Requisição demorou muito (internet lenta)

```
⏱️ Requisição Demorou Muito

A requisição ao YouTube demorou mais do que o esperado.

Verifique sua conexão com a internet e tente novamente. Se o 
problema persistir, use o ID do canal (UC...).
```

### 5. **Erro de Conexão** 🌐
**Quando ocorre:** Problema na conexão com servidor

```
🌐 Erro de Conexão

Houve um problema ao conectar com o servidor.

Verifique sua conexão com a internet e tente novamente.
```

### 6. **Erro Desconhecido** ❌
**Quando ocorre:** Erro não classificado

```
❌ Erro Desconhecido

Algo deu errado, mas não conseguimos identificar o problema.

Tente novamente. Se o erro persistir, verifique o console do 
navegador (F12) para detalhes.
```

## 🏗️ Arquitetura

```
Backend (Node.js)
    ↓
[error-messages.js]
    ├─ classifyError() - Classifica tipo de erro
    └─ getUserFriendlyMessage() - Gera mensagem amigável
    ↓
API Response (JSON com title, message, suggestion)
    ↓
Frontend (React)
    ↓
[useChannelMonitor.js]
    ├─ Processa resposta de erro
    └─ Extrai title + message + suggestion
    ↓
[YouTubeCounterPage.jsx]
    ├─ Renderiza erro com formatação
    └─ Exibe em múltiplas linhas
    ↓
Usuário vê mensagem clara e acionável
```

## 📝 Exemplo de Fluxo

### Caso 1: SocialCounts Fora do Ar

1. Usuário digita `MrBeast`
2. Backend resolve o channel ID com sucesso
3. Backend tenta buscar stats no SocialCounts
4. SocialCounts retorna erro 503
5. Backend classifica como `SOCIALCOUNTS_UNAVAILABLE`
6. Backend retorna resposta:
```json
{
  "error": "O SocialCounts está temporariamente fora do ar.",
  "title": "⚠️ Serviço Temporariamente Indisponível",
  "suggestion": "Tente novamente em alguns segundos...",
  "type": "SOCIALCOUNTS_UNAVAILABLE"
}
```
7. Frontend exibe mensagem clara ao usuário
8. Usuário pode tentar novamente facilmente

### Caso 2: Canal Não Encontrado

1. Usuário digita `xyzabc123nomesfalso`
2. Backend tenta buscar no YouTube
3. YouTube retorna 404 (não encontrado)
4. Backend classifica como `CHANNEL_NOT_FOUND`
5. Frontend exibe:
```
🔍 Canal Não Encontrado

Não conseguimos encontrar um canal com esse nome, handle ou ID.

Verifique se o nome está correto ou tente usar a URL completa 
do YouTube (https://www.youtube.com/@nomedocanal).
```

## 🔧 Implementação Técnica

### `error-messages.js`

Módulo responsável por classificação e formatação de erros:

```javascript
// Classifica o erro
const type = classifyError(error);
// Retorna: 'SOCIALCOUNTS_UNAVAILABLE', 'RATE_LIMITED', etc.

// Gera mensagem amigável
const message = getUserFriendlyMessage(type);
// Retorna: { title, message, suggestion, severity }

// Atalho completo
const formatted = formatErrorForUser(error);
// Retorna: { type, title, message, suggestion, severity, original }
```

### Backend - `index.js`

Todos os endpoints agora retornam erros formatados:

```javascript
app.post('/api/channel/lookup', async (req, res) => {
  try {
    // ... lógica
  } catch (error) {
    const formattedError = formatErrorForUser(error);
    res.status(400).json({ 
      error: formattedError.message,
      title: formattedError.title,
      suggestion: formattedError.suggestion,
      type: formattedError.type,
    });
  }
});
```

### Frontend - `useChannelMonitor.js`

Hook processa erros com detalhe:

```javascript
const data = await res.json();
if (!res.ok) {
  // Se tem title + suggestion, usa mensagem formatada
  if (data.title && data.suggestion) {
    throw new Error(`${data.title}\n${data.message}\n\n${data.suggestion}`);
  }
  throw new Error(data.error);
}
```

### Frontend - `YouTubeCounterPage.jsx`

Renderiza múltiplas linhas:

```jsx
{error && (
  <div className="alert alert--error" role="alert">
    {error.split('\n').map((line, i) => (
      <div key={i} style={{ marginBottom: line ? '0.5rem' : 0 }}>
        {line}
      </div>
    ))}
  </div>
)}
```

## 🎨 Estilos CSS

Recomendado adicionar em `home.css`:

```css
.alert {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 1.6;
}

.alert--error {
  background-color: #fee;
  border: 1px solid #fcc;
  color: #c00;
}

.alert--warning {
  background-color: #ffe;
  border: 1px solid #ffc;
  color: #880;
}

.alert div {
  word-break: break-word;
  white-space: pre-wrap;
}
```

## 📊 Tipos de Erro

| Tipo | Status | Título | Ação do Usuário |
|------|--------|--------|-----------------|
| SOCIALCOUNTS_UNAVAILABLE | 503 | ⚠️ Serviço Indisponível | Tentar novamente |
| RATE_LIMITED | 429 | ⏳ Muitas Requisições | Aguardar segundos |
| CHANNEL_NOT_FOUND | 404 | 🔍 Canal Não Encontrado | Verificar entrada |
| TIMEOUT | 408 | ⏱️ Requisição Demorou | Tentar de novo |
| NETWORK_ERROR | 0 | 🌐 Erro de Conexão | Verificar internet |
| UNKNOWN | 500 | ❌ Erro Desconhecido | Verificar console |

## 🧪 Testando

### Teste Local

1. Derrubar SocialCounts (usar proxy fake)
2. Tentar buscar canal → vê mensagem amigável
3. Buscar nome inválido → vê "Canal Não Encontrado"
4. Fazer requisições rápidas → vê "Muitas Requisições"

### Verificar no Console

```bash
# Terminal do servidor
npm run dev:server

# No console verá:
# [subscribers] UC...: SocialCounts indisponível (cooldown)
```

## 🔮 Melhorias Futuras

1. **Retry Automático**: Retentar após X segundos quando SocialCounts cai
2. **Histórico de Erros**: Log no banco de dados
3. **Status Page**: Exibir status do SocialCounts em tempo real
4. **Fallback**: Usar outra API se SocialCounts cair
5. **Notificações**: Push notification quando SocialCounts volta

═════════════════════════════════════════════════════════════
