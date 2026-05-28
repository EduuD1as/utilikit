# UtiliKit

Hub de ferramentas online — calculadoras, conversores, geradores e contadores. React + Node.js.

## Ferramentas

| Ferramenta | Rota |
|------------|------|
| Página inicial | `/` |
| Contador de inscritos YouTube | `/contador-youtube` |
| Formatador de SQL | `/formatador-sql` |
| Formatador de JSON | `/formatador-json` |
| Conversor de documentos | `/conversor-documentos` |
| Conversor de moedas | `/conversor-moedas` |
| Conversor de unidades | `/conversor-unidades` |
| Contador de caracteres | `/contador-caracteres` |
| Calculadora simples | `/calculadora` |
| Calculadora de IMC | `/calculadora-imc` |
| Gerador de QR Code | `/gerador-qr` |
| Gerador de ID/Hash | `/gerador-id-hash` |
| Timer / Pomodoro | `/timer-pomodoro` |
| Jogo da Memória | `/jogo-memoria` |
| Roleta de Sorteador | `/roleta-sorteador` |
| Política de Privacidade | `/privacidade` |
| Termos de Uso | `/termos` |

## Configuração

```bash
cd utilikit
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

Acesse **http://localhost:3001**

## Privacidade

- Banner de cookies com opções de consentimento
- Scripts de publicidade só carregam após consentimento
- Configure `VITE_ADSENSE_CLIENT` em `client/.env` quando aprovado

## Tecnologia

- **Frontend**: React 18 + Vite + CSS
- **Backend**: Node.js + Express + SSE
- **YouTube**: Dados em tempo real via SocialCounts API

## Estrutura

```
utilikit/
├── client/  # React + Vite
├── server/  # Express + API
└── package.json
```