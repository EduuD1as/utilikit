# UtiliKit

Hub de ferramentas online — calculadoras, conversores, geradores e contadores. Interface moderna em React com backend Node.js.

## Ferramentas

| Ferramenta | Rota | Status |
|------------|------|--------|
| Página inicial | `/` | Disponível |
| Contador de inscritos YouTube | `/contador-youtube` | Disponível |
| Formatador de SQL | `/formatador-sql` | Disponível |
| Demais utilidades | — | Em breve |

## Pré-requisitos

- **Node.js** 18+
- **Git** (para versionamento)
- **Chave YouTube Data API v3** (apenas para o contador de inscritos)

## Configuração

```bash
cd c:\Users\edu-b\projects\utilikit

# Copie o exemplo e coloque sua chave da API
copy .env.example server\.env

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

## Estrutura

```
utilikit/
├── client/     # React + Vite (home + ferramentas)
├── server/     # Express + YouTube API + SSE
├── package.json
└── .env.example
```
