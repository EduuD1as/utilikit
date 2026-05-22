# UtiliKit

Hub de ferramentas online — calculadoras, conversores, geradores e contadores. Interface moderna em React com backend Node.js.

## Ferramentas

| Ferramenta | Rota | Status |
|------------|------|--------|
| Página inicial | `/` | Disponível |
| Contador de inscritos YouTube | `/contador-youtube` | Disponível |
| Formatador de SQL | `/formatador-sql` | Disponível |
| Conversor de moedas | `/conversor-moedas` | Disponível |
| Demais utilidades | — | Em breve |

## Pré-requisitos

- **Node.js** 18+
- **Git** (para versionamento)

## Configuração

```bash
cd c:\Users\edu-b\projects\utilikit

npm run install:all
npm run dev
```

- Frontend: http://localhost:5173  
- API: http://localhost:3001

## Produção

```bash
npm run install:all
npm run build
npm run start
```

Abra **http://localhost:3001** — o Express serve o React e a API.

## Privacidade (LGPD)

- Política de Privacidade: `/privacidade`
- Termos de Uso: `/termos`
- Banner de cookies com opções **Aceitar todos**, **Apenas essenciais** e **Personalizar**
- Scripts de publicidade (AdSense) só carregam após consentimento — configure `VITE_ADSENSE_CLIENT` em `client/.env` quando aprovado

Atualize o e-mail de contato em `client/src/data/legal.js`.

## Tecnologia

- **YouTube**: Dados em tempo real via [SocialCounts API](https://socialcounts.org/) com resolução de handles/nomes por scraping
- **Frontend**: React 18 + Vite + CSS moderno
- **Backend**: Node.js + Express + SSE para atualizações em tempo real

## Como usar o Contador de Inscritos

O contador aceita qualquer um dos formatos abaixo:

✅ **Nome do canal:** `MrBeast`  
✅ **Handle com @:** `@MrBeast`  
✅ **URL com handle:** `https://www.youtube.com/@MrBeast`  
✅ **ID do canal:** `UCX6OQ9DkcsbYNE6H8uQQuVA`  
✅ **URL com ID:** `https://www.youtube.com/channel/UCX6OQ9DkcsbYNE6H8uQQuVA`  

Todos os formatos funcionam igualmente bem!

## Estrutura

```
utilikit/
├── client/     # React + Vite (home + ferramentas)
├── server/     # Express + YouTube API + SSE
├── package.json
└── .env.example
```
